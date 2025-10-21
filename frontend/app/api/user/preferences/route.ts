import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, preferences } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if preferences already exist
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .single()

    let result

    if (existing) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .insert([
          {
            user_id: userId,
            ...preferences,
          },
        ])
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      preferences: result,
      message: 'Preferences saved successfully',
    })
  } catch (error: any) {
    console.error('Save preferences error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save preferences' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Preferences not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ preferences })
  } catch (error: any) {
    console.error('Get preferences error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get preferences' },
      { status: 500 }
    )
  }
}
