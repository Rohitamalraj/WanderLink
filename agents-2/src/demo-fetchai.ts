/**
 * Demo: Real Fetch.ai API Integration
 * 
 * This demonstrates how to use Fetch.ai Agentverse API
 * for real agent communication.
 * 
 * Setup:
 * 1. Create account at https://agentverse.ai
 * 2. Create agent and get API credentials
 * 3. Set environment variables in .env
 */

import { FetchAIAgent, FetchAITravelAgent } from './fetchai-api.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env.local' });

async function runFetchAIDemo() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     🌍 WanderLink - Real Fetch.ai API Integration           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Check environment variables
  if (!process.env.FETCHAI_API_KEY) {
    console.error('❌ FETCHAI_API_KEY not found in .env.local');
    console.log('\n📝 Setup Instructions:');
    console.log('1. Go to https://agentverse.ai');
    console.log('2. Create account and login');
    console.log('3. Create a new agent');
    console.log('4. Copy API key');
    console.log('5. Add to .env.local:\n');
    console.log('   FETCHAI_API_KEY=your_api_key_here');
    console.log('   FETCHAI_AGENT_ADDRESS=agent1q...\n');
    return;
  }

  try {
    // Initialize Fetch.ai agent
    console.log('🚀 Initializing Fetch.ai agent...\n');
    
    const fetchAgent = new FetchAIAgent({
      apiKey: process.env.FETCHAI_API_KEY,
      agentAddress: process.env.FETCHAI_AGENT_ADDRESS || 'agent1q...demo',
      network: 'testnet',
    });

    // Create Alice's travel agent
    console.log('👤 Creating Alice\'s travel agent...\n');
    
    const alice = new FetchAITravelAgent(fetchAgent, {
      destination: 'Tokyo, Japan',
      startDate: new Date('2025-03-15'),
      endDate: new Date('2025-03-25'),
      budget: {
        min: 2000,
        max: 3500,
        currency: 'USD',
      },
      groupSize: {
        min: 2,
        max: 4,
      },
      activities: {
        culture: 0.9,
        foodie: 0.8,
        adventure: 0.6,
        relaxation: 0.4,
        nightlife: 0.5,
        nature: 0.3,
      },
    });

    // Initialize agent on Agentverse
    console.log('📡 Registering on Fetch.ai Agentverse...\n');
    await alice.initialize();

    // Demo: Find other agents
    console.log('🔍 Searching for MatchMaker agents...\n');
    const matchmakers = await fetchAgent.findAgentsByProtocol('wanderlink:travel-matching:1.0');
    
    if (matchmakers.length > 0) {
      console.log(`✅ Found ${matchmakers.length} MatchMaker agent(s)`);
      console.log('   Addresses:', matchmakers.join(', '));
      
      // Request matches
      console.log('\n📤 Sending match request...\n');
      await alice.requestMatches(matchmakers[0]);
      
    } else {
      console.log('⚠️  No MatchMaker agents found yet');
      console.log('   Deploy a MatchMaker agent first or use mock demo');
    }

    // Listen for messages
    console.log('👂 Listening for match proposals...\n');
    console.log('   (Checking every 5 seconds for 1 minute)\n');
    
    let messageCount = 0;
    const listener = alice.startListening(5000);

    // Check messages for 1 minute
    setTimeout(async () => {
      clearInterval(listener);
      
      console.log('\n╔══════════════════════════════════════════════════════════════╗');
      console.log('║                    Demo Complete!                            ║');
      console.log('╚══════════════════════════════════════════════════════════════╝\n');
      
      console.log('✅ What was demonstrated:');
      console.log('   • Real Fetch.ai API connection');
      console.log('   • Agent registration on Agentverse');
      console.log('   • Protocol-based agent discovery');
      console.log('   • Message sending via API');
      console.log('   • Message polling/receiving');
      
      console.log('\n📚 Next Steps:');
      console.log('   1. Deploy MatchMaker agent on Agentverse');
      console.log('   2. Set up webhook for instant messages');
      console.log('   3. Integrate with smart contracts');
      console.log('   4. Connect frontend to agent API\n');
      
    }, 60000); // 1 minute

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 Authentication failed. Check your API key.');
    } else if (error.response?.status === 404) {
      console.log('\n🔍 Agent not found. Make sure the address is correct.');
    }
  }
}

