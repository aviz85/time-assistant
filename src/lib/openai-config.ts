import { Event } from '../types';

export const systemPrompt = (events: Event[]) => {
  const currentEvents = events.map(event => 
    `${event.title} at ${event.time} for ${event.duration} minutes`
  ).join(', ');

  return `You are a helpful time management assistant. Your role is to help manage the user's schedule.
Current schedule: ${currentEvents}

You can:
1. Add new events to the timeline
2. Edit existing events
3. Delete events from the timeline

Please be concise and professional in your responses.`
};