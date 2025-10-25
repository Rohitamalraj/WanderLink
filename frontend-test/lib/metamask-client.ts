/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers'

// Minimal MetaMask wallet client wrapper compatible with our existing codepaths
export async function createMetaMaskWalletClient() {
  // Use window.ethereum directly for requests to avoid signer typing issues
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const ethereum = globalThis.window !== undefined ? (globalThis.window as any).ethereum : null
  if (!ethereum) throw new Error('MetaMask not available')

  // Request accounts
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
  const address = accounts && accounts[0]

  return {
    account: { address },
    signMessage: async ({ account, message }: { account?: any; message: string }) => {
      // Use MetaMask personal_sign for compatibility
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return await ethereum.request({ method: 'personal_sign', params: [message, address] })
    },
    provider: ethereum,
  }
}

export async function getConnectedMetaMaskAddress(): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof globalThis === 'undefined' || !(globalThis as any).ethereum) return null
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new ethers.BrowserProvider((globalThis as any).ethereum)
  try {
    const accounts = await provider.send('eth_accounts', [])
    return accounts && accounts[0] ? accounts[0] : null
  } catch {
    return null
  }
}
