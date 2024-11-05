import React, { useState } from 'react';
import { useTimeline } from './store/TimelineContext';
import { Timeline } from './components/Timeline';
import { ChatInterface } from './components/ChatInterface';
import { ChatMessage } from './types';

function App() {
  const { events, deleteEvent } = useTimeline();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "Hello! I'm your time management assistant. How can I help you today?", isUser: false },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    setMessages(prev => [...prev, { text, isUser: true }]);
    setIsLoading(true);
    
    // TODO: Implement API call to OpenAI
    // For now, just echo the message
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "I received your message. API integration coming soon!", 
        isUser: false 
      }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
      <Timeline events={events} onDelete={deleteEvent} />
    </div>
  );
}

export default App;