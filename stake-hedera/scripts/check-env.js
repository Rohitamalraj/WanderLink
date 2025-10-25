require('dotenv').config();

console.log('\n🔍 Checking Environment Variables...\n');

const required = [
  'HEDERA_ACCOUNT_ID',
  'HEDERA_PRIVATE_KEY',
  'VALIDATOR_ACCOUNT_ID',
  'VALIDATOR_PRIVATE_KEY'
];

const optional = [
  'OPENAI_API_KEY',
  'GROQ_API_KEY',
  'CONTRACT_ID',
  'A2A_TOPIC_ID'
];

let hasErrors = false;

console.log('📋 Required Variables:');
required.forEach(key => {
  const value = process.env[key];
  if (!value || value.includes('xxxxx') || value.includes('...') || value.includes('YOUR')) {
    console.log(`   ❌ ${key}: NOT SET (placeholder value)`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const masked = value.substring(0, 10) + '...' + value.substring(value.length - 4);
    console.log(`   ✅ ${key}: ${masked}`);
  }
});

console.log('\n📋 Optional Variables:');
optional.forEach(key => {
  const value = process.env[key];
  if (!value || value.includes('xxxxx') || value.includes('...') || value.includes('YOUR')) {
    console.log(`   ⚠️  ${key}: Not set`);
  } else {
    const masked = value.substring(0, 10) + '...' + value.substring(value.length - 4);
    console.log(`   ✅ ${key}: ${masked}`);
  }
});

if (hasErrors) {
  console.log('\n❌ Please update your .env file with actual values!\n');
  console.log('📝 Example:');
  console.log('   HEDERA_ACCOUNT_ID=0.0.1234567');
  console.log('   HEDERA_PRIVATE_KEY=0x302e020100300506032b657004220420...');
  console.log('   VALIDATOR_ACCOUNT_ID=0.0.7654321');
  console.log('   VALIDATOR_PRIVATE_KEY=0x302e020100300506032b657004220420...\n');
  process.exit(1);
} else {
  console.log('\n✅ All required variables are set!\n');
  console.log('🚀 Ready to deploy contract: npm run deploy:contract\n');
}
