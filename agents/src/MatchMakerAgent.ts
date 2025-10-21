/**
 * MatchMakerAgent - Central ASI Agent for group matchmaking
 * 
 * The MatchMaker agent coordinates between individual TravelAgents to find
 * optimal group compositions. It runs the negotiation protocol and ensures
 * fair, efficient matching.
 */

import { TravelAgent, MatchProposal, NegotiationResponse } from './TravelAgent.js';

export interface MatchMakerConfig {
  minGroupSize: number;
  maxGroupSize: number;
  minSynergyScore: number;
  maxNegotiationRounds: number;
  matchingAlgorithm: 'greedy' | 'optimal' | 'balanced';
}

export interface MatchingSession {
  id: string;
  agents: TravelAgent[];
  proposals: MatchProposal[];
  negotiations: NegotiationHistory[];
  status: 'searching' | 'negotiating' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
}

export interface NegotiationHistory {
  proposalId: string;
  round: number;
  agentId: string;
  response: NegotiationResponse;
  timestamp: Date;
}

export class MatchMakerAgent {
  private config: MatchMakerConfig;
  private activeSessions: Map<string, MatchingSession>;
  private agentPool: Map<string, TravelAgent>;

  constructor(config: Partial<MatchMakerConfig> = {}) {
    this.config = {
      minGroupSize: config.minGroupSize || 2,
      maxGroupSize: config.maxGroupSize || 8,
      minSynergyScore: config.minSynergyScore || 60,
      maxNegotiationRounds: config.maxNegotiationRounds || 5,
      matchingAlgorithm: config.matchingAlgorithm || 'balanced'
    };
    this.activeSessions = new Map();
    this.agentPool = new Map();
  }

  /**
   * Register a TravelAgent to the matchmaking pool
   */
  async registerAgent(agent: TravelAgent): Promise<void> {
    console.log(`[MatchMaker] Registering agent ${agent.id}`);
    await agent.initialize();
    this.agentPool.set(agent.id, agent);
  }

  /**
   * Find potential matches for an agent
   */
  async findMatches(agentId: string): Promise<MatchProposal[]> {
    const agent = this.agentPool.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    console.log(`[MatchMaker] Finding matches for agent ${agentId}`);

    // Filter agents by basic criteria
    const candidates = Array.from(this.agentPool.values()).filter(candidate => {
      if (candidate.id === agentId) return false;
      if (!candidate.isActive) return false;
      
      // Same destination
      if (candidate.preferences.destination !== agent.preferences.destination) return false;
      
      // Date overlap
      const hasDateOverlap = !(
        candidate.preferences.endDate < agent.preferences.startDate ||
        candidate.preferences.startDate > agent.preferences.endDate
      );
      if (!hasDateOverlap) return false;

      return true;
    });

    console.log(`[MatchMaker] Found ${candidates.length} potential candidates`);

    // Generate match proposals
    const proposals: MatchProposal[] = [];

    if (this.config.matchingAlgorithm === 'greedy') {
      proposals.push(...this.greedyMatching(agent, candidates));
    } else if (this.config.matchingAlgorithm === 'optimal') {
      proposals.push(...this.optimalMatching(agent, candidates));
    } else {
      proposals.push(...this.balancedMatching(agent, candidates));
    }

    return proposals.filter(p => p.synergyScore >= this.config.minSynergyScore);
  }

  /**
   * Greedy matching: Add agents with highest synergy scores
   */
  private greedyMatching(agent: TravelAgent, candidates: TravelAgent[]): MatchProposal[] {
    // Calculate synergy with each candidate
    const synergyScores = candidates.map(candidate => ({
      agent: candidate,
      synergy: agent.calculateSynergy(candidate)
    }));

    // Sort by synergy (descending)
    synergyScores.sort((a, b) => b.synergy - a.synergy);

    // Create proposals with different group sizes
    const proposals: MatchProposal[] = [];

    for (let size = this.config.minGroupSize - 1; size <= Math.min(this.config.maxGroupSize - 1, synergyScores.length); size++) {
      const groupMembers = synergyScores.slice(0, size).map(s => s.agent);
      proposals.push(agent.proposeMatch(groupMembers));
    }

    return proposals;
  }

  /**
   * Optimal matching: Use clustering to find best group composition
   */
  private optimalMatching(agent: TravelAgent, candidates: TravelAgent[]): MatchProposal[] {
    // TODO: Implement k-means or hierarchical clustering
    // For now, use greedy as fallback
    return this.greedyMatching(agent, candidates);
  }

  /**
   * Balanced matching: Balance synergy with diversity
   */
  private balancedMatching(agent: TravelAgent, candidates: TravelAgent[]): MatchProposal[] {
    const proposals: MatchProposal[] = [];

    // Calculate synergy matrix
    const synergyMatrix = candidates.map(candidate => ({
      agent: candidate,
      synergy: agent.calculateSynergy(candidate),
      diversity: this.calculateDiversity(agent, candidate),
      balancedScore: 0
    }));

    // Balance synergy (70%) and diversity (30%)
    synergyMatrix.forEach(item => {
      item.balancedScore = item.synergy * 0.7 + item.diversity * 0.3;
    });

    // Sort by balanced score
    synergyMatrix.sort((a, b) => b.balancedScore - a.balancedScore);

    // Create proposals
    for (let size = this.config.minGroupSize - 1; size <= Math.min(this.config.maxGroupSize - 1, synergyMatrix.length); size++) {
      const groupMembers = synergyMatrix.slice(0, size).map(s => s.agent);
      proposals.push(agent.proposeMatch(groupMembers));
    }

    return proposals;
  }

