import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Your Travel Group - WanderLink',
  description: 'AI-powered travel group matching with Agentverse agents',
}

export default function AgentTripsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
