'use client'

import React, { useState } from 'react'
import { Search, Calendar, Clock, User, Phone, Car, FileText, Edit2, Trash2 } from 'lucide-react'
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

interface EventListViewProps {
  events: any[]
  services: any[]
  onEditEvent: (event: any) => void
  onDeleteEvent: (eventId: string) => void
}

export default function EventListView({ events, services, onEditEvent, onDeleteEvent }: EventListViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEventForDelete, setSelectedEventForDelete] = useState<any>(null)

  // Helper pentru culoare serviciu
  const getServiceColor = (serviceName: string) => {
    if (!serviceName) return '#3f3f46'
    const service = services.find((s) => s.name === serviceName)
    return service?.color || '#ef4444'
  }

  // Filtrare evenimente după nume sau telefon
  const filteredEvents = events.filter(event => {
    const term = searchTerm.toLowerCase()
    const nameMatch = event.clients?.name?.toLowerCase().includes(term)
    const phoneMatch = event.clients?.phone?.toLowerCase().includes(term)
    return nameMatch || phoneMatch
  })

  // Formatare dată prietenoasă
  const formatDate = (dateObj: Date) => {
    return dateObj.toLocaleDateString('ro-RO', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).toUpperCase()
  }

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans relative">
      
      {/* Bara de Căutare - Sticky Top */}
      <div className="p-4 border-b border-zinc-800 bg-black/80 backdrop-blur-md sticky top-0 z-20">
        <div className="relative max-w-md mx-auto md:mx-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            placeholder="Cauta dupa nume sau telefon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 focus:outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Lista Evenimente */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const primaryService = event.services?.[0] || ''
            const cardColor = getServiceColor(primaryService)

            return (
              <div 
                key={event.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden relative group hover:border-zinc-700 transition-all shadow-lg flex flex-col md:flex-row"
              >
                {/* Banda colorată laterală */}
                <div 
                    className="w-2 md:w-3 h-full absolute left-0 top-0 bottom-0 md:relative md:h-auto" 
                    style={{ backgroundColor: cardColor }}
                />

                <div className="flex-1 p-4 pl-6 md:pl-4 flex flex-col gap-3">
                  {/* Header Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm tracking-widest uppercase">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-full w-fit">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-white font-mono font-bold text-sm">{event.startTime}</span>
                        <span className="text-zinc-500 text-xs ml-1">({Math.ceil(event.duration / (24*60))} zile)</span>
                    </div>
                  </div>

                  {/* Detalii Principale */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-zinc-400 text-xs uppercase font-bold">
                            <User className="w-3 h-3" /> Client
                        </div>
                        <div className="text-lg font-bold text-white">{event.clients.name}</div>
                        <div className="text-sm text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {event.clients.phone || '-'}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1 text-zinc-400 text-xs uppercase font-bold">
                            <Car className="w-3 h-3" /> Masina
                        </div>
                        <div className="text-base font-semibold text-zinc-200">{event.carInfo || 'Nespecificat'}</div>
                    </div>
                  </div>

                  {/* Servicii & Observații */}
                  <div className="mt-2 pt-3 border-t border-zinc-800 grid md:grid-cols-2 gap-4">
                     <div>
                        <span className="text-xs text-zinc-500 uppercase font-bold block mb-1">Servicii</span>
                        <div className="flex flex-wrap gap-2">
                            {event.services.map((s: string, idx: number) => (
                                <span 
                                    key={idx} 
                                    className="text-xs font-bold px-2 py-1 rounded bg-zinc-800 text-white border border-zinc-700"
                                    style={idx === 0 ? { borderColor: cardColor, color: cardColor } : {}}
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                     </div>
                     
                     {(event.remark || event.clients.remark) && (
                         <div>
                            <div className="flex items-center gap-1 text-xs text-zinc-500 uppercase font-bold mb-1">
                                <FileText className="w-3 h-3" /> Observatii
                            </div>
                            <p className="text-sm text-zinc-300 italic line-clamp-2">
                                {event.remark || event.clients.remark}
                            </p>
                         </div>
                     )}
                  </div>
                </div>

                {/* Actiuni */}
                <div className="flex md:flex-col border-t md:border-t-0 md:border-l border-zinc-800 divide-x md:divide-x-0 md:divide-y divide-zinc-800 bg-black/20">
                    <button 
                        onClick={() => onEditEvent(event)}
                        className="flex-1 md:flex-none p-4 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                        title="Editeaza"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setSelectedEventForDelete(event)}
                        className="flex-1 md:flex-none p-4 hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors flex items-center justify-center"
                        title="Sterge"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p>Niciun eveniment găsit.</p>
          </div>
        )}
      </div>

      {/* Alert Dialog pentru Ștergere (Refolosit) */}
      <AlertDialog open={!!selectedEventForDelete} onOpenChange={(open) => !open && setSelectedEventForDelete(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Sterge eveniment?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Sunteti sigur ca doriti sa stergeti programarea pentru <span className="text-white font-bold">{selectedEventForDelete?.clients.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800">Anuleaza</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteEvent(selectedEventForDelete.id)
                setSelectedEventForDelete(null)
              }}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Sterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}