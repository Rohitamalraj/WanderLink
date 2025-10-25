import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Test 1: Check connection
    const { data: connectionTest, error: connError } = await supabase
      .from('travel_groups')
      .select('count')
      .limit(1)

    if (connError) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: connError.message,
        details: connError
      })
    }

    // Test 2: Count groups
    const { count, error: countError } = await supabase
      .from('travel_groups')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      return NextResponse.json({
        status: 'error',
        message: 'Count query failed',
        error: countError.message
      })
    }

    // Test 3: Get sample group
    const { data: sampleGroup, error: sampleError } = await supabase
      .from('travel_groups')
      .select('*')
      .limit(1)
      .single()

    // Test 4: Check users table
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      status: 'success',
      database: {
        connected: true,
        groups: {
          count: count || 0,
          sample: sampleGroup || null,
          error: sampleError?.message || null
        },
        users: {
          count: userCount || 0,
          error: userError?.message || null
        }
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
