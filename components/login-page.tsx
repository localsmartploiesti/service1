'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Mail, Loader2, AlertCircle, User, CheckCircle2, Key } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { BUSINESS_NAME_PART_1, BUSINESS_NAME_PART_2, APP_VERSION } from '../lib/version'

export default function LoginPage() {
  // State pentru a comuta între Login și Sign Up
  const [isSignUp, setIsSignUp] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('') // Doar pentru Sign Up
  const [secretWord, setSecretWord] = useState('') // Doar pentru Sign Up (Cod Admin)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (isSignUp) {
        // --- LOGICA DE ÎNREGISTRARE (SIGN UP) ---
        
        // 1. Validare locală: Utilizatorul a introdus ceva?
        if (!secretWord) {
            throw new Error('Te rog introdu Codul Secret oferit de administrator.')
        }

        // 2. SECURITATE: Verificăm codul folosind funcția RPC din baza de date
        // Aceasta returnează doar true/false, fără să expună codul real în browser.
        const { data: isValid, error: rpcError } = await supabase
            .rpc('check_signup_code', { input_code: secretWord.trim() })

        if (rpcError) {
            console.error('Eroare RPC:', rpcError)
            throw new Error('Eroare de sistem: Nu pot verifica codul secret.')
        }

        // 3. Dacă funcția returnează false, blocăm înregistrarea
        if (!isValid) {
            throw new Error('Codul Secret este incorect! Nu ai permisiunea de a crea cont.')
        }

        // 4. Codul este corect, procedăm la crearea contului
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName, // Trimitem numele pentru a fi salvat în profil
            },
          },
        })

        if (error) throw error

        // Verificăm dacă este necesară confirmarea pe email
        if (data.user && !data.session) {
          setSuccessMessage('Cont creat cu succes! Te rugăm să verifici email-ul pentru confirmare.')
        } else {
          setSuccessMessage('Cont creat! Te poți autentifica acum.')
          setIsSignUp(false) // Trecem înapoi la login automat
          setSecretWord('') // Curățăm codul secret
        }

      } else {
        // --- LOGICA DE AUTENTIFICARE (LOGIN) ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        // Redirecționarea este gestionată automat de listener-ul din page.tsx
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la autentificare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white font-sans relative overflow-hidden">
      
      {/* Background Texture */}
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
      <div className="absolute inset-0 bg-carbon opacity-100 z-0"></div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-black border border-neutral-800 p-8 rounded-xl shadow-2xl z-10 relative animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-600/20 text-yellow-500 mb-4 border border-yellow-600/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-widest uppercase text-white">
            {BUSINESS_NAME_PART_1}<span className="text-yellow-500">{BUSINESS_NAME_PART_2}</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-2 font-medium tracking-wide uppercase">
            {isSignUp ? 'Creare Cont Nou' : 'Autentificare Sistem'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-900 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-950/50 border-green-900 text-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Succes</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Câmpuri specifice pentru Sign Up */}
          {isSignUp && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                
              {/* Câmpul COD SECRET */}
              <div className="space-y-2">
                <Label htmlFor="secretword" className="text-xs uppercase font-bold text-yellow-600 tracking-wider flex items-center gap-1">
                   <Key className="w-3 h-3" /> Cod Secret (Admin)
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                  <input 
                    id="secretword"
                    type="text" // Folosim type text ca să se vadă ce scrii, sau password dacă vrei ascuns
                    required
                    placeholder="Introdu codul de acces..."
                    value={secretWord}
                    onChange={(e) => setSecretWord(e.target.value)}
                    className="w-full bg-neutral-900 border border-yellow-900/30 rounded-md py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Câmp Nume Complet */}
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Nume Complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input 
                    id="fullname"
                    type="text"
                    required
                    placeholder="Ex: Ion Popescu"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-md py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email - Vizibil mereu */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                id="email"
                type="email"
                required
                placeholder="Ex: admin@garage.ro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-md py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Parola - Vizibil mereu */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Parola</Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-md py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black uppercase tracking-widest h-12 rounded-md shadow-lg hover:shadow-yellow-900/20 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesare...
              </>
            ) : (
              isSignUp ? 'Creează Cont' : 'Conectare'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-neutral-900">
          <p className="text-xs text-neutral-500 mb-2">
            {isSignUp ? 'Ai deja un cont?' : 'Nu ai cont?'}
          </p>
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
              setSuccessMessage(null)
              setSecretWord('') // Resetăm codul la schimbare
            }}
            className="text-sm font-bold text-yellow-500 hover:text-yellow-400 uppercase tracking-wider hover:underline transition-all"
          >
            {isSignUp ? 'Mergi la Autentificare' : 'Înregistrează-te Aici'}
          </button>
        </div>
      </div>
      
      {/* Versiune discretă jos */}
      <div className="absolute bottom-4 text-[10px] text-slate-400 opacity-50">
          v{APP_VERSION}
      </div>
    </div>
  )
}