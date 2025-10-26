# OCR Document Verification Pipeline

This folder contains the core files for the **Document Verification (OCR Process)** in the ZK-STRKfi loan platform.

## 📋 Overview

The OCR (Optical Character Recognition) pipeline is used in **Step 1** of the borrower verification process:
1. User uploads passport/ID document
2. Backend extracts text using OCR (Tesseract.js)
3. Validates user input against extracted data
4. Generates ZK proof inputs for privacy-preserving identity verification

## 🗂️ Files in this Folder

### 1. **documentService.js** (Backend - Core Logic)
- **Location**: `backend/src/services/documentService.js`
- **Role**: Main OCR processing and validation service
- **Key Functions**:
  - `parseDocumentWithOCR()` - Extract text from images using Tesseract.js
  - `parsePDFDocument()` - Extract text from PDF files
  - `extractIdentityData()` - Find passport numbers, DOB, addresses using regex
  - `validateDocumentData()` - Fuzzy matching to validate user inputs against OCR data
  - `processIdentityDocument()` - Main pipeline: OCR → Extract → Validate → Hash → Generate ZK inputs
  - `hashDocument()`, `hashPassportNumber()`, `hashAddress()` - Privacy hashing
- **Dependencies**:
  - `tesseract.js` v6.0.1 - OCR engine
  - `sharp` v0.34.4 - Image enhancement
  - `pdf-parse` v2 - PDF text extraction
  - `multer` - File upload handling
- **Configuration**:
  - Set `ENABLE_OCR=false` to disable validation
  - Minimum OCR confidence: 60%
  - Address match threshold: 50%
  - Upload limit: 5MB
  - Allowed formats: JPEG, PNG, PDF

### 2. **identityRoutes.js** (Backend - API Endpoints)
- **Location**: `backend/src/routes/identityRoutes.js`
- **Role**: Express routes for identity verification
- **Key Endpoints**:
  - `POST /api/identity/verify-document` - Main upload endpoint
    - Accepts: multipart/form-data with `document` file
    - Fields: passportNumber, address, dateOfBirth, walletAddress
    - Returns: zkInputs, metadata (age, validation results)
  - `POST /api/identity/generate-proof` - Generate ZK proof from inputs
  - `POST /api/identity/verify-age-only` - Quick age check (testing)
  - `GET /api/identity/current-timestamp` - Get server timestamp
- **Security**:
  - Documents deleted immediately after processing
  - Only hashes stored on-chain
  - Strict validation required (all fields must match)

### 3. **api.ts** (Frontend - API Client)
- **Location**: `frontend/lib/services/api.ts`
- **Role**: TypeScript API wrapper for frontend
- **Key Functions**:
  - `identityApi.verifyDocument(formData)` - Upload document + data
  - `identityApi.generateIdentityProof()` - Generate ZK proof
  - `identityApi.verifyCommitment()` - Check commitment validity
- **Usage**:
  ```typescript
  const formData = new FormData()
  formData.append('document', file)
  formData.append('passportNumber', passport)
  formData.append('address', addr)
  formData.append('dateOfBirth', dob)
  formData.append('walletAddress', wallet)
  
  const result = await identityApi.verifyDocument(formData)
  ```

### 4. **page.tsx (borrowers)** (Frontend - UI)
- **Location**: `frontend/app/borrowers/page.tsx`
- **Role**: User interface for document upload (Step 1)
- **Key Features**:
  - File input with validation (max 5MB, JPEG/PNG/PDF only)
  - Form fields: Passport Number, DOB, Address
  - Image preview for uploaded documents
  - Displays OCR confidence and validation results
  - Error handling with detailed hints
- **State Management**:
  - `documentPhoto` - Uploaded file
  - `passportNumber`, `address`, `dateOfBirth` - User inputs
  - `identityVerified`, `identityCommitment` - Verification results
  - `photoPreview` - Image preview URL

## 🔄 OCR Pipeline Flow

