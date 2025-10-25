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
  console.log("🚀 Deploying BasicStake (NO constructor params)...\n");

  await hre.run("compile");

  const artifactPath = path.join(__dirname, "../artifacts/contracts/BasicStake.sol/BasicStake.json");
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
    console.log("🏗️  Deploying...");
    console.log(`   Operator: ${operatorId}\n`);
    
    // NO constructor parameters - simplest possible
    const contractCreate = new ContractCreateFlow()
      .setGas(100000)
      .setBytecode(bytecode);

    const txResponse = await contractCreate.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const contractId = receipt.contractId;

    console.log("✅ SUCCESS! Contract deployed!\n");
    console.log("📋 Details:");
    console.log(`   Contract ID: ${contractId}`);
    console.log(`   Owner: ${operatorId}`);
    console.log(`   HashScan: https://hashscan.io/testnet/contract/${contractId}\n`);

    const contractInfo = {
      contractId: contractId.toString(),
      owner: operatorId.toString(),
      deployedAt: new Date().toISOString(),
      network: "testnet",
      hashscanUrl: `https://hashscan.io/testnet/contract/${contractId}`,
      abi: artifact.abi
    };

    fs.writeFileSync(
      path.join(__dirname, "../contract-info.json"),
      JSON.stringify(contractInfo, null, 2)
    );

    console.log("💾 Saved to contract-info.json\n");
    console.log("✅ DEPLOYMENT COMPLETE!\n");
    console.log(`📝 Add to .env: CONTRACT_ID=${contractId}\n`);

    client.close();
    return contractId.toString();

  } catch (error) {
    console.error("❌ Failed:", error.message);
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
