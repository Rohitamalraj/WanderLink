import { NextRequest, NextResponse } from 'next/server';

// Agent addresses from environment
const TRAVEL_AGENT_ADDRESS = process.env.TRAVEL_AGENT_ADDRESS || '';
const MATCHMAKER_ADDRESS = process.env.MATCHMAKER_ADDRESS || '';
const PLANNER_ADDRESS = process.env.PLANNER_ADDRESS || '';

let clientInstance: any = null;

async function getClient() {
  if (!clientInstance) {
    const UAgentClientModule = await import('uagent-client');
    const UAgentClient = UAgentClientModule.default || UAgentClientModule;

    clientInstance = new (UAgentClient as any)({
      timeout: 60000,
      autoStartBridge: true
    });

    // Wait for bridge initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return clientInstance;
}

export async function POST(request: NextRequest) {
  try {
    const { message, agentType = 'planner', groupId, userId } = await request.json();

    console.log('🎯 Agent API called with:', { message, agentType, groupId, userId });

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    // Select the appropriate agent address based on agentType
    let agentAddress = PLANNER_ADDRESS;
    if (agentType === 'travel') {
      agentAddress = TRAVEL_AGENT_ADDRESS;
    } else if (agentType === 'matchmaker') {
      agentAddress = MATCHMAKER_ADDRESS;
    }

    console.log('📍 Selected agent address:', { agentType, agentAddress });

    if (!agentAddress) {
      console.error('❌ Agent address not configured for type:', agentType);
      return NextResponse.json(
        { error: `Agent address not configured for type: ${agentType}` },
        { status: 500 }
      );
    }

    // Get or create the uagent client
    console.log('🔌 Initializing uagent client...');
    const client = await getClient();
    console.log('✅ Client initialized');

    // Include userId in the message for tracking through agent chain
    const messageWithUserId = userId ? `${message} [USER_ID:${userId}]` : message;
    console.log('📤 Sending message to agent:', messageWithUserId);
    const result = await client.query(agentAddress, messageWithUserId);

    console.log('📥 Agent result:', result);

    if (result.success) {
      return NextResponse.json({ 
        response: result.response,
        success: true,
        agentType,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('⚠️ Agent query failed:', result.error);
      return NextResponse.json({ 
        response: 'I apologize, but I was unable to process your request at this time.',
        success: false,
        error: result.error,
        agentType
      });
    }
  } catch (error) {
    console.error('❌ Agent communication error:', error);
    return NextResponse.json(
      { 
        response: 'An error occurred while processing your request.',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
