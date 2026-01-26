import { v4 as uuidv4 } from 'uuid';
import { Entry, Profile, Preferences, AIMessage } from '@/types';
import { addToAIQueue, addAIMessageToEntry, getPendingAIRequests, markAIRequestProcessed } from './db';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

interface APIError {
  type: string;
  message: string;
}

interface APIResponse {
  id: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export const buildMentorPrompt = (
  entry: Entry,
  profile: Profile,
  preferences: Preferences,
  conversationHistory: AIMessage[] = []
): string => {
  const historyContext =
    conversationHistory.length > 0
      ? `\nPrevious conversation:\n${conversationHistory
          .map((m) => `${m.role === 'user' ? 'User' : 'Mentor'}: ${m.content}`)
          .join('\n')}\n`
      : '';

  const lengthGuidance = {
    concise: 'Keep your response brief and to the point (2-3 sentences).',
    moderate: 'Provide a balanced response with enough detail (1-2 paragraphs).',
    detailed: 'Give a thorough response with comprehensive insights (2-3 paragraphs).',
  };

  const questionGuidance = {
    high: 'Include 2-3 thought-provoking questions to encourage reflection.',
    moderate: 'Include 1-2 relevant questions if appropriate.',
    low: 'Focus primarily on insights rather than questions.',
  };

  return `You are a thoughtful mentor helping ${profile.name || 'the user'}, ${
    profile.role ? `a ${profile.role}` : 'a professional'
  }${profile.industry ? ` in ${profile.industry}` : ''}.

IMPORTANT: Always respond in Dutch.

Context about the user:
${profile.goals.length > 0 ? `- Goals: ${profile.goals.join(', ')}` : '- No specific goals set'}
${profile.values.length > 0 ? `- Values: ${profile.values.join(', ')}` : '- No specific values set'}
${profile.focusAreas.length > 0 ? `- Focus areas: ${profile.focusAreas.join(', ')}` : '- No specific focus areas'}
${profile.experience ? `- Experience: ${profile.experience}` : ''}

Communication preferences:
- Tone: ${preferences.mentorTone} (${getToneDescription(preferences.mentorTone)})
- ${lengthGuidance[preferences.responseLength]}
- ${questionGuidance[preferences.questionFrequency]}
${preferences.frameworks.length > 0 ? `- When relevant, consider these frameworks: ${preferences.frameworks.join(', ')}` : ''}

${preferences.customInstructions ? `Custom instructions:\n${preferences.customInstructions}\n` : ''}
${historyContext}
User's journal entry:
${entry.content}
${entry.mood ? `\nMood indicator: ${entry.mood}` : ''}
${entry.tags.length > 0 ? `Tags: ${entry.tags.join(', ')}` : ''}

Provide a thoughtful, contextual response that aligns with their preferences. Be authentic and genuinely helpful. Remember to respond in Dutch.`;
};

const getToneDescription = (tone: Preferences['mentorTone']): string => {
  const descriptions: Record<Preferences['mentorTone'], string> = {
    supportive: 'be encouraging and empathetic',
    challenging: 'push them to think deeper and question assumptions',
    balanced: 'balance support with constructive challenge',
    direct: 'be straightforward and get to the point',
    gentle: 'be soft and considerate in your approach',
  };
  return descriptions[tone];
};

export const callClaudeAPI = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error('Anthropic API key not configured. Please set VITE_ANTHROPIC_API_KEY in your environment.');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as { error: APIError };
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(error.error?.message || 'Failed to get AI response');
  }

  const data = (await response.json()) as APIResponse;
  return data.content[0].text;
};

export const getMentorResponse = async (
  entry: Entry,
  profile: Profile,
  preferences: Preferences,
  userMessage?: string
): Promise<AIMessage> => {
  const conversationHistory = entry.aiConversation || [];

  // If there's a user message, add it to context
  const fullHistory = userMessage
    ? [
        ...conversationHistory,
        {
          id: uuidv4(),
          role: 'user' as const,
          content: userMessage,
          timestamp: new Date(),
        },
      ]
    : conversationHistory;

  const prompt = userMessage
    ? `${buildMentorPrompt(entry, profile, preferences, conversationHistory)}\n\nUser's follow-up question: ${userMessage}`
    : buildMentorPrompt(entry, profile, preferences, fullHistory);

  const responseText = await callClaudeAPI(prompt);

  return {
    id: uuidv4(),
    role: 'assistant',
    content: responseText,
    timestamp: new Date(),
  };
};

// Queue request for offline processing
export const queueMentorRequest = async (
  entry: Entry,
  profile: Profile,
  preferences: Preferences,
  userMessage?: string
): Promise<void> => {
  const prompt = userMessage
    ? `Follow-up: ${userMessage}`
    : 'Initial mentor response';

  const context = JSON.stringify({
    entry: { id: entry.id, content: entry.content },
    profile,
    preferences,
  });

  await addToAIQueue(entry.id!, prompt, context);
};

// Process queued requests when back online
export const processAIQueue = async (): Promise<number> => {
  const pending = await getPendingAIRequests();
  let processed = 0;

  for (const item of pending) {
    try {
      const context = JSON.parse(item.context) as {
        entry: { id: string; content: string };
        profile: Profile;
        preferences: Preferences;
      };

      const entry: Entry = {
        id: context.entry.id,
        content: context.entry.content,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        aiConversation: [],
      };

      const response = await getMentorResponse(
        entry,
        context.profile,
        context.preferences,
        item.prompt.startsWith('Follow-up:') ? item.prompt.replace('Follow-up: ', '') : undefined
      );

      await addAIMessageToEntry(item.entryId, response);
      await markAIRequestProcessed(item.id!);
      processed++;
    } catch (error) {
      console.error('Failed to process AI queue item:', error);
      // Don't mark as processed so it can be retried
    }
  }

  return processed;
};

// Check if API is configured
export const isAPIConfigured = (): boolean => {
  return !!API_KEY;
};
