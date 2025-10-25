import { NextRequest, NextResponse } from 'next/server';
import { participantPool } from '@/lib/participant-pool';

export async function POST(request: NextRequest) {
  try {
    participantPool.reset();

    return NextResponse.json({
      success: true,
      message: 'Pool reset successfully',
    });

  } catch (error: any) {
    console.error('Reset Pool Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset pool' },
      { status: 500 }
    );
  }
}
