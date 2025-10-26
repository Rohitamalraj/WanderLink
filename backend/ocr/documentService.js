const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const PDFParse = require('pdf-parse');

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - images and pdf
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type. Only JPEG, PNG, and PDF allowed.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

async function hashDocument(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => {
      const documentHash = hash.digest('hex');
      logger.info('Document hashed successfully', { hash: documentHash });
      resolve(documentHash);
    });
    stream.on('error', (err) => {
      logger.error('Error hashing document', { error: err.message });
      reject(err);
    });
  });
}

function hashPassportNumber(passportNumber) {
  const hash = crypto.createHash('sha256').update(passportNumber).digest('hex');
  logger.info('Passport number hashed', { hash: hash.substring(0, 16) + '...' });
  return hash;
}

function hashAddress(address) {
  const normalized = address.trim().toLowerCase().replace(/\s+/g, ' ');
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');
  logger.info('Address hashed', { hash: hash.substring(0, 16) + '...' });
  return hash;
}

function dobToTimestamp(dobString) {
  const date = new Date(dobString);
  const timestamp = Math.floor(date.getTime() / 1000);
  logger.info('DOB converted to timestamp', { dob: dobString, timestamp });
  return timestamp;
}

function calculateAge(dobTimestamp) {
  const now = Math.floor(Date.now() / 1000);
  const ageSeconds = now - dobTimestamp;
  const ageYears = ageSeconds / (365.25 * 24 * 60 * 60);
  return Math.floor(ageYears);
}

function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

function hexToFelt(hexHash) {
  const cleaned = hexHash.startsWith('0x') ? hexHash.slice(2) : hexHash;
  const truncated = cleaned.substring(0, 62);
  const bigInt = BigInt('0x' + truncated);
  const felt252Max = BigInt('0x800000000000011000000000000000000000000000000000000000000000000');
  if (bigInt >= felt252Max) return (bigInt % felt252Max).toString();
  return bigInt.toString();
}

async function parseDocumentWithOCR(filePath) {
  try {
    logger.info('🔍 Starting OCR parsing...', { file: path.basename(filePath) });
    const enhancedImagePath = filePath + '.enhanced.png';
    await sharp(filePath).greyscale().normalize().sharpen().toFile(enhancedImagePath);
    const { data } = await Tesseract.recognize(enhancedImagePath, 'eng', {
      logger: (m) => { if (m.status === 'recognizing text') logger.info(`OCR Progress: ${Math.round(m.progress * 100)}%`); }
    });
    if (fs.existsSync(enhancedImagePath)) fs.unlinkSync(enhancedImagePath);
    logger.info('✅ OCR parsing completed', { confidence: data.confidence, textLength: data.text.length });
    return { text: data.text, confidence: data.confidence, lines: data.lines.map(l => l.text), words: data.words.map(w => w.text) };
  } catch (error) {
    logger.error('❌ OCR parsing failed', { error: error.message });
    throw new Error(`OCR parsing failed: ${error.message}`);
  }
}

