// DataCoin Integration for Lighthouse ETHOnline
import { ethers } from 'ethers';
import { CONTRACTS } from './contracts';

// DataCoin contract address from Lighthouse
export const DATACOIN_CONTRACT_ADDRESS = 
  process.env.NEXT_PUBLIC_DATACOIN_CONTRACT || 
  CONTRACTS.DATACOIN;

// DataCoin ABI - This is an ERC20 token, not ERC721!
const DATACOIN_ABI = [
  // ERC20 mint function (takes amount, not URI)
  "function mint(address to, uint256 amount) public",
  // ERC20 standard functions
  "function balanceOf(address owner) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function decimals() public view returns (uint8)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

/**
 * Get DataCoin contract instance
 */
export function getDataCoinContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(DATACOIN_CONTRACT_ADDRESS, DATACOIN_ABI, signerOrProvider);
}

/**
 * Mint DataCoin ERC20 tokens for verified identity data
 * @param signer Ethers signer (connected wallet)
 * @param lighthouseCID The Lighthouse CID containing the encrypted data
 * @param metadata Additional metadata (stored in localStorage)
 * @returns Transaction receipt
 */
export async function mintDataCoin(
  signer: ethers.Signer,
  lighthouseCID: string,
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
  }
) {
  console.log('🪙 Minting DataCoin tokens (ERC20)...');
  console.log('📦 Lighthouse CID:', lighthouseCID);
  
  try {
    // Check current network
    const network = await signer.provider?.getNetwork();
    const currentChainId = Number(network?.chainId);
    console.log('🌐 Current Network:', network?.name, 'Chain ID:', currentChainId);
    
    // DataCoin is deployed on Sepolia (Chain ID: 11155111)
    const SEPOLIA_CHAIN_ID = 11155111;
    
    if (currentChainId !== SEPOLIA_CHAIN_ID) {
      console.log('⚠️ Wrong network! DataCoin is on Sepolia. Requesting network switch...');
      
      // Request network switch to Sepolia
      try {
        // @ts-ignore - ethereum is injected by wallet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
        });
        console.log('✅ Switched to Sepolia network');
        
        // Wait a bit for the switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          console.log('📝 Sepolia not found, adding network...');
          try {
            // @ts-ignore
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }]
            });
            console.log('✅ Sepolia network added and switched');
          } catch (addError) {
            console.error('❌ Failed to add Sepolia network:', addError);
            throw new Error('Please add Sepolia network to your wallet manually');
          }
        } else {
          console.error('❌ Failed to switch network:', switchError);
          throw new Error('Please switch to Sepolia network manually in your wallet');
        }
      }
    }
    
    const contract = getDataCoinContract(signer);
    const userAddress = await signer.getAddress();
    
    // Mint amount: 100 tokens (with 18 decimals = 100 * 10^18)
    const mintAmount = ethers.parseEther("100");
    
    console.log('💰 Minting amount: 100 DataCoin tokens');
    console.log('📤 Sending mint transaction...');
    
    // Mint ERC20 tokens
    console.log('🔄 Calling: mint(address, uint256)');
    const tx = await contract.mint(userAddress, mintAmount);
    
    console.log('📤 Transaction sent:', tx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    console.log('⛽ Gas used:', receipt.gasUsed.toString());
    
    // Get user's new balance
    const balance = await contract.balanceOf(userAddress);
    console.log('💰 New balance:', ethers.formatEther(balance), 'DataCoin tokens');
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      amount: "100",
      balance: ethers.formatEther(balance),
      lighthouseCID,
      contractAddress: DATACOIN_CONTRACT_ADDRESS,
      metadata: metadata // Store metadata for localStorage
    };
  } catch (error: any) {
    console.error('❌ Minting failed:', error);
    console.error('Error details:', error);
    throw new Error(`DataCoin minting failed: ${error.message}`);
  }
}

/**
 * Get user's DataCoin balance
 */
export async function getDataCoinBalance(
  provider: ethers.Provider,
  userAddress: string
): Promise<number> {
  const contract = getDataCoinContract(provider);
  const balance = await contract.balanceOf(userAddress);
  return Number(balance);
}

/**
 * Get user's DataCoin tokens
 */
export async function getUserDataCoins(
  provider: ethers.Provider,
  userAddress: string
): Promise<Array<{ tokenId: string; tokenURI: string }>> {
  const contract = getDataCoinContract(provider);
  const balance = await getDataCoinBalance(provider, userAddress);
  
  const tokens = [];
  for (let i = 0; i < balance; i++) {
    try {
      const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
      const tokenURI = await contract.tokenURI(tokenId);
      tokens.push({
        tokenId: tokenId.toString(),
        tokenURI
      });
    } catch (error) {
      console.error(`Error fetching token at index ${i}:`, error);
    }
  }
  
  return tokens;
}

/**
 * Get token metadata from Lighthouse
 */
export async function getTokenMetadata(tokenURI: string) {
  try {
    // Extract CID from ipfs:// URI
    const cid = tokenURI.replace('ipfs://', '');
    const metadataUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
    
    const response = await fetch(metadataUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
}
