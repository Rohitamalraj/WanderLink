/* eslint-disable @typescript-eslint/no-explicit-any */
import { lighthouseService } from './lighthouse-storage'
import { ethers } from 'ethers'

export interface KYCData {
  email: string
  fullName?: string
  phoneNumber?: string
  photoHash?: string // Lighthouse CID of photo
  documentHash?: string // Lighthouse CID of ID document
  worldIDVerified: boolean
  verificationTier: 'Basic' | 'Standard' | 'Full'
  timestamp: number
}

/**
 * Encrypt KYC data using Lighthouse Storage
 * Only the user's wallet can decrypt this data
 */
export async function encryptKYCData(
  kycData: KYCData,
  walletSigner: any // Wagmi wallet client
): Promise<{
  cid: string // Lighthouse CID
  dataHash: string
}> {
  // Get wallet address from Wagmi v2 client
  const walletAddress = walletSigner.account.address

  // Get access conditions - only this wallet can decrypt
  const accessConditions = lighthouseService.getWalletAccessConditions(walletAddress)

  // Encrypt and upload the data to Lighthouse
  const { cid, fileHash } = await lighthouseService.encryptAndUpload(
    JSON.stringify(kycData),
    accessConditions,
    walletSigner
  )

  return {
    cid,
    dataHash: fileHash,
  }
}

/**
 * Decrypt KYC data using Lighthouse Storage
 * Requires user to sign authentication message
 */
export async function decryptKYCData(
  cid: string,
  walletSigner: any // Wagmi wallet client
): Promise<KYCData> {
  // Decrypt the data from Lighthouse
  const decryptedString = await lighthouseService.decryptAndRetrieve(
    cid,
    walletSigner
  )

  return JSON.parse(decryptedString) as KYCData
}

/**
 * Upload KYC document (photo/ID) to Lighthouse with encryption
 */
export async function uploadKYCDocument(
  file: File,
  walletSigner: any // Wagmi wallet client
): Promise<string> {
  const walletAddress = walletSigner.account.address
  const accessConditions = lighthouseService.getWalletAccessConditions(walletAddress)
  
  const { cid } = await lighthouseService.encryptAndUpload(
    file,
    accessConditions,
    walletSigner
  )
  
  return cid
}

/**
 * Store encrypted KYC hash on-chain (for ReputationSBT)
 * This hash can be used to verify KYC without revealing data
 */
export function generateKYCHash(
  cid: string,
  dataHash: string
): string {
  // Combine CID and hash, then hash again
  // This creates a verifiable commitment to the KYC data
  const combined = cid + dataHash
  
  // Create a simple hash (in production, use proper hashing with ethers)
  return ethers.keccak256(ethers.toUtf8Bytes(combined))
}

/**
 * Share KYC access with trip group members (for safety verification)
 */
export async function shareKYCWithGroup(
  cid: string,
  groupMemberAddresses: string[],
  walletSigner: any // Wagmi wallet client
): Promise<void> {
  await lighthouseService.shareAccess(cid, groupMemberAddresses, walletSigner)
}
