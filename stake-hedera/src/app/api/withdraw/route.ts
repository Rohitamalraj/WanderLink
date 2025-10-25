import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import AgentStakingArtifact from '../../../../artifacts/contracts/AgentStaking.sol/AgentStaking.json';
import { getHederaContractService } from '@/lib/hedera-contract';

export async function POST(request: NextRequest) {
  try {
    const { userAddress } = await request.json();

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address required' },
        { status: 400 }
      );
    }

    console.log('💰 Withdrawal request for:', userAddress);

    // Connect to contract
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY!, provider);

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
      AgentStakingArtifact.abi,
      wallet
    );

    // Check user balance
    const balance = await contract.getBalance(userAddress);
    const balanceHBAR = ethers.formatEther(balance);

    console.log('   User balance:', balanceHBAR, 'HBAR');

    if (balance === 0n) {
      return NextResponse.json(
        { error: 'No balance to withdraw' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting withdrawal process...');
    console.log(`   📝 Withdrawing ${balanceHBAR} HBAR for user ${userAddress}`);
    console.log('   💰 Funds will be returned to agent wallet');

    // Use Hedera SDK for withdrawal (fixes JSON-RPC issues)
    console.log('   1. Using Hedera SDK for withdrawal...');
    
    const hederaService = getHederaContractService();
    const result = await hederaService.ownerWithdrawFor(userAddress, balance);

    if (!result.success) {
      throw new Error('Withdrawal transaction failed');
    }

    console.log(`✅ Withdrawal complete! ${balanceHBAR} HBAR returned to agent wallet.`);
    console.log(`   Transaction ID: ${result.transactionId}`);

    // Convert Hedera transaction ID to hash for HashScan
    // Format: 0.0.xxxxx@timestamp.nanoseconds
    const txId = result.transactionId;
    const hashscanUrl = `https://hashscan.io/testnet/transaction/${txId}`;

    return NextResponse.json({
      success: true,
      amount: balanceHBAR,
      userAddress: userAddress,
      agentAddress: wallet.address,
      transactionId: result.transactionId,
      hashscanUrl: hashscanUrl,
      message: `${balanceHBAR} HBAR returned to agent wallet`
    });

  } catch (error: any) {
    console.error('❌ Withdrawal error:', error);

    // Try to unpause contract if something went wrong
    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY!, provider);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        AgentStakingArtifact.abi,
        wallet
      );
      await contract.setPaused(false);
    } catch (e) {
      console.error('Could not unpause contract');
    }

    return NextResponse.json(
      { error: error.message || 'Withdrawal failed' },
      { status: 500 }
    );
  }
}
