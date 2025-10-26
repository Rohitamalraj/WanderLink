'use client'

import { VerificationForm } from '@/components/VerificationForm'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Wallet, Shield, Lock, Sparkles, Zap, CheckCircle } from 'lucide-react'

export default function VerifyPage() {
  const { isConnected, address } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-12 px-4 relative overflow-hidden">
      {/* Floating shapes - matching home page */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-orange-400 rounded-2xl border-4 border-black rotate-12 animate-bounce"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-pink-400 rounded-full border-4 border-black animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400 rounded-2xl border-4 border-black -rotate-12"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header - matching home page style */}
        <div className="text-center mb-12">
          <div className="inline-block p-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6">
            <Shield className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-4">
            GET
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">
              VERIFIED
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 font-bold max-w-2xl mx-auto">
            Secure identity verification with blockchain encryption
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl border-4 border-black mb-4">
                <Wallet className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black mb-3">CONNECT YOUR WALLET</h2>
              <p className="text-lg text-gray-700 font-bold">
                Connect your Web3 wallet to start verification
              </p>
            </div>
            
            <div className="flex justify-center mb-8">
              <ConnectButton />
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-4 border-black rounded-2xl p-6">
              <p className="text-center text-gray-800 font-bold mb-4">
                🦊 Don't have a wallet?
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-400 text-black px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  INSTALL METAMASK
                </a>
                <a
                  href="https://www.coinbase.com/wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-400 text-black px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  GET COINBASE
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-gradient-to-r from-green-400 to-emerald-400 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl border-4 border-black">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-black text-white">WALLET CONNECTED</p>
                  <p className="text-lg font-bold text-black font-mono">{address?.substring(0, 10)}...{address?.substring(address.length - 8)}</p>
                </div>
              </div>
            </div>
            <VerificationForm />
          </div>
        )}

        {/* Feature Cards - Neo-brutalist style */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-400 to-pink-400 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
            <div className="text-4xl mb-3">🔐</div>
            <h3 className="text-xl font-black mb-2 text-white">ENCRYPTED</h3>
            <p className="text-black font-bold">
              Your KYC data is encrypted with Lit Protocol. Only you can decrypt it.
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-yellow-400 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
            <div className="text-4xl mb-3">🪪</div>
            <h3 className="text-xl font-black mb-2 text-white">SOULBOUND</h3>
            <p className="text-black font-bold">
              Your Reputation SBT is non-transferable and tied to your wallet.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-cyan-400 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
            <div className="text-4xl mb-3">⛓️</div>
            <h3 className="text-xl font-black mb-2 text-white">ON-CHAIN</h3>
            <p className="text-black font-bold">
              Verification proof stored on Hedera/Sepolia for transparency.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
