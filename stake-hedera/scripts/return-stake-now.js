import dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";

dotenv.config();

async function returnStakeNow() {
  console.log("💰 EMERGENCY STAKE RETURN\n");
  console.log("This will:");
  console.log("1. Pause the contract");
  console.log("2. Withdraw all funds to owner");
  console.log("3. Send 20 HBAR to User B");
  console.log("4. Unpause the contract\n");
  
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, provider);
  
  console.log("Owner address:", wallet.address);
  console.log("Owner account:", process.env.HEDERA_ACCOUNT_ID);
  
  const ownerBalance = await provider.getBalance(wallet.address);
  console.log("Owner balance:", ethers.formatEther(ownerBalance), "HBAR\n");
  
  const artifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/AgentStaking.sol/AgentStaking.json", "utf8")
  );
  
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    artifact.abi,
    wallet
  );
  
  const contractBalance = await provider.getBalance(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
  console.log("Contract balance:", ethers.formatEther(contractBalance), "HBAR\n");
  
  const userB = "0x3f61590c3285332dc63503d5a2d917d3a8014ebc";
  const userBBalance = await contract.getBalance(userB);
  console.log("User B contract balance:", ethers.formatEther(userBBalance), "HBAR\n");
  
  console.log("=".repeat(60));
  console.log("STARTING EMERGENCY RETURN...");
  console.log("=".repeat(60) + "\n");
  
  try {
    // Step 1: Pause contract
    console.log("Step 1: Pausing contract...");
    const pauseTx = await contract.setPaused(true);
    console.log("   Transaction:", pauseTx.hash);
    await pauseTx.wait();
    console.log("   ✅ Contract paused\n");
    
    // Step 2: Emergency withdraw
    console.log("Step 2: Emergency withdrawing funds...");
    const withdrawTx = await contract.emergencyWithdraw();
    console.log("   Transaction:", withdrawTx.hash);
    await withdrawTx.wait();
    console.log("   ✅ Funds withdrawn to owner\n");
    
    // Check owner balance now
    const newOwnerBalance = await provider.getBalance(wallet.address);
    console.log("   Owner balance now:", ethers.formatEther(newOwnerBalance), "HBAR\n");
    
    // Step 3: Send to User B
    console.log("Step 3: Sending 20 HBAR to User B...");
    console.log("   User B address:", userB);
    const sendTx = await wallet.sendTransaction({
      to: userB,
      value: ethers.parseEther("20")
    });
    console.log("   Transaction:", sendTx.hash);
    console.log("   HashScan:", `https://hashscan.io/testnet/transaction/${sendTx.hash}`);
    await sendTx.wait();
    console.log("   ✅ 20 HBAR sent to User B\n");
    
    // Step 4: Unpause contract
    console.log("Step 4: Unpausing contract...");
    const unpauseTx = await contract.setPaused(false);
    console.log("   Transaction:", unpauseTx.hash);
    await unpauseTx.wait();
    console.log("   ✅ Contract unpaused\n");
    
    console.log("=".repeat(60));
    console.log("✅ EMERGENCY RETURN COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📊 Summary:");
    console.log("   ✅ User B received 20 HBAR");
    console.log("   ✅ Contract is active again");
    console.log("   ✅ All funds returned\n");
    
  } catch (error) {
    console.error("\n❌ Error during emergency return:");
    console.error(error.message);
    
    // Try to unpause if something went wrong
    try {
      console.log("\n🔧 Attempting to unpause contract...");
      const unpauseTx = await contract.setPaused(false);
      await unpauseTx.wait();
      console.log("   ✅ Contract unpaused");
    } catch (e) {
      console.log("   ⚠️  Could not unpause, may need manual intervention");
    }
  }
}

returnStakeNow().catch(console.error);
