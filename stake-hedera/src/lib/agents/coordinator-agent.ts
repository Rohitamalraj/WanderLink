import { BaseAgent } from './base-agent';
import { A2AMessage, StakeRequest, AgentProfile, StakeNegotiation } from '../types';
import { Client } from '@hashgraph/sdk';
import { A2AMessagingService } from '../a2a-messaging';
import { EscrowService } from '../escrow-service';

/**
 * Coordinator Agent - Initiates staking requests and coordinates with validator
 */
export class CoordinatorAgent extends BaseAgent {
  private escrowService: EscrowService;
  private negotiationRounds: number = 0;
  private maxNegotiationRounds: number = 3;

  constructor(client: Client, messagingService: A2AMessagingService) {
    const profile: AgentProfile = {
      id: 'coordinator-001',
      name: 'Staking Coordinator',
      role: 'COORDINATOR',
      accountId: client.operatorAccountId!.toString(),
      capabilities: ['initiate_stake', 'process_approvals', 'execute_transactions'],
    };

    super(client, profile, messagingService);
    this.escrowService = new EscrowService(client);
  }

  protected getSystemPrompt(): string {
    return `You are a Staking Coordinator Agent on the Hedera network. Your responsibilities:
    
1. Receive staking requests from users
2. Validate request parameters (amount, token type)
3. Communicate with the Validator Agent via A2A messages
4. Execute approved staking transactions
5. Report results back to the user

You work autonomously but follow strict validation protocols. Always communicate clearly
with other agents using the A2A message standard. When executing transactions, ensure
all parameters are correct and provide detailed feedback.

Your account ID: ${this.profile.accountId}
Network: Hedera Testnet`;
  }

  /**
   * Initiate a staking request with location requirement
   */
  async initiateStakeRequest(
    amount: number,
    validatorAccountId: string,
    requiredLocation?: string
  ): Promise<string> {
    const stakeRequest: StakeRequest = {
      amount,
      requesterId: this.profile.accountId,
      tokenId: 'HBAR',
      duration: 30,
      requiredLocation,
    };

    // Use LLM to analyze the request
    const analysis = await this.agentExecutor.invoke({
      input: `Analyze this staking request: User wants to stake ${amount} HBAR. 
              Check if this is a reasonable amount and provide your assessment.`,
    });

    console.log('Coordinator Analysis:', analysis.output);

    // Send A2A message to validator
    await this.sendMessage(validatorAccountId, 'STAKE_REQUEST', stakeRequest);

    return `Stake request initiated for ${amount} HBAR. Awaiting validator approval.`;
  }

  /**
   * Process response from validator (including negotiation)
   */
  async processMessage(message: A2AMessage): Promise<A2AMessage | null> {
    await super.processMessage(message);

    if (message.type === 'STAKE_COUNTER_OFFER') {
      return await this.handleCounterOffer(message);
    } else if (message.type === 'STAKE_APPROVAL') {
      return await this.executeStake(message);
    } else if (message.type === 'STAKE_REJECTION') {
      console.log('Stake rejected:', message.payload.reason);
      return null;
    }

    return null;
  }

  /**
   * Handle counter-offer from validator (negotiation)
   */
  private async handleCounterOffer(message: A2AMessage): Promise<A2AMessage | null> {
    const { originalAmount, proposedAmount, reason, round } = message.payload;
    this.negotiationRounds++;

    console.log(`\n🤝 Negotiation Round ${round}:`);
    console.log(`   Original: ${originalAmount} HBAR`);
    console.log(`   Proposed: ${proposedAmount} HBAR`);
    console.log(`   Reason: ${reason}`);

    // Check if we've exceeded max negotiation rounds
    if (this.negotiationRounds >= this.maxNegotiationRounds) {
      console.log('   ❌ Max negotiation rounds reached. Accepting proposed amount.');
      return await this.acceptCounterOffer(message);
    }

    // Use AI to decide whether to accept or counter
    const negotiationPrompt = `You are negotiating a staking amount:
    
    - You originally requested: ${originalAmount} HBAR
    - Validator proposes: ${proposedAmount} HBAR
    - Their reason: ${reason}
    - Negotiation round: ${round}/${this.maxNegotiationRounds}
    
    Should you:
    1. ACCEPT their proposal
    2. COUNTER with a middle ground (split the difference)
    3. REJECT and end negotiation
    
    Consider: The validator is risk-averse. Meeting halfway shows good faith.
    Respond with: ACCEPT | COUNTER | REJECT and your reasoning.`;

    const aiDecision = await this.agentExecutor.invoke({
      input: negotiationPrompt,
    });

    console.log('   🤖 Coordinator AI Decision:', aiDecision.output);

    const decision = aiDecision.output.toUpperCase();

    if (decision.includes('ACCEPT')) {
      return await this.acceptCounterOffer(message);
    } else if (decision.includes('COUNTER')) {
      return await this.sendCounterOffer(message, originalAmount, proposedAmount, round);
    } else {
      console.log('   ❌ Negotiation failed. Rejecting.');
      return null;
    }
  }

