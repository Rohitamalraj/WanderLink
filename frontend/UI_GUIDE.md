# 🎨 WanderLink UI Components - Visual Guide

## 📱 Complete Page Layouts

### 1. Trip Detail Page (`/trips/[id]`)

```
┌─────────────────────────────────────────────────────────────┐
│  ← BACK TO TRIPS                          ♥ SAVE   ↗ SHARE │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────┐  ┌───────────────────┐ │
│  │                               │  │                   │ │
│  │   HERO IMAGE GALLERY          │  │   BOOKING CARD    │ │
│  │   [Bali Beach]                │  │                   │ │
│  │   🟢 3 SPOTS LEFT             │  │   $1200 / person  │ │
│  │                               │  │   ───────────────  │ │
│  └───────────────────────────────┘  │   📅 10 days      │ │
│                                      │   👥 5/8 people   │ │
│  📍 Bali, Indonesia                 │   🛡️ Escrow ✓     │ │
│  BALI BEACH & CULTURE EXPERIENCE    │                   │ │
│  [Beach] [Culture] [Photography]    │   [BOOK NOW]      │ │
│                                      │                   │ │
│  ┌──────────────────────────────┐   └───────────────────┘ │
│  │ [OVERVIEW] [AI MATCHING] [AI PLANNER]               │ │
│  └──────────────────────────────┘   ┌───────────────────┐ │
│                                      │                   │ │
│  OVERVIEW TAB:                       │   HOSTED BY       │ │
│  ┌──────────────────────────────┐   │   Sarah Chen      │ │
│  │ ABOUT THIS TRIP              │   │   95% Rep         │ │
│  │ Join us for unforgettable... │   │   12 hosted       │ │
│  └──────────────────────────────┘   │   28 joined       │ │
│                                      └───────────────────┘ │
│  ┌──────────────────────────────┐                         │
│  │ ITINERARY                    │   ┌───────────────────┐ │
│  │ 1️⃣ Day 1-2: Temple visits   │   │ 🛡️ SAFETY         │ │
│  │ 2️⃣ Day 3-4: Rice terraces   │   │ ✓ Smart contract  │ │
│  │ 3️⃣ Day 5-7: Beach time      │   │ ✓ WorldID verify  │ │
│  └──────────────────────────────┘   │ ✓ Host reputation │ │
│                                      └───────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. AI Matching Tab

```
┌─────────────────────────────────────────────────────────────┐
│  ✨ AI MATCH FINDER              [✨ FIND MATCHES]         │
│  Find your perfect travel companions using AI               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Found 5 highly compatible travelers        📈 87% Avg     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ #1  [Avatar] Sarah Chen           🟢 92% MATCH      │   │
│  │                                                      │   │
│  │     "Perfect alignment in travel style & interests" │   │
│  │     [Beach] [Photography] [Culture]                 │   │
│  │                                                      │   │
│  │     Show Compatibility Details →                    │   │
│  │                                                      │   │
│  │     ▼ EXPANDED:                                     │   │
│  │     Destination  ████████████████░░ 95%             │   │
│  │     Dates        ████████████░░░░░░ 80%             │   │
│  │     Budget       ██████████████░░░░ 85%             │   │
│  │     Activities   ██████████████████░ 90%            │   │
│  │     Style        ██████████████░░░░ 85%             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ #2  [Avatar] Alex Rivera          🟡 85% MATCH      │   │
│  │     "Strong match in adventure preferences"         │   │
│  │     [Adventure] [Beach] [Social]                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ #3  [Avatar] Emma Thompson        🟡 78% MATCH      │   │
│  │     "Similar budget and travel pace"                │   │
│  │     [Culture] [Food] [Photography]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. AI Planner Tab

