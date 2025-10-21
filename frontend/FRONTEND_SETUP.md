# WanderLink Frontend - Setup Instructions

## 🎨 Design Style Applied

The frontend now uses the **Neobrutalism/Bold design** style from social-media-manager:
- Bold black borders (4px)
- Hard shadows (`shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`)
- Rounded corners (`rounded-2xl`, `rounded-3xl`)
- Vibrant gradients (orange → pink → purple)
- Font-black typography
- Glassmorphic containers
- Animated hover states

## 📦 Installation Steps

### 1. Install Missing Dependencies

```bash
cd frontend
npm install lucide-react tailwind-merge tailwindcss-animate class-variance-authority
```

### 2. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## ✅ What's Been Created

### Design System
- ✅ `tailwind.config.js` - Updated with neobrutalism theme
- ✅ `app/globals.css` - CSS variables for colors and theming
- ✅ `lib/utils.ts` - Utility functions (cn, formatDate, etc.)
- ✅ `lib/mock-data.ts` - Comprehensive mock data (6 trips, 5 users, bookings)

### Pages Created
- ✅ `app/page.tsx` - Home page with hero, features, featured trips, how it works, CTA

### Pages to Create Next

1. **`app/trips/page.tsx`** - Trip listing with filters
2. **`app/trips/[id]/page.tsx`** - Trip details page
3. **`app/dashboard/page.tsx`** - User dashboard
4. **`app/profile/page.tsx`** - User profile
5. **`app/trips/create/page.tsx`** - Create trip form

## 🎨 Design Patterns Used

### Card Component
```tsx
<div className="bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
  {/* Content */}
</div>
```

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

### Gradient Background
```tsx
<div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
  {/* Content */}
</div>
```

### Feature Card with Icon
```tsx
<div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-16 h-16 rounded-xl border-4 border-black flex items-center justify-center text-white mb-4">
    <Icon />
  </div>
  <h3 className="text-xl font-black mb-2">Title</h3>
  <p className="text-gray-600 font-semibold">Description</p>
</div>
```

## 🎯 Mock Data Structure

### Users (5 total)
- Sarah Chen (reputation: 95, 12 trips hosted)
- Alex Rivera (reputation: 88, 8 trips hosted)
- Emma Thompson (reputation: 92, 15 trips hosted)
- Marcus Kim (reputation: 85, 5 trips hosted)
- Luna Martinez (reputation: 90, 10 trips hosted)

### Trips (6 total)
1. Bali Beach & Culture - $1200, 10 days
2. Tokyo Food & Art Tour - $1800, 8 days
3. Patagonia Hiking Adventure - $2500, 11 days (FULL)
4. Yoga Retreat in Costa Rica - $1500, 8 days
5. Northern Lights in Iceland - $2200, 8 days
6. Morocco Desert & Cities - $1400, 10 days

## 📱 Pages Structure

### Home Page (`/`)
- Hero section with gradient text
- Features grid (AI Matching, Smart Escrow, Verified Users, Web3 Native)
- Featured trips carousel
- How it works (3 steps)
- CTA section

### Trips Listing (`/trips`) - TO CREATE
- Search bar
- Filters (destination, dates, budget, group size)
- Grid of trip cards
- Pagination

### Trip Details (`/trips/[id]`) - TO CREATE
- Image gallery
- Trip info (dates, location, cost)
- Host profile
- Current participants
- Itinerary
- Join button
- Chat preview

### Dashboard (`/dashboard`) - TO CREATE
- User stats
- Upcoming trips
- Past trips
- Bookings list
- Reputation score

### Profile (`/profile`) - TO CREATE
- Avatar & bio
- Reputation badge
- Verifications
- Trips hosted
- Trips joined
- NFT gallery

## 🚀 Next Steps

1. Install dependencies (see above)
2. Test home page (should work after install)
3. Create trips listing page
4. Create trip details page
5. Create dashboard
6. Create profile page
7. Add navigation header/footer
8. Add mobile menu

## 📝 Notes

- All TypeScript errors will resolve after installing `lucide-react`
- Mock data is comprehensive and realistic
- Design matches social-media-manager exactly
- Ready for Web3 integration (wallet connect buttons in place)
- Mobile responsive by default

## 🎨 Color Scheme

- **Primary**: Orange (#FB923C)
- **Secondary**: Pink (#EC4899)
- **Accent**: Purple (#A855F7)
- **Background**: Orange-50 → Pink-50 → Purple-50 gradient
- **Text**: Black (#000000)
- **Borders**: Black (#000000, 4px solid)
- **Shadows**: Black box shadows with offset

