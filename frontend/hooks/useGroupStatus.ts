import { useState, useEffect, useCallback } from 'react';
import { AgentGroup, GroupMessage } from '@/lib/supabase';

interface GroupStatusResponse {
  status: 'waiting' | 'in_group';
  in_group: boolean;
  message?: string;
  group?: AgentGroup;
  messages?: GroupMessage[];
}

interface UseGroupStatusOptions {
  userId: string;
  enabled?: boolean;
  pollInterval?: number; // in milliseconds
  onGroupFound?: (group: AgentGroup) => void;
}

export function useGroupStatus({
  userId,
  enabled = true,
  pollInterval = 5000, // Poll every 5 seconds by default
  onGroupFound
}: UseGroupStatusOptions) {
  const [data, setData] = useState<GroupStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupFound, setGroupFound] = useState(false); // Track if group was found

  const checkGroupStatus = useCallback(async () => {
    if (!userId || !enabled || groupFound) return; // Stop if group already found

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/planner-listener?userId=${encodeURIComponent(userId)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GroupStatusResponse = await response.json();
      setData(result);

      // Trigger callback if group was just found
      if (result.in_group && result.group) {
        setGroupFound(true); // Mark group as found to stop polling
        console.log('✅ Group found! Stopping polling.');
        if (onGroupFound) {
          onGroupFound(result.group);
        }
      }

    } catch (err) {
      console.error('Error checking group status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId, enabled, onGroupFound, groupFound]);

  // Initial check
  useEffect(() => {
    checkGroupStatus();
  }, [checkGroupStatus]);

  // Polling - stop if group is found
  useEffect(() => {
    if (!enabled || !userId || groupFound) return; // Stop polling if group found

    const interval = setInterval(() => {
      checkGroupStatus();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [enabled, userId, pollInterval, checkGroupStatus, groupFound]);

  return {
    data,
    loading,
    error,
    refetch: checkGroupStatus,
    inGroup: data?.in_group || false,
    group: data?.group,
    messages: data?.messages
  };
}
