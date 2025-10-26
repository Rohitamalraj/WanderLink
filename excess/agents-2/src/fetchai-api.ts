/**
 * Fetch.ai Agentverse API Integration
 * 
 * This module provides real Fetch.ai integration via Agentverse REST API.
 * No Python required - pure TypeScript/JavaScript solution.
 * 
 * Setup:
 * 1. Create account at https://agentverse.ai
 * 2. Create an agent and get API key
 * 3. Add FETCHAI_API_KEY and FETCHAI_AGENT_ADDRESS to .env
 */

import axios, { AxiosInstance } from 'axios';

const AGENTVERSE_API_BASE = 'https://agentverse.ai/v1';
const ALMANAC_API_BASE = 'https://almanac.fetch.ai';

export interface FetchAIConfig {
  apiKey: string;
  agentAddress: string;
  network?: 'mainnet' | 'testnet';
}

export interface AgentMessage {
  sender: string;
  protocol: string;
  payload: any;
  timestamp?: number;
}

export interface AgentMetadata {
  name: string;
  description: string;
  protocols: string[];
  endpoints: string[];
}

export interface MatchProposal {
  proposalId: string;
  agents: string[];
  synergyScore: number;
  destination: string;
  dates: {
    start: Date;
    end: Date;
  };
  estimatedCost: number;
  activities: string[];
}

/**
 * Fetch.ai Agentverse API Client
 */
export class FetchAIAgent {
  private client: AxiosInstance;
  private agentAddress: string;
  private network: string;

