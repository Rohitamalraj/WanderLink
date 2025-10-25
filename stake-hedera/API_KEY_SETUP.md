# 🔑 API Key Configuration

## Current Issue
Your API key starts with `sk-or-v1-` which indicates it's an **OpenRouter** key, not a direct OpenAI key.

## Solution Options

### Option 1: Use OpenRouter (Current Setup) ✅
I've configured the system to work with OpenRouter. The configuration is now:

```typescript
// Automatically detects OpenRouter keys
if (apiKey.startsWith('sk-or-')) {
  // Use OpenRouter endpoint
  baseURL: 'https://openrouter.ai/api/v1'
  model: 'openai/gpt-4o-mini'
}
```

**Your current key:** `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`

### Option 2: Get a Direct OpenAI Key (Recommended)

If OpenRouter continues to have issues, get a direct OpenAI key:

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. It will start with `sk-proj-` or `sk-`
4. Replace in `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
   ```

## Testing the Configuration

### Test 1: Check if server compiles
```bash
# Server should show "Ready" without errors
npm run dev
```

### Test 2: Make a test API call
```bash
curl -X POST http://localhost:3000/api/stake \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "location": "New York"}'
```

### Test 3: Check logs
Look for:
- ✅ No "401 Incorrect API key" errors
- ✅ Agent responses in console
- ✅ Successful LLM calls

## OpenRouter vs OpenAI

| Feature | OpenRouter | Direct OpenAI |
|---------|-----------|---------------|
| Models | Multiple providers | OpenAI only |
| Pricing | Pay-per-use | Subscription + usage |
| Reliability | Depends on routing | Direct connection |
| Setup | Needs baseURL config | Works out of box |

## Current Configuration

**File:** `src/lib/agents/base-agent.ts`

```typescript
const apiKey = process.env.OPENAI_API_KEY || '';
const isOpenRouter = apiKey.startsWith('sk-or-');

if (isOpenRouter) {
  this.llm = new ChatOpenAI({
    modelName: 'openai/gpt-4o-mini',
    temperature: 0.7,
    openAIApiKey: apiKey,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
    },
  });
} else {
  this.llm = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
    openAIApiKey: apiKey,
  });
}
```

## Troubleshooting

### Error: "401 Incorrect API key"
**Cause:** OpenRouter key not configured properly

**Fix:**
1. Verify key in `.env` is correct
2. Check no extra spaces/newlines
3. Restart dev server: `npm run dev`

### Error: "Model not found"
**Cause:** Wrong model name for OpenRouter

**Fix:**
- OpenRouter: Use `openai/gpt-4o-mini`
- Direct OpenAI: Use `gpt-4o-mini`

### Error: "Rate limit exceeded"
**Cause:** Too many requests

**Fix:**
- Add delay between requests
- Upgrade OpenRouter plan
- Switch to direct OpenAI key

## Next Steps

1. ✅ Configuration updated for OpenRouter
2. ⏳ Restart dev server (should auto-reload)
3. ⏳ Test with a simple stake request
4. ⏳ Monitor console for errors

If OpenRouter continues to have issues, I recommend getting a direct OpenAI API key from https://platform.openai.com/api-keys
