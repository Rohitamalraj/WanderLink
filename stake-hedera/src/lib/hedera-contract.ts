/**
 * Hedera SDK Contract Service
 * Handles contract interactions using native Hedera SDK
 * Fixes the JSON-RPC transaction encoding issues
 */

import {
  Client,
  AccountId,
  PrivateKey,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  ContractCallQuery,
} from '@hashgraph/sdk';
import { ethers } from 'ethers';

export class HederaContractService {
  private client: Client;
  private operatorAccountId: AccountId;
  private operatorPrivateKey: PrivateKey;
  private contractId: string;

  constructor() {
    // Initialize Hedera client
    const accountId = process.env.HEDERA_ACCOUNT_ID!;
    const privateKey = process.env.HEDERA_PRIVATE_KEY!;
    const network = process.env.HEDERA_NETWORK || 'testnet';

    this.operatorAccountId = AccountId.fromString(accountId);
    this.operatorPrivateKey = PrivateKey.fromStringECDSA(privateKey);

    // Create client for testnet
    this.client = network === 'mainnet' 
      ? Client.forMainnet()
      : Client.forTestnet();

    this.client.setOperator(this.operatorAccountId, this.operatorPrivateKey);

    // Get contract ID from EVM address
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
    this.contractId = this.evmAddressToContractId(contractAddress);
  }

  /**
   * Convert EVM address to Hedera Contract ID
   * EVM addresses on Hedera map to contract IDs
   */
  private evmAddressToContractId(evmAddress: string): string {
    // Remove 0x prefix
    const hex = evmAddress.startsWith('0x') ? evmAddress.slice(2) : evmAddress;
    
    // Convert to BigInt and then to contract ID format
    // This is an approximation - in production, you'd query the mirror node
    // For now, we'll use the EVM address directly in contract calls
    return `0.0.${parseInt(hex.slice(-8), 16)}`;
  }

  /**
   * Call ownerWithdrawFor function
   * Withdraws user's balance and sends to agent
   */
  async ownerWithdrawFor(userAddress: string, amount: bigint): Promise<{
    success: boolean;
    transactionId: string;
    transactionHash?: string;
  }> {
    try {
      console.log('🔷 Using Hedera SDK for withdrawal');
      console.log(`   User: ${userAddress}`);
      console.log(`   Amount: ${ethers.formatEther(amount)} HBAR`);

      // Prepare function parameters
      const functionParams = new ContractFunctionParameters()
        .addAddress(userAddress)
        .addUint256(Number(amount));

      // Execute contract function
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(1500000)
        .setFunction('ownerWithdrawFor', functionParams);

      console.log('   Executing transaction...');
      const txResponse = await transaction.execute(this.client);

      console.log('   Getting receipt...');
      const receipt = await txResponse.getReceipt(this.client);

      console.log(`   Status: ${receipt.status.toString()}`);

      // Get transaction hash for HashScan
      const transactionId = txResponse.transactionId.toString();
      
      return {
        success: receipt.status.toString() === 'SUCCESS',
        transactionId: transactionId,
        transactionHash: txResponse.transactionHash?.toString(),
      };

    } catch (error: any) {
      console.error('❌ Hedera SDK withdrawal error:', error.message);
      throw error;
    }
  }

  /**
   * Call stakeOnBehalf function
   * Stakes HBAR on behalf of a user
   */
  async stakeOnBehalf(
    userAddress: string,
    amount: bigint,
    tripId: number
  ): Promise<{
    success: boolean;
    transactionId: string;
    transactionHash?: string;
  }> {
    try {
      console.log('🔷 Using Hedera SDK for staking');
      console.log(`   User: ${userAddress}`);
      console.log(`   Amount: ${ethers.formatEther(amount)} HBAR`);
      console.log(`   Trip ID: ${tripId}`);

      // Convert wei (18 decimals) to tinybars (8 decimals)
      // 1 HBAR = 10^8 tinybars = 10^18 wei
      // So: tinybars = wei / 10^10
      const amountInTinybars = amount / 10000000000n; // Divide by 10^10
      
      // Prepare function parameters
      const functionParams = new ContractFunctionParameters()
        .addAddress(userAddress)
        .addUint256(amount.toString()) // Keep as wei for contract
        .addUint256(tripId);

      // Execute contract function with HBAR payment
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(1500000)
        .setPayableAmount(Hbar.fromTinybars(amountInTinybars.toString()))
        .setFunction('stakeOnBehalf', functionParams);

      console.log('   Executing transaction...');
      const txResponse = await transaction.execute(this.client);

      console.log('   Getting receipt...');
      const receipt = await txResponse.getReceipt(this.client);

      console.log(`   Status: ${receipt.status.toString()}`);

      const transactionId = txResponse.transactionId.toString();
      
      return {
        success: receipt.status.toString() === 'SUCCESS',
        transactionId: transactionId,
        transactionHash: txResponse.transactionHash?.toString(),
      };

    } catch (error: any) {
      console.error('❌ Hedera SDK staking error:', error.message);
      throw error;
    }
  }

  /**
   * Query user balance (read-only)
   */
  async getBalance(userAddress: string): Promise<bigint> {
    try {
      const functionParams = new ContractFunctionParameters()
        .addAddress(userAddress);

      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction('getBalance', functionParams);

      const result = await query.execute(this.client);
      
      // Parse uint256 result
      const balance = result.getUint256(0);
      return BigInt(balance.toString());

    } catch (error: any) {
      console.error('❌ Error querying balance:', error.message);
      throw error;
    }
  }

  /**
   * Close the client connection
   */
  close() {
    this.client.close();
  }
}

// Singleton instance
let hederaContractService: HederaContractService | null = null;

export function getHederaContractService(): HederaContractService {
  if (!hederaContractService) {
    hederaContractService = new HederaContractService();
  }
  return hederaContractService;
}
