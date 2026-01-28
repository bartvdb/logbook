import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Lightbulb, User, Send } from 'lucide-react';
import { Entry, AIMessage } from '@/types';
import { formatRelative } from '@/utils/date';
import { useEntryMentor } from '@/hooks';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MentorChatProps {
  entry: Entry;
}

export const MentorChat: React.FC<MentorChatProps> = ({ entry }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    conversation,
    askMentor,
    clearConversation,
    syncConversation,
    isLoading,
    error,
    clearError,
    isConfigured,
  } = useEntryMentor(entry);

  // Sync conversation when entry changes
  useEffect(() => {
    syncConversation();
  }, [entry.aiConversation, syncConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await askMentor(message);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleGetInitialResponse = async () => {
    await askMentor();
  };

  if (!isConfigured) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              API Key Required
            </h3>
            <p className="text-muted-foreground text-sm">
              To use the AI mentor, please configure your Anthropic API key in the environment variables.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px] max-h-[60vh]">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">AI Mentor</h3>
            <p className="text-xs text-muted-foreground">
              Get insights on your entry
            </p>
          </div>
        </div>
        {conversation.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearConversation}>
            Clear chat
          </Button>
        )}
      </CardHeader>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversation.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Get thoughtful feedback on your entry from your AI mentor.
              </p>
              <Button onClick={handleGetInitialResponse}>
                Get feedback
              </Button>
            </div>
          )}

          {conversation.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0" />
              <div className="flex-1 bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p>{error}</p>
                <button
                  onClick={clearError}
                  className="text-xs underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow-up question..."
            rows={1}
            className="flex-1 min-h-[40px] resize-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};

interface MessageBubbleProps {
  message: AIMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
          isUser
            ? 'bg-secondary'
            : 'bg-primary'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-secondary-foreground" />
        ) : (
          <Lightbulb className="w-4 h-4 text-primary-foreground" />
        )}
      </div>
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block rounded-lg p-3 max-w-[85%] ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelative(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default MentorChat;
