const hre = require("hardhat");
const { 
  Client, 
  AccountId, 
  PrivateKey,
  ContractCreateFlow,
  ContractFunctionParameters
} = require("@hashgraph/sdk");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying MultiStake Contract to Hedera Testnet...\n");

  // Compile
  console.log("📝 Compiling MultiStake.sol...");
  await hre.run("compile");
  console.log("✅ Compilation successful!\n");

  // Read artifacts
  const artifactPath = path.join(__dirname, "../artifacts/contracts/MultiStake.sol/MultiStake.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const bytecode = artifact.bytecode;

  console.log(`📄 Bytecode size: ${bytecode.length / 2} bytes\n`);

  // Initialize client
  const client = Client.forTestnet();
  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const validatorId = AccountId.fromString(process.env.VALIDATOR_ACCOUNT_ID);
  
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
    console.log("🏗️  Deploying contract...");
    console.log(`   Operator: ${operatorId}`);
    console.log(`   Validator: ${validatorId}\n`);
    
    const validatorAddress = validatorId.toSolidityAddress();
    console.log(`   Validator Address: 0x${validatorAddress}\n`);
    
    const constructorParams = new ContractFunctionParameters()
      .addAddress(validatorAddress);
    
    const contractCreate = new ContractCreateFlow()
      .setGas(800000)
      .setBytecode(bytecode)
      .setConstructorParameters(constructorParams);

    const txResponse = await contractCreate.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const contractId = receipt.contractId;

    console.log("✅ Contract deployed successfully!\n");
    console.log("📋 Contract Details:");
    console.log(`   Contract ID: ${contractId}`);
    console.log(`   Owner: ${operatorId}`);
    console.log(`   Validator: ${validatorId}`);
    console.log(`   Network: Testnet`);
    console.log(`   HashScan: https://hashscan.io/testnet/contract/${contractId}\n`);

    // Save info
    const contractInfo = {
      contractId: contractId.toString(),
      owner: operatorId.toString(),
      validator: validatorId.toString(),
      deployedAt: new Date().toISOString(),
      network: "testnet",
      hashscanUrl: `https://hashscan.io/testnet/contract/${contractId}`,
      abi: artifact.abi
    };

    fs.writeFileSync(
      path.join(__dirname, "../contract-info.json"),
      JSON.stringify(contractInfo, null, 2)
    );

    console.log("💾 Contract info saved to contract-info.json\n");
    console.log("✅ Deployment complete!\n");
    console.log("📝 Next Steps:");
    console.log(`   1. Add to .env: CONTRACT_ID=${contractId}`);
    console.log("   2. Run: npm run dev");
    console.log("   3. Test multi-user staking\n");

    client.close();
    return contractId.toString();

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.status) {
      console.error("   Status:", error.status.toString());
    }
    console.error("\nFull error:", error);
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