  /**
   * Accept validator's counter-offer
   */
  private async acceptCounterOffer(message: A2AMessage): Promise<A2AMessage> {
    const { proposedAmount, requestId } = message.payload;

    console.log(`   ✅ Accepting ${proposedAmount} HBAR`);

    // Send acceptance and proceed to stake
    const acceptance = this.messagingService.createMessage(
      this.profile.accountId,
      message.from,
      'STAKE_NEGOTIATION',
      {
        requestId,
        accepted: true,
        finalAmount: proposedAmount,
        message: `Agreed to stake ${proposedAmount} HBAR`,
      }
    );

    await this.messagingService.sendMessage(acceptance);

    // Execute stake with negotiated amount
    return await this.executeStake({
      ...message,
      type: 'STAKE_APPROVAL',
      payload: {
        requestId,
        approvedAmount: proposedAmount,
        negotiatedAmount: proposedAmount,
        originalAmount: message.payload.originalAmount,
      },
    });
  }

  /**
   * Send counter-offer back to validator
   */
  private async sendCounterOffer(
    message: A2AMessage,
    originalAmount: number,
    proposedAmount: number,
    round: number
  ): Promise<A2AMessage> {
    // Calculate middle ground
    const counterAmount = Math.floor((originalAmount + proposedAmount) / 2);

    console.log(`   🔄 Counter-offering ${counterAmount} HBAR (middle ground)`);

    const counterOffer = this.messagingService.createMessage(
      this.profile.accountId,
      message.from,
      'STAKE_COUNTER_OFFER',
      {
        requestId: message.payload.requestId,
        originalAmount,
        proposedAmount: counterAmount,
        reason: `Counter-offer: Let's meet in the middle at ${counterAmount} HBAR`,
        round: round + 1,
      }
    );

    await this.messagingService.sendMessage(counterOffer);
    return counterOffer;
  }

  /**
   * Execute the actual staking transaction with escrow
   */
  private async executeStake(approvalMessage: A2AMessage): Promise<A2AMessage> {
    const { approvedAmount, negotiatedAmount, originalAmount } = approvalMessage.payload;
    const finalAmount = negotiatedAmount || approvedAmount;

    console.log(`\n💰 Executing Stake:`);
    console.log(`   Original Request: ${originalAmount || finalAmount} HBAR`);
    console.log(`   Final Amount: ${finalAmount} HBAR`);

    // Create escrow account
    const escrow = await this.escrowService.createEscrowAccount();
    console.log(`   🔒 Escrow Account Created: ${escrow.accountId}`);

    // Lock funds in escrow (simulated)
    console.log(`   🔒 Locking ${finalAmount} HBAR in escrow...`);
    // In production: await this.escrowService.lockFunds(this.profile.accountId, finalAmount);

    // Use the agent to check balance
    const result = await this.agentExecutor.invoke({
      input: `Check my current HBAR balance and confirm I can stake ${finalAmount} HBAR.`,
    });

    console.log('   ✅ Balance Check:', result.output);

    // Send confirmation back
    const confirmation = this.messagingService.createMessage(
      this.profile.accountId,
      approvalMessage.from,
      'STAKE_CONFIRMATION',
      {
        requestId: approvalMessage.payload.requestId,
        amount: finalAmount,
        originalAmount: originalAmount || finalAmount,
        negotiatedAmount: finalAmount,
        status: 'LOCKED_IN_ESCROW',
        escrowAccountId: escrow.accountId,
        transactionDetails: result.output,
        message: `${finalAmount} HBAR locked in escrow. Awaiting location verification for release.`,
      }
    );

    await this.messagingService.sendMessage(confirmation);
    return confirmation;
  }

  /**
   * Release funds from escrow after location verification
   */
  async releaseFunds(escrowAccountId: string, amount: number, toAccountId: string): Promise<string> {
    console.log(`\n🔓 Releasing ${amount} HBAR from escrow...`);
    // In production: return await this.escrowService.releaseFunds(toAccountId, amount);
    return `Funds released: ${amount} HBAR to ${toAccountId}`;
  }

  getEscrowService(): EscrowService {
    return this.escrowService;
  }

  /**
   * Get account balance using the agent
   */
  async getBalance(): Promise<string> {
    const result = await this.agentExecutor.invoke({
      input: "What's my current HBAR balance?",
    });

    return result.output;
  }
}
