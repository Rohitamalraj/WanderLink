import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying WanderLink Contracts...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());
  console.log("");

  // Deploy ZKProofVerifier
  console.log("📦 Deploying ZKProofVerifier...");
  const ZKProofVerifier = await ethers.getContractFactory("ZKProofVerifier");
  const zkProofVerifier = await ZKProofVerifier.deploy();
  await zkProofVerifier.waitForDeployment();
  const zkProofAddress = await zkProofVerifier.getAddress();
  console.log("✅ ZKProofVerifier deployed to:", zkProofAddress);
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      ZKProofVerifier: {
        address: zkProofAddress,
        verified: false
      },
      DataCoin: {
        address: "0x834a8369d6cbf91f8e587e1e998d31988e76a03f",
        note: "Pre-deployed DataCoin contract from Lighthouse"
      }
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentPath = path.join(deploymentsDir, `${network.name}-${network.chainId}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to:", deploymentPath);
  console.log("");

  // Create frontend config
  const frontendConfig = `// Auto-generated deployment config
// Network: ${network.name} (Chain ID: ${network.chainId})
// Generated: ${new Date().toISOString()}

export const CONTRACTS = {
  ZK_PROOF_VERIFIER: "${zkProofAddress}",
  DATACOIN: "0x834a8369d6cbf91f8e587e1e998d31988e76a03f",
};

export const NETWORK = {
  name: "${network.name}",
  chainId: ${network.chainId},
};
`;

  const configPath = path.join(__dirname, "../../frontend/lib/contracts.ts");
  fs.writeFileSync(configPath, frontendConfig);
  console.log("📄 Frontend config saved to:", configPath);
  console.log("");

  console.log("🎉 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("ZKProofVerifier:", zkProofAddress);
  console.log("DataCoin:", "0x834a8369d6cbf91f8e587e1e998d31988e76a03f");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  console.log("📋 Next Steps:");
  console.log("1. Verify contracts on block explorer");
  console.log("2. Update frontend .env with contract addresses");
  console.log("3. Test the complete flow");
  console.log("");

  console.log("🔍 Verification Commands:");
  console.log(`npx hardhat verify --network ${network.name} ${zkProofAddress}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
