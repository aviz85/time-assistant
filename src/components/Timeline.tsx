'use client'

import React, { useEffect, useRef, useState } from 'react'
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
const MINUTES_IN_DAY = 24 * 60
const SECONDS_IN_DAY = MINUTES_IN_DAY * 60

// Add color options
const EVENT_COLORS = [
  'bg-blue-100 border-blue-200',
  'bg-green-100 border-green-200',
  'bg-purple-100 border-purple-200',
  'bg-yellow-100 border-yellow-200',
  'bg-pink-100 border-pink-200',
  'bg-orange-100 border-orange-200',
  'bg-teal-100 border-teal-200',
  'bg-indigo-100 border-indigo-200',
]

export const Timeline: React.FC<TimelineProps> = ({ events = [], onDelete }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState<number>(0)

  const calculateExactTimePercentage = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const milliseconds = now.getMilliseconds()

    const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds
    return (totalMilliseconds * 100) / (SECONDS_IN_DAY * 1000)
  }

  useEffect(() => {
    // Initial position
    setCurrentTime(calculateExactTimePercentage())

    // Update every 100ms for smooth movement
    const interval = setInterval(() => {
      setCurrentTime(calculateExactTimePercentage())
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to current time
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollPosition = (currentTime / 100) * scrollAreaRef.current.scrollHeight
      scrollAreaRef.current.scrollTop = scrollPosition - window.innerHeight / 3
    }
  }, [Math.floor(currentTime)]) // Scroll only when percentage changes significantly

  const getEventPosition = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return ((hours * 60 + minutes) * 100) / MINUTES_IN_DAY
  }

  const getEventHeight = (duration: number): number => {
    return (duration * 100) / MINUTES_IN_DAY
  }

  // Get consistent color for each event based on its ID
  const getEventColor = (eventId: string) => {
    const colorIndex = Math.abs(hashString(eventId)) % EVENT_COLORS.length
    return EVENT_COLORS[colorIndex]
  }

  // Simple string hash function
  const hashString = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }

  return (
    <div className="w-64 h-screen bg-background border-l">
      <ScrollArea className="h-full" ref={scrollAreaRef}>
        <div className="relative p-4">
          <h2 className="text-lg font-semibold mb-4">Today&apos;s Schedule</h2>
          <div className="relative">
            {/* Time Indicator */}
            <div
              className="absolute left-0 right-0 z-50 pointer-events-none transition-[top] duration-100"
              style={{ top: `${currentTime}%` }}
            >
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="flex-1 h-[1px] bg-red-500" />
              </div>
            </div>

            {/* Hour Lines */}
            {HOURS.map((hour) => (
              <div key={hour} className="relative h-20 border-t border-border">
                <span className="absolute -top-3 left-0 text-xs text-muted-foreground">
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
                        className={`absolute left-8 right-2 border rounded p-2 overflow-hidden ${getEventColor(event.id)}`}
                        style={{
                          top: `${getEventPosition(event.time)}%`,
                          height: `${getEventHeight(event.duration)}%`,
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