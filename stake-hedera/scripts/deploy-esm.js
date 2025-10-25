// scripts/deploy-esm.js

import fs from "fs";
import dotenv from "dotenv";
import {
  Client,
  PrivateKey,
  AccountId,
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCreateTransaction,
  Hbar,
} from "@hashgraph/sdk";

dotenv.config();

// === CONFIG ===
const CONTRACT_NAME = "AgentStaking"; // your Solidity contract name
const BIN_PATH = `artifacts/contracts/${CONTRACT_NAME}.sol/${CONTRACT_NAME}.json`;

// === MAIN FUNCTION ===
async function main() {
  console.log(`🚀 Deploying ${CONTRACT_NAME} Contract to Hedera...`);

  // Load environment variables
  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);

  // Connect to Hedera Testnet
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  // === STEP 1: Read Contract Bytecode ===
  const artifact = JSON.parse(fs.readFileSync(BIN_PATH, "utf8"));
  const bytecodeHex = artifact.bytecode;
  const bytecode = Buffer.from(
    bytecodeHex.startsWith("0x") ? bytecodeHex.slice(2) : bytecodeHex,
    "hex"
  );
  console.log(`📄 Bytecode loaded: ${bytecode.length} bytes`);

  // === STEP 2: Upload bytecode to Hedera File Service ===
  console.log("📤 Uploading bytecode to Hedera File Service...");

  const fileCreateTx = await new FileCreateTransaction()
    .setKeys([operatorKey.publicKey])
    .setContents(bytecode.slice(0, 4000)) // first chunk
    .setMaxTransactionFee(new Hbar(5))
    .execute(client);

  const fileReceipt = await fileCreateTx.getReceipt(client);
  const bytecodeFileId = fileReceipt.fileId;

  console.log(`   ✅ Bytecode File ID: ${bytecodeFileId.toString()}`);

  // Append remaining chunks (if needed)
  for (let i = 4000; i < bytecode.length; i += 4000) {
    console.log(`   📤 Appending chunk at offset ${i}...`);
    await new FileAppendTransaction()
      .setFileId(bytecodeFileId)
      .setContents(bytecode.slice(i, i + 4000))
      .setMaxTransactionFee(new Hbar(5))
      .execute(client);
  }

  console.log("📤 All bytecode chunks uploaded.");

  // === STEP 3: Deploy Contract ===
  console.log("🏗️  Deploying contract...");

  const contractTx = await new ContractCreateTransaction()
    .setBytecodeFileId(bytecodeFileId)
    .setGas(5_000_000)
    .setAdminKey(operatorKey.publicKey)
    .setMaxTransactionFee(new Hbar(10))
    .execute(client);

  const contractReceipt = await contractTx.getReceipt(client);
  const contractId = contractReceipt.contractId;

  if (!contractId) {
    throw new Error("❌ Contract deployment failed (no contractId in receipt).");
  }

  console.log(`✅ Contract deployed successfully!`);
  console.log(`   🆔 Contract ID: ${contractId.toString()}`);
  console.log(`   🌐 EVM Address: 0x${contractId.toSolidityAddress()}`);
  
  // Save contract info
  const contractInfo = {
    contractId: contractId.toString(),
    contractEvmAddress: `0x${contractId.toSolidityAddress()}`,
    bytecodeFileId: bytecodeFileId.toString(),
    ownerAccountId: operatorId.toString(),
    deployedAt: new Date().toISOString(),
    network: 'testnet',
    hashscanUrl: `https://hashscan.io/testnet/contract/${contractId}`
  };

  fs.writeFileSync(
    'contract-info.json',
    JSON.stringify(contractInfo, null, 2)
  );

  console.log('\n💾 Contract info saved to contract-info.json');
  console.log('\n📝 Update your .env file:');
  console.log(`CONTRACT_ID=${contractId.toString()}`);
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=0x${contractId.toSolidityAddress()}`);

  client.close();
}

main().catch((err) => {
  console.error("💥 Deployment Error:", err);
  process.exit(1);
});
