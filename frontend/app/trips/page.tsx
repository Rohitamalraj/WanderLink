'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Users, Calendar, DollarSign, Filter, X, Sparkles, Plus, Loader2 } from 'lucide-react'
import { mockTrips } from '@/lib/offchain-mdata'
import { formatDate, calculateDays } from '@/lib/utils'
import AgentTripModal from '@/components/AgentTripModal'
import CreateGroupModal from '@/components/CreateGroupModal'
import ProcessingTripCard from '@/components/ProcessingTripCard'
import GroupChatModal from '@/components/GroupChatModal'
import ProcessingStatusModal from '@/components/ProcessingStatusModal'
import BlockchainRegistrationModal from '@/components/BlockchainRegistrationModal'
import { AgentGroup } from '@/lib/offchain-base'
import { useGroupStatus } from '@/hooks/useGroupStatus'
import { ProfilePhotoNFT } from '@/components/ProfilePhotoNFT'
import { WalletAddress } from '@/components/WalletAddress'

export default function TripsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBudget, setSelectedBudget] = useState<string>('all')
  const [selectedPace, setSelectedPace] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Modal States
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showBlockchainModal, setShowBlockchainModal] = useState(false)
  
  // Processing Trip State
  const [processingGroup, setProcessingGroup] = useState<AgentGroup | null>(null)
  const [pendingGroup, setPendingGroup] = useState<AgentGroup | null>(null) // Group waiting for blockchain registration
  const [userId, setUserId] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false) // Track if user submitted a trip
  const [isRegisteredOnChain, setIsRegisteredOnChain] = useState(false)

  // Initialize user ID and check for existing group
  useEffect(() => {
    const storedUserId = localStorage.getItem('wanderlink_agent_user_id')
    if (storedUserId) {
      setUserId(storedUserId)
    }
  }, [])

  // Check if group is already registered on blockchain
  useEffect(() => {
    if (processingGroup) {
      const registrations = JSON.parse(localStorage.getItem('hedera_registrations') || '{}')
      const isRegistered = !!registrations[processingGroup.group_id]
      setIsRegisteredOnChain(isRegistered)
    }
  }, [processingGroup])

  // Check if user has a processing group
  const { group, inGroup } = useGroupStatus({
    userId,
    enabled: !!userId && !processingGroup && !pendingGroup,
    pollInterval: 10000, // Check every 10 seconds
    onGroupFound: (group) => {
      console.log('🎉 Group found! Checking blockchain registration...')
      
      // Check if already registered on blockchain
      const registrations = JSON.parse(localStorage.getItem('hedera_registrations') || '{}')
      const isRegistered = !!registrations[group.group_id]
      
      if (isRegistered) {
        // Already registered, show group directly
        console.log('✅ Group already registered on blockchain')
        setProcessingGroup(group)
        setIsRegisteredOnChain(true)
      } else {
        // Not registered, show blockchain modal first
        console.log('⚠️ Group not registered. Showing blockchain modal...')
        setPendingGroup(group)
        setShowBlockchainModal(true)
      }
      
      setIsProcessing(false)
    }
  })

  useEffect(() => {
    if (inGroup && group && !processingGroup && !pendingGroup) {
      // Check if already registered
      const registrations = JSON.parse(localStorage.getItem('hedera_registrations') || '{}')
      const isRegistered = !!registrations[group.group_id]
      
      if (isRegistered) {
        setProcessingGroup(group)
        setIsRegisteredOnChain(true)
      } else {
        setPendingGroup(group)
        setShowBlockchainModal(true)
      }
      setIsProcessing(false)
    }
  }, [inGroup, group, processingGroup, pendingGroup])

  const handleFindMatches = () => {
    setShowAgentModal(true)
  }

  const handleOpenChat = () => {
    setShowChatModal(true)
  }

  const handleViewStatus = () => {
    setShowStatusModal(true)
  }

  const handleBlockchainSuccess = () => {
    console.log('✅ Blockchain registration successful!')
    if (pendingGroup) {
      setProcessingGroup(pendingGroup)
      setPendingGroup(null)
      setIsRegisteredOnChain(true)
    }
    setShowBlockchainModal(false)
  }

  const handleBlockchainCancel = () => {
    console.log('❌ User cancelled blockchain registration')
    // Clear the pending group and allow them to try again later
    setPendingGroup(null)
    setShowBlockchainModal(false)
  }

  const filteredTrips = mockTrips.filter((trip) => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.country.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesBudget = selectedBudget === 'all' || trip.preferences.budget === selectedBudget
    const matchesPace = selectedPace === 'all' || trip.preferences.pace === selectedPace
    const matchesStatus = selectedStatus === 'all' || trip.status === selectedStatus

    return matchesSearch && matchesBudget && matchesPace && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Fixed Profile Photo NFT in Top Right */}
      <div className="fixed top-4 right-4 z-[60]">
        <ProfilePhotoNFT />
      </div>

      {/* Header */}
      <div className="border-b-4 border-black bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-black">
              WANDERLINK
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="hidden sm:block font-bold text-lg hover:underline"
              >
                Dashboard
              </Link>
              <WalletAddress />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl font-black mb-4">COMPLETED TRIPS</h1>
          <p className="text-xl text-gray-700 font-bold">
            Explore {filteredTrips.length} successful adventures
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search destinations, countries, or activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 rounded-2xl border-4 border-black font-bold text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-1 focus:translate-y-1 transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setShowCreateGroupModal(true)}
            className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-8 py-4 rounded-xl font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 text-lg"
          >
            <Plus className="w-6 h-6" />
            CREATE GROUP
          </button>
          
          <button
            onClick={handleFindMatches}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 text-lg"
          >
            <Sparkles className="w-6 h-6" />
            FIND MY MATCHES
          </button>

          {/* Show Processing Preferences button when user is waiting for group */}
          {isProcessing && !processingGroup && (
            <button
              onClick={handleViewStatus}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-8 py-4 rounded-xl font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 text-lg animate-pulse"
            >
              <Loader2 className="w-6 h-6 animate-spin" />
              PROCESSING PREFERENCES
            </button>
          )}
        </div>

        {/* Filters Button & Tags */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            FILTERS
          </button>

          {selectedBudget !== 'all' && (
            <FilterTag
              label={`Budget: ${selectedBudget}`}
              onRemove={() => setSelectedBudget('all')}
            />
          )}
          {selectedPace !== 'all' && (
            <FilterTag label={`Pace: ${selectedPace}`} onRemove={() => setSelectedPace('all')} />
          )}
          {selectedStatus !== 'all' && (
            <FilterTag
              label={`Status: ${selectedStatus}`}
              onRemove={() => setSelectedStatus('all')}
            />
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 bg-white rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-lg font-black mb-3">BUDGET</label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-4 border-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All Budgets</option>
                  <option value="budget">Budget</option>
                  <option value="moderate">Moderate</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-black mb-3">PACE</label>
                <select
                  value={selectedPace}
                  onChange={(e) => setSelectedPace(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-4 border-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All Paces</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-black mb-3">STATUS</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-4 border-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="full">Full</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-lg font-bold text-gray-600">
            Showing {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'}
          </p>
        </div>

        {/* Blockchain Registration Pending Message */}
        {pendingGroup && !processingGroup && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-400 to-pink-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
                <h2 className="text-3xl font-black text-white">GROUP FOUND!</h2>
              </div>
              <p className="text-white text-lg font-semibold mb-2">
                🎉 We found your perfect travel match!
              </p>
              <p className="text-white/90 text-sm">
                Please complete blockchain registration to access your group
              </p>
            </div>
          </div>
        )}

        {/* Processing Trip Card (ONLY shows AFTER blockchain registration) */}
        {processingGroup && !pendingGroup && (
          <div className="mb-8">
            <h2 className="text-2xl font-black mb-4">✅ YOUR REGISTERED GROUP</h2>
            <ProcessingTripCard 
              group={processingGroup} 
              onOpenChat={handleOpenChat}
            />
          </div>
        )}

        {/* Trips Grid */}
        {filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block bg-white rounded-2xl p-12 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-2xl font-black mb-2">NO TRIPS FOUND</p>
              <p className="text-gray-600 font-semibold">Try adjusting your filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onSuccess={() => {
          alert('Group created successfully!')
          setShowCreateGroupModal(false)
        }}
      />
      
      <AgentTripModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        onSubmit={() => {
          // User submitted trip description - mark as processing
          setIsProcessing(true)
        }}
        onGroupFound={(group) => {
          console.log('🎉 Group found from modal! Checking blockchain registration...')
          
          // Check if already registered on blockchain
          const registrations = JSON.parse(localStorage.getItem('hedera_registrations') || '{}')
          const isRegistered = !!registrations[group.group_id]
          
          if (isRegistered) {
            // Already registered, show group directly
            console.log('✅ Group already registered on blockchain')
            setProcessingGroup(group)
            setIsRegisteredOnChain(true)
          } else {
            // Not registered, show blockchain modal first
            console.log('⚠️ Group not registered. Showing blockchain modal...')
            setPendingGroup(group)
            setShowBlockchainModal(true)
          }
          
          setShowAgentModal(false)
          setIsProcessing(false)
        }}
      />

      <ProcessingStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        status={processingGroup ? 'matched' : 'waiting'}
        destination={group?.destination}
      />

      {processingGroup && (
        <GroupChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          group={processingGroup}
        />
      )}

      {/* Blockchain Registration Modal */}
      {showBlockchainModal && pendingGroup && (
        <BlockchainRegistrationModal
          group={pendingGroup}
          onSuccess={handleBlockchainSuccess}
          onCancel={handleBlockchainCancel}
        />
      )}
    </div>
  )
}

function TripCard({ trip }: { trip: any }) {
  const days = calculateDays(trip.startDate, trip.endDate)
  const spotsLeft = trip.maxParticipants - trip.currentParticipants

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={trip.images[0]}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-green-400 px-3 py-1 rounded-full border-2 border-black font-black text-sm">
            COMPLETED
          </span>
        </div>
        {/* Duration Badge */}
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border-2 border-black font-black text-sm">
          {days} DAYS
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="font-bold text-sm">
            {trip.destination}, {trip.country}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-black text-xl mb-3 group-hover:text-orange-600 transition-colors">
          {trip.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {trip.tags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="bg-gray-100 px-2 py-1 rounded-lg border-2 border-black text-xs font-bold"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-black">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-bold text-sm">
                {trip.currentParticipants}/{trip.maxParticipants}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-bold text-sm">{formatDate(trip.startDate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-5 h-5 font-black" />
            <span className="font-black text-xl">{trip.totalCost}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="bg-white px-4 py-2 rounded-xl border-2 border-black flex items-center gap-2 font-bold">
      <span>{label}</span>
      <button onClick={onRemove} className="hover:text-red-500">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
