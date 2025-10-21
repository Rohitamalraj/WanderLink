# 🤖 Google Gemini AI Setup Guide

## Overview
The Planner agent now uses **Google Gemini AI** instead of OpenAI for generating intelligent travel itineraries.

## Why Gemini?
- ✅ **Free tier available** with generous quota
- ✅ **Fast response times**
- ✅ **Excellent at creative content generation**
- ✅ **No credit card required to start**

## Getting Your API Key

### Step 1: Visit Google AI Studio
Go to: **https://makersuite.google.com/app/apikey**

### Step 2: Sign in with Google Account
Use any Google account (Gmail, Workspace, etc.)

### Step 3: Create API Key
1. Click **"Get API Key"** or **"Create API Key"**
2. Select a project (or create new one)
3. Copy the generated API key

### Step 4: Add to Environment
Open `agents/.env` and add your key:
```env
GEMINI_API_KEY=your_api_key_here
```

## Features

### What Gemini Does
- 🗺️ **Generates personalized itineraries** based on:
  - Destination
  - Number of days
  - Traveler interests
  - Budget constraints
  - Travel pace (relaxed/moderate/packed)

- 🎯 **Smart recommendations** for:
  - Daily activities
  - Meal spots
  - Time management
  - Budget allocation

### Fallback Mode
If no API key is provided, the agent automatically falls back to mock itineraries. The system will still work!

## Testing Gemini Integration

### 1. Run the Planner Agent
```powershell
cd d:\WanderLink\agents
.\venv\Scripts\Activate.ps1
python src\planner_agent.py
```

### 2. Check Startup Message
You should see:
```
✅ Google Gemini integration enabled
```

If you see this instead:
```
⚠️  Running without Gemini AI (mock mode)
```
Then check your `.env` file has `GEMINI_API_KEY` set.

## API Limits

### Free Tier
- ✅ **60 requests per minute**
- ✅ **1,500 requests per day**
- ✅ **Plenty for development and testing**

### Rate Limit Handling
The agent automatically:
- Catches API errors
- Falls back to mock data
- Logs the issue for debugging

## Code Changes Made

### Updated Files
1. ✅ `src/planner_agent.py` - Now uses Gemini API
2. ✅ `requirements.txt` - Added `google-generativeai`
3. ✅ `.env` - Changed `OPENAI_API_KEY` to `GEMINI_API_KEY`

### What Changed
```python
# Before (OpenAI)
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# After (Gemini)
import google.generativeai as genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-pro')
```

## Example Request/Response

### Request to Planner Agent
```python
{
    "destination": "Paris, France",
    "num_days": 3,
    "interests": ["art", "food", "history"],
    "budget_per_day": 150.0,
    "pace": "moderate"
}
```

### Gemini-Generated Response
```json
[
  {
    "day": 1,
    "title": "Day 1 - Arrival & Iconic Landmarks",
    "activities": [
      "Morning: Check-in and breakfast near Eiffel Tower",
      "Late morning: Eiffel Tower visit (book tickets in advance)",
      "Lunch: Crêperie near Trocadéro",
      "Afternoon: Seine River cruise",
      "Evening: Dinner at Latin Quarter bistro"
    ],
    "budget_range": "$120-160"
  },
  {
    "day": 2,
    "title": "Day 2 - Art & Culture",
    "activities": [
      "Morning: Louvre Museum (arrive early)",
      "Lunch: Museum café or nearby boulangerie",
      "Afternoon: Musée d'Orsay",
      "Evening: Montmartre evening walk and dinner"
    ],
    "budget_range": "$140-180"
  },
  {
    "day": 3,
    "title": "Day 3 - History & Departure",
    "activities": [
      "Morning: Notre-Dame area and Sainte-Chapelle",
      "Lunch: Île de la Cité café",
      "Afternoon: Shopping at Le Marais",
      "Evening: Farewell dinner and departure prep"
    ],
    "budget_range": "$130-170"
  }
]
```

## Troubleshooting

### "Module not found: google.generativeai"
Run:
```powershell
pip install google-generativeai
```

### "Invalid API key"
1. Check `.env` file has `GEMINI_API_KEY=your_key_here`
2. Verify no extra spaces or quotes
3. Generate new key at https://makersuite.google.com/app/apikey

### Agent Still Uses Mock Data
1. Restart the agent after adding API key
2. Check terminal output for error messages
3. Agent falls back to mock on any Gemini error

## Benefits Over OpenAI

| Feature | Gemini | OpenAI |
|---------|--------|--------|
| **Free Tier** | ✅ Generous | ❌ $5 minimum |
| **Speed** | ⚡ Fast | ⚡ Fast |
| **Setup** | 🟢 No CC needed | 🔴 CC required |
| **Daily Limit** | 1,500 requests | Pay per use |
| **Travel Planning** | ✅ Excellent | ✅ Excellent |

## Next Steps

1. ✅ Get your Gemini API key
2. ✅ Add to `.env` file
3. ✅ Restart planner agent
4. ✅ Test with real travel requests
5. 🚀 Build the frontend UI components!

---

**Happy Traveling! 🌍✈️**
