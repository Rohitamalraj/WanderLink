import { NextRequest, NextResponse } from 'next/server';
import { createHederaClient, validateHederaConfig } from '@/lib/hedera-client';
import { A2AMessagingService } from '@/lib/a2a-messaging';
import { CoordinatorAgent } from '@/lib/agents/coordinator-agent';
import { ValidatorAgent } from '@/lib/agents/validator-agent';
import { tripSessionStore } from '@/lib/trip-sessions';
import { usdToHbar } from '@/lib/contract';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = tripSessionStore.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.participants.length < session.minParticipants) {
      return NextResponse.json(
        { error: `Need at least ${session.minParticipants} participants` },
        { status: 400 }
      );
    }

    // Update status to negotiating
    tripSessionStore.updateSessionStatus(sessionId, 'negotiating');

    // Validate environment configuration
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

    // Create A2A messaging services
    const coordinatorMessaging = new A2AMessagingService(coordinatorClient);
    const validatorMessaging = new A2AMessagingService(validatorClient);

    // Create or use existing topic
    let topicId = process.env.A2A_TOPIC_ID;
    if (!topicId) {
      topicId = await coordinatorMessaging.createMessageTopic();
      validatorMessaging.setTopicId(topicId);
    } else {
      coordinatorMessaging.setTopicId(topicId);
      validatorMessaging.setTopicId(topicId);
    }

    // Initialize agents
    const coordinator = new CoordinatorAgent(coordinatorClient, coordinatorMessaging);
    const validator = new ValidatorAgent(validatorClient, validatorMessaging);

    // Calculate budget statistics
    const budgets = session.participants.map(p => p.budget);
    const minBudget = Math.min(...budgets);
    const maxBudget = Math.max(...budgets);
    const avgBudget = budgets.reduce((sum, b) => sum + b, 0) / budgets.length;
    const medianBudget = [...budgets].sort((a, b) => a - b)[Math.floor(budgets.length / 2)];

    // Coordinator analysis
    const coordinatorPrompt = `You are coordinating a group trip: "${session.tripName}" to ${session.location}.

Analyze these ${session.participants.length} participant budgets:
${session.participants.map((p, i) => `${i + 1}. ${p.name}: $${p.budget}`).join('\n')}

Budget Statistics:
- Minimum: $${minBudget}
- Maximum: $${maxBudget}
- Average: $${avgBudget.toFixed(2)}
- Median: $${medianBudget}

Your task:
1. Decide a FAIR trip budget that works for everyone
2. Decide a STAKE PERCENTAGE (3-10%)

Respond ONLY in this format:
TRIP_BUDGET: $XXXX
STAKE_PERCENT: X%
REASONING: [Your detailed reasoning in 2-3 sentences]`;

    const coordinatorAnalysis = await coordinator.execute(coordinatorPrompt);

    // Parse coordinator response
    const coordinatorOutput = coordinatorAnalysis.output;
    const budgetMatch = coordinatorOutput.match(/TRIP_BUDGET:\s*\$?(\d+)/);
    const percentMatch = coordinatorOutput.match(/STAKE_PERCENT:\s*(\d+)%/);
    const reasoningMatch = coordinatorOutput.match(/REASONING:\s*(.+?)(?=\n\n|\n[A-Z_]+:|$)/s);

    const proposedBudget = budgetMatch ? parseInt(budgetMatch[1]) : Math.round(medianBudget);
    const proposedPercent = percentMatch ? parseInt(percentMatch[1]) : 5;
    const coordinatorReasoning = reasoningMatch ? reasoningMatch[1].trim() : coordinatorOutput;

    // Validator review
    const validatorPrompt = `Review this group trip staking proposal:

Trip: "${session.tripName}" to ${session.location}
Participants: ${session.participants.length}
Budget Range: $${minBudget} - $${maxBudget}

Coordinator's Proposal:
- Trip Budget: $${proposedBudget}
- Stake: ${proposedPercent}% = $${Math.round((proposedBudget * proposedPercent) / 100)} per person

Validate and respond ONLY in this format:
DECISION: APPROVE or NEGOTIATE
TRIP_BUDGET: $XXXX
STAKE_PERCENT: X%
REASONING: [Your detailed reasoning in 2-3 sentences]`;

    const validatorAnalysis = await validator.execute(validatorPrompt);

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
    const stakeAmountHbar = usdToHbar(stakeAmount, 0.05);
    const totalPool = stakeAmount * session.participants.length;

    const finalReasoning = `After negotiation, we've agreed on a trip budget of $${finalBudget} with a ${finalPercent}% stake ($${stakeAmount} per person = ${stakeAmountHbar.toFixed(2)} HBAR). This ensures fair commitment from all ${session.participants.length} participants. Total pool: $${totalPool}.`;

    // Save negotiation result to session
    tripSessionStore.setNegotiationResult(sessionId, {
      agreedBudget: finalBudget,
      stakePercentage: finalPercent,
      stakeAmount: stakeAmount,
      stakeAmountHbar: stakeAmountHbar,
      totalPool: totalPool,
      coordinatorReasoning: coordinatorReasoning,
      validatorReasoning: validatorReasoning,
      finalReasoning: finalReasoning,
    });

    return NextResponse.json({
      success: true,
      sessionId,
      negotiation: {
        originalBudgets: session.participants.map(p => ({
          name: p.name,
          budget: p.budget,
        })),
        agreedBudget: finalBudget,
        stakePercentage: finalPercent,
        stakeAmount: stakeAmount,
        stakeAmountHbar: stakeAmountHbar,
        totalPool: totalPool,
        coordinatorReasoning: coordinatorReasoning,
        validatorReasoning: validatorReasoning,
        finalReasoning: finalReasoning,
      },
    });

  } catch (error: any) {
    console.error('Negotiation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to negotiate' },
      { status: 500 }
    );
  }
}
