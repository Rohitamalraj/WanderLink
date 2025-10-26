'use client'

const steps = [
  {
    number: '01',
    title: 'Connect & Verify',
    description: 'Connect your wallet and complete verification (WorldID, KYC). Get your Verified Traveler SBT.',
  },
  {
    number: '02',
    title: 'AI Matchmaking',
    description: 'Take a 60-second quiz. Your TravelAgent AI negotiates with others to form compatible groups.',
  },
  {
    number: '03',
    title: 'Stake & Commit',
    description: 'Group confirms. Everyone stakes to a smart contract escrow — no ghosting, no scams.',
  },
  {
    number: '04',
    title: 'Travel Together',
    description: 'Check in with signed proofs. Access SOS alerts. Enjoy your trip with peace of mind.',
  },
  {
    number: '05',
    title: 'Get Rewarded',
    description: 'Complete the trip → unlock funds + rewards + mint TripNFT. Build your reputation.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From stranger to travel companion — in 5 simple steps.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-white dark:bg-gray-900 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
