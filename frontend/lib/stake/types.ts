// Types for A2A messaging and agent communication for group staking
export interface A2AMessage {
  id: string;
  from: string;
  to: string;
  type: 'STAKE_REQUEST' | 'STAKE_COUNTER_OFFER' | 'STAKE_NEGOTIATION' | 'STAKE_APPROVAL' | 'STAKE_REJECTION' | 'STAKE_CONFIRMATION' | 'LOCATION_VERIFICATION' | 'FUNDS_RELEASE';
  payload: any;
  timestamp: number;
  signature?: string;
}

export interface GroupStakeRequest {
  groupId: string;
  destination: string;
  memberBudgets: number[];
  memberCount: number;
  requesterId: string;
}

export interface StakeNegotiation {
  requestId: string;
  originalAmount: number;
  proposedAmount: number;
  reason: string;
  round: number;
  averageBudget: number;
  stakePercentage: number;
}

export interface StakeValidation {
  requestId: string;
  isValid: boolean;
  validatorId: string;
  checks: {
    validBudgets: boolean;
    reasonableAmount: boolean;
    fairDistribution: boolean;
  };
  recommendation: 'APPROVE' | 'REJECT' | 'NEGOTIATE';
  reason?: string;
  aiAnalysis?: string;
}

export interface StakeApproval {
  requestId: string;
  approvedAmount: number;
  originalAmount: number;
  negotiatedAmount: number;
  transactionId?: string;
  escrowAccountId?: string;
  stakePercentage: number;
  averageBudget: number;
}

export interface AgentConversation {
  id: string;
  messages: A2AMessage[];
  status: 'INITIATED' | 'VALIDATING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED';
  startTime: number;
  endTime?: number;
}

export interface AgentProfile {
  id: string;
  name: string;
  role: 'COORDINATOR' | 'VALIDATOR' | 'EXECUTOR';
  accountId: string;
  capabilities: string[];
}
