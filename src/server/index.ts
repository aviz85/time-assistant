import express from 'express';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai-edge';
import { functions, systemPrompt } from '../lib/openai-config.js';
import { storage } from '../lib/storage.js';
import * as dotenv from 'dotenv';
import { Readable } from 'stream';
import { marked } from 'marked';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const REQUEST_TIMEOUT = 30000;

app.use((req, res, next) => {
  res.setTimeout(REQUEST_TIMEOUT, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

app.post('/api/chat', async (req, res) => {
  console.log('=== START REQUEST ===');
  
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    const events = await storage.loadEvents();
    const messagesWithSystem = [
      { role: 'system', content: systemPrompt(events) },
      ...messages
    ];

    const response = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      stream: false,
      messages: messagesWithSystem,
      functions,
      function_call: 'auto',
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', responseData);
      return res.status(500).json({ error: 'OpenAI API error', details: responseData });
    }

    // Handle function calls if present
    if (responseData.choices[0]?.message?.function_call) {
      const result = await handleFunctionCall(responseData.choices[0].message.function_call);
      return res.send(result);
    }

    // Return just the content as plain text
    const message = responseData.choices[0].message;
    return res.send(message.content);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function generateEventId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Add this helper function
async function handleFunctionCall(functionCall: any) {
  try {
    // Check if we're getting partial function call data
    if (functionCall.arguments && typeof functionCall.arguments === 'string') {
      functionCall.arguments = JSON.parse(functionCall.arguments);
    }

    const { name, arguments: args } = functionCall;
    console.log('Function call:', name, 'with args:', args); // Debug log

    switch (name) {
      case 'addEvent': {
        const newEvent = {
          id: generateEventId(),
          title: args.title,
          time: args.time,
          duration: args.duration
        };
        
        console.log('Creating new event:', newEvent); // Debug log
        const events = await storage.loadEvents();
        console.log('Current events:', events); // Debug log
        await storage.saveEvents([...events, newEvent]);
        console.log('Events after save:', await storage.loadEvents()); // Debug log
        
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
  } catch (error) {
    // Return user-friendly error message instead of throwing
    return `Sorry, I couldn't create the event: ${error.message}`;
  }
}

// Add error handler middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('=== UNHANDLED ERROR ===');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('=== END UNHANDLED ERROR ===');
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Add uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('=== UNCAUGHT EXCEPTION ===');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('=== END UNCAUGHT EXCEPTION ===');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('=== UNHANDLED REJECTION ===');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  console.error('=== END UNHANDLED REJECTION ===');
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await storage.loadEvents();
    res.json(events || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load events' });
  }
});

// Add this endpoint
app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const events = await storage.loadEvents();
    const filteredEvents = events.filter(event => event.id !== id);
    await storage.saveEvents(filteredEvents);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

app.patch('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { time } = req.body;
    
    const events = await storage.loadEvents();
    const updatedEvents = events.map(event => 
      event.id === id ? { ...event, time } : event
    );
    
    await storage.saveEvents(updatedEvents);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});