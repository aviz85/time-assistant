import React from 'react';
import { Trash2 } from 'lucide-react';
import { Event } from '../types';
import { formatTime } from '../lib/timeline-utils';

interface TimelineProps {
  events: Event[];
  onDelete: (id: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ events, onDelete }) => {
  return (
    <div className="w-64 h-screen bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No events scheduled</p>
        ) : (
          events
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {formatTime(event.time)} • {event.duration}min
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(event.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};