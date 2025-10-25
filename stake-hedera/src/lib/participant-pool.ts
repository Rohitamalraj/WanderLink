// Simple participant pool - no sessions, just collect 3 users and negotiate

export interface Participant {
  walletAddress: string;
  name: string;
  budget: number;
  location: string;
  joinedAt: number;
  hasStaked: boolean;
}

export interface NegotiationResult {
  agreedBudget: number;
  stakePercentage: number;
  stakeAmount: number;
  stakeAmountHbar: number;
  totalPool: number;
  coordinatorReasoning: string;
  validatorReasoning: string;
  finalReasoning: string;
}

export interface ParticipantPool {
  participants: Participant[];
  status: 'waiting' | 'negotiating' | 'ready_to_stake' | 'completed';
  negotiationResult?: NegotiationResult;
  createdAt: number;
}

// Use global to persist across hot reloads
const globalForPool = globalThis as unknown as {
  participantPoolData: ParticipantPool | undefined;
};

class ParticipantPoolStore {
  private get pool(): ParticipantPool {
    if (!globalForPool.participantPoolData) {
      globalForPool.participantPoolData = {
        participants: [],
        status: 'waiting',
        createdAt: Date.now(),
      };
    }
    return globalForPool.participantPoolData;
  }

  private set pool(value: ParticipantPool) {
    globalForPool.participantPoolData = value;
  }

  addParticipant(
    walletAddress: string,
    name: string,
    budget: number,
    location: string
  ): ParticipantPool {
    // Check if already exists
    const existing = this.pool.participants.find(
      p => p.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );

    if (existing) {
      // Update existing
      existing.name = name;
      existing.budget = budget;
      existing.location = location;
    } else {
      // Add new
      this.pool.participants.push({
        walletAddress,
        name,
        budget,
        location,
        joinedAt: Date.now(),
        hasStaked: false,
      });
    }

    return this.getPool();
  }

  getPool(): ParticipantPool {
    return { ...this.pool };
  }

  getParticipant(walletAddress: string): Participant | null {
    return this.pool.participants.find(
      p => p.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    ) || null;
  }

  setStatus(status: ParticipantPool['status']): void {
    this.pool.status = status;
  }

  setNegotiationResult(result: NegotiationResult): void {
    this.pool.negotiationResult = result;
    this.pool.status = 'ready_to_stake';
  }

  markStaked(walletAddress: string): void {
    const participant = this.pool.participants.find(
      p => p.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
    
    if (participant) {
      participant.hasStaked = true;
    }

    // Check if all staked
    const allStaked = this.pool.participants.every(p => p.hasStaked);
    if (allStaked) {
      this.pool.status = 'completed';
    }
  }

  reset(): void {
    this.pool = {
      participants: [],
      status: 'waiting',
      createdAt: Date.now(),
    };
  }

  isParticipant(walletAddress: string): boolean {
    return this.pool.participants.some(
      p => p.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }
}

// Singleton with global persistence
const globalForStore = globalThis as unknown as {
  participantPoolStore: ParticipantPoolStore | undefined;
};

export const participantPool = globalForStore.participantPoolStore ?? (globalForStore.participantPoolStore = new ParticipantPoolStore());
