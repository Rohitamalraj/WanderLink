'use client'

import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
            🏆 ETHOnline 2025 Finalist
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-gray-900 dark:text-white mb-6">
            Find Your{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Travel Tribe
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Meet compatible strangers, plan authentic trips, and travel safely — all powered by{' '}
            <span className="font-semibold text-primary-600 dark:text-primary-400">AI Agents</span>{' '}
            and secured by{' '}
            <span className="font-semibold text-accent-600 dark:text-accent-400">Web3</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/explore"
              className="group inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Explore Trips
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 transition-all duration-200"
            >
              How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                100%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Verified Travelers
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                <span className="text-green-600">98</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Synergy Score Avg
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                24/7
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Safety Support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 opacity-20">
        <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="400" r="300" fill="url(#gradient)" />
          <defs>
            <radialGradient id="gradient">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#d946ef" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </section>
  )
}
