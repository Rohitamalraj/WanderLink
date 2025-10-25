const solc = require('solc');
const fs = require('fs');
const path = require('path');

console.log('📝 Compiling HederaEscrow.sol (Solidity 0.6.12)...\n');

// Read contract source
const contractPath = path.join(__dirname, '../contracts/HederaEscrow.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Prepare input for compiler (v0.6.x format)
const input = {
  language: 'Solidity',
  sources: {
    'HederaEscrow.sol': {
      content: source
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode']
      }
    }
  }
};

// Compile
console.log('⚙️  Compiling...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Check for errors
if (output.errors) {
  let hasError = false;
  output.errors.forEach(error => {
    if (error.severity === 'error') {
      console.error('❌ Error:', error.formattedMessage);
      hasError = true;
    } else {
      console.warn('⚠️  Warning:', error.formattedMessage);
    }
  });
  if (hasError) {
    process.exit(1);
  }
}

// Get compiled contract
const contract = output.contracts['HederaEscrow.sol']['HederaEscrow'];

// Create build directory
const buildDir = path.join(__dirname, '../contracts/build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Save bytecode
const bytecode = contract.evm.bytecode.object;
fs.writeFileSync(
  path.join(buildDir, 'HederaEscrow.bin'),
  bytecode
);
console.log('✅ Bytecode saved to: contracts/build/HederaEscrow.bin');
console.log(`   Size: ${bytecode.length / 2} bytes`);

// Save ABI
const abi = JSON.stringify(contract.abi, null, 2);
fs.writeFileSync(
  path.join(buildDir, 'HederaEscrow.abi'),
  abi
);
console.log('✅ ABI saved to: contracts/build/HederaEscrow.abi\n');

console.log('🎉 Compilation successful!\n');
