import { BaseAgent } from './base-agent';
import { A2AMessage, GroupStakeRequest, AgentProfile, StakeNegotiation } from '../types';
import { Client } from '@hashgraph/sdk';
import { A2AMessagingService } from '../a2a-messaging';

/**
 * Coordinator Agent - Initiates group staking requests and coordinates with validator
 */
export class CoordinatorAgent extends BaseAgent {
  private negotiationRounds: number = 0;
  private maxNegotiationRounds: number = 2;

  constructor(client: Client, messagingService: A2AMessagingService) {
    const profile: AgentProfile = {
      id: 'coordinator-group-stake',
      name: 'Group Stake Coordinator',
      role: 'COORDINATOR',
      accountId: client.operatorAccountId!.toString(),
      capabilities: ['initiate_group_stake', 'process_approvals', 'negotiate_amounts'],
    };

    super(client, profile, messagingService);
  }

  protected getSystemPrompt(): string {
    return `You are a Group Staking Coordinator Agent for WanderLink travel groups on Hedera.

Your responsibilities:
1. Receive group staking requests with member budgets
2. Calculate fair stake amounts based on budgets
3. Communicate with the Validator Agent via A2A messages
4. Negotiate if needed to reach consensus
5. Report final approved amounts

You work autonomously to ensure fair stake distribution across all group members.
Account ID: ${this.profile.accountId}
Network: Hedera Testnet`;
  }

  /**
   * Initiate a group staking request
   */
  async initiateGroupStakeRequest(
    request: GroupStakeRequest,
    validatorAccountId: string
  ): Promise<string> {
    console.log('🚀 Coordinator: Initiating group stake request...');
    console.log(`   Group: ${request.groupId}`);
    console.log(`   Destination: ${request.destination}`);
    console.log(`   Members: ${request.memberCount}`);
    console.log(`   Budgets: ${request.memberBudgets.join(', ')}`);

    // Calculate average budget
    const avgBudget = request.memberBudgets.reduce((a, b) => a + b, 0) / request.memberBudgets.length;
    const proposedStake = Math.round(avgBudget * 0.06); // 6% of average budget

    console.log(`   Average Budget: $${avgBudget}`);
    console.log(`   Proposed Stake: ${proposedStake} HBAR (6%)`);

    // Send A2A message to validator
    await this.sendMessage(validatorAccountId, 'STAKE_REQUEST', {
      ...request,
      proposedStake,
      averageBudget: avgBudget,
      stakePercentage: 6,
    });

    return `Group stake request initiated. Proposed: ${proposedStake} HBAR`;
  }

  /**
   * Process response from validator
   */
  async processMessage(message: A2AMessage): Promise<A2AMessage | null> {
    await super.processMessage(message);

    if (message.type === 'STAKE_COUNTER_OFFER') {
      return await this.handleCounterOffer(message);
    } else if (message.type === 'STAKE_APPROVAL') {
      return await this.handleApproval(message);
    } else if (message.type === 'STAKE_REJECTION') {
      console.log('❌ Coordinator: Stake rejected:', message.payload.reason);
      return null;
    }

    return null;
  }

  /**
   * Handle counter-offer from validator
   */
  private async handleCounterOffer(message: A2AMessage): Promise<A2AMessage | null> {
    const { originalAmount, proposedAmount, reason, round } = message.payload;
    this.negotiationRounds++;

    console.log(`\n🤝 Negotiation Round ${round}:`);
    console.log(`   Original: ${originalAmount} HBAR`);
    console.log(`   Counter: ${proposedAmount} HBAR`);
    console.log(`   Reason: ${reason}`);

    // Accept if reasonable or max rounds reached
    if (this.negotiationRounds >= this.maxNegotiationRounds || Math.abs(proposedAmount - originalAmount) < 10) {
      console.log('   ✅ Accepting counter-offer');
      
      await this.sendMessage(message.from, 'STAKE_NEGOTIATION', {
        requestId: message.payload.requestId,
        decision: 'ACCEPT',
        finalAmount: proposedAmount,
        round: round + 1,
      });

      // Send confirmation
      const confirmationPayload = {
        requestId: message.payload.requestId,
        negotiatedAmount: proposedAmount,
        originalAmount,
        status: 'COMPLETED',
      };

      await this.sendMessage(message.from, 'STAKE_CONFIRMATION', confirmationPayload);
      
      return this.messagingService.createMessage(
        this.profile.accountId,
        message.from,
        'STAKE_CONFIRMATION',
        confirmationPayload
      );
    }

    return null;
  }

  /**
   * Handle approval from validator
   */
  private async handleApproval(message: A2AMessage): Promise<A2AMessage | null> {
    console.log('✅ Coordinator: Stake approved!');
    console.log(`   Amount: ${message.payload.approvedAmount} HBAR`);

    // Send confirmation
    const confirmationPayload = {
      requestId: message.payload.requestId,
      negotiatedAmount: message.payload.approvedAmount,
      originalAmount: message.payload.originalAmount,
      status: 'COMPLETED',
      escrowAccountId: message.payload.escrowAccountId,
    };

    await this.sendMessage(message.from, 'STAKE_CONFIRMATION', confirmationPayload);

    return this.messagingService.createMessage(
      this.profile.accountId,
      message.from,
      'STAKE_CONFIRMATION',
      confirmationPayload
    );
  }
}
