import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

async function checkAgentBalance() {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const agentAddress = process.env.NEXT_PUBLIC_AGENT_EVM_ADDRESS;
  
  console.log('🔍 Checking Agent Balance...\n');
  console.log('Agent EVM Address:', agentAddress);
  console.log('Agent Account ID:', process.env.HEDERA_ACCOUNT_ID);
  console.log();
  
  const balance = await provider.getBalance(agentAddress);
  const balanceHBAR = ethers.formatEther(balance);
  
  console.log('💰 Current Balance:', balanceHBAR, 'HBAR');
  console.log();
  
  // Calculate what's needed
  const stakeAmount = 20; // HBAR per user
  const users = 3;
  const gasPerTx = 1; // Estimated HBAR for gas
  const totalNeeded = (stakeAmount * users) + (gasPerTx * users);
  
  console.log('📊 Requirements:');
  console.log(`   Stake needed: ${stakeAmount * users} HBAR (${stakeAmount} × ${users} users)`);
  console.log(`   Gas needed: ~${gasPerTx * users} HBAR (${gasPerTx} × ${users} txs)`);
  console.log(`   Total needed: ~${totalNeeded} HBAR`);
  console.log();
  
  const currentBalance = parseFloat(balanceHBAR);
  if (currentBalance < totalNeeded) {
    console.log(`❌ INSUFFICIENT! Need ${(totalNeeded - currentBalance).toFixed(2)} more HBAR`);
    console.log();
    console.log('🔗 Get test HBAR from:');
    console.log('   https://portal.hedera.com/faucet');
    console.log();
    console.log(`📤 Send to account: ${process.env.HEDERA_ACCOUNT_ID}`);
  } else {
    console.log('✅ Sufficient balance!');
  }
}

checkAgentBalance().catch(console.error);
