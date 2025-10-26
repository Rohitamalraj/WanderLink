import { ethers } from 'ethers'

// DataCoin ERC20 contract
const DATACOIN_ADDRESS = '0x834a8369d6cbf91f8e587e1e998d31988e76a03f'

// Simplified ABI for ERC20 transfer and balance
const DATACOIN_ABI = [
  'function transfer(address to, uint256 amount) public returns (bool)',
  'function balanceOf(address account) public view returns (uint256)',
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)'
]

// Platform wallet that receives WLT payments (your wallet address)
const PLATFORM_WALLET = '0xFefa60F5aA4069F96b9Bf65c814DDb3A604974e1' // Replace with your actual wallet

/**
 * Buy a discount coupon by transferring WLT tokens on-chain
 */
export async function buyCouponOnChain(
  signer: ethers.Signer,
  couponCost: number,
  couponId: string,
  couponName: string
) {
  console.log('🎫 Buying coupon on-chain...')
  console.log('💰 Cost:', couponCost, 'WLT')
  console.log('🎟️ Coupon:', couponName)

  try {
    const userAddress = await signer.getAddress()
    const contract = new ethers.Contract(DATACOIN_ADDRESS, DATACOIN_ABI, signer)

    // Convert WLT amount to wei (18 decimals)
    const amount = ethers.parseEther(couponCost.toString())

    console.log('📊 Checking balance...')
    const balance = await contract.balanceOf(userAddress)
    console.log('💰 Your balance:', ethers.formatEther(balance), 'WLT')

    if (balance < amount) {
      throw new Error(`Insufficient balance! You have ${ethers.formatEther(balance)} WLT but need ${couponCost} WLT`)
    }

    console.log('📤 Sending transaction...')
    console.log('🔔 Please approve the transaction in your wallet!')

    // Transfer WLT tokens to platform wallet
    const tx = await contract.transfer(PLATFORM_WALLET, amount)

    console.log('📤 Transaction sent:', tx.hash)
    console.log('⏳ Waiting for confirmation...')

    const receipt = await tx.wait()

    console.log('✅ Transaction confirmed in block:', receipt.blockNumber)
    console.log('⛽ Gas used:', receipt.gasUsed.toString())

    // Get new balance
    const newBalance = await contract.balanceOf(userAddress)
    console.log('💰 New balance:', ethers.formatEther(newBalance), 'WLT')

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      newBalance: ethers.formatEther(newBalance),
      couponId,
      couponName
    }
  } catch (error: any) {
    console.error('❌ Purchase failed:', error)
    throw new Error(`Coupon purchase failed: ${error.message}`)
  }
}

/**
 * Get user's WLT balance from blockchain
 */
export async function getWLTBalance(
  provider: ethers.Provider | ethers.Signer,
  userAddress: string
): Promise<string> {
  const contract = new ethers.Contract(DATACOIN_ADDRESS, DATACOIN_ABI, provider)
  const balance = await contract.balanceOf(userAddress)
  return ethers.formatEther(balance)
}

/**
 * Check if user has enough WLT for a purchase
 */
export async function canAffordCoupon(
  provider: ethers.Provider | ethers.Signer,
  userAddress: string,
  cost: number
): Promise<boolean> {
  const balance = await getWLTBalance(provider, userAddress)
  return parseFloat(balance) >= cost
}
