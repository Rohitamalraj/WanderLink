'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plane, Users, Shield, Star, TrendingUp, Zap } from 'lucide-react'

export function TokenUtility() {
  const { address } = useAccount()
  const [balance, setBalance] = useState(0)
  
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`dataCoin_${address}`)
      if (stored) {
        const data = JSON.parse(stored)
        const bal = parseFloat(data.balance || data.amount || '0')
        setBalance(bal)
      }
    }
  }, [address])

  const getTokenTier = (bal: number) => {
    if (bal >= 500) return 'platinum'
    if (bal >= 200) return 'gold'
    if (bal >= 100) return 'silver'
    return 'bronze'
  }

  const tier = getTokenTier(balance)

  const tierBenefits = {
    bronze: {
      color: 'from-orange-400 to-orange-600',
      title: 'Bronze Traveler',
      benefits: [
        'Join verified travel groups',
        'Basic AI agent matching',
        'Standard escrow protection',
        'Community access'
      ]
    },
    silver: {
      color: 'from-gray-400 to-gray-600',
      title: 'Silver Traveler',
      benefits: [
        'All Bronze benefits',
        'Priority group matching',
        'Enhanced AI negotiations',
        'Skip basic verification'
      ]
    },
    gold: {
      color: 'from-yellow-400 to-yellow-600',
      title: 'Gold Traveler ⭐',
      benefits: [
        'All Silver benefits',
        'Premium trip access',
        'Advanced AI strategies',
        'Lower escrow fees (5% → 2%)',
        'Create exclusive groups',
        'Early access to new features'
      ]
    },
    platinum: {
      color: 'from-purple-400 to-purple-600',
      title: 'Platinum Traveler 💎',
      benefits: [
        'All Gold benefits',
        'VIP trip invitations',
        'AI concierge service',
        'Zero escrow fees',
        'Revenue sharing (earn from referrals)',
        'Governance voting rights'
      ]
    }
  }

  const currentTier = tierBenefits[tier as keyof typeof tierBenefits]

  return (
    <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          💰 What Can You Do with {balance} WLT?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Tier */}
        <div className={`bg-gradient-to-r ${currentTier.color} rounded-lg p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Your Current Tier</p>
              <h3 className="text-3xl font-bold">{currentTier.title}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Balance</p>
              <p className="text-3xl font-bold">{balance} WLT</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <p className="font-semibold mb-2">Your Benefits:</p>
            <ul className="space-y-1">
              {currentTier.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span>✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* What You Can Do */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <Plane className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Create Premium Trips</h4>
                <p className="text-sm text-gray-600">
                  With 200+ WLT, you can create exclusive verified-only trips. Set your own rules and invite premium travelers.
                </p>
                <p className="text-xs text-blue-600 mt-2 font-semibold">Cost: 50 WLT per trip</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Join 4 Premium Groups</h4>
                <p className="text-sm text-gray-600">
                  Access verified-only travel groups. Each group requires 50 WLT stake (refunded after trip).
                </p>
                <p className="text-xs text-purple-600 mt-2 font-semibold">You can join 4 groups simultaneously</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Lower Escrow Fees</h4>
                <p className="text-sm text-gray-600">
                  Gold tier (200+ WLT) reduces escrow fees from 5% to 2%. Save money on every trip!
                </p>
                <p className="text-xs text-green-600 mt-2 font-semibold">Save 3% on all transactions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-orange-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">AI Agent Boost</h4>
                <p className="text-sm text-gray-600">
                  Your TravelAgent AI gets advanced negotiation strategies. Better matches, better prices.
                </p>
                <p className="text-xs text-orange-600 mt-2 font-semibold">20% better group matches</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-pink-200">
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 text-pink-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Early Access</h4>
                <p className="text-sm text-gray-600">
                  Get early access to new destinations, features, and exclusive partnerships.
                </p>
                <p className="text-xs text-pink-600 mt-2 font-semibold">Be the first to know</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-teal-200">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-teal-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Earn More Tokens</h4>
                <p className="text-sm text-gray-600">
                  Complete trips to earn more WLT. Gold tier earns 2x rewards. Reach Platinum for 3x!
                </p>
                <p className="text-xs text-teal-600 mt-2 font-semibold">Current multiplier: 2x</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Tier Progress */}
        {tier !== 'platinum' && (
          <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-3">🎯 Next Tier: {tier === 'gold' ? 'Platinum (500 WLT)' : tier === 'silver' ? 'Gold (200 WLT)' : 'Silver (100 WLT)'}</h4>
            <div className="relative">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ 
                    width: `${tier === 'gold' ? (balance / 500) * 100 : tier === 'silver' ? (balance / 200) * 100 : (balance / 100) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {tier === 'gold' ? `${500 - balance} WLT to Platinum` : tier === 'silver' ? `${200 - balance} WLT to Gold` : `${100 - balance} WLT to Silver`}
              </p>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white text-center">
          <h4 className="text-xl font-bold mb-2">Ready to Use Your Tokens?</h4>
          <p className="mb-4 text-blue-100">Start exploring verified travel groups or create your own adventure!</p>
          <div className="flex gap-3 justify-center">
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Browse Trips
            </button>
            <button className="bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-900 transition-colors">
              Create Trip (50 WLT)
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
