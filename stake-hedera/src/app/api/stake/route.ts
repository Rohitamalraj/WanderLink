import { NextRequest, NextResponse } from 'next/server';
import { createHederaClient, validateHederaConfig } from '@/lib/hedera-client';
import { A2AMessagingService } from '@/lib/a2a-messaging';
import { CoordinatorAgent } from '@/lib/agents/coordinator-agent';
import { ValidatorAgent } from '@/lib/agents/validator-agent';
import { AgentConversation } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { amount, location } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be greater than 0.' },
        { status: 400 }
      );
    }

    // Validate environment configuration
    if (!validateHederaConfig()) {
      return NextResponse.json(
        { error: 'Missing Hedera configuration. Check environment variables.' },
        { status: 500 }
      );
    }

    // Initialize clients for both agents
    const coordinatorClient = createHederaClient({
      accountId: process.env.HEDERA_ACCOUNT_ID!,
      privateKey: process.env.HEDERA_PRIVATE_KEY!,
    });

    const validatorClient = createHederaClient({
      accountId: process.env.VALIDATOR_ACCOUNT_ID!,
      privateKey: process.env.VALIDATOR_PRIVATE_KEY!,
    });

    // Create A2A messaging services
    const coordinatorMessaging = new A2AMessagingService(coordinatorClient);
    const validatorMessaging = new A2AMessagingService(validatorClient);

    // Create or use existing topic
    let topicId = process.env.A2A_TOPIC_ID;
    if (!topicId) {
      topicId = await coordinatorMessaging.createMessageTopic();
      console.log('Created new A2A topic:', topicId);
      // Set the topic for both messaging services
      validatorMessaging.setTopicId(topicId);
    } else {
      coordinatorMessaging.setTopicId(topicId);
      validatorMessaging.setTopicId(topicId);
    }

    // Initialize agents
    const coordinator = new CoordinatorAgent(coordinatorClient, coordinatorMessaging);
    const validator = new ValidatorAgent(validatorClient, validatorMessaging);

    // Start the A2A conversation
    const conversationId = `conv_${Date.now()}`;
    const conversation: AgentConversation = {
      id: conversationId,
      messages: [],
      status: 'INITIATED',
      startTime: Date.now(),
    };

    // Step 1: Coordinator initiates stake request with location
    console.log('Step 1: Coordinator initiating stake request...');
    const initiationResult = await coordinator.initiateStakeRequest(
      amount,
      validator.getProfile().accountId,
      location
    );

    // Step 2: Validator processes the request
    console.log('Step 2: Validator processing request...');
    const coordinatorMessages = coordinator.getConversationHistory();
    const stakeRequest = coordinatorMessages[coordinatorMessages.length - 1];
    
    const validationResponse = await validator.processMessage(stakeRequest);

    // Step 3: Coordinator processes validator response (may include negotiation)
    console.log('Step 3: Coordinator processing validation response...');
    let finalResponse = validationResponse;
    
    if (validationResponse) {
      // Handle negotiation rounds
      if (validationResponse.type === 'STAKE_COUNTER_OFFER') {
        console.log('Step 4: Negotiation in progress...');
        finalResponse = await coordinator.processMessage(validationResponse);
      } else {
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
    const hasNegotiation = allMessages.some(m => m.type === 'STAKE_COUNTER_OFFER' || m.type === 'STAKE_NEGOTIATION');

    if (hasConfirmation) {
      conversation.status = 'COMPLETED';
    } else if (hasNegotiation && !hasConfirmation) {
      conversation.status = 'VALIDATING'; // Still negotiating
    } else if (hasApproval) {
      conversation.status = 'APPROVED';
    } else if (hasRejection) {
      conversation.status = 'REJECTED';
    }
    
    // Extract negotiation details
    const confirmationMsg = allMessages.find(m => m.type === 'STAKE_CONFIRMATION');
    const negotiationDetails = confirmationMsg?.payload || {};

    return NextResponse.json({
      success: true,
      conversation,
      topicId,
      summary: {
        requestedAmount: amount,
        finalAmount: negotiationDetails.negotiatedAmount || amount,
        originalAmount: negotiationDetails.originalAmount || amount,
        status: conversation.status,
        duration: conversation.endTime - conversation.startTime,
        messageCount: allMessages.length,
        escrowAccountId: negotiationDetails.escrowAccountId,
        location: location,
      },
    });

  } catch (error: any) {
    console.error('Stake API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process stake request' },
      { status: 500 }
    );
  }
}
