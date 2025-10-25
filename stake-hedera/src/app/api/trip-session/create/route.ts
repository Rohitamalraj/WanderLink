import { NextRequest, NextResponse } from 'next/server';
import { tripSessionStore } from '@/lib/trip-sessions';

export async function POST(request: NextRequest) {
  try {
    const { tripName, tripDate, location, walletAddress, name, budget } = await request.json();

    if (!tripName || !tripDate || !location || !walletAddress || !name || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const session = tripSessionStore.createSession(
      tripName,
      tripDate,
      location,
      walletAddress,
      name,
      budget
    );

    return NextResponse.json({
      success: true,
      session,
    });

  } catch (error: any) {
    console.error('Create Session Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}
