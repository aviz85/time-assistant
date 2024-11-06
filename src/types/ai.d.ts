declare module 'ai' {
  export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export interface ChatRequest {
    messages: Message[];
    functions?: any[];
    function_call?: 'auto' | 'none' | { name: string };
  }

  export function OpenAIStream(
    response: Response,
    options?: {
      onFunctionCall?: (args: { name: string; arguments: any }) => Promise<string>;
    }
  ): ReadableStream;

  export class StreamingTextResponse extends Response {
    constructor(stream: ReadableStream);
  }
}

declare module 'ai/react' {
  import { Message } from 'ai';
  
  export function useChat(options: {
    api: string;
    initialMessages?: Message[];
    onResponse?: () => void;
  }): {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    append: (message: { role: 'user' | 'assistant' | 'system'; content: string }) => Promise<void>;
  };
}

declare module 'openai-edge' {
  export class Configuration {
    constructor(config: { apiKey: string | undefined });
  }

  export class OpenAIApi {
    constructor(config: Configuration);
    createChatCompletion(options: any): Promise<Response>;
  }
} 