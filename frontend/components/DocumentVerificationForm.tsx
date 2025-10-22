/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { lighthouseService } from '@/lib/lighthouse-storage'
import { Loader2, CheckCircle, Shield } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || ''

export function DocumentVerificationForm() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  
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
  
  // Status state
  const [isVerifying, setIsVerifying] = useState(false)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [encryptedCID, setEncryptedCID] = useState<string>('')
  const [lighthouseInitialized, setLighthouseInitialized] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, or PDF files allowed')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be less than 5MB')
      return
    }

    setDocumentPhoto(file)

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPhotoPreview('')
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
    
    return true
  }

  const handleVerifyAndEncrypt = async () => {
    if (!validateForm()) return
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }
    if (!walletClient) {
      toast.error('Wallet client not available')
      return
    }
    if (!lighthouseInitialized) {
      toast.error('Lighthouse storage not initialized')
      return
    }

    try {
      setIsVerifying(true)
      toast.loading('Step 1: Verifying document with OCR...', { id: 'verify' })

      // Step 1: Verify document with OCR validation
      const formData = new FormData()
      formData.append('passportNumber', documentNumber)
      formData.append('address', residentialAddress)
      formData.append('dateOfBirth', dateOfBirth)
      formData.append('walletAddress', address)
      if (documentPhoto) {
        formData.append('document', documentPhoto)
      }

      const verifyResponse = await fetch(`${BACKEND_URL}/api/identity/verify-document`, {
        method: 'POST',
        body: formData,
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok || !verifyData.success) {
        // Handle validation errors
        if (verifyData.validation) {
          const errors = verifyData.validation.errors || []
          const warnings = verifyData.validation.warnings || []
          
          let errorMessage = verifyData.error || 'Document validation failed'
          
          if (errors.length > 0) {
            errorMessage += '\n\n❌ Validation Errors:\n' + 
              errors.map((e: string) => `• ${e}`).join('\n')
          }
          
          if (warnings.length > 0) {
            errorMessage += '\n\n⚠️ Warnings:\n' + 
              warnings.map((w: string) => `• ${w}`).join('\n')
          }
          
          errorMessage += '\n\n💡 Tips:\n' +
            '• Ensure document is clear and well-lit\n' +
            '• Check that entered data matches document exactly\n' +
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
      }

      // Encrypt and upload to Lighthouse
      const { cid } = await lighthouseService.encryptAndUpload(
        JSON.stringify(kycData),
        walletClient
      )

      console.log('✅ Data encrypted and stored in Lighthouse')
      console.log('📦 Lighthouse CID:', cid)
      
      setEncryptedCID(cid)
      setIsEncrypting(false)
      
      toast.success('🎉 Verification complete! Your data is encrypted and stored securely.', { 
        id: 'encrypt',
        duration: 5000 
      })

      // Store CID in localStorage for later retrieval
      localStorage.setItem(`kycCID_${address}`, cid)

    } catch (error: any) {
      console.error('❌ Verification/Encryption failed:', error)
      
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
            <Label className="text-sm font-medium">Encrypted Hash (Lighthouse CID):</Label>
            <code className="text-xs break-all block mt-1">{encryptedCID}</code>
          </div>
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
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-blue-700 dark:text-blue-300 flex items-center gap-2">
              👤 <span>Personal Information</span>
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
          {/* Document Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-pink-700 dark:text-pink-300 flex items-center gap-2">
              🪪 <span>Document Information</span>
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
                onChange={handleFileChange}
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
        </CardContent>
      </Card>
    </div>
  )
}


