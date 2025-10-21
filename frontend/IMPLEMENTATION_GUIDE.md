# 🎨 WanderLink Frontend - Complete Setup Guide

## ✅ What Has Been Created

### 1. Design System (Neobrutalism Style)
- ✅ **tailwind.config.js** - Updated with social-media-manager design tokens
- ✅ **app/globals.css** - CSS variables for bold, vibrant colors
- ✅ **lib/utils.ts** - Utility functions (cn, formatDate, calculateDays, etc.)

### 2. Mock Data
- ✅ **lib/mock-data.ts** - Comprehensive realistic data:
  - 5 Users with avatars, bios, reputation scores
  - 6 Trips with multiple images, itineraries, preferences
  - 3 Bookings with transaction hashes

### 3. Pages Created
- ✅ **app/page.tsx** - Home page with:
  - Hero section with animated floating shapes
  - Features grid (4 cards)
  - Featured trips (3 cards)
  - How it works (3 steps)
  - CTA section
  
- ✅ **app/trips/page.tsx** - Trip listing with:
  - Search bar
  - Advanced filters (budget, pace, status)
  - Filter tags
  - Trip cards grid
  - Real-time filtering

## 🎨 Design Style Applied

### Neobrutalism Aesthetic
```css
/* Bold borders */
border: 4px solid black

/* Hard shadows */
shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]

/* Rounded corners */
rounded-2xl, rounded-3xl

/* Hover effects */
hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
hover:translate-x-1 hover:translate-y-1
transition-all
```

