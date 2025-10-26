const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying GroupRegistry to Hedera...");
  console.log("📍 Network:", hre.network.name);
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "HBAR");
  
  // Deploy contract
  console.log("\n📝 Deploying GroupRegistry contract...");
  const GroupRegistry = await ethers.getContractFactory("GroupRegistry");
  const groupRegistry = await GroupRegistry.deploy();
  
  await groupRegistry.deployed();
  
  const contractAddress = groupRegistry.address;
  console.log("✅ GroupRegistry deployed to:", contractAddress);
  
  // Wait for a few blocks for confirmation
  console.log("\n⏳ Waiting for block confirmations...");
  await groupRegistry.deployTransaction.wait(3);
  
  console.log("\n🎉 Deployment successful!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 Contract Address (EVM):", contractAddress);
  console.log("🔗 View on HashScan:");
  
  if (hre.network.name === "hederaTestnet") {
    console.log(`   https://hashscan.io/testnet/contract/${contractAddress}`);
  } else if (hre.network.name === "hederaMainnet") {
    console.log(`   https://hashscan.io/mainnet/contract/${contractAddress}`);
  }
  
  console.log("\n📋 Next Steps:");
  console.log("1. Go to HashScan and find the Contract ID (format: 0.0.XXXXXXX)");
  console.log("2. Add to frontend/.env.local:");
  console.log(`   NEXT_PUBLIC_GROUP_REGISTRY_CONTRACT_ID=0.0.XXXXXXX`);
  console.log("3. Restart your dev server");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
