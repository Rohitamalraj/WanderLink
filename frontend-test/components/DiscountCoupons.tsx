'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ticket, Sparkles, TrendingDown, Gift, Lock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { buyCouponOnChain, getWLTBalance } from '@/lib/coupon-contract'
import { ethers } from 'ethers'

interface Coupon {
  id: string
  name: string
  discount: number
  cost: number
  description: string
  color: string
  bgColor: string
  icon: string
  savings: string
  available: boolean
}

export function DiscountCoupons() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [balance, setBalance] = useState(0)
  const [purchasedCoupons, setPurchasedCoupons] = useState<string[]>([])
  const [isPurchasing, setIsPurchasing] = useState(false)
  
  useEffect(() => {
    const fetchBalance = async () => {
      if (address) {
        try {
          // Fetch real balance from blockchain
          const provider = new ethers.BrowserProvider(window.ethereum as any)
          const realBalance = await getWLTBalance(provider, address)
          setBalance(parseFloat(realBalance))
          
          // Update localStorage with real balance
          const stored = localStorage.getItem(`dataCoin_${address}`)
          if (stored) {
            const data = JSON.parse(stored)
            data.balance = realBalance
            localStorage.setItem(`dataCoin_${address}`, JSON.stringify(data))
          }
        } catch (error) {
          console.error('Failed to fetch balance:', error)
          // Fallback to localStorage
          const stored = localStorage.getItem(`dataCoin_${address}`)
          if (stored) {
            const data = JSON.parse(stored)
            const bal = parseFloat(data.balance || data.amount || '0')
            setBalance(bal)
          }
        }
        
        // Load purchased coupons
        const coupons = localStorage.getItem(`coupons_${address}`)
        if (coupons) {
          setPurchasedCoupons(JSON.parse(coupons))
        }
      }
    }
    
    fetchBalance()
  }, [address])

  const coupons: Coupon[] = [
    {
      id: 'bronze_3',
      name: 'Bronze Saver',
      discount: 3,
      cost: 10,
      description: 'Get 3% off on trip stake amounts',
      color: 'text-orange-600',
      bgColor: 'from-orange-100 to-orange-200',
      icon: '🥉',
      savings: 'Save ₹150 on ₹5,000 stake',
      available: balance >= 10
    },
    {
      id: 'silver_5',
      name: 'Silver Saver',
      discount: 5,
      cost: 20,
      description: 'Get 5% off on trip stake amounts',
      color: 'text-gray-600',
      bgColor: 'from-gray-100 to-gray-200',
      icon: '🥈',
      savings: 'Save ₹250 on ₹5,000 stake',
      available: balance >= 20
    },
    {
      id: 'gold_7',
      name: 'Gold Saver',
      discount: 7,
      cost: 30,
      description: 'Get 7% off on trip stake amounts',
      color: 'text-yellow-600',
      bgColor: 'from-yellow-100 to-yellow-200',
      icon: '🥇',
      savings: 'Save ₹350 on ₹5,000 stake',
      available: balance >= 30
    },
    {
      id: 'platinum_10',
      name: 'Platinum Saver',
      discount: 10,
      cost: 50,
      description: 'Get 10% off on trip stake amounts',
      color: 'text-purple-600',
      bgColor: 'from-purple-100 to-purple-200',
      icon: '💎',
      savings: 'Save ₹500 on ₹5,000 stake',
      available: balance >= 50
    },
    {
      id: 'vip_15',
      name: 'VIP Saver',
      discount: 15,
      cost: 75,
      description: 'Get 15% off on trip stake amounts',
      color: 'text-pink-600',
      bgColor: 'from-pink-100 to-pink-200',
      icon: '👑',
      savings: 'Save ₹750 on ₹5,000 stake',
      available: balance >= 75
    },
    {
      id: 'ultimate_20',
      name: 'Ultimate Saver',
      discount: 20,
      cost: 100,
      description: 'Get 20% off on trip stake amounts',
      color: 'text-red-600',
      bgColor: 'from-red-100 to-red-200',
      icon: '🔥',
      savings: 'Save ₹1,000 on ₹5,000 stake',
      available: balance >= 100
    }
  ]

  const handlePurchase = async (coupon: Coupon) => {
    if (!coupon.available) {
      toast.error(`Insufficient balance! You need ${coupon.cost} WLT`)
      return
    }

    if (purchasedCoupons.includes(coupon.id)) {
      toast.info('You already own this coupon!')
      return
    }

    if (!address) {
      toast.error('Please connect your wallet!')
      return
    }

    setIsPurchasing(true)

    try {
      // ALWAYS ON-CHAIN PURCHASE (with blockchain transaction)
      toast.loading('Preparing blockchain transaction...', { id: 'purchase' })

      if (!walletClient) {
        throw new Error('Wallet not connected. Please connect your wallet.')
      }

      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()

      const result = await buyCouponOnChain(signer, coupon.cost, coupon.id, coupon.name)

      // Add to purchased coupons
      const newCoupons = [...purchasedCoupons, coupon.id]
      setPurchasedCoupons(newCoupons)

      // Save to localStorage
      localStorage.setItem(`coupons_${address}`, JSON.stringify(newCoupons))

      // Save transaction info
      const txInfo = {
        couponId: coupon.id,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        purchasedAt: new Date().toISOString()
      }
      localStorage.setItem(`coupon_tx_${address}_${coupon.id}`, JSON.stringify(txInfo))

      // Update balance from blockchain
      setBalance(parseFloat(result.newBalance))

      // Update localStorage balance
      const stored = localStorage.getItem(`dataCoin_${address}`)
      if (stored) {
        const data = JSON.parse(stored)
        data.balance = result.newBalance
        localStorage.setItem(`dataCoin_${address}`, JSON.stringify(data))
      }

      toast.success(`🎉 ${coupon.name} purchased on-chain! ${coupon.discount}% discount unlocked!`, { 
        id: 'purchase',
        duration: 5000 
      })
      toast.success(`📝 Transaction: ${result.transactionHash.slice(0, 10)}...`, { duration: 3000 })
    } catch (error: any) {
      console.error('Purchase failed:', error)
      toast.error(`Purchase failed: ${error.message}`, { id: 'purchase' })
    } finally {
      setIsPurchasing(false)
    }
  }

  const isPurchased = (couponId: string) => purchasedCoupons.includes(couponId)

  return (
    <Card className="border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Ticket className="w-7 h-7 text-pink-600" />
              Discount Coupons
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Use WLT tokens to buy discount coupons and reduce your trip stake amounts!
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Your Balance</p>
            <p className="text-3xl font-bold text-blue-600">{balance} WLT</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* On-Chain Info */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border-2 border-purple-300">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              ⛓️ Blockchain Purchases Only
            </h4>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            All coupon purchases require a blockchain transaction. Your WLT tokens will be transferred on-chain.
          </p>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-800 font-semibold mb-2">
              ✅ <strong>On-Chain Benefits:</strong>
            </p>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Real ERC20 token transfer</li>
              <li>• Verifiable on Etherscan</li>
              <li>• Transparent and trustless</li>
              <li>• Permanent blockchain record</li>
            </ul>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            How Discount Coupons Work
          </h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <p><strong>Buy a coupon</strong> using your WLT tokens (one-time purchase)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <p><strong>Apply it</strong> when joining a trip to reduce the stake amount</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <p><strong>Save money</strong> on every trip you join! (Unlimited uses)</p>
            </div>
          </div>
          <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-sm text-green-800 font-semibold">
              💡 Example: With a 10% coupon, a ₹5,000 stake becomes ₹4,500. You save ₹500!
            </p>
          </div>
        </div>

        {/* Coupon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const purchased = isPurchased(coupon.id)
            
            return (
              <div
                key={coupon.id}
                className={`relative bg-gradient-to-br ${coupon.bgColor} rounded-lg p-4 border-2 ${
                  purchased ? 'border-green-500' : coupon.available ? 'border-gray-300' : 'border-gray-200 opacity-60'
                }`}
              >
                {/* Purchased Badge */}
                {purchased && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Owned
                  </div>
                )}

                {/* Locked Badge */}
                {!coupon.available && !purchased && (
                  <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Locked
                  </div>
                )}

                {/* Coupon Content */}
                <div className="text-center mb-3">
                  <div className="text-5xl mb-2">{coupon.icon}</div>
                  <h3 className={`text-xl font-bold ${coupon.color}`}>
                    {coupon.name}
                  </h3>
                </div>

                {/* Discount Badge */}
                <div className="bg-white rounded-lg p-3 mb-3 text-center border-2 border-dashed border-gray-300">
                  <p className="text-4xl font-bold text-gray-900">{coupon.discount}%</p>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Discount</p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-2 text-center">
                  {coupon.description}
                </p>

                {/* Savings */}
                <div className="bg-white bg-opacity-70 rounded-lg p-2 mb-3 text-center">
                  <p className="text-xs text-gray-600 font-semibold flex items-center justify-center gap-1">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    {coupon.savings}
                  </p>
                </div>

                {/* Price & Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded-lg p-2">
                    <span className="text-sm text-gray-600">Cost:</span>
                    <span className="text-lg font-bold text-blue-600">{coupon.cost} WLT</span>
                  </div>

                  {purchased ? (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Purchased
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${
                        coupon.available 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() => handlePurchase(coupon)}
                      disabled={!coupon.available || isPurchasing}
                    >
                      {isPurchasing ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : coupon.available ? (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          Buy On-Chain
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Need {coupon.cost} WLT
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Purchased Discounts Section */}
        {purchasedCoupons.length > 0 && (
          <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="w-7 h-7 text-green-600" />
                My Purchased Discounts
              </CardTitle>
              <CardDescription className="text-base">
                You own {purchasedCoupons.length} discount {purchasedCoupons.length === 1 ? 'coupon' : 'coupons'}. Use them when joining trips!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {purchasedCoupons.map((couponId) => {
                  const coupon = coupons.find(c => c.id === couponId)
                  if (!coupon) return null
                  
                  // Get transaction info
                  const txInfo = address ? localStorage.getItem(`coupon_tx_${address}_${couponId}`) : null
                  const txData = txInfo ? JSON.parse(txInfo) : null
                  
                  return (
                    <div 
                      key={couponId}
                      className={`bg-gradient-to-br ${coupon.bgColor} rounded-lg p-5 border-2 border-green-500 shadow-lg hover:shadow-xl transition-shadow`}
                    >
                      {/* Owned Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          OWNED
                        </div>
                        <span className="text-4xl">{coupon.icon}</span>
                      </div>

                      {/* Coupon Details */}
                      <h3 className={`text-xl font-bold ${coupon.color} mb-2`}>
                        {coupon.name}
                      </h3>

                      {/* Discount Badge */}
                      <div className="bg-white rounded-lg p-3 mb-3 text-center border-2 border-dashed border-gray-300">
                        <p className="text-3xl font-bold text-gray-900">{coupon.discount}%</p>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Discount</p>
                      </div>

                      {/* Savings Info */}
                      <div className="bg-white bg-opacity-70 rounded-lg p-2 mb-3">
                        <p className="text-xs text-gray-700 font-semibold text-center">
                          {coupon.savings}
                        </p>
                      </div>

                      {/* Purchase Info */}
                      {txData && (
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Purchased:</p>
                          <p className="text-xs text-gray-900 font-mono">
                            {new Date(txData.purchasedAt).toLocaleDateString()}
                          </p>
                          {txData.transactionHash && (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${txData.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                            >
                              View on Etherscan →
                            </a>
                          )}
                        </div>
                      )}

                      {/* Usage Badge */}
                      <div className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-2 text-center">
                        <p className="text-xs font-bold">✨ Unlimited Uses</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Usage Instructions */}
              <div className="mt-6 bg-white rounded-lg p-4 border-2 border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  💡 How to Use Your Discounts
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• When joining a trip, select your discount coupon</li>
                  <li>• Your stake amount will be automatically reduced</li>
                  <li>• Example: 10% off on ₹5,000 = Pay only ₹4,500</li>
                  <li>• Use each coupon unlimited times!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white text-center">
          <h4 className="text-xl font-bold mb-2">💰 Smart Savings Strategy</h4>
          <p className="mb-4 text-blue-100">
            Buy higher discount coupons to maximize your savings on every trip!
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="font-bold text-2xl">₹500+</p>
              <p className="text-blue-100">Saved per trip</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="font-bold text-2xl">Unlimited</p>
              <p className="text-blue-100">Uses per coupon</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
