import { ethers } from 'ethers';

/**
 * Browser-side contract service for user-initiated transactions
 * Used for: approval, checking allowance, manual staking
 */
export class StakeContractService {
  private contractAddress: string;
  private agentAddress: string;

  // Minimal ABI for approval and allowance
  private readonly ABI = [
    'function approve(address agent, uint256 amount) external',
    'function allowance(address user, address agent) external view returns (uint256)',
    'function getBalance(address user) external view returns (uint256)',
    'function stakeOnBehalf(address user, uint256 amount, uint256 tripId) external payable',
  ];

  constructor(contractAddress: string, agentAddress: string) {
    this.contractAddress = contractAddress;
    this.agentAddress = agentAddress;
  }

  /**
   * Connect to MetaMask and get contract instance
   */
  private async getContract(): Promise<ethers.Contract> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(this.contractAddress, this.ABI, signer);
  }

  /**
   * Approve agent to stake on behalf of user
   * @param amount Amount in HBAR (will be converted to wei)
   */
  async approveAgent(amount: number): Promise<string> {
    try {
      // First ensure we're on Hedera network
      const switched = await this.switchToHedera();
      if (!switched) {
        throw new Error('Please switch to Hedera Testnet in MetaMask');
      }

      const contract = await this.getContract();
      const amountWei = ethers.parseEther(amount.toString());

      console.log(`🔐 Approving agent to stake ${amount} HBAR...`);
      console.log(`   Contract: ${this.contractAddress}`);
      console.log(`   Agent: ${this.agentAddress}`);
      console.log(`   Amount: ${amountWei.toString()} wei`);

      const tx = await contract.approve(this.agentAddress, amountWei);
      console.log(`   Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`✅ Approval confirmed! Block: ${receipt.blockNumber}`);

      return tx.hash;
    } catch (error: any) {
      console.error('❌ Approval failed:', error);
      throw new Error(error.message || 'Failed to approve agent');
    }
  }

  /**
   * Check how much the agent is approved to stake
   */
  async checkAllowance(userAddress: string): Promise<string> {
    try {
      // First ensure we're on Hedera network
      await this.switchToHedera();

      const contract = await this.getContract();
      
      try {
        const allowance = await contract.allowance(userAddress, this.agentAddress);
        const allowanceHbar = ethers.formatEther(allowance);

        console.log(`📊 Allowance check:`);
        console.log(`   User: ${userAddress}`);
        console.log(`   Agent: ${this.agentAddress}`);
        console.log(`   Allowance: ${allowanceHbar} HBAR`);

        return allowanceHbar;
      } catch (error: any) {
        // If allowance function doesn't exist or returns empty, assume no approval
        if (error.code === 'BAD_DATA' || error.message.includes('could not decode')) {
          console.log('⚠️ Allowance function not available, assuming no approval');
          return '0';
        }
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Allowance check failed:', error);
      // Return 0 instead of throwing to allow approval flow
      return '0';
    }
  }

  /**
   * Check user's balance in the contract
   */
  async getUserBalance(userAddress: string): Promise<string> {
    try {
      const contract = await this.getContract();
      const balance = await contract.getBalance(userAddress);
      const balanceHbar = ethers.formatEther(balance);

      console.log(`💰 Balance: ${balanceHbar} HBAR for ${userAddress}`);
      return balanceHbar;
    } catch (error: any) {
      console.error('❌ Balance check failed:', error);
      return '0';
    }
  }

  /**
   * Switch to Hedera Testnet
   */
  async switchToHedera(): Promise<boolean> {
    if (typeof window === 'undefined' || !window.ethereum) {
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x128' }], // 296 in hex
      });
      return true;
    } catch (switchError: any) {
      // Chain not added, try adding it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x128',
                chainName: 'Hedera Testnet',
                nativeCurrency: {
                  name: 'HBAR',
                  symbol: 'HBAR',
                  decimals: 18,
                },
                rpcUrls: ['https://testnet.hashio.io/api'],
                blockExplorerUrls: ['https://hashscan.io/testnet'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Hedera network:', addError);
          return false;
        }
      }
      return false;
    }
  }
}

/**
 * Helper function to get contract service instance
 */
export function getStakeContractService(): StakeContractService {
  const contractAddress = process.env.NEXT_PUBLIC_STAKE_CONTRACT_ADDRESS;
  const agentAddress = process.env.NEXT_PUBLIC_AGENT_EVM_ADDRESS;

  if (!contractAddress || !agentAddress) {
    throw new Error('Missing contract or agent address in environment variables');
  }

  return new StakeContractService(contractAddress, agentAddress);
}
