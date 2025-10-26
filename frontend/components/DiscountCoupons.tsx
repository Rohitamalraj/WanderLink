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
      cost: 100,
      description: 'Get 3% off on trip stake amounts',
      color: 'text-orange-600',
      bgColor: 'from-orange-100 to-orange-200',
      icon: '🥉',
      savings: 'Save ₹150 on ₹5,000 stake',
      available: balance >= 100
    },
    {
      id: 'silver_5',
      name: 'Silver Saver',
      discount: 5,
      cost: 200,
      description: 'Get 5% off on trip stake amounts',
      color: 'text-gray-600',
      bgColor: 'from-gray-100 to-gray-200',
      icon: '🥈',
      savings: 'Save ₹250 on ₹5,000 stake',
      available: balance >= 200
    },
    {
      id: 'gold_7',
      name: 'Gold Saver',
      discount: 7,
      cost: 300,
      description: 'Get 7% off on trip stake amounts',
      color: 'text-yellow-600',
      bgColor: 'from-yellow-100 to-yellow-200',
      icon: '🥇',
      savings: 'Save ₹350 on ₹5,000 stake',
      available: balance >= 300
    },
    {
      id: 'platinum_10',
      name: 'Platinum Saver',
      discount: 10,
      cost: 500,
      description: 'Get 10% off on trip stake amounts',
      color: 'text-purple-600',
      bgColor: 'from-purple-100 to-purple-200',
      icon: '💎',
      savings: 'Save ₹500 on ₹5,000 stake',
      available: balance >= 500
    },
    {
      id: 'vip_15',
      name: 'VIP Saver',
      discount: 15,
      cost: 750,
      description: 'Get 15% off on trip stake amounts',
      color: 'text-pink-600',
      bgColor: 'from-pink-100 to-pink-200',
      icon: '👑',
      savings: 'Save ₹750 on ₹5,000 stake',
      available: balance >= 750
    },
    {
      id: 'ultimate_20',
      name: 'Ultimate Saver',
      discount: 20,
      cost: 1000,
      description: 'Get 20% off on trip stake amounts',
      color: 'text-red-600',
      bgColor: 'from-red-100 to-red-200',
      icon: '🔥',
      savings: 'Save ₹1,000 on ₹5,000 stake',
      available: balance >= 1000
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

      toast.success(`🎉 ${coupon.name} purchased! ${coupon.discount}% discount unlocked!`, { 
        id: 'purchase',
        duration: 5000 
      })
    } catch (error: any) {
      console.error('Purchase failed:', error)
      toast.error(`Purchase failed: ${error.message}`, { id: 'purchase' })
    } finally {
      setIsPurchasing(false)
    }
  }

  const isPurchased = (couponId: string) => purchasedCoupons.includes(couponId)

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader className="bg-gradient-to-r from-pink-400 to-purple-400 border-b-4 border-black">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-black flex items-center gap-2">
              <Ticket className="w-8 h-8" />
              DISCOUNT COUPONS
            </CardTitle>
            <CardDescription className="text-base mt-2 font-bold text-gray-900">
              Use WLT tokens to buy discount coupons and reduce trip stakes!
            </CardDescription>
          </div>
          <div className="text-right bg-white rounded-xl p-4 border-4 border-black">
            <p className="text-sm font-bold text-gray-600">Your Balance</p>
            <p className="text-3xl font-black text-blue-600">{balance} WLT</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Coupon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const purchased = isPurchased(coupon.id)
            
            return (
              <div
                key={coupon.id}
                className={`relative bg-gradient-to-br ${coupon.bgColor} rounded-2xl p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  !coupon.available && !purchased ? 'opacity-60' : ''
                }`}
              >
                {purchased && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border-2 border-black">
                    <CheckCircle className="w-3 h-3" />
                    OWNED
                  </div>
                )}

                {!coupon.available && !purchased && (
                  <div className="absolute top-3 right-3 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border-2 border-black">
                    <Lock className="w-3 h-3" />
                    LOCKED
                  </div>
                )}

                <div className="text-center mb-3">
                  <div className="text-5xl mb-2">{coupon.icon}</div>
                  <h3 className={`text-xl font-black ${coupon.color}`}>
                    {coupon.name}
                  </h3>
                </div>

                <div className="bg-white rounded-xl p-4 mb-3 text-center border-4 border-black">
                  <p className="text-4xl font-black text-gray-900">{coupon.discount}%</p>
                  <p className="text-xs text-gray-600 uppercase font-black">DISCOUNT</p>
                </div>

                <p className="text-sm font-bold text-gray-700 mb-3 text-center">
                  {coupon.savings}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded-lg p-2 border-2 border-black">
                    <span className="text-sm font-bold text-gray-600">Cost:</span>
                    <span className="text-lg font-black text-blue-600">{coupon.cost} WLT</span>
                  </div>

                  {purchased ? (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-black border-2 border-black"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      PURCHASED
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full font-black border-2 border-black ${
                        coupon.available 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() => handlePurchase(coupon)}
                      disabled={!coupon.available || isPurchasing}
                    >
                      {isPurchasing ? (
                        'PROCESSING...'
                      ) : coupon.available ? (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          BUY NOW
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          NEED {coupon.cost} WLT
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
          <div className="mt-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-4 border-green-500 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-6">
                <h3 className="text-2xl font-black flex items-center gap-2 mb-2">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                  MY PURCHASED DISCOUNTS
                </h3>
                <p className="text-base font-bold text-gray-700">
                  You own {purchasedCoupons.length} discount {purchasedCoupons.length === 1 ? 'coupon' : 'coupons'}. Use them when joining trips!
                </p>
              </div>

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
                      className={`bg-gradient-to-br ${coupon.bgColor} rounded-2xl p-5 border-4 border-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                    >
                      {/* Owned Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border-2 border-black">
                          <CheckCircle className="w-3 h-3" />
                          OWNED
                        </div>
                        <span className="text-4xl">{coupon.icon}</span>
                      </div>

                      {/* Coupon Details */}
                      <h3 className={`text-xl font-black ${coupon.color} mb-2`}>
                        {coupon.name}
                      </h3>

                      {/* Discount Badge */}
                      <div className="bg-white rounded-xl p-3 mb-3 text-center border-4 border-black">
                        <p className="text-3xl font-black text-gray-900">{coupon.discount}%</p>
                        <p className="text-xs text-gray-600 uppercase font-black">DISCOUNT</p>
                      </div>

                      {/* Savings Info */}
                      <div className="bg-white bg-opacity-70 rounded-lg p-2 mb-3 border-2 border-black">
                        <p className="text-xs text-gray-700 font-bold text-center">
                          {coupon.savings}
                        </p>
                      </div>

                      {/* Purchase Info */}
                      {txData && (
                        <div className="bg-white rounded-lg p-3 border-2 border-green-500 mb-3">
                          <p className="text-xs text-gray-600 font-bold mb-1">Purchased:</p>
                          <p className="text-xs text-gray-900 font-mono font-bold">
                            {new Date(txData.purchasedAt).toLocaleDateString()}
                          </p>
                          {txData.transactionHash && (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${txData.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 font-bold underline mt-1 block"
                            >
                              View on Etherscan →
                            </a>
                          )}
                        </div>
                      )}

                      {/* Usage Badge */}
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-2 text-center border-2 border-black">
                        <p className="text-xs font-black">✨ UNLIMITED USES</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Usage Instructions */}
              <div className="mt-6 bg-white rounded-xl p-4 border-4 border-black">
                <h4 className="font-black text-gray-900 mb-2 flex items-center gap-2">
                  💡 HOW TO USE YOUR DISCOUNTS
                </h4>
                <ul className="text-sm text-gray-700 font-bold space-y-1">
                  <li>• When joining a trip, select your discount coupon</li>
                  <li>• Your stake amount will be automatically reduced</li>
                  <li>• Example: 10% off on ₹5,000 = Pay only ₹4,500</li>
                  <li>• Use each coupon unlimited times!</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
