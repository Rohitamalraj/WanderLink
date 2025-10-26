// On-Chain ZK Proof Integration
import { ethers } from 'ethers';
import { CONTRACTS } from './contracts';

// ZK Proof Verifier Contract ABI
const ZK_PROOF_VERIFIER_ABI = [
  "function submitProof(bytes32 _proofHash, string calldata _lighthouseCID, uint256 _expiresAt) external",
  "function hasValidProof(address _user) external view returns (bool)",
  "function getProof(address _user) external view returns (tuple(bytes32 proofHash, string lighthouseCID, uint256 timestamp, bool isVerified, uint256 expiresAt))",
  "event ProofSubmitted(address indexed user, bytes32 proofHash, string lighthouseCID, uint256 timestamp, uint256 expiresAt)",
  "event ProofVerified(address indexed user, bytes32 proofHash, uint256 timestamp)"
];

// Contract address - reads from env or generated config
export const ZK_PROOF_VERIFIER_ADDRESS = 
  process.env.NEXT_PUBLIC_ZK_PROOF_VERIFIER_ADDRESS || 
  CONTRACTS.ZK_PROOF_VERIFIER;

/**
 * Generate proof hash from proof data
 */
export function generateProofHash(proofData: any): string {
  const proofString = JSON.stringify(proofData);
  return ethers.keccak256(ethers.toUtf8Bytes(proofString));
}

/**
 * Submit ZK proof on-chain (requires wallet approval)
 * @param signer Ethers signer (connected wallet)
 * @param proofData The proof data object
 * @param lighthouseCID The Lighthouse CID where proof is stored
 * @returns Transaction receipt
 */
export async function submitProofOnChain(
  signer: ethers.Signer,
  proofData: any,
  lighthouseCID: string
) {
  console.log("🔗 Submitting ZK proof to blockchain...");
  console.log("📦 Proof data:", proofData);
  console.log("📦 Lighthouse CID:", lighthouseCID);
  
  if (!ZK_PROOF_VERIFIER_ADDRESS) {
    throw new Error("ZK Proof Verifier contract address not configured. Please deploy the contract first.");
  }

  const contract = new ethers.Contract(ZK_PROOF_VERIFIER_ADDRESS, ZK_PROOF_VERIFIER_ABI, signer);
  const proofHash = generateProofHash(proofData);
  
  // Calculate expiration (1 year from now)
  const expiresAt = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
  
  console.log("📝 Proof hash:", proofHash);
  console.log("⏰ Expires at:", new Date(expiresAt * 1000).toISOString());
  console.log("📤 Sending transaction to blockchain...");
  console.log("🔔 Please approve the transaction in your wallet!");
  
  try {
    // This will trigger MetaMask popup for approval
    const tx = await contract.submitProof(proofHash, lighthouseCID, expiresAt);
    console.log("📤 Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      proofHash,
      lighthouseCID,
      expiresAt,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error: any) {
    console.error("❌ On-chain proof submission failed:", error);
    throw new Error(`On-chain proof submission failed: ${error.message}`);
  }
}

/**
 * Check if user has a valid proof on-chain
 */
export async function hasValidProof(
  provider: ethers.Provider,
  userAddress: string
): Promise<boolean> {
  if (!ZK_PROOF_VERIFIER_ADDRESS) return false;
  
  const contract = new ethers.Contract(ZK_PROOF_VERIFIER_ADDRESS, ZK_PROOF_VERIFIER_ABI, provider);
  return await contract.hasValidProof(userAddress);
}

/**
 * Get proof metadata from blockchain
 */
export async function getProofMetadata(
  provider: ethers.Provider,
  userAddress: string
) {
  if (!ZK_PROOF_VERIFIER_ADDRESS) {
    throw new Error("ZK Proof Verifier contract address not configured");
  }
  
  const contract = new ethers.Contract(ZK_PROOF_VERIFIER_ADDRESS, ZK_PROOF_VERIFIER_ABI, provider);
  const proof = await contract.getProof(userAddress);
  
  return {
    proofHash: proof.proofHash,
    lighthouseCID: proof.lighthouseCID,
    timestamp: Number(proof.timestamp),
    isVerified: proof.isVerified,
    expiresAt: Number(proof.expiresAt)
  };
}
