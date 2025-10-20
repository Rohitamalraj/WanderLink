'use client'

import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export function CallToAction() {
  return (
    <section className="py-24 bg-gradient-to-r from-primary-600 to-accent-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
          Ready to Find Your Travel Tribe?
        </h2>
        <p className="text-xl text-white/90 mb-8">
          Join verified travelers worldwide. Experience safe, authentic, AI-matched group trips.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/explore"
            className="group inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200"
          >
            Start Exploring
            <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white/10 transition-all duration-200"
          >
            Create a Trip
          </Link>
        </div>

        <div className="mt-12 pt-12 border-t border-white/20">
          <p className="text-white/80 text-sm mb-4">
            Built with
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-white/90 font-medium">
            <span>Hedera</span>
            <span>•</span>
            <span>Polygon</span>
            <span>•</span>
            <span>Lit Protocol</span>
            <span>•</span>
            <span>Worldcoin</span>
            <span>•</span>
            <span>Fetch.ai ASI</span>
            <span>•</span>
            <span>Lighthouse</span>
          </div>
        </div>
      </div>
    </section>
  )
}
