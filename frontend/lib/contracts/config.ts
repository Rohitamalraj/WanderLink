// Auto-generated contract configuration
import { addresses } from './addresses'
import { TripEscrowAbi, ReputationSBTAbi, TripNFTAbi } from './index'

export const contracts = {
  hedera: {
    TripEscrow: {
      address: addresses['hedera-testnet']?.TripEscrow as `0x${string}`,
      abi: TripEscrowAbi,
    },
    ReputationSBT: {
      address: addresses['hedera-testnet']?.ReputationSBT as `0x${string}`,
      abi: ReputationSBTAbi,
    },
    TripNFT: {
      address: addresses['hedera-testnet']?.TripNFT as `0x${string}`,
      abi: TripNFTAbi,
    },
  },
  sepolia: {
    TripEscrow: {
      address: addresses['sepolia']?.TripEscrow as `0x${string}`,
      abi: TripEscrowAbi,
    },
    ReputationSBT: {
      address: addresses['sepolia']?.ReputationSBT as `0x${string}`,
      abi: ReputationSBTAbi,
    },
    TripNFT: {
      address: addresses['sepolia']?.TripNFT as `0x${string}`,
      abi: TripNFTAbi,
    },
  },
} as const

// Helper to get contracts for current chain
export function getContracts(chainId: number) {
  if (chainId === 296) return contracts.hedera // Hedera Testnet
  if (chainId === 11155111) return contracts.sepolia // Sepolia
  return contracts.sepolia // default
}

// Chain IDs
export const CHAIN_IDS = {
  HEDERA_TESTNET: 296,
  SEPOLIA: 11155111,
  HARDHAT: 31337,
} as const