```
┌─────────────────────┐
│  1. User Uploads    │
│  Document + Inputs  │
│  (Frontend)         │
└──────────┬──────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  2. Backend Receives Upload                             │
│  Route: POST /api/identity/verify-document              │
│  File: identityRoutes.js                                │
└──────────┬──────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  3. OCR Processing                                      │
│  Service: documentService.processIdentityDocument()     │
│  ├─ parseDocumentWithOCR() → Extract text (Tesseract)  │
│  ├─ extractIdentityData() → Find passport/DOB/address  │
│  ├─ validateDocumentData() → Match with user inputs    │
│  └─ hashDocument() → Generate privacy hashes           │
└──────────┬──────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  4. Validation Decision                                 │
│  ✅ PASS: All fields match (fuzzy matching allowed)    │
│  ❌ FAIL: Any critical field mismatch → REJECT         │
└──────────┬──────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  5. Delete Document (Privacy)                           │
│  File removed from backend/uploads/documents/           │
│  Only hashes stored for ZK proof                        │
└──────────┬──────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│  6. Return ZK Inputs                                    │
│  Response: { zkInputs, metadata, validation }           │
│  Frontend receives: age, confidence, matches, warnings  │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Validation Rules

### Passport Number
- **Method**: Fuzzy matching with Levenshtein distance
- **Tolerance**: Max 2 character errors (or 20% of length)
- **Patterns**: Supports US, UK, EU, numeric formats
- **Example**: Input "A1234567" matches OCR "A1Z34567" (1 OCR error)

### Date of Birth (DOB)
- **Method**: Strict date parsing with ±1 day tolerance
- **Formats**: DD/MM/YYYY, YYYY-MM-DD, DD.MM.YYYY
- **Range**: 1900-2010 (valid birth years)
- **OCR Handling**: Cleans artifacts like "16./10/2005"
- **Example**: Input "1990-05-15" matches OCR "15/05/1990"

### Address
- **Method**: Word + number matching with scoring
- **Score Calculation**:
  - 70% weight on word matches
  - 30% weight on number matches (PIN, house number)
- **Threshold**: ≥50% match required
- **Normalization**: Lowercase, remove special chars, normalize spaces
- **Example**: Input "123 Main St, Mumbai 400001" matches OCR text containing those keywords

### Overall Decision
- **PASS**: All 3 fields (passport, DOB, address) match
- **FAIL**: Any field mismatch → Document rejected
- **Minimum OCR Confidence**: 60% (warning if lower)

## 🔧 Debugging & Tuning

### Enable/Disable OCR
```javascript
// In backend/.env
ENABLE_OCR=false  // Disable validation (only hashing)
ENABLE_OCR=true   // Full OCR validation (default)
```

### Adjust Validation Thresholds
Edit `documentService.js`:
```javascript
// Line ~632: Address match threshold
if (bestMatchScore >= 0.5) {  // Change 0.5 to 0.4 for more lenient matching

// Line ~165: OCR minimum confidence
function validateDocumentData(userInput, extractedData, parsedData, minConfidence = 60) {
  // Change 60 to 50 for lower quality documents
```

### Test OCR Output
```bash
# Check logs for OCR extracted text
cat backend/logs/combined.log | grep "OCR parsing completed"
cat backend/logs/combined.log | grep "Extraction results"
```

### Common Issues

#### 1. Low OCR Confidence
- **Solution**: Enhance image quality, better lighting
- **Config**: Adjust `minConfidence` threshold

#### 2. Passport Not Detected
- **Solution**: Add more regex patterns in `extractIdentityData()`
- **Location**: Line ~228-235 in `documentService.js`

#### 3. Date Format Not Recognized
- **Solution**: Add format to `parseDateString()` helper
- **Location**: Line ~305-345 in `documentService.js`

#### 4. Address Mismatch
- **Solution**: Lower threshold to 40%, add keywords
- **Location**: Line ~417-450 (keywords), Line ~632 (threshold)

## 📦 Dependencies

```json
{
  "tesseract.js": "^6.0.1",    // OCR engine
  "sharp": "^0.34.4",           // Image processing
  "pdf-parse": "^2.0.0",        // PDF text extraction
  "multer": "^1.4.5-lts.1"      // File uploads
}
```

## 🔐 Security & Privacy

1. **No Document Storage**: Files deleted immediately after OCR
2. **Hash-Only Storage**: Only SHA-256 hashes stored on-chain
3. **ZK Proofs**: Privacy-preserving verification (no PII revealed)
4. **Upload Limits**: 5MB max, restricted file types
5. **Strict Validation**: All fields must match to prevent fraud

## 📊 Metadata Structure

After successful verification:
```json
{
  "success": true,
  "zkInputs": {
    "passport_number": "felt252_hash",
    "address_hash": "felt252_hash",
    "dob_timestamp": "unix_timestamp",
    "document_photo_hash": "felt252_hash",
    "salt": "random_salt",
    "wallet_address": "felt252_address",
    "current_timestamp": "unix_timestamp",
    "age": 25,
    "verified": true
  },
  "metadata": {
    "age": 25,
    "documentHash": "sha256_hex",
    "validation": {
      "ocrConfidence": 87.5,
      "matches": {
        "passport": true,
        "dateOfBirth": true,
        "address": true
      },
      "warnings": []
    }
  }
}
```

## 🚀 Next Steps After Verification

1. ✅ **Identity Verified** → Generate ZK commitment
2. 🔍 **Activity Analysis** → Calculate transaction score
3. 📝 **Loan Application** → Apply to loan pools
4. 💰 **Loan Approval** → Receive funds on-chain

---

**Last Updated**: Based on current codebase analysis
**Contact**: Check main README.md for project documentation
