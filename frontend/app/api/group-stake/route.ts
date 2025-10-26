import { NextRequest, NextResponse } from 'next/server';
import { createHederaClient, validateStakeHederaConfig } from '@/lib/stake/hedera-client';
import { A2AMessagingService } from '@/lib/stake/a2a-messaging';
import { CoordinatorAgent } from '@/lib/stake/agents/coordinator-agent';
import { ValidatorAgent } from '@/lib/stake/agents/validator-agent';
import { AgentConversation, GroupStakeRequest } from '@/lib/stake/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, destination, memberBudgets, memberCount } = body as GroupStakeRequest;

    console.log('🎯 Group Stake API: Request received');
    console.log(`   Group: ${groupId}`);
    console.log(`   Destination: ${destination}`);
    console.log(`   Members: ${memberCount}`);
    console.log(`   Budgets: ${memberBudgets?.join(', ')}`);

    // Validate inputs
    if (!groupId || !destination || !memberBudgets || memberBudgets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate environment configuration
    if (!validateStakeHederaConfig()) {
      return NextResponse.json(
        { success: false, error: 'Missing Hedera stake configuration. Check environment variables.' },
        { status: 500 }
      );
    }

    // Initialize clients for both agents
    const coordinatorClient = createHederaClient({
      accountId: process.env.STAKE_COORDINATOR_ACCOUNT_ID!,
      privateKey: process.env.STAKE_COORDINATOR_PRIVATE_KEY!,
    });

    const validatorClient = createHederaClient({
      accountId: process.env.STAKE_VALIDATOR_ACCOUNT_ID!,
      privateKey: process.env.STAKE_VALIDATOR_PRIVATE_KEY!,
    });

    // Create A2A messaging services
    const coordinatorMessaging = new A2AMessagingService(coordinatorClient);
    const validatorMessaging = new A2AMessagingService(validatorClient);

    // Create or use existing topic
    let topicId = process.env.A2A_STAKE_TOPIC_ID;
    if (!topicId) {
      console.log('📝 Creating new A2A topic for group stake...');
      topicId = await coordinatorMessaging.createMessageTopic();
      console.log(`✅ Created topic: ${topicId}`);
      validatorMessaging.setTopicId(topicId);
    } else {
      coordinatorMessaging.setTopicId(topicId);
      validatorMessaging.setTopicId(topicId);
    }

    // Initialize agents
    const coordinator = new CoordinatorAgent(coordinatorClient, coordinatorMessaging);
    const validator = new ValidatorAgent(validatorClient, validatorMessaging);

    // Start the A2A conversation
    const conversationId = `group_stake_${groupId}_${Date.now()}`;
    const conversation: AgentConversation = {
      id: conversationId,
      messages: [],
      status: 'INITIATED',
      startTime: Date.now(),
    };

    // Step 1: Coordinator initiates group stake request
    console.log('\n📤 Step 1: Coordinator initiating group stake request...');
    const stakeRequest: GroupStakeRequest = {
      groupId,
      destination,
      memberBudgets,
      memberCount,
      requesterId: coordinator.getProfile().accountId,
    };

    await coordinator.initiateGroupStakeRequest(
      stakeRequest,
      validator.getProfile().accountId
    );

    // Step 2: Validator processes the request
    console.log('\n🤖 Step 2: Validator processing request...');
    const coordinatorMessages = coordinator.getConversationHistory();
    const stakeRequestMessage = coordinatorMessages[coordinatorMessages.length - 1];
    
    const validationResponse = await validator.processMessage(stakeRequestMessage);

    // Step 3: Coordinator processes validator response (may include negotiation)
    console.log('\n🔄 Step 3: Coordinator processing validation response...');
    let finalResponse = validationResponse;
    
    if (validationResponse) {
      // Handle negotiation or approval
      if (validationResponse.type === 'STAKE_COUNTER_OFFER') {
        console.log('🤝 Negotiation in progress...');
        finalResponse = await coordinator.processMessage(validationResponse);
      } else if (validationResponse.type === 'STAKE_APPROVAL') {
        finalResponse = await coordinator.processMessage(validationResponse);
      }
    }

    // Collect all messages from both agents
    const allMessages = [
      ...coordinator.getConversationHistory(),
      ...validator.getConversationHistory(),
    ].sort((a, b) => a.timestamp - b.timestamp);

    conversation.messages = allMessages;
    conversation.endTime = Date.now();
    
    // Determine final status
    const hasApproval = allMessages.some(m => m.type === 'STAKE_APPROVAL');
    const hasRejection = allMessages.some(m => m.type === 'STAKE_REJECTION');
    const hasConfirmation = allMessages.some(m => m.type === 'STAKE_CONFIRMATION');
    const hasNegotiation = allMessages.some(m => m.type === 'STAKE_COUNTER_OFFER');

    if (hasConfirmation) {
      conversation.status = 'COMPLETED';
    } else if (hasNegotiation && !hasConfirmation) {
      conversation.status = 'VALIDATING';
    } else if (hasApproval) {
      conversation.status = 'APPROVED';
    } else if (hasRejection) {
      conversation.status = 'REJECTED';
    }
    
    // Extract final negotiated details
    const confirmationMsg = allMessages.find(m => m.type === 'STAKE_CONFIRMATION');
    const approvalMsg = allMessages.find(m => m.type === 'STAKE_APPROVAL');
    const finalDetails = confirmationMsg?.payload || approvalMsg?.payload || {};

    const avgBudget = memberBudgets.reduce((a, b) => a + b, 0) / memberBudgets.length;

    console.log('\n✅ Group Stake Negotiation Complete!');
    console.log(`   Status: ${conversation.status}`);
    console.log(`   Final Amount: ${finalDetails.negotiatedAmount || finalDetails.approvedAmount} HBAR`);
    console.log(`   Duration: ${conversation.endTime - conversation.startTime}ms`);

    return NextResponse.json({
      success: true,
      conversation,
      topicId,
      summary: {
        groupId,
        destination,
        memberCount,
        averageBudget: avgBudget,
        negotiatedAmount: finalDetails.negotiatedAmount || finalDetails.approvedAmount,
        originalAmount: finalDetails.originalAmount,
        status: conversation.status,
        duration: conversation.endTime - conversation.startTime,
        messageCount: allMessages.length,
        escrowAccountId: finalDetails.escrowAccountId,
        stakePercentage: finalDetails.stakePercentage || 6,
      },
    });

  } catch (error: any) {
    console.error('❌ Group Stake API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process group stake request' },
      { status: 500 }
    );
  }
}
