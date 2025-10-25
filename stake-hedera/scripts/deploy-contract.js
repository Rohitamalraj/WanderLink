const { 
  Client, 
  PrivateKey, 
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCreateTransaction,
  ContractFunctionParameters,
  Hbar,
  AccountId
} = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Deploy StakingEscrow contract to Hedera Network
 */
async function deployContract() {
  console.log('🚀 Deploying StakingEscrow Contract to Hedera...\n');

  // Validate environment variables
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    console.error('❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env');
    process.exit(1);
  }

  // Validator not needed for AgentStaking contract (owner is deployer)

  // Initialize Hedera client
  const client = Client.forTestnet();
  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  
  // Handle both DER and raw hex private key formats
  let operatorKey;
  try {
    // Try ECDSA DER format first
    operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
  } catch (e) {
    try {
      // Try raw hex format
      operatorKey = PrivateKey.fromStringED25519(process.env.HEDERA_PRIVATE_KEY);
    } catch (e2) {
      // Try generic format
      operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    }
  }
  
  client.setOperator(operatorId, operatorKey);

  try {
    // Step 1: Read compiled contract bytecode
    console.log('📄 Reading contract bytecode...');
    const bytecode = fs.readFileSync(
      path.join(__dirname, '../contracts/build/contracts_AgentStaking_sol_AgentStaking.bin'),
      'utf8'
    );
    
    console.log(`   Bytecode size: ${bytecode.length} characters (${bytecode.length / 2} bytes)\n`);

    // Step 2: Create file on Hedera to store bytecode
    console.log('📤 Uploading bytecode to Hedera File Service...');
    
    // Convert hex string to bytes
    const bytecodeBytes = Buffer.from(bytecode, 'hex');
    const chunkSize = 4096;
    
    // Create file with first chunk
    const firstChunk = bytecodeBytes.slice(0, chunkSize);
    
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([operatorKey])
      .setContents(firstChunk)
      .setMaxTransactionFee(new Hbar(2));

    const fileCreateSubmit = await fileCreateTx.execute(client);
    const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateReceipt.fileId;

    console.log(`   ✅ Bytecode File ID: ${bytecodeFileId}`);

    // Step 3: Append remaining bytecode if needed
    if (bytecodeBytes.length > chunkSize) {
      console.log('📤 Appending remaining bytecode chunks...');
      
      let offset = chunkSize;
      let chunkCount = 1;
      
      while (offset < bytecodeBytes.length) {
        const chunk = bytecodeBytes.slice(offset, Math.min(offset + chunkSize, bytecodeBytes.length));
        
        const fileAppendTx = new FileAppendTransaction()
          .setFileId(bytecodeFileId)
          .setContents(chunk)
          .setMaxTransactionFee(new Hbar(2));

        await fileAppendTx.execute(client);
        
        offset += chunkSize;
        chunkCount++;
        console.log(`   ✅ Chunk ${chunkCount} appended`);
      }
      
      console.log(`   ✅ All ${chunkCount} chunks uploaded\n`);
    } else {
      console.log('   ✅ Bytecode uploaded in single chunk\n');
    }

    // Step 4: Deploy contract
    console.log('🏗️  Deploying contract...');
    console.log(`   Deployer (will be owner): ${operatorId}\n`);
    
    const contractCreateTx = new ContractCreateTransaction()
      .setBytecodeFileId(bytecodeFileId)
      .setGas(500000) // Increased gas for improved contract
      .setMaxTransactionFee(new Hbar(20));

    const contractCreateSubmit = await contractCreateTx.execute(client);
    const contractCreateReceipt = await contractCreateSubmit.getReceipt(client);
    const contractId = contractCreateReceipt.contractId;

    console.log(`   ✅ Contract deployed!\n`);
    console.log(`📋 Contract Details:`);
    console.log(`   Contract ID: ${contractId}`);
    console.log(`   Contract EVM Address: 0x${contractId.toSolidityAddress()}`);
    console.log(`   Bytecode File ID: ${bytecodeFileId}`);
    console.log(`   Owner: ${operatorId}`);
    console.log(`   Network: Testnet`);
    console.log(`   View on HashScan: https://hashscan.io/testnet/contract/${contractId}\n`);

    // Step 5: Save contract info
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
      path.join(__dirname, '../contract-info.json'),
      JSON.stringify(contractInfo, null, 2)
    );

    console.log('💾 Contract info saved to contract-info.json\n');
    console.log('✅ Deployment complete!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Add CONTRACT_ID to .env file:');
    console.log(`      CONTRACT_ID=${contractId}`);
    console.log('   2. Run: npm run dev');
    console.log('   3. Test multi-user staking\n');

    return contractId.toString();

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    if (error.status) {
      console.error('   Status:', error.status.toString());
    }
    throw error;
  } finally {
    client.close();
  }
}

// Run deployment
if (require.main === module) {
  deployContract()
    .then((contractId) => {
      console.log(`\n🎉 Success! Contract ID: ${contractId}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { deployContract };
