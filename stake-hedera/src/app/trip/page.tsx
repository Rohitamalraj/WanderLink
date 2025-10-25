'use client';

import { useState } from 'react';
import { TripStakingForm, TripDetails } from '@/components/TripStakingForm';
import { NegotiationDisplay, NegotiationResult } from '@/components/NegotiationDisplay';
import { WalletConnect } from '@/components/WalletConnect';
import { useWallet } from '@/hooks/useWallet';
import { stakingContract, usdToHbar } from '@/lib/contract';
import { Plane, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TripPage() {
  const [loading, setLoading] = useState(false);
  const [negotiationResult, setNegotiationResult] = useState<NegotiationResult | null>(null);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [stakingStatus, setStakingStatus] = useState<string>('');
  const { isConnected, address } = useWallet();

  const handleTripSubmit = async (trip: TripDetails) => {
    setLoading(true);
    setError('');
    setNegotiationResult(null);

    try {
      const response = await fetch('/api/trip-negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripName: trip.tripName,
          tripDate: trip.tripDate,
          location: trip.location,
          participants: trip.participants,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to negotiate trip terms');
      }

      setNegotiationResult(data.negotiation);
      setTripDetails(trip);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!negotiationResult || !tripDetails || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');
    setTxHash('');
    setStakingStatus('');

    try {
      // Step 1: Convert USD to HBAR (approximate rate: $1 = 20 HBAR)
      const hbarPrice = 0.05; // $0.05 per HBAR
      const stakeInHbar = usdToHbar(negotiationResult.stakeAmount, hbarPrice);
      
      setStakingStatus('Converting USD to HBAR...');
      console.log(`Converting $${negotiationResult.stakeAmount} to ${stakeInHbar.toFixed(2)} HBAR`);

      // Step 2: Generate pool ID
      const poolId = `${tripDetails.tripName.replace(/\s+/g, '-')}-${Date.now()}`;
      
      setStakingStatus('Preparing pool creation...');

      // Step 3: Prepare participants (for now, just the current user)
      // In production, all participants would stake separately
      const participants = tripDetails.participants.map(p => ({
        address: p.walletAddress || address, // Use connected wallet if no address provided
        amount: stakeInHbar.toFixed(8), // Amount in HBAR
        location: tripDetails.location,
      }));

      console.log('Pool participants:', participants);

      // Step 4: Connect to contract and create pool
      setStakingStatus('Connecting to smart contract...');
      await stakingContract.connect();

      setStakingStatus('Creating pool on blockchain...\n\nPlease confirm the transaction in MetaMask');

      // Step 5: Create pool on contract
      const transactionHash = await stakingContract.createPool({
        poolId,
        participants,
        tripDate: tripDetails.tripDate,
        tripLocation: tripDetails.location,
      });

      setTxHash(transactionHash);
      setStakingStatus('Pool created successfully!');

      // Step 6: Save pool info to backend
      await fetch('/api/create-pool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId,
          participants: tripDetails.participants,
          tripDate: tripDetails.tripDate,
          tripLocation: tripDetails.location,
          transactionHash,
        }),
      });

      console.log('Pool created successfully:', {
        poolId,
        transactionHash,
        participants: participants.length,
      });

    } catch (err: any) {
      console.error('Staking error:', err);
      setError(err.message || 'Failed to create pool');
      setStakingStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNegotiationResult(null);
    setTripDetails(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Single Stake
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <Plane className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              WanderLink Trip Staking
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Plan trips with friends. AI agents negotiate fair budgets & stakes. Everyone commits or loses their stake!
          </p>
          
          {/* Wallet Connect */}
          <div className="mt-8 flex justify-center">
            <WalletConnect />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!negotiationResult ? (
            <>
              {/* Trip Form */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                  Create Trip Pool
                </h2>
                <TripStakingForm onSubmit={handleTripSubmit} loading={loading} />
              </div>

              {error && (
                <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* How It Works */}
              <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                  🤔 How It Works
                </h3>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <strong className="text-gray-800 dark:text-white">Add Participants & Budgets</strong>
                      <p className="text-sm">Each person enters their preferred trip budget</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <strong className="text-gray-800 dark:text-white">AI Agents Negotiate</strong>
                      <p className="text-sm">Coordinator & Validator agents decide fair budget & stake percentage</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <strong className="text-gray-800 dark:text-white">Everyone Stakes Equal Amount</strong>
                      <p className="text-sm">All participants stake the same dollar amount (% of agreed budget)</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <strong className="text-gray-800 dark:text-white">Funds Locked in Escrow</strong>
                      <p className="text-sm">Smart contract holds stakes until trip date</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      5
                    </div>
                    <div>
                      <strong className="text-gray-800 dark:text-white">Location Verification</strong>
                      <p className="text-sm">Validator checks who actually attended the trip</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      6
                    </div>
                    <div>
                      <strong className="text-gray-800 dark:text-white">Reward Attendees</strong>
                      <p className="text-sm">Attendees get refund + bonus from no-shows!</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Negotiation Result */}
              <NegotiationDisplay
                result={negotiationResult}
                onApprove={handleApprove}
                loading={loading}
              />

              {/* Staking Status */}
              {stakingStatus && (
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-200 whitespace-pre-line">{stakingStatus}</p>
                </div>
              )}

              {/* Transaction Hash */}
              {txHash && (
                <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    ✅ Pool Created Successfully!
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Transaction Hash:
                  </p>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all bg-white dark:bg-gray-800 p-2 rounded">
                    {txHash}
                  </p>
                  <a
                    href={`${process.env.NEXT_PUBLIC_HASHSCAN_URL || 'https://hashscan.io/testnet'}/transaction/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    View on HashScan →
                  </a>
                </div>
              )}

              {error && (
                <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Start Over Button */}
              <button
                onClick={handleReset}
                className="mt-6 w-full py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:border-purple-500 hover:text-purple-500 dark:hover:border-purple-400 dark:hover:text-purple-400 transition-colors"
              >
                ← Start New Trip
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
