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

  // Calculăm prima zi a lunii ajustată pentru Luni ca start (Luni=0 ... Duminica=6)
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return day === 0 ? 6 : day - 1
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []

  // Adăugăm celulele goale de la începutul lunii
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Adăugăm zilele efective
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

  // --- MODIFICARE AICI: Logică identică cu dayview.tsx ---
  const getServiceColor = (event: any) => {
    // Luăm primul serviciu din lista evenimentului
    const serviceName = event.services?.[0];
    
    // Dacă nu există serviciu, returnăm gri închis (ca în DayView)
    if (!serviceName) return '#3f3f46'; 

    // Căutăm serviciul în lista de servicii
    const service = services.find((s) => s.name === serviceName);
    
    // Returnăm culoarea serviciului sau Roșu ca fallback (ca în DayView)
    return service?.color || '#ef4444';
  }
  // -----------------------------------------------------

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
      {/* Header Zile */}
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

      {/* Grid Zile */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1">
        {days.map((date, index) => {
          const isCurrentMonth = date !== null
          const dayEvents = date ? getEventsForDay(date) : []
          const isToday =
            date &&
            date.toDateString() === new Date().toDateString()
          const isSelected = date && isDateSelected(date)
          
          const isWeekend = (index % 7 === 5) || (index % 7 === 6)

          return (
            <div
              key={index}
              onClick={() => date && onDayClick(date)}
              className={`relative flex flex-col items-center justify-center rounded-md border md:border-2 h-10 md:h-12 cursor-pointer transition-all ${
                // Logică fundal:
                isCurrentMonth
                  ? isWeekend 
                      ? 'bg-white/5 hover:bg-white/10 border-zinc-800' // Weekend activ (palid)
                      : 'bg-secondary/30 hover:bg-secondary/50' // Zi săptămână activă
                  : isWeekend
                      ? 'bg-white/5 border-transparent' // Weekend padding
                      : 'bg-transparent text-muted-foreground/30 border-transparent' // Zi săptămână padding
              } ${isToday ? 'ring-1 md:ring-2 ring-primary' : ''} ${
                isSelected ? 'border-primary bg-primary/10' : isCurrentMonth && !isWeekend ? 'border-border' : ''
              }`}
            >
              {date && (
                <>
                  <div className={`text-sm md:text-xs font-bold leading-none ${isToday ? 'text-primary' : isSelected ? 'text-primary font-extrabold' : isWeekend ? 'text-neutral-400' : 'text-neutral-300'}`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="flex gap-0.5 mt-0.5 md:mt-1">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <div
                        key={event.id}
                        className="w-1.5 h-1.5 md:w-1.5 md:h-1.5 rounded-full"
                        style={{ backgroundColor: getServiceColor(event) }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                        <div className="w-1.5 h-1.5 md:w-1.5 md:h-1.5 rounded-full bg-gray-500" />
                    )}
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