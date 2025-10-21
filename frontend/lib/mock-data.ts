export interface User {
  id: string;
  address: string;
  name: string;
  avatar: string;
  bio: string;
  reputation: number;
  verifications: string[];
  tripsHosted: number;
  tripsJoined: number;
  createdAt: string;
}

export interface Trip {
  id: string;
  hostAddress: string;
  host: User;
  title: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  participants: User[];
  depositAmount: string;
  totalCost: string;
  status: 'open' | 'full' | 'active' | 'completed' | 'cancelled';
  description: string;
  images: string[];
  itinerary: string[];
  preferences: TripPreferences;
  tags: string[];
  createdAt: string;
}

export interface TripPreferences {
  ageRange: [number, number];
  interests: string[];
  budget: 'budget' | 'moderate' | 'luxury';
  pace: 'relaxed' | 'moderate' | 'active';
  vibe: string[];
}

export interface Booking {
  id: string;
  tripId: string;
  trip: Trip;
  userAddress: string;
  user: User;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  depositTxHash?: string;
  amount: string;
  createdAt: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    address: '0x1234...5678',
    name: 'Sarah Chen',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: '🌍 Digital nomad | 📸 Travel photographer | 🎒 42 countries visited',
    reputation: 95,
    verifications: ['WorldID', 'KYC', 'Email'],
    tripsHosted: 12,
    tripsJoined: 28,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    address: '0x2345...6789',
    name: 'Alex Rivera',
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: '🏄 Adventure seeker | 🎸 Music lover | 🌴 Island hopper',
    reputation: 88,
    verifications: ['WorldID', 'Email'],
    tripsHosted: 8,
    tripsJoined: 15,
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    address: '0x3456...7890',
    name: 'Emma Thompson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: '🎨 Art enthusiast | 🍜 Foodie | 🏛️ History buff',
    reputation: 92,
    verifications: ['WorldID', 'KYC', 'Email', 'LinkedIn'],
    tripsHosted: 15,
    tripsJoined: 22,
    createdAt: '2023-11-10',
  },
  {
    id: '4',
    address: '0x4567...8901',
    name: 'Marcus Kim',
    avatar: 'https://i.pravatar.cc/150?img=14',
    bio: '🏔️ Mountain climber | 📚 Book nerd | ☕ Coffee addict',
    reputation: 85,
    verifications: ['Email'],
    tripsHosted: 5,
    tripsJoined: 18,
    createdAt: '2024-03-05',
  },
  {
    id: '5',
    address: '0x5678...9012',
    name: 'Luna Martinez',
    avatar: 'https://i.pravatar.cc/150?img=9',
    bio: '🧘 Yoga teacher | 🌱 Vegan traveler | 🌊 Beach lover',
    reputation: 90,
    verifications: ['WorldID', 'KYC', 'Email'],
    tripsHosted: 10,
    tripsJoined: 20,
    createdAt: '2023-12-01',
  },
];

