'use client'

import { ChevronLeft, ChevronRight, LogOut, UserCircle } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"

interface HeaderProps {
  user: { id: string; name: string }
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  onOpenProfile: () => void
  onLogout: () => void
}

export function Header({
  user,
  isSidebarOpen,
  onToggleSidebar,
  onOpenProfile,
  onLogout
}: HeaderProps) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="transition-transform hover:scale-105"
      >
        {isSidebarOpen ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
        <span className="sr-only">
          {isSidebarOpen ? 'Ocultar' : 'Mostrar'} barra lateral
        </span>
      </Button>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 h-auto py-2 px-3 hover:bg-accent">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">ID: {user.id.slice(-8)}</p>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenProfile} className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
