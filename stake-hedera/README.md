# Hedera A2A Staking Application

🏆 **Best Use of Hedera Agent Kit & Google A2A** - Hackathon Submission

A Next.js application demonstrating multi-agent communication using the A2A (Agent-to-Agent) standard with the Hedera Agent Kit. Users can enter an amount to stake, and autonomous AI agents communicate to validate and execute the staking transaction on Hedera.

## 🎯 Features

### ✅ Qualification Requirements Met

1. **Multi-agent communication** - Implements A2A message exchange using Hedera Consensus Service (HCS)
2. **Agent Kit integration** - Built with Hedera Agent Kit and its adaptors (LangChain)
3. **Open-source deliverables** - Complete code, documentation, and demo instructions

### 🌟 Key Highlights

- **A2A Standard Implementation**: Agents communicate via standardized A2A messages on HCS
- **Autonomous AI Agents**: LLM-powered agents that understand and validate staking requests
- **Real-time Conversation Display**: See agent-to-agent communication in real-time
- **Beautiful Modern UI**: Built with Next.js, React, and TailwindCSS
- **Multiple Hedera Services**: Uses HCS (Consensus), Account Service, and HTS (Token Service)
- **Human-in-the-Loop Ready**: Architecture supports both autonomous and supervised modes

## 🏗️ Architecture

### Agent Roles

1. **Coordinator Agent**
   - Receives user staking requests
   - Initiates A2A communication
   - Executes approved transactions
   - Reports results to users

2. **Validator Agent**
   - Validates staking requests using AI
   - Performs risk assessment
   - Approves or rejects requests
   - Communicates decisions via A2A

### A2A Message Flow

```
User → Coordinator Agent → [A2A: STAKE_REQUEST] → Validator Agent
                                                   ↓
                                            AI Validation
                                                   ↓
User ← Coordinator Agent ← [A2A: STAKE_APPROVAL] ← Validator Agent
         ↓
    Execute Stake
         ↓
    [A2A: STAKE_CONFIRMATION]
```

### Technology Stack

