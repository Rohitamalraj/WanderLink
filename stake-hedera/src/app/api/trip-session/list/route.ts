import { NextRequest, NextResponse } from 'next/server';
import { tripSessionStore } from '@/lib/trip-sessions';

export async function GET(request: NextRequest) {
  try {
    const sessions = tripSessionStore.getAllSessions();

    return NextResponse.json({
      success: true,
      count: sessions.length,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        tripName: s.tripName,
        tripDate: s.tripDate,
        location: s.location,
        participants: s.participants.length,
        status: s.status,
        createdAt: new Date(s.createdAt).toISOString(),
      })),
    });

  } catch (error: any) {
    console.error('List Sessions Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list sessions' },
      { status: 500 }
    );
  }
}
