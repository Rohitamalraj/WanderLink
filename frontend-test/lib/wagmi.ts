import { createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import type { Chain } from 'wagmi/chains'
import { injected, walletConnect } from '@wagmi/connectors'


export const hedera: Chain = {
  id: 296,
  name: 'Hedera Testnet',
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

export const chains: [Chain, ...Chain[]] = [hedera, sepolia]

export const config = createConfig({
  chains,
  connectors: [
    injected({
      target: 'metaMask',
      shimDisconnect: true,
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
      showQrModal: true,
    }),
  ],
  ssr: false,
})
