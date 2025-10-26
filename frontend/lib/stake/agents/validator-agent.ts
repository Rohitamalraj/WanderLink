import { BaseAgent } from './base-agent';
import { A2AMessage, StakeValidation, AgentProfile } from '../types';
import { Client } from '@hashgraph/sdk';
import { A2AMessagingService } from '../a2a-messaging';

/**
 * Validator Agent - Validates group staking requests using AI
 */
export class ValidatorAgent extends BaseAgent {
  constructor(client: Client, messagingService: A2AMessagingService) {
    const profile: AgentProfile = {
      id: 'validator-group-stake',
      name: 'Group Stake Validator',
      role: 'VALIDATOR',
      accountId: client.operatorAccountId!.toString(),
      capabilities: ['validate_stakes', 'ai_analysis', 'risk_assessment'],
    };

    super(client, profile, messagingService);
  }

  protected getSystemPrompt(): string {
    return `You are a Group Staking Validator Agent for WanderLink travel groups on Hedera.

Your responsibilities:
1. Validate group staking requests
2. Analyze member budgets for fairness
3. Assess risk and recommend stake amounts
4. Approve, reject, or negotiate amounts
5. Ensure all members are treated fairly

You use AI to make intelligent decisions about stake amounts based on:
- Average group budget
- Budget variance among members
- Trip destination and duration
- Risk factors

Account ID: ${this.profile.accountId}
Network: Hedera Testnet`;
  }

  /**
   * Process stake request from coordinator
   */
  async processMessage(message: A2AMessage): Promise<A2AMessage | null> {
    await super.processMessage(message);

    if (message.type === 'STAKE_REQUEST') {
      return await this.validateStakeRequest(message);
    } else if (message.type === 'STAKE_NEGOTIATION') {
      return await this.handleNegotiationResponse(message);
    }

    return null;
  }

  /**
   * Validate a group staking request using AI
   */
  private async validateStakeRequest(message: A2AMessage): Promise<A2AMessage> {
    const { groupId, destination, memberBudgets, memberCount, proposedStake, averageBudget } = message.payload;

    console.log('\n🤖 Validator: Analyzing group stake request...');
    console.log(`   Group: ${groupId}`);
    console.log(`   Destination: ${destination}`);
    console.log(`   Budgets: ${memberBudgets.join(', ')}`);
    console.log(`   Proposed: ${proposedStake} HBAR`);

    // Use AI to analyze the request
    const aiPrompt = `Analyze this travel group staking request:

Group Details:
- Destination: ${destination}
- Members: ${memberCount}
- Member Budgets: $${memberBudgets.join(', $')}
- Average Budget: $${averageBudget}
- Proposed Stake: ${proposedStake} HBAR (6% of average)

Evaluate:
1. Is the stake amount fair for all members?
2. Is 6% reasonable for this trip?
3. Should we approve, negotiate, or reject?

Provide your recommendation: APPROVE, NEGOTIATE (with new amount), or REJECT (with reason).
Be concise and specific.`;

    const aiResponse = await this.executeAI(aiPrompt);
    console.log(`   AI Analysis: ${aiResponse}`);

    // Parse AI response to determine action
    const shouldApprove = aiResponse.toLowerCase().includes('approve');
    const shouldNegotiate = aiResponse.toLowerCase().includes('negotiate');

    if (shouldApprove) {
      return await this.approveStake(message, proposedStake, aiResponse);
    } else if (shouldNegotiate) {
      // Extract suggested amount from AI response or calculate
      const suggestedAmount = this.extractAmountFromAI(aiResponse) || Math.round(proposedStake * 0.8);
      return await this.proposeCounterOffer(message, proposedStake, suggestedAmount, aiResponse);
    } else {
      return await this.rejectStake(message, aiResponse);
    }
  }

  /**
   * Approve the stake request
   */
  private async approveStake(
    originalMessage: A2AMessage,
    approvedAmount: number,
    aiAnalysis: string
  ): Promise<A2AMessage> {
    console.log(`✅ Validator: Approving ${approvedAmount} HBAR`);

    const approvalPayload = {
      requestId: originalMessage.id,
      approvedAmount,
      originalAmount: approvedAmount,
      negotiatedAmount: approvedAmount,
      escrowAccountId: this.profile.accountId,
      aiAnalysis,
      stakePercentage: 6,
      averageBudget: originalMessage.payload.averageBudget,
    };

    await this.sendMessage(originalMessage.from, 'STAKE_APPROVAL', approvalPayload);

    return this.messagingService.createMessage(
      this.profile.accountId,
      originalMessage.from,
      'STAKE_APPROVAL',
      approvalPayload
    );
  }

  /**
   * Propose a counter-offer
   */
  private async proposeCounterOffer(
    originalMessage: A2AMessage,
    originalAmount: number,
    proposedAmount: number,
    reason: string
  ): Promise<A2AMessage> {
    console.log(`🤝 Validator: Proposing counter-offer: ${proposedAmount} HBAR`);

    const counterOfferPayload = {
      requestId: originalMessage.id,
      originalAmount,
      proposedAmount,
      reason,
      round: 1,
    };

    await this.sendMessage(originalMessage.from, 'STAKE_COUNTER_OFFER', counterOfferPayload);

    return this.messagingService.createMessage(
      this.profile.accountId,
      originalMessage.from,
      'STAKE_COUNTER_OFFER',
      counterOfferPayload
    );
  }

  /**
   * Reject the stake request
   */
  private async rejectStake(originalMessage: A2AMessage, reason: string): Promise<A2AMessage> {
    console.log(`❌ Validator: Rejecting stake - ${reason}`);

    const rejectionPayload = {
      requestId: originalMessage.id,
      reason,
    };

    await this.sendMessage(originalMessage.from, 'STAKE_REJECTION', rejectionPayload);

    return this.messagingService.createMessage(
      this.profile.accountId,
      originalMessage.from,
      'STAKE_REJECTION',
      rejectionPayload
    );
  }

  /**
   * Handle negotiation response from coordinator
   */
  private async handleNegotiationResponse(message: A2AMessage): Promise<A2AMessage | null> {
    const { decision, finalAmount } = message.payload;

    if (decision === 'ACCEPT') {
      console.log(`✅ Validator: Coordinator accepted ${finalAmount} HBAR`);
      // Negotiation complete, coordinator will send confirmation
      return null;
    }

    return null;
  }

  /**
   * Extract amount from AI response (simple regex)
   */
  private extractAmountFromAI(aiResponse: string): number | null {
    const match = aiResponse.match(/(\d+)\s*HBAR/i);
    return match ? parseInt(match[1]) : null;
  }
}
