'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useRef, useEffect } from 'react'
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export function UserProfileButton() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  if (!user) return null

  const userEmail = user.email || 'User'
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0]
  const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all duration-200"
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-8 h-8 rounded-full border-2 border-black"
          />
        ) : (
          <UserCircleIcon className="w-8 h-8" />
        )}
        <span className="font-bold hidden sm:inline">{userName}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50">
          <div className="p-4 border-b-4 border-black bg-yellow-400">
            <p className="font-bold text-black truncate">{userName}</p>
            <p className="text-sm text-gray-700 truncate">{userEmail}</p>
          </div>

          <div className="p-2">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 hover:bg-yellow-400 font-bold transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/trips"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 hover:bg-yellow-400 font-bold transition-colors"
            >
              My Trips
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 hover:bg-yellow-400 font-bold transition-colors"
            >
              Profile Settings
            </Link>
          </div>

          <div className="p-2 border-t-4 border-black">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-400 font-bold transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
