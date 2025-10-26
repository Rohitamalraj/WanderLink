// Test script for ZK proof generation
// Run with: node test-zk-proof.js

const axios = require('axios');

const BACKEND_URL = 'http://localhost:4000';

async function testZKProof() {
  console.log('🧪 Testing ZK Proof Generation...\n');

  const testData = {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    ageVerified: true,
    dateOfBirth: '1990-01-15'
  };

  console.log('📤 Sending request to:', `${BACKEND_URL}/api/identity/generate-zk-proof`);
  console.log('📦 Request data:', testData);
  console.log('');

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/identity/generate-zk-proof`,
      testData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('✅ SUCCESS!');
    console.log('📥 Response status:', response.status);
    console.log('📦 Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n🎉 ZK Proof generated successfully!');
      console.log('📦 CID:', response.data.cid);
      console.log('🔐 Proof:', JSON.stringify(response.data.proof, null, 2));
    }
  } catch (error) {
    console.error('❌ ERROR!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the backend running?');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testZKProof();