  constructor(config: FetchAIConfig) {
    this.agentAddress = config.agentAddress;
    this.network = config.network || 'testnet';
    
    this.client = axios.create({
      baseURL: AGENTVERSE_API_BASE,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log(`✅ Fetch.ai Agent initialized: ${this.agentAddress}`);
  }

  /**
   * Register agent on Agentverse with metadata
   */
  async registerAgent(metadata: AgentMetadata): Promise<any> {
    try {
      const response = await this.client.post('/agents/register', {
        address: this.agentAddress,
        metadata,
        network: this.network,
      });
      
      console.log('✅ Agent registered on Agentverse:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Agent registration failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send message to another agent
   */
  async sendMessage(targetAgent: string, protocol: string, payload: any): Promise<void> {
    try {
      const message: AgentMessage = {
        sender: this.agentAddress,
        protocol,
        payload,
        timestamp: Date.now(),
      };

      const response = await this.client.post('/messages/send', {
        to: targetAgent,
        message,
      });

      console.log(`📤 Message sent to ${targetAgent}:`, response.data);
    } catch (error: any) {
      console.error('❌ Message send failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Receive messages (poll for new messages)
   */
  async receiveMessages(limit: number = 10): Promise<AgentMessage[]> {
    try {
      const response = await this.client.get('/messages/inbox', {
        params: {
          agent: this.agentAddress,
          limit,
          unread: true,
        },
      });

      const messages = response.data.messages || [];
      console.log(`📥 Received ${messages.length} messages`);
      return messages;
    } catch (error: any) {
      console.error('❌ Message receive failed:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Query Almanac for agents by protocol
   */
  async findAgentsByProtocol(protocol: string): Promise<string[]> {
    try {
      const response = await axios.get(`${ALMANAC_API_BASE}/agents`, {
        params: {
          protocol,
          network: this.network,
        },
      });

      const agents = response.data.agents || [];
      console.log(`🔍 Found ${agents.length} agents with protocol: ${protocol}`);
      return agents.map((a: any) => a.address);
    } catch (error: any) {
      console.error('❌ Agent search failed:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Update agent metadata
   */
  async updateMetadata(metadata: Partial<AgentMetadata>): Promise<any> {
    try {
      const response = await this.client.patch('/agents/metadata', {
        address: this.agentAddress,
        metadata,
      });

      console.log('✅ Metadata updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Metadata update failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get agent info from Almanac
   */
  async getAgentInfo(agentAddress: string): Promise<any> {
    try {
      const response = await axios.get(`${ALMANAC_API_BASE}/agents/${agentAddress}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Agent info fetch failed:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Mark message as read
   */
  async markMessageRead(messageId: string): Promise<void> {
    try {
      await this.client.post('/messages/read', {
        messageId,
        agent: this.agentAddress,
      });
    } catch (error: any) {
      console.error('❌ Mark read failed:', error.response?.data || error.message);
    }
  }

  /**
   * Get agent address
   */
  getAddress(): string {
    return this.agentAddress;
  }
}

/**
 * Travel Agent with Fetch.ai Integration
 */
export class FetchAITravelAgent {
  private fetchAgent: FetchAIAgent;
  private preferences: any;
  private matchingProtocol = 'wanderlink:travel-matching:1.0';

  constructor(fetchAgent: FetchAIAgent, preferences: any) {
    this.fetchAgent = fetchAgent;
    this.preferences = preferences;
  }

  /**
   * Initialize and register agent
   */
  async initialize(): Promise<void> {
    const metadata: AgentMetadata = {
      name: `TravelAgent-${this.preferences.destination}`,
      description: 'WanderLink travel companion matching agent',
      protocols: [this.matchingProtocol],
      endpoints: ['https://your-backend.com/webhook'], // Optional webhook
    };

    await this.fetchAgent.registerAgent(metadata);
    console.log('🌍 Travel agent ready for matching!');
  }

  /**
   * Send match request to MatchMaker agent
   */
  async requestMatches(matchMakerAddress: string): Promise<void> {
    const payload = {
      type: 'match_request',
      preferences: this.preferences,
      timestamp: Date.now(),
    };

    await this.fetchAgent.sendMessage(
      matchMakerAddress,
      this.matchingProtocol,
      payload
    );

    console.log('📤 Match request sent to MatchMaker');
  }

  /**
   * Process incoming messages (proposals, notifications)
   */
  async processMessages(): Promise<void> {
    const messages = await this.fetchAgent.receiveMessages();

    for (const message of messages) {
      await this.handleMessage(message);
    }
  }

  /**
   * Handle individual message
   */
  private async handleMessage(message: AgentMessage): Promise<void> {
    const { payload, sender } = message;

    switch (payload.type) {
      case 'match_proposal':
        await this.handleMatchProposal(sender, payload.proposal);
        break;
      
      case 'negotiation_update':
        await this.handleNegotiationUpdate(payload);
        break;
      
      case 'match_confirmed':
        await this.handleMatchConfirmed(payload);
        break;
      
      default:
        console.log('📬 Received unknown message type:', payload.type);
    }
  }

  /**
   * Handle match proposal
   */
  private async handleMatchProposal(sender: string, proposal: MatchProposal): Promise<void> {
    console.log(`📬 Received match proposal: ${proposal.proposalId}`);
    console.log(`   Synergy: ${proposal.synergyScore}%`);
    console.log(`   Group size: ${proposal.agents.length}`);

    // Evaluate proposal
    const decision = this.evaluateProposal(proposal);

    // Send response
    await this.fetchAgent.sendMessage(sender, this.matchingProtocol, {
      type: 'proposal_response',
      proposalId: proposal.proposalId,
      action: decision.action,
      message: decision.message,
      counterProposal: decision.counterProposal,
    });

    console.log(`✅ Sent response: ${decision.action}`);
  }

  /**
   * Evaluate proposal and make decision
   */
  private evaluateProposal(proposal: MatchProposal): any {
    const { synergyScore, estimatedCost } = proposal;
    const { budget } = this.preferences;

    // Check synergy
    if (synergyScore >= 70 && estimatedCost >= budget.min && estimatedCost <= budget.max) {
      return {
        action: 'accept',
        message: 'Great match! I\'m in!',
      };
    }

    // Counter-propose if moderate synergy
    if (synergyScore >= 50) {
      return {
        action: 'counter',
        message: 'Let\'s adjust the dates',
        counterProposal: {
          dates: {
            start: this.preferences.startDate,
            end: this.preferences.endDate,
          },
        },
      };
    }

    // Reject if low synergy
    return {
      action: 'reject',
      message: `Synergy score ${synergyScore}% is too low`,
    };
  }

  /**
   * Handle negotiation update
   */
  private async handleNegotiationUpdate(payload: any): Promise<void> {
    console.log(`🔄 Negotiation update: Round ${payload.round}`);
  }

  /**
   * Handle match confirmed
   */
  private async handleMatchConfirmed(payload: any): Promise<void> {
    console.log(`🎉 Match confirmed! Trip ID: ${payload.tripId}`);
    
    // TODO: Trigger smart contract interaction
    // await this.createTripOnChain(payload);
  }

  /**
   * Start listening for messages (polling loop)
   */
  startListening(intervalMs: number = 5000): NodeJS.Timeout {
    console.log('👂 Started listening for messages...');
    
    return setInterval(async () => {
      try {
        await this.processMessages();
      } catch (error) {
        console.error('❌ Error processing messages:', error);
      }
    }, intervalMs);
  }
}

/**
 * Example usage
 */
export async function createTravelAgent() {
  // Initialize Fetch.ai agent
  const fetchAgent = new FetchAIAgent({
    apiKey: process.env.FETCHAI_API_KEY!,
    agentAddress: process.env.FETCHAI_AGENT_ADDRESS!,
    network: 'testnet',
  });

  // Create travel agent with preferences
  const travelAgent = new FetchAITravelAgent(fetchAgent, {
    destination: 'Tokyo, Japan',
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-03-25'),
    budget: {
      min: 2000,
      max: 3500,
      currency: 'USD',
    },
    activities: {
      culture: 0.9,
      foodie: 0.8,
      adventure: 0.6,
    },
  });

  // Initialize
  await travelAgent.initialize();

  // Request matches from MatchMaker
  const matchMakerAddress = 'agent1q...matchmaker'; // Replace with actual MatchMaker address
  await travelAgent.requestMatches(matchMakerAddress);

  // Start listening for responses
  const listener = travelAgent.startListening(5000);

  // Stop after 5 minutes (for demo)
  setTimeout(() => {
    clearInterval(listener);
    console.log('👋 Stopped listening');
  }, 5 * 60 * 1000);
}
