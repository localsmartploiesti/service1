'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Plus, Menu, LayoutList, Calendar as CalendarIcon, CalendarCheck } from 'lucide-react' 
import MonthCalendar from '@/components/month-calendar'
import EventFormDrawer from '@/components/event-form-drawer'
import DayView from '@/components/day-view'
import EventListView from '@/components/event-list-view'
import { RealtimeChannel } from '@supabase/supabase-js'

interface CalendarViewProps {
  userRole: string
}

const toLocalISOString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function CalendarView({ userRole }: CalendarViewProps) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), today.getDate()))
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'day' | 'list'>('day')

  const channelRef = useRef<RealtimeChannel | null>(null)

  const fetchServices = useCallback(async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })
    if (data) setServices(data)
  }, [])

  const fetchClients = useCallback(async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setClients(data)
  }, [])

  const fetchEvents = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // MODIFICARE: Fetch creator info using the foreign key relationship
    const { data, error } = await supabase
      .from('events')
      .select('*, creator:profiles!created_by(full_name)')
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('events error', error)
      return
    }

    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      date: new Date(row.event_date),
      startTime: row.start_time,
      duration: row.duration,
      carInfo: row.car_info,
      price: row.price,
      remark: row.remark,
      clients: {
        name: row.client_name,
        phone: row.client_phone,
        remark: row.client_remark,
      },
      employees: row.employees || [],
      services: row.services || [],
      multiDay: row.multi_day ?? false,
      // MODIFICARE: Pass creator info and created_at to the event object
      creator: row.creator,
      created_at: row.created_at
    }))
    setEvents(mapped)
  }, [])

  useEffect(() => {
    fetchServices()
    fetchClients()
    fetchEvents()
  }, [fetchServices, fetchClients, fetchEvents])

  useEffect(() => {
    const setupRealtime = async () => {
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current)
      }

      const channel = supabase
        .channel('calendar-updates')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'events' 
          },
          (payload) => {
            console.log('⚡ Realtime update:', payload)
            fetchEvents()
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Conectat la Realtime Events')
          }
        })

      channelRef.current = channel
    }

    setupRealtime()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [fetchEvents])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDate(now)
  }

  const handleAddEvent = (date?: Date) => {
    setSelectedDate(date || new Date())
    setShowEventForm(true)
  }

  const handleSaveEvent = async (eventData: any) => {
    // Get current user ID for created_by field
    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = user?.id

    let clientData = eventData.clients
    
    if (clientData?.isNew && clientData.name) {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          phone: clientData.phone,
          remark: clientData.remark,
        })
        .select()
        .single()
      
      if (!error && data) {
        clientData = { ...data, isNew: false }
      }
    }

    const durationDays = eventData.duration || 1
    
    const sanitizedPrice = (eventData.price && eventData.price !== '') 
        ? parseInt(eventData.price, 10) 
        : null;

    const payloads = []
    let currentProcessingDate = new Date(eventData.date)
    
    currentProcessingDate.setHours(12, 0, 0, 0)

    let daysScheduled = 0
    let isFirstDay = true 

    while (daysScheduled < durationDays) {
        if (!isFirstDay && currentProcessingDate.getDay() === 0) {
            currentProcessingDate.setDate(currentProcessingDate.getDate() + 1)
            continue
        }

        payloads.push({
            event_date: toLocalISOString(currentProcessingDate),
            start_time: eventData.startTime,
            duration: durationDays,
            car_info: eventData.carInfo,
            price: sanitizedPrice, 
            remark: eventData.remark, 
            client_name: clientData?.name ?? null,
            client_phone: clientData?.phone ?? null,
            client_remark: clientData?.remark ?? null,
            employees: eventData.employees ?? [],
            services: eventData.services ?? [],
            multi_day: durationDays > 1,
            // MODIFICARE: Add created_by only for new events (handled below logic)
            // Ideally we add it here, but update shouldn't overwrite it if not needed.
            // For insert it will be added in the insert block.
            created_by: currentUserId 
        })

        currentProcessingDate.setDate(currentProcessingDate.getDate() + 1)
        daysScheduled++
        isFirstDay = false
    }

    if (editingEvent) {
      const payload = payloads[0] 
      // Remove created_by from update payload to preserve original creator
      const { created_by, ...updatePayload } = payload
      
      const { error } = await supabase
        .from('events')
        .update(updatePayload)
        .eq('id', editingEvent.id)
      if (error) console.error('update event error', error)
      setEditingEvent(null)
    } else {
      const { error } = await supabase
        .from('events')
        .insert(payloads)
      if (error) console.error('insert event error', error)
    }
    
    setShowEventForm(false)
  }

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
    if (error) console.error('delete event error', error)
  }

  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setSelectedDate(event.date)
    setShowEventForm(true)
  }

  const selectedDayNumber = selectedDate.getDate()
  const selectedDayName = selectedDate.toLocaleDateString('ro-RO', { weekday: 'short' }).toUpperCase().replace('.', '')
  const dateForDrawer = new Date(selectedDate)
  dateForDrawer.setHours(12, 0, 0, 0)

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      
      <style jsx global>{`
        .bg-carbon {
          background-color: #111;
          background-image: 
            linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a),
            linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a);
          background-size: 20px 20px;
          background-position: 0 0, 10px 10px;
        }
      `}</style>

      <div className={`flex-shrink-0 flex flex-col lg:h-full lg:w-96 bg-black border-b lg:border-r border-neutral-800 z-10 shadow-2xl transition-all duration-300 ${viewMode === 'list' ? 'h-auto' : 'h-[50vh]'}`}>
        
        <div className="flex items-center justify-between p-2 lg:p-3 bg-black border-b border-neutral-800 shrink-0 h-12 lg:h-14">
          
          <div className="flex items-center gap-2">
             <div className="flex bg-zinc-900 rounded-md p-0.5 border border-zinc-800">
                <button 
                    onClick={() => setViewMode('day')}
                    className={`p-1.5 rounded flex items-center justify-center transition-colors ${viewMode === 'day' ? 'bg-yellow-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title="Calendar"
                >
                    <CalendarIcon className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-yellow-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    title="Lista"
                >
                    <LayoutList className="w-4 h-4" />
                </button>
             </div>

            <Button 
                onClick={() => { setEditingEvent(null); handleAddEvent(selectedDate); }}
                className="hidden lg:flex bg-yellow-700 hover:bg-yellow-600 text-white font-bold text-[10px] px-3 h-8 items-center gap-2 tracking-wider"
            >
                <Plus className="h-3 w-3" />
                PROGRAMARE
            </Button>
          </div>

          {viewMode === 'day' ? (
            <div className="flex items-center gap-1 lg:gap-4 animate-in fade-in duration-300">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="text-white hover:text-yellow-500 hover:bg-neutral-900 h-8 w-8 lg:h-10 lg:w-10">
                    <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
                </Button>

                <div className="flex flex-col items-center min-w-[60px]">
                    <h3 className="text-sm lg:text-lg font-black text-yellow-500 tracking-widest uppercase leading-none">
                    {currentDate.toLocaleDateString('ro-RO', { month: 'short' }).replace('.', '')}
                    </h3>
                    <span className="text-yellow-500 font-bold text-[10px] lg:text-xs tracking-[0.3em]">
                        {currentDate.getFullYear()}
                    </span>
                </div>

                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="text-white hover:text-yellow-500 hover:bg-neutral-900 h-8 w-8 lg:h-10 lg:w-10">
                    <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
                </Button>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleToday} 
                    className="text-zinc-500 hover:text-white hover:bg-neutral-900 h-8 w-8 lg:h-10 lg:w-10 ml-1"
                    title="Azi"
                >
                    <CalendarCheck className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
            </div>
          ) : (
             <div className="text-white font-bold tracking-widest text-sm uppercase">
                 Lista Evenimente
             </div>
          )}
          
          <div className="w-8 lg:w-20"></div> 
        </div>

        {viewMode === 'day' && (
            <div className="bg-carbon flex-1 overflow-hidden flex flex-col justify-center items-center p-2 min-h-0 animate-in slide-in-from-top-5 duration-300">
            <Card className="bg-transparent border-none shadow-none text-white w-full flex justify-center">
                <div className="w-full flex justify-center">
                    <MonthCalendar
                    currentDate={currentDate}
                    events={events}
                    onDayClick={(date) => setSelectedDate(date)}
                    services={services}
                    selectedDate={selectedDate}
                    />
                </div>
            </Card>
            </div>
        )}

        <div className="flex bg-neutral-900 border-t border-neutral-800 shrink-0">
            <div className="flex flex-col justify-center items-center px-4 py-2 border-r lg:border-none border-neutral-800 bg-black min-w-[70px] lg:w-full lg:flex-row lg:gap-4 lg:py-3 lg:justify-start lg:px-6">
                {viewMode === 'day' && (
                    <>
                        <span className="text-xl lg:text-2xl font-bold text-yellow-500 leading-none">{selectedDayNumber}</span>
                        <span className="text-[10px] lg:text-sm font-bold text-white uppercase">{selectedDayName}</span>
                    </>
                )}
            </div>
            <div className="lg:hidden flex-1 flex items-center justify-center p-2 bg-neutral-900">
                <Button
                    onClick={() => {
                    setEditingEvent(null)
                    handleAddEvent(selectedDate)
                    }}
                    className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase tracking-wide text-xs px-6 h-9 rounded shadow-md transition-all w-auto"
                >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Programare
                </Button>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-neutral-900/95 relative">
         <div className="absolute inset-0 bg-carbon opacity-50 pointer-events-none"></div>
        
        <div className="flex-1 overflow-y-auto min-h-0 relative z-10">
            {viewMode === 'day' ? (
                <div className="p-2 md:p-4">
                    <DayView
                        date={selectedDate}
                        events={events}
                        services={services}
                        onEditEvent={handleEditEvent}
                        onDeleteEvent={handleDeleteEvent}
                    />
                </div>
            ) : (
                <EventListView 
                    events={events}
                    services={services}
                    onEditEvent={handleEditEvent}
                    onDeleteEvent={handleDeleteEvent}
                />
            )}
        </div>
      </div>

      <EventFormDrawer
        isOpen={showEventForm}
        onClose={() => {
          setShowEventForm(false)
          setEditingEvent(null)
        }}
        onSave={handleSaveEvent}
        selectedDate={dateForDrawer}
        userRole={userRole}
        services={services}
        editingEvent={editingEvent}
        clients={clients}
      />
    </div>
  )
}