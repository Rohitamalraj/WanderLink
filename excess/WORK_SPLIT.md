# 👥 WanderLink - Work Split for 2 Developers

**Project:** WanderLink - Web3 Social Travel Platform  
**Timeline:** 7 days (hackathon sprint)  
**Total Effort:** ~40 hours (20h per person)

---

## 🎯 Team Structure

### **Person A: Smart Contracts + Backend Developer**
**Focus:** Blockchain, APIs, Database, Authentication  
**Stack:** Solidity, Hardhat, Node.js, Express, PostgreSQL, Prisma  
**Working Folders:** `contracts/`, `backend/`, database migrations

### **Person B: Frontend + AI/Integration Developer**
**Focus:** UI/UX, AI Agents, Web3 Integration, Styling  
**Stack:** Next.js 14, React, TypeScript, Wagmi, RainbowKit, TailwindCSS  
**Working Folders:** `frontend/`, `agents/`, integrations

---

## 📋 Detailed Task Breakdown

### 🔷 Person A: Smart Contracts + Backend (20 hours)

#### **Phase 1: Smart Contracts (6-8 hours)**

##### Day 1-2: Contract Development
- [ ] **Review existing contracts** (1h)
  - Check `contracts/src/TripEscrow.sol`
  - Check `contracts/src/ReputationSBT.sol`
  - Check `contracts/src/TripNFT.sol`
  
- [ ] **Test contracts locally** (2h)
  - Write/update test cases in `contracts/test/`
  - Run `npm test` and fix any issues
  - Test edge cases (cancellations, disputes, refunds)
  
- [ ] **Deploy to Hedera Testnet** (1.5h)
  - Get Hedera testnet account/keys
  - Configure `contracts/.env`
  - Run `npm run deploy:hedera`
  - Save contract addresses
  
- [ ] **Deploy to Polygon Mumbai** (1.5h)
  - Get Polygon Mumbai RPC and keys
  - Configure deployment script
  - Run `npm run deploy:polygon`
  - Save contract addresses
  
- [ ] **Document contract ABIs** (1h)
  - Export ABIs to `frontend/lib/contracts/`
  - Create contract address config file
  - Document function signatures

#### **Phase 2: Backend API (8-10 hours)**

##### Day 2-3: API Foundation
- [ ] **Set up backend project** (2h)
  ```bash
  cd backend
  npm init -y
  npm install express cors dotenv prisma @prisma/client
  npm install -D typescript @types/node @types/express nodemon
  ```
  - Create `src/` folder structure
  - Set up TypeScript config
  - Create basic Express server

- [ ] **Database setup** (2h)
  - Initialize Prisma: `npx prisma init`
  - Design schema in `prisma/schema.prisma`:
    - User model (wallet, email, profile)
    - Trip model (details, status, participants)
    - Booking model (user, trip, payment status)
    - Message model (chat between users)
  - Run migration: `npx prisma migrate dev`
  
- [ ] **Authentication middleware** (2h)
  - Implement wallet signature verification
  - Create JWT token generation
  - Add auth middleware for protected routes
  - Test with Postman/Thunder Client

##### Day 3-4: Core API Endpoints
- [ ] **User endpoints** (2h)
  - `POST /api/users/register` - Create user profile
  - `GET /api/users/profile/:address` - Get user profile
  - `PUT /api/users/profile` - Update profile
  - `GET /api/users/:address/reputation` - Get reputation score

- [ ] **Trip endpoints** (2h)
  - `POST /api/trips` - Create trip listing
  - `GET /api/trips` - List all trips (with filters)
  - `GET /api/trips/:id` - Get trip details
  - `PUT /api/trips/:id` - Update trip
  - `DELETE /api/trips/:id` - Cancel trip

- [ ] **Booking endpoints** (1.5h)
  - `POST /api/bookings` - Create booking
  - `GET /api/bookings/user/:address` - User's bookings
  - `PUT /api/bookings/:id/status` - Update booking status

- [ ] **Messaging endpoints** (1.5h)
  - `POST /api/messages` - Send message
  - `GET /api/messages/conversation/:tripId` - Get trip chat
  - WebSocket setup for real-time chat (optional)

#### **Phase 3: Integrations (4-6 hours)**

##### Day 4-5: External Services
- [ ] **Lighthouse Storage** (2h)
  - Install Lighthouse SDK
  - Create upload endpoint for trip photos
  - Implement encrypted file storage
  - Return IPFS hashes

- [ ] **WorldID Integration** (2h)
  - Set up WorldID verification endpoint
  - `POST /api/verify/worldid` - Verify World ID proof
  - Update user verification status in DB

- [ ] **Lit Protocol** (2h)
  - Set up Lit Protocol for encryption
  - Create access control conditions
  - Encrypt sensitive trip data
  - Share decryption keys with participants

---

### 🔶 Person B: Frontend + AI/Integration (20 hours)

#### **Phase 1: UI Foundation (6-8 hours)**

