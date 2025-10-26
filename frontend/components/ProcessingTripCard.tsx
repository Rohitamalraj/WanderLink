'use client'

import { useState, useEffect } from 'react'
import { MapPin, Users, Calendar, MessageSquare, Eye, Sparkles, Loader2, Link2, Shield, ExternalLink } from 'lucide-react'
import { AgentGroup } from '@/lib/supabase'

interface ProcessingTripCardProps {
  group: AgentGroup
  onOpenChat?: () => void
}

export default function ProcessingTripCard({ group, onOpenChat }: ProcessingTripCardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'chatbox' | 'members'>('overview')
  const [txInfo, setTxInfo] = useState<{ transactionId: string; explorerUrl: string } | null>(null)

  // Get transaction info from localStorage
  useEffect(() => {
    const registrations = JSON.parse(localStorage.getItem('hedera_registrations') || '{}')
    const registration = registrations[group.group_id]
    if (registration) {
      setTxInfo({
        transactionId: registration.transactionId,
        explorerUrl: registration.explorerUrl
      })
    }
  }, [group.group_id])

  return (
    <div className="bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* Image Header */}
      <div className="relative h-56 bg-gradient-to-r from-purple-400 to-pink-400">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <Sparkles className="w-16 h-16 mx-auto mb-2 animate-pulse" />
            <h3 className="text-2xl font-black">AI MATCHED GROUP</h3>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-yellow-400 px-3 py-1 rounded-full border-2 border-black font-black text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            PROCESSING
          </span>
        </div>
        
        {/* Duration Badge */}
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border-2 border-black font-black text-sm">
          {group.member_count} MEMBERS
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="font-bold text-sm">{group.destination}</span>
        </div>

        {/* Title */}
        <h3 className="font-black text-xl mb-3">
          {group.destination} Travel Group
        </h3>

        {/* Group ID */}
        <div className="bg-gray-100 px-3 py-2 rounded-lg border-2 border-black mb-4">
          <p className="text-xs font-mono text-gray-600">
            Group ID: {group.group_id?.substring(0, 20)}...
          </p>
        </div>

        {/* Blockchain Registration Badge */}
        <div className="mb-4 bg-green-50 border-2 border-green-500 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-green-700">✅ REGISTERED ON HEDERA BLOCKCHAIN</span>
          </div>
          {txInfo && (
            <a
              href={txInfo.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Transaction on HashScan
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-lg font-black border-2 border-black transition-all text-sm ${
              activeTab === 'overview'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />
            OVERVIEW
          </button>
          
          <button
            onClick={() => setActiveTab('chatbox')}
            className={`px-3 py-2 rounded-lg font-black border-2 border-black transition-all text-sm ${
              activeTab === 'chatbox'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-1" />
            CHATBOX
          </button>
          
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-2 rounded-lg font-black border-2 border-black transition-all text-sm ${
              activeTab === 'members'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1" />
            MEMBERS
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-black rounded-xl p-4">
                <h4 className="font-black mb-2">ABOUT THIS TRIP</h4>
                <p className="text-sm text-gray-700">
                  AI-matched group for {group.destination}. Your travel preferences have been analyzed 
                  and you've been matched with {group.member_count - 1} other compatible traveler(s).
                </p>
              </div>

              {group.itinerary && (
                <div className="bg-purple-50 border-2 border-black rounded-xl p-4">
                  <h4 className="font-black mb-2">AI GENERATED ITINERARY</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {group.itinerary}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="font-bold text-sm">{group.member_count} travelers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bold text-sm">
                      {new Date(group.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chatbox Tab */}
          {activeTab === 'chatbox' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-black rounded-xl p-6 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                <h4 className="font-black mb-2">GROUP CHAT</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Connect with your travel group members and plan your trip together!
                </p>
                <button
                  onClick={onOpenChat}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  OPEN CHAT
                </button>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              <h4 className="font-black mb-3">GROUP MEMBERS</h4>
              {group.members?.map((memberId: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-black"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-black">Traveler {idx + 1}</p>
                    <p className="text-xs text-gray-500 font-mono">
                      {memberId.substring(0, 20)}...
                    </p>
                  </div>
                  {memberId === localStorage.getItem('wanderlink_agent_user_id') && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black">
                      YOU
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Full Details Button */}
        <div className="mt-4 pt-4 border-t-2 border-black">
          <button
            onClick={() => window.location.href = '/agent-trips-v2'}
            className="w-full bg-black text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            VIEW FULL DETAILS
          </button>
        </div>
      </div>
    </div>
  )
}
