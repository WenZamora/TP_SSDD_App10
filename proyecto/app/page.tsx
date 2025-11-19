'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { Dashboard } from '@/components/dashboard'
import { ActivityDetail } from '@/components/activity-detail'
import { AddExpenseModal } from '@/components/add-expense-modal'
import { LoginModal } from '@/components/login-modal'
import { GroupsManagement } from '@/components/groups-management'
import { CreateActivityModal } from '@/components/create-activity-modal'
import { RatingModal } from '@/components/rating-modal'
import { ActivityHistory } from '@/components/activity-history'
import { ContactsManagement } from '@/components/contacts-management'
import { ProfilePage } from '@/components/profile-page'
import { FinishedActivityDetailModal } from '@/components/finished-activity-detail-modal'

export default function Page() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'activity' | 'groups' | 'history' | 'contacts' | 'profile'>('dashboard')
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isCreateActivityOpen, setIsCreateActivityOpen] = useState(false)
  const [isRatingOpen, setIsRatingOpen] = useState(false)
  const [currentActivityName, setCurrentActivityName] = useState('')
  const [isFinishedActivityModalOpen, setIsFinishedActivityModalOpen] = useState(false)
  const [selectedFinishedActivityId, setSelectedFinishedActivityId] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('splitwise_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivityId(activityId)
    setCurrentView('activity')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setSelectedActivityId(null)
  }

  const handleCreateActivity = () => {
    setIsCreateActivityOpen(true)
  }

  const handleFinishActivity = () => {
    setCurrentActivityName('Viaje a Bariloche')
    setIsRatingOpen(true)
  }

  const handleLogin = (name: string) => {
    const newUser = {
      id: `user_${Date.now()}`,
      name
    }
    localStorage.setItem('splitwise_user', JSON.stringify(newUser))
    setUser(newUser)
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

  const handleFinishedActivitySelect = (activityId: string) => {
    setSelectedFinishedActivityId(activityId)
    setIsFinishedActivityModalOpen(true)
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
        onAddExpense={() => setIsAddExpenseOpen(true)}
        onCreateActivity={handleCreateActivity}
        onBackToDashboard={handleBackToDashboard}
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
            <Dashboard onActivitySelect={handleActivitySelect} baseCurrency={baseCurrency} />
          ) : currentView === 'activity' ? (
            <ActivityDetail 
              activityId={selectedActivityId} 
              baseCurrency={baseCurrency}
              onAddExpense={() => setIsAddExpenseOpen(true)}
              onFinishActivity={handleFinishActivity}
            />
          ) : currentView === 'groups' ? (
            <GroupsManagement baseCurrency={baseCurrency} />
          ) : currentView === 'history' ? (
            <ActivityHistory onActivitySelect={handleFinishedActivitySelect} baseCurrency={baseCurrency} />
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

      <CreateActivityModal
        open={isCreateActivityOpen}
        onOpenChange={setIsCreateActivityOpen}
      />

      <RatingModal
        open={isRatingOpen}
        onOpenChange={setIsRatingOpen}
        activityName={currentActivityName}
      />

      <FinishedActivityDetailModal
        isOpen={isFinishedActivityModalOpen}
        onClose={() => {
          setIsFinishedActivityModalOpen(false)
          setSelectedFinishedActivityId(null)
        }}
        activityId={selectedFinishedActivityId}
        baseCurrency={baseCurrency}
      />
    </div>
  )
}
