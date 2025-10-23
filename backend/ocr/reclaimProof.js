// backend/ocr/reclaimProof.js
// Handles zkFetch proof generation and Lighthouse upload

const { ReclaimClient } = require('@reclaimprotocol/zk-fetch');
const lighthouse = require('@lighthouse-web3/sdk');
const fs = require('fs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const appId = process.env.RECLAIM_APP_ID;
const appSecret = process.env.RECLAIM_APP_SECRET;
const lighthouseApiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

async function fetchAndStoreProof() {
  const client = new ReclaimClient(appId, appSecret);

  // Example: Prove ETH price from CoinGecko
  const proof = await client.zkFetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    {
      method: 'GET',
      headers: { accept: 'application/json' }
    },
    {
      responseMatches: [{
        type: 'regex',
        value: 'ethereum":{"usd":(?<price>.*?)}}',
      }],
      responseRedactions: [{ regex: 'ethereum":{"usd":(?<price>.*?)}}' }]
    }
  );

  // Save proof to a file (optional)
  fs.writeFileSync('proof.json', JSON.stringify(proof, null, 2));

  // Upload proof to Lighthouse
  const proofStream = fs.createReadStream('proof.json');
  const response = await lighthouse.upload(proofStream, lighthouseApiKey, { name: 'ETH Price Proof' });
  return { cid: response.data.Hash, proof };
}

module.exports = { fetchAndStoreProof };
