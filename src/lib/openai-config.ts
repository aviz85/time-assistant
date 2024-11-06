import { Event } from '../types';

export const systemPrompt = (events: Event[] = []) => {
  const currentEvents = events?.map(event => 
    `${event.title} at ${event.time} for ${event.duration} minutes`
  ).join(', ') || 'No events scheduled';

  return `You are a helpful time management assistant. Your role is to help manage the user's schedule.
Current schedule: ${currentEvents}

You can:
1. Add new events to the timeline
2. Edit existing events
3. Delete events from the timeline

Please be concise and professional in your responses.`
};

export const functions = [
  {
    name: 'addEvent',
    description: 'Add a new event to the timeline',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the event' },
        time: { type: 'string', description: 'Time of event in HH:mm format' },
        duration: { type: 'number', description: 'Duration in minutes' }
      },
      required: ['title', 'time', 'duration']
    }
  },
  {
    name: 'editEvent',
    description: 'Edit an existing event',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID of event to edit' },
        title: { type: 'string', description: 'New title of the event' },
        time: { type: 'string', description: 'New time in HH:mm format' },
        duration: { type: 'number', description: 'New duration in minutes' }
      },
      required: ['id']
    }
  },
  {
    name: 'deleteEvent',
    description: 'Delete an event from the timeline',
    parameters: {
      type: 'object', 
      properties: {
        id: { type: 'string', description: 'ID of event to delete' }
      },
      required: ['id']
    }
  }
];