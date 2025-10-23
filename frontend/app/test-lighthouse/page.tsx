'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { lighthouseService } from '@/lib/lighthouse-storage';

export default function TestLighthousePage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState<string>('Ready to test');
  const [logs, setLogs] = useState<string[]>([]);
  const [testData, setTestData] = useState<string>('Hello from WanderLink! This is test data for Lighthouse encryption.');
  const [uploadedCID, setUploadedCID] = useState<string>('');
  const [decryptedData, setDecryptedData] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>(process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || '');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const initializeLighthouse = async () => {
    try {
      setStatus('Initializing Lighthouse...');
      addLog('🔄 Initializing Lighthouse Storage');

      if (!apiKey) {
        throw new Error('API key is required. Get one from https://files.lighthouse.storage/');
      }

      await lighthouseService.initialize(apiKey);
      
      addLog('✅ Lighthouse initialized successfully');
      setStatus('✅ Lighthouse ready!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Initialization failed: ${errorMessage}`);
      setStatus(`❌ Failed: ${errorMessage}`);
    }
  };

  const testEncryption = async () => {
    if (!isConnected || !address || !walletClient) {
      setStatus('❌ Please connect your wallet first');
      return;
    }

    try {
      setStatus('Testing encryption...');
      addLog('🔒 Starting encryption test');

      if (!lighthouseService.isInitialized()) {
        await initializeLighthouse();
      }

      addLog('🔐 Creating wallet-based access conditions');
      const accessConditions = lighthouseService.getWalletAccessConditions(address);

      addLog('📝 Encrypting and uploading test data to Lighthouse...');
      
      const { cid, fileHash } = await lighthouseService.encryptAndUpload(
        testData,
        accessConditions,
        walletClient
      );

      addLog('✅ Data encrypted and uploaded successfully!');
      addLog(`📦 CID: ${cid}`);
      addLog(`🔑 File Hash: ${fileHash.substring(0, 20)}...`);

      setUploadedCID(cid);
      setStatus('✅ Encryption successful!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Encryption failed: ${errorMessage}`);
      setStatus(`❌ Encryption failed: ${errorMessage}`);
    }
  };

  const testDecryption = async () => {
    if (!isConnected || !address || !walletClient) {
      setStatus('❌ Please connect your wallet first');
      return;
    }

    if (!uploadedCID) {
      setStatus('❌ No encrypted data available. Please encrypt first.');
      return;
    }

    try {
      setStatus('Testing decryption...');
      addLog('🔓 Starting decryption test');

      if (!lighthouseService.isInitialized()) {
        await initializeLighthouse();
      }

      addLog('📖 Decrypting data from Lighthouse...');
      
      const decrypted = await lighthouseService.decryptAndRetrieve(
        uploadedCID,
        walletClient
      );

      addLog('✅ Data decrypted successfully!');
      addLog(`📝 Decrypted text: "${decrypted}"`);
      
      setDecryptedData(decrypted);
      setStatus('✅ Decryption successful!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Decryption failed: ${errorMessage}`);
      setStatus(`❌ Decryption failed: ${errorMessage}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setStatus('Ready to test');
    setUploadedCID('');
    setDecryptedData('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🏠 Lighthouse Storage Test Page
          </h1>
          <p className="text-gray-600 mb-4">
            Test the Lighthouse decentralized storage integration
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <ConnectButton />
            </div>
            <div className="text-sm text-gray-500">
              Storage: <span className="font-semibold text-purple-600">Lighthouse IPFS</span>
            </div>
          </div>
        </div>

        {/* API Key Input */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">🔑 API Key Configuration</h2>
          <div className="space-y-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded font-mono text-sm"
              placeholder="Enter your Lighthouse API key from https://files.lighthouse.storage/"
            />
            <button
              onClick={initializeLighthouse}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition"
            >
              Initialize Lighthouse
            </button>
            <p className="text-xs text-gray-500">
              Get your free API key from{' '}
              <a
                href="https://files.lighthouse.storage/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                https://files.lighthouse.storage/
              </a>
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Status</h2>
          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <p className="font-mono text-sm">{status}</p>
          </div>
        </div>

        {/* Test Data Input */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Test Data</h2>
          <textarea
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded font-mono text-sm"
            rows={3}
            placeholder="Enter data to encrypt..."
          />
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={testEncryption}
              disabled={!isConnected}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              🔒 Test Encryption
            </button>
            <button
              onClick={testDecryption}
              disabled={!isConnected || !uploadedCID}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              🔓 Test Decryption
            </button>
            <button
              onClick={clearLogs}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded transition"
            >
              🗑️ Clear Logs
            </button>
          </div>
        </div>

        {/* CID Display */}
        {uploadedCID && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">📦 Uploaded File</h2>
            <div className="p-4 bg-purple-50 rounded border border-purple-200">
              <p className="text-sm text-gray-600 mb-2">CID:</p>
              <p className="font-mono text-xs text-purple-800 break-all">{uploadedCID}</p>
              <a
                href={`https://gateway.lighthouse.storage/ipfs/${uploadedCID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline text-sm mt-2 inline-block"
              >
                View on Lighthouse Gateway →
              </a>
            </div>
          </div>
        )}

        {/* Results */}
        {decryptedData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">✅ Decrypted Result</h2>
            <div className="p-4 bg-green-50 rounded border border-green-200">
              <p className="font-mono text-sm text-green-800">{decryptedData}</p>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            📋 Test Logs ({logs.length})
          </h2>
          <div className="bg-gray-900 rounded p-4 h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400 text-sm">No logs yet. Click a test button to start.</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`text-sm font-mono ${
                      log.includes('❌') ? 'text-red-400' :
                      log.includes('✅') ? 'text-green-400' :
                      log.includes('⚠️') ? 'text-yellow-400' :
                      log.includes('💡') ? 'text-blue-400' :
                      'text-gray-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">ℹ️ About Lighthouse Storage</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Decentralized IPFS storage with encryption</li>
            <li>• Wallet-based access control (only you can decrypt)</li>
            <li>• No central servers - data stored on IPFS network</li>
            <li>• Perfect replacement for Lit Protocol</li>
            <li>• Integrated with WanderLink for KYC data encryption</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