// Mock Trips
export const mockTrips: Trip[] = [
  {
    id: '1',
    hostAddress: '0x1234...5678',
    host: mockUsers[0],
    title: 'Bali Beach & Culture Experience',
    destination: 'Bali',
    country: 'Indonesia',
    startDate: '2025-11-15',
    endDate: '2025-11-25',
    maxParticipants: 8,
    currentParticipants: 5,
    participants: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3], mockUsers[4]],
    depositAmount: '0.5',
    totalCost: '1200',
    status: 'open',
    description: 'Join us for an unforgettable 10-day adventure in Bali! We\'ll explore pristine beaches, ancient temples, rice terraces, and immerse ourselves in Balinese culture. Perfect mix of relaxation and adventure!',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=800',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
    ],
    itinerary: [
      'Day 1-2: Arrive in Ubud, temple visits',
      'Day 3-4: Rice terrace trek, cooking class',
      'Day 5-7: Beach time in Seminyak',
      'Day 8-9: Nusa Penida island tour',
      'Day 10: Departure',
    ],
    preferences: {
      ageRange: [25, 40],
      interests: ['Beach', 'Culture', 'Photography', 'Food'],
      budget: 'moderate',
      pace: 'moderate',
      vibe: ['Chill', 'Social', 'Adventurous'],
    },
    tags: ['Beach', 'Culture', 'Photography', 'Wellness'],
    createdAt: '2025-10-01',
  },
  {
    id: '2',
    hostAddress: '0x3456...7890',
    host: mockUsers[2],
    title: 'Tokyo Food & Art Tour',
    destination: 'Tokyo',
    country: 'Japan',
    startDate: '2025-12-01',
    endDate: '2025-12-08',
    maxParticipants: 6,
    currentParticipants: 4,
    participants: [mockUsers[2], mockUsers[1], mockUsers[3], mockUsers[4]],
    depositAmount: '0.8',
    totalCost: '1800',
    status: 'open',
    description: 'Discover Tokyo through its incredible food scene and vibrant art culture. From Michelin ramen to contemporary galleries, we\'ll experience the best of modern and traditional Tokyo.',
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      'https://images.unsplash.com/photo-1542931287-023b922fa89b?w=800',
      'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800',
    ],
    itinerary: [
      'Day 1: Shibuya & Harajuku street food',
      'Day 2: Tsukiji Market & sushi workshop',
      'Day 3: TeamLab Borderless & Odaiba',
      'Day 4: Traditional temples in Asakusa',
      'Day 5: Akihabara & contemporary art',
      'Day 6-7: Free day & sayonara dinner',
    ],
    preferences: {
      ageRange: [22, 45],
      interests: ['Food', 'Art', 'Photography', 'Culture'],
      budget: 'luxury',
      pace: 'active',
      vibe: ['Foodie', 'Cultural', 'Urban Explorer'],
    },
    tags: ['Food', 'Art', 'Urban', 'Culture'],
    createdAt: '2025-09-25',
  },
  {
    id: '3',
    hostAddress: '0x2345...6789',
    host: mockUsers[1],
    title: 'Patagonia Hiking Adventure',
    destination: 'Patagonia',
    country: 'Chile & Argentina',
    startDate: '2026-01-10',
    endDate: '2026-01-20',
    maxParticipants: 10,
    currentParticipants: 7,
    participants: [mockUsers[1], mockUsers[0], mockUsers[2], mockUsers[3], mockUsers[4], mockUsers[0], mockUsers[1]],
    depositAmount: '1.0',
    totalCost: '2500',
    status: 'open',
    description: 'Epic adventure through Patagonia\'s most stunning landscapes! We\'ll hike Torres del Paine, visit Perito Moreno glacier, and camp under the southern stars. For serious hikers only!',
    images: [
      'https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=800',
      'https://images.unsplash.com/photo-1625064877485-36c99e8ffc8e?w=800',
      'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800',
    ],
    itinerary: [
      'Day 1-2: Arrive Puerto Natales, gear up',
      'Day 3-6: Torres del Paine W Trek',
      'Day 7-8: Perito Moreno glacier',
      'Day 9: El Chalten day hikes',
      'Day 10: Departure from El Calafate',
    ],
    preferences: {
      ageRange: [25, 50],
      interests: ['Hiking', 'Nature', 'Photography', 'Adventure'],
      budget: 'moderate',
      pace: 'active',
      vibe: ['Adventurous', 'Nature Lover', 'Challenging'],
    },
    tags: ['Hiking', 'Adventure', 'Nature', 'Photography'],
    createdAt: '2025-09-30',
  },
  {
    id: '4',
    hostAddress: '0x5678...9012',
    host: mockUsers[4],
    title: 'Yoga Retreat in Costa Rica',
    destination: 'Santa Teresa',
    country: 'Costa Rica',
    startDate: '2025-11-20',
    endDate: '2025-11-27',
    maxParticipants: 12,
    currentParticipants: 9,
    participants: [mockUsers[4], mockUsers[0], mockUsers[2], mockUsers[3], mockUsers[1], mockUsers[0], mockUsers[2], mockUsers[3], mockUsers[4]],
    depositAmount: '0.6',
    totalCost: '1500',
    status: 'open',
    description: 'Find your zen in paradise! Daily yoga sessions, meditation, healthy meals, surfing, and plenty of beach time. Perfect for beginners and experienced yogis alike.',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
      'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800',
    ],
    itinerary: [
      'Daily morning yoga & meditation',
      'Afternoon surf lessons',
      'Organic farm visit',
      'Waterfall hike',
      'Beach bonfire & sound healing',
      'Free time for relaxation',
    ],
    preferences: {
      ageRange: [22, 55],
      interests: ['Yoga', 'Wellness', 'Beach', 'Surfing'],
      budget: 'moderate',
      pace: 'relaxed',
      vibe: ['Chill', 'Wellness', 'Mindful'],
    },
    tags: ['Wellness', 'Yoga', 'Beach', 'Relaxation'],
    createdAt: '2025-10-05',
  },
  {
    id: '5',
    hostAddress: '0x4567...8901',
    host: mockUsers[3],
    title: 'Northern Lights in Iceland',
    destination: 'Reykjavik',
    country: 'Iceland',
    startDate: '2025-12-15',
    endDate: '2025-12-22',
    maxParticipants: 8,
    currentParticipants: 8,
    participants: [mockUsers[3], mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[4], mockUsers[0], mockUsers[1], mockUsers[2]],
    depositAmount: '0.9',
    totalCost: '2200',
    status: 'full',
    description: 'Chase the Aurora Borealis across Iceland! Blue Lagoon, ice caves, glacier hiking, and hopefully, spectacular Northern Lights. Winter adventure at its finest!',
    images: [
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800',
    ],
    itinerary: [
      'Day 1: Arrive, Blue Lagoon',
      'Day 2-3: Golden Circle tour',
      'Day 4: South coast & ice cave',
      'Day 5: Glacier hiking',
      'Day 6-7: Northern Lights hunting',
      'Day 8: Departure',
    ],
    preferences: {
      ageRange: [25, 50],
      interests: ['Nature', 'Photography', 'Adventure', 'Northern Lights'],
      budget: 'luxury',
      pace: 'moderate',
      vibe: ['Adventurous', 'Nature Lover', 'Photography'],
    },
    tags: ['Northern Lights', 'Nature', 'Photography', 'Winter'],
    createdAt: '2025-09-20',
  },
  {
    id: '6',
    hostAddress: '0x1234...5678',
    host: mockUsers[0],
    title: 'Morocco Desert & Cities',
    destination: 'Marrakech',
    country: 'Morocco',
    startDate: '2026-02-01',
    endDate: '2026-02-10',
    maxParticipants: 10,
    currentParticipants: 3,
    participants: [mockUsers[0], mockUsers[2], mockUsers[4]],
    depositAmount: '0.7',
    totalCost: '1400',
    status: 'open',
    description: 'Explore the magic of Morocco! From bustling Marrakech souks to sleeping under stars in the Sahara. Experience the rich culture, amazing food, and warm hospitality.',
    images: [
      'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
      'https://images.unsplash.com/photo-1565083915473-fecce1e17f3d?w=800',
      'https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=800',
    ],
    itinerary: [
      'Day 1-2: Marrakech medina & souks',
      'Day 3: Atlas Mountains day trip',
      'Day 4-5: Sahara desert camp',
      'Day 6-7: Fes old city',
      'Day 8: Chefchaouen blue city',
      'Day 9-10: Return & departure',
    ],
    preferences: {
      ageRange: [20, 45],
      interests: ['Culture', 'Food', 'Photography', 'Adventure'],
      budget: 'budget',
      pace: 'moderate',
      vibe: ['Cultural', 'Adventurous', 'Foodie'],
    },
    tags: ['Culture', 'Desert', 'Food', 'Adventure'],
    createdAt: '2025-10-10',
  },
];

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: '1',
    tripId: '1',
    trip: mockTrips[0],
    userAddress: '0x2345...6789',
    user: mockUsers[1],
    status: 'confirmed',
    depositTxHash: '0xabc123...def456',
    amount: '0.5',
    createdAt: '2025-10-05',
  },
  {
    id: '2',
    tripId: '2',
    trip: mockTrips[1],
    userAddress: '0x1234...5678',
    user: mockUsers[0],
    status: 'confirmed',
    depositTxHash: '0xdef456...abc789',
    amount: '0.8',
    createdAt: '2025-10-02',
  },
  {
    id: '3',
    tripId: '4',
    trip: mockTrips[3],
    userAddress: '0x3456...7890',
    user: mockUsers[2],
    status: 'pending',
    amount: '0.6',
    createdAt: '2025-10-15',
  },
];
