import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const groupId = params.id
    const userId = session.user.id

    // Get group details
    const { data: group, error: groupError } = await supabase
      .from('travel_groups')
      .select('*, creator_id, current_members, max_members, status')
      .eq('id', groupId)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Check if group is accepting members
    if (group.status !== 'forming') {
      return NextResponse.json(
        { error: `Cannot join group - Status is ${group.status}` },
        { status: 400 }
      )
    }

    // Check if group is full
    if (group.current_members >= group.max_members) {
      return NextResponse.json(
        { error: 'Group is full' },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id, status')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single()

    if (existingMember) {
      if (existingMember.status === 'accepted') {
        return NextResponse.json(
          { error: 'You are already a member of this group' },
          { status: 400 }
        )
      } else if (existingMember.status === 'pending') {
        return NextResponse.json(
          { error: 'You already have a pending request for this group' },
          { status: 400 }
        )
      }
    }

    // Check if user is the creator
    if (group.creator_id === userId) {
      return NextResponse.json(
        { error: 'You are the creator of this group' },
        { status: 400 }
      )
    }

    // Create join request (match_request)
    const { data: matchRequest, error: requestError } = await supabase
      .from('match_requests')
      .insert({
        group_id: groupId,
        requester_id: userId,
        status: 'pending',
        compatibility_score: 75.0, // TODO: Calculate from MatchMaker Agent
      })
      .select()
      .single()

    if (requestError) {
      console.error('Error creating match request:', requestError)
      return NextResponse.json(
        { error: 'Failed to create join request' },
        { status: 500 }
      )
    }

    // For MVP: Auto-accept the request and add to group
    // In production, the creator would review and accept manually
    
    // Add user to group_members
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        status: 'accepted', // Auto-accept for MVP
        compatibility_score: 75.0,
      })

    if (memberError) {
      console.error('Error adding group member:', memberError)
      return NextResponse.json(
        { error: 'Failed to join group' },
        { status: 500 }
      )
    }

    // Update group member count
    const newMemberCount = group.current_members + 1
    const newStatus = newMemberCount >= group.max_members ? 'full' : 'forming'

    const { error: updateError } = await supabase
      .from('travel_groups')
      .update({
        current_members: newMemberCount,
        status: newStatus,
      })
      .eq('id', groupId)

    if (updateError) {
      console.error('Error updating group:', updateError)
    }

    return NextResponse.json({
      message: 'Successfully joined group!',
      group: {
        id: groupId,
        current_members: newMemberCount,
        status: newStatus,
      },
      match_request_id: matchRequest.id,
    })
  } catch (error: any) {
    console.error('Error joining group:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
