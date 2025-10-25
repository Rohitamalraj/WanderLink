'use client'

import Link from 'next/link'
import {
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Shield,
  Award,
  Sparkles,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { mockTrips, mockBookings, mockUsers } from '@/lib/mock-data'
import { formatDate, calculateDays } from '@/lib/utils'

export default function DashboardPage() {
  // Mock current user
  const currentUser = mockUsers[0]

  // Get user's bookings
  const userBookings = mockBookings.filter((b) => b.userAddress === currentUser.address)

  // Get trips user is hosting
  const hostedTrips = mockTrips.filter((t) => t.hostAddress === currentUser.address)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <div className="border-b-4 border-black bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-black">
              WANDERLINK
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/trips" className="hidden sm:block font-bold text-lg hover:underline">
                Explore Trips
              </Link>
              <button className="bg-black text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
                CONNECT WALLET
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl font-black mb-4">
            WELCOME BACK, {currentUser.name.toUpperCase()}!
          </h1>
          <p className="text-xl text-gray-700 font-bold">
            Track your trips, manage bookings, and discover new adventures
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<MapPin className="w-8 h-8" />}
            title="TRIPS JOINED"
            value={currentUser.tripsJoined}
            gradient="from-orange-400 to-orange-600"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="TRIPS HOSTED"
            value={currentUser.tripsHosted}
            gradient="from-blue-400 to-blue-600"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="REPUTATION"
            value={`${currentUser.reputation}%`}
            gradient="from-green-400 to-green-600"
          />
          <StatCard
            icon={<Award className="w-8 h-8" />}
            title="VERIFICATIONS"
            value={currentUser.verifications.length}
            gradient="from-purple-400 to-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/trips"
            className="group bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-2xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all text-center"
          >
            <div className="bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4 border-black">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">CREATE TRIP</h3>
            <p className="text-white/90 font-semibold">
              Host your own adventure
            </p>
          </Link>

          <Link
            href="/trips"
            className="group bg-white rounded-2xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all text-center"
          >
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4 border-black">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-2">AI MATCH FINDER</h3>
            <p className="text-gray-600 font-semibold">
              Find compatible travelers
            </p>
          </Link>

          <Link
            href="/verify"
            className="group bg-white rounded-2xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all text-center"
          >
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4 border-black">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-2">GET VERIFIED</h3>
            <p className="text-gray-600 font-semibold">
              Increase trust & reputation
            </p>
          </Link>
        </div>

        {/* Trips Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Bookings */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black">MY BOOKINGS</h2>
              <Link
                href="/bookings"
                className="flex items-center gap-2 text-lg font-bold hover:underline"
              >
                View All
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {userBookings.length > 0 ? (
              <div className="space-y-4">
                {userBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-black text-gray-400 mb-2">NO BOOKINGS YET</p>
                <Link
                  href="/trips"
                  className="inline-block text-orange-600 font-bold hover:underline"
                >
                  Browse trips →
                </Link>
              </div>
            )}
          </div>

          {/* Trips I'm Hosting */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black">HOSTING</h2>
              <Link
                href="/trips"
                className="flex items-center gap-2 text-lg font-bold hover:underline"
              >
                Create Trip
                <Plus className="w-5 h-5" />
              </Link>
            </div>

            {hostedTrips.length > 0 ? (
              <div className="space-y-4">
                {hostedTrips.map((trip) => (
                  <HostedTripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-black text-gray-400 mb-2">NOT HOSTING YET</p>
                <Link
                  href="/trips"
                  className="inline-block text-orange-600 font-bold hover:underline"
                >
                  Create your first trip →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Trips (AI Powered) */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              AI RECOMMENDATIONS FOR YOU
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTrips.slice(0, 3).map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  gradient,
}: {
  icon: React.ReactNode
  title: string
  value: number | string
  gradient: string
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className={`bg-gradient-to-br ${gradient} w-14 h-14 rounded-xl border-4 border-black flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  )
}

function BookingCard({ booking }: { booking: (typeof mockBookings)[0] }) {
  const statusColors = {
    pending: 'bg-yellow-400',
    confirmed: 'bg-green-400',
    completed: 'bg-blue-400',
    cancelled: 'bg-red-400',
  }

  return (
    <Link
      href={`/trips/${booking.tripId}`}
      className="block bg-white rounded-2xl p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
    >
      <div className="flex items-start gap-4">
        <img
          src={booking.trip.images[0]}
          alt={booking.trip.title}
          className="w-20 h-20 rounded-xl border-2 border-black object-cover"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-black text-lg">{booking.trip.title}</h4>
              <p className="text-sm font-semibold text-gray-600">
                {booking.trip.destination}
              </p>
            </div>
            <span
              className={`${statusColors[booking.status]} px-3 py-1 rounded-full border-2 border-black text-xs font-black uppercase`}
            >
              {booking.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(booking.trip.startDate)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {booking.trip.currentParticipants}/{booking.trip.maxParticipants}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function HostedTripCard({ trip }: { trip: (typeof mockTrips)[0] }) {
  const days = calculateDays(trip.startDate, trip.endDate)
  const spotsLeft = trip.maxParticipants - trip.currentParticipants

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block bg-white rounded-2xl p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
    >
      <div className="flex items-start gap-4">
        <img
          src={trip.images[0]}
          alt={trip.title}
          className="w-20 h-20 rounded-xl border-2 border-black object-cover"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-black text-lg">{trip.title}</h4>
              <p className="text-sm font-semibold text-gray-600">{trip.destination}</p>
            </div>
            {trip.status === 'full' ? (
              <span className="bg-yellow-400 px-3 py-1 rounded-full border-2 border-black text-xs font-black">
                FULL
              </span>
            ) : (
              <span className="bg-green-400 px-3 py-1 rounded-full border-2 border-black text-xs font-black">
                {spotsLeft} SPOTS
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {days} days
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {trip.currentParticipants}/{trip.maxParticipants}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function TripCard({ trip }: { trip: (typeof mockTrips)[0] }) {
  const days = calculateDays(trip.startDate, trip.endDate)

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
