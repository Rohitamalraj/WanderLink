'use client';

import { useState } from 'react';
import { Plus, X, Users, DollarSign, MapPin, Calendar } from 'lucide-react';

export interface TripParticipant {
  id: string;
  name: string;
  walletAddress: string;
  budget: number;
}

export interface TripDetails {
  tripName: string;
  tripDate: string;
  location: string;
  participants: TripParticipant[];
}

interface TripStakingFormProps {
  onSubmit: (tripDetails: TripDetails) => void;
  loading?: boolean;
}

export function TripStakingForm({ onSubmit, loading = false }: TripStakingFormProps) {
  const [tripName, setTripName] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [location, setLocation] = useState('');
  const [participants, setParticipants] = useState<TripParticipant[]>([
    { id: '1', name: '', walletAddress: '', budget: 0 },
  ]);

  const addParticipant = () => {
    setParticipants([
      ...participants,
      { id: Date.now().toString(), name: '', walletAddress: '', budget: 0 },
    ]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter(p => p.id !== id));
    }
  };

  const updateParticipant = (id: string, field: keyof TripParticipant, value: string | number) => {
    setParticipants(
      participants.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      tripName,
      tripDate,
      location,
      participants: participants.filter(p => p.name && p.budget > 0),
    });
  };

  const validParticipants = participants.filter(p => p.name && p.budget > 0);
  const minBudget = validParticipants.length > 0 ? Math.min(...validParticipants.map(p => p.budget)) : 0;
  const maxBudget = validParticipants.length > 0 ? Math.max(...validParticipants.map(p => p.budget)) : 0;
  const avgBudget = validParticipants.length > 0
    ? validParticipants.reduce((sum, p) => sum + p.budget, 0) / validParticipants.length
    : 0;

  const isValid = tripName && tripDate && location && validParticipants.length >= 2;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trip Details */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
          <MapPin className="w-5 h-5 text-purple-600" />
          Trip Details
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trip Name
            </label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g., Goa Beach Weekend"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Trip Date
              </label>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Goa, India"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
          <Users className="w-5 h-5 text-blue-600" />
          Participants & Budgets
        </h3>

        <div className="space-y-4">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className="flex gap-3 items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={participant.name}
                    onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                    placeholder={`Participant ${index + 1} Name`}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    disabled={loading}
                  />
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={participant.budget || ''}
                      onChange={(e) => updateParticipant(participant.id, 'budget', parseFloat(e.target.value) || 0)}
                      placeholder="Budget"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      disabled={loading}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={participant.walletAddress}
                  onChange={(e) => updateParticipant(participant.id, 'walletAddress', e.target.value)}
                  placeholder="Wallet Address (optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm font-mono"
                  disabled={loading}
                />
              </div>
              
              {participants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeParticipant(participant.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addParticipant}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            <Plus className="w-5 h-5" />
            Add Participant
          </button>
        </div>
      </div>

      {/* Budget Summary */}
      {validParticipants.length >= 2 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            📊 Budget Analysis
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${minBudget.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Minimum</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${avgBudget.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${maxBudget.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Maximum</div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {validParticipants.length} participants ready • Budget range: ${maxBudget - minBudget}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            AI Agents Negotiating...
          </>
        ) : (
          <>
            🤖 Let AI Agents Decide Budget & Stake
          </>
        )}
      </button>

      {!isValid && validParticipants.length < 2 && (
        <p className="text-center text-sm text-red-500">
          Add at least 2 participants with budgets to continue
        </p>
      )}
    </form>
  );
}
