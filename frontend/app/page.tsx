'use client'

import Link from 'next/link'
import { MapPin, Users, Shield, Sparkles, ArrowRight, Zap } from 'lucide-react'
import { mockTrips } from '@/lib/mock-data'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user } = useAuth()
  const featuredTrips = mockTrips.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header with Google Login */}
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
              FIND YOUR
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">
                TRAVEL TRIBE
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 font-bold max-w-3xl mx-auto mb-10">
              Connect with travelers worldwide. AI-powered matching. Secure & verified.
            </p>
            
            {/* CTA Buttons - Show different buttons based on auth state */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                // Logged in - Show trip buttons
                <>
                  <Link
                    href="/trips"
                    className="bg-black text-white px-8 py-4 rounded-2xl font-black text-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    EXPLORE TRIPS
                  </Link>
                  <Link
                    href="/trips/create"
                    className="bg-white text-black px-8 py-4 rounded-2xl font-black text-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    CREATE TRIP
                  </Link>
                </>
              ) : (
                // Not logged in - Show browse and sign up CTA
                <>
                  <Link
                    href="/trips"
                    className="bg-white text-black px-8 py-4 rounded-2xl font-black text-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    BROWSE TRIPS
                  </Link>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-600 mb-3">Sign in to join trips</p>
                    <div className="inline-block">
                      {/* Google Login will show in header, this is additional CTA */}
                      <Link
                        href="/trips"
                        className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-black text-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                      >
                        GET STARTED
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-400 rounded-2xl border-4 border-black rotate-12 animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-pink-400 rounded-full border-4 border-black animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400 rounded-2xl border-4 border-black -rotate-12"></div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl sm:text-5xl font-black text-center mb-12">WHY WANDERLINK?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="AI Matching"
            description="Smart algorithms find your perfect travel companions"
            color="bg-gradient-to-br from-yellow-400 to-orange-500"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Smart Escrow"
            description="Deposits secured by blockchain until trip completion"
            color="bg-gradient-to-br from-green-400 to-emerald-500"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Verified Users"
            description="WorldID & KYC verification for trusted travelers"
            color="bg-gradient-to-br from-blue-400 to-cyan-500"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Instant Access"
            description="Sign in with Google and start matching instantly"
            color="bg-gradient-to-br from-purple-400 to-pink-500"
          />
        </div>
      </section>

      {/* Featured Trips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl sm:text-5xl font-black">FEATURED TRIPS</h2>
          <Link
            href="/trips"
            className="flex items-center gap-2 text-lg font-bold hover:underline"
          >
            View All
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl sm:text-5xl font-black text-center mb-12">HOW IT WORKS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Browse & Match"
            description="Explore trips and find your perfect match with AI recommendations"
          />
          <StepCard
            number="2"
            title="Book & Deposit"
            description="Secure your spot with a smart contract deposit"
          />
          <StepCard
            number="3"
            title="Travel & Collect"
            description="Complete the trip and mint your commemorative NFT"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-3xl p-12 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            READY FOR YOUR NEXT ADVENTURE?
          </h2>
          <p className="text-xl text-white/90 font-bold mb-8 max-w-2xl mx-auto">
            Join thousands of travelers exploring the world together
          </p>
          <Link
            href="/trips"
            className="inline-block bg-white text-black px-10 py-5 rounded-2xl font-black text-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            START EXPLORING
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
      <div className={`${color} w-16 h-16 rounded-xl border-4 border-black flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-black mb-2">{title}</h3>
      <p className="text-gray-600 font-semibold">{description}</p>
    </div>
  )
}

function TripCard({ trip }: { trip: any }) {
  const days = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all overflow-hidden"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={trip.images[0]}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border-2 border-black font-black text-sm">
          {days} DAYS
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="font-bold text-sm">{trip.destination}</span>
        </div>
        <h3 className="font-black text-xl mb-3">{trip.title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="font-bold text-sm">
              {trip.currentParticipants}/{trip.maxParticipants}
            </span>
          </div>
          <span className="font-black text-lg">${trip.totalCost}</span>
        </div>
      </div>
    </Link>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white text-3xl font-black rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
        {number}
      </div>
      <h3 className="text-2xl font-black mb-3">{title}</h3>
      <p className="text-gray-600 font-semibold">{description}</p>
    </div>
  )
}
