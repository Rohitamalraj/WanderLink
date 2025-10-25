import fs from "fs";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

async function main() {
  console.log("🚀 Deploying AgentStaking via ethers.js to Hedera RPC...\n");

  // Load artifact
  const artifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/AgentStaking.sol/AgentStaking.json", "utf8")
  );

  // Connect to Hedera RPC
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, provider);

  console.log("📋 Deployer address:", wallet.address);
  console.log("📋 Deployer account:", process.env.HEDERA_ACCOUNT_ID);

  // Get balance
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "HBAR\n");

  // Deploy contract
  console.log("🏗️  Deploying contract...");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  
  const contract = await factory.deploy({
    gasLimit: 5_000_000,
  });

  console.log("⏳ Waiting for deployment...");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("\n✅ Contract deployed successfully!");
  console.log("   🆔 Contract Address:", contractAddress);
  console.log("   🌐 HashScan:", `https://hashscan.io/testnet/contract/${contractAddress}`);

  // Save contract info
  const contractInfo = {
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    network: "testnet",
    deployer: wallet.address,
    deployerAccount: process.env.HEDERA_ACCOUNT_ID,
    hashscanUrl: `https://hashscan.io/testnet/contract/${contractAddress}`
  };

  fs.writeFileSync("contract-info.json", JSON.stringify(contractInfo, null, 2));

  console.log("\n💾 Contract info saved to contract-info.json");
  console.log("\n📝 Update your .env file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
}

main().catch((err) => {
  console.error("💥 Deployment Error:", err);
  process.exit(1);
});
