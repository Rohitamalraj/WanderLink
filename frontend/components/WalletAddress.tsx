'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function WalletAddress() {
  const { address, isConnected } = useAccount()

  if (!isConnected || !address) {
    return <ConnectButton />
  }

  return (
    <div className="bg-white px-4 py-2 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </div>
    </div>
  )
}
