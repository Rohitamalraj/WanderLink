# Demo Video Script

This script will help you create a compelling demo video for the hackathon submission.

**Target Duration**: 3-5 minutes  
**Recording Tool**: OBS Studio, Loom, or similar

---

## Scene 1: Introduction (30 seconds)

### Visual
- Show the landing page at `http://localhost:3000`
- Highlight the title "Hedera A2A Staking"

### Script

> "Hi! I'm excited to show you my submission for the Best Use of Hedera Agent Kit and Google A2A challenge."
>
> "This is a multi-agent staking application where autonomous AI agents communicate using the A2A standard to validate and execute staking transactions on Hedera."
>
> "You can see here we have two agents: a Coordinator Agent and a Validator Agent, both powered by the Hedera Agent Kit."

### Actions
- Point to the agent status indicators
- Briefly scroll to show the features section

---

## Scene 2: Architecture Overview (45 seconds)

### Visual
- Open `README.md` or show a diagram
- Highlight the A2A message flow

### Script

> "Let me quickly explain how this works."
>
> "When a user enters a staking amount, the Coordinator Agent creates an A2A message and sends it to the Validator Agent using Hedera Consensus Service."
>
> "The Validator Agent uses AI to analyze the request, checking things like amount limits, risk factors, and network conditions."
>
> "It then responds with either an approval or rejection message, also via A2A."
>
> "If approved, the Coordinator executes the stake and sends a confirmation."
>
> "All of this communication happens autonomously using LangChain and the Hedera Agent Kit."

### Actions
- Show the message flow diagram
- Briefly show code in `src/lib/a2a-messaging.ts`

---

## Scene 3: Live Demo - Successful Stake (90 seconds)

### Visual
- Return to the application
- Show the staking form

### Script

> "Let's see this in action. I'll stake 100 HBAR."
>
> [Type 100 in the amount field]
>
> "When I click 'Start Agent Communication', watch what happens..."
>
> [Click the button]
>
> "You can see the agents are now communicating. Let's look at each message:"
>
> [Point to first message]
> "First, the Coordinator sends a STAKE_REQUEST to the Validator with the amount and requester details."
>
> [Point to second message]
> "The Validator receives it, analyzes it using GPT-4, and sends back a STAKE_APPROVAL because 100 HBAR is within the acceptable range."
>
> [Point to third message]
> "Finally, the Coordinator confirms the stake execution."
>
> "The entire conversation took just a few seconds, and you can see all the message payloads in JSON format."

### Actions
- Enter amount: `100`
- Click "Start Agent Communication"
- Wait for messages to appear
- Expand and show message payloads
- Highlight the status: COMPLETED

---

## Scene 4: Demo - Rejected Stake (60 seconds)

### Visual
- Clear previous results
- Show the form again

### Script

> "Now let's see what happens when we try to stake an invalid amount."
>
> [Type 5 in the amount field]
>
> "I'll try to stake just 5 HBAR, which is below our minimum of 10 HBAR."
>
> [Click the button]
>
> "Watch how the Validator Agent handles this..."
>
> [Point to messages]
>
> "The Coordinator sends the request, but this time the Validator's AI analysis determines it's too risky."
>
> "You can see the STAKE_REJECTION message with the reason: 'Amount out of range.'"
>
> "This shows how the agents work together to protect users from invalid transactions."

### Actions
- Enter amount: `5`
- Click "Start Agent Communication"
- Show the rejection message
- Highlight the reason in the payload

---

## Scene 5: Technical Deep Dive (60 seconds)

### Visual
- Open VS Code or show code snippets
- Navigate through key files

### Script

> "Let me show you some of the technical implementation."
>
> [Show `src/lib/agents/coordinator-agent.ts`]
>
> "Here's the Coordinator Agent. It uses the Hedera Agent Kit with LangChain to analyze requests and execute transactions."
>
> [Show `src/lib/a2a-messaging.ts`]
>
> "This is our A2A messaging service. It creates HCS topics and sends standardized A2A messages."
>
> [Show `src/lib/agents/validator-agent.ts`]
>
> "And here's the Validator Agent with its AI-powered validation logic."
>
> "The agents use GPT-4 to make intelligent decisions, but they also have rule-based validation for safety."

