const solc = require('solc');
const fs = require('fs');
const path = require('path');

console.log('📝 Compiling SimpleEscrow.sol...\n');

// Read contract source
const contractPath = path.join(__dirname, '../contracts/SimpleEscrow.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Prepare input for compiler
const input = {
  language: 'Solidity',
  sources: {
    'SimpleEscrow.sol': {
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
const contract = output.contracts['SimpleEscrow.sol']['SimpleEscrow'];

// Create build directory
const buildDir = path.join(__dirname, '../contracts/build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Save bytecode
const bytecode = contract.evm.bytecode.object;
fs.writeFileSync(
  path.join(buildDir, 'SimpleEscrow.bin'),
  bytecode
);
console.log('✅ Bytecode saved to: contracts/build/SimpleEscrow.bin');
console.log(`   Size: ${bytecode.length / 2} bytes`);

// Save ABI
const abi = JSON.stringify(contract.abi, null, 2);
fs.writeFileSync(
  path.join(buildDir, 'SimpleEscrow.abi'),
  abi
);
console.log('✅ ABI saved to: contracts/build/SimpleEscrow.abi\n');

console.log('🎉 Compilation successful!\n');
