import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    // Test 1: Check if travel_groups table exists
    const { data: groups, error: groupsError } = await supabase
      .from('travel_groups')
      .select('count')
      .limit(1)

    // Test 2: Try to get groups with creator
    const { data: groupsWithCreator, error: joinError } = await supabase
      .from('travel_groups')
      .select('*, creator:users!travel_groups_creator_id_fkey(full_name, avatar_url)')
      .limit(1)

    // Test 3: Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    return NextResponse.json({
      status: 'Database diagnostic',
      tests: {
        travel_groups_table: {
          exists: !groupsError,
          error: groupsError?.message,
          count: groups?.length || 0
        },
        users_table: {
          exists: !usersError,
          error: usersError?.message,
          count: users?.length || 0
        },
        join_query: {
          works: !joinError,
          error: joinError?.message,
          sample: groupsWithCreator?.[0] || null
        }
      },
      env_check: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing',
        service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing'
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
