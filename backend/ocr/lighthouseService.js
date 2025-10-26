// backend/ocr/lighthouseService.js
// Service to upload files to Lighthouse from the backend

const lighthouse = require('@lighthouse-web3/sdk');
const fs = require('fs');

// Upload a file to Lighthouse and return the CID
async function uploadToLighthouse(filePath, apiKey, metadata = {}) {
  try {
    const file = fs.createReadStream(filePath);
    const response = await lighthouse.upload(file, apiKey, metadata);
    // response.data.Hash is the CID
    return response.data.Hash;
  } catch (error) {
    console.error('Lighthouse upload failed:', error);
    throw error;
  }
}

module.exports = { uploadToLighthouse };
