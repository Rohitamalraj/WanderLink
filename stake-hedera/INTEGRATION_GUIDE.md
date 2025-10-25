# Integration Guide

This guide explains how to integrate the Hedera A2A Staking application into your main project.

## Integration Options

### Option 1: API Integration (Recommended)

Use the staking service as a microservice via REST API.

#### Start the Staking Service

```bash
cd stake-hedera
npm run dev
# Runs on http://localhost:3000
```

#### Call from Your Application

```typescript
// In your main application
async function initiateStake(amount: number) {
  const response = await fetch('http://localhost:3000/api/stake', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Stake successful:', data.conversation);
    return data;
  } else {
    console.error('Stake failed:', data.error);
    throw new Error(data.error);
  }
}

// Usage
try {
  const result = await initiateStake(100);
  console.log('Status:', result.conversation.status);
  console.log('Messages:', result.conversation.messages.length);
} catch (error) {
  console.error('Error:', error);
}
```

#### Check Balance

```typescript
async function getBalance() {
  const response = await fetch('http://localhost:3000/api/balance');
  const data = await response.json();
  
  return data.balance;
}
```

### Option 2: Embed the UI

Embed the staking interface in your application using an iframe.

```html
<!-- In your main application -->
<iframe 
  src="http://localhost:3000" 
  width="100%" 
  height="800px"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

### Option 3: Import as a Module

Copy the agent libraries into your project and use them directly.

#### Step 1: Copy Files

Copy these directories to your project:
```
your-project/
  └── lib/
      ├── agents/
      ├── a2a-messaging.ts
      ├── hedera-client.ts
      └── types.ts
```

#### Step 2: Install Dependencies

```bash
npm install @hashgraph/sdk hedera-agent-kit @langchain/openai @langchain/core langchain
```

#### Step 3: Use in Your Code

```typescript
import { createHederaClient } from './lib/hedera-client';
import { A2AMessagingService } from './lib/a2a-messaging';
import { CoordinatorAgent } from './lib/agents/coordinator-agent';
import { ValidatorAgent } from './lib/agents/validator-agent';

async function stakeWithAgents(amount: number) {
  // Initialize clients
  const coordinatorClient = createHederaClient({
    accountId: process.env.HEDERA_ACCOUNT_ID!,
    privateKey: process.env.HEDERA_PRIVATE_KEY!,
  });

  const validatorClient = createHederaClient({
    accountId: process.env.VALIDATOR_ACCOUNT_ID!,
    privateKey: process.env.VALIDATOR_PRIVATE_KEY!,
  });

  // Create messaging services
  const coordinatorMessaging = new A2AMessagingService(coordinatorClient);
  const validatorMessaging = new A2AMessagingService(validatorClient);

  // Create topic
  const topicId = await coordinatorMessaging.createMessageTopic();
  validatorMessaging.setTopicId(topicId);

  // Initialize agents
  const coordinator = new CoordinatorAgent(coordinatorClient, coordinatorMessaging);
  const validator = new ValidatorAgent(validatorClient, validatorMessaging);

  // Execute staking flow
  await coordinator.initiateStakeRequest(amount, validator.getProfile().accountId);
  
  const coordinatorMessages = coordinator.getConversationHistory();
  const stakeRequest = coordinatorMessages[coordinatorMessages.length - 1];
  
  const validationResponse = await validator.processMessage(stakeRequest);
  
  if (validationResponse) {
    await coordinator.processMessage(validationResponse);
  }

  return {
    coordinator: coordinator.getConversationHistory(),
    validator: validator.getConversationHistory(),
  };
}
```

## Production Deployment

### Deploy as Separate Service

1. **Deploy to Vercel/Netlify**
   ```bash
   # Push to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   
   # Deploy on Vercel
   # Import from GitHub
   # Add environment variables
   ```

2. **Update API Endpoint in Your App**
   ```typescript
   const STAKE_API = process.env.NEXT_PUBLIC_STAKE_API || 'https://your-stake-app.vercel.app';
   
   async function initiateStake(amount: number) {
     const response = await fetch(`${STAKE_API}/api/stake`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ amount }),
     });
     return response.json();
   }
   ```

### Deploy in Same Project

1. **Copy API Routes**
   ```
   your-project/
     └── pages/api/  (or app/api/)
         ├── stake/
         │   └── route.ts
         └── balance/
             └── route.ts
   ```

2. **Copy Dependencies**
   Update your `package.json`:
   ```json
   {
     "dependencies": {
       "@hashgraph/sdk": "^2.49.0",
       "hedera-agent-kit": "latest",
       "@langchain/openai": "^0.3.0",
       "@langchain/core": "^0.3.0",
       "langchain": "^0.3.0"
     }
   }
   ```

3. **Add Environment Variables**
   Add to your `.env`:
   ```env
   HEDERA_ACCOUNT_ID=...
   HEDERA_PRIVATE_KEY=...
   VALIDATOR_ACCOUNT_ID=...
   VALIDATOR_PRIVATE_KEY=...
   OPENAI_API_KEY=...
   ```

## React Component Integration

Create a reusable React component for your app:

```typescript
// components/StakingWidget.tsx
'use client';

