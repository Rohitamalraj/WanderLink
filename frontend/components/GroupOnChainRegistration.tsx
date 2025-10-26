'use client'

import { useState, useEffect } from 'react'
import { registerGroupOnChain, getGroupTransactionInfo, GroupFormationData } from '@/lib/hedera-group'
import { CheckCircle, Loader2, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GroupOnChainRegistrationProps {
  group: any
  onRegistrationComplete?: (txInfo: any) => void
}

export function GroupOnChainRegistration({ group, onRegistrationComplete }: GroupOnChainRegistrationProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [txInfo, setTxInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if already registered
    const existingTx = getGroupTransactionInfo(group.group_id)
    if (existingTx) {
      setIsRegistered(true)
      setTxInfo(existingTx)
    }
  }, [group.group_id])

  const handleRegisterOnChain = async () => {
    setIsRegistering(true)
    setError(null)

    try {
      const groupData: GroupFormationData = {
        groupId: group.group_id,
        destination: group.destination,
        members: group.members || [],
        memberCount: group.member_count || group.members?.length || 0,
        createdAt: group.created_at || new Date().toISOString(),
      }

      console.log('📝 Registering group on Hedera blockchain...', groupData)

      const result = await registerGroupOnChain(groupData)

      if (result.success) {
        setIsRegistered(true)
        setTxInfo({
          transactionId: result.transactionId,
          explorerUrl: result.explorerUrl,
        })
        
        if (onRegistrationComplete) {
          onRegistrationComplete(result)
        }

        console.log('✅ Group registered successfully on Hedera!')
      } else {
        setError(result.error || 'Failed to register group on-chain')
        console.error('❌ Registration failed:', result.error)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMsg)
      console.error('❌ Error during registration:', err)
    } finally {
      setIsRegistering(false)
    }
  }

  if (isRegistered && txInfo) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-4 border-green-500 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-start gap-4">
          <div className="bg-green-500 rounded-full p-3 border-2 border-black">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-black text-green-900 mb-2">
              ✅ REGISTERED ON HEDERA BLOCKCHAIN
            </h3>
            <p className="text-sm font-bold text-gray-700 mb-3">
              Your group formation has been permanently recorded on the Hedera network!
            </p>
            
            <div className="bg-white rounded-xl p-4 border-2 border-black mb-3">
              <p className="text-xs font-bold text-gray-600 mb-1">Transaction ID:</p>
              <p className="text-xs font-mono text-gray-900 break-all mb-2">
                {txInfo.transactionId}
              </p>
              
              {txInfo.explorerUrl && (
                <a
                  href={txInfo.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on HashScan Explorer
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Immutable • Transparent • Verified
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-4 border-blue-500 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-start gap-4">
        <div className="bg-blue-500 rounded-full p-3 border-2 border-black">
          <AlertCircle className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-black text-blue-900 mb-2">
            🔗 REGISTER GROUP ON BLOCKCHAIN
          </h3>
          <p className="text-sm font-bold text-gray-700 mb-4">
            Permanently record this group formation on the Hedera blockchain for transparency and verification.
          </p>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-3 mb-4">
              <p className="text-sm font-bold text-red-800">{error}</p>
            </div>
          )}

          <Button
            onClick={handleRegisterOnChain}
            disabled={isRegistering}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                REGISTERING ON HEDERA...
              </>
            ) : (
              'REGISTER ON HEDERA BLOCKCHAIN'
            )}
          </Button>

          <div className="mt-4 text-xs font-bold text-gray-600">
            <p>✓ Immutable record</p>
            <p>✓ Transparent verification</p>
            <p>✓ Decentralized storage</p>
          </div>
        </div>
      </div>
    </div>
  )
}
