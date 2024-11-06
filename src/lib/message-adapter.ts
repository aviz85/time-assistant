import { Message } from 'ai';
import { ChatMessage } from '../types';

export function adaptAIMessagesToChatMessages(messages: Message[]): ChatMessage[] {
  return messages.filter(msg => msg.role !== 'system').map(msg => ({
    text: msg.content,
    isUser: msg.role === 'user'
  }));
} 