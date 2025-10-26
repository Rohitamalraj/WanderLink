import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { supabase } from '@/lib/offchain-base'

// Create a new travel group
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      name,
      destination,
      start_date,
      end_date,
      budget_per_person,
      max_members = 3,
    } = body

    const userId = session.user.id

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('travel_groups')
      .insert({
        name,
        destination,
        start_date,
        end_date,
        budget_per_person,
        max_members: Math.min(max_members, 3), // Enforce max 3
        current_members: 1,
        status: 'forming',
        creator_id: userId,
      })
      .select()
      .single()

    if (groupError) throw groupError

    // Add creator as first member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        status: 'accepted',
        compatibility_score: 100,
      })

    if (memberError) throw memberError

    return NextResponse.json({
      success: true,
      group,
    })
  } catch (error: any) {
    console.error('Create group error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create group' },
      { status: 500 }
    )
  }
}

// Get all groups (for browsing)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status') || 'forming'

    const { data: groups, error } = await supabase
      .from('travel_groups')
      .select(`
        *,
        creator:users!travel_groups_creator_id_fkey(full_name, avatar_url),
        members:group_members(count)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      groups: groups || [],
      total: groups?.length || 0,
    })
  } catch (error: any) {
    console.error('Get groups error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get groups' },
      { status: 500 }
    )
  }
}
