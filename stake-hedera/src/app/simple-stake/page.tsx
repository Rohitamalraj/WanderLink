'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { WalletConnect } from '@/components/WalletConnect';
import { stakingContract } from '@/lib/contract';
import { Users, Loader2, CheckCircle, ArrowLeft, Coins } from 'lucide-react';
import Link from 'next/link';

export default function SimpleStakePage() {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [hasJoined, setHasJoined] = useState(false);
  const [poolData, setPoolData] = useState<any>(null);
  const [negotiating, setNegotiating] = useState(false);
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [userBalance, setUserBalance] = useState('0');
  const [transactions, setTransactions] = useState<string[]>([]);

  const { address, isConnected, approveAgent, checkAllowance } = useWallet();

  // Check if user has already approved agent
  useEffect(() => {
    if (!address || !isConnected) return;

    const checkApproval = async () => {
      try {
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        const agentAddress = process.env.NEXT_PUBLIC_AGENT_EVM_ADDRESS;
        
        if (!contractAddress || !agentAddress) {
          console.error('Missing contract or agent address in environment');
          return;
        }
        
        console.log('Checking approval:', { contractAddress, agentAddress });

        const allowance = await checkAllowance(contractAddress, agentAddress);
        console.log('Current allowance:', allowance);
        setApproved(parseInt(allowance) > 0);
      } catch (err) {
        console.error('Failed to check allowance:', err);
      }
    };

    checkApproval();
  }, [address, isConnected, checkAllowance]);

  // Handle agent approval
  const handleApprove = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setApproving(true);
    setError('');

    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const agentAddress = process.env.NEXT_PUBLIC_AGENT_EVM_ADDRESS;

      if (!contractAddress || !agentAddress) {
        throw new Error('Contract or agent address not configured');
      }

      console.log('Approving agent:', { contractAddress, agentAddress });

      await approveAgent(contractAddress, agentAddress);
      setApproved(true);
    } catch (err: any) {
      console.error('Approval error:', err);
      setError(err.message || 'Failed to approve agent');
    } finally {
      setApproving(false);
    }
  };

  // Poll for pool status
  useEffect(() => {
    if (!hasJoined || !address) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/pool/status?wallet=${address}`);
        const data = await response.json();
        
        if (data.success && data.isParticipant) {
          setPoolData(data.pool);
          
          // Auto-trigger negotiation when 3 users join
          if (
            data.pool.participantCount >= 3 &&
            data.pool.status === 'waiting' &&
            !negotiating
          ) {
            handleAutoNegotiate();
          }
        }
      } catch (err) {
        console.error('Failed to fetch pool status:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [hasJoined, address, negotiating]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/pool/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          name,
          budget: parseFloat(budget),
          location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setHasJoined(true);
      
      // Fetch full pool data
      const poolResponse = await fetch(`/api/pool/status?wallet=${address}`);
      const poolResult = await poolResponse.json();
      if (poolResult.success) {
        setPoolData(poolResult.pool);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoNegotiate = async () => {
    // Double-check we still have 3 participants before negotiating
    const checkResponse = await fetch(`/api/pool/status?wallet=${address}`);
    const checkData = await checkResponse.json();
    
    if (!checkData.success || !checkData.pool || checkData.pool.participantCount < 3) {
      console.log('Not enough participants, skipping negotiation');
      return;
    }

    if (checkData.pool.status !== 'waiting') {
      console.log('Pool not in waiting state, skipping negotiation');
      return;
    }

    setNegotiating(true);
    setError('');

    try {
      const response = await fetch('/api/pool/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Store transactions and log to console
      if (data.transactions && data.transactions.length > 0) {
        setTransactions(data.transactions);
        console.log('\n' + '='.repeat(60));
        console.log('✅ AGENT STAKING COMPLETE!');
        console.log('='.repeat(60));
        console.log(`\n${data.transactions.length} transactions successful:\n`);
        data.transactions.forEach((tx: string, i: number) => {
          const hashscanUrl = `https://hashscan.io/testnet/transaction/${tx}`;
          console.log(`User ${i + 1}:`);
          console.log(`  Transaction Hash: ${tx}`);
          console.log(`  View on HashScan: ${hashscanUrl}\n`);
        });
        console.log('='.repeat(60) + '\n');
      }

      // Refresh pool data
      const poolResponse = await fetch(`/api/pool/status?wallet=${address}`);
      const poolResult = await poolResponse.json();
      if (poolResult.success) {
        setPoolData(poolResult.pool);
      }

    } catch (err: any) {
      console.error('Negotiation error:', err);
      setError(err.message);
    } finally {
      setNegotiating(false);
    }
  };

  const handleStake = async () => {
    if (!poolData?.negotiationResult || !address) return;

    setLoading(true);
    setError('');

    try {
      const { stakeAmountHbar } = poolData.negotiationResult;

      // Connect to contract
      await stakingContract.connect();

      // Stake
      const poolId = `pool-${Date.now()}`;
      const txHash = await stakingContract.stakeToPool(
        poolId,
        stakeAmountHbar.toFixed(8)
      );

      const hashscanUrl = process.env.NEXT_PUBLIC_HASHSCAN_URL || 'https://hashscan.io/testnet';
      alert(`✅ Staked successfully!\n\nTransaction: ${txHash}\n\nView on HashScan:\n${hashscanUrl}/transaction/${txHash}`);

      // Refresh pool
      const poolResponse = await fetch(`/api/pool/status?wallet=${address}`);
      const poolResult = await poolResponse.json();
      if (poolResult.success) {
        setPoolData(poolResult.pool);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset the pool? This will clear all participants and reload the page.')) return;

    setLoading(true);
    setError('');

    try {
      await fetch('/api/pool/reset', { method: 'POST' });
      
      // Reload the page to ensure clean state
      window.location.reload();

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Check user balance in contract
  const checkUserBalance = async () => {
    if (!address || !isConnected) return;

    try {
      await stakingContract.connect();
      const balance = await stakingContract.getUserBalance(address);
      setUserBalance(balance);
    } catch (err) {
      console.error('Failed to check balance:', err);
    }
  };

  // Withdraw stakes via API (owner-assisted)
  const handleWithdraw = async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (parseFloat(userBalance) === 0) {
      setError('No balance to withdraw');
      return;
    }

    setWithdrawing(true);
    setError('');

    try {
      console.log('Requesting withdrawal for:', address);

      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Withdrawal failed');
      }

      alert(`✅ Withdrawal successful!\n\n${data.message}\n\nAmount: ${data.amount} HBAR\nReturned to: Agent Wallet\n\nTransaction: ${data.transactionHash}\n\nView on HashScan:\n${data.hashscanUrl}`);

      // Refresh balance
      await checkUserBalance();

    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setError(err.message || 'Failed to withdraw');
    } finally {
      setWithdrawing(false);
    }
  };

  // Check balance periodically
  useEffect(() => {
    if (!address || !isConnected) return;

    checkUserBalance();
    const interval = setInterval(checkUserBalance, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [address, isConnected]);

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
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <Users className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Simple Multi-User Staking
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Just enter your name, budget, and location. When 3 users join, AI negotiates automatically!
          </p>
          
          {/* Wallet Connect */}
          <div className="mt-8 flex justify-center gap-4 items-center">
            <WalletConnect />
            {hasJoined && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all"
              >
                Reset Pool
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!hasJoined ? (
            /* Join Form */
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Enter Your Details
              </h2>

              {/* Approval Section */}
              {isConnected && !approved && (
                <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚠️ Agent Approval Required
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    Before joining, you need to approve the agent to stake on your behalf. This is a one-time approval.
                  </p>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={approving}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {approving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Approving Agent...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Approve Agent
                      </>
                    )}
                  </button>
                </div>
              )}

              {isConnected && approved && (
                <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    ✅ Agent Approved! You can now join the pool.
                  </p>
                </div>
              )}

              <form onSubmit={handleJoin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isConnected || !approved}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : !approved ? (
                    <>
                      <Users className="w-5 h-5" />
                      Approve Agent First
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      Join Pool
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Pool Status */
            <div className="space-y-6">
              {/* Waiting / Negotiating */}
              {poolData && poolData.status === 'waiting' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      {negotiating ? (
                        <>
                          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                          AI Negotiating...
                        </>
                      ) : (
                        <>
                          <Users className="w-6 h-6 text-purple-600" />
                          Waiting for Participants
                        </>
                      )}
                    </h3>
                    <span className="text-2xl font-bold text-purple-600">
                      {poolData.participantCount}/3
                    </span>
                  </div>

                  <div className="space-y-3">
                    {poolData.participants.map((p: any, i: number) => (
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
                            <div className="text-xs text-gray-500">
                              {p.location}
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

                  {poolData.participantCount < 3 && !negotiating && (
                    <div className="mt-6 text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-yellow-800 dark:text-yellow-200">
                        Waiting for {3 - poolData.participantCount} more participant(s)...
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                        Open this page in different browsers to test!
                      </p>
                    </div>
                  )}

                  {negotiating && (
                    <div className="mt-6 text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-blue-800 dark:text-blue-200 font-semibold">
                          🤖 AI Agents Working...
                        </p>
                        <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                          <p>✓ Analyzing participant budgets</p>
                          <p>✓ Negotiating fair terms</p>
                          <p className="animate-pulse">⏳ Agent staking in progress...</p>
                        </div>
                        <p className="text-xs text-blue-500 dark:text-blue-500 mt-2">
                          This may take 30-60 seconds
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-red-800 dark:text-red-200 font-semibold mb-2">Error:</p>
                      <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                      <button
                        onClick={handleReset}
                        className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all"
                      >
                        Reset Pool & Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Negotiation Result */}
              {poolData && (poolData.status === 'ready_to_stake' || poolData.status === 'completed') && poolData.negotiationResult && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <CheckCircle className="w-7 h-7" />
                      {poolData.agentStaked ? '🤖 Agent Staking Complete!' : 'AI Negotiation Complete!'}
                    </h2>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <div className="text-sm opacity-90 mb-2">Agreed Budget</div>
                        <div className="text-4xl font-bold">
                          ${poolData.negotiationResult.agreedBudget}
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <div className="text-sm opacity-90 mb-2">Your Stake</div>
                        <div className="text-4xl font-bold">
                          ${poolData.negotiationResult.stakeAmount}
                        </div>
                        <div className="text-sm opacity-75 mt-2 flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          ≈ {poolData.negotiationResult.stakeAmountHbar.toFixed(2)} HBAR
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <h3 className="font-semibold mb-2">Final Decision:</h3>
                      <p className="text-sm opacity-90">
                        {poolData.negotiationResult.finalReasoning}
                      </p>
                    </div>

                    {/* AI Agent Communication */}
                    {(poolData.negotiationResult.coordinatorReasoning || poolData.negotiationResult.validatorReasoning) && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          🤖 AI Agent Communication
                        </h3>
                        
                        {/* Coordinator Agent */}
                        {poolData.negotiationResult.coordinatorReasoning && (
                          <div className="mb-4 pb-4 border-b border-white/20">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                C
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-sm mb-1">Coordinator Agent</div>
                                <p className="text-sm opacity-90">
                                  {poolData.negotiationResult.coordinatorReasoning}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Validator Agent */}
                        {poolData.negotiationResult.validatorReasoning && (
                          <div>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                V
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-sm mb-1">Validator Agent</div>
                                <p className="text-sm opacity-90">
                                  {poolData.negotiationResult.validatorReasoning}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Transaction Hashes - Show if agent staked */}
                    {poolData.agentStaked && poolData.transactions && poolData.transactions.length > 0 && (
                      <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-6 mt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Staking Transactions (Trip ID: {poolData.tripId})
                        </h3>
                        <div className="space-y-2">
                          {poolData.transactions.map((txHash: string, i: number) => {
                            const hashscanUrl = process.env.NEXT_PUBLIC_HASHSCAN_URL || 'https://hashscan.io/testnet';
                            return (
                              <a
                                key={i}
                                href={`${hashscanUrl}/transaction/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="opacity-75">Transaction {i + 1}:</span>
                                  <span className="font-mono text-xs">{txHash.substring(0, 20)}...</span>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                        <p className="text-xs opacity-75 mt-3">
                          Click any transaction to view on HashScan
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Stake Button */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                      Ready to Stake?
                    </h3>

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
                          <Coins className="w-5 h-5" />
                          Stake {poolData.negotiationResult.stakeAmountHbar.toFixed(2)} HBAR
                        </>
                      )}
                    </button>

                    {/* Participants Status */}
                    <div className="mt-8">
                      <h4 className="font-semibold mb-4 text-gray-800 dark:text-white">
                        Staking Progress
                      </h4>
                      <div className="space-y-2">
                        {poolData.participants.map((p: any, i: number) => (
                          <div
                            key={i}
                            className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {p.name}
                              </span>
                              {poolData.status === 'completed' && transactions[i] ? (
                                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  Staked
                                </span>
                              ) : poolData.status === 'negotiating' ? (
                                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Staking...
                                </span>
                              ) : p.hasStaked ? (
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
                            {poolData.status === 'completed' && transactions[i] && (
                              <div className="mt-2 space-y-1">
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                  {transactions[i].substring(0, 10)}...{transactions[i].substring(transactions[i].length - 8)}
                                </div>
                                <a
                                  href={`https://hashscan.io/testnet/transaction/${transactions[i]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                  <span>View on HashScan</span>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Withdrawal Section */}
                    {parseFloat(userBalance) > 0 && (
                      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <h4 className="font-semibold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                          <Coins className="w-5 h-5 text-blue-600" />
                          Available Balance
                        </h4>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                              {(parseFloat(userBalance) / 1e18).toFixed(4)} HBAR
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Ready to withdraw
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleWithdraw}
                          disabled={withdrawing || parseFloat(userBalance) === 0}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {withdrawing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Withdrawing...
                            </>
                          ) : (
                            <>
                              <Coins className="w-5 h-5" />
                              Withdraw All
                            </>
                          )}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                          Withdraw your stakes after trip completion
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
