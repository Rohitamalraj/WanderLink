'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, MessageSquare, Loader2 } from 'lucide-react'
import { AgentGroup } from '@/lib/offchain-base'

interface GroupChatModalProps {
  isOpen: boolean
  onClose: () => void
  group: AgentGroup
}

export default function GroupChatModal({ isOpen, onClose, group }: GroupChatModalProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize user ID
  useEffect(() => {
    const storedUserId = localStorage.getItem('wanderlink_agent_user_id')
    if (storedUserId) {
      setUserId(storedUserId)
    }
  }, [])

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load initial messages (if any)
  useEffect(() => {
    if (isOpen && group.itinerary) {
      // Add itinerary as first message
      setMessages([
        {
          id: 'itinerary',
          sender_id: 'planner',
          sender_type: 'agent',
          message: group.itinerary,
          message_type: 'itinerary',
          created_at: group.created_at
        }
      ])
    }
  }, [isOpen, group])

  if (!isOpen) return null

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || sendingMessage) return

    const userMessage = chatInput
    const newUserMsg = {
      id: `local-${Date.now()}`,
      group_id: group.group_id,
      sender_id: userId,
      sender_type: 'user',
      message: userMessage,
      message_type: 'chat',
      created_at: new Date().toISOString()
    }

    // Add user message immediately
    setMessages(prev => [...prev, newUserMsg])
    setChatInput('')
    setSendingMessage(true)

    try {
      // Send to Planner Agent
      const plannerUrl = process.env.NEXT_PUBLIC_PLANNER_URL || 'http://localhost:8004'
      const res = await fetch(`${plannerUrl}/groups/${group.group_id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: userId,
          message: userMessage,
          message_type: 'chat'
        })
      })

      if (res.ok) {
        const data = await res.json()
        console.log('Message sent:', data)
        
        // Add agent response if any
        if (data.response) {
          const agentMsg = {
            id: `agent-${Date.now()}`,
            group_id: group.group_id,
            sender_id: 'planner',
            sender_type: 'agent',
            message: data.response,
            message_type: 'agent_response',
            created_at: new Date().toISOString()
          }
          setMessages(prev => [...prev, agentMsg])
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border-4 border-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 border-b-4 border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black">GROUP CHAT</h2>
                <p className="text-sm text-white/90 font-bold">
                  {group.destination} • {group.member_count} members
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => {
            const isAgent = msg.sender_type === 'agent' || msg.sender_id === 'planner'
            const isYou = msg.sender_id === userId
            const isItinerary = msg.message_type === 'itinerary'

            if (isItinerary) {
              return (
                <div key={msg.id} className="p-4 rounded-xl border-2 border-black bg-purple-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-black text-sm">📋 PLANNER AGENT</span>
                    <span className="ml-auto bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-black">
                      ITINERARY
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap font-semibold text-sm">{msg.message}</div>
                </div>
              )
            }

            return (
              <div
                key={msg.id}
                className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-xl border-2 border-black ${
                    isAgent
                      ? 'bg-blue-50'
                      : isYou
                      ? 'bg-purple-500 text-white'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-xs">
                      {isAgent ? '🤖 PLANNER AGENT' : isYou ? '👤 YOU' : '👤 TRAVELER'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t-4 border-black bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-bold"
              disabled={sendingMessage}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || sendingMessage}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {sendingMessage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
