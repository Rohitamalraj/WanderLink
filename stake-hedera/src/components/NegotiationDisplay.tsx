'use client';

import { Bot, CheckCircle, DollarSign, Users, TrendingDown, TrendingUp, Coins } from 'lucide-react';

export interface NegotiationResult {
  originalBudgets: { name: string; budget: number }[];
  agreedBudget: number;
  stakePercentage: number;
  stakeAmount: number;
  totalPool: number;
  coordinatorReasoning: string;
  validatorReasoning: string;
  finalReasoning: string;
}

interface NegotiationDisplayProps {
  result: NegotiationResult;
  onApprove: () => void;
  loading?: boolean;
}

export function NegotiationDisplay({ result, onApprove, loading = false }: NegotiationDisplayProps) {
  const minOriginalBudget = Math.min(...result.originalBudgets.map(b => b.budget));
  const maxOriginalBudget = Math.max(...result.originalBudgets.map(b => b.budget));

  return (
    <div className="space-y-6">
      {/* Negotiation Process */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
          <Bot className="w-7 h-7 text-purple-600" />
          AI Agent Negotiation
        </h2>

        {/* Coordinator Analysis */}
        <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                Coordinator Agent
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {result.coordinatorReasoning}
              </p>
            </div>
          </div>
        </div>

        {/* Validator Response */}
        <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Validator Agent
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {result.validatorReasoning}
              </p>
            </div>
          </div>
        </div>

        {/* Final Agreement */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                Final Agreement
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {result.finalReasoning}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final Terms */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <CheckCircle className="w-7 h-7" />
          AI-Negotiated Terms
        </h2>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm opacity-90">Agreed Trip Budget</span>
            </div>
            <div className="text-4xl font-bold">${result.agreedBudget}</div>
            <div className="mt-2 text-sm opacity-75">
              {result.agreedBudget < minOriginalBudget && (
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  Below minimum budget
                </span>
              )}
              {result.agreedBudget >= minOriginalBudget && result.agreedBudget <= maxOriginalBudget && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Within budget range
                </span>
              )}
              {result.agreedBudget > maxOriginalBudget && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Above maximum budget
                </span>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm opacity-90">Stake Per Person</span>
            </div>
            <div className="text-4xl font-bold">${result.stakeAmount}</div>
            <div className="mt-2 text-sm opacity-75 flex items-center gap-2">
              <span>{result.stakePercentage}% of ${result.agreedBudget}</span>
              <span className="opacity-50">|</span>
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3" />
                ≈ {(result.stakeAmount / 0.05).toFixed(2)} HBAR
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="font-semibold mb-4">Participant Stakes</h3>
          <div className="space-y-3">
            {result.originalBudgets.map((participant, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{participant.name}</div>
                    <div className="text-xs opacity-75">
                      Original budget: ${participant.budget}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">${result.stakeAmount}</div>
                  <div className="text-xs opacity-75">Equal stake</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
            <span className="font-semibold">Total Pool</span>
            <span className="text-2xl font-bold">${result.totalPool}</span>
          </div>
        </div>
      </div>

      {/* Commitment Terms */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
          ⚠️ Commitment Terms
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <span>Everyone stakes equal amount: <strong>${result.stakeAmount}</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <span>Trip budget capped at: <strong>${result.agreedBudget}</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <span>Must check in at trip location to get refund</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <span>No-shows forfeit their stake to attendees</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <span>Funds locked in smart contract until trip date</span>
          </li>
        </ul>
      </div>

      {/* Approve Button */}
      <button
        onClick={onApprove}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating Pool on Blockchain...
          </>
        ) : (
          <>
            <CheckCircle className="w-6 h-6" />
            Approve & Stake ${result.stakeAmount}
          </>
        )}
      </button>
    </div>
  );
}