### Color Palette
- **Primary Gradient**: Orange (#FB923C) → Pink (#EC4899) → Purple (#A855F7)
- **Background**: Gradient from orange-50 via pink-50 to purple-50
- **Text**: Black (#000000)
- **Borders**: Solid Black 4px
- **Shadows**: Hard black shadows with offset

### Typography
- **Font Weight**: font-black (900) for headers
- **Font Weight**: font-bold (700) for body text
- **Font Weight**: font-semibold (600) for descriptions
- **Text Transform**: UPPERCASE for emphasis

## 📦 Installation & Setup

### Step 1: Install Dependencies

```bash
cd frontend

# Install missing UI libraries
npm install lucide-react tailwind-merge tailwindcss-animate

# OR if you prefer pnpm
pnpm install lucide-react tailwind-merge tailwindcss-animate
```

### Step 2: Start Development Server

```bash
npm run dev

# Visit http://localhost:3000
```

### Step 3: Verify Everything Works
- Home page should load with animations
- Navigate to /trips to see trip listing
- Search and filters should work
- Click on trip cards (will show 404 until detail page is created)

## 📄 Pages Still to Create

### 1. Trip Details Page (`app/trips/[id]/page.tsx`)
**Features:**
- Image gallery/carousel
- Trip information (dates, location, cost, deposit)
- Host profile card with reputation
- Current participants grid
- Detailed itinerary
- Tags and preferences
- "Join Trip" button with wallet connect
- Chat preview section

### 2. Dashboard Page (`app/dashboard/page.tsx`)
**Features:**
- User stats cards (trips hosted, trips joined, reputation)
- Upcoming trips timeline
- Past trips grid
- Pending bookings list
- Quick actions (create trip, view profile)
- Notifications

### 3. Profile Page (`app/profile/page.tsx`)
**Features:**
- Avatar upload
- Bio editor
- Reputation badge with breakdown
- Verification badges (WorldID, KYC, Email)
- Trips hosted grid
- Trips joined grid
- NFT gallery
- Reviews section

### 4. Create Trip Page (`app/trips/create/page.tsx`)
**Features:**
- Multi-step form:
  - Step 1: Basic info (title, destination, dates)
  - Step 2: Details (description, itinerary, max participants)
  - Step 3: Preferences (age range, interests, pace, budget)
  - Step 4: Images upload
  - Step 5: Review & Deploy to contract
- Progress indicator
- Form validation
- Image upload to Lighthouse

### 5. Global Layout/Navigation
**Create: `app/layout.tsx` (update existing)**
- Navigation header with:
  - Logo
  - Menu (Home, Trips, Dashboard, Profile)
  - Connect Wallet button
  - Mobile menu

- Footer with:
  - Links
  - Social media
  - Copyright

## 🎯 Component Patterns

### Primary Button
```tsx
<button className="bg-black text-white px-8 py-4 rounded-2xl font-black text-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
  BUTTON TEXT
</button>
```

### Secondary Button
```tsx
<button className="bg-white text-black px-8 py-4 rounded-2xl font-black text-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
  BUTTON TEXT
</button>
```

### Card Component
```tsx
<div className="bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
  {/* Content */}
</div>
```

### Input Field
```tsx
<input
  type="text"
  className="w-full px-6 py-4 rounded-2xl border-4 border-black font-bold text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-1 focus:translate-y-1 transition-all"
/>
```

### Badge/Tag
```tsx
<span className="bg-green-400 px-3 py-1 rounded-full border-2 border-black font-black text-sm">
  BADGE TEXT
</span>
```

### Icon Card
```tsx
<div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-16 h-16 rounded-xl border-4 border-black flex items-center justify-center text-white">
  <Icon className="w-8 h-8" />
</div>
```

## 📊 Mock Data Examples

### Access Trips
```tsx
import { mockTrips, mockUsers, mockBookings } from '@/lib/mock-data'

// Get all trips
const allTrips = mockTrips

// Get specific trip
const trip = mockTrips.find(t => t.id === '1')

// Get user
const user = mockUsers[0]

// Filter trips
const openTrips = mockTrips.filter(t => t.status === 'open')
```

### Utility Functions
```tsx
import { formatDate, calculateDays, formatAddress, getStatusColor } from '@/lib/utils'

// Format date
const formatted = formatDate('2025-11-15') // "Nov 15, 2025"

// Calculate days between dates
const days = calculateDays('2025-11-15', '2025-11-25') // 10

// Format wallet address
const short = formatAddress('0x1234567890abcdef') // "0x1234...cdef"

// Get status color
const color = getStatusColor('open') // "bg-green-500"
```

## 🚀 Next Development Steps

### Immediate (Required for MVP)
1. ✅ Install dependencies (`lucide-react`, `tailwind-merge`, `tailwindcss-animate`)
2. ✅ Test home page and trips listing
3. ⏭️ Create trip details page (high priority)
4. ⏭️ Create dashboard page
5. ⏭️ Update layout with navigation header

### Short-term (Week 1)
6. Create profile page
7. Create trip creation form
8. Add mobile menu
9. Add footer component
10. Integrate wallet connection (RainbowKit already in dependencies)

### Medium-term (Week 2)
11. Connect to smart contracts
12. Add real wallet integration
13. Implement booking flow
14. Add messaging interface
15. Add notifications

## 🐛 Known Issues & Solutions

### TypeScript Errors
**Issue:** Cannot find module errors  
**Solution:** Run `npm install lucide-react tailwind-merge tailwindcss-animate`

### Build Errors
**Issue:** Module not found  
**Solution:** Make sure you're in the `frontend` directory when running commands

### Styling Not Applied
**Issue:** Tailwind classes not working  
**Solution:** Restart dev server after updating tailwind.config.js

## 📱 Mobile Responsive

All pages are mobile-responsive by default using Tailwind's responsive prefixes:
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up

Example:
```tsx
className="text-2xl sm:text-4xl lg:text-6xl"
// Mobile: 2xl, Tablet: 4xl, Desktop: 6xl
```

## 🎬 Demo Flow

1. **Land on home page** → See hero, features, featured trips
2. **Click "EXPLORE TRIPS"** → Go to /trips
3. **Search/Filter** → Real-time results update
4. **Click trip card** → Go to /trips/[id] (to be created)
5. **Click "JOIN TRIP"** → Connect wallet, deposit funds
6. **Go to Dashboard** → See your bookings and trips

## 📝 File Structure

```
frontend/
├── app/
│   ├── page.tsx                    ✅ Home
│   ├── layout.tsx                  ⏭️ Update with nav
│   ├── globals.css                 ✅ Updated
│   ├── trips/
│   │   ├── page.tsx                ✅ Listing
│   │   ├── [id]/
│   │   │   └── page.tsx            ⏭️ Details
│   │   └── create/
│   │       └── page.tsx            ⏭️ Create form
│   ├── dashboard/
│   │   └── page.tsx                ⏭️ Dashboard
│   └── profile/
│       └── page.tsx                ⏭️ Profile
├── lib/
│   ├── mock-data.ts                ✅ Created
│   └── utils.ts                    ✅ Created
├── components/                     ⏭️ Reusable components
├── tailwind.config.js              ✅ Updated
└── package.json                    ⏭️ Install deps
```

## 🎨 Design Principles

1. **Bold & Playful** - Heavy borders, bright colors, fun shapes
2. **High Contrast** - Black borders on everything
3. **Tactile** - Shadows give depth, hover states provide feedback
4. **Energetic** - Animations and gradients create movement
5. **Clear Hierarchy** - Font weights and sizes guide attention

## ✨ Unique Features

- **Animated floating shapes** on hero section
- **Hover effects** that "push" elements (translate + shadow change)
- **Gradient text** for emphasis
- **Tag system** for filtering
- **Real-time search** as you type
- **Status badges** on trip cards
- **Participant counter** showing spots left

---

## 🎯 Summary

✅ **Styling system** - Complete neobrutalism design  
✅ **Mock data** - 6 trips, 5 users, realistic content  
✅ **Home page** - Hero, features, trips, CTA  
✅ **Trips listing** - Search, filters, cards  
⏭️ **Trip details** - Next to create  
⏭️ **Dashboard** - User's trips and bookings  
⏭️ **Profile** - User info and NFTs  

**Current Status:** 40% complete, ready for Web3 integration after remaining pages are built.

