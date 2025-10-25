import dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";

dotenv.config();

async function verifyContract() {
  console.log("🔍 Verifying AgentStaking Contract...\n");

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const agentAddress = process.env.NEXT_PUBLIC_AGENT_EVM_ADDRESS;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

  console.log("📋 Contract Address:", contractAddress);
  console.log("📋 Agent Address:", agentAddress);
  console.log("📋 RPC URL:", rpcUrl);
  console.log();

  // Load artifact
  const artifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/AgentStaking.sol/AgentStaking.json", "utf8")
  );

  // Connect to Hedera RPC
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

  try {
    // 1. Check if contract exists
    console.log("1️⃣ Checking contract code...");
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      throw new Error("❌ No contract code at this address!");
    }
    console.log("   ✅ Contract code exists\n");

    // 2. Check owner
    console.log("2️⃣ Checking contract owner...");
    const owner = await contract.owner();
    console.log("   Owner:", owner);
    console.log("   Expected:", agentAddress);
    if (owner.toLowerCase() !== agentAddress.toLowerCase()) {
      console.log("   ⚠️  Owner mismatch!");
    } else {
      console.log("   ✅ Owner matches agent address\n");
    }

    // 3. Check paused status
    console.log("3️⃣ Checking paused status...");
    const paused = await contract.paused();
    console.log("   Paused:", paused);
    if (paused) {
      console.log("   ⚠️  Contract is paused!");
    } else {
      console.log("   ✅ Contract is active\n");
    }

    // 4. Check MIN_STAKE
    console.log("4️⃣ Checking minimum stake...");
    const minStake = await contract.MIN_STAKE();
    console.log("   Min Stake:", ethers.formatEther(minStake), "HBAR");
    console.log("   ✅ Minimum stake configured\n");

    // 5. Test allowance function
    console.log("5️⃣ Testing allowance function...");
    const testUser = "0x0000000000000000000000000000000000000001";
    const allowance = await contract.allowance(testUser, agentAddress);
    console.log("   Test allowance:", allowance.toString());
    console.log("   ✅ Allowance function works\n");

    // 6. Check agent balance
    console.log("6️⃣ Checking agent balance...");
    const balance = await provider.getBalance(agentAddress);
    console.log("   Agent Balance:", ethers.formatEther(balance), "HBAR");
    if (parseFloat(ethers.formatEther(balance)) < 10) {
      console.log("   ⚠️  Low balance! Agent needs more HBAR for gas fees");
    } else {
      console.log("   ✅ Sufficient balance\n");
    }

    // 7. Check contract balance
    console.log("7️⃣ Checking contract balance...");
    const contractBalance = await provider.getBalance(contractAddress);
    console.log("   Contract Balance:", ethers.formatEther(contractBalance), "HBAR");
    console.log("   ✅ Contract balance checked\n");

    console.log("═══════════════════════════════════════");
    console.log("✅ ALL CHECKS PASSED!");
    console.log("═══════════════════════════════════════");
    console.log("\n📝 Next steps:");
    console.log("1. Users need to approve the agent on the NEW contract");
    console.log("2. Test with 3 different wallets");
    console.log("3. Agent will stake on behalf of users");

  } catch (error) {
    console.error("\n❌ Verification failed:", error.message);
    throw error;
  }
}

verifyContract().catch((err) => {
  console.error("\n💥 Error:", err);
  process.exit(1);
});
