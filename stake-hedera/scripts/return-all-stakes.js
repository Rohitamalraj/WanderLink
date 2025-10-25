import dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";

dotenv.config();

async function returnAllStakes() {
  console.log("💰 RETURN ALL STAKES\n");
  
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, provider);
  
  const artifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/AgentStaking.sol/AgentStaking.json", "utf8")
  );
  
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    artifact.abi,
    wallet
  );
  
  const users = [
    { name: "User A", address: "0xa01bfafbb205c64fcca21fbe0d6d70642b78dfa3" },
    { name: "User B", address: "0x3f61590c3285332dc63503d5a2d917d3a8014ebc" },
    { name: "User C", address: "0xfefa60f5aa4069f96b9bf65c814ddb3a604974e1" }
  ];
  
  console.log("📊 Checking balances...\n");
  
  const usersWithBalance = [];
  for (const user of users) {
    const balance = await contract.getBalance(user.address);
    const balanceHBAR = ethers.formatEther(balance);
    console.log(`${user.name}: ${balanceHBAR} HBAR`);
    
    if (balance > 0n) {
      usersWithBalance.push({ ...user, balance, balanceHBAR });
    }
  }
  
  if (usersWithBalance.length === 0) {
    console.log("\n✅ No balances to return!");
    return;
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("STARTING RETURN PROCESS...");
  console.log("=".repeat(60) + "\n");
  
  try {
    // Step 1: Pause
    console.log("Step 1: Pausing contract...");
    const pauseTx = await contract.setPaused(true);
    await pauseTx.wait();
    console.log("   ✅ Paused\n");
    
    // Step 2: Emergency withdraw
    console.log("Step 2: Emergency withdrawing...");
    const withdrawTx = await contract.emergencyWithdraw();
    await withdrawTx.wait();
    console.log("   ✅ Withdrawn to owner\n");
    
    // Step 3: Send to each user
    console.log("Step 3: Sending HBAR to users...\n");
    const transactions = [];
    
    for (const user of usersWithBalance) {
      console.log(`   Sending ${user.balanceHBAR} HBAR to ${user.name}...`);
      const sendTx = await wallet.sendTransaction({
        to: user.address,
        value: user.balance
      });
      console.log(`   Transaction: ${sendTx.hash}`);
      console.log(`   HashScan: https://hashscan.io/testnet/transaction/${sendTx.hash}`);
      await sendTx.wait();
      console.log(`   ✅ Sent!\n`);
      
      transactions.push({
        user: user.name,
        amount: user.balanceHBAR,
        hash: sendTx.hash
      });
    }
    
    // Step 4: Unpause
    console.log("Step 4: Unpausing contract...");
    const unpauseTx = await contract.setPaused(false);
    await unpauseTx.wait();
    console.log("   ✅ Unpaused\n");
    
    console.log("=".repeat(60));
    console.log("✅ ALL STAKES RETURNED!");
    console.log("=".repeat(60));
    console.log("\n📊 Summary:\n");
    
    for (const tx of transactions) {
      console.log(`   ✅ ${tx.user}: ${tx.amount} HBAR`);
      console.log(`      ${tx.hash}`);
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    
    // Try to unpause
    try {
      console.log("\n🔧 Attempting to unpause...");
      const unpauseTx = await contract.setPaused(false);
      await unpauseTx.wait();
      console.log("   ✅ Unpaused");
    } catch (e) {
      console.log("   ⚠️  Could not unpause");
    }
  }
}

returnAllStakes().catch(console.error);
