'use client'

import { X, Loader2, CheckCircle, Clock } from 'lucide-react'

interface ProcessingStatusModalProps {
  isOpen: boolean
  onClose: () => void
  status: 'waiting' | 'matched'
  destination?: string
}

export default function ProcessingStatusModal({ isOpen, onClose, status, destination }: ProcessingStatusModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border-4 border-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white border-b-4 border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <div>
                <h2 className="text-2xl font-black">PROCESSING STATUS</h2>
                <p className="text-sm text-white/90 font-bold">
                  Checking your matching progress...
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'waiting' && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border-4 border-black">
              <div className="flex items-center gap-3 mb-6">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                <h2 className="text-2xl font-black">AGENTS ARE WORKING...</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-black">✅ Travel Agent extracted your preferences</p>
                    <p className="text-sm text-gray-600">Sent to MatchMaker</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1 animate-pulse" />
                  <div>
                    <p className="font-black">⏳ MatchMaker is pooling travelers...</p>
                    <p className="text-sm text-gray-600">Waiting for 3 compatible travelers (including you)</p>
                    {destination && (
                      <p className="text-sm text-purple-600 font-bold mt-1">Destination: {destination}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-gray-500">Planner will create your group</p>
                    <p className="text-sm text-gray-400">When group is formed</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-xl p-4 border-2 border-black">
                <p className="font-bold text-center">
                  🔄 You can close this and check back anytime!
                </p>
              </div>
            </div>
          )}

          {status === 'matched' && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border-4 border-black">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
                <h2 className="text-3xl font-black">GROUP MATCHED! 🎉</h2>
              </div>
              
              <p className="text-lg font-bold mb-4">
                Your group has been created! Check the processing trip card below.
              </p>

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                ✅ OK, GOT IT!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
