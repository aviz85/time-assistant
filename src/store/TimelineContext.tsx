import React, { createContext, useContext, useState } from 'react';
import { Event, TimelineState } from '../types';
import { generateEventId } from '../lib/timeline-utils';

const TimelineContext = createContext<TimelineState | null>(null);

export const TimelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent = { ...event, id: generateEventId() };
    setEvents(prev => [...prev, newEvent]);
  };

  const editEvent = (id: string, updates: Partial<Omit<Event, 'id'>>) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === id ? { ...event, ...updates } : event
      )
    );
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  return (
    <TimelineContext.Provider value={{ events, addEvent, editEvent, deleteEvent }}>
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