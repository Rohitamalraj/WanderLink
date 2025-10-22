import { NextRequest, NextResponse } from 'next/server';

const AGENT_SERVICE_URL = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000';
const PLANNER_URL = 'http://localhost:8002';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('[Itinerary API] Generating itinerary:', {
      destination: body.destination,
      num_days: body.num_days,
      pace: body.pace
    });
    
    // Call planner agent directly
    const response = await fetch(`${PLANNER_URL}/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Itinerary API] Planner agent error:', errorText);
      throw new Error(`Planner agent responded with ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('[Itinerary API] Received itinerary:', {
      days: data.itinerary?.length || 0,
      asi_powered: data.asi_powered,
      recommendations: data.recommendations?.length || 0
    });
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Itinerary API] Error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        itinerary: [],
        recommendations: [],
        estimated_cost: '$0',
        message: 'Failed to generate itinerary',
        asi_powered: false
      },
      { status: 500 }
    );
  }
}
