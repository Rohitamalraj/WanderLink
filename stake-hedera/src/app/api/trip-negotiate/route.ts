import { NextRequest, NextResponse } from 'next/server';
import { createHederaClient, validateHederaConfig } from '@/lib/hedera-client';
import { A2AMessagingService } from '@/lib/a2a-messaging';
import { CoordinatorAgent } from '@/lib/agents/coordinator-agent';
import { ValidatorAgent } from '@/lib/agents/validator-agent';

interface TripParticipant {
  name: string;
  walletAddress: string;
  budget: number;
}

interface TripRequest {
  tripName: string;
  tripDate: string;
  location: string;
  participants: TripParticipant[];
}

export async function POST(request: NextRequest) {
  try {
    const tripRequest: TripRequest = await request.json();

    if (!tripRequest.participants || tripRequest.participants.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 participants required' },
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
      validatorMessaging.setTopicId(topicId);
    } else {
      coordinatorMessaging.setTopicId(topicId);
      validatorMessaging.setTopicId(topicId);
    }

    // Initialize agents
    const coordinator = new CoordinatorAgent(coordinatorClient, coordinatorMessaging);
    const validator = new ValidatorAgent(validatorClient, validatorMessaging);

    // Calculate budget statistics
    const budgets = tripRequest.participants.map(p => p.budget);
    const minBudget = Math.min(...budgets);
    const maxBudget = Math.max(...budgets);
    const avgBudget = budgets.reduce((sum, b) => sum + b, 0) / budgets.length;
    const medianBudget = [...budgets].sort((a, b) => a - b)[Math.floor(budgets.length / 2)];

    // Step 1: Coordinator proposes budget and stake
    console.log('Step 1: Coordinator analyzing budgets...');
    
    const coordinatorPrompt = `You are coordinating a group trip: "${tripRequest.tripName}" to ${tripRequest.location}.

Analyze these ${tripRequest.participants.length} participant budgets:
${tripRequest.participants.map((p, i) => `${i + 1}. ${p.name}: $${p.budget}`).join('\n')}

Budget Statistics:
- Minimum: $${minBudget}
- Maximum: $${maxBudget}
- Average: $${avgBudget.toFixed(2)}
- Median: $${medianBudget}

Your task:
1. Decide a FAIR trip budget that works for everyone
   - Should be affordable for the lowest budget person
   - Should be reasonable for the highest budget person
   - Consider median/average as fair middle ground

2. Decide a STAKE PERCENTAGE (3-10%)
   - High enough to ensure commitment
   - Low enough to not be burdensome
   - Everyone pays SAME dollar amount (percentage of agreed budget)

Respond ONLY in this format:
TRIP_BUDGET: $XXXX
STAKE_PERCENT: X%
REASONING: [Your detailed reasoning in 2-3 sentences explaining why these numbers are fair for all participants]`;

    const coordinatorAnalysis = await coordinator.execute(coordinatorPrompt);

    console.log('Coordinator Analysis:', coordinatorAnalysis.output);

    // Parse coordinator response
    const coordinatorOutput = coordinatorAnalysis.output;
    const budgetMatch = coordinatorOutput.match(/TRIP_BUDGET:\s*\$?(\d+)/);
    const percentMatch = coordinatorOutput.match(/STAKE_PERCENT:\s*(\d+)%/);
    const reasoningMatch = coordinatorOutput.match(/REASONING:\s*(.+?)(?=\n\n|\n[A-Z_]+:|$)/s);

    const proposedBudget = budgetMatch ? parseInt(budgetMatch[1]) : Math.round(medianBudget);
    const proposedPercent = percentMatch ? parseInt(percentMatch[1]) : 5;
    const coordinatorReasoning = reasoningMatch ? reasoningMatch[1].trim() : coordinatorOutput;

    // Step 2: Validator reviews and negotiates
    console.log('Step 2: Validator reviewing proposal...');

    const validatorPrompt = `Review this group trip staking proposal:

Trip: "${tripRequest.tripName}" to ${tripRequest.location}
Participants: ${tripRequest.participants.length}
Budget Range: $${minBudget} - $${maxBudget}

Coordinator's Proposal:
- Trip Budget: $${proposedBudget}
- Stake: ${proposedPercent}% = $${Math.round((proposedBudget * proposedPercent) / 100)} per person

Original Budgets:
${tripRequest.participants.map((p, i) => `${i + 1}. ${p.name}: $${p.budget}`).join('\n')}

Validate:
1. Is $${proposedBudget} fair for all participants?
   - Can the lowest budget person ($${minBudget}) afford it?
   - Is it reasonable for the highest budget person ($${maxBudget})?

2. Is ${proposedPercent}% ($${Math.round((proposedBudget * proposedPercent) / 100)}) a reasonable stake?
   - Enough to ensure commitment?
   - Not too burdensome?

Respond ONLY in this format:
DECISION: APPROVE or NEGOTIATE
TRIP_BUDGET: $XXXX (your suggested budget, can be same or different)
STAKE_PERCENT: X% (your suggested percentage, can be same or different)
REASONING: [Your detailed reasoning in 2-3 sentences explaining your decision]`;

    const validatorAnalysis = await validator.execute(validatorPrompt);

    console.log('Validator Analysis:', validatorAnalysis.output);

    // Parse validator response
    const validatorOutput = validatorAnalysis.output;
    const valBudgetMatch = validatorOutput.match(/TRIP_BUDGET:\s*\$?(\d+)/);
    const valPercentMatch = validatorOutput.match(/STAKE_PERCENT:\s*(\d+)%/);
    const valReasoningMatch = validatorOutput.match(/REASONING:\s*(.+?)(?=\n\n|\n[A-Z_]+:|$)/s);

    const finalBudget = valBudgetMatch ? parseInt(valBudgetMatch[1]) : proposedBudget;
    const finalPercent = valPercentMatch ? parseInt(valPercentMatch[1]) : proposedPercent;
    const validatorReasoning = valReasoningMatch ? valReasoningMatch[1].trim() : validatorOutput;

    // Calculate final amounts
    const stakeAmount = Math.round((finalBudget * finalPercent) / 100);
    const totalPool = stakeAmount * tripRequest.participants.length;

    // Generate final reasoning
    const finalReasoning = `After negotiation, we've agreed on a trip budget of $${finalBudget} with a ${finalPercent}% stake ($${stakeAmount} per person). This ensures fair commitment from all ${tripRequest.participants.length} participants while keeping the stake reasonable. Total pool: $${totalPool}.`;

    return NextResponse.json({
      success: true,
      negotiation: {
        originalBudgets: tripRequest.participants.map(p => ({
          name: p.name,
          budget: p.budget,
        })),
        agreedBudget: finalBudget,
        stakePercentage: finalPercent,
        stakeAmount: stakeAmount,
        totalPool: totalPool,
        coordinatorReasoning: coordinatorReasoning,
        validatorReasoning: validatorReasoning,
        finalReasoning: finalReasoning,
      },
      tripDetails: {
        tripName: tripRequest.tripName,
        tripDate: tripRequest.tripDate,
        location: tripRequest.location,
        participants: tripRequest.participants,
      },
      topicId,
    });

  } catch (error: any) {
    console.error('Trip Negotiation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to negotiate trip terms' },
      { status: 500 }
    );
  }
}
