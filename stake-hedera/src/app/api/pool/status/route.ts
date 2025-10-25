import { NextRequest, NextResponse } from 'next/server';
import { participantPool } from '@/lib/participant-pool';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    const pool = participantPool.getPool();
    
    // Only log occasionally to avoid spam (every 10th request)
    if (Math.random() < 0.1) {
      console.log('📊 Pool Status:', {
        participants: pool.participants.length,
        status: pool.status,
        names: pool.participants.map(p => p.name)
      });
    }

    // Check if this wallet is a participant
    const isParticipant = walletAddress 
      ? participantPool.isParticipant(walletAddress)
      : false;

    // Only show full details to participants
    if (!isParticipant && walletAddress) {
      return NextResponse.json({
        success: true,
        isParticipant: false,
        participantCount: pool.participants.length,
        status: pool.status,
        isReady: pool.participants.length >= 3,
      });
    }

    return NextResponse.json({
      success: true,
      isParticipant,
      pool: {
        participants: pool.participants.map(p => ({
          name: p.name,
          budget: p.budget,
          location: p.location,
          walletAddress: p.walletAddress,
          hasStaked: p.hasStaked,
        })),
        participantCount: pool.participants.length,
        status: pool.status,
        isReady: pool.participants.length >= 3,
        negotiationResult: pool.negotiationResult,
      },
    });

  } catch (error: any) {
    console.error('Pool Status Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get pool status' },
      { status: 500 }
    );
  }
}
