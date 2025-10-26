'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { useRouter } from 'next/navigation'
import { lighthouseService } from '@/lib/lighthouse-storage'
import { Loader2, CheckCircle, Shield, Upload } from 'lucide-react'
import Image from 'next/image'
import { BrowserProvider } from 'ethers'
import { submitProofOnChain } from '@/lib/zkproof-onchain'
import { mintDataCoin } from '@/lib/datacoin'
import { setJSON, safeLocalStorage } from '@/lib/offchain-Storage'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || ''

export function VerificationForm() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const router = useRouter()
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [residentialAddress, setResidentialAddress] = useState('')
  const [documentType, setDocumentType] = useState('passport')
  const [documentNumber, setDocumentNumber] = useState('')
  const [documentPhoto, setDocumentPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string>('')
  
  // Status state
  const [isVerifying, setIsVerifying] = useState(false)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [isGeneratingProof, setIsGeneratingProof] = useState(false)
  const [isMintingDataCoin, setIsMintingDataCoin] = useState(false)
  const [encryptedCID, setEncryptedCID] = useState<string | null>(null)
  const [zkProofCID, setZkProofCID] = useState<string>('')
  const [dataCoinMinted, setDataCoinMinted] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [lighthouseInitialized, setLighthouseInitialized] = useState(false)
  const [status, setStatus] = useState('')

  // Initialize Lighthouse on mount
  useEffect(() => {
    const initLighthouse = async () => {
      try {
        if (!LIGHTHOUSE_API_KEY) {
          console.error('❌ Lighthouse API key not configured')
          setStatus('❌ Lighthouse API key missing')
          return
        }
        
        await lighthouseService.initialize(LIGHTHOUSE_API_KEY)
        setLighthouseInitialized(true)
        console.log('✅ Lighthouse initialized')
      } catch (error: any) {
        console.error('❌ Lighthouse initialization failed:', error)
        setStatus('❌ Failed to initialize Lighthouse storage')
      }
    }

    initLighthouse()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'profile') => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = type === 'document'
      ? ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      : ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      setStatus('❌ Invalid file type')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus('❌ File must be less than 5MB')
      return
    }

    if (type === 'document') {
      setDocumentPhoto(file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => setPhotoPreview(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        setPhotoPreview('')
      }
    } else {
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setProfilePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const validateForm = (): boolean => {
    if (!fullName.trim()) { setStatus('❌ Full name required'); return false }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus('❌ Valid email required'); return false }
    if (!dateOfBirth) { setStatus('❌ Date of birth required'); return false }
    
    const birthDate = new Date(dateOfBirth)
    const age = new Date().getFullYear() - birthDate.getFullYear()
    if (age < 18) { setStatus('❌ Must be 18+'); return false }
    
    if (!residentialAddress.trim()) { setStatus('❌ Address required'); return false }
    if (!documentNumber.trim()) { setStatus('❌ Document number required'); return false }
    if (!documentPhoto) { setStatus('❌ Document photo required'); return false }
    if (!profilePhoto) { setStatus('❌ Profile photo required'); return false }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!isConnected || !address || !walletClient || !lighthouseInitialized) {
      setStatus('❌ Please connect wallet and try again')
      return
    }

    try {
      setIsVerifying(true)
      setValidationErrors([])
      setStatus('🔍 Step 1: Verifying document with OCR...')

      // Step 1: Verify document
      const formData = new FormData()
      formData.append('passportNumber', documentNumber)
      formData.append('address', residentialAddress)
      formData.append('dateOfBirth', dateOfBirth)
      formData.append('walletAddress', address)
      if (documentPhoto) formData.append('document', documentPhoto)
      if (profilePhoto) formData.append('profilePhoto', profilePhoto)

      const verifyResponse = await fetch(`${BACKEND_URL}/api/identity/verify-document`, {
        method: 'POST',
        body: formData,
      })
      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok || !verifyData.success) {
        const errors = verifyData.validation?.errors || [verifyData.error || 'Verification failed']
        setValidationErrors(errors)
        setStatus('❌ Document verification failed')
        setIsVerifying(false)
        return
      }

      setStatus('✅ Document verified!')
      setIsVerifying(false)

      // Step 2: Encrypt and store
      setIsEncrypting(true)
      setStatus('🔐 Step 2: Encrypting data with Lighthouse...')

      const kycData = {
        fullName,
        email,
        phoneNumber,
        dateOfBirth,
        residentialAddress,
        documentType,
        documentNumber,
        walletAddress: address,
        verifiedAt: new Date().toISOString(),
        documentHash: verifyData.metadata?.documentHash || '',
        ageVerified: verifyData.metadata?.age >= 18,
        profilePhoto: profilePreview,
      }

      const uploadResult = await lighthouseService.encryptAndUpload(
        JSON.stringify(kycData),
        walletClient
      )
      
      const cid = uploadResult.cid
      setEncryptedCID(cid)
      setStatus('✅ Data encrypted!')
      setIsEncrypting(false)

      // Step 3: Generate ZK proof and submit on-chain
      setIsGeneratingProof(true)
      setStatus('🔐 Step 3: Generating ZK proof...')
      
      try {
        const birthDate = new Date(dateOfBirth)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        const ageVerified = age >= 18

        const proofRes = await fetch(`${BACKEND_URL}/api/identity/generate-zk-proof`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            address,
            passportNumber: documentNumber,
            residentialAddress,
            dateOfBirth,
            ageVerified
          })
        })
        const proofData = await proofRes.json()
        
        if (proofRes.ok && proofData.success) {
          setZkProofCID(proofData.cid)
          setStatus('🔗 Submitting proof on-chain...')
          
          const provider = new BrowserProvider(walletClient as any)
          const signer = await provider.getSigner()
          
          try {
            await submitProofOnChain(signer, proofData.proof, proofData.cid)
            setStatus(`✅ ZK proof verified! Age ${ageVerified ? '✓' : '✗'} (${age} years)`)
          } catch (onChainErr: any) {
            console.error('❌ On-chain submission failed:', onChainErr)
            setStatus('⚠️ Proof generated but on-chain submission failed')
          }
        }
      } catch (zkErr: any) {
        console.error('❌ ZK proof error:', zkErr)
        setStatus('⚠️ ZK proof generation failed')
      }
      setIsGeneratingProof(false)

      // Step 4: Mint DataCoin
      setIsMintingDataCoin(true)
      setStatus('🪙 Step 4: Minting DataCoin...')
      
      try {
        const provider = new BrowserProvider(walletClient as any)
        const signer = await provider.getSigner()
        
        const birthDate = new Date(dateOfBirth)
        const today = new Date()
        let userAge = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          userAge--
        }
        const isAgeVerified = userAge >= 18

        const mintResult = await mintDataCoin(signer, cid, {
          name: `${fullName} - Verified Identity`,
          description: 'Identity verification data with zkTLS proof stored on Lighthouse',
          image: profilePreview,
          attributes: [
            { trait_type: 'Full Name', value: fullName },
            { trait_type: 'Age Verified', value: isAgeVerified ? 'Yes' : 'No' },
            { trait_type: 'Document Type', value: documentType },
            { trait_type: 'Verification Date', value: new Date().toLocaleDateString() }
          ]
        })
        
        setJSON(`dataCoin_${address}`, {
          amount: mintResult.amount,
          balance: mintResult.balance,
          transactionHash: mintResult.transactionHash,
          lighthouseCID: cid,
          mintedAt: new Date().toISOString(),
          fullName: fullName,
          profilePhoto: profilePreview,
          documentType: documentType
        })
        
        setDataCoinMinted(true)
        setStatus(`🎉 DataCoin minted! Amount: ${mintResult.amount} tokens`)
        
        safeLocalStorage.setItem(`kycCID_${address}`, cid)
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (mintErr: any) {
        console.error('❌ DataCoin minting failed:', mintErr)
        setStatus('⚠️ DataCoin minting failed: ' + (mintErr?.message || mintErr))
      }
      setIsMintingDataCoin(false)

    } catch (error: any) {
      console.error('❌ Verification failed:', error)
      setStatus('❌ Error: ' + (error?.message || 'Verification failed'))
      setIsVerifying(false)
      setIsEncrypting(false)
      setIsGeneratingProof(false)
      setIsMintingDataCoin(false)
    }
  }

  if (encryptedCID && dataCoinMinted) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-xl font-bold text-green-800 mb-2 flex items-center gap-2">
          <CheckCircle className="w-6 h-6" />
          🎉 Verification Complete!
        </h3>
        <p className="text-green-700 mb-4">
          Your identity has been verified, encrypted, and minted as DataCoin!
        </p>
        
        <div className="space-y-3">
          <div className="bg-white p-3 rounded border">
            <p className="text-xs font-semibold text-gray-600 mb-1">✅ Step 1: OCR Verified</p>
            <p className="text-xs text-gray-500">Document validated with OCR</p>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <p className="text-xs font-semibold text-gray-600 mb-1">✅ Step 2: Lighthouse CID</p>
            <code className="text-xs break-all">{encryptedCID}</code>
          </div>
          
          {zkProofCID && (
            <div className="bg-white p-3 rounded border">
              <p className="text-xs font-semibold text-gray-600 mb-1">✅ Step 3: ZK Proof CID</p>
              <code className="text-xs break-all">{zkProofCID}</code>
            </div>
          )}
          
          <div className="bg-white p-3 rounded border">
            <p className="text-xs font-semibold text-gray-600 mb-1">✅ Step 4: DataCoin Minted</p>
            <p className="text-xs text-gray-500">100 DataCoin tokens minted!</p>
          </div>
        </div>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Verify Your Identity</h2>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <p className="text-blue-800 font-semibold">🔐 Lighthouse Storage + OCR Verification</p>
        <p className="text-blue-700 text-xs mt-1">
          Your documents are verified with OCR and encrypted on Lighthouse.
        </p>
      </div>

      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <h4 className="text-red-700 font-semibold text-sm">Validation Errors:</h4>
          <ul className="mt-1 list-disc list-inside text-xs text-red-600">
            {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-700">Personal Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="John Doe"
              disabled={isVerifying || isEncrypting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="john@example.com"
              disabled={isVerifying || isEncrypting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="+1 234 567 8900"
              disabled={isVerifying || isEncrypting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth * (18+)</label>
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              disabled={isVerifying || isEncrypting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Residential Address *</label>
            <input
              type="text"
              required
              value={residentialAddress}
              onChange={(e) => setResidentialAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="123 Main St, City, Country"
              disabled={isVerifying || isEncrypting}
            />
          </div>
        </div>

        {/* Document Information */}
        <div className="space-y-3 pt-4 border-t">
          <h3 className="font-semibold text-sm text-gray-700">Document Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Document Type *</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              disabled={isVerifying || isEncrypting}
            >
              <option value="passport">Passport</option>
              <option value="national_id">National ID</option>
              <option value="drivers_license">Driver's License</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Document Number *</label>
            <input
              type="text"
              required
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="A1234567"
              disabled={isVerifying || isEncrypting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Profile Photo * (JPEG/PNG, Max 5MB)</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={(e) => handleFileChange(e, 'profile')}
              className="w-full px-3 py-2 border rounded text-sm"
              disabled={isVerifying || isEncrypting}
            />
            {profilePreview && (
              <div className="mt-2 flex justify-center">
                <Image
                  src={profilePreview}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full border-2 object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Document Photo * (JPEG/PNG/PDF, Max 5MB)</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={(e) => handleFileChange(e, 'document')}
              className="w-full px-3 py-2 border rounded text-sm"
              disabled={isVerifying || isEncrypting}
            />
            {photoPreview && (
              <div className="mt-2">
                <Image
                  src={photoPreview}
                  alt="Document"
                  width={300}
                  height={200}
                  className="w-full max-w-sm mx-auto border-2 rounded"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!address || isVerifying || isEncrypting || !lighthouseInitialized}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
        >
          {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEncrypting && <Shield className="w-4 h-4" />}
          {isVerifying ? 'Verifying Document...' : 
           isEncrypting ? 'Encrypting Data...' : 
           'Verify & Encrypt'}
        </button>
      </form>

      {status && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          {status}
        </div>
      )}
    </div>
  )
}
