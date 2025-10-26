/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiConfig } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config, chains } from '../lib/wagmi'
import '@rainbow-me/rainbowkit/styles.css'
<<<<<<<< HEAD:integration/frontend/app/providers.tsx
import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { SessionProvider } from 'next-auth/react'
========
import { useState, useEffect } from 'react'
>>>>>>>> main:frontend-test/app/providers.tsx

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
<<<<<<<< HEAD:integration/frontend/app/providers.tsx
    <SessionProvider>
      <AuthProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={darkTheme()}>
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </AuthProvider>
    </SessionProvider>
========
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
>>>>>>>> main:frontend-test/app/providers.tsx
  )
}
