/**
 * TravelAgent - ASI Agent for individual travelers
 * 
 * Each user has their own TravelAgent that represents their travel preferences,
 * constraints, and negotiation strategies. Agents communicate with each other
 * to find optimal group matches.
 */

export interface TravelPreferences {
  // Trip details
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Group preferences
  groupSize: {
    min: number;
    max: number;
  };
  
  // Activity preferences (0-1 scale)
  activities: {
    adventure: number;
    culture: number;
    relaxation: number;
    foodie: number;
    nightlife: number;
    nature: number;
  };
  
  // Travel style
  travelStyle: {
    luxury: number;        // 0 = budget, 1 = luxury
    flexibility: number;   // 0 = rigid schedule, 1 = go with flow
    socialLevel: number;   // 0 = quiet/introverted, 1 = very social
  };
  
  // Hard constraints
  constraints: {
    dietaryRestrictions?: string[];
    accessibility?: string[];
    languages?: string[];
    mustHaveActivities?: string[];
    dealBreakers?: string[];
  };
}

export interface TravelAgent {
  // Identity
  id: string;
  walletAddress: string;
  reputationScore: number;
  
  // Preferences
  preferences: TravelPreferences;
  
  // Agent state
  isActive: boolean;
  currentNegotiations: string[];
  
  // Agent methods
  initialize(): Promise<void>;
  calculateSynergy(otherAgent: TravelAgent): number;
  proposeMatch(agents: TravelAgent[]): MatchProposal;
  evaluateProposal(proposal: MatchProposal): ProposalEvaluation;
  negotiate(proposal: MatchProposal, round: number): NegotiationResponse;
  acceptMatch(proposalId: string): Promise<void>;
  rejectMatch(proposalId: string, reason: string): Promise<void>;
}

export interface MatchProposal {
  id: string;
  agents: string[]; // Agent IDs
  destination: string;
  dates: {
    start: Date;
    end: Date;
  };
  estimatedCost: number;
  activities: string[];
  synergyScore: number; // 0-100
  confidence: number;   // 0-1
  createdAt: Date;
  status: 'proposed' | 'negotiating' | 'accepted' | 'rejected';
}

export interface ProposalEvaluation {
  score: number; // 0-100
  concerns: string[];
  suggestions: string[];
  willingness: 'accept' | 'negotiate' | 'reject';
}

export interface NegotiationResponse {
  action: 'accept' | 'counter' | 'reject';
  counterProposal?: Partial<MatchProposal>;
  message: string;
}

/**
 * TravelAgentImpl - Implementation of the ASI agent
 */
export class TravelAgentImpl implements TravelAgent {
  id: string;
  walletAddress: string;
  reputationScore: number;
  preferences: TravelPreferences;
  isActive: boolean = false;
  currentNegotiations: string[] = [];

  constructor(
    id: string,
    walletAddress: string,
    preferences: TravelPreferences,
    reputationScore: number = 0
  ) {
    this.id = id;
    this.walletAddress = walletAddress;
    this.preferences = preferences;
    this.reputationScore = reputationScore;
  }

  async initialize(): Promise<void> {
    console.log(`[Agent ${this.id}] Initializing...`);
    // TODO: Connect to Fetch.ai agent network
    // TODO: Register on Agentverse
    this.isActive = true;
    console.log(`[Agent ${this.id}] Active and ready`);
  }

