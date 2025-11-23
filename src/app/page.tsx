'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from "@/app/components/sidebar"
import { Header } from "@/app/components/header"
import { Dashboard } from "@/app/components/dashboard"
import { AddExpenseModal } from "@/app/components/add-expense-modal"
import { LoginModal } from "@/app/components/login-modal"
import { GroupsManagement } from "@/app/components/groups-management"
import { ContactsManagement } from "@/app/components/contacts-management"
import { ProfilePage } from "@/app/components/profile-page"
import { usersService } from "@/app/services/users.service"
import type { User } from "@/app/types"

export default function Page() {
  const [user, setUser] = useState<User | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'groups' | 'contacts' | 'profile'>('dashboard')
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('splitwise_user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        // Verify user still exists in database
        if (userData.id && userData.email) {
          usersService.getUserByEmail(userData.email).then((dbUser) => {
            if (dbUser) {
              setUser(dbUser)
              localStorage.setItem('splitwise_user', JSON.stringify(dbUser))
            } else {
              // User no longer exists in database
              localStorage.removeItem('splitwise_user')
              setUser(null)
            }
            setIsLoading(false)
          }).catch(() => {
            setIsLoading(false)
          })
        } else {
          // Old format user, clear it
          localStorage.removeItem('splitwise_user')
          setIsLoading(false)
        }
      } catch {
        localStorage.removeItem('splitwise_user')
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleLogin = async (name: string, email: string) => {
    const loggedInUser = await usersService.loginOrCreateUser(name, email)
    localStorage.setItem('splitwise_user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    localStorage.removeItem('splitwise_user')
    setUser(null)
  }

  const handleUpdateUser = (name: string) => {
    if (user) {
      const updatedUser = { ...user, name }
      localStorage.setItem('splitwise_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginModal onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        baseCurrency={baseCurrency}
        onCurrencyChange={setBaseCurrency}
        isOpen={isSidebarOpen}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          user={user}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenProfile={() => setCurrentView('profile')}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' ? (
            <Dashboard baseCurrency={baseCurrency} />
          ) : currentView === 'groups' ? (
            <GroupsManagement baseCurrency={baseCurrency} />
          ) : currentView === 'contacts' ? (
            <ContactsManagement />
          ) : currentView === 'profile' ? (
            <ProfilePage user={user} onUpdateUser={handleUpdateUser} />
          ) : null}
        </main>
      </div>

      <AddExpenseModal 
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        baseCurrency={baseCurrency}
      />
    </div>
  )
}
