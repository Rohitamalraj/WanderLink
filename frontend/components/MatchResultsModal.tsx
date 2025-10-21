'use client'

import { X, MapPin, Users, Calendar, DollarSign, Heart, Send } from 'lucide-react'
import { useState } from 'react'

interface Match {
  trip_id: string
  trip: {
    title: string
    destination: string
    host: {
      name: string
      avatar: string
      rating: number
      trips_hosted: number
    }
    dates: {
      start: string
      end: string
    }
    price: number
    group_size: {
      current: number
      max: number
    }
    interests: string[]
    pace: string
    description: string
  }
  compatibility_score: number
  compatibility: {
    interests: number
    budget: number
    pace: number
    destination: number
    overall: number
  }
}

interface MatchResultsModalProps {
  isOpen: boolean
  onClose: () => void
  matches: Match[]
  loading?: boolean
  onJoinTrip: (tripId: string) => void
  onSaveMatch: (tripId: string) => void
}

export default function MatchResultsModal({
  isOpen,
  onClose,
  matches,
  loading,
  onJoinTrip,
  onSaveMatch,
}: MatchResultsModalProps) {
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null)

  if (!isOpen) return null

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-400'
    if (score >= 60) return 'bg-yellow-400'
    return 'bg-orange-400'
  }

  const getCompatibilityText = (score: number) => {
    if (score >= 80) return 'Excellent Match!'
    if (score >= 60) return 'Good Match'
    return 'Potential Match'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 border-b-4 border-black p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-black">🎯 YOUR MATCHES</h2>
              <p className="text-black font-bold mt-1">
                Found {matches.length} {matches.length === 1 ? 'trip' : 'trips'} perfect for you!
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 border-2 border-black bg-white hover:bg-red-400 transition-colors"
            >
              <X size={24} className="text-black" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-black border-t-blue-400 rounded-full animate-spin mb-4" />
              <p className="text-xl font-black text-black">Finding your perfect matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl font-black text-black mb-4">No matches found</p>
              <p className="text-gray-700 font-bold">
                Try adjusting your preferences or check back later for new trips!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <div
                  key={match.trip_id}
                  className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                >
                  {/* Match Header */}
                  <div className="p-6 bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-2xl font-black text-black">{match.trip.title}</h3>
                          <div
                            className={`px-4 py-1 ${getCompatibilityColor(
                              match.compatibility_score
                            )} border-2 border-black font-black text-sm`}
                          >
                            {match.compatibility_score}% {getCompatibilityText(match.compatibility_score)}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-700">
                          <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            {match.trip.destination}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            {match.trip.dates.start} → {match.trip.dates.end}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} />
                            ${match.trip.price}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={16} />
                            {match.trip.group_size.current}/{match.trip.group_size.max} travelers
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onSaveMatch(match.trip_id)}
                          className="p-3 bg-pink-300 border-2 border-black hover:bg-pink-400 transition-colors"
                          title="Save to favorites"
                        >
                          <Heart size={20} />
                        </button>
                        <button
                          onClick={() => onJoinTrip(match.trip_id)}
                          className="px-6 py-3 bg-green-400 border-2 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
                        >
                          <Send size={18} />
                          JOIN TRIP
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Breakdown */}
                  <div className="px-6 py-4 bg-gray-50 border-t-4 border-black">
                    <p className="font-black text-black mb-3">COMPATIBILITY BREAKDOWN:</p>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: 'Interests', value: match.compatibility.interests },
                        { label: 'Budget', value: match.compatibility.budget },
                        { label: 'Pace', value: match.compatibility.pace },
                        { label: 'Destination', value: match.compatibility.destination },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold">{label}</span>
                            <span className="text-sm font-black">{Math.round(value * 100)}%</span>
                          </div>
                          <div className="h-2 bg-gray-300 border-2 border-black">
                            <div
                              className={`h-full ${
                                value >= 0.8 ? 'bg-green-500' : value >= 0.5 ? 'bg-yellow-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trip Details (Expandable) */}
                  <div className="border-t-4 border-black">
                    <button
                      onClick={() => setExpandedTrip(expandedTrip === match.trip_id ? null : match.trip_id)}
                      className="w-full p-4 bg-white hover:bg-gray-100 font-black text-left transition-colors"
                    >
                      {expandedTrip === match.trip_id ? '▼' : '▶'} VIEW DETAILS
                    </button>

                    {expandedTrip === match.trip_id && (
                      <div className="p-6 bg-white border-t-4 border-black space-y-4">
                        {/* Host Info */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-black">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-black flex items-center justify-center">
                            <span className="text-2xl font-black text-white">
                              {match.trip.host.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-black text-black">{match.trip.host.name}</p>
                            <p className="text-sm font-bold text-gray-700">
                              ⭐ {match.trip.host.rating} • {match.trip.host.trips_hosted} trips hosted
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <p className="font-black text-black mb-2">ABOUT THIS TRIP:</p>
                          <p className="text-gray-700 font-bold">{match.trip.description}</p>
                        </div>

                        {/* Interests */}
                        <div>
                          <p className="font-black text-black mb-2">ACTIVITIES & INTERESTS:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.trip.interests.map((interest) => (
                              <span
                                key={interest}
                                className="px-3 py-1 bg-blue-300 border-2 border-black font-bold text-sm uppercase"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Travel Pace */}
                        <div>
                          <p className="font-black text-black mb-2">TRAVEL PACE:</p>
                          <span className="px-4 py-2 bg-purple-300 border-2 border-black font-bold uppercase">
                            {match.trip.pace}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && matches.length > 0 && (
          <div className="sticky bottom-0 bg-gray-100 border-t-4 border-black p-6 text-center">
            <p className="font-bold text-gray-700">
              💡 <span className="font-black">Pro Tip:</span> Higher compatibility scores mean better matches with
              your preferences!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
