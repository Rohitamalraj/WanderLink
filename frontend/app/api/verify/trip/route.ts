import { NextRequest, NextResponse } from 'next/server';

const VERIFICATION_AGENT_URL = 'http://localhost:8004';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('[Verification API] Verifying trip:', {
      trip_id: body.trip_id,
      destination: body.destination,
      has_image: !!(body.image_url || body.image_base64)
    });
    
    // Call verification agent directly
    const response = await fetch(`${VERIFICATION_AGENT_URL}/api/verify-trip`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Verification API] Verification agent error:', errorText);
      throw new Error(`Verification agent responded with ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('[Verification API] Verification result:', {
      verified: data.verified,
      confidence: data.confidence
    });
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Verification API] Error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        verified: false,
        confidence: 0,
        verdict: 'Verification failed',
        reasoning: error.message,
        concerns: ['Unable to verify trip at this time']
      },
      { status: 500 }
    );
  }
}
