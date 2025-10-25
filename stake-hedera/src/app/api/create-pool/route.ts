import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { poolId, participants, tripDate, tripLocation, transactionHash } = await request.json();

    // Store pool information in database (for now, just log it)
    console.log('Pool created:', {
      poolId,
      participants: participants.length,
      tripDate,
      tripLocation,
      transactionHash,
      createdAt: new Date().toISOString(),
    });

    // TODO: Store in database
    // await db.pools.create({
    //   poolId,
    //   participants,
    //   tripDate,
    //   tripLocation,
    //   transactionHash,
    //   status: 'active',
    //   createdAt: new Date(),
    // });

    return NextResponse.json({
      success: true,
      poolId,
      transactionHash,
      message: 'Pool created successfully',
    });

  } catch (error: any) {
    console.error('Create Pool Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create pool' },
      { status: 500 }
    );
  }
}