##### Day 1-2: Core Pages
- [ ] **Home Page enhancements** (2h)
  - Enhance existing components in `frontend/components/home/`
  - Add animations with Framer Motion
  - Improve Hero section with better CTAs
  - Add testimonials section

- [ ] **Trip Listing Page** (2h)
  - Create `frontend/app/trips/page.tsx`
  - Build TripCard component
  - Add filters (destination, dates, budget, group size)
  - Implement pagination
  - Add search functionality

- [ ] **Trip Details Page** (2h)
  - Create `frontend/app/trips/[id]/page.tsx`
  - Show trip information, itinerary, photos
  - Display host profile and reputation
  - Show current participants
  - Add "Join Trip" button with wallet connect

- [ ] **User Dashboard** (2h)
  - Create `frontend/app/dashboard/page.tsx`
  - Show user's trips (as host and participant)
  - Display reputation score and badges
  - Show upcoming trips timeline
  - Add quick actions (create trip, messages)

#### **Phase 2: Web3 Integration (4-6 hours)**

##### Day 2-3: Wallet & Contracts
- [ ] **Contract integration** (2h)
  - Set up contract ABIs in `frontend/lib/contracts/`
  - Create contract hooks using Wagmi
  - `useCreateTrip()` hook
  - `useJoinTrip()` hook
  - `useCompleteTrip()` hook

- [ ] **Payment flows** (2h)
  - Create payment modal component
  - Implement deposit transaction
  - Show transaction status (pending/success/failed)
  - Add gas estimation
  - Handle transaction errors gracefully

- [ ] **Reputation system UI** (1.5h)
  - Create ReputationBadge component
  - Display verification tiers (Basic/Enhanced/Premium)
  - Show verification badges (WorldID, KYC, etc.)
  - Add reputation history timeline

- [ ] **NFT Gallery** (1.5h)
  - Create `frontend/app/profile/nfts/page.tsx`
  - Fetch user's Trip NFTs
  - Display NFT gallery with metadata
  - Add share functionality

#### **Phase 3: AI Agents (5-7 hours)**

##### Day 3-5: AI Agent Development
- [ ] **Set up Fetch.ai uAgents** (2h)
  - Create `agents/` folder structure
  - Install uagents SDK: `pip install uagents`
  - Create agent configuration
  - Set up agent communication protocols

- [ ] **Matchmaking Agent** (2.5h)
  - Create `agents/matchmaker_agent.py`
  - Implement personality matching algorithm
  - Use travel preferences for scoring
  - Connect to LangChain for NLP
  - API endpoint: `POST /api/ai/match`

- [ ] **Travel Planner Agent** (2h)
  - Create `agents/planner_agent.py`
  - Integrate with travel APIs (optional)
  - Generate itinerary suggestions
  - Optimize routes and activities
  - API endpoint: `POST /api/ai/plan`

- [ ] **Frontend AI Integration** (1.5h)
  - Create AI chat component
  - Add "Find My Match" wizard
  - Show AI recommendations
  - Display compatibility scores

#### **Phase 4: Polish & Features (4-5 hours)**

##### Day 5-6: Final Features
- [ ] **Create Trip Flow** (2h)
  - Create `frontend/app/trips/create/page.tsx`
  - Multi-step form (details → preferences → review)
  - Upload photos to Lighthouse
  - Deploy to smart contract
  - Show success confirmation

- [ ] **Messaging Interface** (1.5h)
  - Create chat component
  - Real-time message updates
  - Show participant avatars
  - Add emoji support
  - Notification badges

- [ ] **Notifications System** (1h)
  - Create notification component
  - Show alerts (new booking, trip updates, messages)
  - Add notification bell icon
  - Mark as read functionality

- [ ] **Responsive Design** (1.5h)
  - Test all pages on mobile
  - Fix layout issues
  - Optimize for tablets
  - Add mobile navigation menu

---

## 🔄 Daily Sync Points

### **Day 1 End-of-Day Sync** (15 mins)
- **Person A:** Share contract addresses and ABIs
- **Person B:** Share UI wireframes and color scheme
- **Both:** Agree on API endpoint structure

### **Day 2 End-of-Day Sync** (15 mins)
- **Person A:** Demo working API endpoints (Postman collection)
- **Person B:** Show trip listing and detail pages (mock data)
- **Both:** Review TypeScript types for API responses

### **Day 3 Mid-Day Sync** (20 mins)
- **Person A:** Backend API is complete, share Postman docs
- **Person B:** Frontend ready to connect, share components
- **Both:** Integration testing begins

### **Day 4 End-of-Day Sync** (15 mins)
- **Person A:** External integrations working (Lighthouse, WorldID)
- **Person B:** AI agents responding, Web3 flows complete
- **Both:** Test complete user journey

### **Day 5-6: Integration Phase**
- Work together to connect everything
- Fix bugs and edge cases
- Test on multiple wallets and browsers

### **Day 7: Demo Prep**
- Record demo video together
- Prepare presentation
- Deploy to production
- Submit to ETHOnline

---

## 📦 Shared Resources