- **Frontend**: Next.js 14, React, TailwindCSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Blockchain**: Hedera Testnet
- **AI**: OpenAI GPT-4o-mini (via LangChain)
- **Agent Framework**: Hedera Agent Kit with LangChain adaptors
- **Messaging**: Hedera Consensus Service (HCS) for A2A

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Two Hedera testnet accounts ([Get free accounts](https://portal.hedera.com/dashboard))
- OpenAI API key ([Get from OpenAI](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   cd stake-hedera
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   # Coordinator Agent (your main account)
   HEDERA_ACCOUNT_ID=0.0.xxxxx
   HEDERA_PRIVATE_KEY=0x...

   # Validator Agent (second account)
   VALIDATOR_ACCOUNT_ID=0.0.xxxxx
   VALIDATOR_PRIVATE_KEY=0x...

   # OpenAI API Key
   OPENAI_API_KEY=sk-proj-...
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Staking Workflow

1. **Enter Amount**: Input the amount of HBAR you want to stake (recommended: 10-10,000 HBAR)

2. **Start Communication**: Click "Start Agent Communication" to initiate the A2A process

3. **Watch Agents Communicate**: 
   - Coordinator sends `STAKE_REQUEST` to Validator
   - Validator analyzes request using AI
   - Validator responds with `STAKE_APPROVAL` or `STAKE_REJECTION`
   - Coordinator executes and sends `STAKE_CONFIRMATION`

4. **View Results**: See the complete conversation history with message payloads

### Message Types

- **STAKE_REQUEST**: Initial request from Coordinator to Validator
- **STAKE_VALIDATION**: Validator's analysis (internal)
- **STAKE_APPROVAL**: Validator approves the request
- **STAKE_REJECTION**: Validator rejects the request
- **STAKE_CONFIRMATION**: Coordinator confirms execution

## 🔧 Project Structure

```
stake-hedera/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── stake/route.ts      # Main staking API
│   │   │   └── balance/route.ts    # Balance query API
│   │   ├── page.tsx                # Main UI
│   │   ├── layout.tsx              # App layout
│   │   └── globals.css             # Global styles
│   └── lib/
│       ├── agents/
│       │   ├── base-agent.ts       # Base agent class
│       │   ├── coordinator-agent.ts # Coordinator implementation
│       │   └── validator-agent.ts   # Validator implementation
│       ├── a2a-messaging.ts        # A2A messaging service
│       ├── hedera-client.ts        # Hedera client setup
│       └── types.ts                # TypeScript types
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

## 🎨 Key Components

### A2A Messaging Service

Uses Hedera Consensus Service (HCS) to implement the A2A standard:

```typescript
// Create A2A topic
const topicId = await messagingService.createMessageTopic();

// Send A2A message
const message = messagingService.createMessage(
  from, to, 'STAKE_REQUEST', payload
);
await messagingService.sendMessage(message);
```

### Agent Communication

Agents use LangChain and Hedera Agent Kit:

```typescript
// Coordinator initiates request
await coordinator.initiateStakeRequest(amount, validatorId);

// Validator processes and responds
const response = await validator.processMessage(request);

// Coordinator executes
await coordinator.processMessage(response);
```

## 🧪 Testing

### Manual Testing

1. Start with a small amount (e.g., 50 HBAR)
2. Try an amount below minimum (e.g., 5 HBAR) - should be rejected
3. Try an amount above maximum (e.g., 15,000 HBAR) - should be rejected
4. Try a valid amount (e.g., 500 HBAR) - should be approved

### Validation Rules

- **Minimum**: 10 HBAR
- **Maximum**: 10,000 HBAR
- **AI Analysis**: LLM evaluates risk and provides recommendations

## 🎥 Demo Video Script

1. **Introduction** (30s)
   - Show the landing page
   - Explain the A2A concept
   - Highlight the two agents

2. **Demonstration** (2min)
   - Enter a valid amount (e.g., 100 HBAR)
   - Click "Start Agent Communication"
   - Show the A2A messages appearing
   - Highlight the message flow
   - Show the final status

3. **Rejection Example** (1min)
   - Enter invalid amount (e.g., 5 HBAR)
   - Show rejection message
   - Explain validation logic

4. **Technical Deep Dive** (1min)
   - Show code structure
   - Explain Hedera Agent Kit integration
   - Show HCS topic creation
   - Highlight AI validation

## 🌐 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all environment variables are set in your production environment:
- `HEDERA_ACCOUNT_ID`
- `HEDERA_PRIVATE_KEY`
- `VALIDATOR_ACCOUNT_ID`
- `VALIDATOR_PRIVATE_KEY`
- `OPENAI_API_KEY`

## 🔐 Security Considerations

- **Private Keys**: Never commit `.env` file
- **API Keys**: Use environment variables
- **Validation**: Both AI and rule-based validation
- **Human-in-the-Loop**: Can be enabled for high-value transactions

## 🚀 Advanced Features

### Human-in-the-Loop Mode

The architecture supports human approval before execution:

```typescript
// In coordinator-agent.ts
if (amount > THRESHOLD) {
  // Request human approval
  await requestHumanApproval(message);
}
```

### Multiple Hedera Services

- **HCS**: A2A messaging via topics
- **Account Service**: Balance queries and transfers
- **HTS**: Token operations (extensible)
- **Smart Contracts**: Future integration ready

### Extensibility

Add new agent types:

```typescript
export class ExecutorAgent extends BaseAgent {
  // Specialized execution logic
}
```

Add new message types:

```typescript
type: 'STAKE_CANCELLATION' | 'STAKE_UPDATE' | ...
```

## 📚 Resources

- [Hedera Agent Kit](https://github.com/hashgraph/hedera-agent-kit)
- [Hedera Documentation](https://docs.hedera.com)
- [A2A Standard](https://a2a.ai)
- [LangChain](https://js.langchain.com)

## 🤝 Contributing

This is a hackathon submission, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this code for your projects!

## 🏆 Hackathon Submission

**Category**: Best Use of Hedera Agent Kit & Google A2A

**Qualification Checklist**:
- ✅ Multi-agent communication using A2A standard
- ✅ Hedera Agent Kit integration with adaptors
- ✅ Open-source code and documentation
- ✅ Demo video (to be recorded)
- ✅ Multiple Hedera services (HCS, Account, HTS)
- ✅ Human-in-the-loop architecture support

**Bonus Features**:
- ✅ Uses multiple Hedera services (HCS for messaging, Account for queries)
- ✅ Human-in-the-loop mode ready
- ✅ Beautiful modern UI
- ✅ Real-time conversation display
- ✅ AI-powered validation
- ✅ Extensible architecture

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check Hedera Discord
- Review documentation

---

Built with ❤️ using Hedera Agent Kit and Next.js
