'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { CheckCircle2, Shield, Users, Coins, TrendingUp, Lock, Zap, Globe } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DataCoinBenefits() {
  const { address } = useAccount()
  const [balance, setBalance] = useState('100')
  
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`dataCoin_${address}`)
      if (stored) {
        const data = JSON.parse(stored)
        setBalance(data.balance || data.amount || '100')
      }
    }
  }, [address])
  const benefits = [
    {
      icon: Shield,
      title: "Verified Traveler Badge",
      description: "Your DataCoin proves you're a verified, trusted traveler. Skip re-verification on every trip.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Users,
      title: "Join Premium Travel Groups",
      description: "Access verified-only travel groups. Only travelers with DataCoin can join exclusive trips.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Coins,
      title: "Earn from Your Identity",
      description: "Monetize your verified identity. Platforms pay you DataCoin to access your travel preferences.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: TrendingUp,
      title: "Build Travel Reputation",
      description: "Your DataCoin balance grows with each verified trip. Higher reputation = better group matches.",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Lock,
      title: "Own Your Data",
      description: "Your identity data is encrypted on Lighthouse. You control who sees it, not WanderLink.",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: Zap,
      title: "Instant Trust Score",
      description: "Your AI TravelAgent uses DataCoin to negotiate better group deals. More tokens = better trips.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Globe,
      title: "Cross-Platform Verification",
      description: "Use your DataCoin verification on partner platforms. One KYC, unlimited travel platforms.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: CheckCircle2,
      title: "Safety Guarantee",
      description: "Only DataCoin holders can pool money in escrow. Reduces fraud risk by 95%.",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            🎉 Congratulations! You're Verified!
          </CardTitle>
          <CardDescription className="text-lg text-gray-700">
            Your DataCoin tokens unlock the full WanderLink experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Your DataCoin Balance</p>
                <p className="text-4xl font-bold text-blue-600">{balance} WLT</p>
                <p className="text-sm text-gray-500">WanderLink Travel Tokens</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Verification Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">Verified</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">🔐 Your data is encrypted on Lighthouse</p>
              <p className="text-sm text-gray-600">⛓️ Proof stored on-chain: Sepolia</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why DataCoin Matters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Why Your DataCoin Matters</CardTitle>
          <CardDescription>
            DataCoin isn't just a token — it's your passport to safe, verified travel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className={`${benefit.bgColor} rounded-lg p-4 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${benefit.color} mt-1`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">How DataCoin Powers WanderLink</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Verification = Trust</h4>
                <p className="text-sm text-gray-600">
                  Your DataCoin proves you completed KYC. Other travelers see you're verified before joining your group.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">AI Agent Negotiation</h4>
                <p className="text-sm text-gray-600">
                  Your TravelAgent AI uses your DataCoin balance to negotiate better group matches and trip deals.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Escrow Protection</h4>
                <p className="text-sm text-gray-600">
                  Only verified DataCoin holders can pool money in smart contract escrow. No more payment fraud!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Reputation Growth</h4>
                <p className="text-sm text-gray-600">
                  Complete trips successfully to earn more DataCoin. Higher reputation = access to premium trips.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-World Example */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Real Example: Sarah's Story</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">Before DataCoin:</span> Sarah wanted to join a 5-day hiking trip in Nepal. 
              She found a group online but had no way to verify if the other 3 travelers were real or scammers.
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">After DataCoin:</span> Sarah's DataCoin shows she's verified. 
              The group's AI agents automatically matched them based on verified identities. 
              Money was pooled in escrow. Trip was amazing! ✨
            </p>
            <div className="bg-white rounded-lg p-4 mt-4">
              <p className="font-semibold text-green-600 mb-2">Result:</p>
              <ul className="space-y-1 text-gray-700">
                <li>✅ Zero fraud risk (all verified)</li>
                <li>✅ Money protected in escrow</li>
                <li>✅ Perfect group match via AI</li>
                <li>✅ Earned 50 more DataCoin for completing trip</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="border-2 border-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to Start Your Journey?</h3>
            <p className="mb-4 text-blue-100">
              Your DataCoin is your key to safe, verified travel experiences
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Browse Trips
              </button>
              <button className="bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors">
                Create Trip
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