  /**
   * Calculate synergy score with another agent (0-100)
   */
  calculateSynergy(otherAgent: TravelAgent): number {
    let synergyScore = 0;
    let totalWeight = 0;

    // 1. Check destination match (30% weight)
    const destinationMatch = this.preferences.destination === otherAgent.preferences.destination ? 1 : 0;
    synergyScore += destinationMatch * 30;
    totalWeight += 30;

    // 2. Check date overlap (20% weight)
    const dateOverlap = this.calculateDateOverlap(
      this.preferences.startDate,
      this.preferences.endDate,
      otherAgent.preferences.startDate,
      otherAgent.preferences.endDate
    );
    synergyScore += dateOverlap * 20;
    totalWeight += 20;

    // 3. Check budget compatibility (15% weight)
    const budgetMatch = this.calculateBudgetMatch(
      this.preferences.budget,
      otherAgent.preferences.budget
    );
    synergyScore += budgetMatch * 15;
    totalWeight += 15;

    // 4. Check activity preferences (20% weight)
    const activityMatch = this.calculateActivityMatch(
      this.preferences.activities,
      otherAgent.preferences.activities
    );
    synergyScore += activityMatch * 20;
    totalWeight += 20;

    // 5. Check travel style compatibility (15% weight)
    const styleMatch = this.calculateStyleMatch(
      this.preferences.travelStyle,
      otherAgent.preferences.travelStyle
    );
    synergyScore += styleMatch * 15;
    totalWeight += 15;

    // Normalize to 0-100
    return Math.round((synergyScore / totalWeight) * 100);
  }

  private calculateDateOverlap(start1: Date, end1: Date, start2: Date, end2: Date): number {
    const latest_start = Math.max(start1.getTime(), start2.getTime());
    const earliest_end = Math.min(end1.getTime(), end2.getTime());
    
    if (latest_start >= earliest_end) return 0; // No overlap
    
    const overlap_days = (earliest_end - latest_start) / (1000 * 60 * 60 * 24);
    const total_days1 = (end1.getTime() - start1.getTime()) / (1000 * 60 * 60 * 24);
    const total_days2 = (end2.getTime() - start2.getTime()) / (1000 * 60 * 60 * 24);
    
    return overlap_days / Math.max(total_days1, total_days2);
  }

  private calculateBudgetMatch(budget1: any, budget2: any): number {
    if (budget1.currency !== budget2.currency) return 0.5; // Need currency conversion
    
    const overlap_min = Math.max(budget1.min, budget2.min);
    const overlap_max = Math.min(budget1.max, budget2.max);
    
    if (overlap_min > overlap_max) return 0; // No overlap
    
    const overlap_range = overlap_max - overlap_min;
    const total_range = Math.max(budget1.max - budget1.min, budget2.max - budget2.min);
    
    return overlap_range / total_range;
  }

  private calculateActivityMatch(act1: any, act2: any): number {
    const keys = Object.keys(act1);
    let totalDiff = 0;
    
    for (const key of keys) {
      totalDiff += Math.abs(act1[key] - act2[key]);
    }
    
    // Convert difference to similarity (0 = perfect match, keys.length = completely different)
    return 1 - (totalDiff / keys.length);
  }

  private calculateStyleMatch(style1: any, style2: any): number {
    const keys = Object.keys(style1);
    let totalDiff = 0;
    
    for (const key of keys) {
      totalDiff += Math.abs(style1[key] - style2[key]);
    }
    
    return 1 - (totalDiff / keys.length);
  }

