import { NextRequest, NextResponse } from 'next/server';
import { participantPool } from '@/lib/participant-pool';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, name, budget, location } = await request.json();

    console.log('=== Join Pool Request ===');
    console.log('Wallet:', walletAddress);
    console.log('Name:', name);
    console.log('Budget:', budget);
    console.log('Location:', location);

    if (!walletAddress || !name || !budget || !location) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pool = participantPool.addParticipant(
      walletAddress,
      name,
      budget,
      location
    );

    console.log('✅ Participant added! Total:', pool.participants.length);
    console.log('Current participants:', pool.participants.map(p => p.name));

    return NextResponse.json({
      success: true,
      pool: {
        participantCount: pool.participants.length,
        status: pool.status,
        isReady: pool.participants.length >= 3,
        yourInfo: pool.participants.find(
          p => p.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        ),
      },
    });

  } catch (error: any) {
    console.error('❌ Join Pool Error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to join pool' },
      { status: 500 }
    );
  }
}
