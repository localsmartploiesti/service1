'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Zap, CheckCircle } from 'lucide-react'

interface SmartOverviewPanelProps {
  events: any[]
}

export default function SmartOverviewPanel({ events }: SmartOverviewPanelProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const eventsToday = events.filter(
    (e) =>
      e.date.getTime() === today.getTime()
  ).length

  const startOfWeek = new Date(today)
  const day = today.getDay()
  startOfWeek.setDate(today.getDate() - day)

  const eventsThisWeek = events.filter((e) => {
    const eventDate = new Date(e.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= startOfWeek && eventDate < new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
  }).length

  const carsInProgress = events.filter((e) => {
    const eventDate = new Date(e.date)
    eventDate.setHours(0, 0, 0, 0)
    if (eventDate.getTime() !== today.getTime()) return false

    const [hours, minutes] = e.startTime.split(':').map(Number)
    const eventStart = new Date(today)
    eventStart.setHours(hours, minutes, 0)
    const eventEnd = new Date(eventStart)
    eventEnd.setMinutes(eventEnd.getMinutes() + e.duration)

    const now = new Date()
    return now >= eventStart && now <= eventEnd
  }).length

  // Calculate least busy days
  const days = []
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const count = events.filter(
      (e) =>
        e.date.getDate() === date.getDate() &&
        e.date.getMonth() === date.getMonth()
    ).length
    days.push({ date, count })
  }

  const leastBusyDays = days
    .sort((a, b) => a.count - b.count)
    .slice(0, 3)

  return (
    <Card className="bg-card border-border p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-lg text-foreground mb-4">Smart Overview</h3>

        {/* Key Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
            <div>
              <div className="text-2xl font-bold text-primary">{eventsToday}</div>
              <div className="text-xs text-muted-foreground">Events Today</div>
            </div>
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
            <div>
              <div className="text-2xl font-bold text-accent">{eventsThisWeek}</div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </div>
            <TrendingUp className="h-6 w-6 text-accent" />
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
            <div>
              <div className="text-2xl font-bold text-blue-400">{carsInProgress}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <Zap className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Least Busy Days */}
      <div>
        <h4 className="font-semibold text-sm text-foreground mb-3">Least Busy Days (Next 30d)</h4>
        <div className="space-y-2">
          {leastBusyDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
            >
              <div>
                <div className="text-sm font-medium text-foreground">
                  {day.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {day.count} event{day.count !== 1 ? 's' : ''}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                Book here
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
