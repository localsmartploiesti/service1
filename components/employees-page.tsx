'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Search, User, Shield, CheckCircle, XCircle, UserCog, Loader2, Lock, Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EmployeesPageProps {
  userRole: string
}

export default function EmployeesPage({ userRole }: EmployeesPageProps) {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error('Error fetching profiles:', error)
    else setProfiles(data || [])
    setLoading(false)
  }

  const handleUpdateProfile = async (id: string, updates: any) => {
    // Optimistic update UI
    setProfiles(profiles.map(p => p.id === id ? { ...p, ...updates } : p))

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating profile:', error)
      // Revert if error (simplified)
      fetchProfiles()
    }
  }

  // Filter Logic
  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingUsers = filteredProfiles.filter(p => !p.is_active)
  const activeUsers = filteredProfiles.filter(p => p.is_active)

  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <Lock className="w-16 h-16 mb-4 opacity-20" />
        <p>Acces interzis. Doar administratorii pot gestiona echipa.</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans relative p-4 md:p-8 overflow-y-auto">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <UserCog className="w-8 h-8 text-yellow-600" />
                Gestiune Echipa
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Aprobă conturi noi și setează roluri.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            placeholder="Cauta angajat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-yellow-500 animate-spin" /></div>
      ) : (
        <div className="space-y-10">
            
            {/* PENDING USERS SECTION */}
            {pendingUsers.length > 0 && (
                <section className="animate-in slide-in-from-left duration-500">
                    <h3 className="text-yellow-500 font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <Shield className="w-4 h-4" /> În Așteptare ({pendingUsers.length})
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {pendingUsers.map(user => (
                            <UserCard 
                                key={user.id} 
                                user={user} 
                                onUpdate={handleUpdateProfile} 
                                isPending={true} 
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ACTIVE USERS SECTION */}
            <section>
                <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <CheckCircle className="w-4 h-4" /> Personal Activ ({activeUsers.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {activeUsers.map(user => (
                        <UserCard 
                            key={user.id} 
                            user={user} 
                            onUpdate={handleUpdateProfile} 
                            isPending={false} 
                        />
                    ))}
                </div>
            </section>
        </div>
      )}
    </div>
  )
}

// Sub-component for List Item
function UserCard({ user, onUpdate, isPending }: { user: any, onUpdate: Function, isPending: boolean }) {
    return (
        <div className={`
            p-4 rounded-lg border flex flex-col gap-4 transition-all
            ${isPending 
                ? 'bg-yellow-950/10 border-yellow-900/30 hover:border-yellow-700/50' 
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}
        `}>
            {/* Top Row: Info */}
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isPending ? 'bg-yellow-900 text-yellow-200' : 'bg-zinc-800 text-zinc-400'}`}>
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm sm:text-base truncate">
                        {user.full_name || 'Fără Nume'}
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1">
                        <span className="truncate">{user.email}</span>
                        <Badge variant="outline" className={`ml-2 text-[10px] h-5 px-1 uppercase shrink-0 ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/50 mt-1">
                
                {/* Email Notification Toggle (Only for Active Users) */}
                {!isPending && (
                    <button
                        onClick={() => onUpdate(user.id, { email_notification: !user.email_notification })}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors
                            ${user.email_notification 
                                ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50 hover:bg-blue-900/50' 
                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-zinc-300'}
                        `}
                        title={user.email_notification ? "Notificări Email: ACTIVE" : "Notificări Email: INACTIVE"}
                    >
                        {user.email_notification ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                        {user.email_notification ? 'Email ON' : 'Email OFF'}
                    </button>
                )}
                
                <div className="flex items-center gap-2 ml-auto">
                    {/* Role Selector */}
                    <Select 
                        defaultValue={user.role} 
                        onValueChange={(val) => onUpdate(user.id, { role: val })}
                    >
                        <SelectTrigger className="h-8 w-[100px] bg-black border-zinc-700 text-xs uppercase font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Action Button */}
                    {isPending ? (
                        <Button 
                            size="sm" 
                            onClick={() => onUpdate(user.id, { is_active: true })}
                            className="bg-green-700 hover:bg-green-600 text-white h-8 px-4 font-bold uppercase text-xs tracking-wide"
                        >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Activează
                        </Button>
                    ) : (
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onUpdate(user.id, { is_active: false })}
                            className="border-red-900 text-red-700 hover:bg-red-950 hover:text-red-500 h-8 px-4 font-bold uppercase text-xs tracking-wide"
                        >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Blochează
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

function getRoleBadgeColor(role: string) {
    switch(role) {
        case 'admin': return 'text-purple-400 border-purple-900 bg-purple-950/20'
        case 'manager': return 'text-blue-400 border-blue-900 bg-blue-950/20'
        default: return 'text-zinc-400 border-zinc-800 bg-zinc-900'
    }
}