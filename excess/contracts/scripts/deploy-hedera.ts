import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "node:fs";
import * as path from "node:path";

dotenv.config({ path: "../.env.local" });

async function main() {
  console.log("🚀 Deploying WanderLink contracts to Hedera Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "HBAR\n");

  // Deploy TripEscrow
  console.log("📝 Deploying TripEscrow...");
  const TripEscrow = await ethers.getContractFactory("TripEscrow");
  const tripEscrow = await TripEscrow.deploy();
  await tripEscrow.waitForDeployment();
  const tripEscrowAddress = await tripEscrow.getAddress();
  console.log("✅ TripEscrow deployed to:", tripEscrowAddress);

  // Deploy ReputationSBT
  console.log("\n📝 Deploying ReputationSBT...");
  const ReputationSBT = await ethers.getContractFactory("ReputationSBT");
  const reputationSBT = await ReputationSBT.deploy();
  await reputationSBT.waitForDeployment();
  const reputationSBTAddress = await reputationSBT.getAddress();
  console.log("✅ ReputationSBT deployed to:", reputationSBTAddress);

  // Deploy TripNFT
  console.log("\n📝 Deploying TripNFT...");
  const baseURI = "https://api.WanderLink.xyz/metadata/trip/";
  const TripNFT = await ethers.getContractFactory("TripNFT");
  const tripNFT = await TripNFT.deploy(baseURI);
  await tripNFT.waitForDeployment();
  const tripNFTAddress = await tripNFT.getAddress();
  console.log("✅ TripNFT deployed to:", tripNFTAddress);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY (Hedera Testnet)");
  console.log("=".repeat(60));
  console.log("TripEscrow:     ", tripEscrowAddress);
  console.log("ReputationSBT:  ", reputationSBTAddress);
  console.log("TripNFT:        ", tripNFTAddress);
  console.log("=".repeat(60));

  // Save addresses to file
  const dir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(dir, { recursive: true });
  const addresses = {
    network: "hedera-testnet",
    chainId: 296,
    contracts: {
      TripEscrow: tripEscrowAddress,
      ReputationSBT: reputationSBTAddress,
      TripNFT: tripNFTAddress,
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(dir, "hedera-testnet.json"), JSON.stringify(addresses, null, 2));
  console.log("\n✅ Deployment addresses saved to ./deployments/hedera-testnet.json");

  console.log("\n🎉 Deployment complete!\n");
}

(async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
