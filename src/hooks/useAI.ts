import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getMentorResponse,
  queueMentorRequest,
  isAPIConfigured,
} from '@/lib/ai';
import { addAIMessageToEntry, updateEntry, getProfile, getPreferences } from '@/lib/db';
import { syncService } from '@/lib/sync';
import { Entry, Profile, Preferences, AIMessage } from '@/types';

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getResponse = useCallback(
    async (
      entry: Entry,
      profile: Profile,
      preferences: Preferences,
      userMessage?: string
    ): Promise<AIMessage | null> => {
      setIsLoading(true);
      setError(null);

      // Check if online
      if (!syncService.getOnlineStatus()) {
        // Queue for later
        await queueMentorRequest(entry, profile, preferences, userMessage);
        setIsLoading(false);
        setError('Request queued - will be processed when back online');
        return null;
      }

      // Check if API is configured
      if (!isAPIConfigured()) {
        setIsLoading(false);
        setError('API key not configured');
        return null;
      }

      try {
        // If user sent a message, add it to the conversation first
        if (userMessage && entry.id) {
          const userMsg: AIMessage = {
            id: uuidv4(),
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
          };
          await addAIMessageToEntry(entry.id, userMsg);
        }

        const response = await getMentorResponse(
          entry,
          profile,
          preferences,
          userMessage
        );

        // Save response to entry
        if (entry.id) {
          await addAIMessageToEntry(entry.id, response);
        }

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get AI response';
        setError(errorMessage);

        // Queue for retry if it's a network error
        if (
          errorMessage.includes('network') ||
          errorMessage.includes('fetch')
        ) {
          await queueMentorRequest(entry, profile, preferences, userMessage);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    getResponse,
    isLoading,
    error,
    clearError,
    isConfigured: isAPIConfigured(),
  };
};

export const useEntryMentor = (entry: Entry | undefined) => {
  const { getResponse, isLoading, error, clearError, isConfigured } = useAI();
  const [conversation, setConversation] = useState<AIMessage[]>([]);

  // Sync conversation from entry
  const syncConversation = useCallback(() => {
    if (entry?.aiConversation) {
      setConversation(entry.aiConversation);
    }
  }, [entry?.aiConversation]);

  const askMentor = useCallback(
    async (message?: string) => {
      if (!entry) return null;

      const [profile, preferences] = await Promise.all([
        getProfile(),
        getPreferences(),
      ]);

      const response = await getResponse(entry, profile, preferences, message);

      if (response) {
        setConversation((prev) => {
          // If there was a user message, add it first
          if (message) {
            return [
              ...prev,
              {
                id: uuidv4(),
                role: 'user' as const,
                content: message,
                timestamp: new Date(),
              },
              response,
            ];
          }
          return [...prev, response];
        });
      }

      return response;
    },
    [entry, getResponse]
  );

  const clearConversation = useCallback(async () => {
    if (entry?.id) {
      await updateEntry(entry.id, { aiConversation: [] });
      setConversation([]);
    }
  }, [entry?.id]);

  return {
    conversation,
    askMentor,
    clearConversation,
    syncConversation,
    isLoading,
    error,
    clearError,
    isConfigured,
  };
};
