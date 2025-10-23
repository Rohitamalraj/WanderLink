/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { lighthouseService } from '@/lib/lighthouse-storage'
import { Loader2, CheckCircle, Shield } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { submitProofOnChain } from '@/lib/zkproof-onchain'
import { mintDataCoin } from '@/lib/datacoin'
import { BrowserProvider } from 'ethers'
import { setJSON, safeLocalStorage } from '@/lib/localStorage'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || ''

export function DocumentVerificationForm({ onVerified }: { onVerified?: () => void }) {
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
  const [encryptedCID, setEncryptedCID] = useState<string>('')
  const [lighthouseInitialized, setLighthouseInitialized] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [retrievedData, setRetrievedData] = useState<string>('')
  const [isRetrieving, setIsRetrieving] = useState(false)
  const [zkProofCID, setZkProofCID] = useState<string>('')
  const [isGeneratingProof, setIsGeneratingProof] = useState(false)

  // Initialize Lighthouse on mount
  useEffect(() => {
    const initLighthouse = async () => {
      try {
        if (!LIGHTHOUSE_API_KEY) {
          console.error('❌ Lighthouse API key not configured')
          toast.error('Lighthouse API key missing. Please configure NEXT_PUBLIC_LIGHTHOUSE_API_KEY')
          return
        }
        
        await lighthouseService.initialize(LIGHTHOUSE_API_KEY)
        setLighthouseInitialized(true)
        console.log('✅ Lighthouse initialized for document verification')
      } catch (error: any) {
        console.error('❌ Lighthouse initialization failed:', error)
        toast.error('Failed to initialize Lighthouse storage')
      }
    }

    initLighthouse()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'profile') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = type === 'document'
      ? ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      : ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      toast.error(type === 'document' ? 'Only JPEG, PNG, or PDF files allowed' : 'Only JPEG or PNG files allowed')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be less than 5MB')
      return
    }

    if (type === 'document') {
      setDocumentPhoto(file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPhotoPreview('')
      }
    } else {
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      toast.error('Full name is required')
      return false
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Valid email is required')
      return false
    }
    if (!phoneNumber.trim()) {
      toast.error('Phone number is required')
      return false
    }
    if (!dateOfBirth) {
      toast.error('Date of birth is required')
      return false
    }
    
    // Age validation
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    if (age < 18) {
      toast.error('You must be 18 years or older')
      return false
    }
    
    if (!residentialAddress.trim()) {
      toast.error('Residential address is required')
      return false
    }
    if (!documentNumber.trim()) {
      toast.error('Document number is required')
      return false
    }
    if (!documentPhoto) {
      toast.error('Document photo is required')
      return false
    }
    if (!profilePhoto) {
      toast.error('Profile photo is required')
      return false
    }
    return true
  }

  const handleVerifyAndEncrypt = async () => {
    console.log('🚀 handleVerifyAndEncrypt called')
    console.log('Backend URL:', BACKEND_URL)
    
    if (!validateForm()) {
      console.log('❌ Form validation failed')
      return
    }
    
    if (!isConnected || !address) {
      console.log('❌ Wallet not connected')
      toast.error('Please connect your wallet first')
      return
    }
    if (!walletClient) {
      console.log('❌ Wallet client not available')
      toast.error('Wallet client not available')
      return
    }
    if (!lighthouseInitialized) {
      console.log('❌ Lighthouse not initialized')
      toast.error('Lighthouse storage not initialized')
      return
    }

    console.log('✅ All pre-checks passed, starting verification...')
    
    try {
      setIsVerifying(true)
      toast.loading('Step 1: Verifying document with OCR...', { id: 'verify' })
      console.log('📤 Sending verification request to:', `${BACKEND_URL}/api/identity/verify-document`)

      // Step 1: Verify document with OCR validation
      const formData = new FormData()
      formData.append('passportNumber', documentNumber)
      formData.append('address', residentialAddress)
      formData.append('dateOfBirth', dateOfBirth)
      formData.append('walletAddress', address)
      if (documentPhoto) {
        formData.append('document', documentPhoto)
      }
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto)
      }

      let verifyResponse: Response
      let verifyData: any
      try {
        console.log('📤 Fetching from:', `${BACKEND_URL}/api/identity/verify-document`)
        verifyResponse = await fetch(`${BACKEND_URL}/api/identity/verify-document`, {
          method: 'POST',
          body: formData,
        })
        console.log('📥 Response status:', verifyResponse.status, verifyResponse.statusText)
        verifyData = await verifyResponse.json()
        console.log('📥 Response data:', verifyData)
      } catch (networkErr) {
        console.error('❌ Network error during document verification:', networkErr)
        toast.error('Could not reach backend for document verification. Is the server running?', { id: 'verify', duration: 10000 })
        setIsVerifying(false)
        return
      }

      if (!verifyResponse.ok || !verifyData.success) {
        // Handle validation errors
        if (verifyData.validation) {
          const errors = verifyData.validation.errors || []
          const warnings = verifyData.validation.warnings || []
          try {
            const mintRes = await fetch(`${BACKEND_URL}/api/identity/mint-datacoin`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ address, cid }),
            })
            const mintData = await mintRes.json()
            if (mintRes.ok && mintData.success) {
              toast.success('DataCoin minted and sent to your wallet!', { id: 'mint' })
            } else {
              toast.error(mintData.error || 'Minting failed', { id: 'mint' })
            }
          } catch (mintErr) {
            console.error('Network error during minting:', mintErr)
            toast.error('Could not reach backend for minting. Is the server running?', { id: 'mint', duration: 10000 })
          }
            '• Use original document (not photocopy)'
          
          toast.error(errorMessage, { id: 'verify', duration: 10000 })
        } else {
          toast.error(verifyData.error || 'Document verification failed', { id: 'verify' })
        }
        
        setIsVerifying(false)
        return
      }

      console.log('✅ Document verified:', verifyData)
      
      // Display OCR validation results
      if (verifyData.metadata?.validation) {
        const validation = verifyData.metadata.validation
        console.log('✅ OCR Validation Results:', validation)
        
        if (validation.ocrConfidence) {
          console.log(`📊 OCR Confidence: ${Math.round(validation.ocrConfidence)}%`)
        }
        
        if (validation.matches) {
          console.log('✅ Validated fields:', Object.keys(validation.matches))
        }
      }

      toast.success('✅ Document verified successfully!', { id: 'verify' })
      setVerificationComplete(true)
      setIsVerifying(false)

      // Step 2: Encrypt and store in Lighthouse
      setIsEncrypting(true)
      toast.loading('Step 2: Encrypting data with Lighthouse...', { id: 'encrypt' })

      // Prepare KYC data
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

      // Encrypt and upload to Lighthouse (no backend fallback)
      let cid: string | null = null
      try {
        const uploadResult = await lighthouseService.encryptAndUpload(
          JSON.stringify(kycData),
          walletClient
        )
        cid = uploadResult.cid
      } catch (lhErr) {
        console.error('Lighthouse upload failed:', lhErr)
        toast.error('Lighthouse upload failed. Please try again.\n' + (lhErr?.message || lhErr), { id: 'encrypt', duration: 10000 })
        setIsEncrypting(false)
        return
      }

      console.log('✅ Data encrypted and stored in Lighthouse')
      console.log('📦 Lighthouse CID:', cid)


      setEncryptedCID(cid)
      setIsEncrypting(false)
      setRetrievedData('') // Clear previous retrieval

      // Step 3: Generate ZK proof, store in Lighthouse, and submit on-chain
      setIsGeneratingProof(true)
      toast.loading('Step 3: Generating ZK proof...', { id: 'zkproof' })
      try {
        // Calculate age from date of birth
        const birthDate = new Date(dateOfBirth)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        const ageVerified = age >= 18

        console.log('🔐 Generating ZK proof with:', { address, dateOfBirth, ageVerified, age })

        // Step 3a: Generate proof and upload to Lighthouse
        const proofRes = await fetch(`${BACKEND_URL}/api/identity/generate-zk-proof`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            address, 
            ageVerified, 
            dateOfBirth 
          })
        })
        const proofData = await proofRes.json()
        if (!proofRes.ok || !proofData.success) {
          console.error('❌ ZK proof generation failed:', proofData.error)
          toast.error(proofData.error || 'ZK proof generation failed', { id: 'zkproof' })
          setIsGeneratingProof(false)
          return
        }

        setZkProofCID(proofData.cid)
        console.log('✅ ZK Proof generated:', proofData.proof)
        console.log('📦 ZK Proof CID:', proofData.cid)

        // Step 3b: Submit proof on-chain (requires wallet approval)
        toast.loading('Step 3b: Submitting proof on-chain (approve in wallet)...', { id: 'zkproof' })
        console.log('🔗 Submitting ZK proof to blockchain...')
        
        const provider = new BrowserProvider(walletClient as any)
        const signer = await provider.getSigner()
        
        try {
          const onChainResult = await submitProofOnChain(signer, proofData.proof, proofData.cid)
          console.log('✅ Proof submitted on-chain!', onChainResult)
          console.log('📝 Transaction hash:', onChainResult.transactionHash)
          console.log('🔗 Block number:', onChainResult.blockNumber)
          
          toast.success(`ZK proof on-chain! Age ${ageVerified ? '✓' : '✗'} verified (${age} years old)`, { id: 'zkproof' })
        } catch (onChainErr: any) {
          console.error('❌ On-chain submission failed:', onChainErr)
          toast.error('On-chain proof submission failed: ' + (onChainErr?.message || onChainErr), { id: 'zkproof' })
          // Continue anyway - proof is still on Lighthouse
        }
      } catch (zkErr: any) {
        console.error('❌ ZK proof error:', zkErr)
        toast.error('Failed to generate/store ZK proof: ' + (zkErr?.message || zkErr), { id: 'zkproof' })
      }
      setIsGeneratingProof(false)

      // Step 4: Mint DataCoin NFT with profile photo
      console.log('🪙 Step 4: Minting DataCoin NFT...')
      toast.loading('Step 4: Minting DataCoin with your verified data...', { id: 'datacoin' })
      
      try {
        // Get ethers signer from wagmi wallet client
        const provider = new BrowserProvider(walletClient as any)
        const signer = await provider.getSigner()
        
        // Calculate age verification status for DataCoin metadata
        const birthDate = new Date(dateOfBirth)
        const today = new Date()
        let userAge = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          userAge--
        }
        const isAgeVerified = userAge >= 18

        // Mint DataCoin with profile photo and verification data
        const mintResult = await mintDataCoin(signer, cid, {
          name: `${fullName} - Verified Identity`,
          description: 'Identity verification data with zkTLS proof stored on Lighthouse',
          image: profilePreview, // Profile photo as NFT image
          attributes: [
            { trait_type: 'Full Name', value: fullName },
            { trait_type: 'Age Verified', value: isAgeVerified ? 'Yes' : 'No' },
            { trait_type: 'Document Type', value: documentType },
            { trait_type: 'Verification Date', value: new Date().toLocaleDateString() }
          ]
        })
        
        console.log('✅ DataCoin minted!', mintResult)
        console.log('💰 Amount:', mintResult.amount, 'tokens')
        console.log('💰 Balance:', mintResult.balance, 'tokens')
        console.log('📦 Contract:', mintResult.contractAddress)
        
        // Store mint info in localStorage WITH profile photo and name for display
        setJSON(`dataCoin_${address}`, {
          amount: mintResult.amount,
          balance: mintResult.balance,
          transactionHash: mintResult.transactionHash,
          lighthouseCID: cid,
          mintedAt: new Date().toISOString(),
          // Store display data to avoid Lighthouse decryption issues
          fullName: fullName,
          profilePhoto: profilePreview,
          documentType: documentType
        })
        
        toast.success(`🎉 DataCoin tokens minted! Amount: ${mintResult.amount} tokens`, { id: 'datacoin', duration: 5000 })
        
        // Redirect to dashboard after successful minting
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (mintErr: any) {
        console.error('❌ DataCoin minting failed:', mintErr)
        toast.error('DataCoin minting failed: ' + (mintErr?.message || mintErr), { id: 'datacoin' })
      }

      toast.success('🎉 Verification complete! Your data is encrypted and stored securely.', {
        id: 'encrypt',
        duration: 5000
      })

      // Store CID in localStorage for later retrieval
      if (cid) {
        safeLocalStorage.setItem(`kycCID_${address}`, cid)
      }

      // Notify parent/stepper that verification completed
      if (onVerified) onVerified()

    } catch (error: any) {
      console.error('❌ Verification/Encryption failed:', error)
  // Handler to retrieve and decrypt file from Lighthouse
  const handleRetrieveFromLighthouse = async () => {
    if (!encryptedCID || !walletClient) return
    setIsRetrieving(true)
    setRetrievedData('')
    try {
      const data = await lighthouseService.decryptAndRetrieve(encryptedCID, walletClient)
      setRetrievedData(data)
      toast.success('File retrieved and decrypted from Lighthouse!')
    } catch (err: any) {
      toast.error('Failed to retrieve/decrypt file: ' + (err?.message || err))
    }
    setIsRetrieving(false)
  }
      
      let errorMessage = 'Verification failed'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      if (isVerifying) {
        toast.error(errorMessage, { id: 'verify' })
      } else {
        toast.error(errorMessage, { id: 'encrypt' })
      }
      
      setIsVerifying(false)
      setIsEncrypting(false)
    }
  }

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>Please connect your wallet to continue</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (encryptedCID) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-green-500" />
            Verification Complete!
          </CardTitle>
          <CardDescription>Your identity has been verified and encrypted.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm font-medium">Encrypted Data (Lighthouse CID):</Label>
            <code className="text-xs break-all block mt-1">{encryptedCID}</code>
          </div>
          {zkProofCID && (
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                ZK Proof (Lighthouse CID):
              </Label>
              <code className="text-xs break-all block mt-1 text-blue-800">{zkProofCID}</code>
              <p className="text-xs text-blue-600 mt-2">
                ✓ Age verification proof stored securely on Lighthouse
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => {
                // Reset form
                setEncryptedCID('')
                setFullName('')
                setPhoneNumber('')
                setDateOfBirth('')
                setResidentialAddress('')
                setDocumentNumber('')
                setDocumentPhoto(null)
                setPhotoPreview('')
                setProfilePhoto(null)
                setProfilePreview('')
              }}
              variant="outline"
              className="w-full"
            >
              Verify Another Document
            </Button>
            <Button
              onClick={() => {
                window.location.href = '/dashboard'
              }}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={async () => {
                // Stub: Mint DataCoin reward (call backend)
                toast.loading('Minting DataCoin reward...')
                try {
                  const mintRes = await fetch(`${BACKEND_URL}/api/identity/mint-datacoin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address, cid: encryptedCID })
                  })
                  const mintData = await mintRes.json()
                  if (mintRes.ok && mintData.success) {
                    toast.success('DataCoin minted and sent to your wallet!')
                  } else {
                    toast.error(mintData.error || 'Minting failed')
                  }
                } catch (err) {
                  toast.error('Minting failed')
                }
              }}
              className="w-full bg-gradient-to-r from-yellow-500 to-green-500 text-white font-bold"
            >
              Mint DataCoin Reward
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 py-10 px-2"
      style={{ backgroundAttachment: 'fixed' }}
    >
      <Card className="max-w-2xl w-full mx-auto shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-lg">
            Identity Verification
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 dark:text-gray-200">
            Please provide accurate information. Your document will be verified using OCR.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Step 1: Personal Information */}
          <div className="space-y-4 border-b pb-6 mb-6">
            <h3 className="font-bold text-xl text-blue-700 dark:text-blue-300 flex items-center gap-2">
              1️⃣ 👤 <span>Personal Information</span>
            </h3>
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                disabled={isVerifying || isEncrypting}
                className="bg-blue-50/60 dark:bg-blue-900/30"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                disabled={isVerifying || isEncrypting}
                className="bg-purple-50/60 dark:bg-purple-900/30"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 234 567 8900"
                disabled={isVerifying || isEncrypting}
                className="bg-pink-50/60 dark:bg-pink-900/30"
              />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth * (Must be 18+)</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                disabled={isVerifying || isEncrypting}
                className="bg-blue-50/60 dark:bg-blue-900/30"
              />
            </div>
            <div>
              <Label htmlFor="address">Residential Address *</Label>
              <Input
                id="address"
                value={residentialAddress}
                onChange={(e) => setResidentialAddress(e.target.value)}
                placeholder="123 Main St, New York, NY 10001"
                disabled={isVerifying || isEncrypting}
                className="bg-purple-50/60 dark:bg-purple-900/30"
              />
            </div>
          </div>
          {/* Step 2: Profile Photo */}
          <div className="space-y-4 border-b pb-6 mb-6">
            <h3 className="font-bold text-xl text-green-700 dark:text-green-300 flex items-center gap-2">
              2️⃣ 🖼️ <span>Profile Photo</span>
            </h3>
            <div>
              <Label htmlFor="profilePhoto">Profile Photo * (JPEG, PNG - Max 5MB)</Label>
              <Input
                id="profilePhoto"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileChange(e, 'profile')}
                disabled={isVerifying || isEncrypting}
                className="bg-green-50/60 dark:bg-green-900/30"
              />
            </div>
            {profilePreview && (
              <div className="mt-4 flex flex-col items-center">
                <Image
                  src={profilePreview}
                  alt="Profile preview"
                  width={200}
                  height={200}
                  className="w-32 h-32 rounded-full border-4 border-green-300 shadow-lg object-cover"
                />
                <p className="mt-2 text-sm text-green-700 dark:text-green-300">Profile preview</p>
              </div>
            )}
          </div>
          {/* Step 3: Document Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-pink-700 dark:text-pink-300 flex items-center gap-2">
              3️⃣ 🪪 <span>Document Information</span>
            </h3>
            <div>
              <Label htmlFor="docType">Document Type *</Label>
              <select
                id="docType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full border rounded-md p-2 bg-pink-50/60 dark:bg-pink-900/30"
                disabled={isVerifying || isEncrypting}
              >
                <option value="passport">Passport</option>
                <option value="national_id">National ID Card</option>
                <option value="drivers_license">Driving License</option>
              </select>
            </div>
            <div>
              <Label htmlFor="docNumber">Document Number *</Label>
              <Input
                id="docNumber"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="A1234567"
                disabled={isVerifying || isEncrypting}
                className="bg-blue-50/60 dark:bg-blue-900/30"
              />
            </div>
            <div>
              <Label htmlFor="docPhoto">Document Photo * (JPEG, PNG, or PDF - Max 5MB)</Label>
              <Input
                id="docPhoto"
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={(e) => handleFileChange(e, 'document')}
                disabled={isVerifying || isEncrypting}
                className="bg-purple-50/60 dark:bg-purple-900/30"
              />
            </div>
            {photoPreview && (
              <div className="mt-4 flex flex-col items-center">
                <Image
                  src={photoPreview}
                  alt="Document preview"
                  width={400}
                  height={300}
                  className="w-full max-w-md mt-2 border-4 border-pink-300 rounded-lg shadow-lg"
                  style={{ objectFit: 'contain' }}
                />
                <p className="mt-2 text-sm text-pink-700 dark:text-pink-300">Document preview</p>
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <Button
            onClick={handleVerifyAndEncrypt}
            disabled={isVerifying || isEncrypting || !lighthouseInitialized}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-lg font-bold shadow-lg hover:from-blue-600 hover:to-pink-600"
            size="lg"
          >
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEncrypting && <Shield className="mr-2 h-4 w-4" />}
            {isVerifying ? 'Verifying Document...' : 
             isEncrypting ? 'Encrypting Data...' : 
             'Verify & Encrypt'}
          </Button>

          {/* Display CID and Retrieve Button after upload */}
          {encryptedCID && (
            <div className="mt-6 p-4 rounded-lg border bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" />
                <span className="font-semibold">Lighthouse CID:</span>
                <span className="font-mono text-blue-700 dark:text-blue-300">{encryptedCID}</span>
              </div>
              <Button
                onClick={handleRetrieveFromLighthouse}
                disabled={isRetrieving || !walletClient}
                className="bg-green-600 hover:bg-green-700 text-white font-bold mt-2"
              >
                {isRetrieving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isRetrieving ? 'Retrieving...' : 'Retrieve from Lighthouse'}
              </Button>
              {retrievedData && (
                <div className="mt-4 p-3 rounded bg-green-50 dark:bg-green-900/40 border">
                  <div className="font-bold mb-2">Decrypted File Contents:</div>
                  {/* Try to display as JSON, image, or text */}
                  {(() => {
                    try {
                      const json = JSON.parse(retrievedData)
                      return <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(json, null, 2)}</pre>
                    } catch {
                      // Not JSON, try image
                      if (retrievedData.startsWith('data:image')) {
                        return <img src={retrievedData} alt="Decrypted" className="max-w-full rounded shadow" />
                      }
                      // Otherwise, show as text
                      return <pre className="text-xs whitespace-pre-wrap">{retrievedData}</pre>
                    }
                  })()}
                </div>
              )}
              {/* Display ZK Proof CID after generation */}
              {zkProofCID && (
                <div className="mt-4 p-3 rounded bg-purple-50 dark:bg-purple-900/40 border">
                  <div className="font-bold mb-2 text-purple-700 dark:text-purple-300">ZK Proof CID (Lighthouse):</div>
                  <span className="font-mono text-purple-700 dark:text-purple-300">{zkProofCID}</span>
                </div>
              )}
              {isGeneratingProof && (
                <div className="mt-4 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating ZK proof...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}