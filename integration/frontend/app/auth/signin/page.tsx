'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Chrome } from 'lucide-react'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/trips' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-black mb-4">
            WANDER<span className="text-purple-600">LINK</span>
          </h1>
          <p className="text-xl font-bold text-gray-700">
            Find Your Perfect Travel Tribe
          </p>
          <p className="text-gray-600 font-semibold mt-2">
            AI-powered group travel matching
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <h2 className="text-2xl font-black text-black mb-6">SIGN IN</h2>
          
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 px-6 bg-white border-4 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome size={24} />
            {loading ? 'SIGNING IN...' : 'SIGN IN WITH GOOGLE'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-gray-600">
              By signing in, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-300 border-2 border-black p-4">
            <div className="text-3xl mb-2">🤖</div>
            <p className="font-black text-xs">AI MATCHING</p>
          </div>
          <div className="bg-yellow-300 border-2 border-black p-4">
            <div className="text-3xl mb-2">👥</div>
            <p className="font-black text-xs">MAX 3 PEOPLE</p>
          </div>
          <div className="bg-pink-300 border-2 border-black p-4">
            <div className="text-3xl mb-2">✨</div>
            <p className="font-black text-xs">SMART GROUPS</p>
          </div>
        </div>
      </div>
    </div>
  )
}
