const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
// Document service (OCR, PDF parsing, hashing, validation)
const documentService = require('./documentService');
// Reclaim zkFetch proof generation
const { fetchAndStoreProof } = require('./reclaimProof');

// GET /api/identity/generate-eth-proof
router.get('/generate-eth-proof', async (req, res) => {
	try {
		const { cid, proof } = await fetchAndStoreProof();
		res.json({ success: true, cid, proof });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

// POST /api/identity/verify-document
// Uses documentService.upload middleware to accept files and runs OCR + validation
router.post('/verify-document', documentService.upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const { passportNumber, address, dateOfBirth, walletAddress } = req.body;
    const files = req.files || {};
    const documentFile = files['document'] ? files['document'][0] : null;
    const profilePhotoFile = files['profilePhoto'] ? files['profilePhoto'][0] : null;

    if (!passportNumber || !address || !dateOfBirth || !walletAddress || !documentFile || !profilePhotoFile) {
      return res.status(400).json({ success: false, error: 'Missing required fields', validation: { errors: ['All fields are required.'] } });
    }

    // Build a simple form object expected by processIdentityDocument
    const formObj = {
      passportNumber: passportNumber,
      address: address,
      dateOfBirth: dateOfBirth
    };

    try {
      const result = await documentService.processIdentityDocument(formObj, documentFile.path, walletAddress);
      // Keep the uploaded profile photo file path in response for client to use if needed
      return res.json({ success: true, message: 'Document verified', metadata: result.metadata, zkInputs: result.zkInputs });
    } catch (procErr) {
      // If validation failed, processIdentityDocument throws an error with message 'DOCUMENT VALIDATION FAILED'
      const msg = procErr.message || 'Document validation failed';
      if (msg.includes('DOCUMENT VALIDATION FAILED') && procErr.details) {
        return res.status(200).json({ success: false, error: 'Document validation failed', validation: procErr.details });
      }
      // For other predictable errors, return 200 with failure details so frontend can display messages
      return res.status(200).json({ success: false, error: msg });
    }
  } catch (err) {
    console.error('Error in /verify-document:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/identity/generate-zk-proof
// Lightweight endpoint that constructs zk inputs from provided fields (without the original file)
router.post('/generate-zk-proof', express.json(), async (req, res) => {
  try {
    const { address: walletAddress, passportNumber, residentialAddress, dateOfBirth } = req.body;
    if (!walletAddress || !passportNumber || !residentialAddress || !dateOfBirth) {
      return res.status(400).json({ success: false, error: 'Missing required fields for proof generation' });
    }

    // Compute hashes and inputs similar to processIdentityDocument (without document photo hash)
    const passportHash = documentService.hashPassportNumber(passportNumber);
    const addressHash = documentService.hashAddress(residentialAddress);
    const dobTimestamp = documentService.dobToTimestamp(dateOfBirth);
    const age = documentService.calculateAge(dobTimestamp);
    if (age < 18) return res.status(200).json({ success: false, error: 'Age verification failed (must be 18+)' });

    const salt = documentService.generateSalt();
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const zkInputs = {
      passport_number: documentService.hexToFelt(passportHash),
      address_hash: documentService.hexToFelt(addressHash),
      dob_timestamp: dobTimestamp.toString(),
      document_photo_hash: documentService.hexToFelt(crypto.createHash('sha256').update('nopicture').digest('hex')),
      salt: documentService.hexToFelt(salt),
      wallet_address: documentService.hexToFelt(walletAddress),
      current_timestamp: currentTimestamp.toString()
    };

    // Simulate proof generation + storing to Lighthouse (or any storage)
    const fakeCid = 'bafybeigdemo-proof-' + Date.now().toString(36);
    const fakeProof = { proof: '0xDEMO_PROOF', inputs: zkInputs };

    return res.json({ success: true, cid: fakeCid, proof: fakeProof, zkInputs, metadata: { age, timestamp: currentTimestamp } });
  } catch (err) {
    console.error('Error generating zk proof:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate proof' });
  }
});


// POST /api/identity/mint-datacoin
router.post('/mint-datacoin', async (req, res) => {
	try {
		const { address, cid } = req.body;
		if (!address || !cid) {
			return res.status(400).json({ success: false, error: 'Missing address or CID' });
		}
		// Simulate minting process (replace with actual contract call)
		console.log(`Minting DataCoin for address: ${address}, CID: ${cid}`);
		// TODO: Integrate with smart contract mint logic
		// For demo, always succeed
		return res.json({ success: true, message: 'DataCoin minted', txHash: '0xDEMOHASH' });
	} catch (err) {
		console.error('Error in /mint-datacoin:', err);
		return res.status(500).json({ success: false, error: 'Internal server error' });
	}
});

// POST /api/identity/store-kyc - simple server-side storage fallback (for demo)
router.post('/store-kyc', async (req, res) => {
	try {
		const kyc = req.body
		if (!kyc) return res.status(400).json({ success: false, error: 'Missing KYC payload' })
		console.log('Received KYC store request:', Object.keys(kyc))
		// For demo, generate a fake CID and return
		const fakeCid = 'bafybeigdemo' + Date.now().toString(36)
		return res.json({ success: true, cid: fakeCid })
	} catch (err) {
		console.error('Error in /store-kyc:', err)
		return res.status(500).json({ success: false, error: 'Internal server error' })
	}
})


module.exports = router;