'use client'

/**
 * User Context Provider
 * Provides current authenticated user state throughout the application
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/app/types'

interface UserContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

/**
 * UserProvider Component
 * Manages the current user state and persists it to localStorage
 * 
 * Usage in layout.tsx:
 * ```tsx
 * import UserProvider from '@/app/providers/user-provider'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <UserProvider>
 *           {children}
 *         </UserProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('splitwise_user')
    if (storedUser) {
      try {
        setCurrentUserState(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('splitwise_user')
      }
    }
    setIsLoading(false)
  }, [])

  // Update localStorage when user changes
  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user)
    if (user) {
      localStorage.setItem('splitwise_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('splitwise_user')
    }
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

/**
 * Hook to access current user context
 * @throws Error if used outside of UserProvider
 * @returns Current user, setter function, and loading state
 * 
 * Usage:
 * ```tsx
 * const { currentUser, setCurrentUser, isLoading } = useUser()
 * 
 * if (isLoading) return <Spinner />
 * if (!currentUser) return <Login />
 * 
 * return <div>Hello {currentUser.name}</div>
 * ```
 */
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

