import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

/**
 * API Route: Stake on behalf of user
 * The backend agent stakes HBAR on behalf of the user after they've approved
 */
export async function POST(req: NextRequest) {
  try {
    const { userAddress, amount, groupId } = await req.json();

    console.log(`🔐 Backend agent staking on behalf of user...`);
    console.log(`   User: ${userAddress}`);
    console.log(`   Amount: ${amount} HBAR`);
    console.log(`   Group ID: ${groupId}`);

    // Validate inputs
    if (!userAddress || !amount || !groupId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get environment variables
    const agentPrivateKey = process.env.AGENT_PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_STAKE_CONTRACT_ADDRESS;
    const rpcUrl = process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api';

    if (!agentPrivateKey || !contractAddress) {
      console.error('❌ Missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Connect to Hedera
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const agentWallet = new ethers.Wallet(agentPrivateKey, provider);

    console.log(`   Agent Address: ${agentWallet.address}`);

    // Contract ABI
    const contractABI = [
      'function stakeOnBehalf(address user, uint256 amount, uint256 tripId) external payable',
      'function allowance(address user, address agent) external view returns (uint256)',
      'function getBalance(address user) external view returns (uint256)'
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, agentWallet);

    // Convert amount to wei
    const amountWei = ethers.parseEther(amount.toString());

    // Convert group ID to uint256
    const tripIdHash = ethers.keccak256(ethers.toUtf8Bytes(groupId));
    const tripIdUint = BigInt(tripIdHash) % (BigInt(2) ** BigInt(256));

    console.log(`   Amount (wei): ${amountWei.toString()}`);
    console.log(`   Trip ID (uint): ${tripIdUint.toString()}`);

    // Check allowance
    const allowance = await contract.allowance(userAddress, agentWallet.address);
    console.log(`   User's allowance for agent: ${ethers.formatEther(allowance)} HBAR`);

    if (allowance < amountWei) {
      return NextResponse.json(
        { 
          error: `Insufficient allowance. User has approved ${ethers.formatEther(allowance)} HBAR, but trying to stake ${amount} HBAR.` 
        },
        { status: 400 }
      );
    }

    // Stake on behalf of user
    console.log(`   Sending stakeOnBehalf transaction...`);
    const tx = await contract.stakeOnBehalf(userAddress, amountWei, tripIdUint, {
      value: amountWei,
      gasLimit: 500000
    });

    console.log(`   📤 Transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`   ✅ Transaction confirmed! Block: ${receipt.blockNumber}`);

    // Return transaction details
    return NextResponse.json({
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      amount: amount,
      userAddress: userAddress,
      tripId: tripIdUint.toString(),
      explorerUrl: `https://hashscan.io/testnet/transaction/${tx.hash}`
    });

  } catch (error: any) {
    console.error('❌ Stake on behalf error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to stake on behalf',
        details: error.reason || error.data?.message
      },
      { status: 500 }
    );
  }
}
