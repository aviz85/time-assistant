import React, { useState } from 'react';
import { useTimeline } from './store/TimelineContext';
import { Timeline } from './components/Timeline';
import { ChatInterface } from './components/ChatInterface';
import { systemPrompt } from './lib/openai-config';
import { useChat } from 'ai/react';
import { adaptAIMessagesToChatMessages } from './lib/message-adapter';

function App() {
  const { events, deleteEvent } = useTimeline();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { messages, append } = useChat({
    api: '/api/chat',
    initialMessages: [
      { role: 'system', content: systemPrompt(events) },
      { role: 'assistant', content: "Hello! I'm your time management assistant. How can I help you today?" }
    ],
    onResponse: () => {
      setIsLoading(false);
      setError(null);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setError('Failed to connect to server. Please try again.');
      setIsLoading(false);
    }
  });

  const handleSendMessage = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await append({ role: 'user', content: text });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Is the server running?');
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1">
        <ChatInterface
          messages={adaptAIMessagesToChatMessages(messages)}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
      <Timeline events={events} onDelete={deleteEvent} />
    </div>
  );
}

export default App;