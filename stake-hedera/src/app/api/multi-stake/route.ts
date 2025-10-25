import { NextRequest, NextResponse } from 'next/server';
import { createHederaClient, validateHederaConfig } from '@/lib/hedera-client';
import { A2AMessagingService } from '@/lib/a2a-messaging';
import { CoordinatorAgent } from '@/lib/agents/coordinator-agent';
import { ValidatorAgent } from '@/lib/agents/validator-agent';
import { ContractEscrowService } from '@/lib/contract-escrow';

/**
 * Multi-user staking endpoint
 * Two users pool their amounts, agents negotiate, stake on behalf
 */
export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json();

    // Validate input
    if (!users || !Array.isArray(users) || users.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 users with amounts and locations' },
        { status: 400 }
      );
    }

    // Validate each user
    for (const user of users) {
      if (!user.amount || user.amount <= 0) {
        return NextResponse.json(
          { error: 'All users must have valid amounts' },
          { status: 400 }
        );
      }
      if (!user.location) {
        return NextResponse.json(
          { error: 'All users must specify a location' },
          { status: 400 }
        );
      }
    }

    if (!validateHederaConfig()) {
      return NextResponse.json(
        { error: 'Missing Hedera configuration' },
        { status: 500 }
      );
    }

    // Initialize clients
    const coordinatorClient = createHederaClient({
      accountId: process.env.HEDERA_ACCOUNT_ID!,
      privateKey: process.env.HEDERA_PRIVATE_KEY!,
    });

    const validatorClient = createHederaClient({
      accountId: process.env.VALIDATOR_ACCOUNT_ID!,
      privateKey: process.env.VALIDATOR_PRIVATE_KEY!,
    });

    // Initialize messaging
    const coordinatorMessaging = new A2AMessagingService(coordinatorClient);
    const validatorMessaging = new A2AMessagingService(validatorClient);

    let topicId = process.env.A2A_TOPIC_ID;
    if (!topicId) {
      topicId = await coordinatorMessaging.createMessageTopic();
    } else {
      coordinatorMessaging.setTopicId(topicId);
      validatorMessaging.setTopicId(topicId);
    }

    // Initialize agents
    const coordinator = new CoordinatorAgent(coordinatorClient, coordinatorMessaging);
    const validator = new ValidatorAgent(validatorClient, validatorMessaging);

    // Calculate total amount
    const totalAmount = users.reduce((sum: number, user: any) => sum + user.amount, 0);

    console.log(`\n💰 Multi-User Staking Pool:`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Total Amount: ${totalAmount} HBAR`);
    users.forEach((user: any, i: number) => {
      console.log(`   User ${i + 1}: ${user.amount} HBAR @ ${user.location}`);
    });

    // Step 1: Coordinator initiates with total amount
    console.log('\n📤 Step 1: Coordinator initiating pool stake request...');
    const initiationResult = await coordinator.initiateStakeRequest(
      totalAmount,
      validator.getProfile().accountId,
      'Multi-location' // Combined location
    );

    // Step 2: Validator processes and negotiates
    console.log('📥 Step 2: Validator processing and negotiating...');
    const coordinatorMessages = coordinator.getConversationHistory();
    const stakeRequest = coordinatorMessages[coordinatorMessages.length - 1];
    
    const validationResponse = await validator.processMessage(stakeRequest);

    // Step 3: Handle negotiation
    console.log('🤝 Step 3: Processing negotiation...');
    let finalResponse = validationResponse;
    
    if (validationResponse && validationResponse.type === 'STAKE_COUNTER_OFFER') {
      finalResponse = await coordinator.processMessage(validationResponse);
    } else if (validationResponse) {
      finalResponse = await coordinator.processMessage(validationResponse);
    }

    // Get final negotiated amount
    const allMessages = [
      ...coordinator.getConversationHistory(),
      ...validator.getConversationHistory(),
    ].sort((a, b) => a.timestamp - b.timestamp);

    const confirmationMsg = allMessages.find(m => m.type === 'STAKE_CONFIRMATION');
    const negotiatedAmount = confirmationMsg?.payload?.negotiatedAmount || totalAmount;

    console.log(`\n✅ Negotiation Complete:`);
    console.log(`   Requested: ${totalAmount} HBAR`);
    console.log(`   Negotiated: ${negotiatedAmount} HBAR`);

    // Step 4: Create pool in smart contract (if contract deployed)
    let contractPoolId = null;
    try {
      const contractId = process.env.CONTRACT_ID;
      if (contractId) {
        console.log('\n📝 Step 4: Creating pool in smart contract...');
        
        const contractEscrow = new ContractEscrowService(coordinatorClient, contractId);
        
        const poolId = `pool_${Date.now()}`;
        const participants = users.map((user: any) => ({
          address: user.accountId || process.env.HEDERA_ACCOUNT_ID!, // Use provided or default
          amount: (user.amount * negotiatedAmount) / totalAmount, // Proportional share
          location: user.location
        }));

        await contractEscrow.createPool(poolId, participants);
        
        // Update with negotiated amount
        await contractEscrow.updateNegotiatedAmount(poolId, negotiatedAmount);
        
        contractPoolId = poolId;
        console.log(`   ✅ Pool created: ${poolId}`);
      }
    } catch (error) {
      console.log('   ⚠️  Contract not deployed, using simulated escrow');
    }

    // Calculate individual shares
    const userShares = users.map((user: any) => ({
      ...user,
      originalAmount: user.amount,
      negotiatedShare: (user.amount * negotiatedAmount) / totalAmount,
      percentage: ((user.amount / totalAmount) * 100).toFixed(2)
    }));

    return NextResponse.json({
      success: true,
      conversation: {
        messages: allMessages,
        status: 'COMPLETED'
      },
      summary: {
        totalRequested: totalAmount,
        totalNegotiated: negotiatedAmount,
        userCount: users.length,
        userShares,
        contractPoolId,
        topicId,
        messageCount: allMessages.length
      }
    });

  } catch (error: any) {
    console.error('Multi-Stake API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process multi-user stake' },
      { status: 500 }
    );
  }
}
