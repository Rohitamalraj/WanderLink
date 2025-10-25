import { BrowserProvider, Contract, parseEther } from 'ethers';
import contractInfo from '../../contract-info.json';
import AgentStakingArtifact from '../../artifacts/contracts/AgentStaking.sol/AgentStaking.json';

// Contract ABI from compiled artifact
const CONTRACT_ABI = AgentStakingArtifact.abi;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || contractInfo.contractAddress;

export interface PoolParticipant {
  address: string;
  amount: string; // in HBAR
  location: string;
}

export interface CreatePoolParams {
  poolId: string;
  participants: PoolParticipant[];
  tripDate: string;
  tripLocation: string;
}

export class StakingContract {
  private provider: BrowserProvider | null = null;
  private contract: Contract | null = null;

  async connect() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new BrowserProvider(window.ethereum);
    const signer = await this.provider.getSigner();
    
    this.contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    return this.contract;
  }

  async createPool(params: CreatePoolParams): Promise<string> {
    if (!this.contract) {
      await this.connect();
    }

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    // Generate pool ID from trip details
    const poolId = this.generatePoolId(params.poolId);

    // Prepare participant addresses and amounts
    const addresses = params.participants.map(p => p.address);
    const amounts = params.participants.map(p => parseEther(p.amount));
    const locations = params.participants.map(p => p.location);

    console.log('Creating pool:', {
      poolId,
      addresses,
      amounts: amounts.map(a => a.toString()),
      locations,
    });

    // Call createPool on contract
    const tx = await this.contract.createPool(
      poolId,
      addresses,
      amounts,
      locations
    );

    console.log('Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log('Transaction confirmed:', receipt);
    
    return tx.hash;
  }

  async stakeToPool(poolId: string, amount: string): Promise<string> {
    if (!this.contract) {
      await this.connect();
    }

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const poolIdBytes = this.generatePoolId(poolId);
    const amountWei = parseEther(amount);

    console.log('Staking to pool:', {
      poolId: poolIdBytes,
      amount: amountWei.toString(),
    });

    // Call stake function with HBAR value
    const tx = await this.contract.stake(poolIdBytes, {
      value: amountWei,
    });

    console.log('Stake transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    
    console.log('Stake confirmed:', receipt);
    
    return tx.hash;
  }

  async verifyLocation(poolId: string, participant: string): Promise<string> {
    if (!this.contract) {
      await this.connect();
    }

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const poolIdBytes = this.generatePoolId(poolId);

    console.log('Verifying location:', {
      poolId: poolIdBytes,
      participant,
    });

    const tx = await this.contract.verifyLocation(poolIdBytes, participant);
    
    console.log('Verification transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    
    console.log('Verification confirmed:', receipt);
    
    return tx.hash;
  }

  async releaseFunds(poolId: string): Promise<string> {
    if (!this.contract) {
      await this.connect();
    }

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const poolIdBytes = this.generatePoolId(poolId);

    console.log('Releasing funds for pool:', poolIdBytes);

    const tx = await this.contract.releaseFunds(poolIdBytes);
    
    console.log('Release transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    
    console.log('Release confirmed:', receipt);
    
    return tx.hash;
  }

  async getPoolInfo(poolId: string): Promise<any> {
    if (!this.contract) {
      await this.connect();
    }

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const poolIdBytes = this.generatePoolId(poolId);

    const poolInfo = await this.contract.pools(poolIdBytes);
    
    return {
      totalAmount: poolInfo.totalAmount.toString(),
      participantCount: poolInfo.participantCount.toString(),
      isActive: poolInfo.isActive,
      allVerified: poolInfo.allVerified,
    };
  }

  async getUserBalance(userAddress: string): Promise<string> {
    if (!this.contract) {
      await this.connect();
    }

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    console.log('Checking balance for:', userAddress);

    const balance = await this.contract.getBalance(userAddress);
    
    console.log('User balance:', balance.toString());
    
    return balance.toString();
  }

  async withdraw(amount: string): Promise<string> {
    if (!this.contract) {
      await this.connect();
    }

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    console.log('Withdrawing amount:', amount);

    const tx = await this.contract.withdraw(amount);
    
    console.log('Withdrawal transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    
    console.log('Withdrawal confirmed:', receipt);
    
    return tx.hash;
  }

  private generatePoolId(name: string): string {
    // Simple hash function - in production use proper hashing
    return `0x${Buffer.from(name).toString('hex').padEnd(64, '0').slice(0, 64)}`;
  }

  getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }
}

// Singleton instance
export const stakingContract = new StakingContract();

// Helper function to convert USD to HBAR (approximate)
export function usdToHbar(usd: number, hbarPrice: number = 0.05): number {
  return usd / hbarPrice;
}

// Helper function to convert HBAR to USD (approximate)
export function hbarToUsd(hbar: number, hbarPrice: number = 0.05): number {
  return hbar * hbarPrice;
}