// Alternative: Mock demo if no API key
async function runMockDemo() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         🌍 WanderLink - Mock Agent Demo                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('Running local simulation (no Fetch.ai API)...\n');
  
  // Import the mock agents
  const { TravelAgentImpl } = await import('./TravelAgent.js');
  const { MatchMakerAgent } = await import('./MatchMakerAgent.js');

  // Create agents
  const alice = new TravelAgentImpl(
    'agent-alice',
    '0x1234...alice',
    {
      destination: 'Tokyo, Japan',
      startDate: new Date('2025-03-15'),
      endDate: new Date('2025-03-25'),
      budget: { min: 2000, max: 3500, currency: 'USD' },
      groupSize: { min: 2, max: 4 },
      activities: {
        adventure: 0.6,
        culture: 0.9,
        relaxation: 0.4,
        foodie: 0.8,
        nightlife: 0.5,
        nature: 0.3,
      },
      travelStyle: {
        luxury: 0.6,
        flexibility: 0.7,
        socialLevel: 0.8,
      },
      constraints: {
        languages: ['English', 'Japanese'],
      },
    },
    85
  );

  const bob = new TravelAgentImpl(
    'agent-bob',
    '0x5678...bob',
    {
      destination: 'Tokyo, Japan',
      startDate: new Date('2025-03-18'),
      endDate: new Date('2025-03-28'),
      budget: { min: 2500, max: 4000, currency: 'USD' },
      groupSize: { min: 2, max: 6 },
      activities: {
        adventure: 0.7,
        culture: 0.8,
        relaxation: 0.3,
        foodie: 0.9,
        nightlife: 0.7,
        nature: 0.4,
      },
      travelStyle: {
        luxury: 0.7,
        flexibility: 0.8,
        socialLevel: 0.9,
      },
      constraints: {
        languages: ['English'],
      },
    },
    90
  );

  // Create MatchMaker
  const matchMaker = new MatchMakerAgent({
    minGroupSize: 2,
    maxGroupSize: 4,
    minSynergyScore: 60,
  });

  // Register agents
  await matchMaker.registerAgent(alice);
  await matchMaker.registerAgent(bob);

  console.log('--- Synergy Calculation ---');
  const synergy = alice.calculateSynergy(bob);
  console.log(`Alice <-> Bob: ${synergy}%\n`);

  console.log('--- Finding Matches ---');
  const matches = await matchMaker.findMatches('agent-alice');
  console.log(`Found ${matches.length} potential match(es)\n`);

  if (matches.length > 0) {
    const bestMatch = matches[0];
    console.log('Best Match:');
    console.log(`  Synergy: ${bestMatch.synergyScore}%`);
    console.log(`  Group size: ${bestMatch.agents.length}`);
    console.log(`  Cost: $${bestMatch.estimatedCost}\n`);

    console.log('--- Negotiation ---');
    try {
      const result = await matchMaker.negotiate(bestMatch);
      console.log('✅ Match successful!');
    } catch (error: any) {
      console.log('❌ Match failed:', error.message);
    }
  }

  console.log('\n✅ Mock demo complete!\n');
}

// Main
async function main() {
  const useRealAPI = Boolean(process.env.FETCHAI_API_KEY);

  if (useRealAPI) {
    console.log('🔑 API key found - using real Fetch.ai API\n');
    await runFetchAIDemo();
  } else {
    console.log('⚠️  No API key - running mock demo\n');
    await runMockDemo();
  }
}

main().catch(console.error);
