export interface Event {
  id: string;
  title: string;
  time: string;
  duration: number;
}

export interface TimelineState {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  editEvent: (id: string, updates: Partial<Omit<Event, 'id'>>) => void;
  deleteEvent: (id: string) => void;
  refreshEvents: () => Promise<void>;
}

export interface ChatMessage {
  text: string;
  isUser: boolean;
}

// Add function call argument types
export interface FunctionCallArguments {
  title?: string;
  time?: string;
  duration?: number;
  id?: string;
}