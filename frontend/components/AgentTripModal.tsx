'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Loader2, CheckCircle, Clock } from 'lucide-react'
import { useGroupStatus } from '@/hooks/useGroupStatus'
import { AgentGroup } from '@/lib/supabase'

interface AgentTripModalProps {
  isOpen: boolean
  onClose: () => void
  onGroupFound?: (group: AgentGroup) => void
  onSubmit?: () => void // Called when user submits trip description
}

export default function AgentTripModal({ isOpen, onClose, onGroupFound, onSubmit }: AgentTripModalProps) {
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'waiting' | 'matched'>('idle')
  const [groupFound, setGroupFound] = useState<AgentGroup | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize user ID
  useEffect(() => {
    if (isOpen) {
      const storedUserId = localStorage.getItem('wanderlink_agent_user_id')
      if (!storedUserId) {
        const newUserId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('wanderlink_agent_user_id', newUserId)
        setUserId(newUserId)
      } else {
        setUserId(storedUserId)
      }
      textareaRef.current?.focus()
    }
  }, [isOpen])

  // Use the working group status hook
  const { group, inGroup } = useGroupStatus({
    userId,
    enabled: status === 'waiting',
    pollInterval: 5000,
    onGroupFound: (group) => {
      console.log('🎉 Group found!', group)
      setGroupFound(group)
      setStatus('matched')
      if (onGroupFound) {
        onGroupFound(group)
      }
    }
  })

  // Check if group was found
  useEffect(() => {
    if (inGroup && group) {
      setGroupFound(group)
      setStatus('matched')
      if (onGroupFound) {
        onGroupFound(group)
      }
    }
  }, [inGroup, group, onGroupFound])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!message.trim() || !userId) return

    setStatus('submitting')

    try {
      console.log('📤 Sending to Travel Agent...')
      console.log('👤 User ID:', userId)
      console.log('💬 Message:', message)
      
      // Send directly to Travel Agent via API
      const res = await fetch('/api/agent-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
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
        // Notify parent that submission was successful
        if (onSubmit) {
          onSubmit()
        }
      } else {
        throw new Error(data.error || 'Agent communication failed')
      }
      
    } catch (error: any) {
      console.error('❌ Error:', error)
      alert(`❌ Failed: ${error.message}`)
      setStatus('idle')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const useSuggestion = (suggestion: string) => {
    setMessage(suggestion)
    textareaRef.current?.focus()
  }

  const handleClose = () => {
    // Allow closing at any time - user can check status via "Processing Preferences" button
    setMessage('')
    setStatus('idle')
    setGroupFound(null)
    onClose()
  }

  const suggestions = [
    "Goa beach vacation, 4 days, budget friendly",
    "Varkala adventure trip, 5 days, love water sports",
    "Kerala backwaters tour, 3 days, peaceful retreat",
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border-4 border-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white border-b-4 border-black">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black">AI AGENT MATCHING</h2>
                <p className="text-sm text-white/90 mt-1 font-bold">
                  Describe your trip and get matched automatically
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
              disabled={status === 'submitting'}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Idle State - Show Form */}
          {status === 'idle' && (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-black rounded-xl p-4 mb-6">
                <h3 className="font-black text-blue-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  HOW IT WORKS
                </h3>
                <p className="text-sm text-blue-800 mb-3 font-bold">
                  Our AI agents will automatically match you with 2 other travelers:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4 font-semibold">
                  <li>• Travel Agent extracts your preferences</li>
                  <li>• MatchMaker pools 3 travelers (same destination)</li>
                  <li>• Planner creates group & generates itinerary</li>
                  <li>• You get notified automatically!</li>
                </ul>
              </div>

              {/* Example Suggestions */}
              <div className="mb-6">
                <h3 className="text-sm font-black text-gray-700 mb-3">
                  💡 QUICK EXAMPLES:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => useSuggestion(suggestion)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-black text-sm font-bold transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700">
                  TRIP DESCRIPTION
                </label>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="E.g., Goa vacation, 4 days, budget friendly"
                  className="w-full min-h-[150px] p-4 border-4 border-black rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-gray-800 placeholder-gray-400 font-bold"
                />
              </div>
            </>
          )}

          {/* Waiting State - Show Progress */}
          {status === 'waiting' && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border-4 border-black">
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
                  🔄 Checking for group formation every 5 seconds...
                </p>
              </div>
            </div>
          )}

          {/* Matched State - Show Success */}
          {status === 'matched' && groupFound && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border-4 border-black">
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

              <div className="space-y-3">
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  ✅ OK, GOT IT!
                </button>
                <p className="text-sm text-center text-gray-600 font-bold">
                  Your processing trip card is now visible on the trips page below
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {status === 'idle' && (
          <div className="bg-gray-50 px-6 py-4 border-t-4 border-black">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>AI will match you automatically</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || status !== 'idle'}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {status !== 'idle' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    SENDING...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    SUBMIT & AUTO-MATCH
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
