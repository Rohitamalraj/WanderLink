import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying ZKProofVerifier contract...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy ZKProofVerifier
  const ZKProofVerifier = await ethers.getContractFactory("ZKProofVerifier");
  const zkProofVerifier = await ZKProofVerifier.deploy();
  await zkProofVerifier.waitForDeployment();

  const address = await zkProofVerifier.getAddress();
  console.log("✅ ZKProofVerifier deployed to:", address);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress: address,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
  };

  const deploymentPath = "./deployments/zkproof-verifier.json";
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to:", deploymentPath);

  console.log("\n📋 Contract Details:");
  console.log("   Address:", address);
  console.log("   Network:", deploymentInfo.network);
  console.log("   Chain ID:", deploymentInfo.chainId);
  console.log("\n🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
