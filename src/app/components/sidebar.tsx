'use client'

import { Home, Users, Plus, DollarSign, CalendarPlus, Receipt, History, UserPlus } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { cn } from "@/app/lib/utils"

interface SidebarProps {
  currentView: 'dashboard' | 'activity' | 'groups' | 'history' | 'contacts'
  onViewChange: (view: 'dashboard' | 'activity' | 'groups' | 'history' | 'contacts') => void
  baseCurrency: string
  onCurrencyChange: (currency: string) => void
  onAddExpense: () => void
  onCreateActivity: () => void
  onBackToDashboard: () => void
  isOpen: boolean
}

export function Sidebar({
  currentView,
  onViewChange,
  baseCurrency,
  onCurrencyChange,
  onAddExpense,
  onCreateActivity,
  onBackToDashboard,
  isOpen
}: SidebarProps) {
  if (!isOpen) return null

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar px-4 py-6 flex flex-col gap-6">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <DollarSign className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-sidebar-foreground">SplitWise</h1>
          <p className="text-xs text-muted-foreground">Gestor de Gastos</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <Button
          variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
          className={cn(
            "justify-start gap-3",
            currentView === 'dashboard' 
              ? "bg-sidebar-accent text-sidebar-accent-foreground" 
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
          onClick={() => onViewChange('dashboard')}
        >
          <Home className="h-5 w-5" />
          Inicio
        </Button>

        <Button
          variant={currentView === 'groups' ? 'secondary' : 'ghost'}
          className={cn(
            "justify-start gap-3",
            currentView === 'groups' 
              ? "bg-sidebar-accent text-sidebar-accent-foreground" 
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
          onClick={() => onViewChange('groups')}
        >
          <Users className="h-5 w-5" />
          Grupos
        </Button>

        <Button
          variant={currentView === 'contacts' ? 'secondary' : 'ghost'}
          className={cn(
            "justify-start gap-3",
            currentView === 'contacts' 
              ? "bg-sidebar-accent text-sidebar-accent-foreground" 
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
          onClick={() => onViewChange('contacts')}
        >
          <UserPlus className="h-5 w-5" />
          Contactos
        </Button>

        <Button
          variant={currentView === 'history' ? 'secondary' : 'ghost'}
          className={cn(
            "justify-start gap-3",
            currentView === 'history' 
              ? "bg-sidebar-accent text-sidebar-accent-foreground" 
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
          onClick={() => onViewChange('history')}
        >
          <History className="h-5 w-5" />
          Historial de Actividades
        </Button>

        <Button
          variant="default"
          className="justify-start gap-3 bg-secondary text-secondary-foreground hover:bg-secondary/90 mt-2"
          onClick={onCreateActivity}
        >
          <CalendarPlus className="h-5 w-5" />
          Nueva Actividad/Salida
        </Button>
      </nav>

      <div className="mt-auto pt-6 border-t border-sidebar-border">
        <label className="text-xs font-medium text-muted-foreground mb-2 block px-2">
          Moneda Base
        </label>
        <Select value={baseCurrency} onValueChange={onCurrencyChange}>
          <SelectTrigger className="w-full bg-sidebar-accent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD - Dólar</SelectItem>
            <SelectItem value="EUR">EUR - Euro</SelectItem>
            <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
            <SelectItem value="BRL">BRL - Real</SelectItem>
            <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </aside>
  )
}
