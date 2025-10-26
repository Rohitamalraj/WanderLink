import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { supabase } from '@/lib/offchain-base'

// Create or update user preferences
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
      preferred_destinations,
      budget_min,
      budget_max,
      interests,
      travel_pace,
      activities,
      travel_style,
    } = body

    const userId = session.user.id

    // Check if preferences exist
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .single()

    let result

    if (existing) {
      // Update existing preferences
      result = await supabase
        .from('user_preferences')
        .update({
          preferred_destinations,
          budget_min,
          budget_max,
          interests,
          travel_pace,
          activities,
          travel_style,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()
    } else {
      // Create new preferences
      result = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          preferred_destinations,
          budget_min,
          budget_max,
          interests,
          travel_pace,
          activities,
          travel_style,
        })
        .select()
        .single()
    }

    if (result.error) throw result.error

    return NextResponse.json({
      success: true,
      preferences: result.data,
    })
  } catch (error: any) {
    console.error('Save preferences error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save preferences' },
      { status: 500 }
    )
  }
}

// Get user preferences
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      preferences: data || null,
    })
  } catch (error: any) {
    console.error('Get preferences error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get preferences' },
      { status: 500 }
    )
  }
}
