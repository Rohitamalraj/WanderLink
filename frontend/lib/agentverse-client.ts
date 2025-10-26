/**
 * Agentverse Client - Frontend integration with deployed agents
 * 
 * This client communicates with your deployed agents on Fetch.ai Agentverse:
 * - TravelAgent: Receives user requests and extracts preferences
 * - MatchMakerAgent: Pools travelers and forms compatible groups
 */

export interface TripPreferences {
  destination: string
  duration: string | number
  budget: string
  travel_type: string
  group_type: string
  interests: string[]
}

export interface TripRequest {
  user_id: string
  message: string
  timestamp: string
}

export interface MatchedGroup {
  group_id: string
  members: Array<{
    user_id: string
    preferences: TripPreferences
  }>
  itinerary?: string
  similarity_score?: number
}

/**
 * Configuration for Agentverse agents
 * Your actual deployed agent addresses from Agentverse
 */
const AGENTVERSE_CONFIG = {
  // Your Travel Agent address from Agentverse
  TRAVEL_AGENT_ADDRESS: process.env.NEXT_PUBLIC_TRAVEL_AGENT_ADDRESS || 
    'agent1q0z4x0eugfdax0ww4wxrqeqwcuusga0nuwzj9ny9zfuuc6c52wfyx3t8gey',
  
  // Your MatchMaker Agent address from Agentverse
  MATCHMAKER_AGENT_ADDRESS: process.env.NEXT_PUBLIC_MATCHMAKER_AGENT_ADDRESS || 
    'agent1qdsd9mu8uhgkruel696xp532q7kuqzgc9wknnt5w5u57rg0atf5v2v5nrmt',
  
  // Agentverse API endpoint
  AGENTVERSE_API_URL: process.env.NEXT_PUBLIC_AGENTVERSE_API_URL || 
    'https://agentverse.ai/v1/api',
  
  // Your Agentverse API key (ASI-1)
  AGENTVERSE_API_KEY: process.env.NEXT_PUBLIC_AGENTVERSE_API_KEY || 
    'sk_7aa8a96be59b426695dcd1a2ee00e5807c2903f9c43b4f1c8d84d8fb52ac62a4',
}

/**
 * Send a trip request to the Travel Agent on Agentverse
 */
export async function sendTripRequestToAgent(
  userId: string, 
  nlpInput: string
): Promise<{ success: boolean; preferences?: TripPreferences; error?: string }> {
  try {
    console.log('🚀 Sending trip request to Travel Agent on Agentverse...')
    console.log('📍 Agent Address:', AGENTVERSE_CONFIG.TRAVEL_AGENT_ADDRESS)
    console.log('👤 User ID:', userId)
    console.log('💬 Message:', nlpInput)

    const tripRequest: TripRequest = {
      user_id: userId,
      message: nlpInput,
      timestamp: new Date().toISOString()
    }

    // Option 1: Use Agent Service as proxy to communicate with Agentverse agents
    const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000'
    
    const response = await fetch(`${agentServiceUrl}/api/extract-preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        nlpInput: nlpInput
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to process trip request')
    }

    const data = await response.json()
    console.log('✅ Received preferences from agent:', data.preferences)

    return {
      success: true,
      preferences: data.preferences
    }

  } catch (error: any) {
    console.error('❌ Error sending trip request to agent:', error)
    return {
      success: false,
      error: error.message || 'Failed to communicate with Travel Agent'
    }
  }
}

/**
 * Option 2: Direct communication with Agentverse (if you have REST API access)
 * This requires your agents to be set up with HTTP endpoints on Agentverse
 */
export async function sendDirectToAgentverse(
  agentAddress: string,
  message: any
): Promise<any> {
  try {
    // This is a placeholder - actual implementation depends on Agentverse's API
    // Typically you'd use their SDK or REST API
    
    const response = await fetch(`${AGENTVERSE_CONFIG.AGENTVERSE_API_URL}/agents/${agentAddress}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AGENTVERSE_CONFIG.AGENTVERSE_API_KEY}`
      },
      body: JSON.stringify(message)
    })

    if (!response.ok) {
      throw new Error('Failed to send message to agent')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending direct message to Agentverse:', error)
    throw error
  }
}

/**
 * Poll for agent responses (if using async communication)
 */
export async function pollAgentResponse(
  requestId: string,
  maxAttempts: number = 10
): Promise<any> {
  const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000'
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${agentServiceUrl}/api/agent-response/${requestId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'completed') {
          return data.result
        }
      }
      
      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Error polling agent response:', error)
    }
  }
  
  throw new Error('Timeout waiting for agent response')
}

/**
 * Get matched groups from MatchMaker Agent
 * This queries Supabase for groups that were formed by the MatchMaker
 */
export async function getMatchedGroups(
  userId: string,
  preferences: TripPreferences
): Promise<MatchedGroup[]> {
  try {
    console.log('🔍 Searching for matched groups...')
    
    const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000'
    
    // The agent service will query groups that were created by the MatchMaker
    const response = await fetch(`${agentServiceUrl}/api/find-matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        preferences: preferences
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get matched groups')
    }

    const data = await response.json()
    console.log('📊 Found matched groups:', data.matches)
    
    return data.matches || []
  } catch (error) {
    console.error('Error getting matched groups:', error)
    throw error
  }
}

/**
 * WebSocket connection to receive real-time agent updates
 * Use this if you want to receive itineraries and matches in real-time
 */
export class AgentWebSocketClient {
  private ws: WebSocket | null = null
  private userId: string
  private onMessage: (message: any) => void

  constructor(userId: string, onMessage: (message: any) => void) {
    this.userId = userId
    this.onMessage = onMessage
  }

  connect() {
    const wsUrl = process.env.NEXT_PUBLIC_AGENT_WS_URL || 'ws://localhost:8000/ws'
    
    this.ws = new WebSocket(`${wsUrl}/${this.userId}`)

    this.ws.onopen = () => {
      console.log('🔌 Connected to agent WebSocket')
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📨 Received from agent:', data)
        this.onMessage(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
    }

    this.ws.onclose = () => {
      console.log('🔌 Disconnected from agent WebSocket')
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }
}

/**
 * Helper function to format preferences for display
 */
export function formatPreferences(preferences: TripPreferences): string {
  return `
    🌍 Destination: ${preferences.destination}
    📅 Duration: ${preferences.duration}
    💰 Budget: ${preferences.budget}
    🎯 Travel Type: ${preferences.travel_type}
    👥 Group Type: ${preferences.group_type}
    ❤️ Interests: ${preferences.interests.join(', ')}
  `.trim()
}
