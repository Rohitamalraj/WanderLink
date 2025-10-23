// Check DataCoin contract on Sepolia
const { ethers } = require('ethers');

const DATACOIN_ADDRESS = '0x834a8369d6cbf91f8e587e1e998d31988e76a03f';
const SEPOLIA_RPC = 'https://sepolia.infura.io/v3/';

async function checkContract() {
  console.log('🔍 Checking DataCoin contract...');
  console.log('📍 Address:', DATACOIN_ADDRESS);
  console.log('🌐 Network: Sepolia\n');

  try {
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
    
    // Check if contract exists
    const code = await provider.getCode(DATACOIN_ADDRESS);
    
    if (code === '0x') {
      console.log('❌ No contract found at this address!');
      console.log('💡 The DataCoin contract might not be deployed on Sepolia.');
      console.log('');
      console.log('Solutions:');
      console.log('1. Check if DataCoin is on a different network');
      console.log('2. Deploy your own DataCoin contract');
      console.log('3. Use the Lighthouse DataCoin creation tool at https://1mb.io/');
      return;
    }
    
    console.log('✅ Contract exists!');
    console.log('📦 Bytecode length:', code.length, 'bytes\n');
    
    // Try to get contract info
    const possibleABIs = [
      // Standard ERC721 mint
      ["function mint(address to, string memory uri) public returns (uint256)"],
      // Ownable mint
      ["function mint(address to, string memory uri) public onlyOwner returns (uint256)"],
      // SafeMint
      ["function safeMint(address to, string memory uri) public returns (uint256)"],
      // Mint without URI
      ["function mint(address to) public returns (uint256)"],
      // Public mint
      ["function publicMint(string memory uri) public returns (uint256)"],
    ];
    
    console.log('🔍 Testing different mint function signatures...\n');
    
    for (let i = 0; i < possibleABIs.length; i++) {
      try {
        const contract = new ethers.Contract(DATACOIN_ADDRESS, possibleABIs[i], provider);
        const fragment = contract.interface.fragments[0];
        console.log(`${i + 1}. ${fragment.format('full')}`);
      } catch (e) {
        // Signature doesn't match
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkContract();