```
┌─────────────────────────────────────────────────────────────┐
│  🗺️ AI ITINERARY PLANNER         [✨ GENERATE PLAN]        │
│  Get a personalized day-by-day plan powered by Gemini AI    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │
│  │ 📍 Bali│ │📅 10   │ │💰 $120 │ │⏰ Mod. │             │
│  │        │ │ Days   │ │ /day   │ │        │             │
│  └────────┘ └────────┘ └────────┘ └────────┘             │
│                                                             │
│  🟢 ESTIMATED TOTAL COST: $1,000 - $1,500                  │
│                                                             │
│  DAY-BY-DAY PLAN                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1️⃣  Day 1 - Arrival & Ubud Welcome    $100-140     │   │
│  │                                                      │   │
│  │     → Morning: Airport pickup & hotel check-in      │   │
│  │     → Lunch: Traditional warung near Monkey Forest  │   │
│  │     → Afternoon: Ubud Palace & Art Market           │   │
│  │     → Evening: Welcome dinner at organic cafe       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 2️⃣  Day 2 - Temples & Rice Terraces   $120-160     │   │
│  │                                                      │   │
│  │     → Early morning: Tegalalang Rice Terraces       │   │
│  │     → Lunch: Cafe with terrace view                 │   │
│  │     → Afternoon: Tirta Empul temple visit           │   │
│  │     → Evening: Traditional Balinese dance show      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 3️⃣  Day 3 - Beach Day in Seminyak     $90-130      │   │
│  │                                                      │   │
│  │     → Morning: Beach yoga session                   │   │
│  │     → Lunch: Beachfront seafood restaurant          │   │
│  │     → Afternoon: Swimming & sunbathing              │   │
│  │     → Evening: Sunset cocktails at beach club       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ✨ TRAVEL TIPS & RECOMMENDATIONS                          │
│  • Rent a scooter for easy transportation ($5/day)         │
│  • Try nasi goreng for breakfast at local warungs          │
│  • Book sunset spots in advance during peak season         │
│  • Bring reef-safe sunscreen for beach activities          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. Dashboard Page (`/dashboard`)

```
┌─────────────────────────────────────────────────────────────┐
│  WANDERLINK                              [CONNECT WALLET]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WELCOME BACK, SARAH CHEN!                                 │
│  Track your trips, manage bookings, and discover new       │
│                                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │ 📍28 │ │ 👥12 │ │ 📈95%│ │ 🏆3  │                     │
│  │Joined│ │Hosted│ │ Rep  │ │Verif.│                     │
│  └──────┘ └──────┘ └──────┘ └──────┘                     │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │     +        │ │     ✨       │ │     🛡️       │      │
│  │ CREATE TRIP  │ │ AI MATCH     │ │ GET VERIFIED │      │
│  │ Host your    │ │ Find compat. │ │ Increase     │      │
│  │ adventure    │ │ travelers    │ │ trust        │      │
│  └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                             │
│  MY BOOKINGS                                  View All →   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Img] Bali Beach Experience         🟢 CONFIRMED    │   │
│  │       Bali, Indonesia                               │   │
│  │       📅 Nov 15  👥 5/8                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  HOSTING                                  Create Trip +    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Img] Morocco Desert & Cities       🟡 3 SPOTS      │   │
│  │       Marrakech, Morocco                            │   │
│  │       📅 10 days  👥 3/10                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ✨ AI RECOMMENDATIONS FOR YOU                             │
│  ┌──────┐ ┌──────┐ ┌──────┐                              │
│  │[Img] │ │[Img] │ │[Img] │                              │
│  │Tokyo │ │Costa │ │Iceland                               │
│  │$1800 │ │Rica  │ │$2200│                               │
│  └──────┘ └──────┘ └──────┘                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Showcase

### AI Match Card

```
┌─────────────────────────────────────────────────┐
│ #1   [Avatar]  Sarah Chen      🟢 92% MATCH    │
│                                                 │
│      "Perfect alignment in travel style and    │
│       interests! Same photography passion."    │
│                                                 │
│      [Beach] [Photography] [Culture]           │
│                                                 │
│      Show Compatibility Details →              │
└─────────────────────────────────────────────────┘
```

### Day Card (Itinerary)

```
┌─────────────────────────────────────────────────┐
│  1️⃣  Day 1 - Arrival & Introduction  $100-150 │
│                                                 │
│      → Morning: Airport pickup & check-in      │
│      → Lunch: Local cafe near hotel            │
│      → Afternoon: City walking tour            │
│      → Evening: Welcome dinner with group      │
└─────────────────────────────────────────────────┘
```

### Stat Card

```
┌──────────────┐
│  📍         │
│             │
│ TRIPS       │
│ JOINED      │
│             │
│     28      │
└──────────────┘
```

### Quick Action Card

```
┌───────────────────┐
│    ┌─────┐       │
│    │  +  │       │
│    └─────┘       │
│                   │
│  CREATE TRIP      │
│                   │
│  Host your own    │
│  adventure        │
└───────────────────┘
```

