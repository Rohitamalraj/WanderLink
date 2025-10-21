/**
 * Example usage of the ASI Agent system
 * 
 * This demonstrates how TravelAgents negotiate and find optimal group matches
 * using the MatchMaker agent.
 */

import { TravelAgentImpl, TravelPreferences } from './TravelAgent.js';
import { MatchMakerAgent } from './MatchMakerAgent.js';

// Create sample travel preferences
const alicePreferences: TravelPreferences = {
  destination: 'Tokyo, Japan',
  startDate: new Date('2025-03-15'),
  endDate: new Date('2025-03-25'),
  budget: {
    min: 2000,
    max: 3500,
    currency: 'USD'
  },
  groupSize: {
    min: 2,
    max: 4
  },
  activities: {
    adventure: 0.6,
    culture: 0.9,
    relaxation: 0.4,
    foodie: 0.8,
    nightlife: 0.5,
    nature: 0.3
  },
  travelStyle: {
    luxury: 0.6,
    flexibility: 0.7,
    socialLevel: 0.8
  },
  constraints: {
    languages: ['English', 'Japanese'],
    mustHaveActivities: ['Temple visits', 'Food tours']
  }
};

const bobPreferences: TravelPreferences = {
  destination: 'Tokyo, Japan',
  startDate: new Date('2025-03-18'),
  endDate: new Date('2025-03-28'),
  budget: {
    min: 2500,
    max: 4000,
    currency: 'USD'
  },
  groupSize: {
    min: 2,
    max: 6
  },
  activities: {
    adventure: 0.7,
    culture: 0.8,
    relaxation: 0.3,
    foodie: 0.9,
    nightlife: 0.7,
    nature: 0.4
  },
  travelStyle: {
    luxury: 0.7,
    flexibility: 0.8,
    socialLevel: 0.9
  },
  constraints: {
    languages: ['English'],
    mustHaveActivities: ['Food tours', 'Nightlife']
  }
};

const charliePreferences: TravelPreferences = {
  destination: 'Tokyo, Japan',
  startDate: new Date('2025-03-16'),
  endDate: new Date('2025-03-24'),
  budget: {
    min: 1800,
    max: 3000,
    currency: 'USD'
  },
  groupSize: {
    min: 3,
    max: 5
  },
  activities: {
    adventure: 0.5,
    culture: 0.9,
    relaxation: 0.6,
    foodie: 0.7,
    nightlife: 0.4,
    nature: 0.5
  },
  travelStyle: {
    luxury: 0.5,
    flexibility: 0.6,
    socialLevel: 0.7
  },
  constraints: {
    languages: ['English'],
    mustHaveActivities: ['Culture', 'Photography']
  }
};

async function runMatchingDemo() {
  console.log('=== WanderLink ASI Agent Matching Demo ===\n');

  // Create agents
  const alice = new TravelAgentImpl(
    'agent-alice',
    '0x1234...alice',
    alicePreferences,
    85 // reputation score
  );

  const bob = new TravelAgentImpl(
    'agent-bob',
    '0x5678...bob',
    bobPreferences,
    90
  );

  const charlie = new TravelAgentImpl(
    'agent-charlie',
    '0x9abc...charlie',
    charliePreferences,
    75
  );

  // Create MatchMaker agent
  const matchMaker = new MatchMakerAgent({
    minGroupSize: 2,
    maxGroupSize: 4,
    minSynergyScore: 60,
    maxNegotiationRounds: 5,
    matchingAlgorithm: 'balanced'
  });

  // Register agents
  await matchMaker.registerAgent(alice);
  await matchMaker.registerAgent(bob);
  await matchMaker.registerAgent(charlie);

  console.log('\n--- Calculating Pairwise Synergy ---');
  console.log(`Alice <-> Bob: ${alice.calculateSynergy(bob)}%`);
  console.log(`Alice <-> Charlie: ${alice.calculateSynergy(charlie)}%`);
  console.log(`Bob <-> Charlie: ${bob.calculateSynergy(charlie)}%`);

  console.log('\n--- Finding Matches for Alice ---');
  const matches = await matchMaker.findMatches('agent-alice');
  
  console.log(`\nFound ${matches.length} potential matches:`);
  matches.forEach((match, idx) => {
    console.log(`\nMatch ${idx + 1}:`);
    console.log(`  - Group size: ${match.agents.length}`);
    console.log(`  - Synergy score: ${match.synergyScore}%`);
    console.log(`  - Dates: ${match.dates.start.toISOString().split('T')[0]} to ${match.dates.end.toISOString().split('T')[0]}`);
    console.log(`  - Estimated cost: $${match.estimatedCost.toFixed(2)}`);
    console.log(`  - Activities: ${match.activities.join(', ')}`);
  });

  // Select best match
  if (matches.length > 0) {
    const bestMatch = matches[0];
    console.log('\n--- Starting Negotiation ---');
    console.log(`Selected proposal ${bestMatch.id} with synergy ${bestMatch.synergyScore}%`);

    try {
      const finalProposal = await matchMaker.negotiate(bestMatch);
      
      console.log('\n✅ NEGOTIATION SUCCESSFUL!');
      console.log(`Final proposal: ${finalProposal.id}`);
      console.log(`Status: ${finalProposal.status}`);
      
      // Finalize match
      const tripId = await matchMaker.finalizeMatch(finalProposal);
      console.log(`\n🎉 Trip created: ${tripId}`);
      
    } catch (error) {
      console.log('\n❌ NEGOTIATION FAILED');
      console.log(`Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Run the demo
runMatchingDemo().catch(console.error);
