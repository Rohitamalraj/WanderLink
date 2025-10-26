import { NextRequest, NextResponse } from 'next/server'

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🗺️  Generating itinerary for:', body.destination)
    
    // Call agent service
    const response = await fetch(`${AGENT_SERVICE_URL}/api/generate-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: body.destination,
        num_days: body.numDays,
        interests: body.interests || ['culture', 'food'],
        budget_per_day: body.budgetPerDay,
        pace: body.pace || 'moderate'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Agent service error: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log('✅ Itinerary generated:', data.itinerary?.length, 'days')
    
    return NextResponse.json({
      success: true,
      itinerary: data.itinerary || [],
      recommendations: data.recommendations || [],
      estimatedCost: data.estimated_cost || '$0',
      message: data.message || 'Itinerary generated'
    })
    
  } catch (error: any) {
    console.error('❌ Itinerary error:', error.message)
    
    // Return fallback mock data
    const numDays = request.body ? JSON.parse(await request.text()).numDays || 3 : 3
    const mockItinerary = []
    
    for (let day = 1; day <= numDays; day++) {
      mockItinerary.push({
        day,
        title: `Day ${day} - Exploring`,
        activities: [
          'Morning: Visit main attractions',
          'Lunch: Local cuisine',
          'Afternoon: Cultural experience',
          'Evening: Sunset and dinner'
        ],
        budget_range: '$100-150'
      })
    }
    
    return NextResponse.json({
      success: true,
      itinerary: mockItinerary,
      recommendations: [
        'Book accommodations early',
        'Download offline maps',
        'Try local food markets'
      ],
      estimatedCost: '$300-500',
      message: 'Using fallback data (agent service unavailable)'
    })
  }
}
