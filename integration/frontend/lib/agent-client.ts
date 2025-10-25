/**
 * Agent Client Utilities
 * Helper functions for communicating with WanderLink agents
 */

export type AgentType = 'travel' | 'matchmaker' | 'planner';

export interface SendMessageOptions {
  message: string;
  agentType: AgentType;
  userId?: string;
  groupId?: string;
}

export interface AgentResponse {
  response: string;
  success: boolean;
  agentType?: string;
  timestamp?: string;
  error?: string;
}

export interface GroupStatusResponse {
  status: 'waiting' | 'in_group';
  in_group: boolean;
  message?: string;
  group?: {
    id: string;
    group_id: string;
    destination: string;
    members: string[];
    member_count: number;
    itinerary: string;
    travelers?: any[];
    created_at: string;
    status: string;
  };
  messages?: Array<{
    id: string;
    group_id: string;
    user_id: string;
    message: string;
    is_agent: boolean;
    created_at: string;
  }>;
}

/**
 * Send a message to a WanderLink agent
 */
export async function sendToAgent(options: SendMessageOptions): Promise<AgentResponse> {
  const response = await fetch('/api/agent-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Check group status for a user
 */
export async function checkGroupStatus(userId: string): Promise<GroupStatusResponse> {
  const response = await fetch(`/api/planner-listener?userId=${encodeURIComponent(userId)}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Send travel preferences to the Travel Agent
 */
export async function sendTravelPreferences(
  message: string,
  userId?: string
): Promise<AgentResponse> {
  return sendToAgent({
    message,
    agentType: 'travel',
    userId
  });
}

/**
 * Poll for group status with retry logic
 */
export async function pollForGroup(
  userId: string,
  options: {
    maxAttempts?: number;
    intervalMs?: number;
    onProgress?: (attempt: number) => void;
  } = {}
): Promise<GroupStatusResponse> {
  const {
    maxAttempts = 60, // 5 minutes with 5s intervals
    intervalMs = 5000,
    onProgress
  } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    onProgress?.(attempt);

    const status = await checkGroupStatus(userId);

    if (status.in_group) {
      return status;
    }

    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error('Timeout: Group not found after maximum attempts');
}

/**
 * Format itinerary for display
 */
export function formatItinerary(itinerary: string): string {
  // Remove excessive line breaks
  return itinerary
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract destination from message
 */
export function extractDestination(message: string): string | null {
  const patterns = [
    /(?:to|in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:trip|vacation|tour)/i
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract duration from message
 */
export function extractDuration(message: string): number | null {
  const patterns = [
    /(\d+)\s*(?:day|days)/i,
    /(\d+)\s*(?:week|weeks)/i
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      const num = parseInt(match[1]);
      // Convert weeks to days if needed
      if (message.toLowerCase().includes('week')) {
        return num * 7;
      }
      return num;
    }
  }

  return null;
}

/**
 * Validate travel message
 */
export function validateTravelMessage(message: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!message || message.trim().length === 0) {
    errors.push('Message cannot be empty');
  }

  if (message.length < 10) {
    errors.push('Message is too short. Please provide more details.');
  }

  const destination = extractDestination(message);
  if (!destination) {
    errors.push('Could not detect a destination. Please specify where you want to go.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate sample travel messages
 */
export const SAMPLE_MESSAGES = [
  'Summer vacation in Goa, 4 days',
  'adventure trip in Goa, 1 week',
  'budget friendly trip in Goa, around 4 days',
  'luxury vacation in Goa, 5 days',
  'beach holiday in Bali, 6 days',
  'cultural tour in Kyoto, 5 days',
  'hiking adventure in Nepal, 10 days',
  'city break in Paris, 3 days'
] as const;
