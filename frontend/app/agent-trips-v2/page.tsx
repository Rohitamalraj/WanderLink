'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Send, Users, MapPin, MessageSquare, ExternalLink, Copy, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { useGroupStatus } from '@/hooks/useGroupStatus'
import { AgentGroup } from '@/lib/supabase'

export default function ImprovedAgentTripsPage() {
  const [userId, setUserId] = useState<string>('')
  const [tripMessage, setTripMessage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitted' | 'waiting' | 'matched'>('idle')
  const [showGroupChat, setShowGroupChat] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [groupFound, setGroupFound] = useState<AgentGroup | null>(null)

  // Use the working group status hook
  const { group, inGroup, loading: groupLoading } = useGroupStatus({
    userId,
    enabled: status === 'waiting',
    pollInterval: 5000,
    onGroupFound: (group) => {
      console.log('🎉 Group found!', group)
      setGroupFound(group)
      setStatus('matched')
    }
  })

  // Initialize user ID
  useEffect(() => {
    const storedUserId = localStorage.getItem('wanderlink_agent_user_id')
    if (!storedUserId) {
      const newUserId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('wanderlink_agent_user_id', newUserId)
      setUserId(newUserId)
    } else {
      setUserId(storedUserId)
    }
  }, [])

  // Check if group was found
  useEffect(() => {
    if (inGroup && group) {
      setGroupFound(group)
      setStatus('matched')
    }
  }, [inGroup, group])

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    const el = document.querySelector('.group-messages-scroll') as HTMLElement | null
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tripMessage.trim()) {
      alert('⚠️ Please describe your trip first!')
      return
    }

    if (!userId) {
      alert('⚠️ User ID not initialized. Please refresh the page.')
      return
    }

    setLoading(true)

    try {
      console.log('📤 Sending to Travel Agent...')
      console.log('👤 User ID:', userId)
      console.log('💬 Message:', tripMessage)
      
      // Send directly to Travel Agent via new API
      const res = await fetch('/api/agent-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: tripMessage,
          userId: userId,
          agentType: 'travel' // Start with Travel Agent
        }),
      })

      console.log('📥 Response status:', res.status)

      if (!res.ok) {
        throw new Error('Failed to send message to agent')
      }

      const data = await res.json()
      console.log('✅ Agent response:', data)

      if (data.success) {
        // Success - start polling for group
        setStatus('waiting')
        setLoading(false)
        
        alert(`✅ Trip submitted successfully!

${data.response}

You'll be automatically matched with 2 other travelers.

This page will update automatically when your group is ready!`)
      } else {
        throw new Error(data.error || 'Agent communication failed')
      }
      
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
        {status === 'matched' && groupFound && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
                <h2 className="text-3xl font-black">GROUP MATCHED! 🎉</h2>
              </div>
              
              <p className="text-lg font-bold mb-4">
                You've been matched with {(groupFound?.member_count || 1) - 1} other traveler(s)!
              </p>
              
              <div className="bg-white rounded-xl p-4 border-2 border-black mb-4">
                <p className="font-bold">📍 Destination: {groupFound?.destination}</p>
                <p className="text-sm text-gray-600 mt-1">Group ID: {groupFound?.group_id?.substring(0, 16)}...</p>
              </div>
              
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
                  <h3 className="text-2xl font-black mb-2">🌍 {groupFound?.destination} Travel Group</h3>
                  <div className="flex items-center gap-4 text-sm font-bold">
                    <span>📍 {groupFound?.destination}</span>
                    <span>👥 {groupFound?.member_count} members</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto group-messages-scroll">
                  {/* Show itinerary first */}
                  {groupFound?.itinerary && (
                    <div className="p-4 rounded-xl border-2 border-black bg-purple-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-black text-sm">📋 PLANNER AGENT</span>
                        <span className="ml-auto bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-black">
                          ITINERARY
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap font-semibold text-sm">{groupFound.itinerary}</div>
                    </div>
                  )}
                  
                  {messages.map((msg: any, idx: number) => {
                    const sender = msg.sender_id === 'system' 
                      ? '🤖 SYSTEM' 
                      : msg.sender_id === 'agent' 
                        ? '✈️ PLANNER AGENT' 
                        : msg.sender_id === userId 
                          ? '👤 YOU'
                          : `👤 ${msg.sender_id?.substring(0,8)}`
                    const isItinerary = (msg.message_type || msg.messageType) === 'itinerary'
                    const isSystem = (msg.sender_id || msg.sender_type) === 'system'
                    const isAgent = msg.sender_id === 'agent' || msg.message_type === 'agent_response'
                    const isError = msg.message_type === 'error'
                    const isCurrentUser = msg.sender_id === userId
                    const created = msg.created_at ? new Date(msg.created_at).toLocaleString() : ''
                    
                    let bgColor = 'bg-gray-50'
                    if (isSystem) bgColor = 'bg-yellow-50'
                    else if (isItinerary) bgColor = 'bg-purple-50'
                    else if (isAgent) bgColor = 'bg-blue-50'
                    else if (isError) bgColor = 'bg-red-50'
                    else if (isCurrentUser) bgColor = 'bg-green-50'
                    
                    return (
                      <div
                        key={msg.id || idx}
                        className={`p-4 rounded-xl border-2 border-black ${bgColor}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-black text-sm">{sender}</span>
                          <span className="text-xs text-gray-500">{created}</span>
                          {isAgent && (
                            <span className="ml-auto bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-black">
                              AGENT RESPONSE
                            </span>
                          )}
                        </div>
                        <div className="whitespace-pre-wrap font-semibold text-sm">{msg.message}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Chat Input - writable */}
                <div className="p-4 border-t-4 border-black bg-gray-50">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      if (!chatInput.trim() || sendingMessage) return
                      const groupId = groupFound?.group_id
                      if (!groupId) return

                      const userMessage = chatInput
                      const newUserMsg = {
                        id: `local-${Date.now()}`,
                        group_id: groupId,
                        sender_id: userId,
                        sender_type: 'user',
                        message: userMessage,
                        message_type: 'chat',
                        created_at: new Date().toISOString(),
                      }

                      // Optimistic UI update for user message
                      setMessages((m) => [...m, newUserMsg])
                      setChatInput('')
                      setSendingMessage(true)

                      try {
                        // First, store the user message in planner/bridge
                        const plannerUrl = process.env.NEXT_PUBLIC_PLANNER_URL || 'http://localhost:8004'
                        const bridgeUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000'

                        try {
                          const res = await fetch(`${plannerUrl}/groups/${groupId}/messages`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sender_id: userId, message: newUserMsg.message, message_type: 'chat' }),
                          })

                          if (!res.ok) {
                            throw new Error('Planner POST failed')
                          }
                        } catch (err) {
                          // fallback to agent bridge
                          try {
                            await fetch(`${bridgeUrl}/api/group/${groupId}/messages`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ sender_id: userId, message: newUserMsg.message, message_type: 'chat' }),
                            })
                          } catch (err2) {
                            console.error('Failed to store message', err2)
                          }
                        }

                        // Now send to agent for processing and get response
                        console.log('🚀 Sending message to agent:', { userMessage, groupId, userId })
                        
                        const agentRes = await fetch('/api/agent-message', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            message: userMessage,
                            groupId: groupId,
                            userId: userId,
                            agentType: 'planner' // Can be 'planner', 'travel', or 'matchmaker'
                          }),
                        })

                        console.log('📥 Agent response status:', agentRes.status)

                        if (agentRes.ok) {
                          const agentData = await agentRes.json()
                          console.log('✅ Agent data received:', agentData)
                          
                          if (agentData.success && agentData.response) {
                            // Add agent response to messages
                            const agentMsg = {
                              id: `agent-${Date.now()}`,
                              group_id: groupId,
                              sender_id: 'agent',
                              sender_type: 'agent',
                              message: agentData.response,
                              message_type: 'agent_response',
                              created_at: agentData.timestamp || new Date().toISOString(),
                            }

                            setMessages((m) => [...m, agentMsg])

                            // Store agent response in planner
                            try {
                              await fetch(`${plannerUrl}/groups/${groupId}/messages`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  sender_id: 'agent', 
                                  message: agentMsg.message, 
                                  message_type: 'agent_response' 
                                }),
                              })
                            } catch (err) {
                              console.error('Failed to store agent response', err)
                            }
                          }
                        } else {
                          console.error('❌ Agent response not OK:', agentRes.status, agentRes.statusText)
                          const errorData = await agentRes.json().catch(() => ({ error: 'Unknown error' }))
                          console.error('Error details:', errorData)
                        }
                      } catch (error) {
                        console.error('Error communicating with agent:', error)
                        // Add error message to UI
                        const errorMsg = {
                          id: `error-${Date.now()}`,
                          group_id: groupId,
                          sender_id: 'system',
                          sender_type: 'system',
                          message: '⚠️ Unable to reach agent. Your message has been saved but we couldn\'t get a response.',
                          message_type: 'error',
                          created_at: new Date().toISOString(),
                        }
                        setMessages((m) => [...m, errorMsg])
                      } finally {
                        setSendingMessage(false)
                      }
                    }}
                    className="flex items-center gap-3"
                  >
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Write a message to your group..."
                      disabled={sendingMessage}
                      className="flex-1 px-4 py-3 rounded-xl border-4 border-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !chatInput.trim()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          SENDING
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          SEND
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Group Members */}
            <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-black mb-4">👥 GROUP MEMBERS</h3>
              <div className="space-y-2">
                {groupFound?.members?.map((memberId: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-black"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-black">Traveler {idx + 1}</p>
                      <p className="text-xs text-gray-500 font-mono">{memberId.substring(0, 20)}...</p>
                    </div>
                    {memberId === userId && (
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
