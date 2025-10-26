// Test Lit Protocol Connection
import { LitNodeClient } from '@lit-protocol/lit-node-client';

async function testLitConnection() {
  console.log('🔍 Testing Lit Protocol connection...\n');
  
  const networks = ['cayenne', 'datil-test', 'datil-dev'];
  
  for (const network of networks) {
    console.log(`\n📡 Trying ${network}...`);
    try {
      const client = new LitNodeClient({
        litNetwork: network,
        debug: false,
      });
      
      await client.connect();
      console.log(`✅ SUCCESS! ${network} is working!`);
      await client.disconnect();
      return network;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n\n❌ All networks failed. Lit Protocol may be down.');
}

try {
  const working = await testLitConnection();
  if (working) {
    console.log(`\n\n✅ Use this network: '${working}'`);
  }
} catch (error) {
  console.error(error);
}
