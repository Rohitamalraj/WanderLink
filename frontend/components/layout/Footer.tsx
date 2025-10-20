'use client'

import Link from 'next/link'
import { MapPinIcon } from '@heroicons/react/24/outline'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <MapPinIcon className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-display font-bold text-white">
                WanderLink
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Find your travel tribe — powered by AI, secured by Web3.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-white mb-3">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore" className="hover:text-primary-400 transition">
                  Explore Trips
                </Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-primary-400 transition">
                  Create Trip
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-primary-400 transition">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-primary-400 transition">
                  Safety & Trust
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary-400 transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="hover:text-primary-400 transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-primary-400 transition">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2025 WanderLink. ETHOnline 2025 Submission.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm hover:text-primary-400 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm hover:text-primary-400 transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
