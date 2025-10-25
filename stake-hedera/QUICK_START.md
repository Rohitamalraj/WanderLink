# Quick Start Guide

Get the Hedera A2A Staking application running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Two Hedera testnet accounts created
- [ ] OpenAI API key obtained

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

```bash
cd c:\Users\russe\OneDrive\Desktop\stake-hedera
npm install
```

Wait for installation to complete...

### 2. Configure Environment (1 minute)

Copy the example file:
```bash
copy .env.example .env
```

Edit `.env` and add your credentials:
```env
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
VALIDATOR_ACCOUNT_ID=0.0.YOUR_VALIDATOR_ID
VALIDATOR_PRIVATE_KEY=0xYOUR_VALIDATOR_KEY
OPENAI_API_KEY=sk-proj-YOUR_KEY
```

### 3. Start the Application (30 seconds)

```bash
npm run dev
```

### 4. Test It! (1 minute)

1. Open http://localhost:3000
2. Enter `100` in the amount field
3. Click "Start Agent Communication"
4. Watch the agents communicate!

## That's It! 🎉

You should see:
- ✅ A2A messages being exchanged
- ✅ Validator approving the request
- ✅ Coordinator confirming execution
- ✅ Status: COMPLETED

## Next Steps

- Try different amounts (5, 50, 500, 15000)
- Read the full README.md
- Watch the demo video
- Integrate into your app

## Troubleshooting

**Problem**: `npm install` fails  
**Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Problem**: Environment variables not working  
**Solution**: Restart the dev server with `Ctrl+C` then `npm run dev`

**Problem**: "Missing Hedera configuration"  
**Solution**: Check your `.env` file has all required variables

## Get Help

- Check SETUP_GUIDE.md for detailed instructions
- Review README.md for architecture details
- Open an issue on GitHub

---

**Ready to stake?** 🚀
