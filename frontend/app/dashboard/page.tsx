'use client'

import { GenerateProofButton } from '../../components/GenerateProofButton';
import { ProfilePhotoNFT } from '../../components/ProfilePhotoNFT';
import { ConnectWalletButton } from '../../components/ConnectWalletButton';
import { DataCoinBenefits } from '../../components/DataCoinBenefits';
import { TokenUtility } from '../../components/TokenUtility';
import { DiscountCoupons } from '../../components/DiscountCoupons';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';

// Replace with your DataCoin contract address and ABI
const DATACOIN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS || '0x834a8369d6cbf91f8e587e1e998d31988e76a03f';
const DATACOIN_ABI = [
  // Minimal ABI for minting
  "function mint(address to, string memory tokenURI) public returns (uint256)"
];

function MintProfilePhotoNFT() {
  const [cid, setCid] = useState('');
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Get CID from localStorage (set during verification)
    const address = window.ethereum?.selectedAddress;
    const storedCid = address ? localStorage.getItem(`kycCID_${address}`) : '';
    if (storedCid) setCid(storedCid);
  }, []);

  const handleMint = async () => {
    setMinting(true);
    setError('');
    setTxHash('');
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(DATACOIN_CONTRACT_ADDRESS, DATACOIN_ABI, signer);
  const tx = await contract.mint(await signer.getAddress(), cid);
      await tx.wait();
      setTxHash(tx.hash);
    } catch (err) {
      const e = err as any;
      setError(e?.message || 'Minting failed');
    }
    setMinting(false);
  };

  if (!cid) return <div>No profile photo CID found. Complete verification first.</div>;
  return (
    <div style={{ margin: '2rem 0' }}>
      <Button onClick={handleMint} disabled={minting} className="bg-blue-600 text-white font-bold">
        {minting ? 'Minting...' : 'Mint Profile Photo NFT'}
      </Button>
      {txHash && <div style={{ marginTop: '1rem' }}>Minted! Tx Hash: <code>{txHash}</code></div>}
      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Top Right: Connect Wallet + Profile Photo */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <ConnectWalletButton />
        <ProfilePhotoNFT />
      </div>

      <main className="max-w-6xl mx-auto pt-4">
        {/* DataCoin Benefits - Show why it matters */}
        <DataCoinBenefits />
        
        {/* Token Utility - What you can do with your tokens */}
        <div className="mt-8">
          <TokenUtility />
        </div>
        
        {/* Discount Coupons - Buy coupons to reduce stake amounts */}
        <div className="mt-8">
          <DiscountCoupons />
        </div>
        
        {/* Original Dashboard Content */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Your Travel Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Manage your verified identity, generate proofs, and explore travel opportunities.
          </p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Generate ZK Proof</h2>
              <p className="text-gray-600 mb-4">
                Generate a zero-knowledge proof of the current ETH price from CoinGecko and store it on Lighthouse.
              </p>
              <GenerateProofButton />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Verification Status</h2>
              <p className="text-gray-600 mb-4">
                Your verified identity is stored securely on Lighthouse with zkTLS proof.
              </p>
              <MintProfilePhotoNFT />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
