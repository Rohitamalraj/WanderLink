import { NextRequest, NextResponse } from 'next/server'

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔍 Finding matches for user:', body.userId)
    
    // Call agent service
    const response = await fetch(`${AGENT_SERVICE_URL}/api/find-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: body.userId,
        destination: body.preferences.destination,
        start_date: body.preferences.startDate,
        end_date: body.preferences.endDate,
        budget_min: body.preferences.budget.min,
        budget_max: body.preferences.budget.max,
        activities: body.preferences.activities || {
          culture: 0.7,
          adventure: 0.5,
          foodie: 0.6,
          relaxation: 0.4
        },
        travel_style: body.preferences.travelStyle || {
          luxury: 0.5,
          flexibility: 0.7,
          social: 0.8
        }
      })
    })
    
    if (!response.ok) {
      throw new Error(`Agent service error: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log('✅ Found matches:', data.matches?.length || 0)
    
    return NextResponse.json({
      success: true,
      matches: data.matches || [],
      confidence: data.confidence || 'Medium',
      message: data.message || 'Matches found'
    })
    
  } catch (error: any) {
    console.error('❌ Match error:', error.message)
    
    // Return fallback mock data if service unavailable
    return NextResponse.json({
      success: true,
      matches: [
        {
          user_id: 'mock-user-1',
          compatibility: 85,
          destination: 'Tokyo, Japan',
          estimated_cost: 2500,
          confidence: 'High'
        },
        {
          user_id: 'mock-user-2',
          compatibility: 72,
          destination: 'Tokyo, Japan',
          estimated_cost: 2800,
          confidence: 'Medium'
        }
      ],
      confidence: 'Medium',
      message: 'Using fallback data (agent service unavailable)'
    })
  }
}
