'use client';

import { useState, useEffect } from 'react';
import { useGroupStatus } from '@/hooks/useGroupStatus';
import { AgentGroup } from '@/lib/supabase';

interface GroupStatusMonitorProps {
  userId: string;
  onGroupCreated?: (group: AgentGroup) => void;
  className?: string;
}

export function GroupStatusMonitor({ 
  userId, 
  onGroupCreated,
  className = '' 
}: GroupStatusMonitorProps) {
  const [showNotification, setShowNotification] = useState(false);

  const { data, loading, error, inGroup, group, messages } = useGroupStatus({
    userId,
    enabled: true,
    pollInterval: 5000,
    onGroupFound: (foundGroup) => {
      setShowNotification(true);
      onGroupCreated?.(foundGroup);
      
      // Auto-hide notification after 10 seconds
      setTimeout(() => setShowNotification(false), 10000);
    }
  });

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-800 text-sm">
          ❌ Error checking group status: {error}
        </p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-blue-800 text-sm">Checking for group matches...</p>
        </div>
      </div>
    );
  }

  if (!inGroup) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="animate-pulse">⏳</div>
          <div>
            <p className="text-yellow-800 font-medium text-sm">
              Waiting for matches...
            </p>
            <p className="text-yellow-600 text-xs mt-1">
              We're finding the perfect travel companions for you
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (inGroup && group) {
    return (
      <>
        {/* Success Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-green-500 text-white rounded-lg shadow-lg p-4 max-w-md">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="font-bold text-lg">Group Created!</h3>
                  <p className="text-sm mt-1">
                    You've been matched for {group.destination}
                  </p>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="ml-auto text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Group Info Card */}
        <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
          <div className="flex items-start gap-4">
            <span className="text-4xl">🎉</span>
            <div className="flex-1">
              <h3 className="text-green-900 font-bold text-lg mb-2">
                Travel Group Formed!
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-800">📍 Destination:</span>
                  <span className="text-green-700">{group.destination}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-800">👥 Members:</span>
                  <span className="text-green-700">{group.member_count} travelers</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-800">🆔 Group ID:</span>
                  <span className="text-green-700 font-mono text-xs">
                    {group.group_id.substring(0, 16)}...
                  </span>
                </div>
              </div>

              {/* Itinerary Preview */}
              {group.itinerary && (
                <div className="mt-4 bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">
                    📋 Your Itinerary:
                  </h4>
                  <div className="text-sm text-gray-700 max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {group.itinerary}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages && messages.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-green-900 mb-2">
                    💬 Group Messages:
                  </h4>
                  <div className="space-y-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg text-sm ${
                          msg.is_agent
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-xs">
                            {msg.is_agent ? '🤖 Agent' : '👤 Member'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
