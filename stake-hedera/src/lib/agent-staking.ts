import { ethers, JsonRpcProvider, Contract, Wallet, parseEther, isAddress } from 'ethers';

export interface StakingParticipant {
  walletAddress: string;
  name: string;
  stakeAmount: number; // in HBAR
}

/**
 * Agent Staking Service
 * Handles agent-based staking on behalf of users
 */
export class AgentStakingService {
  private provider: JsonRpcProvider;
  private signer: Wallet;
  private contractAddress: string;

  constructor(contractAddress: string) {
    // EVM contract address (0x...)
    this.contractAddress = contractAddress.startsWith('0x')
      ? contractAddress
      : (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string);

    // ECDSA private key of the agent (0x...)
    const pk = process.env.HEDERA_PRIVATE_KEY as string;
    if (!pk) throw new Error('HEDERA_PRIVATE_KEY missing');

    // JSON-RPC provider for Hedera Testnet
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet.hashio.io/api';
    this.provider = new ethers.JsonRpcProvider(rpcUrl, { name: 'hedera-testnet', chainId: 296 });
    this.signer = new Wallet(pk, this.provider);
  }

  /**
   * Stake on behalf of multiple users
   * @param participants Array of participants with wallet addresses and stake amounts
   * @param tripId Unique trip identifier
   */
  async stakeOnBehalfOfUsers(
    participants: StakingParticipant[],
    tripId: number
  ): Promise<{ success: boolean; transactions: string[]; error?: string }> {
    const transactions: string[] = [];

    try {
      const agentAddress = await this.signer.getAddress();
      console.log(`🤖 Agent staking for ${participants.length} users...`);
      console.log(`🤖 Agent address: ${agentAddress}`);

      for (const participant of participants) {
        // Skip if participant is the agent itself
        if (participant.walletAddress.toLowerCase() === agentAddress.toLowerCase()) {
          console.log(`⏭️  Skipping agent itself (${participant.name})`);
          continue;
        }

        try {
          const txHash = await this.stakeForUser(
            participant.walletAddress,
            participant.stakeAmount,
            tripId
          );

          transactions.push(txHash);
          console.log(`✅ Staked ${participant.stakeAmount} HBAR for ${participant.name}`);
        } catch (error: any) {
          console.error(`❌ Failed to stake for ${participant.name}:`, error.message);
          throw error;
        }
      }

      console.log(`🎉 Successfully staked for all ${participants.length} users!`);

      return {
        success: true,
        transactions,
      };
    } catch (error: any) {
      console.error('Agent staking failed:', error);
      return {
        success: false,
        transactions,
        error: error.message,
      };
    }
  }

  /**
   * Stake for a single user
   * @param userAddress User's wallet address
   * @param amount Amount in HBAR
   * @param tripId Trip identifier
   */
  private async stakeForUser(
    userAddress: string,
    amount: number,
    tripId: number
  ): Promise<string> {
    try {
      if (!isAddress(userAddress)) {
        throw new Error(`Invalid EVM address: ${userAddress}`);
      }

      console.log('🔵 Staking for address:', userAddress, 'Amount:', amount, 'HBAR');
      console.log('🔵 Contract address:', this.contractAddress);
      console.log('🔵 Trip ID:', tripId);
      console.log('🔵 Agent address:', await this.signer.getAddress());

      const abi = [
        'function stakeOnBehalf(address user, uint256 amount, uint256 tripId) payable',
        'function allowance(address user, address agent) view returns (uint256)',
      ];
      
      console.log('🔵 Creating contract instance...');
      const contract = new Contract(this.contractAddress, abi, this.signer);
      console.log('🔵 Contract created successfully');
      
      // Check allowance
      const agentAddress = await this.signer.getAddress();
      const allowance = await contract.allowance(userAddress, agentAddress);
      console.log('🔵 User allowance for agent:', allowance.toString(), 'wei');
      
      if (allowance === 0n) {
        throw new Error(`User ${userAddress} has not approved agent ${agentAddress}. Allowance is 0.`);
      }

      // Convert HBAR to wei (18 decimals: 1 HBAR = 10^18 wei)
      // Both amount parameter and msg.value must be in wei for EVM compatibility
      const valueWei = parseEther(String(amount));
      
      console.log('🔵 Amount in wei:', valueWei.toString());
      console.log('🔵 Preparing transaction...');
      
      // First, populate the transaction to see what will be sent
      const populatedTx = await contract.stakeOnBehalf.populateTransaction(
        userAddress,
        valueWei,
        BigInt(tripId),
        {
          value: valueWei,
          gasLimit: 1_500_000,
        }
      );
      
      console.log('🔵 Populated transaction:', JSON.stringify(populatedTx, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      console.log('🔵 Sending transaction...');
      const tx = await contract.stakeOnBehalf(
        userAddress,
        valueWei,  // amount parameter in wei
        BigInt(tripId),
        {
          value: valueWei,  // msg.value in wei
          gasLimit: 1_500_000,
        }
      );
      
      console.log('🔵 Transaction sent:', tx.hash);
      console.log('🔵 Transaction data:', tx.data);
      console.log('🔵 Waiting for receipt...');

      const receipt = await tx.wait();
      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed');
      }

      return tx.hash;
    } catch (error: any) {
      console.error('Failed to stake for user:', error);
      throw error;
    }
  }

  /**
   * Convert number to uint256 buffer (32 bytes)
   */
  private uint256ToBuffer(value: number): Buffer {
    const hex = Math.floor(value).toString(16).padStart(64, '0');
    return Buffer.from(hex, 'hex');
  }

  /**
   * Complete trip and release/slash funds
   * @param tripId Trip identifier
   * @param success Whether trip was successful
   */
  async completeTrip(tripId: number, success: boolean): Promise<string> {
    try {
      const abi = [
        'function completeTrip(uint256 tripId, bool success) external',
      ];
      const contract = new Contract(this.contractAddress, abi, this.signer);
      const tx = await contract.completeTrip(BigInt(tripId), success, { gasLimit: 1_000_000 });
      const receipt = await tx.wait();
      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed');
      }
      return tx.hash;
    } catch (error: any) {
      console.error('Failed to complete trip:', error);
      throw error;
    }
  }

  /**
   * Get trip total
   */
  async getTripTotal(tripId: number): Promise<number> {
    // This would require a contract query
    // For now, return 0 as placeholder
    return 0;
  }
}

// Singleton instance
let agentStakingService: AgentStakingService | null = null;

export function getAgentStakingService(contractId?: string): AgentStakingService {
  if (!agentStakingService) {
    // Prefer EVM contract address
    const evm = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string) || '';
    const idOrAddr = contractId || evm;
    if (!idOrAddr) {
      throw new Error('Contract address not provided');
    }
    agentStakingService = new AgentStakingService(idOrAddr);
  }
  return agentStakingService;
}