---

## 🎨 Color Palette

### Gradients
- **Primary CTA:** `from-orange-500 via-pink-500 to-purple-500`
- **AI Features:** `from-yellow-400 to-orange-500` (Match), `from-purple-400 to-pink-500` (Planner)
- **Stats:** Orange, Blue, Green, Purple

### Status Colors
- **Open/Available:** 🟢 Green `bg-green-400`
- **Confirmed:** 🟢 Green `bg-green-400`
- **Pending:** 🟡 Yellow `bg-yellow-400`
- **Full:** 🟡 Yellow `bg-yellow-400`
- **Cancelled:** 🔴 Red `bg-red-400`

### Synergy Colors
- **85%+:** 🟢 Green `from-green-400 to-emerald-500`
- **70-84%:** 🟡 Yellow `from-yellow-400 to-orange-500`
- **<70%:** 🟠 Orange `from-orange-400 to-red-500`

---

## 📐 Layout Breakpoints

### Mobile (< 640px)
- Single column layouts
- Stacked cards
- Full-width buttons
- Hidden secondary nav

### Tablet (640px - 1024px)
- 2-column grids
- Side-by-side cards
- Visible nav items

### Desktop (1024px+)
- 3-4 column grids
- Sidebar layouts
- Full feature set

---

## ✨ Interactive States

### Buttons
**Default:**
```css
shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
```

**Hover:**
```css
shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
translate-x-1 translate-y-1
```

**Active/Pressed:**
```css
shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]
translate-x-2 translate-y-2
```

### Cards
**Default:**
```css
shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
```

**Hover:**
```css
shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
translate-x-1 translate-y-1
```

---

## 🔤 Typography Scale

### Display
- `text-6xl font-black` - Hero headlines (60px)
- `text-5xl font-black` - Page titles (48px)
- `text-4xl font-black` - Section headers (36px)

### Headings
- `text-3xl font-black` - Card titles (30px)
- `text-2xl font-black` - Subsections (24px)
- `text-xl font-black` - List items (20px)

### Body
- `text-lg font-bold` - Primary text (18px)
- `text-base font-semibold` - Secondary (16px)
- `text-sm font-bold` - Labels (14px)
- `text-xs font-bold` - Metadata (12px)

---

## 🎯 Icon Usage

### Navigation Icons
- `ArrowLeft` - Back buttons
- `ArrowRight` - Forward/View More
- `ChevronRight` - List items

### Feature Icons
- `Sparkles` - AI features
- `MapPin` - Location/Destination
- `Calendar` - Dates/Schedule
- `Users` - People/Groups
- `DollarSign` - Money/Budget
- `Shield` - Security/Safety
- `Award` - Achievements
- `TrendingUp` - Stats/Progress
- `Heart` - Favorites
- `Share2` - Social sharing

### Status Icons
- `Check` - Verified/Complete
- `Loader2` - Loading (animated)
- `X` - Close/Remove

---

## 📱 Mobile Optimizations

### Touch Targets
- Minimum 44x44px for buttons
- Large tap areas for cards
- Swipe gestures for galleries

### Performance
- Lazy load images
- Skeleton screens during AI generation
- Optimistic UI updates

### UX
- Bottom navigation on mobile
- Sticky headers
- Collapsible sections
- Pull-to-refresh

---

## 🚀 Animation Details

### Page Transitions
- Fade in: `opacity-0 → opacity-100`
- Slide up: `translate-y-4 → translate-y-0`
- Duration: `300ms`

### Loading States
- Spinner: `animate-spin`
- Pulse: `animate-pulse`
- Bounce: `animate-bounce`

### Hover Effects
- Scale on images: `hover:scale-110`
- Shadow shift: `shadow-[6px] → shadow-[3px]`
- Position shift: `translate-x-1 translate-y-1`

---

## 🎨 Accessibility

### Colors
- ✅ WCAG AA contrast ratios
- ✅ Color-blind friendly status indicators
- ✅ Dark text on light backgrounds

### Interaction
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Screen reader labels
- ✅ Semantic HTML

### Content
- ✅ Alt text on images
- ✅ Descriptive button labels
- ✅ Clear error messages
- ✅ Loading announcements

---

**This is your complete visual reference guide! 🎨**

Use this when building new components or adjusting the design. Everything follows the neobrutalism style with bold borders, dramatic shadows, and vibrant gradients!
