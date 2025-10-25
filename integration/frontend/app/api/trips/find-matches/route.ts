import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, preferences } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 Querying travel_groups...')

    // Query groups that are forming and not full
    // Note: Supabase doesn't support column-to-column comparison in .lt()
    // So we fetch all 'forming' groups and filter in JavaScript
    const { data: groups, error } = await supabase
      .from('travel_groups')
      .select('*, creator:users!travel_groups_creator_id_fkey(full_name, avatar_url)')
      .eq('status', 'forming')

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error 
      }, { status: 500 })
    }

    console.log('✅ Found groups:', groups?.length || 0)

    if (!groups || groups.length === 0) {
      return NextResponse.json({ matches: [], total: 0, message: 'No groups available' })
    }

    // Filter groups that still have space (current_members < max_members)
    const availableGroups = groups.filter(g => g.current_members < g.max_members)

    console.log('✅ Available groups (not full):', availableGroups.length)

    if (availableGroups.length === 0) {
      return NextResponse.json({ matches: [], total: 0, message: 'No available groups with space' })
    }

    const matches = availableGroups.map(g => ({
      trip_id: g.id, // Add trip_id for compatibility
      group_id: g.id,
      compatibility_score: 75,
      compatibility: { interests: 0.75, budget: 0.80, pace: 0.70, destination: 0.65 },
      trip: { // Add trip object for MatchResultsModal
        title: g.name,
        destination: g.destination,
        host: { 
          name: g.creator?.full_name || 'Unknown',
          avatar: g.creator?.avatar_url || '',
          rating: 5.0,
          trips_hosted: 1
        },
        dates: { start: g.start_date, end: g.end_date },
        price: g.budget_per_person,
        group_size: { current: g.current_members, max: g.max_members },
        interests: ['Travel', 'Adventure'],
        pace: 'moderate',
        description: `Join us for an amazing trip to ${g.destination}!`
      },
      group: {
        id: g.id,
        title: g.name,
        destination: g.destination,
        dates: { start: g.start_date, end: g.end_date },
        price: g.budget_per_person,
        group_size: { current: g.current_members, max: g.max_members },
        host: { 
          name: g.creator?.full_name || 'Unknown',
          avatar: g.creator?.avatar_url || ''
        }
      }
    }))

    console.log('✅ Returning', matches.length, 'matches')
    console.log('✅ Returning', matches.length, 'matches')
    return NextResponse.json({ matches, total: matches.length })
  } catch (error: any) {
    console.error('❌ Error in find-matches:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
