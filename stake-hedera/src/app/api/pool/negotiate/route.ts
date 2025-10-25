import { NextRequest, NextResponse } from 'next/server';
import { createHederaClient, validateHederaConfig } from '@/lib/hedera-client';
import { A2AMessagingService } from '@/lib/a2a-messaging';
import { CoordinatorAgent } from '@/lib/agents/coordinator-agent';
import { ValidatorAgent } from '@/lib/agents/validator-agent';
import { participantPool } from '@/lib/participant-pool';
import { usdToHbar } from '@/lib/contract';
import { getAgentStakingService } from '@/lib/agent-staking';

export async function POST(request: NextRequest) {
  try {
    const pool = participantPool.getPool();

    console.log('=== Negotiation Request ===');
    console.log('Participants:', pool.participants.length);
    console.log('Status:', pool.status);
    console.log('Participants:', pool.participants.map(p => ({ name: p.name, budget: p.budget })));

    if (pool.participants.length < 3) {
      console.error('❌ Not enough participants:', pool.participants.length);
      return NextResponse.json(
        { error: `Need at least 3 participants (currently ${pool.participants.length})` },
        { status: 400 }
      );
    }

    if (pool.status === 'ready_to_stake' || pool.status === 'completed') {
      console.error('❌ Negotiation already completed:', pool.status);
      return NextResponse.json(
        { error: 'Negotiation already completed' },
        { status: 400 }
      );
    }

    // Update status (allow retry if stuck in negotiating)
    console.log('✅ Starting negotiation...');
    participantPool.setStatus('negotiating');

    // Validate environment
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

    // Create messaging services
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
    const budgets = pool.participants.map(p => p.budget);
    const minBudget = Math.min(...budgets);
    const maxBudget = Math.max(...budgets);
    const avgBudget = budgets.reduce((sum, b) => sum + b, 0) / budgets.length;
    const medianBudget = [...budgets].sort((a, b) => a - b)[Math.floor(budgets.length / 2)];

    // Get common location
    const locations = pool.participants.map(p => p.location);
    const commonLocation = locations[0]; // Use first location

    // Coordinator analysis
    const coordinatorPrompt = `You are coordinating a group trip for ${pool.participants.length} people.

Analyze these participant budgets:
${pool.participants.map((p, i) => `${i + 1}. ${p.name}: $${p.budget} (wants to go to ${p.location})`).join('\n')}

Budget Statistics:
- Minimum: $${minBudget}
- Maximum: $${maxBudget}
- Average: $${avgBudget.toFixed(2)}
- Median: $${medianBudget}

Your task:
1. Decide a FAIR trip budget that works for everyone
2. Decide a STAKE PERCENTAGE (3-6%) to ensure commitment - MAXIMUM 6%!

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
    let proposedPercent = percentMatch ? parseInt(percentMatch[1]) : 5;
    // Enforce max 6% stake
    if (proposedPercent > 6) proposedPercent = 6;
    const coordinatorReasoning = reasoningMatch ? reasoningMatch[1].trim() : coordinatorOutput;

    // Validator review
    const validatorPrompt = `Review this group trip staking proposal:

Participants: ${pool.participants.length}
Budget Range: $${minBudget} - $${maxBudget}

Coordinator's Proposal:
- Trip Budget: $${proposedBudget}
- Stake: ${proposedPercent}% = $${Math.round((proposedBudget * proposedPercent) / 100)} per person

Validate and respond ONLY in this format (MAXIMUM 6% stake allowed):
DECISION: APPROVE or NEGOTIATE
TRIP_BUDGET: $XXXX
STAKE_PERCENT: X% (max 6%)
REASONING: [Your detailed reasoning in 2-3 sentences]`;

    const validatorAnalysis = await validator.execute(validatorPrompt);

    // Parse validator response
    const validatorOutput = validatorAnalysis.output;
    const valBudgetMatch = validatorOutput.match(/TRIP_BUDGET:\s*\$?(\d+)/);
    const valPercentMatch = validatorOutput.match(/STAKE_PERCENT:\s*(\d+)%/);
    const valReasoningMatch = validatorOutput.match(/REASONING:\s*(.+?)(?=\n\n|\n[A-Z_]+:|$)/s);

    const finalBudget = valBudgetMatch ? parseInt(valBudgetMatch[1]) : proposedBudget;
    let finalPercent = valPercentMatch ? parseInt(valPercentMatch[1]) : proposedPercent;
    // Enforce max 6% stake
    if (finalPercent > 6) finalPercent = 6;
    const validatorReasoning = valReasoningMatch ? valReasoningMatch[1].trim() : validatorOutput;

    // Calculate final amounts
    const stakeAmount = Math.round((finalBudget * finalPercent) / 100);
    const stakeAmountHbar = usdToHbar(stakeAmount, 0.05);
    const totalPool = stakeAmount * pool.participants.length;

    const finalReasoning = `After AI negotiation, we've agreed on a trip budget of $${finalBudget} with a ${finalPercent}% stake ($${stakeAmount} per person = ${stakeAmountHbar.toFixed(2)} HBAR). This ensures fair commitment from all ${pool.participants.length} participants. Total pool: $${totalPool}.`;

    // Save result
    participantPool.setNegotiationResult({
      agreedBudget: finalBudget,
      stakePercentage: finalPercent,
      stakeAmount: stakeAmount,
      stakeAmountHbar: stakeAmountHbar,
      totalPool: totalPool,
      coordinatorReasoning: coordinatorReasoning,
      validatorReasoning: validatorReasoning,
      finalReasoning: finalReasoning,
    });

    // 🤖 AGENT STAKING: Execute staking on behalf of users (ethers RPC path)
    let evmContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || process.env.AGENT_STAKING_EVM_ADDRESS;

    // Fallback: resolve EVM address from Mirror Node using CONTRACT_ID
    if (!evmContractAddress && process.env.CONTRACT_ID) {
      try {
        const mirrorNodeUrl = process.env.NEXT_PUBLIC_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com/api/v1';
        const res = await fetch(`${mirrorNodeUrl}/contracts/${process.env.CONTRACT_ID}`);
        if (res.ok) {
          const json = await res.json();
          // Mirror node returns evm_address in 0x format
          if (json && (json.evm_address || (json.contract && json.contract.evm_address))) {
            evmContractAddress = json.evm_address || json.contract.evm_address;
          }
        }
      } catch (e) {
        console.warn('Mirror node lookup failed:', e);
      }
    }

    if (evmContractAddress) {
      try {
        console.log('🤖 Initiating agent-based staking...');
        const stakingService = getAgentStakingService(evmContractAddress);
        
        // Prepare participants for staking
        const stakingParticipants = pool.participants.map(p => ({
          walletAddress: p.walletAddress,
          name: p.name,
          stakeAmount: stakeAmountHbar,
        }));
        
        // Generate unique trip ID (timestamp-based)
        const tripId = Date.now();
        
        // Agent stakes on behalf of all users (value + amount in 18-decimal wei)
        const stakingResult = await stakingService.stakeOnBehalfOfUsers(
          stakingParticipants,
          tripId
        );
        
        if (stakingResult.success) {
          console.log('✅ Agent staking completed successfully!');
          console.log('Transactions:', stakingResult.transactions);
          
          // Log HashScan links for verification
          console.log('\n' + '='.repeat(60));
          console.log('🔗 TRANSACTION LINKS (HashScan):');
          console.log('='.repeat(60));
          stakingResult.transactions.forEach((tx: string, i: number) => {
            console.log(`User ${i + 1}: https://hashscan.io/testnet/transaction/${tx}`);
          });
          console.log('='.repeat(60) + '\n');
          
          // Update pool status to completed
          participantPool.setStatus('completed');
          
          return NextResponse.json({
            success: true,
            agentStaked: true,
            tripId: tripId,
            transactions: stakingResult.transactions,
            negotiation: {
              originalBudgets: pool.participants.map(p => ({
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
        } else {
          console.error('❌ Agent staking failed:', stakingResult.error);
          // Still return success but indicate staking failed
          return NextResponse.json({
            success: true,
            agentStaked: false,
            stakingError: stakingResult.error,
            negotiation: {
              originalBudgets: pool.participants.map(p => ({
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
        }
      } catch (stakingError: any) {
        console.error('❌ Agent staking exception:', stakingError);
        // Continue without agent staking
      }
    } else {
      console.log('⚠️ No EVM contract address - skipping agent staking');
    }

    // Fallback: Return negotiation result without agent staking
    return NextResponse.json({
      success: true,
      agentStaked: false,
      negotiation: {
        originalBudgets: pool.participants.map(p => ({
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
    console.error('❌ Negotiation Error:', error);
    console.error('Error stack:', error.stack);
    participantPool.setStatus('waiting'); // Reset on error
    return NextResponse.json(
      { error: error.message || 'Failed to negotiate' },
      { status: 500 }
    );
  }
}
