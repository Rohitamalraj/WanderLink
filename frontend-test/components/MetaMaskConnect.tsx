/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React from 'react'
import { createMetaMaskWalletClient, getConnectedMetaMaskAddress } from '@/lib/metamask-client'
import toast from 'react-hot-toast'

export function MetaMaskConnect({ onConnected }: { onConnected?: (address: string) => void }) {
  const connect = async () => {
    try {
      const client = await createMetaMaskWalletClient()
      const address = client.account.address
      toast.success('MetaMask connected: ' + address)
      if (onConnected) onConnected(address)
      // reload to let Wagmi pick up provider if configured
      // window.location.reload()
    } catch (e) {
      toast.error('MetaMask connection failed: ' + (e instanceof Error ? e.message : 'Unknown'))
    }
  }

  return (
    <div className="text-center">
      <button onClick={connect} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Connect MetaMask</button>
    </div>
  )
}
