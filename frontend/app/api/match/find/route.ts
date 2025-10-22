import { NextRequest, NextResponse } from 'next/server';

const AGENT_SERVICE_URL = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('[Match API] Sending request to agent service:', {
      user_id: body.user_id,
      destination: body.preferences?.destination
    });
    
    // Call agent service
    const response = await fetch(`${AGENT_SERVICE_URL}/api/match`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Match API] Agent service error:', errorText);
      throw new Error(`Agent service responded with ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('[Match API] Received response:', {
      matches: data.matches?.length || 0,
      asi_powered: data.asi_powered
    });
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Match API] Error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        matches: [],
        asi_powered: false
      },
      { status: 500 }
    );
  }
}