  /**
   * Calculate diversity score (0-100) - higher means more diverse
   */
  private calculateDiversity(agent1: TravelAgent, agent2: TravelAgent): number {
    let diversityScore = 0;

    // Activity diversity
    const activities1 = agent1.preferences.activities;
    const activities2 = agent2.preferences.activities;
    
    let activityDiff = 0;
    for (const key of Object.keys(activities1) as Array<keyof typeof activities1>) {
      activityDiff += Math.abs(activities1[key] - activities2[key]);
    }
    diversityScore += (activityDiff / Object.keys(activities1).length) * 50;

    // Style diversity
    const style1 = agent1.preferences.travelStyle;
    const style2 = agent2.preferences.travelStyle;
    
    let styleDiff = 0;
    for (const key of Object.keys(style1) as Array<keyof typeof style1>) {
      styleDiff += Math.abs(style1[key] - style2[key]);
    }
    diversityScore += (styleDiff / Object.keys(style1).length) * 50;

    return Math.min(100, diversityScore);
  }

  /**
   * Run negotiation protocol for a match proposal
   */
  async negotiate(proposal: MatchProposal): Promise<MatchProposal> {
    console.log(`[MatchMaker] Starting negotiation for proposal ${proposal.id}`);
    
    const sessionId = `session-${Date.now()}`;
    const agents = proposal.agents
      .map(agentId => this.agentPool.get(agentId))
      .filter(Boolean) as TravelAgent[];

    const session: MatchingSession = {
      id: sessionId,
      agents,
      proposals: [proposal],
      negotiations: [],
      status: 'negotiating',
      startedAt: new Date()
    };

    this.activeSessions.set(sessionId, session);

    let currentProposal = { ...proposal };
    let round = 1;

    while (round <= this.config.maxNegotiationRounds) {
      console.log(`[MatchMaker] Negotiation round ${round}`);

      const responses: NegotiationResponse[] = [];
      
      // Get response from each agent
      for (const agent of agents) {
        const response = agent.negotiate(currentProposal, round);
        responses.push(response);

        session.negotiations.push({
          proposalId: currentProposal.id,
          round,
          agentId: agent.id,
          response,
          timestamp: new Date()
        });
      }

      // Check if all agents accepted
      const allAccepted = responses.every(r => r.action === 'accept');
      if (allAccepted) {
        console.log(`[MatchMaker] All agents accepted! Match successful.`);
        currentProposal.status = 'accepted';
        session.status = 'completed';
        session.completedAt = new Date();
        return currentProposal;
      }

      // Check if any agent rejected
      const anyRejected = responses.some(r => r.action === 'reject');
      if (anyRejected) {
        console.log(`[MatchMaker] At least one agent rejected. Match failed.`);
        currentProposal.status = 'rejected';
        session.status = 'failed';
        session.completedAt = new Date();
        throw new Error('Match rejected by one or more agents');
      }

      // Merge counter-proposals
      const counterProposals = responses
        .filter(r => r.action === 'counter' && r.counterProposal)
        .map(r => r.counterProposal!);

      if (counterProposals.length > 0) {
        currentProposal = this.mergeProposals(currentProposal, counterProposals);
        currentProposal.id = `proposal-${Date.now()}-round${round}`;
        session.proposals.push(currentProposal);
      }

      round++;
    }

    // Max rounds reached without agreement
    console.log(`[MatchMaker] Max negotiation rounds reached. Match failed.`);
    currentProposal.status = 'rejected';
    session.status = 'failed';
    session.completedAt = new Date();
    throw new Error('Negotiation failed: max rounds reached');
  }

  /**
   * Merge counter-proposals into a single proposal
   */
  private mergeProposals(
    original: MatchProposal,
    counterProposals: Partial<MatchProposal>[]
  ): MatchProposal {
    const merged = { ...original };

    // Merge dates (find overlapping period)
    const allDates = counterProposals
      .filter(cp => cp.dates)
      .map(cp => cp.dates!);
    
    if (allDates.length > 0) {
      const latestStart = new Date(Math.max(...allDates.map(d => d.start.getTime())));
      const earliestEnd = new Date(Math.min(...allDates.map(d => d.end.getTime())));
      merged.dates = { start: latestStart, end: earliestEnd };
    }

    // Merge cost (average)
    const costs = counterProposals
      .filter(cp => cp.estimatedCost)
      .map(cp => cp.estimatedCost!);
    
    if (costs.length > 0) {
      merged.estimatedCost = costs.reduce((a, b) => a + b, 0) / costs.length;
    }

    // Merge activities (union of all suggestions)
    const allActivities = new Set<string>(merged.activities);
    counterProposals.forEach(cp => {
      cp.activities?.forEach(act => allActivities.add(act));
    });
    merged.activities = Array.from(allActivities).slice(0, 8);

    return merged;
  }

  /**
   * Finalize a match and create on-chain trip
   */
  async finalizeMatch(proposal: MatchProposal): Promise<string> {
    console.log(`[MatchMaker] Finalizing match ${proposal.id}`);

    // TODO: Interact with TripEscrow smart contract
    // TODO: Create trip and have all agents stake tokens
    
    const tripId = `trip-${Date.now()}`;
    
    // Notify all agents to accept
    for (const agentId of proposal.agents) {
      const agent = this.agentPool.get(agentId);
      if (agent) {
        await agent.acceptMatch(proposal.id);
      }
    }

    return tripId;
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string): any {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    return {
      sessionId: session.id,
      status: session.status,
      agentCount: session.agents.length,
      proposalCount: session.proposals.length,
      negotiationRounds: Math.max(...session.negotiations.map(n => n.round), 0),
      duration: session.completedAt 
        ? session.completedAt.getTime() - session.startedAt.getTime()
        : Date.now() - session.startedAt.getTime(),
      finalSynergyScore: session.proposals[session.proposals.length - 1]?.synergyScore
    };
  }
}