### Actions
- Quickly scroll through key code sections
- Highlight important functions
- Show the Hedera Agent Kit integration

---

## Scene 6: Hedera Services Integration (30 seconds)

### Visual
- Show browser console or terminal logs
- Highlight Hedera transactions

### Script

> "This application uses multiple Hedera services:"
>
> "Hedera Consensus Service for A2A messaging, the Account Service for balance queries, and the Token Service for staking operations."
>
> "You can see the HCS topic ID here, and all messages are permanently recorded on the Hedera network."

### Actions
- Show console logs with topic ID
- Show transaction IDs if available
- Briefly show Hedera Portal (optional)

---

## Scene 7: Qualification Requirements (30 seconds)

### Visual
- Show README.md checklist
- Highlight features

### Script

> "This submission meets all the qualification requirements:"
>
> "✓ Multi-agent communication using the A2A standard"
> "✓ Built with Hedera Agent Kit and its LangChain adaptors"
> "✓ Fully open-source with complete documentation"
>
> "Plus bonus features like multiple Hedera services, human-in-the-loop architecture support, and a beautiful modern UI."

### Actions
- Show the checklist in README
- Scroll through documentation

---

## Scene 8: Closing (15 seconds)

### Visual
- Return to the application homepage
- Show GitHub repository (if public)

### Script

> "This application demonstrates the power of combining Hedera's fast, fair, and secure network with AI agents that can communicate and make decisions autonomously."
>
> "All the code and documentation are available in the repository. Thank you for watching!"

### Actions
- Show final view of the application
- Display GitHub URL or project name

---

## Recording Tips

### Before Recording

1. **Clean your desktop** - Close unnecessary applications
2. **Test your setup** - Do a practice run
3. **Prepare your environment**:
   - Clear browser cache
   - Reset the application state
   - Have code files ready to show
4. **Check audio** - Use a good microphone
5. **Lighting** - If showing yourself, ensure good lighting

### During Recording

1. **Speak clearly and at a moderate pace**
2. **Use your mouse to point** at important elements
3. **Pause briefly** between sections
4. **Show enthusiasm** - This is cool tech!
5. **If you make a mistake**, just pause and continue (edit later)

### After Recording

1. **Edit out long pauses** or mistakes
2. **Add captions** if possible
3. **Add background music** (optional, keep it subtle)
4. **Add text overlays** for key points
5. **Export in high quality** (1080p recommended)

---

## Alternative: Shorter Version (2 minutes)

If you need a shorter demo:

1. **Introduction** (15s) - What it is
2. **Live Demo** (60s) - One successful stake
3. **Technical Highlight** (30s) - Show A2A messaging code
4. **Closing** (15s) - Requirements met

---

## Bonus: Advanced Demo Ideas

### Show Human-in-the-Loop

Modify the code to require approval for amounts > 1000 HBAR:

```typescript
if (amount > 1000) {
  console.log("Requesting human approval...");
  // Show how this would work
}
```

### Show Multiple Agents

Create a third agent (Executor) and show three-way communication.

### Show Real Hedera Explorer

Open [HashScan](https://hashscan.io/testnet) and show your HCS topic with messages.

### Show Integration

Demonstrate how another application could call your API.

---

## Upload Checklist

Before submitting your video:

- [ ] Video is 3-5 minutes long
- [ ] Audio is clear
- [ ] Shows successful stake
- [ ] Shows rejected stake
- [ ] Explains A2A communication
- [ ] Shows code/architecture
- [ ] Mentions Hedera Agent Kit
- [ ] Highlights qualification requirements
- [ ] Includes GitHub/repository link
- [ ] Exported in 1080p or higher
- [ ] File size is reasonable (< 500MB)

---

**Good luck with your demo! 🎥🚀**
