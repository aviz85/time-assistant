'use client'

import React, { useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Event } from '../types'
import { formatTime } from '../lib/timeline-utils'

interface TimelineProps {
  events?: Event[]
  onDelete: (id: string) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export const Timeline: React.FC<TimelineProps> = ({ events = [], onDelete }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const getCurrentTimePosition = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return (minutes * 100) / 1440; // Convert to percentage
  };

  const scrollToCurrentTime = () => {
    if (scrollAreaRef.current) {
      const currentPosition = getCurrentTimePosition();
      const scrollPosition = (currentPosition / 100) * scrollAreaRef.current.scrollHeight;
      scrollAreaRef.current.scrollTop = scrollPosition - window.innerHeight / 3;
    }
  };

  useEffect(() => {
    scrollToCurrentTime();
    const interval = setInterval(() => {
      const timeLine = document.getElementById('current-time-line');
      if (timeLine) {
        timeLine.style.top = `${getCurrentTimePosition()}%`;
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const calculateEventPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return (hours * 60 + minutes) * (100 / 1440) // (100% / minutes in a day)
  }

  const calculateEventHeight = (duration: number) => {
    return (duration / 60) * (100 / 24) // (100% / hours in a day)
  }

  return (
    <div className="w-64 h-screen bg-background border-l">
      <ScrollArea className="h-full" ref={scrollAreaRef}>
        <div className="relative p-4">
          <h2 className="text-lg font-semibold mb-4">Today&apos;s Schedule</h2>
          <div className="relative">
            {/* Current time indicator */}
            <div
              id="current-time-line"
              className="absolute left-0 right-0 z-50 pointer-events-none"
              style={{ top: `${getCurrentTimePosition()}%` }}
            >
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="flex-1 h-[1px] bg-red-500" />
              </div>
            </div>

            {/* Hour markers */}
            {HOURS.map((hour) => (
              <div key={hour} className="flex items-center h-20 border-t border-border">
                <span className="text-xs text-muted-foreground -mt-2">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}

            {/* Events */}
            {events
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((event) => (
                <TooltipProvider key={event.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute left-8 right-2 bg-primary/10 border border-primary/20 rounded p-2 overflow-hidden"
                        style={{
                          top: `${calculateEventPosition(event.time)}%`,
                          height: `${calculateEventHeight(event.duration)}%`,
                          minHeight: '20px'
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="truncate">
                            <h3 className="font-medium text-sm">{event.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(event.time)} • {event.duration}min
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(event.id)}
                            className="h-5 w-5 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Delete event</span>
                          </Button>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(event.time)} - {formatTime(event.time)} ({event.duration} min)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}