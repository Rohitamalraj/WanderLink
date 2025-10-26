'use client'

import { useState } from 'react'
import { X, Shield, CheckCircle, Loader2, ExternalLink } from 'lucide-react'
import { AgentGroup } from '@/lib/offchain-base'
import { registerGroupOnChain } from '@/lib/hedera-group'

interface BlockchainRegistrationModalProps {
  group: AgentGroup
  onSuccess: () => void
  onCancel: () => void
}

export default function BlockchainRegistrationModal({
  group,
  onSuccess,
  onCancel
}: BlockchainRegistrationModalProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)

  const handleRegister = async () => {
    setIsRegistering(true)
    setError(null)

    try {
      console.log('🔐 Registering group on Hedera blockchain...')
      
      const result = await registerGroupOnChain({
        groupId: group.group_id,
        destination: group.destination,
        memberCount: group.member_count,
        createdAt: group.created_at
      })

      // Check if registration was successful
      if (!result.success || !result.transactionId) {
        throw new Error(result.error || 'Registration failed')
      }

      console.log('✅ Registration successful:', result)
      setTxId(result.transactionId)

      // Store registration info in localStorage
      const registrations = JSON.parse(localStorage.getItem('hedera_registrations') || '{}')
      registrations[group.group_id] = {
        transactionId: result.transactionId,
        explorerUrl: result.explorerUrl,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('hedera_registrations', JSON.stringify(registrations))

      // Wait a moment to show success, then call onSuccess
      setTimeout(() => {
        onSuccess()
      }, 2000)

    } catch (err: any) {
      console.error('❌ Registration failed:', err)
      setError(err.message || 'Failed to register on blockchain')
      setIsRegistering(false)
      // DO NOT call onSuccess - user must retry or cancel
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-6 border-b-4 border-black relative">
          <button
            onClick={onCancel}
            disabled={isRegistering}
            className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                BLOCKCHAIN REGISTRATION
              </h2>
              <p className="text-white/90 text-sm">
                Secure your group on Hedera
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!txId ? (
            <>
              {/* Group Info */}
              <div className="bg-orange-50 border-2 border-black p-4 space-y-2">
                <h3 className="font-bold text-lg">Group Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">Destination:</span> {group.destination}</p>
                  <p><span className="font-semibold">Members:</span> {group.member_count}</p>
                  <p><span className="font-semibold">Group ID:</span> {group.group_id.slice(0, 8)}...</p>
                </div>
              </div>

              {/* Why Register */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg">Why Register on Blockchain?</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Immutable Record:</strong> Your group formation is permanently recorded</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Transparent:</strong> Anyone can verify the group on HashScan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Secure:</strong> Decentralized storage on Hedera network</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Low Cost:</strong> Only ~$0.001 per registration</span>
                  </li>
                </ul>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-500 p-4 text-red-700 text-sm">
                  <p className="font-semibold">Registration Failed</p>
                  <p>{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={isRegistering}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 border-2 border-black font-bold transition-colors disabled:opacity-50"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      REGISTERING...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      REGISTER NOW
                    </>
                  )}
                </button>
              </div>

              {isRegistering && (
                <p className="text-sm text-gray-600 text-center">
                  Please approve the transaction in MetaMask...
                </p>
              )}
            </>
          ) : (
            /* Success State */
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              
              <div>
                <h3 className="text-2xl font-black mb-2">
                  REGISTRATION SUCCESSFUL!
                </h3>
                <p className="text-gray-600">
                  Your group is now secured on the Hedera blockchain
                </p>
              </div>

              <div className="bg-green-50 border-2 border-green-500 p-4 text-left space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Transaction ID:</span>
                  <br />
                  <code className="text-xs bg-white px-2 py-1 rounded">{txId}</code>
                </p>
                <a
                  href={`https://hashscan.io/testnet/transaction/${txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  View on HashScan
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <p className="text-sm text-gray-600">
                Redirecting to group chat...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
