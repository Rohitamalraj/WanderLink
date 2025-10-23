/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
/**
 * Extract from: frontend/app/borrowers/page.tsx
 * Section: Document Upload UI (Lines 220-430)
 * 
 * This file shows the frontend implementation of the document upload process
 * for identity verification in the borrower workflow.
 */

// ========================================
// 1. STATE MANAGEMENT
// ========================================

const [passportNumber, setPassportNumber] = useState('')
const [address, setAddress] = useState('')
const [dateOfBirth, setDateOfBirth] = useState('')
const [documentPhoto, setDocumentPhoto] = useState<File | null>(null)
const [photoPreview, setPhotoPreview] = useState<string>('')
const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false)
const [identityVerified, setIdentityVerified] = useState(false)
const [identityCommitment, setIdentityCommitment] = useState<string>('')

// ========================================
// 2. FILE UPLOAD HANDLER
// ========================================

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

  // Generate image preview (only for images, not PDFs)
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  } else {
    setPhotoPreview('') // No preview for PDFs
  }
}

// ========================================
// 3. IDENTITY VERIFICATION FUNCTION
// ========================================

const verifyIdentity = async () => {
  // Input validation
  if (!passportNumber.trim()) {
    toast.error('Passport/ID number required')
    return
  }
  if (!address.trim()) {
    toast.error('Address required')
    return
  }
  if (!dateOfBirth) {
    toast.error('Date of birth required')
    return
  }
  if (!documentPhoto) {
    toast.error('Please upload document photo')
    return
  }

  // Age validation (client-side check)
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  if (age < 18) {
    toast.error('You must be 18 years or older')
    return
  }

  try {
    setIsVerifyingIdentity(true)
    toast.loading('Verifying identity...', { id: 'identity' })

    console.log('📝 Uploading identity document...')

    // STEP 1: Upload document and get ZK inputs from backend
    const formData = new FormData()
    formData.append('passportNumber', passportNumber)
    formData.append('address', address)
    formData.append('dateOfBirth', dateOfBirth)
    formData.append('walletAddress', walletAddress)
    formData.append('document', documentPhoto) // Note: backend expects 'document' field name

    const uploadResponse = await axios.post(
      `${BACKEND_URL}/api/identity/verify-document`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )

    console.log('📄 Document verified:', uploadResponse.data)
    
    // Display validation results from OCR (if available)
    if (uploadResponse.data.metadata?.validation) {
      const validation = uploadResponse.data.metadata.validation
      console.log('✅ OCR Validation Results:', validation)
      
      if (validation.ocrConfidence) {
        console.log(`📊 OCR Confidence: ${Math.round(validation.ocrConfidence)}%`)
      }
      
      if (validation.matches) {
        console.log('✅ Validated fields:', Object.keys(validation.matches))
      }
      
      if (validation.warnings && validation.warnings.length > 0) {
        console.warn('⚠️ Validation warnings:', validation.warnings)
      }
    }

    if (!uploadResponse.data.success) {
      throw new Error(uploadResponse.data.error || 'Document verification failed')
    }

    // STEP 2: Generate identity ZK proof using backend zkInputs
    console.log('🔐 Generating identity ZK proof...')
    toast.loading('Generating zero-knowledge proof...', { id: 'identity' })

    const zkResponse = await axios.post(`${BACKEND_URL}/api/identity/generate-proof`, {
      identityInputs: uploadResponse.data.zkInputs
    })

    console.log('✅ Identity ZK proof generated:', zkResponse.data)

    if (!zkResponse.data.success) {
      throw new Error(zkResponse.data.error || 'Proof generation failed')
    }

    // Extract identity commitment (used for loan applications)
    const commitment = zkResponse.data.identity_commitment
    setIdentityCommitment(commitment)
    setIdentityVerified(true)

    // Save to localStorage (wallet-specific to persist across page reloads)
    localStorage.setItem(`identityCommitment_${walletAddress}`, commitment)
    localStorage.setItem(`identityVerified_${walletAddress}`, 'true')

    console.log('✅ Identity saved for wallet:', walletAddress)

    toast.success('Identity verified successfully!', { id: 'identity' })

    // Auto-advance to loan proof generation step
    setCurrentStep('loanProof')

  } catch (error: any) {
    console.error('❌ Identity verification failed:', error)
    
    // Extract detailed error message from backend response
    const errorData = error.response?.data
    let errorMessage = 'Verification failed'
    
    if (errorData?.error) {
      errorMessage = errorData.error
    } else if (errorData?.message) {
      errorMessage = errorData.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    // Show detailed validation errors if available from backend
    if (errorData?.validation) {
      console.error('📋 Validation errors:', errorData.validation)
      
      const validationErrors = errorData.validation.errors || []
      const validationWarnings = errorData.validation.warnings || []
      
      if (validationErrors.length > 0) {
        errorMessage += '\n\n❌ Validation Errors:\n' + 
          validationErrors.map((e: string) => `• ${e}`).join('\n')
      }
      
      if (validationWarnings.length > 0) {
        errorMessage += '\n\n⚠️ Warnings:\n' + 
          validationWarnings.map((w: string) => `• ${w}`).join('\n')
      }
    }
    
    // Add helpful tips for document validation errors
    if (errorMessage.includes('MISMATCH') || 
        errorMessage.includes('validation failed') || 
        errorMessage.includes('could not be read')) {
      errorMessage += '\n\n💡 Tips:\n' +
        '• Ensure document is clear and well-lit\n' +
        '• Check that entered data matches document exactly\n' +
        '• Use original document (not photocopy)\n' +
        '• Supported formats: JPEG, PNG, PDF'
    }
    
    toast.error(errorMessage, { id: 'identity', duration: 10000 })
  } finally {
    setIsVerifyingIdentity(false)
  }
}

// ========================================
// 4. UI COMPONENT (JSX)
// ========================================

/*
  In the actual page.tsx, this would be rendered as:
  
  <Card>
    <h3>Step 1: Identity Verification</h3>
    
    <Label>Passport/ID Number</Label>
    <Input 
      value={passportNumber}
      onChange={(e) => setPassportNumber(e.target.value)}
      placeholder="A1234567"
    />
    
    <Label>Date of Birth</Label>
    <Input 
      type="date"
      value={dateOfBirth}
      onChange={(e) => setDateOfBirth(e.target.value)}
    />
    
    <Label>Address</Label>
    <Input 
      value={address}
      onChange={(e) => setAddress(e.target.value)}
      placeholder="123 Main St, Mumbai 400001"
    />
    
    <Label>Document Photo</Label>
    <Input 
      type="file"
      accept="image/jpeg,image/png,application/pdf"
      onChange={handleFileChange}
    />
    
    {photoPreview && (
      <img src={photoPreview} alt="Document preview" className="w-full" />
    )}
    
    <Button 
      onClick={verifyIdentity}
      disabled={isVerifyingIdentity || identityVerified}
    >
      {isVerifyingIdentity ? 'Verifying...' : 'Verify Identity'}
    </Button>
  </Card>
*/

// ========================================
// 5. KEY POINTS FOR DEVELOPERS
// ========================================

/*
  🔑 Key Points:
  
  1. FILE VALIDATION
     - Max size: 5MB
     - Allowed types: JPEG, PNG, PDF
     - Client-side check before upload
  
  2. FORM FIELDS
     - passportNumber: Alphanumeric ID
     - dateOfBirth: YYYY-MM-DD format
     - address: Full residential address
     - walletAddress: StarkNet wallet (from wallet connection)
  
  3. BACKEND COMMUNICATION
     - Endpoint: POST /api/identity/verify-document
     - Content-Type: multipart/form-data
     - Returns: { success, zkInputs, metadata }
  
  4. ERROR HANDLING
     - Display OCR validation errors from backend
     - Show helpful tips for common issues
     - Long toast duration (10s) for detailed errors
  
  5. STATE PERSISTENCE
     - Save identityCommitment to localStorage
     - Wallet-specific keys (prevent cross-wallet data)
     - Retrieve on page reload
  
  6. WORKFLOW
     - User fills form + uploads document
     - Backend OCR validates document
     - ZK proof generated
     - Commitment stored
     - Advance to next step (loan proof)
*/
