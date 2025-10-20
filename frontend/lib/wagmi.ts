import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { hederaTestnet, polygonMumbai, hardhat } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'WanderLink',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [hederaTestnet, polygonMumbai, hardhat],
  transports: {
    [hederaTestnet.id]: http(),
    [polygonMumbai.id]: http(),
    [hardhat.id]: http(),
  },
  ssr: true,
})

// Custom chain definition for Hedera if needed
export const hedera = {
  id: 296,
  name: 'Hedera Testnet',
  network: 'hedera-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    public: { http: ['https://testnet.hashio.io/api'] },
    default: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
  testnet: true,
}
