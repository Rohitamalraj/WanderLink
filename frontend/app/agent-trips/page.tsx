'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Send, Users, MapPin, ExternalLink, Copy, CheckCircle } from 'lucide-react'

export default function AgentTripsPage() {
  const [userId, setUserId] = useState<string>('')
  const [tripMessage, setTripMessage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  // Initialize user ID
  useEffect(() => {
    const storedUserId = localStorage.getItem('wanderlink_agent_user_id')
    if (!storedUserId) {
      const newUserId = `agent1q${Math.random().toString(36).substr(2, 9)}${Date.now().toString(36)}`
      localStorage.setItem('wanderlink_agent_user_id', newUserId)
      setUserId(newUserId)
    } else {
      setUserId(storedUserId)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tripMessage.trim()) {
      alert('⚠️ Please describe your trip first!')
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000'
      
      console.log('📤 Submitting trip to agent service...')
      console.log('👤 User ID:', userId)
      console.log('💬 Message:', tripMessage)
      
      const res = await fetch(`${agentServiceUrl}/api/submit-trip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          message: tripMessage
        }),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Network error' }))
        throw new Error(errorData.detail || 'Failed to submit trip')
      }
      
      const data = await res.json()
      console.log('✅ Response:', data)
      
      setResponse(data)
      
    } catch (error: any) {
      console.error('❌ Error:', error)
      alert(`❌ Failed to submit trip: ${error.message}\n\nMake sure the agent service is running on http://localhost:8000`)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exampleMessages = [
    "Varkala adventure trip, 5 days, budget friendly",
    "Beach vacation in Goa for 7 days with yoga and relaxation",
    "Cultural tour of Jaipur, 4 days, moderate budget",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="border-b-4 border-black bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-black">
              WANDERLINK
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/trips"
                className="hidden sm:block font-bold text-lg hover:underline"
              >
                Browse Trips
              </Link>
              <Link
                href="/dashboard"
                className="hidden sm:block font-bold text-lg hover:underline"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            <Sparkles className="w-6 h-6" />
            AI AGENT POWERED
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-black mb-4">
            FIND YOUR TRAVEL GROUP
          </h1>
          
          <p className="text-xl text-gray-700 font-bold max-w-2xl mx-auto">
            Describe your dream trip in natural language. Our AI agents will match you with compatible travelers and create a custom itinerary!
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-12">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Users className="w-8 h-8" />
            HOW IT WORKS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              number="1"
              title="Describe Your Trip"
              description="Tell us where you want to go, budget, duration, and interests"
              icon="💬"
            />
            <StepCard
              number="2"
              title="AI Agents Match You"
              description="Our agents pool 3 travelers with similar preferences"
              icon="🤖"
            />
            <StepCard
              number="3"
              title="Get Your Itinerary"
              description="Receive a custom group itinerary in Agentverse chat"
              icon="✈️"
            />
          </div>
        </div>

        {/* Trip Form */}
        <div className="bg-white rounded-2xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <MapPin className="w-8 h-8" />
            DESCRIBE YOUR TRIP
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID Display */}
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-black">
              <label className="block text-sm font-bold mb-2">YOUR AGENT ID</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-4 py-2 rounded-lg border-2 border-black font-mono text-sm truncate">
                  {userId}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(userId)}
                  className="bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition"
                >
                  {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Trip Message */}
            <div>
              <label className="block text-lg font-black mb-3">TRIP DESCRIPTION</label>
              <textarea
                value={tripMessage}
                onChange={(e) => setTripMessage(e.target.value)}
                placeholder="E.g., Varkala adventure trip, 5 days, budget friendly with beach activities"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-4 border-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Example Messages */}
            <div>
              <label className="block text-sm font-bold mb-2">QUICK EXAMPLES:</label>
              <div className="flex flex-wrap gap-2">
                {exampleMessages.map((example, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTripMessage(example)}
                    className="bg-gray-100 px-4 py-2 rounded-lg border-2 border-black text-sm font-bold hover:bg-gray-200 transition"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  PROCESSING...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  FIND MY GROUP
                </>
              )}
            </button>
          </form>
        </div>

        {/* Response Section */}
        {response && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-black">SUCCESS! NEXT STEPS:</h2>
            </div>
            
            {/* Chat URL */}
            <div className="bg-white rounded-xl p-6 border-4 border-black mb-6">
              <h3 className="text-lg font-black mb-3">1. CHAT WITH TRAVEL AGENT</h3>
              <a
                href={response.agentverse_chat_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all inline-flex items-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                OPEN AGENTVERSE CHAT
              </a>
              <p className="text-sm text-gray-600 font-bold mt-3">
                Click above to open Agentverse and chat with the Travel Agent
              </p>
            </div>

            {/* Message to Send */}
            <div className="bg-white rounded-xl p-6 border-4 border-black mb-6">
              <h3 className="text-lg font-black mb-3">2. SEND THIS MESSAGE</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border-2 border-black font-mono text-sm">
                  {tripMessage}
                </code>
                <button
                  onClick={() => copyToClipboard(tripMessage)}
                  className="bg-black text-white px-4 py-3 rounded-lg font-bold hover:bg-gray-800 transition"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Flow */}
            <div className="bg-white rounded-xl p-6 border-4 border-black">
              <h3 className="text-lg font-black mb-4">3. AUTOMATED AGENT FLOW</h3>
              <div className="space-y-3">
                {response.instructions?.slice(2).map((instruction: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="font-bold text-gray-700">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-yellow-50 rounded-2xl p-6 border-4 border-black">
          <h3 className="text-lg font-black mb-3">📌 IMPORTANT NOTES</h3>
          <ul className="space-y-2 font-bold text-gray-700">
            <li>• You need to chat with the agent on <strong>Agentverse</strong> (not here)</li>
            <li>• Groups form when <strong>3 travelers</strong> have similar preferences</li>
            <li>• You'll receive your itinerary <strong>in the Agentverse chat</strong></li>
            <li>• The process is <strong>fully automated</strong> by AI agents</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function StepCard({ number, title, description, icon }: any) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border-4 border-black text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl mx-auto mb-3">
        {number}
      </div>
      <h3 className="text-lg font-black mb-2">{title}</h3>
      <p className="text-sm font-semibold text-gray-600">{description}</p>
    </div>
  )
}
