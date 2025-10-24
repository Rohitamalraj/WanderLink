'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Send, Users, MapPin, MessageSquare, ExternalLink, Copy, CheckCircle, Clock, Loader2 } from 'lucide-react'

export default function ImprovedAgentTripsPage() {
  const [userId, setUserId] = useState<string>('')
  const [tripMessage, setTripMessage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitted' | 'waiting' | 'matched'>('idle')
  const [groupData, setGroupData] = useState<any>(null)
  const [polling, setPolling] = useState(false)
  const [showGroupChat, setShowGroupChat] = useState(false)

  // Initialize user ID
  useEffect(() => {
    const storedUserId = localStorage.getItem('wanderlink_agent_user_id')
    if (!storedUserId) {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('wanderlink_agent_user_id', newUserId)
      setUserId(newUserId)
    } else {
      setUserId(storedUserId)
      // Check if user already has a group
      checkExistingGroup(storedUserId)
    }
  }, [])

  // Poll for group status
  useEffect(() => {
    if (status === 'waiting' && userId) {
      setPolling(true)
      const interval = setInterval(async () => {
        await checkGroupStatus()
      }, 3000) // Check every 3 seconds

      return () => {
        clearInterval(interval)
        setPolling(false)
      }
    }
  }, [status, userId])

  const checkExistingGroup = async (uid: string) => {
    try {
      const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000'
      const res = await fetch(`${agentServiceUrl}/api/check-group-status/${uid}`)
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'in_group' && data.group) {
          setGroupData(data)
          setStatus('matched')
        }
      }
    } catch (error) {
      console.log('No existing group found')
    }
  }

  const checkGroupStatus = async () => {
    if (!userId) return

    try {
      const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000'
      
      const res = await fetch(`${agentServiceUrl}/api/check-group-status/${userId}`)
      
      if (!res.ok) return

      const data = await res.json()
      
      if (data.status === 'in_group' && data.group) {
        console.log('🎉 Group matched!', data)
        setGroupData(data)
        setStatus('matched')
        setPolling(false)
      }
      
    } catch (error) {
      console.log('Polling error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tripMessage.trim()) {
      alert('⚠️ Please describe your trip first!')
      return
    }

    setLoading(true)

    try {
      const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000'
      
      console.log('📤 Submitting trip automatically to agents...')
      console.log('👤 User ID:', userId)
      console.log('💬 Message:', tripMessage)
      
      // Store trip preferences
      const storeRes = await fetch(`${agentServiceUrl}/api/store-user-trip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          message: tripMessage
        }),
      })
      
      if (!storeRes.ok) {
        throw new Error('Failed to store trip')
      }
      
      console.log('✅ Trip stored in database')
      
      // Now trigger the agent flow
      const submitRes = await fetch(`${agentServiceUrl}/api/submit-trip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          message: tripMessage
        }),
      })
      
      if (!submitRes.ok) {
        throw new Error('Failed to submit to agents')
      }
      
      const submitData = await submitRes.json()
      console.log('✅ Sent to agents:', submitData)
      
      // Success - agents will process automatically
      setStatus('waiting')
      setLoading(false)
      
      alert(`✅ Trip submitted successfully!

Your trip preferences have been received and are being processed by our AI agents.

You'll be automatically matched with 2 other travelers who have similar interests.

The matching usually takes a few moments. This page will update automatically when your group is ready!`)
      
    } catch (error: any) {
      console.error('❌ Error:', error)
      alert(`❌ Failed: ${error.message}`)
      setLoading(false)
    }
  }

  const exampleMessages = [
    "Varkala adventure trip, 5 days, budget friendly",
    "Beach vacation in Goa for 7 days with yoga",
    "Cultural tour of Jaipur, 4 days",
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
              <Link href="/trips" className="hidden sm:block font-bold text-lg hover:underline">
                Browse Trips
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            <Sparkles className="w-6 h-6" />
            AI AGENT POWERED - FULLY AUTOMATED
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-black mb-4">
            FIND YOUR TRAVEL GROUP
          </h1>
          
          <p className="text-xl text-gray-700 font-bold max-w-2xl mx-auto">
            Submit your trip → AI agents match you automatically → Get group chat link!
          </p>
        </div>

        {/* Status: Idle - Show Form */}
        {status === 'idle' && (
          <div className="bg-white rounded-2xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <MapPin className="w-8 h-8" />
              DESCRIBE YOUR TRIP
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-black mb-3">TRIP DESCRIPTION</label>
                <textarea
                  value={tripMessage}
                  onChange={(e) => setTripMessage(e.target.value)}
                  placeholder="E.g., Varkala adventure trip, 5 days, budget friendly"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-4 border-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">QUICK EXAMPLES:</label>
                <div className="flex flex-wrap gap-2">
                  {exampleMessages.map((example, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTripMessage(example)}
                      className="bg-gray-100 px-4 py-2 rounded-lg border-2 border-black text-sm font-bold hover:bg-gray-200"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    SUBMIT & AUTO-MATCH
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Status: Waiting - Show Progress */}
        {status === 'waiting' && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
              <h2 className="text-2xl font-black">AGENTS ARE WORKING...</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-black">✅ Travel Agent extracted your preferences</p>
                  <p className="text-sm text-gray-600">Sent to MatchMaker</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1 animate-pulse" />
                <div>
                  <p className="font-black">⏳ MatchMaker is pooling travelers...</p>
                  <p className="text-sm text-gray-600">Waiting for 3 compatible travelers (including you)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-gray-500">Planner will create your group</p>
                  <p className="text-sm text-gray-400">When group is formed</p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-xl p-4 border-2 border-black">
              <p className="font-bold text-center">
                🔄 Checking for group formation every 3 seconds...
              </p>
            </div>
          </div>
        )}

        {/* Status: Matched - Show Group Chat */}
        {status === 'matched' && groupData && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
                <h2 className="text-3xl font-black">GROUP MATCHED! 🎉</h2>
              </div>
              
              <p className="text-lg font-bold mb-4">
                You've been matched with {groupData.members?.length - 1} other traveler(s)!
              </p>
              
              <button
                onClick={() => setShowGroupChat(!showGroupChat)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                {showGroupChat ? 'HIDE' : 'OPEN'} GROUP CHAT
              </button>
            </div>

            {/* Group Chat */}
            {showGroupChat && (
              <div className="bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 border-b-4 border-black">
                  <h3 className="text-2xl font-black mb-2">{groupData.group.name}</h3>
                  <div className="flex items-center gap-4 text-sm font-bold">
                    <span>📍 {groupData.group.destination}</span>
                    <span>👥 {groupData.members?.length} members</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  {groupData.messages?.map((msg: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border-2 border-black ${
                        msg.sender_type === 'system'
                          ? 'bg-yellow-50'
                          : msg.message_type === 'itinerary'
                          ? 'bg-purple-50'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-black text-sm">
                          {msg.sender_type === 'system' ? '🤖 SYSTEM' : '✈️ PLANNER AGENT'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap font-semibold text-sm">
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input (disabled - read-only for now) */}
                <div className="p-4 border-t-4 border-black bg-gray-50">
                  <p className="text-center text-sm font-bold text-gray-500">
                    Group chat is currently read-only. Itinerary has been delivered! 🎉
                  </p>
                </div>
              </div>
            )}

            {/* Group Members */}
            <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-black mb-4">👥 GROUP MEMBERS</h3>
              <div className="space-y-2">
                {groupData.members?.map((member: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-black"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-black">Traveler {idx + 1}</p>
                      <p className="text-xs text-gray-500 font-mono">{member.user_id.substring(0, 20)}...</p>
                    </div>
                    {member.user_id === userId && (
                      <span className="ml-auto bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black">
                        YOU
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
