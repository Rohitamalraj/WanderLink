# OCR Files Index

This folder contains **copied reference files** for the OCR/Document Verification pipeline.

## 📁 Files

### 1. README.md
- **Description**: Complete documentation of the OCR pipeline
- **Contents**: Flow diagrams, validation rules, debugging tips
- **Use for**: Understanding how the system works

### 2. documentService.js
- **Original**: `backend/src/services/documentService.js`
- **Lines**: 1,010 lines
- **Description**: Core OCR processing service
- **Key Functions**:
  - parseDocumentWithOCR()
  - parsePDFDocument()
  - extractIdentityData()
  - validateDocumentData()
  - processIdentityDocument()

### 3. identityRoutes.js
- **Original**: `backend/src/routes/identityRoutes.js`
- **Lines**: ~300 lines
- **Description**: Express API routes for identity verification
- **Key Endpoints**:
  - POST /api/identity/verify-document
  - POST /api/identity/generate-proof
  - POST /api/identity/verify-age-only

### 4. api.ts
- **Original**: `frontend/lib/services/api.ts`
- **Lines**: 387 lines
- **Description**: Frontend TypeScript API wrapper
- **Key Functions**:
  - identityApi.verifyDocument()
  - identityApi.generateIdentityProof()
  - identityApi.verifyCommitment()

### 5. borrowers_upload_section.tsx
- **Original**: Extract from `frontend/app/borrowers/page.tsx`
- **Description**: Simplified version of the document upload UI code
- **Key Features**:
  - File upload handler
  - Form validation
  - Identity verification function
  - Error handling with detailed messages

## 🔍 Quick Reference

**To modify OCR validation rules:**
→ Edit `documentService.js` (functions: extractIdentityData, validateDocumentData)

**To change API endpoints:**
→ Edit `identityRoutes.js` (routes definition)

**To update frontend API calls:**
→ Edit `api.ts` (identityApi section)

**To modify upload UI:**
→ Edit actual `frontend/app/borrowers/page.tsx` (not the copy here)

## ⚠️ Important Notes

1. **These are REFERENCE COPIES** - Do not edit these files expecting changes to take effect
2. **Edit the original files** in their respective locations for actual changes
3. **This folder is for documentation** and quick reference only
4. **See README.md** for the complete OCR pipeline documentation

## 🔗 Original File Locations

| File | Original Location |
|------|------------------|
| documentService.js | `backend/src/services/documentService.js` |
| identityRoutes.js | `backend/src/routes/identityRoutes.js` |
| api.ts | `frontend/lib/services/api.ts` |
| borrowers page | `frontend/app/borrowers/page.tsx` |

## 📚 Related Documentation

- **DOCUMENT_OCR_VALIDATION.md** - Main project docs (in root)
- **OCR_VALIDATION_GUIDE.md** - OCR validation guide (in root)
- **README.md (root)** - Project overview

---

**Purpose**: This folder centralizes all OCR-related code for easier debugging, modification, and understanding of the document verification process.
