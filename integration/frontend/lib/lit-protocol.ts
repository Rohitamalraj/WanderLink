import * as LitJsSdk from '@lit-protocol/lit-node-client'
import { LIT_NETWORK } from '@lit-protocol/constants'

/**
 * Lit Protocol Service for Encryption & Access Control
 * Used for encrypting KYC data and controlling access to traveler information
 */
class LitService {
  private litNodeClient: LitJsSdk.LitNodeClient | null = null
  private chain = 'ethereum'

  async connect() {
    if (this.litNodeClient) return this.litNodeClient

    this.litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev, // Use DatilDev testnet for development
      debug: false,
    })

    await this.litNodeClient.connect()
    console.log('✅ Connected to Lit Network')
    
    return this.litNodeClient
  }

  /**
   * Encrypt data with Lit Protocol
   * @param data - Data to encrypt (stringified JSON)
   * @param accessConditions - Who can decrypt this data
   */
  async encryptData(
    data: string,
    accessConditions: any[]
  ): Promise<{
    ciphertext: string
    dataToEncryptHash: string
  }> {
    await this.connect()
    if (!this.litNodeClient) throw new Error('Lit client not initialized')

    const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
      {
        accessControlConditions: accessConditions,
        dataToEncrypt: data,
      },
      this.litNodeClient
    )

    return {
      ciphertext,
      dataToEncryptHash,
    }
  }

  /**
   * Decrypt data with Lit Protocol
   * @param ciphertext - Encrypted data
   * @param dataToEncryptHash - Hash of original data
   * @param accessConditions - Access control conditions
   * @param authSig - User's authentication signature
   */
  async decryptData(
    ciphertext: string,
    dataToEncryptHash: string,
    accessConditions: any[],
    authSig: any
  ): Promise<string> {
    await this.connect()
    if (!this.litNodeClient) throw new Error('Lit client not initialized')

    const decryptedString = await LitJsSdk.decryptToString(
      {
        accessControlConditions: accessConditions,
        ciphertext,
        dataToEncryptHash,
        authSig,
        chain: this.chain,
      },
      this.litNodeClient
    )

    return decryptedString
  }

  /**
   * Generate access conditions for wallet-based access
   * @param walletAddress - Ethereum address that can decrypt
   */
  getWalletAccessConditions(walletAddress: string) {
    return [
      {
        contractAddress: '',
        standardContractType: '',
        chain: this.chain,
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: walletAddress,
        },
      },
    ]
  }

  /**
   * Generate access conditions for NFT holders
   * @param nftContractAddress - Address of NFT contract
   * @param tokenId - Optional specific token ID
   */
  getNFTAccessConditions(nftContractAddress: string, tokenId?: string) {
    return [
      {
        contractAddress: nftContractAddress,
        standardContractType: 'ERC721',
        chain: this.chain,
        method: 'balanceOf',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '>',
          value: '0',
        },
      },
    ]
  }

  /**
   * Get authentication signature from user
   * Required for decryption operations
   */
  async getAuthSig(): Promise<any> {
    await this.connect()
    if (!this.litNodeClient) throw new Error('Lit client not initialized')

    const authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: this.chain,
    })

    return authSig
  }

  disconnect() {
    if (this.litNodeClient) {
      this.litNodeClient.disconnect()
      this.litNodeClient = null
      console.log('✅ Disconnected from Lit Network')
    }
  }
}

// Export singleton instance
export const litService = new LitService()
