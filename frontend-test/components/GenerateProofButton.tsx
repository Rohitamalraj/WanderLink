"use client";
import { useState } from 'react';

export function GenerateProofButton() {
  const [cid, setCid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proof, setProof] = useState<any>(null);

  const handleGenerateProof = async () => {
    setLoading(true);
    setError('');
    setCid('');
    setProof(null);
    try {
      const res = await fetch('/api/identity/generate-eth-proof');
      const data = await res.json();
      if (data.success) {
        setCid(data.cid);
        setProof(data.proof);
      } else {
        setError(data.error || 'Failed to generate proof');
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    }
    setLoading(false);
  };

  return (
    <div style={{ margin: '2rem 0' }}>
      <button onClick={handleGenerateProof} disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
        {loading ? 'Generating Proof...' : 'Generate ETH Price Proof'}
      </button>
      {cid && (
        <div style={{ marginTop: '1rem' }}>
          <p>Proof stored on Lighthouse!</p>
          <code style={{ wordBreak: 'break-all', display: 'block', background: '#f5f5f5', padding: '0.5rem' }}>{cid}</code>
          <details style={{ marginTop: '1rem' }}>
            <summary>Show Proof JSON</summary>
            <pre style={{ maxWidth: '100%', overflowX: 'auto', background: '#f5f5f5', padding: '0.5rem' }}>{JSON.stringify(proof, null, 2)}</pre>
          </details>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
    </div>
  );
}
