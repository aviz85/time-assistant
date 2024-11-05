import React from 'react';
import { Bot, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

export const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
  const { text, isUser } = message;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-blue-600" />
        ) : (
          <Bot className="w-5 h-5 text-gray-600" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {text}
      </div>
    </div>
  );
};