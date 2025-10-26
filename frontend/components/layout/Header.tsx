'use client'

import Link from 'next/link'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { UserProfileButton } from '@/components/auth/UserProfileButton'

export function Header() {
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <MapPinIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-display font-bold text-gray-900 dark:text-white">
              WanderLink
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/trips"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-bold"
            >
              Trips
            </Link>
            <Link
              href="/how-it-works"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-bold"
            >
              How It Works
            </Link>
            <Link
              href="/about"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-bold"
            >
              About
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
