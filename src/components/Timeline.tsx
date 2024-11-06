'use client'

import React from 'react'
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

// Add event colors
const EVENT_COLORS = [
  'bg-blue-100 border-blue-200',
  'bg-green-100 border-green-200',
  'bg-purple-100 border-purple-200',
  'bg-orange-100 border-orange-200',
  'bg-pink-100 border-pink-200',
]

export const Timeline: React.FC<TimelineProps> = ({ events = [], onDelete }) => {
  const calculateEventPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return (hours * 60 + minutes) * (100 / 1440) // (100% / minutes in a day)
  }

  const calculateEventHeight = (duration: number) => {
    return (duration / 60) * (100 / 24) // (100% / hours in a day)
  }

  // Get color based on event index
  const getEventColor = (index: number) => {
    return EVENT_COLORS[index % EVENT_COLORS.length]
  }

  return (
    <div className="w-64 h-screen bg-background border-l">
      <ScrollArea className="h-full">
        <div className="relative p-4">
          <h2 className="text-lg font-semibold mb-4">Today&apos;s Schedule</h2>
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="flex items-center h-20 border-t border-border">
                <span className="text-xs text-muted-foreground -mt-2">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
            {events.length === 0 ? (
              <p className="absolute top-1/2 left-0 right-0 text-center text-sm text-muted-foreground">
                No events scheduled
              </p>
            ) : (
              events
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((event, index) => (
                  <TooltipProvider key={event.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute left-8 right-2 rounded p-2 overflow-hidden ${getEventColor(index)}`}
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
                ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}