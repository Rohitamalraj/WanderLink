'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut, CheckCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get MetaMask connector
  const metaMaskConnector = connectors.find(
    (connector) => connector.name.toLowerCase().includes('metamask') || connector.id === 'injected'
  )

  const handleConnect = () => {
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setShowDropdown(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  if (isConnected && address) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Wallet className="w-4 h-4" />
          <span className="text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-2xl border-2 border-green-200 p-4 min-w-[280px] z-50">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-gray-900">Connected</p>
              </div>
              <p className="text-xs text-gray-600 mb-1">Wallet Address:</p>
              <p className="text-xs font-mono font-semibold text-gray-900 break-all bg-gray-50 p-2 rounded">
                {address}
              </p>
            </div>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
    >
      <Wallet className="w-4 h-4" />
      <span className="text-sm">Connect Wallet</span>
    </button>
  )
}
