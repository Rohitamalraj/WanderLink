'use client';

import { useWallet } from '@/hooks/useWallet';
import { Wallet, LogOut, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  const {
    address,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    isMetaMaskInstalled,
  } = useWallet();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
        <span className="text-sm text-gray-400">Loading wallet...</span>
      </div>
    );
  }

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (!isMetaMaskInstalled) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <AlertCircle className="w-4 h-4 text-yellow-500" />
        <span className="text-sm text-yellow-500">
          MetaMask not installed
        </span>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-blue-400 hover:text-blue-300 underline"
        >
          Install
        </a>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-mono text-green-400">
            {formatAddress(address)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg transition-all shadow-lg hover:shadow-xl"
      >
        <Wallet className="w-5 h-5" />
        <span className="font-semibold">
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </span>
      </button>
      
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
}
