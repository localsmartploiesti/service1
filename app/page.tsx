'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import DashboardLayout from '@/components/dashboard-layout'
import CalendarView from '@/components/calendar-view'
import ServicesPage from '@/components/services-page'
import ClientsPage from '@/components/clients-page'
import EmployeesPage from '@/components/employees-page'
import WorkingHoursPage from '@/components/working-hours-page'
import LoginPage from '@/components/login-page'
import { Loader2, ShieldAlert, LogOut, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [currentPage, setCurrentPage] = useState('calendar')
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'manager' | 'staff'>('staff')
  const [isUserActive, setIsUserActive] = useState<boolean>(true) // Default TRUE pentru a nu bloca UI-ul la erori
  
  // DEBUG STATE
  const [debugLog, setDebugLog] = useState<string[]>([])

  const addLog = (msg: string) => {
    console.log(`[AuthDebug] ${msg}`)
    // Păstrăm doar ultimele 5 loguri pentru performanță
    setDebugLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()} - ${msg}`])
  }

  const loadProfile = useCallback(async (userId: string) => {
    addLog(`Start loadProfile: ${userId.slice(0, 6)}...`)
    
    try {
      // Creăm un Promise care se respinge automat după 3 secunde
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('DB Timeout')), 3000)
      )

      // Cererea efectivă către Supabase
      const dbPromise = supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', userId)
        .maybeSingle()

      // Întrecere între DB și Timeout
      const { data, error } = await Promise.race([dbPromise, timeoutPromise]) as any

      if (error) throw error

      if (data) {
        addLog(`Succes: Role=${data.role}`)
        setCurrentUserRole(data.role as any)
        // Dacă is_active e explicit false, blocăm. Altfel permitem (pentru useri vechi)
        setIsUserActive(data.is_active !== false)
      } else {
        addLog('Nu există profil. Se folosește default.')
      }

    } catch (err: any) {
      addLog(`Eroare/Timeout: ${err.message}`)
      // În caz de eroare, NU blocăm utilizatorul, îl lăsăm ca staff
      setIsUserActive(true) 
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        // Verificăm sesiunea
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          if (session) {
            setSession(session)
            await loadProfile(session.user.id)
          }
        }
      } catch (e: any) {
        addLog(`Init Fail: ${e.message}`)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession)
        if (newSession) await loadProfile(newSession.user.id)
        setIsLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
        setIsUserActive(true) // Resetăm la true pentru următorul login
        setCurrentUserRole('staff')
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      // 1. Cerem Supabase să șteargă sesiunea
      const { error } = await supabase.auth.signOut()
      if (error) console.error('Eroare la logout:', error)
    } catch (e) {
      console.error(e)
    } finally {
      // 2. Actualizăm starea locală. 
      // Asta va face React să randeze automat <LoginPage /> (vezi condiția if (!session))
      setSession(null)
      setIsUserActive(true) 
      setCurrentUserRole('staff')
      setIsLoading(false)
      
      // 3. ȘTERGE linia cu window.location.href = '/'
      // Nu forța refresh-ul paginii, lasă React să gestioneze UI-ul.
    }
  }

  // --- RENDER UI ---

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
            <Loader2 className="h-12 w-12 text-yellow-500 animate-spin mx-auto mb-4" />
            {/* MODIFICARE: Mesaj de incarcare personalizat */}
            <p className="text-neutral-400 text-sm animate-pulse uppercase tracking-widest">Se încarcă ..</p>
            <div className="text-xs text-neutral-500 font-mono mt-4 opacity-50">
                {debugLog.map((l, i) => <div key={i}>{l}</div>)}
            </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  if (!isUserActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
        <div className="w-full max-w-md bg-black border border-neutral-800 p-8 rounded-xl text-center shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Cont Dezactivat</h1>
          <p className="text-neutral-400 mb-6">Contactează un administrator </p>
          <Button onClick={handleLogout} variant="outline" className="w-full border-neutral-700">
            <LogOut className="w-4 h-4 mr-2" /> Deconectare
          </Button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'services': return <ServicesPage userRole={currentUserRole} />
      case 'clients': return <ClientsPage userRole={currentUserRole} />
      case 'employees': return <EmployeesPage userRole={currentUserRole} />
      case 'working-hours': return <WorkingHoursPage userRole={currentUserRole} />
      default: return <CalendarView userRole={currentUserRole} />
    }
  }

  return (
    <DashboardLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      currentUserRole={currentUserRole}
      onLogout={handleLogout}
      userEmail={session.user.email}
    >
      {renderContent()}
    </DashboardLayout>
  )
}