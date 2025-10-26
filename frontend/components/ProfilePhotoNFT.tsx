'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { X, ExternalLink, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getJSON } from '@/lib/localStorage'

export function ProfilePhotoNFT() {
  const { address } = useAccount()
  const [isOpen, setIsOpen] = useState(false)
  const [dataCoinData, setDataCoinData] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    if (!address) return
    
    const data = getJSON<any>(`dataCoin_${address}`)
    if (data) {
      setDataCoinData(data)
      
      if (data.fullName && data.profilePhoto) {
        setUserData({
          fullName: data.fullName,
          profilePhoto: data.profilePhoto,
          documentType: data.documentType
        })
      }
    }
  }, [address])

  if (!dataCoinData) return null

  return (
    <>
      {/* Small Profile Photo */}
      <div 
        onClick={() => setIsOpen(true)}
        className="cursor-pointer group relative"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-green-500 shadow-lg hover:border-green-600 transition-all hover:scale-110">
          {userData?.profilePhoto ? (
            <img 
              src={userData.profilePhoto} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {address?.slice(2, 4).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 border-b-4 border-black flex justify-between items-center p-4 z-10">
              <h2 className="text-xl font-black text-white">YOUR DATACOIN NFT</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

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
                        {address?.slice(2, 4).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-2 right-2 bg-green-500 rounded-full px-3 py-1 flex items-center gap-1 shadow-lg border-2 border-white">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-black">VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              {userData && (
                <div className="bg-blue-50 rounded-xl p-4 space-y-2 border-4 border-black">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm font-bold">Name:</span>
                    <span className="text-gray-900 font-black">{userData.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm font-bold">Document:</span>
                    <span className="text-gray-900 font-black">{userData.documentType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm font-bold">Age Verified:</span>
                    <span className="text-green-600 font-black">✓ YES</span>
                  </div>
                </div>
              )}

              {/* Token Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white rounded-xl p-4 border-4 border-black">
                  <span className="text-gray-600 font-bold">Token Balance:</span>
                  <span className="text-2xl font-black text-blue-600">{dataCoinData.balance || dataCoinData.amount} WLT</span>
                </div>

                <div className="flex justify-between items-center bg-white rounded-xl p-4 border-4 border-black">
                  <span className="text-gray-600 font-bold">Minted:</span>
                  <span className="text-gray-900 font-black">
                    {new Date(dataCoinData.mintedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {dataCoinData.transactionHash && (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${dataCoinData.transactionHash}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  VIEW ON ETHERSCAN
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
