import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, tripId, message, compatibilityScore, matchFactors } = body

    if (!userId || !tripId) {
      return NextResponse.json(
        { error: 'User ID and Trip ID are required' },
        { status: 400 }
      )
    }

    // Check if request already exists
    const { data: existing } = await supabase
      .from('match_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('trip_id', tripId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'You have already requested to join this trip' },
        { status: 400 }
      )
    }

    // Create join request
    const { data: joinRequest, error } = await supabase
      .from('match_requests')
      .insert([
        {
          user_id: userId,
          trip_id: tripId,
          compatibility_score: compatibilityScore || 0,
          match_factors: matchFactors || {},
          status: 'pending',
          user_message: message,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      request: joinRequest,
      message: 'Join request submitted successfully! The host will review your profile.',
    })
  } catch (error: any) {
    console.error('Join request error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit join request' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const tripId = searchParams.get('tripId')
    const status = searchParams.get('status')

    if (!userId && !tripId) {
      return NextResponse.json(
        { error: 'User ID or Trip ID is required' },
        { status: 400 }
      )
    }

    let query = supabase.from('match_requests').select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (tripId) {
      query = query.eq('trip_id', tripId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: requests, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      requests: requests || [],
      total: requests?.length || 0,
    })
  } catch (error: any) {
    console.error('Get join requests error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get join requests' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { requestId, status, hostResponse } = body

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Request ID and status are required' },
        { status: 400 }
      )
    }

    const updateData: any = { status }
    if (hostResponse) {
      updateData.host_response = hostResponse
    }

    const { data: updatedRequest, error } = await supabase
      .from('match_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      request: updatedRequest,
      message: `Join request ${status}`,
    })
  } catch (error: any) {
    console.error('Update join request error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update join request' },
      { status: 500 }
    )
  }
}