### **TypeScript Types** (Both should use)
Create `types/index.ts` in root:

```typescript
// Shared types
export interface User {
  address: string;
  email?: string;
  name?: string;
  bio?: string;
  avatar?: string;
  reputation: number;
  verifications: string[];
  createdAt: string;
}

export interface Trip {
  id: string;
  hostAddress: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  depositAmount: string;
  status: 'open' | 'full' | 'active' | 'completed' | 'cancelled';
  description: string;
  images: string[];
  preferences: TripPreferences;
}

export interface TripPreferences {
  ageRange: [number, number];
  interests: string[];
  budget: 'low' | 'medium' | 'high';
  pace: 'relaxed' | 'moderate' | 'active';
}

export interface Booking {
  id: string;
  tripId: string;
  userAddress: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  depositTxHash?: string;
  createdAt: string;
}
```

### **Environment Variables**

**Backend `.env`:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/wanderlink"
JWT_SECRET="your-secret-key"
LIGHTHOUSE_API_KEY="your-lighthouse-key"
WORLDID_APP_ID="app_staging_xxx"
LIT_PROTOCOL_KEY="your-lit-key"
PORT=3001
```

**Frontend `.env.local`:**
```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_HEDERA_CONTRACT="0x..."
NEXT_PUBLIC_POLYGON_CONTRACT="0x..."
NEXT_PUBLIC_WALLETCONNECT_ID="your-project-id"
```

---

## ⚠️ Potential Conflicts & Solutions

### **File Conflicts**
- ❌ **Problem:** Both editing same files
- ✅ **Solution:** Person A works in `contracts/` and `backend/`, Person B in `frontend/` and `agents/`

### **API Contract Changes**
- ❌ **Problem:** API endpoints change without notice
- ✅ **Solution:** Update shared `types/index.ts` first, then notify in Slack/Discord

### **Contract ABI Updates**
- ❌ **Problem:** Contract changes break frontend
- ✅ **Solution:** Person A updates ABIs in `frontend/lib/contracts/` after any contract change

### **Git Merge Conflicts**
- ❌ **Problem:** Conflicts in package.json or shared files
- ✅ **Solution:** 
  - Commit frequently with clear messages
  - Pull before starting work each day
  - Use feature branches for big changes

---

## 🚀 Getting Started

### **Person A: First Steps**
```bash
# 1. Install dependencies
cd contracts
npm install

# 2. Test contracts
npm test

# 3. Set up backend
cd ../backend
npm init -y
npm install express cors dotenv prisma @prisma/client

# 4. Start coding!
```

### **Person B: First Steps**
```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# http://localhost:3000

# 4. Start building pages!
```

---

## 📊 Progress Tracking

### **Daily Checklist Template**

**Day X - [Date]**

**Person A:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
- 🔴 Blockers: [Any issues]
- ✅ Completed: [What's done]

**Person B:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
- 🔴 Blockers: [Any issues]
- ✅ Completed: [What's done]

**Shared:**
- [ ] Integration test passed
- [ ] Code review done
- [ ] Documentation updated

---

## 🎯 Success Criteria

### **Minimum Viable Product (MVP)**
- ✅ Smart contracts deployed to testnets
- ✅ Users can create and join trips
- ✅ Payment escrow works
- ✅ Basic UI is functional
- ✅ Wallet connection works

### **Complete Product**
- ✅ All MVP features
- ✅ AI matchmaking works
- ✅ Reputation system functional
- ✅ Trip NFTs minting
- ✅ Messaging between users
- ✅ Mobile responsive
- ✅ Demo video recorded

### **Stretch Goals** (If time permits)
- ⭐ Real-time notifications
- ⭐ Map integration for trips
- ⭐ Social sharing features
- ⭐ Advanced AI recommendations
- ⭐ Multi-language support

---

## 💬 Communication Protocol

### **Daily Stand-up** (10 mins, 9:00 AM)
1. What did I do yesterday?
2. What will I do today?
3. Any blockers?

### **Quick Questions**
- Use Discord/Slack for quick questions
- Response time: < 1 hour during work hours

### **Code Reviews**
- Create PR for major features
- Review within 2 hours
- Use GitHub comments for feedback

### **Emergency Protocol**
- Production bugs: Call immediately
- Blocking issues: Ping in chat
- Non-urgent: Create GitHub issue

---

## 📝 Notes

- **Person A** should finish contract deployment by end of Day 2 so **Person B** can integrate
- **Person B** can start with mock data while backend is being built
- Both should write clean, commented code for easy handoff
- Test thoroughly before integrating
- Keep documentation updated as you build

---

## 🎉 Final Checklist (Day 7)

- [ ] All features working end-to-end
- [ ] Contracts verified on block explorers
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Demo video recorded (5 mins)
- [ ] GitHub README updated
- [ ] Environment variables documented
- [ ] Submission form completed
- [ ] Social media posts ready
- [ ] Presentation slides ready

---

**Good luck team! Let's build something amazing! 🚀**

**Remember:** Communication is key. Sync often, help each other, and have fun building!
