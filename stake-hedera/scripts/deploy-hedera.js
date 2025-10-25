const { 
  Client, 
  PrivateKey, 
  FileCreateTransaction,
  ContractCreateTransaction,
  Hbar,
  AccountId
} = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployHederaContract() {
  console.log('🚀 Deploying HederaEscrow Contract to Hedera Testnet...\n');

  // Initialize client
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
    // Read bytecode
    console.log('📄 Reading contract bytecode...');
    const bytecode = fs.readFileSync(
      path.join(__dirname, '../contracts/build/HederaEscrow.bin'),
      'utf8'
    );
    
    console.log(`   Bytecode size: ${bytecode.length / 2} bytes\n`);

    // Upload bytecode
    console.log('📤 Uploading bytecode...');
    
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([operatorKey])
      .setContents(bytecode)
      .setMaxTransactionFee(new Hbar(2));

    const fileCreateSubmit = await fileCreateTx.execute(client);
    const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateReceipt.fileId;

    console.log(`   ✅ Bytecode File ID: ${bytecodeFileId}\n`);

    // Deploy contract
    console.log('🏗️  Deploying contract...');
    
    const contractCreateTx = new ContractCreateTransaction()
      .setBytecodeFileId(bytecodeFileId)
      .setGas(75000)
      .setMaxTransactionFee(new Hbar(20));

    const contractCreateSubmit = await contractCreateTx.execute(client);
    const contractCreateReceipt = await contractCreateSubmit.getReceipt(client);
    const contractId = contractCreateReceipt.contractId;

    console.log(`   ✅ Contract deployed!\n`);
    console.log(`📋 Contract Details:`);
    console.log(`   Contract ID: ${contractId}`);
    console.log(`   Bytecode File ID: ${bytecodeFileId}`);
    console.log(`   Owner: ${operatorId}`);
    console.log(`   Network: Testnet`);
    console.log(`   HashScan: https://hashscan.io/testnet/contract/${contractId}\n`);

    // Save info
    const contractInfo = {
      contractId: contractId.toString(),
      bytecodeFileId: bytecodeFileId.toString(),
      owner: operatorId.toString(),
      deployedAt: new Date().toISOString(),
      network: 'testnet',
      hashscanUrl: `https://hashscan.io/testnet/contract/${contractId}`
    };

    fs.writeFileSync(
      path.join(__dirname, '../contract-info.json'),
      JSON.stringify(contractInfo, null, 2)
    );

    console.log('💾 Saved to contract-info.json\n');
    console.log('✅ Deployment complete!\n');
    console.log('📝 Add to .env:');
    console.log(`   CONTRACT_ID=${contractId}\n`);

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

// Run
if (require.main === module) {
  deployHederaContract()
    .then((contractId) => {
      console.log(`\n🎉 Success! Contract ID: ${contractId}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { deployHederaContract };
