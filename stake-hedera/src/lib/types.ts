// Types for A2A messaging and agent communication
export interface A2AMessage {
  id: string;
  from: string;
  to: string;
  type: 'STAKE_REQUEST' | 'STAKE_COUNTER_OFFER' | 'STAKE_NEGOTIATION' | 'STAKE_APPROVAL' | 'STAKE_REJECTION' | 'STAKE_CONFIRMATION' | 'LOCATION_VERIFICATION' | 'FUNDS_RELEASE';
  payload: any;
  timestamp: number;
  signature?: string;
}

export interface StakeRequest {
  amount: number;
  requesterId: string;
  tokenId?: string;
  duration?: number;
  requiredLocation?: string; // Location for fund release
}

export interface StakeNegotiation {
  requestId: string;
  originalAmount: number;
  proposedAmount: number;
  reason: string;
  round: number;
}

export interface StakeValidation {
  requestId: string;
  isValid: boolean;
  validatorId: string;
  checks: {
    sufficientBalance: boolean;
    validAmount: boolean;
    networkStatus: boolean;
  };
  recommendation: 'APPROVE' | 'REJECT' | 'NEGOTIATE';
  reason?: string;
}

export interface StakeApproval {
  requestId: string;
  approvedAmount: number;
  originalAmount: number;
  negotiatedAmount: number;
  transactionId?: string;
  estimatedRewards?: number;
  escrowAccountId?: string;
}

export interface LocationVerification {
  requestId: string;
  requiredLocation: string;
  verifiedLocation: string;
  isMatch: boolean;
  timestamp: number;
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
