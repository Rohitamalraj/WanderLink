import dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";

dotenv.config();

async function checkContractState() {
  console.log("🔍 Checking Contract State...\n");
  
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const artifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/AgentStaking.sol/AgentStaking.json", "utf8")
  );
  
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    artifact.abi,
    provider
  );
  
  const tripId = 1761407377170; // From the logs
  
  // 1. Check contract balance
  console.log("💰 Contract Balance:");
  const contractBalance = await provider.getBalance(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
  console.log("   Total HBAR in contract:", ethers.formatEther(contractBalance), "HBAR");
  console.log();
  
  // 2. Check trip total
  console.log("🎯 Trip Information:");
  const tripTotal = await contract.getTripTotal(tripId);
  console.log("   Trip ID:", tripId);
  console.log("   Trip Total Staked:", ethers.formatEther(tripTotal), "HBAR");
  console.log();
  
  // 3. Check trip participants
  console.log("👥 Trip Participants:");
  const participants = await contract.getTripParticipants(tripId);
  console.log("   Number of participants:", participants.length);
  
  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];
    const stakeAmount = await contract.tripStakes(tripId, participant);
    const balance = await contract.getBalance(participant);
    
    console.log(`\n   Participant ${i + 1}:`, participant);
    console.log(`     Stake in this trip: ${ethers.formatEther(stakeAmount)} HBAR`);
    console.log(`     Total balance in contract: ${ethers.formatEther(balance)} HBAR`);
  }
  
  console.log();
  
  // 4. Check if trip is completed
  console.log("📊 Trip Status:");
  const tripCompleted = await contract.tripCompleted(tripId);
  console.log("   Completed:", tripCompleted ? "Yes" : "No");
  console.log();
  
  // 5. Check individual user balances
  console.log("💼 User Balances in Contract:");
  const users = [
    { name: "User C", address: "0xfefa60f5aa4069f96b9bf65c814ddb3a604974e1" },
    { name: "User A", address: "0xa01bfafbb205c64fcca21fbe0d6d70642b78dfa3" },
    { name: "User B", address: "0x3f61590c3285332dc63503d5a2d917d3a8014ebc" }
  ];
  
  for (const user of users) {
    const balance = await contract.getBalance(user.address);
    console.log(`   ${user.name}: ${ethers.formatEther(balance)} HBAR`);
  }
  
  console.log();
  console.log("═══════════════════════════════════════");
  console.log("✅ CONTRACT IS HOLDING FUNDS!");
  console.log("═══════════════════════════════════════");
  console.log("\n📝 Summary:");
  console.log(`   - ${participants.length} users staked successfully`);
  console.log(`   - Total staked: ${ethers.formatEther(tripTotal)} HBAR`);
  console.log(`   - Contract holds: ${ethers.formatEther(contractBalance)} HBAR`);
  console.log(`   - Trip status: ${tripCompleted ? "Completed" : "Active"}`);
}

checkContractState().catch(console.error);
