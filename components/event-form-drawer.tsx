'use client'

import React, { useState, useEffect } from 'react'
import { X, User, Calendar, Clock, Car, Layers, Search, Plus, Check, FileText, Banknote, Phone, Edit2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EventFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void> | void
  selectedDate: Date
  userRole: string
  services: any[]
  editingEvent?: any
  clients: any[]
}

export default function EventFormDrawer({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  userRole,
  services,
  editingEvent,
  clients
}: EventFormDrawerProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('create')

  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isNewClientMode, setIsNewClientMode] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')

  const [date, setDate] = useState(selectedDate)
  const [time, setTime] = useState('09:00')
  const [durationDays, setDurationDays] = useState<number | string>(1)
  const [carInfo, setCarInfo] = useState('')
  const [price, setPrice] = useState('') // Se păstrează ca string în UI pentru ușurința editării
  const [remark, setRemark] = useState('') 
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(false)
      
      if (editingEvent) {
        setMode('view')
        
        const editDate = new Date(editingEvent.date)
        editDate.setHours(12, 0, 0, 0)
        setDate(editDate)
        
        setTime(editingEvent.startTime || '09:00')
        setDurationDays(editingEvent.duration || 1)
        setCarInfo(editingEvent.carInfo || '')
        // Convertim în string pentru afișare în input
        setPrice(editingEvent.price ? String(editingEvent.price) : '') 
        setRemark(editingEvent.remark || '') 
        setSelectedServices(editingEvent.services || [])
        
        if (editingEvent.clients) {
            setSelectedClient(editingEvent.clients)
            setClientSearch(editingEvent.clients.name)
        }
      } else {
        setMode('create')
        
        const initDate = new Date(selectedDate)
        initDate.setHours(12, 0, 0, 0)
        setDate(initDate)
        
        setTime('09:00')
        setDurationDays(1)
        setCarInfo('')
        setPrice('') 
        setRemark('') 
        setSelectedServices([])
        setClientSearch('')
        setSelectedClient(null)
        setIsNewClientMode(false)
        setNewClientName('')
        setNewClientPhone('')
      }
    }
  }, [isOpen, editingEvent, selectedDate])

  if (!isOpen) return null

  const filteredClients = clients.filter(c => {
    const searchLower = clientSearch.toLowerCase()
    const nameMatch = c.name.toLowerCase().includes(searchLower)
    const phoneMatch = c.phone && c.phone.includes(searchLower)
    return nameMatch || phoneMatch
  })

  const handleSave = async () => {
    let finalClient = selectedClient

    if (isNewClientMode) {
      if (!newClientName.trim() || !newClientPhone.trim()) {
        alert("Te rog completează numele și telefonul clientului nou.");
        return;
      }
      const existingClient = clients.find(c => c.phone === newClientPhone.trim());
      if (existingClient) {
        alert(`Clientul "${existingClient.name}" există deja cu acest număr de telefon!`);
        return;
      }
      finalClient = {
        name: newClientName,
        phone: newClientPhone,
        isNew: true
      }
    }

    const finalDuration = Number(durationDays) || 1

    setIsLoading(true)

    try {
        await onSave({
            date,
            startTime: time,
            duration: finalDuration, 
            multiDay: finalDuration > 1,
            carInfo,
            price, // Trimitem string-ul validat (doar cifre), conversia finală se face în părinte
            remark, 
            clients: finalClient,
            services: selectedServices
        })
    } catch (error) {
        console.error("Eroare la salvare:", error)
        setIsLoading(false)
    }
  }

  const toggleService = (serviceName: string) => {
    if (selectedServices.includes(serviceName)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceName))
    } else {
      setSelectedServices([...selectedServices, serviceName])
    }
  }

  if (mode === 'view') {
    const clientName = editingEvent?.clients?.name || 'Client Necunoscut'
    const clientPhone = editingEvent?.clients?.phone || ''
    
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md h-full bg-[#111] text-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 border-l border-neutral-800">
            
            <style jsx>{`
            .bg-texture {
                background-color: #0a0a0a;
                background-image: 
                linear-gradient(45deg, #151515 25%, transparent 25%, transparent 75%, #151515 75%, #151515),
                linear-gradient(45deg, #151515 25%, transparent 25%, transparent 75%, #151515 75%, #151515);
                background-size: 20px 20px;
                background-position: 0 0, 10px 10px;
            }
            `}</style>

            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-black z-10">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-neutral-800 rounded hover:bg-neutral-700 transition-colors">
                    <X className="w-5 h-5 text-neutral-400" />
                </button>
                <h2 className="text-yellow-500 font-black text-lg tracking-widest uppercase">Detalii Programare</h2>
                <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto bg-texture p-6 space-y-8">
                
                <div className="bg-neutral-900/50 p-5 rounded-xl border border-neutral-800">
                    <div className="flex items-center gap-2 text-neutral-500 text-xs uppercase font-bold tracking-wider mb-3">
                        <User className="w-4 h-4" /> Client
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{clientName}</div>
                    {clientPhone && (
                        <a href={`tel:${clientPhone}`} className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-mono text-lg font-bold mt-2 bg-yellow-900/20 w-fit px-3 py-1.5 rounded-lg border border-yellow-700/30 transition-all hover:bg-yellow-900/40">
                            <Phone className="w-4 h-4" />
                            {clientPhone}
                        </a>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-2 text-neutral-500 text-xs uppercase font-bold tracking-wider mb-2">
                            <Car className="w-4 h-4" /> Masina
                        </div>
                        <div className="text-lg font-bold text-white">{carInfo || '-'}</div>
                    </div>
                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-2 text-neutral-500 text-xs uppercase font-bold tracking-wider mb-2">
                            <Banknote className="w-4 h-4" /> Pret
                        </div>
                        <div className="text-lg font-mono font-bold text-green-400">{price ? `${price} RON` : '-'}</div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-neutral-500 text-xs uppercase font-bold tracking-wider mb-3">
                        <Layers className="w-4 h-4" /> Servicii Selectate
                    </div>
                    <div className="space-y-2">
                        {selectedServices.length > 0 ? selectedServices.map((serviceName, idx) => {
                            const serviceObj = services.find(s => s.name === serviceName);
                            const color = serviceObj?.color || '#eab308';
                            return (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-black border border-neutral-800 rounded-lg">
                                    <div className="w-3 h-3 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
                                    <span className="text-sm font-bold text-white uppercase">{serviceName}</span>
                                </div>
                            )
                        }) : (
                            <p className="text-neutral-600 italic text-sm">Niciun serviciu selectat.</p>
                        )}
                    </div>
                </div>

                {remark && (
                    <div className="bg-neutral-900/30 p-4 rounded-xl border border-neutral-800/50">
                        <div className="flex items-center gap-2 text-neutral-500 text-xs uppercase font-bold tracking-wider mb-2">
                            <FileText className="w-4 h-4" /> Observatii
                        </div>
                        <p className="text-neutral-300 text-sm italic leading-relaxed">"{remark}"</p>
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-800 pt-4">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {date.toLocaleDateString('ro-RO')}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {time} ({durationDays} zile)
                    </div>
                </div>
            </div>

            <div className="p-4 bg-black border-t border-neutral-800 z-10 flex gap-3">
                <Button 
                    onClick={() => setMode('edit')}
                    className="flex-1 py-6 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wide"
                >
                    <Edit2 className="w-4 h-4 mr-2" /> Editeaza
                </Button>
                <Button 
                    onClick={onClose}
                    className="flex-1 py-6 bg-yellow-600 hover:bg-yellow-500 text-black font-black uppercase tracking-widest"
                >
                    Inchide
                </Button>
            </div>
        </div>
      </div>
    )
  }

  // --- RENDER CREATE/EDIT MODE ---
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-[#111] text-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 border-l border-neutral-800">
        
        <style jsx>{`
          .bg-texture {
            background-color: #0a0a0a;
            background-image: 
              linear-gradient(45deg, #151515 25%, transparent 25%, transparent 75%, #151515 75%, #151515),
              linear-gradient(45deg, #151515 25%, transparent 25%, transparent 75%, #151515 75%, #151515);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
          }
        `}</style>

        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-black z-10">
          {mode === 'edit' ? (
              <button onClick={() => setMode('view')} className="w-10 h-10 flex items-center justify-center bg-neutral-800 rounded hover:bg-neutral-700 transition-colors text-yellow-500">
                  <ArrowLeft className="w-5 h-5" />
              </button>
          ) : (
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-neutral-800 rounded hover:bg-neutral-700 transition-colors">
                  <X className="w-5 h-5 text-neutral-400" />
              </button>
          )}
          
          <h2 className="text-yellow-500 font-black text-lg tracking-widest uppercase">
            {mode === 'edit' ? 'MODIFICARE' : 'PROGRAMARE NOUA'}
          </h2>
          <div className="w-10" /> 
        </div>

        <div className="flex-1 overflow-y-auto bg-texture p-6 space-y-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-neutral-400 text-sm uppercase font-bold tracking-wider">
              <User className="w-4 h-4" />
              <span>Adauga <span className="text-yellow-500">CLIENT</span></span>
            </div>

            {!isNewClientMode ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input 
                    type="text"
                    placeholder="Cauta client (nume sau telefon)..."
                    value={clientSearch}
                    onChange={(e) => {
                        setClientSearch(e.target.value)
                        setSelectedClient(null) 
                    }}
                    className="w-full bg-neutral-800/50 border border-neutral-700 rounded p-3 pl-10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                  
                  {clientSearch && !selectedClient && filteredClients.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-neutral-900 border border-neutral-700 mt-1 rounded z-20 max-h-48 overflow-auto shadow-xl">
                          {filteredClients.map(client => (
                              <div 
                                key={client.id} 
                                className="p-3 hover:bg-neutral-800 cursor-pointer border-b border-neutral-800 last:border-0 transition-colors"
                                onClick={() => {
                                    setSelectedClient(client)
                                    setClientSearch(client.name)
                                }}
                              >
                                  <div className="font-bold text-white text-sm">{client.name}</div>
                                  {client.phone && (
                                    <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                                        <span className="opacity-50">📞</span> {client.phone}
                                    </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  )}
                </div>
                
                <button 
                  onClick={() => setIsNewClientMode(true)}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded flex items-center justify-center gap-2 uppercase text-sm transition-colors"
                >
                  <User className="w-4 h-4 fill-current" />
                  Client Nou
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-neutral-900/50 p-4 rounded border border-neutral-800 animate-in fade-in slide-in-from-top-2">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-yellow-500 font-bold flex items-center gap-1">
                        <Plus className="w-3 h-3" /> CLIENT NOU
                    </span>
                    <button onClick={() => setIsNewClientMode(false)} className="text-xs text-neutral-400 hover:text-white underline">Anuleaza</button>
                 </div>
                 <input 
                    type="text"
                    placeholder="Nume Complet"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-3 text-white focus:border-yellow-500 outline-none placeholder:text-zinc-600"
                  />
                  <input 
                    type="tel"
                    placeholder="Numar Telefon"
                    value={newClientPhone}
                    onChange={e => setNewClientPhone(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-3 text-white focus:border-yellow-500 outline-none placeholder:text-zinc-600"
                  />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-neutral-400 text-sm uppercase font-bold tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Selecteaza <span className="text-yellow-500">DATA SI ORA</span></span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <input 
                    type="date"
                    value={date.toISOString().split('T')[0]}
                    onChange={(e) => {
                        const newDate = new Date(e.target.value);
                        newDate.setHours(12, 0, 0, 0);
                        setDate(newDate);
                    }}
                    className="w-full bg-neutral-800/50 border border-neutral-700 rounded p-3 text-white focus:border-yellow-500 outline-none appearance-none"
                />
                <input 
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-neutral-800/50 border border-neutral-700 rounded p-3 text-white focus:border-yellow-500 outline-none appearance-none"
                />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-neutral-400 text-sm uppercase font-bold tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Introdu <span className="text-yellow-500">DURATA</span> (zile)</span>
            </div>
            <input 
              type="number"
              min="1"
              value={durationDays}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') setDurationDays('');
                else setDurationDays(parseInt(val));
              }}
              className="w-full bg-neutral-800/50 border border-neutral-700 rounded p-3 text-white text-center font-bold text-lg focus:border-yellow-500 outline-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-neutral-400 text-sm uppercase font-bold tracking-wider">
              <Car className="w-4 h-4" />
              <span>Adauga <span className="text-yellow-500">MASINA</span></span>
            </div>
            <input 
              type="text"
              placeholder="Ex: Audi A4"
              value={carInfo}
              onChange={(e) => setCarInfo(e.target.value)}
              className="w-full bg-neutral-800/50 border border-neutral-700 rounded p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-neutral-400 text-sm uppercase font-bold tracking-wider">
              <Banknote className="w-4 h-4" />
              <span>Introdu <span className="text-yellow-500">PRET</span></span>
            </div>
            {/* INPUT PREȚ MODIFICAT */}
            <input 
              type="text" // Folosim text pentru control granular
              inputMode="numeric" // Afișează tastatura numerică pe mobil
              pattern="[0-9]*" // Sugestie pentru browsere că e număr
              placeholder="Ex: 500"
              value={price}
              onChange={(e) => {
                const val = e.target.value;
                // Regex: Verifică dacă stringul este gol SAU conține DOAR cifre
                if (val === '' || /^\d+$/.test(val)) {
                    setPrice(val);
                }
              }}
              className="w-full bg-neutral-800/50 border border-neutral-700 rounded p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500 transition-colors font-mono font-bold"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-neutral-400 text-sm uppercase font-bold tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Adauga <span className="text-yellow-500">OBSERVATII</span></span>
            </div>
            <textarea 
              placeholder="Detalii suplimentare, cerințe speciale..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full bg-neutral-800/50 border border-neutral-700 rounded p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500 transition-colors min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-3 pb-8">
            <div className="flex items-center gap-2 text-neutral-400 text-sm uppercase font-bold tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Adauga <span className="text-yellow-500">SERVICII</span></span>
            </div>
            <div className="space-y-2">
              {services.map((service) => {
                const isSelected = selectedServices.includes(service.name)
                const serviceColor = service.color || '#eab308'
                
                return (
                  <div 
                    key={service.id}
                    onClick={() => toggleService(service.name)}
                    className={cn(
                        "flex items-center gap-4 p-4 rounded cursor-pointer border transition-all duration-200",
                        isSelected 
                            ? "bg-black" 
                            : "bg-black border-neutral-800 hover:border-neutral-700"
                    )}
                    style={isSelected ? { 
                        borderColor: serviceColor, 
                        boxShadow: `0 0 10px ${serviceColor}33`
                    } : {}}
                  >
                    <div 
                        className={cn(
                            "w-6 h-6 rounded border-2 flex items-center justify-center transition-colors",
                            !isSelected && "border-neutral-600"
                        )}
                        style={isSelected ? { 
                            backgroundColor: serviceColor, 
                            borderColor: serviceColor 
                        } : {}}
                    >
                        {isSelected && <Check className="w-4 h-4 text-black stroke-[3]" />}
                    </div>
                    <span className={cn(
                        "font-bold uppercase tracking-wide text-sm",
                        isSelected ? "text-white" : "text-neutral-400"
                    )}>
                        {service.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        <div className="p-4 bg-black border-t border-neutral-800 z-10">
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-6 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-lg rounded-none shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all"
          >
            {isLoading ? 'Se salveaza...' : 'Salveaza Programare'}
          </Button>
        </div>

      </div>
    </div>
  )
}