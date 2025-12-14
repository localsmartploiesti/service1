'use client'

import React, { useState } from 'react'
import { Trash2, Edit2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface DayViewProps {
  date: Date
  events: any[]
  services: any[]
  onEditEvent?: (event: any) => void
  onDeleteEvent?: (eventId: string) => void
}

export default function DayView({ date, events, services, onEditEvent, onDeleteEvent }: DayViewProps) {
  const [selectedEventForDelete, setSelectedEventForDelete] = useState<any>(null)

  // 1. Generare sloturi timp
  const generateTimeSlots = () => {
    const slots = []
    let currentHour = 9
    let currentMinute = 0

    while (currentHour < 19) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      slots.push(timeString)
      currentMinute += 30
      if (currentMinute === 60) {
        currentMinute = 0
        currentHour++
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // FIX: Funcție pentru a găsi culoarea reală din lista de servicii (DB)
  const getServiceColor = (serviceName: string) => {
    if (!serviceName) return '#3f3f46' // Default Dark Grey (zinc-700)
    
    // Căutăm serviciul în lista primită ca prop
    const service = services.find((s) => s.name === serviceName)
    
    // Returnăm culoarea din DB sau un fallback
    return service?.color || '#ef4444' // Default Red if not found
  }

  const eventsForToday = events.filter(
    (event) =>
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
  )

  return (
    <>
      <div className="w-full bg-zinc-950 text-zinc-100 font-sans min-h-screen pb-20">
        
        {timeSlots.map((time) => {
          const eventsAtTime = eventsForToday.filter((e) => e.startTime === time)
          
          return (
            <div key={time} className="flex w-full min-h-[80px] border-b border-zinc-800">
              
              {/* ORA */}
              <div className="w-[70px] flex-shrink-0 border-r border-zinc-800 bg-black/20 flex flex-col items-center justify-start pt-3">
                <span className="text-zinc-500 text-sm font-medium font-mono">{time}</span>
              </div>

              {/* ZONA EVENIMENTE */}
              <div className="flex-1 flex flex-col gap-1 p-1 relative">
                
                {eventsAtTime.length > 0 ? (
                  eventsAtTime.map((event) => {
                    const primaryService = event.services?.[0] || ''
                    const cardColor = getServiceColor(primaryService)

                    return (
                        <div 
                        key={event.id}
                        onClick={() => onEditEvent?.(event)}
                        style={{ backgroundColor: cardColor }} 
                        className="w-full p-3 cursor-pointer group relative rounded-sm flex flex-col justify-center text-white shadow-sm hover:opacity-90 transition-opacity"
                        >
                        {/* Nume Client - Masina - Pret */}
                        <div className="flex justify-between items-start mb-1 pr-16 relative">
                            <h3 className="font-bold text-sm md:text-base leading-tight drop-shadow-md">
                                {event.clients.name} 
                                {event.carInfo ? ` - ${event.carInfo}` : ''}
                                {event.price ? ` - ${event.price} RON` : ''}
                            </h3>

                            {/* MODIFICARE: Butoane Edit/Delete vizibile pe mobil, hover pe desktop */}
                            <div className="flex gap-3 bg-black/40 backdrop-blur-md rounded-bl-lg p-1.5 absolute -top-3 -right-3 z-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                <div 
                                    onClick={(e) => { e.stopPropagation(); onEditEvent?.(event); }}
                                    className="p-1 text-zinc-200 hover:text-white transition-colors"
                                >
                                    <Edit2 size={16} />
                                </div>
                                <div 
                                    onClick={(e) => { e.stopPropagation(); setSelectedEventForDelete(event); }}
                                    className="p-1 text-red-200 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Servicii */}
                        <div className="text-xs md:text-sm font-bold uppercase leading-tight opacity-95 mb-2 drop-shadow-sm">
                            {event.services.join(', ')}
                        </div>

                        <div className="w-full border-t border-white/30 my-1"></div>

                        {/* Detalii */}
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs font-semibold uppercase tracking-wide opacity-90 line-clamp-1">
                                {event.remark || 'Fără observații'}
                            </span>
                        </div>
                        
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20 rounded-l-sm"></div>
                        </div>
                    )
                  })
                ) : (
                  // Slot Gol (fundal cu pattern)
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMTgxODE4Ii8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMyMjIiLz4KPC9zdmc+')] opacity-20 z-0">
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog open={!!selectedEventForDelete} onOpenChange={(open) => !open && setSelectedEventForDelete(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-[90vw] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Sterge eveniment?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Sunteti sigur ca doriti sa stergeti programarea pentru <span className="text-white font-bold">{selectedEventForDelete?.clients.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800 mt-0">Anuleaza</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteEvent?.(selectedEventForDelete.id)
                setSelectedEventForDelete(null)
              }}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Sterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}