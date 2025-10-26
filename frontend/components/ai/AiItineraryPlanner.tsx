'use client'

import { useState } from 'react'
import { MapPin, Calendar, DollarSign, Loader2, Sparkles, Clock } from 'lucide-react'

interface ItineraryPlannerProps {
  destination: string
  numDays: number
  interests: string[]
  budgetPerDay: number
  pace: 'relaxed' | 'moderate' | 'packed'
}

interface DayPlan {
  day: number
  title: string
  activities: string[]
  budget_range: string
}

interface ItineraryResponse {
  itinerary: DayPlan[]
  recommendations: string[]
  estimated_cost: string
}

export default function AiItineraryPlanner({
  destination,
  numDays,
  interests,
  budgetPerDay,
  pace,
}: ItineraryPlannerProps) {
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null)
  const [error, setError] = useState<string>('')

  const generateItinerary = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          num_days: numDays,
          interests,
          budget_per_day: budgetPerDay,
          pace,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate itinerary')
      }

      const data = await response.json()
      setItinerary(data)
    } catch (err) {
      setError('Failed to generate itinerary. Please try again.')
      console.error('Itinerary error:', err)
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
            <MapPin className="w-6 h-6 text-purple-500" />
            AI ITINERARY PLANNER
          </h3>
          <p className="text-sm font-semibold text-gray-600 mt-1">
            Get a personalized day-by-day plan powered by Gemini AI
          </p>
        </div>
        <button
          onClick={generateItinerary}
          disabled={loading}
          className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              GENERATING...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              GENERATE PLAN
            </>
          )}
        </button>
      </div>

      {/* Trip Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-bold text-gray-600">DESTINATION</span>
          </div>
          <p className="font-black text-lg">{destination}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold text-gray-600">DURATION</span>
          </div>
          <p className="font-black text-lg">{numDays} Days</p>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-bold text-gray-600">BUDGET/DAY</span>
          </div>
          <p className="font-black text-lg">${budgetPerDay}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold text-gray-600">PACE</span>
          </div>
          <p className="font-black text-lg capitalize">{pace}</p>
        </div>
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
          <Loader2 className="w-16 h-16 animate-spin text-purple-500 mb-4" />
          <p className="text-lg font-bold text-gray-600">
            🤖 Gemini AI is creating your perfect itinerary...
          </p>
        </div>
      )}

      {/* Itinerary Display */}
      {!loading && itinerary && (
        <div className="space-y-6">
          {/* Cost Summary */}
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-5 border-4 border-black text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold opacity-90">ESTIMATED TOTAL COST</p>
                <p className="text-3xl font-black">{itinerary.estimated_cost}</p>
              </div>
              <DollarSign className="w-12 h-12 opacity-50" />
            </div>
          </div>

          {/* Daily Itinerary */}
          <div className="space-y-4">
            <h4 className="text-xl font-black">DAY-BY-DAY PLAN</h4>
            {itinerary.itinerary.map((day) => (
              <DayCard key={day.day} day={day} />
            ))}
          </div>

          {/* Recommendations */}
          {itinerary.recommendations && itinerary.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border-4 border-black">
              <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                TRAVEL TIPS & RECOMMENDATIONS
              </h4>
              <ul className="space-y-2">
                {itinerary.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="font-black text-orange-600">•</span>
                    <span className="font-semibold text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !itinerary && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-bold text-gray-400">
            Click "Generate Plan" to create your personalized itinerary
          </p>
        </div>
      )}
    </div>
  )
}

function DayCard({ day }: { day: DayPlan }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-start gap-4">
        {/* Day Number Badge */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl border-4 border-black flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            {day.day}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h5 className="text-lg font-black">{day.title}</h5>
            <div className="bg-white px-3 py-1 rounded-full border-2 border-black">
              <span className="text-sm font-bold">{day.budget_range}</span>
            </div>
          </div>

          {/* Activities */}
          <ul className="space-y-2">
            {day.activities.map((activity, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="font-black text-purple-600 mt-1">→</span>
                <span className="font-semibold text-gray-700">{activity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
