'use client'

import { ShieldCheckIcon, UsersIcon, SparklesIcon, LockClosedIcon, GlobeAltIcon, BoltIcon } from '@heroicons/react/24/outline'

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Multi-Layer Verification',
    description: 'WorldID, KYC, and Soulbound Tokens ensure every traveler is verified and trustworthy.',
  },
  {
    icon: UsersIcon,
    title: 'AI Agent Matching',
    description: 'Autonomous agents negotiate optimal group formation based on personality, budget, and preferences.',
  },
  {
    icon: LockClosedIcon,
    title: 'Smart Contract Escrow',
    description: 'Your funds are secured on-chain. Automated slashing prevents ghosting and no-shows.',
  },
  {
    icon: SparklesIcon,
    title: 'Privacy-First',
    description: 'Lighthouse Storage encrypts your KYC data. Agents work on embeddings, not raw personal information.',
  },
  {
    icon: BoltIcon,
    title: 'Real-Time Safety',
    description: 'SOS alerts, signed check-ins, and emergency escrow freezes keep you protected 24/7.',
  },
  {
    icon: GlobeAltIcon,
    title: 'Reputation & Rewards',
    description: 'Earn $TRVL tokens and TripNFTs. Build your on-chain travel reputation.',
  },
]

export function Features() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Why WanderLink?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The first stranger-trip platform where safety, trust, and compatibility are guaranteed by code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card hover:shadow-xl transition-shadow duration-300"
            >
              <feature.icon className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
