import { litService } from './lit-protocol'

export interface KYCData {
  email: string
  fullName?: string
  phoneNumber?: string
  photoHash?: string // IPFS hash of photo
  documentHash?: string // IPFS hash of ID document
  worldIDVerified: boolean
  verificationTier: 'Basic' | 'Standard' | 'Full'
  timestamp: number
}

/**
 * Encrypt KYC data using Lit Protocol
 * Only the user's wallet can decrypt this data
 */
export async function encryptKYCData(
  kycData: KYCData,
  walletAddress: string
): Promise<{
  encryptedData: string
  dataHash: string
  accessConditions: any[]
}> {
  // Get access conditions - only this wallet can decrypt
  const accessConditions = litService.getWalletAccessConditions(walletAddress)

  // Encrypt the data
  const { ciphertext, dataToEncryptHash } = await litService.encryptData(
    JSON.stringify(kycData),
    accessConditions
  )

  return {
    encryptedData: ciphertext,
    dataHash: dataToEncryptHash,
    accessConditions,
  }
}

/**
 * Decrypt KYC data using Lit Protocol
 * Requires user to sign authentication message
 */
export async function decryptKYCData(
  encryptedData: string,
  dataHash: string,
  accessConditions: any[]
): Promise<KYCData> {
  // Get authentication signature from user
  const authSig = await litService.getAuthSig()

  // Decrypt the data
  const decryptedString = await litService.decryptData(
    encryptedData,
    dataHash,
    accessConditions,
    authSig
  )

  return JSON.parse(decryptedString) as KYCData
}

/**
 * Store encrypted KYC hash on-chain (for ReputationSBT)
 * This hash can be used to verify KYC without revealing data
 */
export function generateKYCHash(
  encryptedData: string,
  dataHash: string
): string {
  // Combine encrypted data and hash, then hash again
  // This creates a verifiable commitment to the KYC data
  const combined = encryptedData + dataHash
  
  // Create a simple hash (in production, use proper hashing)
  return `0x${Buffer.from(combined).toString('hex').slice(0, 64)}`
}
