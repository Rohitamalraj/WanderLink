'use client'

import { useState, useEffect } from 'react'
import { MapPin, Users, Calendar, MessageSquare, Eye, Sparkles, Loader2, Link2, Shield, ExternalLink, Coins, CheckCircle } from 'lucide-react'
import { AgentGroup } from '@/lib/supabase'

interface ProcessingTripCardProps {
  group: AgentGroup
  onOpenChat?: () => void
}

export default function ProcessingTripCard({ group, onOpenChat }: ProcessingTripCardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'chatbox' | 'members' | 'stake'>('overview')
  const [txInfo, setTxInfo] = useState<{ transactionId: string; explorerUrl: string } | null>(null)
  
  // Stake state
  const [stakeLoading, setStakeLoading] = useState(false)
  const [stakeStatus, setStakeStatus] = useState<'idle' | 'need_approval' | 'approving' | 'negotiating' | 'approved' | 'staked'>('idle')
  const [negotiatedAmount, setNegotiatedAmount] = useState<number | null>(null)
  const [stakeConversation, setStakeConversation] = useState<any>(null)
  const [stakeError, setStakeError] = useState<string>('')
  const [isApproved, setIsApproved] = useState(false)
  const [allowance, setAllowance] = useState<string>('0')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  // Get transaction info and check wallet
  useEffect(() => {
    const registrations = JSON.parse(localStorage.getItem('hedera_registrations') || '{}')
    const registration = registrations[group.group_id]
    if (registration) {
      setTxInfo({
        transactionId: registration.transactionId,
        explorerUrl: registration.explorerUrl
      })
    }
    
    // Check if stake already exists
    const stakes = JSON.parse(localStorage.getItem('group_stakes') || '{}')
    const existingStake = stakes[group.group_id]
    if (existingStake) {
      setNegotiatedAmount(existingStake.amount)
      setStakeStatus('staked')
    }

    // Get wallet address and check network
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0])
            
            // Check network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' })
            const isHedera = chainId === '0x128' // Hedera Testnet
            setIsCorrectNetwork(isHedera)
            
            if (isHedera) {
              await checkAllowance(accounts[0])
            }
          }
        } catch (error) {
          console.error('Failed to get wallet:', error)
        }
      }
    }
    checkWallet()

    // Listen for network changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        setIsCorrectNetwork(chainId === '0x128')
        window.location.reload()
      }
      window.ethereum.on('chainChanged', handleChainChanged)
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [group.group_id])

  // Check allowance
  const checkAllowance = async (address: string) => {
    try {
      const { getStakeContractService } = await import('@/lib/stake/contract-service')
      const contractService = getStakeContractService()
      const currentAllowance = await contractService.checkAllowance(address)
      setAllowance(currentAllowance)
      setIsApproved(parseFloat(currentAllowance) > 0)
    } catch (error) {
      console.error('Failed to check allowance:', error)
    }
  }

  // Handle approval
  const handleApproveAgent = async () => {
    if (!walletAddress) {
      setStakeError('Please connect your wallet first')
      return
    }

    setStakeStatus('approving')
    setStakeError('')

    try {
      const { getStakeContractService } = await import('@/lib/stake/contract-service')
      const contractService = getStakeContractService()

      // Approve for 1000 HBAR (enough for multiple trips)
      const approvalAmount = 1000
      const txHash = await contractService.approveAgent(approvalAmount)

      setIsApproved(true)
      setAllowance(approvalAmount.toString())
      setStakeStatus('idle')
      
      alert(`✅ Agent approved! You can now start stake negotiation.\n\nTransaction: ${txHash}`)
    } catch (error: any) {
      console.error('Approval error:', error)
      setStakeError(error.message || 'Failed to approve agent')
      setStakeStatus('idle')
    }
  }

  // Check allowance before negotiation
  const checkAllowanceBeforeNegotiation = async () => {
    if (!walletAddress) {
      setStakeError('Please connect your wallet first')
      return false
    }

    try {
      const { getStakeContractService } = await import('@/lib/stake/contract-service')
      const contractService = getStakeContractService()
      const currentAllowance = await contractService.checkAllowance(walletAddress)
      setAllowance(currentAllowance)
      
      const allowanceNum = parseFloat(currentAllowance)
      if (allowanceNum <= 0) {
        setIsApproved(false)
        setStakeError('Please approve the agent first')
        return false
      }
      
      setIsApproved(true)
      return true
    } catch (error) {
      console.error('Failed to check allowance:', error)
      return false
    }
  }

  // Handle stake negotiation
  const handleStartStakeNegotiation = async () => {
    // Check allowance first
    const hasAllowance = await checkAllowanceBeforeNegotiation()
    if (!hasAllowance) {
      return
    }

    setStakeLoading(true)
    setStakeError('')
    setStakeStatus('negotiating')

    try {
      // Mock member budgets - in production, extract from travel agent messages
      const memberBudgets = [500, 600, 450] // Example budgets in USD

      const response = await fetch('/api/group-stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: group.group_id,
          destination: group.destination,
          memberBudgets,
          memberCount: group.member_count,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to negotiate stake')
      }

      if (data.success) {
        setStakeConversation(data.conversation)
        setNegotiatedAmount(data.summary.negotiatedAmount)
        setStakeStatus('approved')
        
        // Store negotiation details
        const stakes = JSON.parse(localStorage.getItem('group_stakes') || '{}')
        stakes[group.group_id] = {
          amount: data.summary.negotiatedAmount,
          timestamp: Date.now(),
          status: 'approved',
          conversation: data.conversation,
          summary: data.summary,
          transactions: data.transactions || [],
          topicId: data.topicId,
        }
        localStorage.setItem('group_stakes', JSON.stringify(stakes))
      }
    } catch (error: any) {
      console.error('Stake negotiation error:', error)
      setStakeError(error.message || 'Failed to negotiate stake')
      setStakeStatus('idle')
    } finally {
      setStakeLoading(false)
    }
  }

  // Handle stake payment
  const handleStakeAmount = async () => {
    if (!negotiatedAmount || !walletAddress) return

    setStakeLoading(true)
    setStakeError('')

    try {
      console.log(`💰 Requesting backend agent to stake ${negotiatedAmount} HBAR...`)
      console.log(`   User: ${walletAddress}`)
      console.log(`   Amount: ${negotiatedAmount} HBAR`)
      console.log(`   Group ID: ${group.group_id}`)

      // Call backend API to have agent stake on behalf
      const response = await fetch('/api/stake-on-behalf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: walletAddress,
          amount: negotiatedAmount,
          groupId: group.group_id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to stake')
      }

      console.log(`📤 Transaction sent: ${data.transactionHash}`)
      console.log(`✅ Stake confirmed! Block: ${data.blockNumber}`)

      // Get existing stake data
      const stakes = JSON.parse(localStorage.getItem('group_stakes') || '{}')
      const existingStake = stakes[group.group_id] || {}

      // Update stake info with transaction hash
      stakes[group.group_id] = {
        ...existingStake,
        amount: negotiatedAmount,
        timestamp: Date.now(),
        status: 'staked',
        transactions: [...(existingStake.transactions || []), data.transactionHash],
        stakeTransactionHash: data.transactionHash, // Main stake transaction
        blockNumber: data.blockNumber,
        tripIdUint: data.tripId,
      }
      localStorage.setItem('group_stakes', JSON.stringify(stakes))

      setStakeStatus('staked')
      alert(`✅ Successfully staked ${negotiatedAmount} HBAR!\n\nTransaction: ${data.transactionHash}\n\nView on HashScan: ${data.explorerUrl}`)
    } catch (error: any) {
      console.error('Stake payment error:', error)
      setStakeError(error.message || 'Failed to stake amount')
      alert('❌ Failed to stake amount: ' + error.message)
    } finally {
      setStakeLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* Image Header */}
      <div className="relative h-56 bg-gradient-to-r from-purple-400 to-pink-400">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <Sparkles className="w-16 h-16 mx-auto mb-2 animate-pulse" />
            <h3 className="text-2xl font-black">AI MATCHED GROUP</h3>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-yellow-400 px-3 py-1 rounded-full border-2 border-black font-black text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            PROCESSING
          </span>
        </div>
        
        {/* Duration Badge */}
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border-2 border-black font-black text-sm">
          {group.member_count} MEMBERS
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="font-bold text-sm">{group.destination}</span>
        </div>

        {/* Title */}
        <h3 className="font-black text-xl mb-3">
          {group.destination} Travel Group
        </h3>

        {/* Group ID */}
        <div className="bg-gray-100 px-3 py-2 rounded-lg border-2 border-black mb-4">
          <p className="text-xs font-mono text-gray-600">
            Group ID: {group.group_id?.substring(0, 20)}...
          </p>
        </div>

        {/* Blockchain Registration Badge */}
        <div className="mb-4 bg-green-50 border-2 border-green-500 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-green-700">✅ REGISTERED ON HEDERA BLOCKCHAIN</span>
          </div>
          {txInfo && (
            <a
              href={txInfo.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Transaction on HashScan
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-lg font-black border-2 border-black transition-all text-sm ${
              activeTab === 'overview'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />
            OVERVIEW
          </button>
          
          <button
            onClick={() => setActiveTab('chatbox')}
            className={`px-3 py-2 rounded-lg font-black border-2 border-black transition-all text-sm ${
              activeTab === 'chatbox'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-1" />
            CHATBOX
          </button>
          
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-2 rounded-lg font-black border-2 border-black transition-all text-sm ${
              activeTab === 'members'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1" />
            MEMBERS
          </button>
          
          <button
            onClick={() => setActiveTab('stake')}
            className={`px-3 py-2 rounded-lg font-black border-2 border-black transition-all text-sm ${
              activeTab === 'stake'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <Coins className="w-4 h-4 inline mr-1" />
            STAKE
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-black rounded-xl p-4">
                <h4 className="font-black mb-2">ABOUT THIS TRIP</h4>
                <p className="text-sm text-gray-700">
                  AI-matched group for {group.destination}. Your travel preferences have been analyzed 
                  and you've been matched with {group.member_count - 1} other compatible traveler(s).
                </p>
              </div>

              {group.itinerary && (
                <div className="bg-purple-50 border-2 border-black rounded-xl p-4">
                  <h4 className="font-black mb-2">AI GENERATED ITINERARY</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {group.itinerary}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="font-bold text-sm">{group.member_count} travelers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bold text-sm">
                      {new Date(group.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chatbox Tab */}
          {activeTab === 'chatbox' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-black rounded-xl p-6 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                <h4 className="font-black mb-2">GROUP CHAT</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Connect with your travel group members and plan your trip together!
                </p>
                <button
                  onClick={onOpenChat}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  OPEN CHAT
                </button>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              <h4 className="font-black mb-3">GROUP MEMBERS</h4>
              {group.members?.map((memberId: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-black"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-black">Traveler {idx + 1}</p>
                    <p className="text-xs text-gray-500 font-mono">
                      {memberId.substring(0, 20)}...
                    </p>
                  </div>
                  {memberId === localStorage.getItem('wanderlink_agent_user_id') && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black">
                      YOU
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stake Tab */}
          {activeTab === 'stake' && (
            <div className="space-y-4">
              {/* Idle State - Need Approval First */}
              {stakeStatus === 'idle' && !isApproved && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-black rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-black text-lg">STEP 1: APPROVE AGENT</h4>
                      <p className="text-xs text-gray-600">Allow agent to stake on your behalf</p>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-black rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Why approval?</strong> You need to approve our AI agent once so it can automatically 
                      stake HBAR on your behalf after negotiation. This is a one-time approval for all future trips.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-purple-600 mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-bold">Secure & Transparent</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-600">
                      <Shield className="w-4 h-4" />
                      <span className="font-bold">You control the approval amount</span>
                    </div>
                  </div>

                  {!walletAddress && (
                    <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-700 font-bold">⚠️ Please connect your MetaMask wallet first</p>
                    </div>
                  )}

                  {walletAddress && !isCorrectNetwork && (
                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-700 font-bold mb-2">❌ Wrong Network!</p>
                      <p className="text-xs text-red-600 mb-2">Please switch to Hedera Testnet</p>
                      <button
                        onClick={async () => {
                          const { getStakeContractService } = await import('@/lib/stake/contract-service')
                          const contractService = getStakeContractService()
                          await contractService.switchToHedera()
                        }}
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-red-700"
                      >
                        Switch to Hedera Testnet
                      </button>
                    </div>
                  )}

                  {stakeError && (
                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-700 font-bold">❌ {stakeError}</p>
                    </div>
                  )}

                  <button
                    onClick={handleApproveAgent}
                    disabled={!walletAddress || stakeLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-xl font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {stakeLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                        APPROVING...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 inline mr-2" />
                        APPROVE AGENT (1000 HBAR)
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-center text-gray-500 mt-3">
                    Approval amount: 1000 HBAR (covers multiple trips)
                  </p>
                </div>
              )}

              {/* Idle State - Already Approved */}
              {stakeStatus === 'idle' && isApproved && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-black rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Coins className="w-8 h-8 text-orange-600" />
                    <div>
                      <h4 className="font-black text-lg">STEP 2: STAKE NEGOTIATION</h4>
                      <p className="text-xs text-gray-600">AI agents will determine fair amount</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-700 font-bold">
                      ✅ Agent Approved! Allowance: {allowance} HBAR
                    </p>
                  </div>
                  
                  <div className="bg-white border-2 border-black rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>How it works:</strong> Our AI agents will analyze all group members' budgets 
                      and negotiate a fair stake amount. Once agreed, the agent will automatically stake on your behalf.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <Shield className="w-4 h-4" />
                      <span className="font-bold">Powered by Hedera A2A Agent Communication</span>
                    </div>
                  </div>

                  {stakeError && (
                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-700 font-bold">❌ {stakeError}</p>
                    </div>
                  )}

                  <button
                    onClick={handleStartStakeNegotiation}
                    disabled={stakeLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-4 rounded-xl font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Coins className="w-5 h-5 inline mr-2" />
                    START STAKE NEGOTIATION
                  </button>
                  
                  <p className="text-xs text-center text-gray-500 mt-3">
                    AI agents will communicate and automatically stake the agreed amount
                  </p>
                </div>
              )}

              {/* Negotiating State */}
              {stakeStatus === 'negotiating' && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-black rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    <div>
                      <h4 className="font-black text-lg">AI AGENTS NEGOTIATING...</h4>
                      <p className="text-xs text-gray-600">Analyzing budgets and determining fair amount</p>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-black rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <p className="text-sm font-bold">Coordinator Agent: Analyzing group budgets...</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <p className="text-sm font-bold">Validator Agent: Performing AI analysis...</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-sm font-bold">Negotiating optimal stake amount...</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Approved State */}
              {stakeStatus === 'approved' && negotiatedAmount && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-black rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="font-black text-lg">✅ STAKE AMOUNT APPROVED</h4>
                      <p className="text-xs text-gray-600">AI agents have reached consensus</p>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-black rounded-lg p-6 mb-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Negotiated Stake Amount</p>
                    <p className="text-4xl font-black text-green-700 mb-2">{negotiatedAmount} HBAR</p>
                    <p className="text-xs text-gray-500">~${(negotiatedAmount * 0.05).toFixed(2)} USD</p>
                  </div>

                  {/* Negotiation Chat */}
                  {stakeConversation && stakeConversation.messages && (
                    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
                      <p className="text-xs font-black text-purple-800 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        AI AGENT NEGOTIATION CHAT
                      </p>
                      <div className="space-y-2">
                        {stakeConversation.messages.map((msg: any, idx: number) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg text-xs ${
                              msg.from.includes('coordinator') 
                                ? 'bg-blue-100 border-l-4 border-blue-500' 
                                : 'bg-green-100 border-l-4 border-green-500'
                            }`}
                          >
                            <p className="font-black text-gray-800 mb-1">
                              {msg.from.includes('coordinator') ? '🤖 Coordinator Agent' : '✅ Validator Agent'}
                            </p>
                            <p className="text-gray-700 mb-1">
                              <strong>Type:</strong> {msg.type.replace('STAKE_', '')}
                            </p>
                            {msg.payload && (
                              <div className="text-gray-600 text-xs mt-2 space-y-1">
                                {msg.payload.proposedStake && (
                                  <p>💰 Proposed: {msg.payload.proposedStake} HBAR</p>
                                )}
                                {msg.payload.approvedAmount && (
                                  <p>✅ Approved: {msg.payload.approvedAmount} HBAR</p>
                                )}
                                {msg.payload.negotiatedAmount && (
                                  <p>🤝 Final: {msg.payload.negotiatedAmount} HBAR</p>
                                )}
                                {msg.payload.reason && (
                                  <p className="italic mt-1 whitespace-pre-wrap">"{msg.payload.reason}"</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Negotiation Summary */}
                  {stakeConversation && (
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                      <p className="text-xs font-bold text-blue-800 mb-2">📊 Negotiation Summary:</p>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>• Messages: {stakeConversation.messages?.length || 0}</p>
                        <p>• Duration: {stakeConversation.endTime ? Math.round((stakeConversation.endTime - stakeConversation.startTime) / 1000) : 0}s</p>
                        <p>• Status: {stakeConversation.status}</p>
                        {(() => {
                          const stakes = JSON.parse(localStorage.getItem('group_stakes') || '{}')
                          const stakeData = stakes[group.group_id]
                          return stakeData?.topicId && (
                            <p className="flex items-center gap-1">
                              • Topic: 
                              <a 
                                href={`https://hashscan.io/testnet/topic/${stakeData.topicId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-bold"
                              >
                                {stakeData.topicId}
                                <ExternalLink className="w-3 h-3 inline ml-1" />
                              </a>
                            </p>
                          )
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Check if needs approval */}
                  {parseFloat(allowance) <= 0 ? (
                    <div className="space-y-3">
                      <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-3">
                        <p className="text-sm text-yellow-700 font-bold">⚠️ Approval needed before staking</p>
                      </div>
                      <button
                        onClick={handleApproveAgent}
                        disabled={!walletAddress || stakeLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-xl font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {stakeLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                            APPROVING...
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5 inline mr-2" />
                            APPROVE AGENT (1000 HBAR)
                          </>
                        )}
                      </button>
                      <p className="text-xs text-center text-gray-500 mt-2">
                        Approve the agent first to enable automatic staking
                      </p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleStakeAmount}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                      >
                        <Coins className="w-5 h-5 inline mr-2" />
                        STAKE {negotiatedAmount} HBAR NOW
                      </button>
                      <p className="text-xs text-center text-gray-500 mt-3">
                        Confirm your commitment by staking the agreed amount
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Staked State */}
              {stakeStatus === 'staked' && negotiatedAmount && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="font-black text-lg">✅ STAKED SUCCESSFULLY</h4>
                      <p className="text-xs text-gray-600">Your commitment is secured on Hedera</p>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-black rounded-lg p-6 mb-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Staked Amount</p>
                    <p className="text-4xl font-black text-green-700 mb-4">{negotiatedAmount} HBAR</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-green-600">
                      <Shield className="w-4 h-4" />
                      <span className="font-bold">Locked in Hedera Escrow</span>
                    </div>
                  </div>

                  {/* Main Stake Transaction */}
                  {(() => {
                    const stakes = JSON.parse(localStorage.getItem('group_stakes') || '{}')
                    const stakeData = stakes[group.group_id]
                    return stakeData?.stakeTransactionHash && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-4 mb-4">
                        <p className="text-xs font-black text-green-800 mb-3 flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          STAKE TRANSACTION
                        </p>
                        <a
                          href={`https://hashscan.io/testnet/transaction/${stakeData.stakeTransactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-white rounded-lg hover:bg-green-100 transition-colors border-2 border-green-300"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs font-bold text-gray-800 mb-1">💰 Staked {negotiatedAmount} HBAR</p>
                              <p className="text-xs text-gray-600 font-mono break-all">{stakeData.stakeTransactionHash}</p>
                              {stakeData.blockNumber && (
                                <p className="text-xs text-gray-500 mt-1">Block: {stakeData.blockNumber}</p>
                              )}
                            </div>
                            <ExternalLink className="w-5 h-5 text-green-600 flex-shrink-0" />
                          </div>
                        </a>
                      </div>
                    )
                  })()}

                  {/* Negotiation Chat (if available) */}
                  {(() => {
                    const stakes = JSON.parse(localStorage.getItem('group_stakes') || '{}')
                    const stakeData = stakes[group.group_id]
                    return stakeData?.conversation?.messages && (
                      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <p className="text-xs font-black text-purple-800 mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          AI AGENT NEGOTIATION CHAT
                        </p>
                        <div className="space-y-2">
                          {stakeData.conversation.messages.map((msg: any, idx: number) => (
                            <div 
                              key={idx}
                              className={`p-3 rounded-lg text-xs ${
                                msg.from.includes('coordinator') 
                                  ? 'bg-blue-100 border-l-4 border-blue-500' 
                                  : 'bg-green-100 border-l-4 border-green-500'
                              }`}
                            >
                              <p className="font-black text-gray-800 mb-1">
                                {msg.from.includes('coordinator') ? '🤖 Coordinator Agent' : '✅ Validator Agent'}
                              </p>
                              <p className="text-gray-700 mb-1">
                                <strong>Type:</strong> {msg.type.replace('STAKE_', '')}
                              </p>
                              {msg.payload && (
                                <div className="text-gray-600 text-xs mt-2 space-y-1">
                                  {msg.payload.proposedStake && (
                                    <p>💰 Proposed: {msg.payload.proposedStake} HBAR</p>
                                  )}
                                  {msg.payload.approvedAmount && (
                                    <p>✅ Approved: {msg.payload.approvedAmount} HBAR</p>
                                  )}
                                  {msg.payload.negotiatedAmount && (
                                    <p>🤝 Final: {msg.payload.negotiatedAmount} HBAR</p>
                                  )}
                                  {msg.payload.reason && (
                                    <p className="italic mt-1 whitespace-pre-wrap">"{msg.payload.reason}"</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* View Full Details Button */}
        <div className="mt-4 pt-4 border-t-2 border-black">
          <button
            onClick={() => window.location.href = '/agent-trips-v2'}
            className="w-full bg-black text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            VIEW FULL DETAILS
          </button>
        </div>
      </div>
    </div>
  )
}