import { useState } from 'react';

export function StakingWidget() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleStake = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Stake failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staking-widget">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount to stake"
      />
      <button onClick={handleStake} disabled={loading}>
        {loading ? 'Processing...' : 'Stake'}
      </button>
      
      {result && (
        <div className="result">
          <p>Status: {result.conversation?.status}</p>
          <p>Messages: {result.conversation?.messages.length}</p>
        </div>
      )}
    </div>
  );
}
```

Use in your app:

```typescript
// app/page.tsx
import { StakingWidget } from '@/components/StakingWidget';

export default function Home() {
  return (
    <div>
      <h1>My Application</h1>
      <StakingWidget />
    </div>
  );
}
```

## WebSocket Integration (Real-time Updates)

For real-time agent communication updates:

```typescript
// lib/websocket-server.ts
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send updates when agents communicate
  ws.send(JSON.stringify({
    type: 'AGENT_MESSAGE',
    message: { /* A2A message */ }
  }));
});

// In your agent code
function broadcastMessage(message: A2AMessage) {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify({
      type: 'AGENT_MESSAGE',
      message,
    }));
  });
}
```

Client side:

```typescript
// In your React component
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'AGENT_MESSAGE') {
      console.log('New agent message:', data.message);
      // Update UI
    }
  };
  
  return () => ws.close();
}, []);
```

## Environment Configuration

### Development

```env
# .env.development
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=0x...
VALIDATOR_ACCOUNT_ID=0.0.xxxxx
VALIDATOR_PRIVATE_KEY=0x...
OPENAI_API_KEY=sk-proj-...
```

### Production

```env
# .env.production
HEDERA_NETWORK=mainnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=0x...
VALIDATOR_ACCOUNT_ID=0.0.xxxxx
VALIDATOR_PRIVATE_KEY=0x...
OPENAI_API_KEY=sk-proj-...
```

## Security Best Practices

### 1. API Key Management

Never expose private keys or API keys in client-side code:

```typescript
// ❌ Bad - Client side
const privateKey = '0x123...'; // Never do this!

// ✅ Good - Server side only
const privateKey = process.env.HEDERA_PRIVATE_KEY;
```

### 2. Rate Limiting

Add rate limiting to prevent abuse:

```typescript
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const stakeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many stake requests, please try again later',
});
```

### 3. Input Validation

Always validate user input:

```typescript
function validateStakeAmount(amount: number): boolean {
  if (typeof amount !== 'number') return false;
  if (amount < 10 || amount > 10000) return false;
  if (!Number.isFinite(amount)) return false;
  return true;
}
```

### 4. Error Handling

Handle errors gracefully:

```typescript
try {
  const result = await initiateStake(amount);
  return result;
} catch (error) {
  console.error('Stake error:', error);
  // Log to monitoring service
  // Return user-friendly error
  return { error: 'Staking service temporarily unavailable' };
}
```

## Monitoring and Logging

### Add Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// In your agent code
logger.info('Stake request initiated', { amount, userId });
logger.error('Stake failed', { error, amount });
```

### Monitor Hedera Transactions

```typescript
async function monitorTransaction(transactionId: string) {
  const receipt = await new TransactionReceiptQuery()
    .setTransactionId(transactionId)
    .execute(client);
    
  logger.info('Transaction completed', {
    transactionId,
    status: receipt.status.toString(),
  });
}
```

## Testing Integration

### Unit Tests

```typescript
// __tests__/stake.test.ts
import { initiateStake } from '../lib/stake';

describe('Staking Integration', () => {
  it('should stake valid amount', async () => {
    const result = await initiateStake(100);
    expect(result.conversation.status).toBe('COMPLETED');
  });

  it('should reject invalid amount', async () => {
    const result = await initiateStake(5);
    expect(result.conversation.status).toBe('REJECTED');
  });
});
```

### Integration Tests

```typescript
// __tests__/api.test.ts
import { POST } from '../app/api/stake/route';

describe('Stake API', () => {
  it('should process stake request', async () => {
    const request = new Request('http://localhost:3000/api/stake', {
      method: 'POST',
      body: JSON.stringify({ amount: 100 }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data.success).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   ```typescript
   // next.config.mjs
   const nextConfig = {
     async headers() {
       return [
         {
           source: '/api/:path*',
           headers: [
             { key: 'Access-Control-Allow-Origin', value: '*' },
             { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
           ],
         },
       ];
     },
   };
   ```

2. **Environment Variables Not Loading**
   - Restart dev server after changing `.env`
   - Check variable names match exactly
   - Use `NEXT_PUBLIC_` prefix for client-side variables

3. **Agent Timeout**
   - Increase timeout in agent configuration
   - Check OpenAI API quota
   - Verify Hedera network connectivity

## Support

For integration help:
- Check the main README.md
- Review SETUP_GUIDE.md
- Open an issue on GitHub

---

**Ready to integrate?** Start with Option 1 (API Integration) for the easiest setup! 🚀
