'use client'

/**
 * TanStack Query Provider
 * Wraps the application with QueryClientProvider for server state management
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

/**
 * Creates a QueryClient with optimized default options
 * - staleTime: 5 minutes (data considered fresh for 5 minutes)
 * - refetchOnWindowFocus: false (don't refetch when window regains focus)
 * - retry: 1 (retry failed queries once)
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes
        staleTime: 1000 * 60 * 5, // 5 minutes
        
        // Don't refetch when window regains focus
        refetchOnWindowFocus: false,
        
        // Retry failed queries once
        retry: 1,
        
        // Show cached data while refetching in background
        refetchOnMount: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  })
}

// Browser: Create a singleton instance
let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: Always create a new query client
    return makeQueryClient()
  } else {
    // Browser: Use singleton pattern to avoid recreating on re-renders
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}

/**
 * QueryProvider Component
 * Provides TanStack Query context to the application
 * 
 * Usage in layout.tsx:
 * ```tsx
 * import QueryProvider from '@/app/providers/query-provider'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <QueryProvider>
 *           {children}
 *         </QueryProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export default function QueryProvider({ children }: QueryProviderProps) {
  // NOTE: Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may
  // suspend because React will throw away the client on the initial
  // render if it suspends and there is no boundary
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