async function parsePDFDocument(filePath) {
  try {
    logger.info('📄 Parsing PDF document...', { file: path.basename(filePath) });
    const dataBuffer = fs.readFileSync(filePath);
    const result = await PDFParse(dataBuffer);
    logger.info('✅ PDF parsing completed', { textLength: result.text.length });
    return { text: result.text, pages: result.numpages || null, lines: result.text.split('\n').filter(l => l.trim()) };
  } catch (error) {
    logger.error('❌ PDF parsing failed', { error: error.message });
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

// Reuse extraction and validation logic from user's provided code (trimmed for brevity)
function extractIdentityData(parsedData) {
  // (Copy the extraction implementation from the provided code)
  const text = parsedData.text || '';
  const lines = parsedData.lines || [];
  const extracted = { passportNumbers: [], addresses: [], dates: [], names: [] };
  const passportPatterns = [/\b[A-Z]{1,2}\d{6,9}\b/g, /\b\d{9}\b/g, /\b[A-Z]\d{7}\b/g, /\b[A-Z]{2}\d{7}\b/g, /\b[A-Z0-9]{6,10}\b/g];
  passportPatterns.forEach(p => { const m = text.match(p); if (m) extracted.passportNumbers.push(...m); });
    // Accept common separators and also space-separated dates (OCR may remove separators)
    const datePatterns = [/(\d{1,2})[\.\/\-\s]{1,3}(\d{1,2})[\.\/\-\s]{1,3}(\d{4})/g, /(\d{4})[\.\/\-\s]{1,3}(\d{1,2})[\.\/\-\s]{1,3}(\d{1,2})/g];
  const dobKeywords = ['birth', 'dob', 'date of birth', 'born', 'd.o.b'];
  const currentYear = new Date().getFullYear();
  lines.forEach((line, idx) => {
    const lowerLine = line.toLowerCase();
    const hasDOBKeyword = dobKeywords.some(k => lowerLine.includes(k));
    if (hasDOBKeyword) {
      const context = [line, lines[idx+1]||'', lines[idx+2]||''].join(' ');
      datePatterns.forEach(p => { const m = context.match(p); if (m) m.forEach(ds => { const parsed = parseDate(ds); if (parsed) { const y = parsed.getFullYear(); if (y>=1900 && y<=2010 && y<currentYear) extracted.dates.push(ds); } }); });
    }
  });
  if (extracted.dates.length === 0) {
    datePatterns.forEach(p => { const m = text.match(p); if (m) m.forEach(ds => { const parsed = parseDate(ds); if (parsed) { const y = parsed.getFullYear(); if (y>=1900 && y<=2010) extracted.dates.push(ds); } }); });
  }
  function parseDate(dateStr) {
    try {
      const cleaned = dateStr.replace(/\.([\/\-])/g, '$1').replace(/\.\./g,'.');
      const formats = [/^(\d{1,2})[\.\/\-](\d{1,2})[\.\/\-](\d{4})$/, /^(\d{4})[\.\/\-](\d{1,2})[\.\/\-](\d{1,2})$/];
      for (const fmt of formats) {
        const match = cleaned.match(fmt);
        if (match) {
          if (match[1].length === 4) return new Date(match[1], match[2]-1, match[3]);
          return new Date(match[3], match[2]-1, match[1]);
        }
      }
      return new Date(cleaned);
    } catch { return null; }
  }
  const addressKeywords = ['street','st','avenue','ave','road','rd','lane','ln','drive','dr','city','state','zip','pin','postal','address','addr','no:','building','apartment','apt','floor','nagar','colony','sector','block'];
  lines.forEach((line, idx) => {
    const lowerLine = line.toLowerCase();
    const trimmed = line.trim();
    if (trimmed.length<10 || trimmed.replace(/[^a-zA-Z0-9]/g,'').length<5) return;
    const hasKeyword = addressKeywords.some(k => lowerLine.includes(k));
    const hasNumbers = /\d/.test(trimmed);
    const hasComma = trimmed.includes(',');
    if (hasKeyword || (hasNumbers && hasComma)) {
      extracted.addresses.push(trimmed);
      if (idx+1 < lines.length) { const next = lines[idx+1].trim(); if (next.length>5 && !extracted.addresses.includes(next)) extracted.addresses.push(next); }
    }
  });
  const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
  const nameMatches = text.match(namePattern);
  if (nameMatches && nameMatches.length>0) extracted.names = nameMatches.slice(0,5);
  logger.info('📋 Extraction results:', { passportNumbers: extracted.passportNumbers.length, dates: extracted.dates.length, addresses: extracted.addresses.length, names: extracted.names.length });
  return extracted;
}

function validateDocumentData(userInput, extractedData, parsedData, minConfidence = 60) {
  // (Simplified copy of validation from provided code)
  logger.info('🔐 Validating document data against user inputs...');
  const validationResult = { isValid: false, confidence: parsedData.confidence || 100, errors: [], warnings: [], matches: {} };
  if (parsedData.confidence && parsedData.confidence < minConfidence) validationResult.warnings.push(`OCR confidence is low (${Math.round(parsedData.confidence)}%).`);
  if (userInput.passportNumber) {
    const inputPassport = userInput.passportNumber.trim().toUpperCase().replace(/[\s-]/g,'');
    let found = extractedData.passportNumbers.some(ex => { const c = ex.toUpperCase().replace(/[\s-]/g,''); return c===inputPassport || c.includes(inputPassport) || inputPassport.includes(c); });
    if (!found) {
  const levenshtein = (a,b)=>{ const matrix = Array(b.length+1).fill(null).map(()=>Array(a.length+1).fill(0)); for(let i=0;i<=a.length;i++) matrix[0][i]=i; for(let j=0;j<=b.length;j++) matrix[j][0]=j; for(let j=1;j<=b.length;j++){ for(let i=1;i<=a.length;i++){ const cost = a[i-1]===b[j-1]?0:1; matrix[j][i]=Math.min(matrix[j][i-1]+1, matrix[j-1][i]+1, matrix[j-1][i-1]+cost);} } return matrix[b.length][a.length]; };
  // Allow slightly higher OCR error tolerance (up to 30% or max 3 chars)
  const maxErrors = Math.min(3, Math.max(1, Math.floor(inputPassport.length*0.3)));
      found = extractedData.passportNumbers.some(ex => { const c = ex.toUpperCase().replace(/[\s-]/g,''); const d = levenshtein(inputPassport,c); if (d<=maxErrors) { logger.info('✅ Passport matched with fuzzy matching',{input:inputPassport,extracted:c,distance:d}); return true;} return false; });
    }
    if (found) validationResult.matches.passport = true; else if (extractedData.passportNumbers.length>0) validationResult.errors.push(`Passport number mismatch. Provided: ${inputPassport}, Found: ${extractedData.passportNumbers.join(', ')}`); else validationResult.warnings.push('Could not extract passport number from document.');
  }
  if (userInput.dateOfBirth && extractedData.dates.length>0) {
    const inputDOB = new Date(userInput.dateOfBirth); const iy = inputDOB.getFullYear(); const im = inputDOB.getMonth(); const id = inputDOB.getDate();
    const parseDateString = (s)=>{ try{ const cleaned = s.replace(/\.\//g,'/').replace(/\.\./g,'.').trim(); const fmts=[/^(\d{1,2})[\.\/\-](\d{1,2})[\.\/\-](\d{4})$/,/^(\d{4})[\.\/\-](\d{1,2})[\.\/\-](\d{1,2})$/]; for(const f of fmts){ const m=cleaned.match(f); if(m){ if(m[1].length===4) return new Date(m[1],m[2]-1,m[3]); return new Date(m[3],m[2]-1,m[1]); } } return new Date(cleaned);}catch{return null;} };
    const dateFound = extractedData.dates.some(dateStr=>{ const extractedDate = parseDateString(dateStr); if(!extractedDate||isNaN(extractedDate.getTime())) { logger.warn('⚠ Could not parse date', { dateStr }); return false; } const yearMatch = extractedDate.getFullYear()===iy; const monthMatch = extractedDate.getMonth()===im; const dayDiff = Math.abs(extractedDate.getDate()-id); const isMatch = yearMatch && monthMatch && dayDiff<=1; if(isMatch) logger.info('✅ DOB matched',{input:userInput.dateOfBirth,extracted:dateStr}); else logger.debug('❌ DOB no match',{dateStr,extractedYear:extractedDate.getFullYear(),extractedMonth:extractedDate.getMonth(),extractedDay:extractedDate.getDate(),inputYear:iy,inputMonth:im,inputDay:id,yearMatch,monthMatch,dayDiff}); return isMatch; });
    if (dateFound) validationResult.matches.dateOfBirth = true; else { validationResult.errors.push(`Date of birth MISMATCH. Input: ${userInput.dateOfBirth}, Document dates: ${extractedData.dates.join(', ')}`); logger.error('❌ DOB validation FAILED',{input:userInput.dateOfBirth,extracted:extractedData.dates}); }
  }
  if (userInput.address && extractedData.addresses.length>0) {
    const cleanAddress = (addr)=> addr.toLowerCase().replace(/[^\w\s]/g,' ').replace(/\s+/g,' ').trim();
    const inputAddressClean = cleanAddress(userInput.address);
    const inputWords = inputAddressClean.split(/\s+/).filter(w=>w.length>2).map(w=>w.replace(/\d+/g,''));
    const inputNumbers = userInput.address.match(/\d+/g)||[];
    const allExtractedText = extractedData.addresses.join(' ').toLowerCase();
    const cleanExtractedText = cleanAddress(allExtractedText);
    const wordMatchCount = inputWords.filter(word=> cleanExtractedText.includes(word) || cleanExtractedText.split(/\s+/).some(extractedWord=> extractedWord.includes(word) || word.includes(extractedWord))).length;
    const numberMatchCount = inputNumbers.filter(num=> allExtractedText.includes(num)).length;
    const wordScore = inputWords.length>0 ? wordMatchCount/inputWords.length : 0;
    const numberScore = inputNumbers.length>0 ? numberMatchCount/inputNumbers.length : 1;
    const bestMatchScore = (wordScore*0.7)+(numberScore*0.3);
    if (bestMatchScore>=0.5) { validationResult.matches.address=true; logger.info('✅ Address validated',{matchScore:Math.round(bestMatchScore*100)+'%'}); } else { validationResult.errors.push(`Address MISMATCH (only ${Math.round(bestMatchScore*100)}% match). Input: "${userInput.address}", Extracted: "${extractedData.addresses[0]||'none'}"`); logger.error('❌ Address validation FAILED',{input:userInput.address,bestMatch:extractedData.addresses[0],matchScore:Math.round(bestMatchScore*100)+'%'}); }
  }
  const matchCount = Object.values(validationResult.matches).filter(Boolean).length;
  const errorCount = validationResult.errors.length;

  const provided = {
    passport: !!userInput.passportNumber,
    dateOfBirth: !!userInput.dateOfBirth,
    address: !!userInput.address
  };

  // If DOB was provided and failed, it's a critical failure
  if (provided.dateOfBirth && !validationResult.matches.dateOfBirth) {
    validationResult.isValid = false;
    validationResult.errors.push('Date of birth does not match document');
    logger.error('❌ Document validation FAILED - DOB mismatch', { errors: validationResult.errors });
    return validationResult;
  }

  // If DOB matched (or not provided), require at least one of passport or address to match
  if (provided.dateOfBirth && validationResult.matches.dateOfBirth) {
    // Require either passport or address match
    if ((provided.passport && validationResult.matches.passport) || (provided.address && validationResult.matches.address)) {
      validationResult.isValid = true;
      logger.info('✅ Document validation PASSED (DOB + another field matched)', { matches: validationResult.matches });
      return validationResult;
    }

    // If DOB matched but neither passport nor address matched, it's a failure
    validationResult.isValid = false;
    validationResult.errors.push('Date of birth matched but passport/address did not match sufficiently');
    logger.error('❌ Document validation FAILED - DOB matched but other fields did not', { matches: validationResult.matches });
    return validationResult;
  }

  // Fallback: if DOB not provided, fall back to strict rule: all provided fields must match
  const requiredFields = Object.values(provided).filter(Boolean).length;
  if (errorCount > 0) {
    validationResult.isValid = false;
    logger.error('❌ Document validation FAILED - Critical field mismatch', { errors: errorCount, matches: matchCount, required: requiredFields });
    return validationResult;
  }

  if (matchCount === requiredFields) {
    validationResult.isValid = true;
    logger.info('✅ Document validation PASSED - All fields verified', { matches: matchCount });
    return validationResult;
  }

  validationResult.isValid = false;
  validationResult.errors.push(`Incomplete validation: Only ${matchCount}/${requiredFields} fields verified`);
  logger.error('❌ Document validation FAILED - Incomplete verification', { matches: matchCount, required: requiredFields });
  return validationResult;
}

async function processIdentityDocument(formData, documentPath, walletAddress) {
  try {
    logger.info('🔐 Processing identity document', { wallet: walletAddress });
    const enableOCR = process.env.ENABLE_OCR !== 'false';
    let parsedData=null, extractedData=null, validation=null;
    if (enableOCR) {
      try {
        const ext = path.extname(documentPath).toLowerCase();
        if (ext === '.pdf') parsedData = await parsePDFDocument(documentPath);
        else parsedData = await parseDocumentWithOCR(documentPath);
        if (parsedData && parsedData.text && parsedData.text.trim().length>=50) {
          extractedData = extractIdentityData(parsedData);
          validation = validateDocumentData(formData, extractedData, parsedData);
          if (!validation.isValid) {
            logger.error('❌ OCR validation failed - REJECTING', { errors: validation.errors, warnings: validation.warnings, wallet: walletAddress });
            if (fs.existsSync(documentPath)) { fs.unlinkSync(documentPath); logger.info('Document deleted due to validation failure', { path: documentPath }); }
            const e = new Error('DOCUMENT VALIDATION FAILED');
            e.details = validation;
            throw e;
          }
        } else {
          logger.error('❌ OCR parsing returned insufficient text - REJECTING'); if (fs.existsSync(documentPath)) fs.unlinkSync(documentPath); throw new Error('Document could not be read properly.');
        }
      } catch (ocrErr) {
        if (ocrErr.message && ocrErr.message.includes('DOCUMENT VALIDATION FAILED')) throw ocrErr;
        logger.error('❌ Unexpected OCR processing error', { error: ocrErr.message, wallet: walletAddress }); if (fs.existsSync(documentPath)) fs.unlinkSync(documentPath); throw new Error('Document validation failed');
      }
    }
    const documentPhotoHash = await hashDocument(documentPath);
    const passportHash = hashPassportNumber(formData.passportNumber);
    const addressHash = hashAddress(formData.address);
    const dobTimestamp = dobToTimestamp(formData.dateOfBirth);
    const age = calculateAge(dobTimestamp);
    if (age < 18) throw new Error(`Age verification failed. Must be 18+. Current age: ${age}`);
    const salt = generateSalt();
    const currentTimestamp = Math.floor(Date.now()/1000);
    const zkInputs = {
      passport_number: hexToFelt(passportHash),
      address_hash: hexToFelt(addressHash),
      dob_timestamp: dobTimestamp.toString(),
      document_photo_hash: hexToFelt(documentPhotoHash),
      salt: hexToFelt(salt),
      wallet_address: hexToFelt(walletAddress),
      current_timestamp: currentTimestamp.toString(),
      age: age,
      verified: age>=18
    };
    return { success:true, zkInputs, metadata: { age, documentHash: documentPhotoHash, passportHash, addressHash, timestamp: currentTimestamp, validation: validation ? { ocrConfidence: parsedData.confidence||null, matches: validation.matches||{}, warnings: validation.warnings||[] } : { ocrConfidence: null, matches:{}, warnings:['OCR skipped'] } } };
  } catch (error) {
    logger.error('❌ Error processing identity document', { error: error.message }); throw error;
  }
}

function deleteDocument(filePath) { try{ if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); logger.info('Document deleted', { path: filePath }); } } catch (err) { logger.error('Error deleting document', { error: err.message }); } }

module.exports = {
  upload,
  hashDocument,
  hashPassportNumber,
  hashAddress,
  dobToTimestamp,
  calculateAge,
  generateSalt,
  hexToFelt,
  parseDocumentWithOCR,
  parsePDFDocument,
  extractIdentityData,
  validateDocumentData,
  processIdentityDocument,
  deleteDocument
};
/* eslint-disable @typescript-eslint/no-require-imports */