'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { X, ExternalLink, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import lighthouse from '@lighthouse-web3/sdk'
import { getJSON } from '@/lib/localStorage'

export function ProfilePhotoNFT() {
  const { address } = useAccount()
  const [isOpen, setIsOpen] = useState(false)
  const [dataCoinData, setDataCoinData] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!address) return
    
    // Use safe localStorage utility
    const data = getJSON<any>(`dataCoin_${address}`)
    if (data) {
      setDataCoinData(data)
      
      // Check if we have display data directly in localStorage
      if (data.fullName && data.profilePhoto) {
        // Use data from localStorage (no need to decrypt from Lighthouse)
        setUserData({
          fullName: data.fullName,
          profilePhoto: data.profilePhoto,
          documentType: data.documentType
        })
        console.log('✅ User data loaded from localStorage:', {
          name: data.fullName,
          docType: data.documentType,
          hasPhoto: !!data.profilePhoto
        })
      }
    }
  }, [address])

  if (!dataCoinData) return null

  return (
    <>
      {/* Small Profile Photo in Top Right Corner */}
      <div 
        onClick={() => setIsOpen(true)}
        className="cursor-pointer group relative"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-500 shadow-lg hover:border-green-600 transition-all hover:scale-110">
          {userData?.profilePhoto ? (
            <img 
              src={userData.profilePhoto} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {isLoading ? '...' : address?.slice(2, 4).toUpperCase()}
            </div>
          )}
        </div>
        
        {/* Verified Badge */}
        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
          <CheckCircle className="w-3 h-3 text-white" />
        </div>

        {/* Tooltip */}
        <div className="absolute top-full right-0 mt-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          View Your DataCoin NFT
        </div>
      </div>

      {/* Modal/Popup */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="sticky top-0 bg-white border-b flex justify-between items-center p-4 z-10">
              <h2 className="text-xl font-bold text-gray-900">Your DataCoin NFT</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* NFT Card Content */}
            <div className="p-6 space-y-6">
              {/* Profile Photo */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-green-500 shadow-xl">
                    {userData?.profilePhoto ? (
                      <img 
                        src={userData.profilePhoto} 
                        alt="Profile NFT" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-6xl font-bold">
                        {isLoading ? '...' : address?.slice(2, 4).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Verified Badge */}
                  <div className="absolute bottom-2 right-2 bg-green-500 rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-semibold">Verified</span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              {userData && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Name:</span>
                    <span className="text-gray-900 font-semibold">{userData.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Document Type:</span>
                    <span className="text-gray-900 font-semibold">{userData.documentType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Age Verified:</span>
                    <span className="text-green-600 font-semibold">✓ Yes</span>
                  </div>
                </div>
              )}
              
              {!userData && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-700 text-center">
                    {isLoading ? 'Loading your data...' : 'Your personal data is encrypted and stored on Lighthouse'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Age Verified:</span>
                    <span className="text-green-600 font-semibold">✓ Yes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Identity Verified:</span>
                    <span className="text-green-600 font-semibold">✓ Yes</span>
                  </div>
                </div>
              )}

              {/* Token Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Token Balance:</span>
                  <span className="text-2xl font-bold text-blue-600">{dataCoinData.balance || dataCoinData.amount} WLT</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-semibold">Verified</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Minted:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(dataCoinData.mintedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t"></div>

              {/* Storage Info */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Data Encrypted on Lighthouse</p>
                    <p className="text-xs text-gray-600 break-all">CID: {dataCoinData.lighthouseCID?.slice(0, 20)}******</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-2xl">⛓️</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Proof Stored On-Chain</p>
                    <p className="text-xs text-gray-600">Network: Sepolia</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">

                {dataCoinData.transactionHash && (
                  <Button 
                    variant="outline"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open(`https://sepolia.etherscan.io/tx/${dataCoinData.transactionHash}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Transaction
                  </Button>
                )}
              </div>

              {/* Metadata */}
              {dataCoinData.metadata && (
                <>
                  <div className="border-t"></div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Verification Details</h3>
                    {dataCoinData.metadata.attributes?.map((attr: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{attr.trait_type}:</span>
                        <span className="text-gray-900 font-medium">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
