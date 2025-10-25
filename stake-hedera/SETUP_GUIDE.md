# Complete Setup Guide

This guide will walk you through setting up the Hedera A2A Staking Application from scratch.

## Prerequisites

### 1. Install Node.js

Download and install Node.js 18 or higher from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version  # Should be v18.0.0 or higher
npm --version
```

### 2. Create Hedera Testnet Accounts

You need **TWO** Hedera testnet accounts (one for each agent).

1. Go to [Hedera Portal](https://portal.hedera.com/dashboard)
2. Sign up or log in
3. Create your first testnet account:
   - Click "Create Account"
   - Select "Testnet"
   - Save your Account ID (e.g., `0.0.12345`)
   - Save your Private Key (starts with `0x...`)
4. Repeat to create a second account

**Important**: Keep these credentials safe! You'll need them for the `.env` file.

### 3. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)
5. Save it securely

**Note**: You'll need to add credits to your OpenAI account. The app uses GPT-4o-mini which is very affordable (~$0.15 per 1M tokens).

## Installation Steps

### Step 1: Navigate to Project Directory

```bash
cd c:\Users\russe\OneDrive\Desktop\stake-hedera
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Next.js and React
- Hedera SDK
- Hedera Agent Kit
- LangChain and OpenAI integration
- TailwindCSS
- All other dependencies

**Expected time**: 2-5 minutes depending on your internet connection.

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` in your text editor

3. Fill in your credentials:

   ```env
   # Coordinator Agent (First Hedera Account)
   HEDERA_ACCOUNT_ID=0.0.12345          # Replace with your first account ID
   HEDERA_PRIVATE_KEY=0x1234567890...   # Replace with your first private key

   # Validator Agent (Second Hedera Account)
   VALIDATOR_ACCOUNT_ID=0.0.67890       # Replace with your second account ID
   VALIDATOR_PRIVATE_KEY=0xabcdef...    # Replace with your second private key

   # OpenAI API Key
   OPENAI_API_KEY=sk-proj-...           # Replace with your OpenAI key

   # Optional: Network (default is testnet)
   HEDERA_NETWORK=testnet
   ```

4. Save the file

**Security Warning**: Never commit the `.env` file to version control!

### Step 4: Verify Configuration

Run this command to check if your environment is set up correctly:

```bash
npm run dev
```

If everything is configured correctly, you should see:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

## First Run

### Step 1: Open the Application

1. Open your browser
2. Navigate to [http://localhost:3000](http://localhost:3000)
3. You should see the Hedera A2A Staking interface

### Step 2: Test with a Small Amount

1. Enter `50` in the amount field
2. Click "Start Agent Communication"
3. Watch the agents communicate!

You should see:
- Loading indicator
- A2A messages appearing
- Final status (COMPLETED or REJECTED)

### Step 3: View the Conversation

The conversation display shows:
- Each A2A message
- Message type and timestamp
- Sender and receiver
- Message payload (JSON)

## Troubleshooting

### Error: "Missing Hedera configuration"

**Cause**: Environment variables not set correctly

**Solution**:
1. Check that `.env` file exists
2. Verify all variables are filled in
3. Restart the dev server (`Ctrl+C` then `npm run dev`)

### Error: "INVALID_SIGNATURE" or "INVALID_ACCOUNT_ID"

**Cause**: Incorrect Hedera credentials

**Solution**:
1. Double-check your Account IDs (format: `0.0.xxxxx`)
2. Verify Private Keys start with `0x`
3. Ensure you're using ECDSA keys (not ED25519)
4. Create new testnet accounts if needed

### Error: "OpenAI API Error"

**Cause**: Invalid or missing OpenAI API key

**Solution**:
1. Verify your API key is correct
2. Check you have credits in your OpenAI account
3. Try creating a new API key

### Error: "Insufficient balance"

**Cause**: Your Hedera testnet account doesn't have enough HBAR

**Solution**:
1. Go to [Hedera Portal](https://portal.hedera.com/dashboard)
2. Request testnet HBAR (free)
3. Wait a few moments for the transaction to complete

### Application won't start

**Cause**: Port 3000 might be in use

**Solution**:
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

## Testing the Application

### Test Case 1: Valid Stake (Should Approve)

1. Amount: `100` HBAR
2. Expected: Validator approves
3. Result: COMPLETED status

### Test Case 2: Below Minimum (Should Reject)

1. Amount: `5` HBAR
2. Expected: Validator rejects
3. Result: REJECTED status with reason

### Test Case 3: Above Maximum (Should Reject)

1. Amount: `15000` HBAR
2. Expected: Validator rejects
3. Result: REJECTED status with reason

### Test Case 4: Edge Case (Should Approve)

1. Amount: `10` HBAR (exactly at minimum)
2. Expected: Validator approves
3. Result: COMPLETED status

## Understanding the Output

### Console Logs

The terminal running `npm run dev` will show:
- Agent initialization
- A2A message creation
- AI analysis from both agents
- Transaction details

Example:
```
Step 1: Coordinator initiating stake request...
Coordinator Analysis: The request to stake 100 HBAR appears reasonable...
Step 2: Validator processing request...
Validator AI Analysis: APPROVE - Amount is within acceptable range...
Step 3: Coordinator processing validation response...
```

### Browser Display

The UI shows:
- Real-time message flow
- Message types with icons
- Conversation status
- Duration and message count

## Next Steps

### Customize Validation Rules

Edit `src/lib/agents/validator-agent.ts`:

```typescript
private minStakeAmount = 10;    // Change minimum
private maxStakeAmount = 10000; // Change maximum
```

### Add More Agents

Create a new agent in `src/lib/agents/`:

```typescript
export class ExecutorAgent extends BaseAgent {
  // Your custom logic
}
```

### Integrate with Your Application

The staking API is available at:
```
POST /api/stake
Body: { "amount": 100 }
```

You can call this from your main application:

```typescript
const response = await fetch('http://localhost:3000/api/stake', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 100 })
});

const data = await response.json();
console.log(data.conversation);
```

## Production Deployment

### Build the Application

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

The application can be deployed to:
- Netlify
- AWS Amplify
- Google Cloud Run
- Any Node.js hosting

Just ensure environment variables are set!

## Getting Help

### Resources

- [Hedera Documentation](https://docs.hedera.com)
- [Hedera Agent Kit GitHub](https://github.com/hashgraph/hedera-agent-kit)
- [Next.js Documentation](https://nextjs.org/docs)
- [LangChain Documentation](https://js.langchain.com)

### Community

- [Hedera Discord](https://hedera.com/discord)
- [Hedera Developer Forum](https://hashgraph.github.io/hedera-docs/)

### Common Questions

**Q: Do I need to pay for Hedera testnet?**
A: No, testnet is completely free!

**Q: How much does OpenAI cost?**
A: GPT-4o-mini is very cheap (~$0.15 per 1M tokens). A typical staking request costs less than $0.001.

**Q: Can I use a different AI model?**
A: Yes! Edit `src/lib/agents/base-agent.ts` to use Anthropic, Groq, or Ollama (free, local).

**Q: Can I use this on mainnet?**
A: Yes, but change `HEDERA_NETWORK=mainnet` and use mainnet accounts. Be careful with real funds!

**Q: How do I create a demo video?**
A: Use OBS Studio or Loom to record your screen while demonstrating the application.

---

**Ready to go?** Run `npm run dev` and start staking! 🚀
