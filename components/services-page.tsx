'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from "@/lib/supabaseClient";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Edit, Trash2, Search, Wrench, Clock, CheckCircle2, XCircle } from 'lucide-react'

interface ServicesPageProps {
  userRole: string
}

export default function ServicesPage({ userRole }: ServicesPageProps) {
  const [services, setServices] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    color: '#FF4444',
    active: true,
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const canManageServices = userRole === 'admin' || userRole === 'manager'

  // 1. Funcție stabilă pentru reîncărcare date
  const fetchServices = useCallback(async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error("Error loading services:", error);
    else setServices(data || []);
  }, []);

  // 2. Initial Load + Realtime
  useEffect(() => {
    fetchServices();

    // Abonament Realtime
    const channel = supabase
      .channel('services-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        () => {
          console.log('⚡ Services updated')
          fetchServices()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchServices]);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenDialog = (service?: any) => {
    if (service) {
      setFormData(service)
      setEditingId(service.id)
    } else {
      setFormData({ name: '', duration: '', color: '#FF4444', active: true })
      setEditingId(null)
    }
    setShowDialog(true)
  }

  const handleSave = async () => {
    const payload = {
      name: formData.name,
      duration: Number(formData.duration),
      color: formData.color,
      active: formData.active,
    };

    if (editingId) {
      const { error } = await supabase
        .from("services")
        .update(payload)
        .eq("id", editingId);

      if (error) console.error("Update error:", error);
    } else {
      const { error } = await supabase.from("services").insert(payload);

      if (error) console.error("Insert error:", error);
    }

    setShowDialog(false);
    // fetchServices() este apelat automat de Realtime, dar putem lăsa pentru feedback instant
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Ești sigur că vrei să ștergi acest serviciu?")) return;

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) console.error("Delete error:", error);
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-zinc-100 font-sans p-2 md:p-6 overflow-hidden max-w-[100vw]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shrink-0">
        <div>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2 md:gap-3">
                <Wrench className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                Catalog Servicii
            </h1>
            <p className="text-zinc-500 text-xs md:text-sm mt-1">Configurează serviciile.</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text"
                    placeholder="Cauta..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:border-yellow-500 focus:outline-none transition-all"
                />
            </div>
            {canManageServices && (
                <Button 
                    onClick={() => handleOpenDialog()}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase tracking-wide h-9 md:h-10"
                >
                    <Plus className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Adauga</span>
                </Button>
            )}
        </div>
      </div>

      {/* Services List Card */}
      <div className="flex-1 bg-black/40 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 w-full">
          <Table>
            <TableHeader className="bg-zinc-900 sticky top-0 z-10">
              <TableRow className="border-zinc-800 hover:bg-zinc-900">
                <TableHead className="text-zinc-400 font-bold uppercase text-[10px] md:text-xs tracking-wider w-[60px] md:w-[80px]">Culoare</TableHead>
                <TableHead className="text-zinc-400 font-bold uppercase text-[10px] md:text-xs tracking-wider">Denumire</TableHead>
                <TableHead className="text-zinc-400 font-bold uppercase text-[10px] md:text-xs tracking-wider hidden sm:table-cell">Durata</TableHead>
                <TableHead className="text-zinc-400 font-bold uppercase text-[10px] md:text-xs tracking-wider">Status</TableHead>
                {canManageServices && <TableHead className="text-zinc-400 font-bold uppercase text-[10px] md:text-xs tracking-wider text-right">Actiuni</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                  <TableCell className="py-3">
                    <div
                      className="w-6 h-6 md:w-8 md:h-8 rounded-md border-2 border-zinc-700 shadow-sm"
                      style={{ backgroundColor: service.color, boxShadow: `0 0 10px ${service.color}33` }}
                    />
                  </TableCell>
                  <TableCell className="font-bold text-white text-sm py-3">
                      {service.name}
                      <div className="sm:hidden text-zinc-500 text-xs flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {service.duration} min
                      </div>
                  </TableCell>
                  <TableCell className="text-zinc-300 hidden sm:table-cell font-mono text-sm py-3">
                      {service.duration} min
                  </TableCell>
                  <TableCell className="py-3">
                    {service.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-green-900/30 text-green-400 border border-green-900">
                            <CheckCircle2 className="w-3 h-3" /> <span className="hidden md:inline">Activ</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-zinc-800 text-zinc-500 border border-zinc-700">
                            <XCircle className="w-3 h-3" /> <span className="hidden md:inline">Inactiv</span>
                        </span>
                    )}
                  </TableCell>
                  {canManageServices && (
                    <TableCell className="text-right py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(service)}
                          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(service.id)}
                          className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredServices.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-zinc-500 text-sm">
                          Nu s-au găsit servicii.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Service Form Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                {editingId ? <Edit className="w-5 h-5 text-yellow-600" /> : <Plus className="w-5 h-5 text-yellow-600" />}
                {editingId ? 'Editare Serviciu' : 'Serviciu Nou'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Nume Serviciu</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex. Schimb Ulei"
                className="bg-zinc-900 border-zinc-800 focus:border-yellow-600 text-white placeholder:text-zinc-600"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Culoare</Label>
                    <div className="flex gap-3 items-center h-10">
                        <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="h-10 w-full rounded cursor-pointer bg-transparent border-0 p-0"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Durata (min)</Label>
                    <Input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="30"
                        className="bg-zinc-900 border-zinc-800 focus:border-yellow-600 text-white placeholder:text-zinc-600 text-center font-mono"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded border border-zinc-800">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked as boolean })}
                className="border-zinc-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
              />
              <label htmlFor="active" className="text-sm text-white font-medium cursor-pointer flex-1">
                Serviciu Activ (Disponibil în calendar)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-900">
              Anuleaza
            </Button>
            <Button onClick={handleSave} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase tracking-wide">
              Salveaza
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}