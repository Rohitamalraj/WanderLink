/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiConfig } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from '../lib/wagmi'
import '@rainbow-me/rainbowkit/styles.css'
import { useState, useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <SessionProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <WagmiConfig config={config}>
            <RainbowKitProvider 
              theme={darkTheme()}
              modalSize="compact"
              showRecentTransactions={true}
            >
              {children}
            </RainbowKitProvider>
          </WagmiConfig>
        </QueryClientProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
