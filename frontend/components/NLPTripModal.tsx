'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Loader2, CheckCircle } from 'lucide-react'

interface NLPTripModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (nlpInput: string) => void
}

export default function NLPTripModal({ isOpen, onClose, onSubmit }: NLPTripModalProps) {
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!message.trim()) return

    setIsProcessing(true)
    
    // Simulate processing delay for UX
    setTimeout(() => {
      onSubmit(message)
      setIsProcessing(false)
      setMessage('')
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const useSuggestion = (suggestion: string) => {
    setMessage(suggestion)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const suggestions = [
    "Hi! I want a relaxing beach vacation in Goa for 4 days with a budget of around $500. I'm traveling with a friend, and we love sunbathing, trying local seafood, and short boat rides.",
    "Looking for an adventure trip to Iceland for 7 days, budget around $2000. I love hiking, photography, and seeing the Northern Lights. Traveling solo.",
    "I want to explore Tokyo's culture and food for 5 days with my partner. Budget is $1200. We're into temples, street food, and shopping.",
    "Planning a wellness retreat in Bali for 6 days, budget $900. Interested in yoga, meditation, healthy eating, and beach time. Going with 2 friends.",
    "Adventure trip to New Zealand for 10 days, budget $2500. Love bungee jumping, skydiving, and nature hikes. Solo traveler looking for adrenaline!"
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Describe Your Dream Trip</h2>
                <p className="text-sm text-white/90 mt-1">
                  Just tell us what you're looking for in natural language
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              disabled={isProcessing}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              How it works
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Our AI will understand your trip preferences from your natural description. Just include:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• <strong>Destination</strong>: Where you want to go</li>
              <li>• <strong>Duration</strong>: How many days</li>
              <li>• <strong>Budget</strong>: Your approximate budget</li>
              <li>• <strong>Travel type</strong>: Beach, adventure, culture, etc.</li>
              <li>• <strong>Group type</strong>: Solo, with friends, couple, family</li>
              <li>• <strong>Interests</strong>: What activities you enjoy</li>
            </ul>
          </div>

          {/* Example Suggestions */}
          {showSuggestions && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                💡 Try one of these examples:
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => useSuggestion(suggestion)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all text-sm text-gray-700 hover:border-blue-300 group"
                  >
                    <span className="line-clamp-2 group-hover:line-clamp-none transition-all">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Your Trip Description
            </label>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Example: Hi! I want a relaxing beach vacation in Goa for 4 days with a budget of around $500. I'm traveling with a friend, and we love sunbathing, trying local seafood, and short boat rides."
              className="w-full min-h-[200px] p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none text-gray-800 placeholder-gray-400"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500">
              💡 Press <kbd className="px-2 py-1 bg-gray-100 rounded border">Enter</kbd> to submit or{' '}
              <kbd className="px-2 py-1 bg-gray-100 rounded border">Shift + Enter</kbd> for new line
            </p>
          </div>

          {/* Character count */}
          <div className="mt-2 text-right">
            <span className={`text-xs ${message.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
              {message.length} / 1000 characters
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>AI will match you with compatible travelers</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Find My Matches
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
