'use client';

import { useState } from 'react';
import { MessageSquare, Bot, CheckCircle, XCircle, Loader2, Coins, Plane, Users } from 'lucide-react';
import { AgentConversation, A2AMessage } from '@/lib/types';
import { WalletConnect } from '@/components/WalletConnect';
import { useWallet } from '@/hooks/useWallet';
import Link from 'next/link';

export default function Home() {
  const [amount, setAmount] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<AgentConversation | null>(null);
  const [error, setError] = useState<string>('');
  const [summary, setSummary] = useState<any>(null);
  
  // Wallet connection
  const { address, isConnected } = useWallet();

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setConversation(null);

    try {
      const response = await fetch('/api/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(amount),
          location: location || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process stake');
      }

      setConversation(data.conversation);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getMessageIcon = (type: A2AMessage['type']) => {
    switch (type) {
      case 'STAKE_REQUEST':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'STAKE_COUNTER_OFFER':
        return <Bot className="w-5 h-5 text-orange-500" />;
      case 'STAKE_NEGOTIATION':
        return <Bot className="w-5 h-5 text-purple-500" />;
      case 'STAKE_APPROVAL':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'STAKE_REJECTION':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'STAKE_CONFIRMATION':
        return <Coins className="w-5 h-5 text-yellow-500" />;
      case 'LOCATION_VERIFICATION':
        return <MessageSquare className="w-5 h-5 text-cyan-500" />;
      case 'FUNDS_RELEASE':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: AgentConversation['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'VALIDATING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Bot className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Hedera A2A Staking
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Multi-agent communication using A2A standard with Hedera Agent Kit
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Coordinator Agent
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Validator Agent
            </span>
          </div>
          
          {/* Wallet Connect */}
          <div className="mt-8 flex justify-center">
            <WalletConnect />
          </div>

          {/* Trip Staking Links */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/trip"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all shadow-lg"
            >
              <Plane className="w-5 h-5" />
              Solo Trip
            </Link>
            <Link
              href="/simple-stake"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all shadow-lg"
            >
              <Users className="w-5 h-5" />
              Simple Multi-User ⭐
            </Link>
            <Link
              href="/collab-trip"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all text-sm"
            >
              Collab Trip (Advanced)
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Multi-user trip planning with AI-negotiated budgets
          </p>
        </div>

        {/* Staking Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center justify-between">
              <span>Initiate Staking Request</span>
              {isConnected && address && (
                <span className="text-sm font-normal text-green-500">
                  Wallet Connected
                </span>
              )}
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (HBAR)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to stake"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                  disabled={loading}
                  min="0"
                  step="0.01"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Recommended: 10 - 10,000 HBAR. Try 1000 HBAR to see negotiation!
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location (Optional - for escrow release)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., New York"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                  disabled={loading}
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Funds will be locked in escrow until location is verified
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleStake}
                disabled={loading || !amount}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing A2A Communication...
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5" />
                    Start Agent Communication
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Conversation Display */}
        {conversation && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Agent Conversation
                </h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(conversation.status)}`}>
                  {conversation.status}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                {conversation.messages.map((message, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getMessageIcon(message.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {message.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p className="mb-1">
                            <strong>From:</strong> {message.from.substring(0, 10)}...
                          </p>
                          <p className="mb-2">
                            <strong>To:</strong> {message.to.substring(0, 10)}...
                          </p>
                          <div className="bg-white dark:bg-gray-800 rounded p-3 mt-2">
                            <pre className="text-xs overflow-x-auto">
                              {JSON.stringify(message.payload, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Requested</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {summary?.requestedAmount || amount} HBAR
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Final Amount</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {summary?.finalAmount || amount} HBAR
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Messages</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {conversation.messages.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {conversation.status}
                  </p>
                </div>
              </div>

              {summary?.escrowAccountId && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    🔒 Escrow Information
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    <strong>Account:</strong> {summary.escrowAccountId}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    <strong>Location Required:</strong> {summary.location || 'None'}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Funds locked until location verification
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <MessageSquare className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              A2A Messaging
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Agents communicate using the A2A standard via Hedera Consensus Service
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <Bot className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              AI-Powered Validation
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              LLM-based agents analyze and validate staking requests autonomously
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <Coins className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Hedera Integration
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Built with Hedera Agent Kit for seamless blockchain interactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
