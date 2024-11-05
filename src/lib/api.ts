import { Event } from '../types';

export async function sendMessage(messages: { content: string; role: 'user' | 'assistant' | 'system' }[]) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.body;
}

export async function handleEventAction(action: string, event: Partial<Event>) {
  const response = await fetch(`/api/events/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(`Failed to ${action} event`);
  }

  return response.json();
}