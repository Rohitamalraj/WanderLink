const hre = require("hardhat");
const { 
  Client, 
  AccountId, 
  PrivateKey,
  ContractCreateFlow
} = require("@hashgraph/sdk");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying AgentStaking contract...\n");

  await hre.run("compile");

  const artifactPath = path.join(__dirname, "../artifacts/contracts/AgentStaking.sol/AgentStaking.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const bytecode = artifact.bytecode;

  console.log(`📄 Bytecode: ${bytecode.length / 2} bytes\n`);

  const client = Client.forTestnet();
  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  
  let operatorKey;
  try {
    operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
  } catch (e) {
    try {
      operatorKey = PrivateKey.fromStringED25519(process.env.HEDERA_PRIVATE_KEY);
    } catch (e2) {
      operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    }
  }
  
  client.setOperator(operatorId, operatorKey);

  try {
    console.log("🏗️  Deploying AgentStaking contract...");
    console.log(`   Operator: ${operatorId}`);
    console.log(`   Agent Address: ${operatorId} (will be the agent)\n`);
    
    // Deploy contract (no constructor parameters)
    const contractCreate = new ContractCreateFlow()
      .setGas(1000000)  // Maximum gas for complex contract
      .setBytecode(bytecode);

    const txResponse = await contractCreate.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const contractId = receipt.contractId;

    console.log("✅ SUCCESS! AgentStaking contract deployed!\n");
    console.log("📋 Deployment Details:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`   Contract ID: ${contractId}`);
    console.log(`   Owner/Agent: ${operatorId}`);
    console.log(`   Network: Hedera Testnet`);
    console.log(`   HashScan: https://hashscan.io/testnet/contract/${contractId}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Save deployment info
    const deploymentInfo = {
      contractName: "AgentStaking",
      contractId: contractId.toString(),
      owner: operatorId.toString(),
      agentAddress: operatorId.toString(),
      deployedAt: new Date().toISOString(),
      network: "testnet",
      hashscanUrl: `https://hashscan.io/testnet/contract/${contractId}`,
      abi: artifact.abi
    };

    const infoPath = path.join(__dirname, "../agent-staking-deployment.json");
    fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("💾 Deployment info saved to: agent-staking-deployment.json\n");
    
    console.log("📋 Next Steps:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. Add to .env:");
    console.log(`   CONTRACT_ID=${contractId}`);
    console.log(`   NEXT_PUBLIC_AGENT_ADDRESS=${operatorId}`);
    console.log("");
    console.log("2. Get EVM address from HashScan and add:");
    console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...`);
    console.log("");
    console.log("3. Test approval flow in frontend");
    console.log("4. Test agent staking with 3 users");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("🎉 DEPLOYMENT COMPLETE!\n");

    client.close();
    return contractId.toString();

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.status) console.error("   Status:", error.status.toString());
    client.close();
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
