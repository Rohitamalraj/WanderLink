import dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";

dotenv.config();

async function completeTrip() {
  const tripId = process.argv[2];
  const success = process.argv[3] === "true";
  
  if (!tripId) {
    console.log("Usage: node scripts/complete-trip.js <tripId> <true|false>");
    console.log("Example: node scripts/complete-trip.js 1761407377170 true");
    process.exit(1);
  }
  
  console.log("🎯 Completing Trip...\n");
  console.log("Trip ID:", tripId);
  console.log("Success:", success ? "✅ Yes (keep stakes in balance)" : "❌ No (slash stakes)");
  console.log();
  
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
  
  // Check trip state before
  console.log("📊 Before Completion:");
  const tripTotal = await contract.getTripTotal(tripId);
  const participants = await contract.getTripParticipants(tripId);
  console.log("   Total staked:", ethers.formatEther(tripTotal), "HBAR");
  console.log("   Participants:", participants.length);
  console.log();
  
  // Complete the trip
  console.log("⏳ Sending transaction...");
  const tx = await contract.completeTrip(tripId, success);
  console.log("   Transaction hash:", tx.hash);
  console.log("   HashScan:", `https://hashscan.io/testnet/transaction/${tx.hash}`);
  console.log();
  
  console.log("⏳ Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("   ✅ Confirmed in block:", receipt.blockNumber);
  console.log();
  
  // Check trip state after
  console.log("📊 After Completion:");
  const tripCompleted = await contract.tripCompleted(tripId);
  console.log("   Trip completed:", tripCompleted);
  
  if (success) {
    console.log("\n✅ Trip successful!");
    console.log("   Stakes remain in user balances for withdrawal.");
  } else {
    console.log("\n❌ Trip failed - stakes slashed!");
    console.log("   Funds removed from user balances.");
  }
  
  // Check user balances
  console.log("\n💼 User Balances After:");
  for (const participant of participants) {
    const balance = await contract.getBalance(participant);
    console.log(`   ${participant}: ${ethers.formatEther(balance)} HBAR`);
  }
}

completeTrip().catch(console.error);
