import { Event } from '../types';

const STORAGE_KEY = 'timeline_events';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

let fs: typeof import('fs/promises');
let path: typeof import('path');
let STORAGE_FILE: string;

// Only import Node.js modules on server
if (!isBrowser) {
  fs = await import('fs/promises');
  path = await import('path');
  STORAGE_FILE = path.join(process.cwd(), 'data', 'events.json');
}

async function ensureDataDir() {
  if (!isBrowser && fs && path) {
    const dir = path.dirname(STORAGE_FILE);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

export const storage = {
  async loadEvents(): Promise<Event[]> {
    try {
      if (isBrowser) {
        try {
          const response = await fetch('/api/events');
          if (response.ok) {
            const events = await response.json();
            return events;
          }
        } catch (error) {
          return [];
        }
      } else {
        await ensureDataDir();
        try {
          const data = await fs.readFile(STORAGE_FILE, 'utf-8');
          return JSON.parse(data);
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            return [];
          }
          throw error;
        }
      }
    } catch (error) {
      return [];
    }
  },

  async saveEvents(events: Event[]): Promise<void> {
    try {
      if (isBrowser) {
        await fs.writeFile(STORAGE_FILE, JSON.stringify(events, null, 2));
      } else {
        await ensureDataDir();
        await fs.writeFile(STORAGE_FILE, JSON.stringify(events, null, 2));
      }
    } catch (error) {
      throw error;
    }
  }
}; 