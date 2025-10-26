'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { MetaMaskConnect } from '@/components/MetaMaskConnect'
import { DocumentVerificationForm } from '@/components/DocumentVerificationForm'

export default function VerifyPage() {
  const { isConnected } = useAccount()
  const [step, setStep] = useState(1)

  // Step 1: Connect MetaMask
  // Step 2: Fill form
  // Step 3: Verification/Encryption handled in form

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Complete Identity Verification</h1>
          <p className="text-gray-600">
            Verify your identity securely with Lighthouse Storage encryption
          </p>
        </div>

        {/* Stepper UI */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-4">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mb-1" style={{borderColor: step >= 1 ? '#6366f1' : '#d1d5db'}}>
                1
              </div>
              <span className="text-xs">Connect Wallet</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300 mt-4" />
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mb-1" style={{borderColor: step >= 2 ? '#6366f1' : '#d1d5db'}}>
                2
              </div>
              <span className="text-xs">Fill Form</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300 mt-4" />
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mb-1" style={{borderColor: step >= 3 ? '#6366f1' : '#d1d5db'}}>
                3
              </div>
              <span className="text-xs">Verify & Encrypt</span>
            </div>
          </div>
        </div>

        {/* Step 1: Connect MetaMask */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="mb-6">
                <div className="text-6xl mb-4 text-center">🔐</div>
                <h2 className="text-2xl font-bold mb-2 text-center">Step 1: Connect Your Wallet</h2>
                <p className="text-gray-600 mb-6 text-center">
                  Please connect your MetaMask wallet to begin the verification process
                </p>
              </div>
              <MetaMaskConnect onConnected={() => setStep(2)} />
            </div>
          </div>
        )}

        {/* Step 2: Fill Form */}
        {step === 2 && isConnected && (
          <DocumentVerificationForm onVerified={() => setStep(3)} />
        )}

        {/* Step 3: Success/Encryption handled in form */}

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="font-bold mb-2 text-lg">🔒 End-to-End Encrypted</h3>
            <p className="text-sm text-gray-600">
              All your personal data and documents are encrypted with your wallet signature before being stored on Lighthouse IPFS. Only you can decrypt it.
            </p>
          </div>
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="font-bold mb-2 text-lg">📦 Decentralized Storage</h3>
            <p className="text-sm text-gray-600">
              Your verification data is stored on Lighthouse IPFS - a decentralized network with no single point of failure or central database.
            </p>
          </div>
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="font-bold mb-2 text-lg">✅ Full Privacy</h3>
            <p className="text-sm text-gray-600">
              Your documents are never stored in plain text. Zero-knowledge proofs ensure verification without revealing your actual data.
            </p>
          </div>
        </div>

        {/* What You Will Need Section */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-lg mb-4 text-blue-900">📋 What You Will Need:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ Valid government-issued ID (Passport, National ID, or Driver&apos;s License)</li>
            <li>✅ Clear photo or scan of your document (JPEG, PNG, or PDF)</li>
            <li>✅ Personal information (name, email, phone, address)</li>
            <li>✅ Connected wallet (MetaMask with Hedera Testnet)</li>
          </ul>
        </div>

        {/* OCR Validation Info */}
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-bold text-lg mb-4 text-green-900">🔍 How Verification Works:</h3>
          <ol className="space-y-3 text-sm text-green-800">
            <li>
              <strong>1. Document Upload:</strong> You upload your government-issued ID photo
            </li>
            <li>
              <strong>2. OCR Extraction:</strong> Our system extracts text from your document using advanced OCR
            </li>
            <li>
              <strong>3. Validation:</strong> We compare extracted data with your form inputs to ensure they match
            </li>
            <li>
              <strong>4. Encryption:</strong> If validated, your data is encrypted with your wallet signature
            </li>
            <li>
              <strong>5. IPFS Storage:</strong> Encrypted data is stored on decentralized Lighthouse IPFS
            </li>
            <li>
              <strong>6. Completion:</strong> You receive a unique CID (Content Identifier) for future reference
            </li>
          </ol>
        </div>

        {/* Tips for Best Results */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-lg mb-4 text-yellow-900">💡 Tips for Best Results:</h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li>📸 Take photo in good lighting conditions</li>
            <li>🎯 Ensure all text is clearly visible and in focus</li>
            <li>📄 Use original document (not photocopy)</li>
            <li>✏️ Enter information exactly as shown on document</li>
            <li>🖼️ Upload high-resolution image (300+ DPI recommended)</li>
            <li>📱 PDF format works better for scanned documents</li>
          </ul>
        </div>
      </div>
    </div>
  )
}