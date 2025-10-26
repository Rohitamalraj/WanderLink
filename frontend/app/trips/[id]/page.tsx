'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Shield,
  ArrowLeft,
  Check,
  Sparkles,
  Heart,
  Share2,
  ChevronRight,
} from 'lucide-react'
import { mockTrips, mockUsers } from '@/lib/offchain-mdata'
import { formatDate, calculateDays } from '@/lib/utils'
import AiMatchFinder from '@/components/ai/AiMatchFinder'
import AiItineraryPlanner from '@/components/ai/AiItineraryPlanner'

export default function TripDetailPage() {
  const params = useParams()
  const tripId = params.id as string

  const trip = mockTrips.find((t) => t.id === tripId)
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-match' | 'ai-plan'>('overview')

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <h1 className="text-4xl font-black mb-4">TRIP NOT FOUND</h1>
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            BACK TO TRIPS
          </Link>
        </div>
      </div>
    )
  }

  const days = calculateDays(trip.startDate, trip.endDate)
  const spotsLeft = trip.maxParticipants - trip.currentParticipants

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <div className="border-b-4 border-black bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/trips"
              className="flex items-center gap-2 text-lg font-black hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              BACK TO TRIPS
            </Link>
            <div className="flex items-center gap-3">
              <button className="p-3 hover:bg-gray-100 rounded-xl border-2 border-black transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-3 hover:bg-gray-100 rounded-xl border-2 border-black transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image Gallery */}
            <div className="rounded-2xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="relative h-96">
                <img
                  src={trip.images[0]}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
                {/* Status Badge */}
                <div className="absolute top-6 left-6">
                  {trip.status === 'full' ? (
                    <span className="bg-yellow-400 px-4 py-2 rounded-full border-2 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      FULL
                    </span>
                  ) : (
                    <span className="bg-green-400 px-4 py-2 rounded-full border-2 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {spotsLeft} SPOTS LEFT
                    </span>
                  )}
                </div>
              </div>
              {trip.images.length > 1 && (
                <div className="grid grid-cols-3 gap-1 bg-black p-1">
                  {trip.images.slice(1).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${trip.title} ${idx + 2}`}
                      className="w-full h-32 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Trip Title & Location */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5" />
                <span className="font-bold text-lg">
                  {trip.destination}, {trip.country}
                </span>
              </div>
              <h1 className="text-5xl font-black mb-4">{trip.title}</h1>
              <div className="flex flex-wrap gap-2">
                {trip.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-purple-100 px-3 py-1 rounded-lg border-2 border-black text-sm font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl p-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex gap-2">
                <TabButton
                  active={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                >
                  OVERVIEW
                </TabButton>
                <TabButton
                  active={activeTab === 'ai-match'}
                  onClick={() => setActiveTab('ai-match')}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  AI MATCHING
                </TabButton>
                <TabButton
                  active={activeTab === 'ai-plan'}
                  onClick={() => setActiveTab('ai-plan')}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  AI PLANNER
                </TabButton>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-2xl font-black mb-4">ABOUT THIS TRIP</h2>
                  <p className="text-gray-700 font-semibold text-lg leading-relaxed">
                    {trip.description}
                  </p>
                </div>

                {/* Itinerary */}
                <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-2xl font-black mb-4">ITINERARY</h2>
                  <div className="space-y-3">
                    {trip.itinerary.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border-2 border-black"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-black">
                          {idx + 1}
                        </div>
                        <p className="font-semibold text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trip Preferences */}
                <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-2xl font-black mb-4">TRIP VIBE</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <PreferenceCard
                      label="Age Range"
                      value={`${trip.preferences.ageRange[0]}-${trip.preferences.ageRange[1]}`}
                    />
                    <PreferenceCard label="Budget" value={trip.preferences.budget} />
                    <PreferenceCard label="Pace" value={trip.preferences.pace} />
                    <PreferenceCard
                      label="Interests"
                      value={`${trip.preferences.interests.length} types`}
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-bold text-gray-600 mb-2">VIBE KEYWORDS</p>
                    <div className="flex flex-wrap gap-2">
                      {trip.preferences.vibe.map((v) => (
                        <span
                          key={v}
                          className="bg-pink-100 px-3 py-1 rounded-lg border-2 border-black text-sm font-bold"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-2xl font-black mb-4">
                    WHO'S GOING ({trip.currentParticipants}/{trip.maxParticipants})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trip.participants.map((participant) => (
                      <ParticipantCard
                        key={participant.id}
                        participant={participant}
                        isHost={participant.id === trip.host.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai-match' && (
              <AiMatchFinder
                destination={trip.destination}
                startDate={trip.startDate}
                endDate={trip.endDate}
                budget={parseFloat(trip.totalCost) / days}
                interests={trip.preferences.interests}
                pace={trip.preferences.pace}
                ageRange={trip.preferences.ageRange}
              />
            )}

            {activeTab === 'ai-plan' && (
              <AiItineraryPlanner
                destination={trip.destination}
                numDays={days}
                interests={trip.preferences.interests}
                budgetPerDay={parseFloat(trip.totalCost) / days}
                pace={trip.preferences.pace}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black">${trip.totalCost}</span>
                    <span className="text-gray-600 font-bold">/ person</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-600">
                    ${trip.depositAmount} ETH deposit required
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-3 border-b-2 border-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-bold">Dates</span>
                    </div>
                    <span className="font-black">{days} days</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b-2 border-gray-200">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="font-bold">Group Size</span>
                    </div>
                    <span className="font-black">
                      {trip.currentParticipants}/{trip.maxParticipants}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-bold">Escrow</span>
                    </div>
                    <Check className="w-5 h-5 text-green-600 font-black" />
                  </div>
                </div>

                <button
                  disabled={trip.status === 'full'}
                  className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {trip.status === 'full' ? 'TRIP FULL' : 'BOOK NOW'}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-xs font-bold text-gray-500">
                    💎 Powered by blockchain escrow
                  </p>
                </div>
              </div>

              {/* Host Card */}
              <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg font-black mb-4">HOSTED BY</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={trip.host.avatar}
                    alt={trip.host.name}
                    className="w-16 h-16 rounded-xl border-4 border-black object-cover"
                  />
                  <div>
                    <p className="font-black text-lg">{trip.host.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="bg-green-100 px-2 py-0.5 rounded-full border-2 border-black">
                        <span className="text-xs font-bold text-green-700">
                          {trip.host.reputation}% Rep
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-4">{trip.host.bio}</p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-gray-50 rounded-xl p-3 border-2 border-black">
                    <p className="text-2xl font-black">{trip.host.tripsHosted}</p>
                    <p className="text-xs font-bold text-gray-600">Hosted</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border-2 border-black">
                    <p className="text-2xl font-black">{trip.host.tripsJoined}</p>
                    <p className="text-xs font-bold text-gray-600">Joined</p>
                  </div>
                </div>
              </div>

              {/* Safety Features */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  SAFETY FEATURES
                </h3>
                <ul className="space-y-3">
                  <SafetyFeature text="Smart contract escrow protection" />
                  <SafetyFeature text="WorldID verified travelers" />
                  <SafetyFeature text="Host reputation system" />
                  <SafetyFeature text="24/7 support" />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-6 py-3 rounded-xl font-black border-4 border-black transition-all flex items-center justify-center gap-2 ${
        active
          ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
          : 'bg-white text-black hover:bg-gray-100'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function PreferenceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border-2 border-black">
      <p className="text-xs font-bold text-gray-600 mb-1">{label}</p>
      <p className="font-black text-lg capitalize">{value}</p>
    </div>
  )
}

function ParticipantCard({
  participant,
  isHost,
}: {
  participant: typeof mockUsers[0]
  isHost: boolean
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-black">
      <img
        src={participant.avatar}
        alt={participant.name}
        className="w-12 h-12 rounded-lg border-2 border-black object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-black truncate">{participant.name}</p>
          {isHost && (
            <span className="bg-yellow-400 px-2 py-0.5 rounded-full border-2 border-black text-xs font-bold">
              HOST
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {participant.verifications.includes('WorldID') && (
            <span className="text-xs font-bold text-green-600">✓ WorldID</span>
          )}
          {participant.verifications.includes('KYC') && (
            <span className="text-xs font-bold text-blue-600">✓ KYC</span>
          )}
        </div>
      </div>
    </div>
  )
}

function SafetyFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
      <span className="font-semibold text-sm">{text}</span>
    </li>
  )
}
