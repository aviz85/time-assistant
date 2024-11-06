import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { functions, systemPrompt } from '../../lib/openai-config';
import { storage } from '../../lib/storage';
import { generateEventId } from '../../lib/timeline-utils';

interface FunctionCallArgs {
  name: string;
  arguments: {
    id?: string;
    title: string;
    time: string;
    duration: number;
  };
}

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const events = await storage.loadEvents();

  // Add current timeline state to system message
  const messagesWithSystem = [
    { role: 'system', content: systemPrompt(events) },
    ...messages
  ];

  const response = await openai.createChatCompletion({
    model: 'gpt-4-0125-preview',
    stream: true,
    messages: messagesWithSystem,
    functions,
    function_call: 'auto',
  });

  const stream = OpenAIStream(response, {
    async onFunctionCall({ name, arguments: args }: FunctionCallArgs) {
      const events = await storage.loadEvents();

      switch (name) {
        case 'addEvent': {
          if (!args.title || !args.time || !args.duration) {
            throw new Error('Missing required fields for addEvent');
          }
          const newEvent: Event = {
            id: generateEventId(),
            title: args.title,
            time: args.time,
            duration: args.duration
          };
          await storage.saveEvents([...events, newEvent]);
          return `Added event "${args.title}" at ${args.time} for ${args.duration} minutes.`;
        }
        
        case 'editEvent': {
          const updatedEvents = events.map(event => 
            event.id === args.id ? { ...event, ...args } : event
          );
          await storage.saveEvents(updatedEvents);
          return `Updated event ${args.id} successfully.`;
        }
        
        case 'deleteEvent': {
          const filteredEvents = events.filter(event => event.id !== args.id);
          await storage.saveEvents(filteredEvents);
          return `Deleted event ${args.id} successfully.`;
        }
        
        default:
          throw new Error(`Unknown function: ${name}`);
      }
    },
  });

  return new StreamingTextResponse(stream);
}