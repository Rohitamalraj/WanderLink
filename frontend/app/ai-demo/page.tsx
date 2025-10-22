'use client'

import { useState } from 'react'
import { Sparkles, Brain, CheckCircle } from 'lucide-react'
import { MatchResults } from '@/components/MatchResults'
import { AIItinerary } from '@/components/AIItinerary'
import { TripVerification } from '@/components/TripVerification'

// Mock data for demonstration
const mockMatches = [
  {
    user_id: 'user_456',
    compatibility_score: 85,
    compatibility: {
      overall_score: 85,
      destination_match: 90,
      budget_match: 80,
      activity_match: 85,
      reasoning: "Both travelers share a love for culture and food experiences. You both prefer moderate-paced trips and have overlapping budget ranges, making this an excellent match for collaborative trip planning.",
      strengths: [
        "Same destination interest (Tokyo)",
        "Similar budget range ($2000-3500)",
        "Compatible travel pace (moderate)",
        "Shared love for culture and food"
      ],
      concerns: [
        "Slightly different activity intensity preferences",
        "Different travel style (you prefer more luxury)"
      ]
    }
  },
  {
    user_id: 'user_789',
    compatibility_score: 72,
    compatibility: {
      overall_score: 72,
      destination_match: 85,
      budget_match: 65,
      activity_match: 75,
      reasoning: "Good compatibility with shared interest in adventure activities. Budget ranges differ slightly but overlap enough for joint planning. Both enjoy outdoor experiences.",
      strengths: [
        "Both interested in adventure activities",
        "Similar age ranges",
        "Flexible with dates"
      ],
      concerns: [
        "Budget mismatch may require compromise",
        "Different accommodation preferences"
      ]
    }
  }
]

const mockItinerary = [
  {
    day: 1,
    title: "Day 1 - Arrival & Tokyo Orientation",
    activities: [
      "Morning: Arrive at Narita Airport, take Narita Express to Shibuya (¥3,190)",
      "Afternoon: Check into hotel and rest from jet lag",
      "Late afternoon: Explore Shibuya Crossing and Hachiko Statue",
      "Evening: Dinner at Ichiran Ramen (¥1,000) and walk through Shibuya nightlife",
      "Night: Convenience store run for essentials (¥500)"
    ],
    budget_range: "$120-$180"
  },
  {
    day: 2,
    title: "Day 2 - Traditional Tokyo Culture",
    activities: [
      "Early morning: Visit Senso-ji Temple in Asakusa (free entry)",
      "Mid-morning: Explore Nakamise Shopping Street for souvenirs",
      "Lunch: Traditional tempura lunch at Daikokuya (¥1,500)",
      "Afternoon: Visit the Tokyo National Museum (¥1,000)",
      "Evening: Dinner cruise on Sumida River (¥8,000)",
      "Night: Relax at hotel or explore local izakaya"
    ],
    budget_range: "$130-$170"
  },
  {
    day: 3,
    title: "Day 3 - Modern Tokyo & Technology",
    activities: [
      "Morning: Explore Akihabara electronics district",
      "Lunch: Sushi at Sushi Zanmai (¥2,000)",
      "Afternoon: Visit teamLab Borderless digital art museum (¥3,200)",
      "Late afternoon: Shopping in Ginza district",
      "Evening: Dinner at Robot Restaurant in Shinjuku (¥8,000 including show)",
      "Night: Karaoke session with locals (¥1,500)"
    ],
    budget_range: "$140-$190"
  }
]

const mockRecommendations = [
  "Buy a 7-day JR Pass for ¥29,650 to save on transportation",
  "Download Google Translate offline for easier navigation",
  "Visit Tsukiji Outer Market early morning for fresh seafood breakfast",
  "Book TeamLab Borderless tickets in advance to avoid sold-out dates",
  "Carry cash as many small restaurants don't accept cards",
  "Try convenience store food - it's surprisingly good and cheap"
]

export default function AIDemo() {
  const [activeTab, setActiveTab] = useState<'matches' | 'itinerary' | 'verification'>('matches')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMatches, setGeneratedMatches] = useState<any[]>([])
  const [generatedItinerary, setGeneratedItinerary] = useState<any[]>([])

  const handleGenerateMatches = async () => {
    setIsGenerating(true)
    
    // Simulate API call
    setTimeout(() => {
      setGeneratedMatches(mockMatches)
      setIsGenerating(false)
    }, 2000)
  }

  const handleGenerateItinerary = async () => {
    setIsGenerating(true)
    
    // Call real API
    try {
      const response = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: 'Tokyo',
          num_days: 7,
          interests: ['culture', 'food', 'technology'],
          budget_per_day: 150,
          pace: 'moderate',
          user_id: 'demo_user'
        })
      })
      
      const data = await response.json()
      setGeneratedItinerary(data.itinerary || mockItinerary)
    } catch (error) {
      console.error('Failed to generate itinerary:', error)
      setGeneratedItinerary(mockItinerary)
    }
    
    setIsGenerating(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered by ASI:One
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            WanderLink AI Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience intelligent travel matching, AI-generated itineraries, and trip verification powered by ASI:One and GPT-4o Vision
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'matches'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            AI Matching
          </button>
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'itinerary'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Brain className="w-4 h-4 inline mr-2" />
            AI Itinerary
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'verification'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            AI Verification
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeTab === 'matches' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">AI-Powered Travel Matching</h2>
                <p className="text-gray-600 mb-6">
                  ASI:One analyzes compatibility across destinations, budgets, and activities
                </p>
                {generatedMatches.length === 0 && (
                  <button
                    onClick={handleGenerateMatches}
                    disabled={isGenerating}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isGenerating ? 'Finding Matches...' : 'Find AI Matches'}
                  </button>
                )}
              </div>
              
              <MatchResults 
                matches={generatedMatches.length > 0 ? generatedMatches : mockMatches} 
                asiPowered={true}
                loading={isGenerating}
              />
            </div>
          )}

          {activeTab === 'itinerary' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">AI-Generated Itinerary</h2>
                <p className="text-gray-600 mb-6">
                  Personalized day-by-day travel plans powered by ASI:One
                </p>
                <button
                  onClick={handleGenerateItinerary}
                  disabled={isGenerating}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isGenerating ? 'Generating Itinerary...' : 'Generate New Itinerary'}
                </button>
              </div>
              
              <AIItinerary 
                itinerary={generatedItinerary.length > 0 ? generatedItinerary : mockItinerary}
                asiPowered={true}
                recommendations={mockRecommendations}
                estimatedCost="$900-$1,300"
                loading={isGenerating}
              />
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">AI Trip Verification</h2>
                <p className="text-gray-600">
                  GPT-4o Vision verifies trip completion with intelligent image analysis
                </p>
              </div>
              
              <TripVerification
                tripId="demo_trip_123"
                userId="demo_user"
                destination="Tokyo"
                onVerificationComplete={(result) => {
                  console.log('Verification complete:', result)
                }}
              />
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">ASI:One Matching</h3>
            <p className="text-sm text-gray-600">
              Advanced AI analyzes compatibility across multiple dimensions with detailed reasoning
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Smart Itineraries</h3>
            <p className="text-sm text-gray-600">
              Personalized travel plans generated by AI based on your preferences and budget
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Vision Verification</h3>
            <p className="text-sm text-gray-600">
              GPT-4o Vision validates trip completion with confidence scoring and reasoning
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
