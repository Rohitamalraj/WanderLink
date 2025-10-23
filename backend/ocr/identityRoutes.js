
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Set up multer for file uploads
const upload = multer({
	dest: path.join(__dirname, '../../uploads'),
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/identity/verify-document
router.post('/verify-document', upload.fields([
	{ name: 'document', maxCount: 1 },
	{ name: 'profilePhoto', maxCount: 1 }
]), async (req, res) => {
	try {
		const { passportNumber, address, dateOfBirth, walletAddress } = req.body;
		const files = req.files || {};
		const documentFile = files['document'] ? files['document'][0] : null;
		const profilePhotoFile = files['profilePhoto'] ? files['profilePhoto'][0] : null;

		if (!passportNumber || !address || !dateOfBirth || !walletAddress || !documentFile || !profilePhotoFile) {
			return res.status(400).json({
				success: false,
				error: 'Missing required fields',
				validation: { errors: ['All fields are required.'] },
			});
		}

		// Document parsing: if PDF, parse text; if image, simulate OCR
		let extractedText = '';
		if (documentFile.mimetype === 'application/pdf') {
			// PDF parsing (using pdf-parse v1.1.1, CommonJS)
			const pdfParse = require('pdf-parse');
			const dataBuffer = fs.readFileSync(documentFile.path);
			const pdfData = await pdfParse(dataBuffer);
			extractedText = pdfData.text;
		} else if (documentFile.mimetype.startsWith('image/')) {
			// Simulate OCR (replace with real OCR if needed)
			extractedText = '[SIMULATED OCR]';
		}

		// Simulate strict match: require exact match for document number and DOB in extracted text
		// (In real use, parse extractedText for these fields)
		const matches = {
			documentNumber: true, // Simulate always true for now
			dateOfBirth: true,
		};

		if (!matches.documentNumber || !matches.dateOfBirth) {
			return res.status(200).json({
				success: false,
				error: 'Document number or date of birth does not match.',
				validation: {
					errors: [
						!matches.documentNumber ? 'Document number does not match.' : null,
						!matches.dateOfBirth ? 'Date of birth does not match.' : null,
					].filter(Boolean),
					warnings: [],
				},
				metadata: { matches },
			});
		}

		// If all matches, return success
		return res.status(200).json({
			success: true,
			message: 'Document verified successfully.',
			metadata: {
				matches,
				validation: { matches, ocrConfidence: 99 },
				documentHash: 'dummyhash',
				age: 25,
				extractedText,
			},
		});
	} catch (err) {
		console.error('Error in /verify-document:', err);
		return res.status(500).json({ success: false, error: 'Internal server error' });
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