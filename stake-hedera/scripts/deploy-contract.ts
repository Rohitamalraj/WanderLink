import { 
  Client, 
  PrivateKey, 
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCreateTransaction,
  ContractFunctionParameters,
  Hbar,
  AccountId
} from '@hashgraph/sdk';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Deploy StakingEscrow contract to Hedera Network
 */
async function deployContract() {
  console.log('🚀 Deploying StakingEscrow Contract to Hedera...\n');

  // Initialize Hedera client
  const client = Client.forTestnet();
  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!);
  
  client.setOperator(operatorId, operatorKey);

  try {
    // Step 1: Read compiled contract bytecode
    console.log('📄 Reading contract bytecode...');
    const bytecode = fs.readFileSync(
      path.join(__dirname, '../contracts/StakingEscrow.bin'),
      'utf8'
    );
    
    console.log(`   Bytecode size: ${bytecode.length} bytes\n`);

    // Step 2: Create file on Hedera to store bytecode
    console.log('📤 Uploading bytecode to Hedera File Service...');
    
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([operatorKey])
      .setContents(bytecode.substring(0, 4096)) // First chunk
      .setMaxTransactionFee(new Hbar(2));

    const fileCreateSubmit = await fileCreateTx.execute(client);
    const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateReceipt.fileId;

    console.log(`   ✅ Bytecode File ID: ${bytecodeFileId}\n`);

    // Step 3: Append remaining bytecode if needed
    if (bytecode.length > 4096) {
      console.log('📤 Appending remaining bytecode...');
      
      for (let i = 4096; i < bytecode.length; i += 4096) {
        const chunk = bytecode.substring(i, Math.min(i + 4096, bytecode.length));
        
        const fileAppendTx = new FileAppendTransaction()
          .setFileId(bytecodeFileId!)
          .setContents(chunk)
          .setMaxTransactionFee(new Hbar(2));

        await fileAppendTx.execute(client);
      }
      
      console.log('   ✅ All bytecode uploaded\n');
    }

    // Step 4: Deploy contract
    console.log('🏗️  Deploying contract...');
    
    const validatorAccountId = AccountId.fromString(process.env.VALIDATOR_ACCOUNT_ID!);
    
    const contractCreateTx = new ContractCreateTransaction()
      .setBytecodeFileId(bytecodeFileId!)
      .setGas(100000)
      .setConstructorParameters(
        new ContractFunctionParameters()
          .addAddress(validatorAccountId.toSolidityAddress())
      )
      .setMaxTransactionFee(new Hbar(20));

    const contractCreateSubmit = await contractCreateTx.execute(client);
    const contractCreateReceipt = await contractCreateSubmit.getReceipt(client);
    const contractId = contractCreateReceipt.contractId;

    console.log(`   ✅ Contract deployed!\n`);
    console.log(`📋 Contract Details:`);
    console.log(`   Contract ID: ${contractId}`);
    console.log(`   Bytecode File ID: ${bytecodeFileId}`);
    console.log(`   Validator: ${validatorAccountId}`);
    console.log(`   Network: Testnet\n`);

    // Step 5: Save contract info
    const contractInfo = {
      contractId: contractId!.toString(),
      bytecodeFileId: bytecodeFileId!.toString(),
      validatorAccountId: validatorAccountId.toString(),
      deployedAt: new Date().toISOString(),
      network: 'testnet'
    };

    fs.writeFileSync(
      path.join(__dirname, '../contract-info.json'),
      JSON.stringify(contractInfo, null, 2)
    );

    console.log('💾 Contract info saved to contract-info.json\n');
    console.log('✅ Deployment complete!\n');

    return contractId!.toString();

  } catch (error) {
    console.error('❌ Deployment failed:', error);
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

export { deployContract };
