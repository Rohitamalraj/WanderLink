'use client'

import { VerificationForm } from '@/components/VerificationForm'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function VerifyPage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Get Verified</h1>
          <p className="text-gray-600">
            Verify your identity securely with Lit Protocol encryption
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center">
            <ConnectButton />
            <p className="mt-4 text-gray-600">
              Connect your wallet to get started
            </p>
          </div>
        ) : (
          <VerificationForm />
        )}

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border rounded-lg">
            <h3 className="font-bold mb-2">🔐 Encrypted</h3>
            <p className="text-sm text-gray-600">
              Your KYC data is encrypted with Lit Protocol. Only you can decrypt it.
            </p>
          </div>
          <div className="p-6 bg-white border rounded-lg">
            <h3 className="font-bold mb-2">🪪 Soulbound</h3>
            <p className="text-sm text-gray-600">
              Your Reputation SBT is non-transferable and tied to your wallet.
            </p>
          </div>
          <div className="p-6 bg-white border rounded-lg">
            <h3 className="font-bold mb-2">⛓️ On-Chain</h3>
            <p className="text-sm text-gray-600">
              Verification proof stored on Hedera/Sepolia for transparency.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
