'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { WalletConnect } from '@/components/WalletConnect';
import { stakingContract, usdToHbar } from '@/lib/contract';
import { Users, Plane, ArrowLeft, Clock, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { TripSession } from '@/lib/trip-sessions';

export default function CollabTripPage() {
  const [mode, setMode] = useState<'create' | 'join' | 'waiting' | 'negotiated'>('create');
  const [sessionId, setSessionId] = useState('');
  const [session, setSession] = useState<TripSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [tripName, setTripName] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [location, setLocation] = useState('');
  const [userName, setUserName] = useState('');
  const [budget, setBudget] = useState('');
  const [joinSessionId, setJoinSessionId] = useState('');
  const [availableSessions, setAvailableSessions] = useState<any[]>([]);

  const { address, isConnected } = useWallet();

  // Load available sessions when in join mode
  useEffect(() => {
    if (mode === 'join') {
      loadAvailableSessions();
    }
  }, [mode]);

  const loadAvailableSessions = async () => {
    try {
      const response = await fetch('/api/trip-session/list');
      const data = await response.json();
      if (data.success) {
        setAvailableSessions(data.sessions.filter((s: any) => s.status === 'waiting'));
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  // Poll for session updates
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/trip-session/get?sessionId=${sessionId}`);
        const data = await response.json();
        
        if (data.success) {
          setSession(data.session);
          
          // Update mode based on session status
          if (data.session.status === 'ready_to_stake') {
            setMode('negotiated');
          }
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [sessionId]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/trip-session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripName,
          tripDate,
          location,
          walletAddress: address,
          name: userName,
          budget: parseFloat(budget),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSessionId(data.session.sessionId);
      setSession(data.session);
      setMode('waiting');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/trip-session/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: joinSessionId,
          walletAddress: address,
          name: userName,
          budget: parseFloat(budget),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSessionId(data.session.sessionId);
      setSession(data.session);
      setMode('waiting');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNegotiation = async () => {
    if (!session) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/trip-session/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Refresh session
      const sessionResponse = await fetch(`/api/trip-session/get?sessionId=${session.sessionId}`);
      const sessionData = await sessionResponse.json();
      
      if (sessionData.success) {
        setSession(sessionData.session);
        setMode('negotiated');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!session || !session.negotiationResult || !address) return;

    setLoading(true);
    setError('');

    try {
      const { stakeAmountHbar } = session.negotiationResult;

      // Connect to contract
      await stakingContract.connect();

      // Stake individual amount
      const poolId = `${session.tripName.replace(/\s+/g, '-')}-${session.sessionId}`;
      
      const txHash = await stakingContract.stakeToPool(
        poolId,
        stakeAmountHbar.toFixed(8)
      );

      // Mark user as staked
      // TODO: Call API to mark user as staked

      const hashscanUrl = process.env.NEXT_PUBLIC_HASHSCAN_URL || 'https://hashscan.io/testnet';
      alert(`Staked successfully!\n\nTransaction: ${txHash}\n\nView on HashScan: ${hashscanUrl}/transaction/${txHash}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/trip"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Solo Trip
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <Users className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Collaborative Trip Staking
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Each user connects their wallet, enters their budget, and stakes individually!
          </p>
          
          {/* Wallet Connect */}
          <div className="mt-8 flex justify-center">
            <WalletConnect />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {mode === 'create' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Create Trip Session
              </h2>

              <form onSubmit={handleCreateSession} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trip Name
                  </label>
                  <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g., Goa Beach Weekend"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Trip Date
                    </label>
                    <input
                      type="date"
                      value={tripDate}
                      onChange={(e) => setTripDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Goa, India"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g., Alice"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g., 1000"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isConnected}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Session...
                    </>
                  ) : (
                    <>
                      <Plane className="w-5 h-5" />
                      Create Trip Session
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('join')}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm"
                  >
                    Or join existing session →
                  </button>
                </div>
              </form>
            </div>
          )}

          {mode === 'join' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Join Trip Session
              </h2>

              <form onSubmit={handleJoinSession} className="space-y-6">
                {/* Available Sessions */}
                {availableSessions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Sessions
                    </label>
                    <div className="space-y-2 mb-4">
                      {availableSessions.map((session) => (
                        <button
                          key={session.sessionId}
                          type="button"
                          onClick={() => setJoinSessionId(session.sessionId)}
                          className={`w-full p-4 border rounded-lg text-left transition-all ${
                            joinSessionId === session.sessionId
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                          }`}
                        >
                          <div className="font-semibold text-gray-800 dark:text-white">
                            {session.tripName}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {session.location} • {session.tripDate}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {session.participants} participant(s) • {session.sessionId}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session ID {availableSessions.length > 0 && '(or paste manually)'}
                  </label>
                  <input
                    type="text"
                    value={joinSessionId}
                    onChange={(e) => setJoinSessionId(e.target.value)}
                    placeholder="trip_1234567890_abc123"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    required
                  />
                  {availableSessions.length === 0 && (
                    <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                      ⚠️ No active sessions found. Make sure someone created a trip first!
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g., Bob"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g., 1500"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isConnected}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      Join Trip
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('create')}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm"
                  >
                    ← Back to create session
                  </button>
                </div>
              </form>
            </div>
          )}

          {mode === 'waiting' && session && (
            <div className="space-y-6">
              {/* Session Info */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">
                  {session.tripName}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="opacity-75">Date:</span> {session.tripDate}
                  </div>
                  <div>
                    <span className="opacity-75">Location:</span> {session.location}
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/10 rounded-lg">
                  <p className="text-xs opacity-75 mb-1">Session ID (share with friends):</p>
                  <p className="font-mono text-sm break-all">{session.sessionId}</p>
                </div>
              </div>

              {/* Waiting Room */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Clock className="w-6 h-6 text-purple-600" />
                    Waiting for Participants
                  </h3>
                  <span className="text-2xl font-bold text-purple-600">
                    {session.participants.length}/{session.minParticipants}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  {session.participants.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-white">
                            {p.name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {p.walletAddress.slice(0, 6)}...{p.walletAddress.slice(-4)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800 dark:text-white">
                          ${p.budget}
                        </div>
                        <div className="text-xs text-gray-500">budget</div>
                      </div>
                    </div>
                  ))}
                </div>

                {session.participants.length >= session.minParticipants ? (
                  <button
                    onClick={handleStartNegotiation}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Starting AI Negotiation...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Start AI Negotiation
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      Waiting for {session.minParticipants - session.participants.length} more participant(s)...
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                      Share the Session ID with your friends!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'negotiated' && session && session.negotiationResult && (
            <div className="space-y-6">
              {/* Negotiation Result */}
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-6">
                  ✅ AI Negotiation Complete!
                </h2>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="text-sm opacity-90 mb-2">Agreed Trip Budget</div>
                    <div className="text-4xl font-bold">
                      ${session.negotiationResult.agreedBudget}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="text-sm opacity-90 mb-2">Your Stake</div>
                    <div className="text-4xl font-bold">
                      ${session.negotiationResult.stakeAmount}
                    </div>
                    <div className="text-sm opacity-75 mt-2">
                      ≈ {session.negotiationResult.stakeAmountHbar.toFixed(2)} HBAR
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <p className="text-sm opacity-90 mb-2">AI Reasoning:</p>
                  <p className="text-sm">{session.negotiationResult.finalReasoning}</p>
                </div>
              </div>

              {/* Stake Button */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                  Ready to Stake?
                </h3>

                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You will stake <strong>${session.negotiationResult.stakeAmount}</strong> (≈ {session.negotiationResult.stakeAmountHbar.toFixed(2)} HBAR) from your connected wallet.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleStake}
                  disabled={loading || !isConnected}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Staking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Stake {session.negotiationResult.stakeAmountHbar.toFixed(2)} HBAR
                    </>
                  )}
                </button>

                {/* Participants Status */}
                <div className="mt-8">
                  <h4 className="font-semibold mb-4 text-gray-800 dark:text-white">
                    Staking Progress
                  </h4>
                  <div className="space-y-2">
                    {session.participants.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {p.name}
                        </span>
                        {p.hasStaked ? (
                          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Staked
                          </span>
                        ) : (
                          <span className="text-yellow-600 dark:text-yellow-400">
                            Pending
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
