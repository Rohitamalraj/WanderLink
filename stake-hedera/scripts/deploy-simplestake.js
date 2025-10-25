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
  console.log("🚀 Deploying SimpleStake Contract to Hedera...\n");

  await hre.run("compile");
  console.log("✅ Compiled\n");

  const artifactPath = path.join(__dirname, "../artifacts/contracts/SimpleStake.sol/SimpleStake.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const bytecode = artifact.bytecode;

  console.log(`📄 Bytecode: ${bytecode.length / 2} bytes\n`);

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
    console.log("🏗️  Deploying...");
    console.log(`   Operator: ${operatorId}`);
    console.log(`   Validator: ${validatorId}\n`);
    
    const validatorAddress = validatorId.toSolidityAddress();
    const constructorParams = new ContractFunctionParameters()
      .addAddress(validatorAddress);
    
    const contractCreate = new ContractCreateFlow()
      .setGas(400000)
      .setBytecode(bytecode)
      .setConstructorParameters(constructorParams);

    const txResponse = await contractCreate.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const contractId = receipt.contractId;

    console.log("✅ Deployed!\n");
    console.log("📋 Details:");
    console.log(`   Contract ID: ${contractId}`);
    console.log(`   Owner: ${operatorId}`);
    console.log(`   Validator: ${validatorId}`);
    console.log(`   HashScan: https://hashscan.io/testnet/contract/${contractId}\n`);

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

    console.log("💾 Saved to contract-info.json\n");
    console.log("✅ Complete!\n");
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
