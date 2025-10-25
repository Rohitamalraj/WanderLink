// Simple in-memory store for trip sessions
// In production, use a database like PostgreSQL or MongoDB

export interface TripParticipant {
  walletAddress: string;
  name: string;
  budget: number;
  joinedAt: number;
  hasStaked: boolean;
}

export interface TripSession {
  sessionId: string;
  tripName: string;
  tripDate: string;
  location: string;
  createdBy: string;
  createdAt: number;
  participants: TripParticipant[];
  status: 'waiting' | 'negotiating' | 'ready_to_stake' | 'completed';
  minParticipants: number;
  negotiationResult?: {
    agreedBudget: number;
    stakePercentage: number;
    stakeAmount: number;
    stakeAmountHbar: number;
    totalPool: number;
    coordinatorReasoning: string;
    validatorReasoning: string;
    finalReasoning: string;
  };
  poolId?: string;
  transactionHash?: string;
}

class TripSessionStore {
  private sessions: Map<string, TripSession> = new Map();

  createSession(
    tripName: string,
    tripDate: string,
    location: string,
    creatorWallet: string,
    creatorName: string,
    creatorBudget: number
  ): TripSession {
    const sessionId = this.generateSessionId();
    
    const session: TripSession = {
      sessionId,
      tripName,
      tripDate,
      location,
      createdBy: creatorWallet,
      createdAt: Date.now(),
      participants: [
        {
          walletAddress: creatorWallet,
          name: creatorName,
          budget: creatorBudget,
          joinedAt: Date.now(),
          hasStaked: false,
        },
      ],
      status: 'waiting',
      minParticipants: 3,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): TripSession | null {
    return this.sessions.get(sessionId) || null;
  }

  joinSession(
    sessionId: string,
    walletAddress: string,
    name: string,
    budget: number
  ): TripSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if already joined
    const existing = session.participants.find(
      p => p.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
    
    if (existing) {
      // Update budget if already joined
      existing.budget = budget;
      existing.name = name;
    } else {
      // Add new participant
      session.participants.push({
        walletAddress,
        name,
        budget,
        joinedAt: Date.now(),
        hasStaked: false,
      });
    }

    this.sessions.set(sessionId, session);
    return session;
  }

  updateSessionStatus(sessionId: string, status: TripSession['status']): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = status;
      this.sessions.set(sessionId, session);
    }
  }

  setNegotiationResult(
    sessionId: string,
    result: TripSession['negotiationResult']
  ): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.negotiationResult = result;
      session.status = 'ready_to_stake';
      this.sessions.set(sessionId, session);
    }
  }

  markUserStaked(sessionId: string, walletAddress: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      const participant = session.participants.find(
        p => p.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );
      if (participant) {
        participant.hasStaked = true;
      }

      // Check if all staked
      const allStaked = session.participants.every(p => p.hasStaked);
      if (allStaked) {
        session.status = 'completed';
      }

      this.sessions.set(sessionId, session);
    }
  }

  setPoolInfo(sessionId: string, poolId: string, txHash: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.poolId = poolId;
      session.transactionHash = txHash;
      this.sessions.set(sessionId, session);
    }
  }

  getAllSessions(): TripSession[] {
    return Array.from(this.sessions.values());
  }

  private generateSessionId(): string {
    return `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const tripSessionStore = new TripSessionStore();
