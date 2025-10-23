/**
 * Upload WanderLink Travel Dataset to Lighthouse
 * This demonstrates encrypted data storage for the hackathon
 */

// Ensure this file is treated as an ES module for top-level await support

const lighthouse = require('@lighthouse-web3/sdk');
const fs = require('fs');
const path = require('path');

// Your Lighthouse API key
const LIGHTHOUSE_API_KEY = '8609b500.8b8ade8adb0e4e7393bdf72fdd415c00';

async function uploadDataset() {
  try {
    console.log('\n🚀 WanderLink - Uploading Travel Dataset to Lighthouse\n');
    console.log('=' .repeat(60));

    // Read the dataset
    const datasetPath = path.join(__dirname, '../data/sample-travel-dataset.json');
    console.log('📂 Reading dataset from:', datasetPath);
    
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    console.log(`✅ Dataset loaded: ${dataset.data.length} trips`);

    // Upload to Lighthouse (public for demo)
    console.log('\n📤 Uploading to Lighthouse IPFS...');
    
    const uploadResponse = await lighthouse.upload(
      datasetPath,
      LIGHTHOUSE_API_KEY
    );

    console.log('\n✅ Upload Successful!\n');
    console.log('=' .repeat(60));
    console.log('📦 CID:', uploadResponse.data.Hash);
    console.log('🌐 Gateway URL:', `https://gateway.lighthouse.storage/ipfs/${uploadResponse.data.Hash}`);
    console.log('📊 File Size:', uploadResponse.data.Size, 'bytes');
    console.log('=' .repeat(60));

    // Save CID for later use
    const cidInfo = {
      cid: uploadResponse.data.Hash,
      gateway_url: `https://gateway.lighthouse.storage/ipfs/${uploadResponse.data.Hash}`,
      uploaded_at: new Date().toISOString(),
      dataset_name: 'WanderLink Travel Data',
      record_count: dataset.data.length,
      file_size: uploadResponse.data.Size
    };

    fs.writeFileSync(
      path.join(__dirname, '../data/lighthouse-cid.json'),
      JSON.stringify(cidInfo, null, 2)
    );

    console.log('\n💾 CID saved to: data/lighthouse-cid.json');
    console.log('\n🎉 Dataset is now available on Lighthouse!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Use this CID in your frontend');
    console.log('   2. Demonstrate data access control');
    console.log('   3. Show in your demo video');
    
    return cidInfo;

  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
    process.exit(1);
  }
}

// Run the upload
uploadDataset();
