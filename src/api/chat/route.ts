import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { functions } from '../../lib/openai-config';
import { generateEventId } from '../../lib/timeline-utils';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-0613',
    stream: true,
    messages,
    functions,
    function_call: 'auto',
  });

  const stream = OpenAIStream(response, {
    async onFunctionCall({ name, arguments: args }) {
      switch (name) {
        case 'addEvent':
          return `Added event "${args.title}" at ${args.time} for ${args.duration} minutes.`;
        
        case 'editEvent':
          return `Updated event ${args.id} successfully.`;
        
        case 'deleteEvent':
          return `Deleted event ${args.id} successfully.`;
        
        case 'getEvents':
          return 'Here are your current events...';
        
        default:
          throw new Error(`Unknown function: ${name}`);
      }
    },
  });

  return new StreamingTextResponse(stream);
}