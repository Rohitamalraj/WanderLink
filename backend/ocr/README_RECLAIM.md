# Reclaim zkFetch Integration (Backend)

## How it works
- Calls zkFetch to generate a proof of ETH price from CoinGecko
- Uploads the proof to Lighthouse
- Returns the Lighthouse CID and proof object

## Usage

1. **Environment Variables**
   - Set `RECLAIM_APP_ID` and `RECLAIM_APP_SECRET` in `.env` (already done)
   - Set `NEXT_PUBLIC_LIGHTHOUSE_API_KEY` in `.env` (already done)

2. **Install dependencies**
   - In `backend/`:
     ```sh
     npm install @reclaimprotocol/zk-fetch @lighthouse-web3/sdk
     node node_modules/@reclaimprotocol/zk-fetch/scripts/download-files
     ```

3. **API Endpoint**
   - `GET /api/identity/generate-eth-proof`
   - Triggers proof generation and upload, returns `{ success, cid, proof }`

4. **On-chain**
   - Use the returned `proof` with `transformForOnchain` from `@reclaimprotocol/js-sdk` to send to your smart contract.

---

**This makes your project eligible for the Lighthouse track with a real-world data proof!**
