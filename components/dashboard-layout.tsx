'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Wrench, Users, UserCog, Clock, Settings, LogOut, Menu, X, LayoutDashboard } from 'lucide-react'
import {BUSINESS_NAME_FULL,BUSINESS_NAME_PART_1,BUSINESS_NAME_PART_2,APP_VERSION} from '../lib/version'
interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
  currentUserRole: string
  onRoleChange?: (role: 'admin' | 'manager' | 'staff') => void 
  onLogout: () => void
  userEmail?: string 
}

export default function DashboardLayout({
  children,
  currentPage,
  onPageChange,
  currentUserRole,
  onRoleChange,
  onLogout,
  userEmail, 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleNavClick = (page: string) => {
    onPageChange(page)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const menuItems = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'services', label: 'Servicii', icon: Wrench },
    { id: 'clients', label: 'Clienți', icon: Users },
    { id: 'employees', label: 'Angajați', icon: UserCog },
  //  { id: 'working-hours', label: 'Orare & Sărbători', icon: Clock },
  ]

  return (
    <div className="flex h-screen bg-neutral-950 text-white font-sans overflow-hidden">
      
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

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 w-72 bg-black border-r border-neutral-800 transition-transform duration-300 flex flex-col z-50 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 shadow-2xl`}
      >
        {/* Header Sidebar */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-600 rounded flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
                {/* MODIFICARE: Nume Sidebar */}
                <h1 className="text-lg font-black text-white tracking-widest uppercase leading-none">{BUSINESS_NAME_PART_1} {BUSINESS_NAME_PART_2}</h1>
                <p className="text-[10px] font-bold text-yellow-500 tracking-[0.2em] uppercase">{currentUserRole}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-md transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'text-yellow-500 bg-neutral-900 border border-neutral-800'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50 border border-transparent'
                }`}
              >
                {/* Indicator activ stanga */}
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 shadow-[0_0_10px_#eab308]"></div>
                )}

                <Icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-yellow-500' : 'text-neutral-500 group-hover:text-white'}`} />
                <span className="text-sm font-bold tracking-wide uppercase">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/30 space-y-4">
          
          <div className="flex items-center gap-3 p-3 bg-black border border-neutral-800 rounded-md">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-xs font-bold text-white truncate" title={userEmail}>
                    {userEmail || 'Utilizator'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                    <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">
                        {currentUserRole}
                    </p>
                </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-950/30 justify-start uppercase text-xs font-bold tracking-wider"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Deconectare
          </Button>
          {/* VERSIUNE APLICATIE */}
          <div className="text-center pt-2 border-t border-slate-200/50">
             <p className="text-[10px] text-slate-400 font-mono">v{APP_VERSION}</p>
          </div>

        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative bg-carbon">
        
        {/* Top Navigation Bar */}
        <div className="bg-black/80 backdrop-blur-md border-b border-neutral-800 px-4 md:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-30 h-16 shrink-0">
          <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-white hover:bg-neutral-800"
            >
                <Menu className="h-6 w-6" />
            </Button>

            {/* MODIFICARE: Nume Header Mobil */}
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-widest truncate">
                {menuItems.find((item) => item.id === currentPage)?.label || BUSINESS_NAME_FULL}
            </h2>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Data Curenta</span>
                <span className="text-sm font-bold text-yellow-500 font-mono">
                    {new Date().toLocaleDateString('ro-RO', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    }).toUpperCase()}
                </span>
             </div>
             <div className="h-8 w-[1px] bg-neutral-800 hidden md:block"></div>
             <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center border border-neutral-700">
                <Settings className="w-4 h-4 text-neutral-400" />
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative w-full h-full">
            {children}
        </div>
      </div>
    </div>
  )
}