import { NextResponse } from 'next/server';
import { createHederaClient, validateHederaConfig } from '@/lib/hedera-client';
import { A2AMessagingService } from '@/lib/a2a-messaging';
import { CoordinatorAgent } from '@/lib/agents/coordinator-agent';

export async function GET() {
  try {
    if (!validateHederaConfig()) {
      return NextResponse.json(
        { error: 'Missing Hedera configuration' },
        { status: 500 }
      );
    }

    const client = createHederaClient({
      accountId: process.env.HEDERA_ACCOUNT_ID!,
      privateKey: process.env.HEDERA_PRIVATE_KEY!,
    });

    const messaging = new A2AMessagingService(client);
    const coordinator = new CoordinatorAgent(client, messaging);

    const balance = await coordinator.getBalance();

    return NextResponse.json({
      success: true,
      balance,
      accountId: process.env.HEDERA_ACCOUNT_ID,
    });

  } catch (error: any) {
    console.error('Balance API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
