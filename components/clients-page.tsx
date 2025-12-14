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
import { Plus, Edit2, Trash2, Search, User, Phone, FileText, CalendarDays, Users } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter
} from '@/components/ui/alert-dialog'

interface ClientsPageProps {
  userRole: string
}

export default function ClientsPage({ userRole }: ClientsPageProps) {
  const [clients, setClients] = useState<any[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    remark: '',
  })

  // 1. Funcție stabilă
  const fetchClients = useCallback(async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else {
        setClients(data || []);
        if (data && data.length > 0 && !selectedClient) {
            // Păstrăm selecția curentă dacă există, altfel selectăm primul
            setSelectedClient((prev: any) => prev || data[0]);
        }
    }
  }, [selectedClient]);

  // 2. Load + Realtime
  useEffect(() => {
    fetchClients();

    const channel = supabase
      .channel('clients-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        () => {
          console.log('⚡ Clients updated')
          fetchClients()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchClients]);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  const handleOpenDialog = () => {
    setFormData({ name: '', phone: '', remark: '' })
    setEditingClient(null)
    setShowDialog(true)
  }

  const handleEditClient = (e: React.MouseEvent, client: any) => {
    e.stopPropagation()
    setEditingClient(client)
    setFormData({
      name: client.name,
      phone: client.phone,
      remark: client.remark,
    })
    setShowDialog(true)
  }

  const handleDeleteClient = (e: React.MouseEvent, client: any) => {
    e.stopPropagation()
    setClientToDelete(client)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientToDelete.id);

    if (error) console.error(error);

    setClientToDelete(null);
    setShowDeleteDialog(false);

    if (selectedClient?.id === clientToDelete.id) {
      setSelectedClient(null);
    }
  };

  const handleClientClick = (client: any) => {
    setSelectedClient(client)
  }

  const handleSave = async () => {
    // Validare simplă
    if (!formData.phone.trim()) {
        alert("Te rog introdu un număr de telefon.");
        return;
    }

    // --- LOGICA DE VERIFICARE DUPLICAT ---
    // 1. Construim query-ul pentru a căuta telefonul
    let query = supabase
        .from("clients")
        .select("id")
        .eq("phone", formData.phone);

    // 2. Dacă edităm, excludem ID-ul curent (ca să nu dea eroare pe sine însuși)
    if (editingClient) {
        query = query.neq("id", editingClient.id);
    }

    const { data: existingClients, error: checkError } = await query;

    if (checkError) {
        console.error("Eroare la verificarea duplicatelor:", checkError);
        return;
    }

    // 3. Dacă am găsit rezultate, înseamnă că telefonul e luat
    if (existingClients && existingClients.length > 0) {
        alert("Acest număr de telefon există deja în baza de date!");
        return; // Oprim execuția
    }
    // --- END VERIFICARE ---

    const payload = {
      name: formData.name,
      phone: formData.phone,
      remark: formData.remark,
    };

    if (editingClient) {
      const { error } = await supabase
        .from("clients")
        .update(payload)
        .eq("id", editingClient.id);
      if (error) console.error(error);
    } else {
      const { error } = await supabase
        .from("clients")
        .insert(payload);
      if (error) console.error(error);
    }

    setShowDialog(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-zinc-100 font-sans p-2 md:p-6 overflow-hidden max-w-[100vw]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shrink-0">
        <div>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2 md:gap-3">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                Bază Clienti
            </h1>
            <p className="text-zinc-500 text-xs md:text-sm mt-1">Gestionează lista de clienți.</p>
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
            <Button 
                onClick={handleOpenDialog} 
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase tracking-wide h-9 md:h-10"
            >
                <Plus className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Client Nou</span>
            </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-hidden">
        
        {/* Clients List (Table) */}
        <div className="lg:col-span-2 bg-black/40 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="overflow-auto flex-1 w-full">
                <Table>
                    <TableHeader className="bg-zinc-900 sticky top-0 z-10">
                        <TableRow className="border-zinc-800 hover:bg-zinc-900">
                            <TableHead className="text-zinc-400 font-bold uppercase text-[10px] md:text-xs tracking-wider">Nume</TableHead>
                            <TableHead className="text-zinc-400 font-bold uppercase text-[10px] md:text-xs tracking-wider hidden sm:table-cell">Telefon</TableHead>
                            <TableHead className="text-zinc-400 font-bold uppercase text-[10px] md:text-xs tracking-wider hidden md:table-cell">Observatii</TableHead>
                            <TableHead className="text-zinc-400 font-bold uppercase text-[10px] md:text-xs tracking-wider text-right">Actiuni</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients.length > 0 ? (
                            filteredClients.map((client) => (
                                <TableRow 
                                    key={client.id}
                                    onClick={() => handleClientClick(client)}
                                    className={`
                                        cursor-pointer border-zinc-800 transition-colors
                                        ${selectedClient?.id === client.id ? 'bg-yellow-900/20 hover:bg-yellow-900/30' : 'hover:bg-zinc-900/50'}
                                    `}
                                >
                                    <TableCell className="font-bold text-white py-3 text-sm">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] md:text-xs text-zinc-400 font-bold flex-shrink-0">
                                                {client.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate max-w-[120px] sm:max-w-none">{client.name}</div>
                                                <div className="sm:hidden text-[10px] text-zinc-500">{client.phone}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-300 hidden sm:table-cell font-mono text-sm">{client.phone}</TableCell>
                                    <TableCell className="text-zinc-500 hidden md:table-cell text-xs italic truncate max-w-[200px]">{client.remark || '-'}</TableCell>
                                    <TableCell className="text-right py-3">
                                        <div className="flex justify-end gap-1">
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                onClick={(e) => handleEditClient(e, client)}
                                                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                onClick={(e) => handleDeleteClient(e, client)}
                                                className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-900/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-zinc-500 text-sm">
                                    Nu s-au găsit clienți.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>

        {/* Client Details Sidebar */}
        <div className="hidden lg:block">
            {selectedClient ? (
                <Card className="bg-black border-zinc-800 h-full p-6 sticky top-0 shadow-xl overflow-y-auto">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border-4 border-zinc-950 shadow-lg flex items-center justify-center mb-4">
                            <span className="text-3xl font-black text-yellow-600">{selectedClient.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{selectedClient.name}</h2>
                        <span className="text-xs uppercase tracking-widest text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">Client</span>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                            <div className="text-xs text-zinc-500 uppercase font-bold mb-1 flex items-center gap-2">
                                <Phone className="w-3 h-3" /> Telefon
                            </div>
                            <div className="text-white font-mono text-lg">{selectedClient.phone || 'Nespecificat'}</div>
                        </div>

                        <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                            <div className="text-xs text-zinc-500 uppercase font-bold mb-1 flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Observatii
                            </div>
                            <div className="text-zinc-300 text-sm italic leading-relaxed">
                                {selectedClient.remark || 'Nu există observații pentru acest client.'}
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                            <div className="text-xs text-zinc-500 uppercase font-bold mb-1 flex items-center gap-2">
                                <CalendarDays className="w-3 h-3" /> Data Înregistrării
                            </div>
                            <div className="text-zinc-300 text-sm">
                                {new Date(selectedClient.created_at || Date.now()).toLocaleDateString('ro-RO')}
                            </div>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 border border-zinc-800/50 border-dashed rounded-xl bg-black/20">
                    <p className="text-sm uppercase tracking-widest">Selectează un client</p>
                </div>
            )}
        </div>

      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                {editingClient ? <Edit2 className="w-5 h-5 text-yellow-600" /> : <Plus className="w-5 h-5 text-yellow-600" />}
                {editingClient ? 'Editare Client' : 'Client Nou'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Nume Complet</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Popescu Ion"
                className="bg-zinc-900 border-zinc-800 focus:border-yellow-600 text-white placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Telefon</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="07xx xxx xxx"
                className="bg-zinc-900 border-zinc-800 focus:border-yellow-600 text-white placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Observatii</Label>
              <Input
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                placeholder="Preferinte, istoric..."
                className="bg-zinc-900 border-zinc-800 focus:border-yellow-600 text-white placeholder:text-zinc-600"
              />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Ștergere Client
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Ești sigur că vrei să ștergi clientul <span className="text-white font-bold">{clientToDelete?.name}</span>? 
              Această acțiune este ireversibilă.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900">Anuleaza</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-0 font-bold uppercase tracking-wide"
            >
              Sterge Definitiv
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}