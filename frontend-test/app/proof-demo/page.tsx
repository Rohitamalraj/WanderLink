import { GenerateProofButton } from '../../components/GenerateProofButton';

export default function ProofDemoPage() {
  return (
    <main style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>ETH Price Proof Demo</h1>
      <p style={{ marginBottom: '2rem' }}>
        Click the button below to generate a zero-knowledge proof of the current ETH price (from CoinGecko), store it on Lighthouse, and view the proof and CID.
      </p>
      <GenerateProofButton />
    </main>
  );
}
