'use client'

import { useState } from 'react'
import { Sparkles, Users, Calendar, DollarSign, Loader2, TrendingUp, MapPin } from 'lucide-react'

interface MatchFinderProps {
  destination: string
  startDate: string
  endDate: string
  budget: number
  interests: string[]
  pace: 'relaxed' | 'moderate' | 'active'
  ageRange: [number, number]
}

interface Match {
  userId: string
  name: string
  avatar: string
  synergy: number
  commonInterests: string[]
  reason: string
  compatibility: {
    destination: number
    dates: number
    budget: number
    activities: number
    style: number
  }
}

export default function AiMatchFinder({
  destination,
  startDate,
  endDate,
  budget,
  interests,
  pace,
  ageRange,
}: MatchFinderProps) {
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string>('')

  const findMatches = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          dates: { start: startDate, end: endDate },
          budget,
          interests,
          pace,
          age_range: ageRange,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to find matches')
      }

      const data = await response.json()
      setMatches(data.matches || [])
    } catch (err) {
      setError('Failed to find matches. Please try again.')
      console.error('Match error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            AI MATCH FINDER
          </h3>
          <p className="text-sm font-semibold text-gray-600 mt-1">
            Find your perfect travel companions using AI
          </p>
        </div>
        <button
          onClick={findMatches}
          disabled={loading}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              FINDING...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              FIND MATCHES
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border-4 border-red-500 rounded-xl p-4">
          <p className="font-bold text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-16 h-16 animate-spin text-orange-500 mb-4" />
          <p className="text-lg font-bold text-gray-600">
            🤖 AI is analyzing compatibility...
          </p>
        </div>
      )}

      {/* Matches Grid */}
      {!loading && matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-600">
              Found {matches.length} highly compatible travelers
            </p>
            <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full border-2 border-black">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-black text-green-600">
                {Math.round(matches.reduce((acc, m) => acc + m.synergy, 0) / matches.length)}% Avg
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {matches.map((match, index) => (
              <MatchCard key={match.userId} match={match} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && matches.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-bold text-gray-400">
            Click "Find Matches" to discover compatible travelers
          </p>
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, rank }: { match: Match; rank: number }) {
  const [expanded, setExpanded] = useState(false)

  const synergyColor =
    match.synergy >= 85
      ? 'from-green-400 to-emerald-500'
      : match.synergy >= 70
      ? 'from-yellow-400 to-orange-500'
      : 'from-orange-400 to-red-500'

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
      <div className="flex items-start gap-4">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-black text-white rounded-xl border-2 border-black flex items-center justify-center font-black text-xl">
            #{rank}
          </div>
        </div>

        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={match.avatar}
            alt={match.name}
            className="w-16 h-16 rounded-xl border-4 border-black object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-xl font-black">{match.name}</h4>
            <div
              className={`bg-gradient-to-r ${synergyColor} px-3 py-1 rounded-full border-2 border-black`}
            >
              <span className="text-sm font-black text-white">{match.synergy}% MATCH</span>
            </div>
          </div>

          <p className="text-sm font-semibold text-gray-600 mb-3">{match.reason}</p>

          {/* Common Interests */}
          {match.commonInterests.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {match.commonInterests.map((interest) => (
                <span
                  key={interest}
                  className="bg-purple-100 px-2 py-1 rounded-lg border-2 border-black text-xs font-bold"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* Toggle Details */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-bold text-orange-600 hover:underline"
          >
            {expanded ? 'Hide Details' : 'Show Compatibility Details →'}
          </button>

          {/* Expanded Details */}
          {expanded && (
            <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-2">
              <CompatibilityBar
                label="Destination"
                value={match.compatibility.destination}
                icon={<MapPin className="w-4 h-4" />}
              />
              <CompatibilityBar
                label="Dates"
                value={match.compatibility.dates}
                icon={<Calendar className="w-4 h-4" />}
              />
              <CompatibilityBar
                label="Budget"
                value={match.compatibility.budget}
                icon={<DollarSign className="w-4 h-4" />}
              />
              <CompatibilityBar
                label="Activities"
                value={match.compatibility.activities}
                icon={<Users className="w-4 h-4" />}
              />
              <CompatibilityBar
                label="Travel Style"
                value={match.compatibility.style}
                icon={<Sparkles className="w-4 h-4" />}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CompatibilityBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const percentage = Math.round(value * 100)
  const barColor =
    percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-orange-500'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-bold">{label}</span>
        </div>
        <span className="text-sm font-black">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
