import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event, TimelineState } from '../types';
import { generateEventId } from '../lib/timeline-utils';
import { storage } from '../lib/storage';

const TimelineContext = createContext<TimelineState | null>(null);

interface TimelineProviderProps {
  children: React.ReactNode;
}

export const TimelineProvider: React.FC<TimelineProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);

  const refreshEvents = async () => {
    try {
      const newEvents = await storage.loadEvents();
      setEvents(newEvents || []);
    } catch (error) {
      setEvents([]);
    }
  };

  useEffect(() => {
    refreshEvents();
    const interval = setInterval(refreshEvents, 2000);
    return () => clearInterval(interval);
  }, []);

  const addEvent = (event: Omit<Event, 'id'>) => {
    if (!isValidTime(event.time) || event.duration <= 0) {
      throw new Error('Invalid event time or duration');
    }
    const newEvent = { ...event, id: generateEventId() };
    setEvents((prev: Event[]) => [...prev, newEvent]);
  };

  const editEvent = (id: string, updates: Partial<Omit<Event, 'id'>>) => {
    setEvents((prev: Event[]) =>
      prev.map((event: Event) =>
        event.id === id ? { ...event, ...updates } : event
      )
    );
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const updateEventTime = async (id: string, newTime: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ time: newTime }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event time');
      }

      setEvents(prev => 
        prev.map(event => 
          event.id === id ? { ...event, time: newTime } : event
        )
      );
    } catch (error) {
      console.error('Failed to update event time:', error);
    }
  };

  return (
    <TimelineContext.Provider value={{ 
      events, 
      addEvent, 
      editEvent, 
      deleteEvent, 
      updateEventTime,
      refreshEvents 
    }}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};

const isValidTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};