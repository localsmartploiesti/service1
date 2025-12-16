'use client'

import React from 'react'

interface MonthCalendarProps {
  currentDate: Date
  events: any[]
  onDayClick: (date: Date) => void
  services?: any[]
  selectedDate?: Date
}

export default function MonthCalendar({
  currentDate,
  events,
  onDayClick,
  services = [],
  selectedDate,
}: MonthCalendarProps) {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return day === 0 ? 6 : day - 1
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
  }

  const weekDays = ['L', 'M', 'MI', 'J', 'V', 'S', 'D']

  const getEventsForDay = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    )
  }

  const getServiceColor = (event: any) => {
    const serviceName = event.services?.[0];
    if (!serviceName) return '#3f3f46'; 
    const service = services.find((s) => s.name === serviceName);
    return service?.color || '#ef4444';
  }

  const isDateSelected = (date: Date) => {
    return (
      selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  return (
    <div className="space-y-1 md:space-y-2 w-full mx-auto">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1">
        {weekDays.map((day, index) => {
           const isWeekendHeader = index >= 5
           return (
            <div
              key={day}
              className={`text-center font-semibold text-[10px] md:text-xs py-0.5 md:py-1 ${
                isWeekendHeader ? 'text-red-400/70' : 'text-muted-foreground'
              }`}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1">
        {days.map((date, index) => {
          const isCurrentMonth = date !== null
          const dayEvents = date ? getEventsForDay(date) : []
          const isToday =
            date &&
            date.toDateString() === new Date().toDateString()
          const isSelected = date && isDateSelected(date)
          
          const isWeekend = (index % 7 === 5) || (index % 7 === 6)

          let bgClass = 'bg-transparent'
          let borderClass = 'border-transparent'
          let textClass = 'text-muted-foreground/30'

          if (isCurrentMonth) {
              if (isSelected) {
                  if (isToday) {
                      bgClass = 'bg-yellow-500/20' 
                      borderClass = 'border-yellow-500'
                  } else {
                      bgClass = 'bg-primary/20' 
                      borderClass = 'border-primary'
                  }
              } else {
                  if (isWeekend) {
                      bgClass = 'bg-white/5 hover:bg-white/10'
                      borderClass = 'border-zinc-800'
                  } else {
                      bgClass = 'bg-secondary/30 hover:bg-secondary/50'
                      borderClass = 'border-border'
                  }
              }
              textClass = '' 
          } else if (isWeekend) {
              bgClass = 'bg-white/5'
          }

          const ringClass = isToday ? 'ring-1 md:ring-2 ring-yellow-500' : ''

          return (
            <div
              key={index}
              onClick={() => date && onDayClick(date)}
              className={`relative flex flex-col items-center justify-center rounded-md border md:border-2 h-10 md:h-12 cursor-pointer transition-all 
                ${bgClass} ${borderClass} ${ringClass} ${textClass}`}
            >
              {date && (
                <>
                  <div className={`text-sm md:text-xs font-bold leading-none 
                    ${isToday ? 'text-yellow-500' : isSelected ? 'text-white font-extrabold' : isWeekend ? 'text-neutral-400' : 'text-neutral-300'}`}>
                    {date.getDate()}
                  </div>
                  
                  {/* MODIFICARE: Afișăm TOATE punctele, fără limită */}
                  <div className="flex gap-0.5 mt-0.5 md:mt-1 flex-wrap justify-center px-0.5 content-start w-full">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        // Am micșorat puțin punctele pe mobil ca să încapă mai multe
                        className="w-1.5 h-1.5 md:w-1.5 md:h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: getServiceColor(event) }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}