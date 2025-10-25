import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import AgentStakingArtifact from '../../../../artifacts/contracts/AgentStaking.sol/AgentStaking.json';

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

    // Step 1: Pause contract
    console.log('   1. Pausing contract...');
    const pauseTx = await contract.setPaused(true);
    await pauseTx.wait();

    // Step 2: Emergency withdraw to owner
    console.log('   2. Emergency withdrawing...');
    const withdrawTx = await contract.emergencyWithdraw();
    await withdrawTx.wait();

    // Step 3: Send to user
    console.log('   3. Sending to user...');
    const sendTx = await wallet.sendTransaction({
      to: userAddress,
      value: balance
    });
    await sendTx.wait();

    // Step 4: Unpause contract
    console.log('   4. Unpausing contract...');
    const unpauseTx = await contract.setPaused(false);
    await unpauseTx.wait();

    console.log('✅ Withdrawal complete!');

    return NextResponse.json({
      success: true,
      amount: balanceHBAR,
      transactionHash: sendTx.hash,
      hashscanUrl: `https://hashscan.io/testnet/transaction/${sendTx.hash}`
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
