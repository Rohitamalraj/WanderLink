import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, searchCriteria } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (prefError || !preferences) {
      return NextResponse.json(
        { error: 'User preferences not found. Please complete your profile first.' },
        { status: 404 }
      )
    }

    // Call agent service to find matches
    // In production, this would communicate with the matchmaker agent
    const agentServiceUrl = process.env.AGENT_SERVICE_URL || 'http://localhost:8000'
    
    try {
      const response = await fetch(`${agentServiceUrl}/find-matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          preferences,
          search_criteria: searchCriteria || {},
        }),
      })

      if (!response.ok) {
        throw new Error('Agent service unavailable')
      }

      const matchData = await response.json()
      
      // Save match requests to database
      if (matchData.matches && matchData.matches.length > 0) {
        const matchRequests = matchData.matches.map((match: any) => ({
          user_id: userId,
          trip_id: match.trip_id,
          compatibility_score: match.compatibility_score,
          match_factors: match.compatibility,
          status: 'pending',
        }))

        await supabase.from('match_requests').insert(matchRequests)
      }

      return NextResponse.json({
        matches: matchData.matches || [],
        total: matchData.matches?.length || 0,
        message: 'Matches found successfully',
      })
    } catch (agentError) {
      console.log('Agent service unavailable, using mock data')
      
      // Fallback to mock matches if agent service is down
      const mockMatches = generateMockMatches(preferences, searchCriteria)
      
      // Save mock match requests
      if (mockMatches.length > 0) {
        const matchRequests = mockMatches.map((match: any) => ({
          user_id: userId,
          trip_id: match.trip_id,
          compatibility_score: match.compatibility_score,
          match_factors: match.compatibility,
          status: 'pending',
        }))

        await supabase.from('match_requests').insert(matchRequests)
      }

      return NextResponse.json({
        matches: mockMatches,
        total: mockMatches.length,
        message: 'Matches found successfully (mock data)',
      })
    }
  } catch (error: any) {
    console.error('Find matches error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to find matches' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('match_requests')
      .select('*')
      .eq('user_id', userId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: matches, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      matches: matches || [],
      total: matches?.length || 0,
    })
  } catch (error: any) {
    console.error('Get matches error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get matches' },
      { status: 500 }
    )
  }
}

function generateMockMatches(preferences: any, searchCriteria: any) {
  const mockTrips = [
    {
      trip_id: 'trip_001',
      title: 'Tokyo Adventure - Cherry Blossom Season',
      destination: 'Tokyo, Japan',
      host: {
        name: 'Sarah Chen',
        avatar: '/placeholder-user.jpg',
        rating: 4.9,
        trips_hosted: 12,
      },
      dates: {
        start: '2025-11-15',
        end: '2025-11-22',
      },
      price: 1200,
      group_size: {
        current: 3,
        max: 8,
      },
      interests: ['culture', 'food', 'photography', 'history'],
      pace: 'moderate',
      description: 'Experience authentic Tokyo with local guides. Visit temples, try street food, and capture stunning photos.',
    },
    {
      trip_id: 'trip_002',
      title: 'Bali Wellness Retreat',
      destination: 'Bali, Indonesia',
      host: {
        name: 'Michael Torres',
        avatar: '/placeholder-user.jpg',
        rating: 4.8,
        trips_hosted: 8,
      },
      dates: {
        start: '2025-12-01',
        end: '2025-12-10',
      },
      price: 950,
      group_size: {
        current: 2,
        max: 6,
      },
      interests: ['beach', 'wellness', 'nature', 'yoga'],
      pace: 'relaxed',
      description: 'Rejuvenate in Bali with yoga, meditation, spa treatments, and beautiful beaches.',
    },
    {
      trip_id: 'trip_003',
      title: 'Iceland Northern Lights Expedition',
      destination: 'Reykjavik, Iceland',
      host: {
        name: 'Emma Larson',
        avatar: '/placeholder-user.jpg',
        rating: 5.0,
        trips_hosted: 15,
      },
      dates: {
        start: '2025-11-20',
        end: '2025-11-28',
      },
      price: 2100,
      group_size: {
        current: 4,
        max: 10,
      },
      interests: ['adventure', 'nature', 'photography', 'hiking'],
      pace: 'packed',
      description: 'Chase the Northern Lights, explore ice caves, hike glaciers, and soak in hot springs.',
    },
    {
      trip_id: 'trip_004',
      title: 'Barcelona Food & Culture Tour',
      destination: 'Barcelona, Spain',
      host: {
        name: 'Carlos Rodriguez',
        avatar: '/placeholder-user.jpg',
        rating: 4.7,
        trips_hosted: 10,
      },
      dates: {
        start: '2025-11-10',
        end: '2025-11-17',
      },
      price: 1350,
      group_size: {
        current: 5,
        max: 12,
      },
      interests: ['food', 'culture', 'nightlife', 'art'],
      pace: 'moderate',
      description: 'Taste authentic tapas, visit Gaudí masterpieces, and experience vibrant Barcelona nightlife.',
    },
    {
      trip_id: 'trip_005',
      title: 'New Zealand Adventure',
      destination: 'Queenstown, New Zealand',
      host: {
        name: 'Jack Wilson',
        avatar: '/placeholder-user.jpg',
        rating: 4.9,
        trips_hosted: 20,
      },
      dates: {
        start: '2025-12-05',
        end: '2025-12-15',
      },
      price: 2500,
      group_size: {
        current: 6,
        max: 10,
      },
      interests: ['adventure', 'nature', 'hiking', 'photography'],
      pace: 'packed',
      description: 'Bungee jumping, skydiving, hiking, and exploring Lord of the Rings filming locations.',
    },
  ]

  const userInterests = new Set(preferences.interests || [])
  const userBudgetMax = preferences.budget_max || 10000
  const userPace = preferences.travel_pace || 'moderate'

  const matches = mockTrips.map((trip) => {
    const tripInterests = new Set(trip.interests)
    
    // Calculate interest match
    const commonInterests = [...userInterests].filter((i) => tripInterests.has(i))
    const interestMatch = userInterests.size > 0 
      ? commonInterests.length / userInterests.size 
      : 0.5

    // Calculate budget match
    const budgetMatch = trip.price <= userBudgetMax 
      ? 1.0 
      : Math.max(0, 1 - (trip.price - userBudgetMax) / userBudgetMax)

    // Calculate pace match
    const paceMatch = trip.pace === userPace ? 1.0 : 0.5

    // Calculate destination match
    const destinationMatch = preferences.preferred_destinations?.some((dest: string) =>
      trip.destination.toLowerCase().includes(dest.toLowerCase())
    ) ? 1.0 : 0.3

    // Overall compatibility (weighted average)
    const compatibilityScore = 
      interestMatch * 0.35 +
      budgetMatch * 0.30 +
      paceMatch * 0.20 +
      destinationMatch * 0.15

    return {
      trip_id: trip.trip_id,
      trip,
      compatibility_score: Math.round(compatibilityScore * 100),
      compatibility: {
        interests: Math.round(interestMatch * 100) / 100,
        budget: Math.round(budgetMatch * 100) / 100,
        pace: Math.round(paceMatch * 100) / 100,
        destination: Math.round(destinationMatch * 100) / 100,
        overall: Math.round(compatibilityScore * 100) / 100,
      },
    }
  })

  // Filter and sort by compatibility
  return matches
    .filter((m) => m.compatibility_score >= 40)
    .sort((a, b) => b.compatibility_score - a.compatibility_score)
    .slice(0, 10)
}