  /**
   * Propose a match with other agents
   */
  proposeMatch(agents: TravelAgent[]): MatchProposal {
    // Calculate group synergy
    const synergyScores = agents.map(agent => this.calculateSynergy(agent));
    const avgSynergy = synergyScores.reduce((a, b) => a + b, 0) / synergyScores.length;

    // Find common dates
    const commonDates = this.findCommonDates(agents);
    
    // Calculate estimated cost (average of all budgets)
    const avgCost = agents.reduce((sum, agent) => 
      sum + (agent.preferences.budget.max + agent.preferences.budget.min) / 2, 0
    ) / agents.length;

    // Aggregate activities
    const activities = this.aggregateActivities(agents);

    return {
      id: `proposal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agents: [this.id, ...agents.map(a => a.id)],
      destination: this.preferences.destination,
      dates: commonDates,
      estimatedCost: avgCost,
      activities,
      synergyScore: Math.round(avgSynergy),
      confidence: avgSynergy / 100,
      createdAt: new Date(),
      status: 'proposed'
    };
  }

  private findCommonDates(agents: TravelAgent[]): { start: Date; end: Date } {
    // Find overlapping dates across all agents
    let latestStart = this.preferences.startDate;
    let earliestEnd = this.preferences.endDate;

    for (const agent of agents) {
      if (agent.preferences.startDate > latestStart) {
        latestStart = agent.preferences.startDate;
      }
      if (agent.preferences.endDate < earliestEnd) {
        earliestEnd = agent.preferences.endDate;
      }
    }

    return { start: latestStart, end: earliestEnd };
  }

  private aggregateActivities(agents: TravelAgent[]): string[] {
    // Aggregate most popular activities
    const activityScores: { [key: string]: number } = {};
    
    for (const agent of [this, ...agents]) {
      for (const [activity, score] of Object.entries(agent.preferences.activities)) {
        activityScores[activity] = (activityScores[activity] || 0) + score;
      }
    }

    // Return top activities
    return Object.entries(activityScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([activity]) => activity);
  }

  /**
   * Evaluate a match proposal
   */
  evaluateProposal(proposal: MatchProposal): ProposalEvaluation {
    const concerns: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Check synergy threshold
    if (proposal.synergyScore >= 70) {
      score += 40;
    } else if (proposal.synergyScore >= 50) {
      score += 25;
      concerns.push(`Synergy score is moderate (${proposal.synergyScore})`);
    } else {
      score += 10;
      concerns.push(`Low synergy score (${proposal.synergyScore})`);
    }

    // Check dates
    const dateMatch = this.calculateDateOverlap(
      this.preferences.startDate,
      this.preferences.endDate,
      proposal.dates.start,
      proposal.dates.end
    );
    
    if (dateMatch >= 0.8) {
      score += 30;
    } else if (dateMatch >= 0.5) {
      score += 15;
      suggestions.push('Consider adjusting dates for better overlap');
    } else {
      concerns.push('Dates have minimal overlap');
    }

    // Check budget
    const budgetFits = proposal.estimatedCost >= this.preferences.budget.min &&
                       proposal.estimatedCost <= this.preferences.budget.max;
    
    if (budgetFits) {
      score += 30;
    } else {
      concerns.push(`Budget ${proposal.estimatedCost} outside range ${this.preferences.budget.min}-${this.preferences.budget.max}`);
    }

    // Determine willingness
    let willingness: 'accept' | 'negotiate' | 'reject';
    if (score >= 80 && concerns.length === 0) {
      willingness = 'accept';
    } else if (score >= 50) {
      willingness = 'negotiate';
    } else {
      willingness = 'reject';
    }

    return { score, concerns, suggestions, willingness };
  }

  /**
   * Negotiate a proposal
   */
  negotiate(proposal: MatchProposal, round: number): NegotiationResponse {
    const evaluation = this.evaluateProposal(proposal);

    if (evaluation.willingness === 'accept') {
      return {
        action: 'accept',
        message: `Proposal looks great! Synergy score ${proposal.synergyScore} meets expectations.`
      };
    }

    if (evaluation.willingness === 'reject' || round >= 3) {
      return {
        action: 'reject',
        message: `After ${round} rounds, concerns remain: ${evaluation.concerns.join(', ')}`
      };
    }

    // Counter-propose
    const counterProposal: Partial<MatchProposal> = {};

    // Adjust dates if needed
    if (evaluation.concerns.some(c => c.includes('dates'))) {
      counterProposal.dates = {
        start: this.preferences.startDate,
        end: this.preferences.endDate
      };
    }

    // Adjust budget if needed
    if (evaluation.concerns.some(c => c.includes('Budget'))) {
      counterProposal.estimatedCost = (this.preferences.budget.min + this.preferences.budget.max) / 2;
    }

    return {
      action: 'counter',
      counterProposal,
      message: `Counter-proposal for round ${round}: ${evaluation.suggestions.join(', ')}`
    };
  }

  async acceptMatch(proposalId: string): Promise<void> {
    console.log(`[Agent ${this.id}] Accepting proposal ${proposalId}`);
    // TODO: Interact with TripEscrow smart contract
    // TODO: Stake tokens
  }

  async rejectMatch(proposalId: string, reason: string): Promise<void> {
    console.log(`[Agent ${this.id}] Rejecting proposal ${proposalId}: ${reason}`);
  }
}
