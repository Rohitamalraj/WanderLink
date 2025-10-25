import dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";

dotenv.config();

async function withdrawForUser() {
  const userAddress = process.argv[2];
  
  if (!userAddress) {
    console.log("Usage: node scripts/withdraw-for-user.js <userAddress>");
    console.log("\nExample:");
    console.log("  node scripts/withdraw-for-user.js 0x3f61590c3285332dc63503d5a2d917d3a8014ebc");
    console.log("\nKnown users:");
    console.log("  User A: 0xa01bfafbb205c64fcca21fbe0d6d70642b78dfa3");
    console.log("  User B: 0x3f61590c3285332dc63503d5a2d917d3a8014ebc");
    console.log("  User C: 0xfefa60f5aa4069f96b9bf65c814ddb3a604974e1");
    process.exit(1);
  }
  
  console.log("💰 Withdrawing funds for user...\n");
  console.log("User Address:", userAddress);
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
  
  // Check user balance
  console.log("📊 Checking balance...");
  const balance = await contract.getBalance(userAddress);
  const balanceHBAR = ethers.formatEther(balance);
  console.log("   User balance:", balanceHBAR, "HBAR");
  console.log();
  
  if (balance === 0n) {
    console.log("❌ User has no balance to withdraw!");
    process.exit(1);
  }
  
  // Emergency withdraw (owner only)
  console.log("⚠️  WARNING: This will transfer HBAR directly to the user's address");
  console.log("   This bypasses the normal withdrawal flow");
  console.log();
  
  // Since we can't call withdraw on behalf of user, we need to:
  // 1. Either have user call withdraw themselves
  // 2. Or use emergencyWithdraw (requires pause)
  // 3. Or send HBAR directly from contract
  
  console.log("🔧 Options to return funds:");
  console.log();
  console.log("Option 1: User withdraws themselves");
  console.log("  The user needs to call:");
  console.log(`  contract.withdraw("${balance}")`);
  console.log();
  console.log("Option 2: Emergency withdrawal (requires contract pause)");
  console.log("  1. Pause contract: contract.setPaused(true)");
  console.log("  2. Emergency withdraw: contract.emergencyWithdraw()");
  console.log("  3. Manually send HBAR to user");
  console.log();
  console.log("Option 3: Complete trip as successful (recommended)");
  console.log("  This keeps funds in user balance for them to withdraw");
  console.log();
  
  // Let's just provide the user with withdrawal instructions
  console.log("📝 Instructions for User B to withdraw:");
  console.log();
  console.log("1. Connect wallet in the frontend");
  console.log("2. The withdrawal button should appear automatically");
  console.log("3. Click 'Withdraw All' button");
  console.log();
  console.log("OR manually via ethers:");
  console.log();
  console.log(`const contract = new ethers.Contract(`);
  console.log(`  "${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}",`);
  console.log(`  abi,`);
  console.log(`  signer`);
  console.log(`);`);
  console.log(`await contract.withdraw("${balance}");`);
  console.log();
  
  // Alternatively, let's create a direct transfer function
  console.log("🚀 Creating emergency transfer script...");
  console.log();
  
  const transferScript = `
// Emergency Transfer Script
// Run this with the user's private key to withdraw

import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function withdraw() {
  // USER MUST PROVIDE THEIR OWN PRIVATE KEY
  const userPrivateKey = "USER_PRIVATE_KEY_HERE";
  
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const userWallet = new ethers.Wallet(userPrivateKey, provider);
  
  const artifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/AgentStaking.sol/AgentStaking.json", "utf8")
  );
  
  const contract = new ethers.Contract(
    "${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}",
    artifact.abi,
    userWallet
  );
  
  const balance = await contract.getBalance(userWallet.address);
  console.log("Balance:", ethers.formatEther(balance), "HBAR");
  
  const tx = await contract.withdraw(balance);
  console.log("Transaction:", tx.hash);
  
  await tx.wait();
  console.log("✅ Withdrawn successfully!");
}

withdraw().catch(console.error);
`;
  
  fs.writeFileSync("scripts/user-withdraw.js", transferScript);
  console.log("✅ Created scripts/user-withdraw.js");
  console.log("   User needs to add their private key and run it");
}

withdrawForUser().catch(console.error);
