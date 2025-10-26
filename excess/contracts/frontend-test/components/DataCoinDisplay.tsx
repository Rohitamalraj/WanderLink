'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Shield, CheckCircle, ExternalLink } from 'lucide-react'

interface DataCoinInfo {
  tokenId: string
  transactionHash: string
  lighthouseCID: string
  profilePhoto: string
  mintedAt: string
}

export function DataCoinDisplay() {
  const { address } = useAccount()
  const [dataCoin, setDataCoin] = useState<DataCoinInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) {
      setLoading(false)
      return
    }

    // Load DataCoin info from localStorage
    const stored = localStorage.getItem(`dataCoin_${address}`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setDataCoin(parsed)
      } catch (error) {
        console.error('Error parsing DataCoin info:', error)
      }
    }
    setLoading(false)
  }, [address])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 w-32 bg-gray-200 rounded-full"></div>
      </div>
    )
  }

  if (!dataCoin) {
    return null
  }

  return (
    <Card className="w-full max-w-sm border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Shield className="w-5 h-5" />
          Your DataCoin NFT
        </CardTitle>
        <CardDescription>
          Identity verification minted as NFT
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Photo */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 shadow-lg">
            {dataCoin.profilePhoto ? (
              <Image
                src={dataCoin.profilePhoto}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                {address?.slice(2, 4).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Token Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Token ID:</span>
            <Badge variant="secondary" className="font-mono">
              #{dataCoin.tokenId}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <Badge className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Minted:</span>
            <span className="text-xs text-gray-500">
              {new Date(dataCoin.mintedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2 pt-2 border-t">
          <a
            href={`https://gateway.lighthouse.storage/ipfs/${dataCoin.lighthouseCID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>View on Lighthouse</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          
          <a
            href={`https://polygonscan.com/tx/${dataCoin.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>View Transaction</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* DataCoin Badge */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-2 px-4 rounded-lg font-bold text-sm shadow-md">
          🪙 DataCoin NFT
        </div>
      </CardContent>
    </Card>
  )
}
