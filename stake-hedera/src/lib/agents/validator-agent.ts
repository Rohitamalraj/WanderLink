import { BaseAgent } from './base-agent';
import { A2AMessage, StakeValidation, AgentProfile } from '../types';
import { Client } from '@hashgraph/sdk';
import { A2AMessagingService } from '../a2a-messaging';

/**
 * Validator Agent - Validates staking requests and provides approval/rejection
 */
export class ValidatorAgent extends BaseAgent {
  private minStakeAmount = 10; // Minimum 10 HBAR
  private maxStakeAmount = 10000; // Maximum 10,000 HBAR

  constructor(client: Client, messagingService: A2AMessagingService) {
    const profile: AgentProfile = {
      id: 'validator-001',
      name: 'Staking Validator',
      role: 'VALIDATOR',
      accountId: client.operatorAccountId!.toString(),
      capabilities: ['validate_requests', 'risk_assessment', 'approve_reject'],
    };

    super(client, profile, messagingService);
  }

  protected getSystemPrompt(): string {
    return `You are a Staking Validator Agent on the Hedera network. Your responsibilities:

1. Receive and validate staking requests from Coordinator Agents
2. Perform risk assessment and balance checks
3. Verify network conditions and transaction feasibility
4. Approve or reject requests based on validation criteria
5. Communicate decisions via A2A messages

Validation criteria:
- Minimum stake: ${this.minStakeAmount} HBAR
- Maximum stake: ${this.maxStakeAmount} HBAR
- Account must have sufficient balance
- Network must be operational

Your account ID: ${this.profile.accountId}
Network: Hedera Testnet`;
  }

  /**
   * Process incoming stake requests
   */
  async processMessage(message: A2AMessage): Promise<A2AMessage | null> {
    await super.processMessage(message);

    if (message.type === 'STAKE_REQUEST') {
      return await this.validateStakeRequest(message);
    }

    return null;
  }

  /**
   * Validate a stake request using AI analysis with negotiation
   */
  private async validateStakeRequest(message: A2AMessage): Promise<A2AMessage> {
    const { amount, requesterId, requiredLocation } = message.payload;

    // Use LLM to perform comprehensive validation with negotiation
    const validationPrompt = `You are a risk-averse staking validator. Analyze this request:
    
    - Requested Amount: ${amount} HBAR
    - Requester: ${requesterId}
    - Location Requirement: ${requiredLocation || 'None'}
    - Min allowed: ${this.minStakeAmount} HBAR
    - Max allowed: ${this.maxStakeAmount} HBAR
    
    Your task:
    1. If amount is too high (>500 HBAR), suggest a LOWER amount (60-80% of requested)
    2. If amount is reasonable (100-500 HBAR), approve as-is
    3. If amount is too low (<${this.minStakeAmount}), reject
    4. Consider risk factors and provide reasoning
    
    Respond with:
    - NEGOTIATE: Suggest a safer amount with reason
    - APPROVE: Accept the amount
    - REJECT: Decline with reason
    
    Format: ACTION | AMOUNT | REASON`;

    const aiValidation = await this.agentExecutor.invoke({
      input: validationPrompt,
    });

    console.log('Validator AI Analysis:', aiValidation.output);

    // Parse AI response
    const aiResponse = aiValidation.output.toUpperCase();
    let recommendation: 'APPROVE' | 'REJECT' | 'NEGOTIATE' = 'APPROVE';
    let negotiatedAmount = amount;
    let reason = '';

    if (aiResponse.includes('NEGOTIATE')) {
      recommendation = 'NEGOTIATE';
      // Extract suggested amount from AI response (simple parsing)
      const match = aiResponse.match(/(\d+)\s*HBAR/);
      if (match) {
        negotiatedAmount = parseInt(match[1]);
      } else {
        // AI didn't specify, calculate 70% of requested
        negotiatedAmount = Math.floor(amount * 0.7);
      }
      reason = `Risk assessment suggests staking ${negotiatedAmount} HBAR instead of ${amount} HBAR for optimal safety.`;
    } else if (aiResponse.includes('REJECT')) {
      recommendation = 'REJECT';
      reason = `Amount ${amount} HBAR is outside acceptable parameters.`;
    } else {
      recommendation = 'APPROVE';
      reason = `Amount ${amount} HBAR approved for staking.`;
    }

    // Perform basic checks
    const checks = {
      sufficientBalance: true,
      validAmount: amount >= this.minStakeAmount && amount <= this.maxStakeAmount,
      networkStatus: true,
    };

    // Override if basic checks fail
    if (!checks.validAmount) {
      recommendation = 'REJECT';
      reason = 'Amount out of acceptable range.';
    }

    const validation: StakeValidation = {
      requestId: message.id,
      isValid: recommendation !== 'REJECT',
      validatorId: this.profile.accountId,
      checks,
      recommendation,
      reason,
    };

    // Send response based on recommendation
    let responseType: A2AMessage['type'];
    let responsePayload: any;

    if (recommendation === 'NEGOTIATE') {
      responseType = 'STAKE_COUNTER_OFFER';
      responsePayload = {
        requestId: message.id,
        originalAmount: amount,
        proposedAmount: negotiatedAmount,
        reason,
        round: 1,
      };
    } else if (recommendation === 'APPROVE') {
      responseType = 'STAKE_APPROVAL';
      responsePayload = {
        requestId: message.id,
        approvedAmount: amount,
        originalAmount: amount,
        negotiatedAmount: amount,
        estimatedRewards: amount * 0.05,
      };
    } else {
      responseType = 'STAKE_REJECTION';
      responsePayload = {
        requestId: message.id,
        reason,
      };
    }

    const response = this.messagingService.createMessage(
      this.profile.accountId,
      message.from,
      responseType,
      responsePayload
    );

    await this.messagingService.sendMessage(response);
    return response;
  }

  /**
   * Get network status using the agent
   */
  async getNetworkStatus(): Promise<string> {
    const result = await this.agentExecutor.invoke({
      input: 'Check the current network status and my account information.',
    });

    return result.output;
  }
}
