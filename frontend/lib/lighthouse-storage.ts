/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import lighthouse from '@lighthouse-web3/sdk'

export interface EncryptedData {
  cid: string
  fileHash: string
  fileName: string
}

export class LighthouseService {
  private apiKey: string | null = null
  private initialized = false

  async initialize(apiKeyOrConfig: string | { apiKey: string }): Promise<void> {
    const apiKey = typeof apiKeyOrConfig === 'string' ? apiKeyOrConfig : apiKeyOrConfig?.apiKey
    if (!apiKey) throw new Error('Lighthouse API key required')
    this.apiKey = apiKey
    this.initialized = true
  }

  isInitialized(): boolean {
    return this.initialized && this.apiKey !== null
  }

  // Accept optional accessConditions to match callers in the project
  async encryptAndUpload(
    data: string | File,
    accessConditionsOrWalletClient: any,
    maybeWalletClient?: any
  ): Promise<EncryptedData> {
    // Normalize parameters: callers may call encryptAndUpload(data, walletClient) or encryptAndUpload(data, accessConditions, walletClient)
    let accessConditions: any = []
    let walletClient: any
    if (maybeWalletClient) {
      accessConditions = accessConditionsOrWalletClient
      walletClient = maybeWalletClient
    } else {
      walletClient = accessConditionsOrWalletClient
    }

    if (!this.isInitialized() || !this.apiKey) throw new Error('Lighthouse not initialized')

    let fileToUpload: File
    if (typeof data === 'string') {
      const blob = new Blob([data], { type: 'application/json' })
      fileToUpload = new File([blob], 'data.json', { type: 'application/json' })
    } else {
      fileToUpload = data
    }

  const address = walletClient?.account?.address
    if (!address) throw new Error('Wallet address not available')

    const authMessageResponse: any = await (lighthouse as any).getAuthMessage(address)
    const messageToSign = authMessageResponse?.data?.message ?? authMessageResponse?.message ?? authMessageResponse
    const signedMessage = await walletClient.signMessage({ account: walletClient.account, message: messageToSign })

  const output: any = await (lighthouse as any).uploadEncrypted([fileToUpload], this.apiKey, address, signedMessage)
    const fileInfo = output?.data?.[0] ?? output?.data
    if (!fileInfo) throw new Error('Invalid upload response')

    return {
      cid: fileInfo.Hash ?? fileInfo.hash ?? String(fileInfo),
      fileHash: fileInfo.Hash ?? fileInfo.hash ?? String(fileInfo),
      fileName: fileInfo.Name ?? fileInfo.name ?? 'file',
    }
  }

  async decryptAndRetrieve(cid: string, walletClient: any): Promise<string> {
    if (!this.isInitialized() || !this.apiKey) throw new Error('Lighthouse not initialized')
  const address = walletClient?.account?.address
    if (!address) throw new Error('Wallet address not available')

    const authMessageResponse: any = await (lighthouse as any).getAuthMessage(address)
    const messageToSign = authMessageResponse?.data?.message ?? authMessageResponse?.message ?? authMessageResponse
    const signedMessage = await walletClient.signMessage({ account: walletClient.account, message: messageToSign })

    const decrypted: any = await (lighthouse as any).decryptFile(cid, address, signedMessage)
    if (typeof decrypted === 'string') return decrypted
    if (decrypted instanceof Blob) return await decrypted.text()
    return JSON.stringify(decrypted)
  }

  // Convenience helper used throughout the app: returns a simple wallet-only access condition
  getWalletAccessConditions(walletAddress: string) {
    return [
      {
        conditionType: 'wallet',
        chain: 'hedera',
        allowedAddresses: [walletAddress],
      },
    ]
  }

  async uploadPublic(file: File): Promise<EncryptedData> {
    if (!this.isInitialized() || !this.apiKey) throw new Error('Lighthouse not initialized')
    const output: any = await (lighthouse as any).upload(file, this.apiKey)
    const data = output?.data
    return {
      cid: data?.Hash ?? data?.hash ?? String(data),
      fileHash: data?.Hash ?? data?.hash ?? String(data),
      fileName: data?.Name ?? data?.name ?? 'file',
    }
  }

  async getFileInfo(cid: string): Promise<any> {
    const res = await fetch(`https://api.lighthouse.storage/api/lighthouse/file_info?cid=${cid}`)
    return await res.json()
  }

  async shareAccess(cid: string, shareWith: string[], walletClient: any): Promise<void> {
    if (!this.isInitialized() || !this.apiKey) throw new Error('Lighthouse not initialized')
    const address = walletClient?.account?.address
    if (!address) throw new Error('Wallet address not available')
    const authMessageResponse: any = await (lighthouse as any).getAuthMessage(address)
    const messageToSign = authMessageResponse?.data?.message ?? authMessageResponse?.message ?? authMessageResponse
    const signedMessage = await walletClient.signMessage({ account: walletClient.account, message: messageToSign })
    await (lighthouse as any).shareFile(address, shareWith, cid, signedMessage)
  }
}

export const lighthouseService = new LighthouseService()
