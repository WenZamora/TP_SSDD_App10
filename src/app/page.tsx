'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from "@/app/components/sidebar"
import { Header } from "@/app/components/header"
import { Dashboard } from "@/app/components/dashboard"
import { LoginModal } from "@/app/components/login-modal"
import { GroupsManagement } from "@/app/components/groups-management"
import { ContactsManagement } from "@/app/components/contacts-management"
import { ProfilePage } from "@/app/components/profile-page"
import { useUser } from "@/app/providers/user-provider"
import { usersService } from "@/app/services/users.service"

export default function Page() {
  const { currentUser, setCurrentUser, isLoading: isLoadingUser } = useUser()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'groups' | 'contacts' | 'profile'>('dashboard')

  // Verify user still exists in database when component mounts
  useEffect(() => {
    if (!isLoadingUser && currentUser) {
      setIsVerifying(true)
      usersService.getUserByEmail(currentUser.email).then((dbUser) => {
        if (dbUser) {
          // Update context with latest user data from database
          setCurrentUser(dbUser)
        } else {
          // User no longer exists in database
          setCurrentUser(null)
        }
        setIsVerifying(false)
      }).catch(() => {
        setIsVerifying(false)
      })
    }
  }, [isLoadingUser]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async (name: string, email: string) => {
    const loggedInUser = await usersService.loginOrCreateUser(name, email)
    setCurrentUser(loggedInUser)
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  const handleUpdateUser = (name: string) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, name }
      setCurrentUser(updatedUser)
    }
  }

  if (isLoadingUser || isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginModal onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={isSidebarOpen}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          user={currentUser}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenProfile={() => setCurrentView('profile')}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' ? (
            <Dashboard />
          ) : currentView === 'groups' ? (
            <GroupsManagement />
          ) : currentView === 'contacts' ? (
            <ContactsManagement />
          ) : currentView === 'profile' ? (
            <ProfilePage user={currentUser} onUpdateUser={handleUpdateUser} />
          ) : null}
        </main>
      </div>
    </div>
  )
}
