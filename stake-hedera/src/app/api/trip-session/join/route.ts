import { NextRequest, NextResponse } from 'next/server';
import { tripSessionStore } from '@/lib/trip-sessions';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, walletAddress, name, budget } = await request.json();

    if (!sessionId || !walletAddress || !name || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const session = tripSessionStore.joinSession(sessionId, walletAddress, name, budget);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session,
    });

  } catch (error: any) {
    console.error('Join Session Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join session' },
      { status: 500 }
    );
  }
}
