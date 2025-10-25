'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Eip1193Provider, Contract, parseEther } from 'ethers';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: string | null;
  error: string | null;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

// Hedera Testnet configuration for MetaMask
const HEDERA_TESTNET = {
  chainId: '0x128', // 296 in hex
  chainName: 'Hedera Testnet',
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'HBAR',
    decimals: 18,
  },
  rpcUrls: ['https://testnet.hashio.io/api'],
  blockExplorerUrls: ['https://hashscan.io/testnet'],
};

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    error: null,
  });

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask);
  }, []);

  // Add Hedera network to MetaMask
  const addHederaNetwork = useCallback(async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [HEDERA_TESTNET],
      });
      return true;
    } catch (error: any) {
      console.error('Failed to add Hedera network:', error);
      setWallet(prev => ({ ...prev, error: error.message }));
      return false;
    }
  }, []);

  // Switch to Hedera network
  const switchToHedera = useCallback(async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HEDERA_TESTNET.chainId }],
      });
      return true;
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        return await addHederaNetwork();
      }
      console.error('Failed to switch network:', error);
      setWallet(prev => ({ ...prev, error: error.message }));
      return false;
    }
  }, [addHederaNetwork]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setWallet(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask extension.',
      }));
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request account access
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      });

      // Get chain ID
      const chainId = await window.ethereum!.request({
        method: 'eth_chainId',
      });

      // Check if on Hedera network
      if (chainId !== HEDERA_TESTNET.chainId) {
        const switched = await switchToHedera();
        if (!switched) {
          throw new Error('Please switch to Hedera Testnet');
        }
      }

      setWallet({
        address: accounts[0],
        isConnected: true,
        isConnecting: false,
        chainId,
        error: null,
      });
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      setWallet({
        address: null,
        isConnected: false,
        isConnecting: false,
        chainId: null,
        error: error.message || 'Failed to connect wallet',
      });
    }
  }, [isMetaMaskInstalled, switchToHedera]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
      error: null,
    });
  }, []);

  // Convert EVM address to Hedera Account ID (approximate)
  const getHederaAccountId = useCallback(() => {
    if (!wallet.address) return null;
    // This is a placeholder - in production, you'd need a proper mapping
    // For now, we'll use the env variable account
    return process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || null;
  }, [wallet.address]);

  // Approve agent to spend on behalf of user
  const approveAgent = useCallback(async (contractAddress: string, agentAddress: string, amount?: string) => {
    if (!window.ethereum || !wallet.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Contract ABI for approve function
      const abi = [
        'function approve(address agent, uint256 amount) external',
        'function allowance(address user, address agent) external view returns (uint256)'
      ];
      
      const contract = new Contract(contractAddress, abi, signer);
      
      // Use reasonable approval amount (10,000 HBAR should be enough)
      const approvalAmount = amount ? parseEther(amount) : parseEther('10000');
      
      console.log('Approving agent:', agentAddress, 'Amount:', approvalAmount.toString());
      
      const tx = await contract.approve(agentAddress, approvalAmount);
      console.log('Approval transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('✅ Approval confirmed!');
      
      return tx.hash;
    } catch (error: any) {
      console.error('Failed to approve agent:', error);
      throw error;
    }
  }, [wallet.address]);

  // Check allowance
  const checkAllowance = useCallback(async (contractAddress: string, agentAddress: string) => {
    if (!window.ethereum || !wallet.address) {
      return '0';
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      
      const abi = [
        'function allowance(address user, address agent) external view returns (uint256)'
      ];
      
      const contract = new Contract(contractAddress, abi, provider);
      const allowance = await contract.allowance(wallet.address, agentAddress);
      
      return allowance.toString();
    } catch (error: any) {
      console.error('Failed to check allowance:', error);
      return '0';
    }
  }, [wallet.address]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWallet(prev => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setWallet(prev => ({ ...prev, chainId }));
      // Reload page on chain change (recommended by MetaMask)
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  // Check if already connected on mount
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum!.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          const chainId = await window.ethereum!.request({
            method: 'eth_chainId',
          });

          setWallet({
            address: accounts[0],
            isConnected: true,
            isConnecting: false,
            chainId,
            error: null,
          });
        }
      } catch (error) {
        console.error('Failed to check connection:', error);
      }
    };

    checkConnection();
  }, [isMetaMaskInstalled]);

  return {
    ...wallet,
    connect,
    disconnect,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    switchToHedera,
    addHederaNetwork,
    getHederaAccountId,
    approveAgent,
    checkAllowance,
  };
}
