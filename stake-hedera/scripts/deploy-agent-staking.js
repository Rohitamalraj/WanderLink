const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying AgentStaking contract to Hedera Testnet...\n");

  // Get the contract factory
  const AgentStaking = await ethers.getContractFactory("AgentStaking");
  
  console.log("📝 Deploying contract...");
  
  // Deploy the contract (no constructor parameters)
  const agentStaking = await AgentStaking.deploy();
  
  await agentStaking.waitForDeployment();
  
  const contractAddress = await agentStaking.getAddress();
  
  console.log("✅ AgentStaking deployed successfully!");
  console.log("📍 Contract Address (EVM):", contractAddress);
  
  // Convert EVM address to Hedera Contract ID
  // Note: This is approximate - you may need to check HashScan for exact ID
  console.log("\n⚠️  Check HashScan for the exact Hedera Contract ID:");
  console.log(`https://hashscan.io/testnet/contract/${contractAddress}`);
  
  // Get deployer address
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("\n📊 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Name:    AgentStaking");
  console.log("Contract Address: ", contractAddress);
  console.log("Deployer Address: ", deployerAddress);
  console.log("Network:          Hedera Testnet");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // Save deployment info
  const deploymentInfo = {
    contractName: "AgentStaking",
    contractAddress: contractAddress,
    deployerAddress: deployerAddress,
    network: "hedera-testnet",
    deployedAt: new Date().toISOString(),
    abi: AgentStaking.interface.formatJson(),
  };
  
  const infoPath = path.join(__dirname, '..', 'agent-staking-deployment.json');
  fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("💾 Deployment info saved to: agent-staking-deployment.json\n");
  
  // Instructions
  console.log("📋 Next Steps:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Check HashScan for the Hedera Contract ID");
  console.log("2. Add to .env:");
  console.log(`   CONTRACT_ID=0.0.XXXXXXXX`);
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   NEXT_PUBLIC_AGENT_ADDRESS=${deployerAddress}`);
  console.log("3. Test approval flow in frontend");
  console.log("4. Test agent staking with 3 users");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("🎉 Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
