'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getContracts } from '@/lib/contracts/config'
import { encryptKYCData, generateKYCHash, type KYCData } from '@/lib/kyc-encryption'

export function VerificationForm() {
  const { address, chainId } = useAccount()
  const contracts = chainId ? getContracts(chainId) : null

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
  })
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [status, setStatus] = useState('')

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !contracts) return

    try {
      setIsEncrypting(true)
      setStatus('🔐 Encrypting your KYC data with Lit Protocol...')

      // Create KYC data object
      const kycData: KYCData = {
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        worldIDVerified: false, // TODO: Integrate WorldID
        verificationTier: 'Basic',
        timestamp: Date.now(),
      }

      // Encrypt data with Lit Protocol
      const { encryptedData, dataHash, accessConditions } = await encryptKYCData(
        kycData,
        address
      )

      setStatus('📝 Generating on-chain commitment...')

      // Generate KYC hash for on-chain storage
      const kycHash = generateKYCHash(encryptedData, dataHash)

      setStatus('✍️ Minting your Verification SBT...')

      // Mint ReputationSBT with encrypted KYC hash
      writeContract({
        address: contracts.ReputationSBT.address,
        abi: contracts.ReputationSBT.abi,
        functionName: 'mintVerifiedSBT',
        args: [
          address, // wallet address
          1, // tier: Basic
          kycHash, // encrypted KYC hash
        ],
      })

      setStatus('⏳ Waiting for transaction confirmation...')
    } catch (error) {
      console.error('Error encrypting KYC:', error)
      setStatus('❌ Error: ' + (error as Error).message)
    } finally {
      setIsEncrypting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-xl font-bold text-green-800 mb-2">
          ✅ Verification Complete!
        </h3>
        <p className="text-green-700">
          Your identity has been verified and encrypted. Your Reputation SBT has been minted.
        </p>
        <p className="text-sm text-green-600 mt-2">
          Transaction: {hash?.slice(0, 10)}...{hash?.slice(-8)}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Verify Your Identity</h2>
      <p className="text-gray-600 mb-6">
        Your data will be encrypted with Lit Protocol. Only you can decrypt it.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="+1 234 567 8900"
          />
        </div>

        <button
          type="submit"
          disabled={!address || isEncrypting || isPending || isConfirming}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isEncrypting || isPending || isConfirming
            ? 'Processing...'
            : 'Verify & Mint SBT'}
        </button>
      </form>

      {status && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          {status}
        </div>
      )}
    </div>
  )
}
