'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Users, Calendar, DollarSign, Filter, X, Sparkles, Plus } from 'lucide-react'
import { mockTrips } from '@/lib/mock-data'
import { formatDate, calculateDays } from '@/lib/utils'
import NLPTripModal from '@/components/NLPTripModal'
import MatchResultsModal from '@/components/MatchResultsModal'
import CreateGroupModal from '@/components/CreateGroupModal'

export default function TripsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBudget, setSelectedBudget] = useState<string>('all')
  const [selectedPace, setSelectedPace] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Join Trip Modal States
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showMatchResults, setShowMatchResults] = useState(false)
  const [matches, setMatches] = useState<any[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [userId, setUserId] = useState<string>('')
  
  // Create Group Modal State
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)

  // Initialize user (mock - in production would come from auth)
  useState(() => {
    const storedUserId = localStorage.getItem('wanderlink_user_id')
    if (!storedUserId) {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('wanderlink_user_id', newUserId)
      setUserId(newUserId)
    } else {
      setUserId(storedUserId)
    }
  })

  const handleJoinTrip = () => {
    setShowJoinModal(true)
  }

  // Handle NLP trip description submission
  const handleNLPSubmit = async (nlpInput: string) => {
    console.log('🔎 Processing NLP input for trip matching...')
    console.log('📝 User message:', nlpInput)
    
    setLoadingMatches(true)
    setShowMatchResults(true)

    try {
      // Generate a user ID directly
      const currentUserId = localStorage.getItem('wanderlink_user_id') || 
        `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      console.log('✅ Using user ID:', currentUserId)
      localStorage.setItem('wanderlink_user_id', currentUserId)
      setUserId(currentUserId)

      // Call Agent Service with NLP input
      console.log('🔎 Sending NLP input to Agent Service...')
      const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000'
      
      const matchResponse = await fetch(`${agentServiceUrl}/api/find-matches-nlp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          nlpInput: nlpInput,
          timestamp: new Date().toISOString()
        }),
      })
      
      if (!matchResponse.ok) {
        const errorData = await matchResponse.json()
        throw new Error(errorData.error || 'Failed to process your trip description')
      }
      
      const matchData = await matchResponse.json()
      console.log('📊 AI Match results:', matchData)

      if (matchData.matches && matchData.matches.length > 0) {
        console.log(`✅ Found ${matchData.matches.length} matches!`)
        setMatches(matchData.matches)
      } else {
        console.log('⚠️ No matches found')
        setMatches([])
      }
      
    } catch (error: any) {
      console.error('Error processing trip description:', error)
      alert(`Failed to find matches: ${error.message || 'Please try again.'}`)
      setMatches([])
    } finally {
      setLoadingMatches(false)
    }
  }

  const handleJoinSpecificTrip = async (groupId: string) => {
    try {
      console.log('🚀 Joining group:', groupId)
      
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join group')
      }

      console.log('✅ Successfully joined group:', data)
      alert('🎉 Successfully joined the group! Check your dashboard to see your new travel buddies.')
      
      // Close modal and refresh
      setShowMatchResults(false)
    } catch (error: any) {
      console.error('Error joining group:', error)
      alert(`Failed to join group: ${error.message}`)
    }
  }

  const handleSaveMatch = async (tripId: string) => {
    // Save match to favorites (implement later)
    alert('Trip saved to your favorites!')
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
              <button className="bg-black text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
                CONNECT WALLET
              </button>
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
            onClick={handleJoinTrip}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 text-lg"
          >
            <Sparkles className="w-6 h-6" />
            FIND MY MATCHES
          </button>
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
          // Refresh page or update UI
          alert('Group created! Now visible in Find My Matches.')
        }}
      />
      
      <NLPTripModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleNLPSubmit}
      />

      <MatchResultsModal
        isOpen={showMatchResults}
        onClose={() => setShowMatchResults(false)}
        matches={matches}
        loading={loadingMatches}
        onJoinTrip={handleJoinSpecificTrip}
        onSaveMatch={handleSaveMatch}
      />
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
