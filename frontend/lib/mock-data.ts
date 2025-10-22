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
    title: 'Goa Beach & Culture Experience',
    destination: 'Goa',
    country: 'India',
    startDate: '2025-09-15',
    endDate: '2025-09-25',
    maxParticipants: 8,
    currentParticipants: 8,
    participants: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3], mockUsers[4]],
    depositAmount: '0.5',
    totalCost: '1200',
    status: 'completed',
    description: 'Join us for an unforgettable 10-day adventure in Goa! We\'ll explore pristine beaches, Portuguese churches, spice plantations, and immerse ourselves in Goan culture. Perfect mix of relaxation and adventure!',
    images: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800',
      'https://images.unsplash.com/photo-1571139991382-e1d71b9c4bd5?w=800',
    ],
    itinerary: [
      'Day 1-2: Arrive in Panjim, church visits',
      'Day 3-4: Old Goa heritage tour, cooking class',
      'Day 5-7: Beach time in Anjuna & Vagator',
      'Day 8-9: Spice plantation & waterfall trek',
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
    title: 'Jaipur Food & Heritage Tour',
    destination: 'Jaipur',
    country: 'India',
    startDate: '2025-08-01',
    endDate: '2025-08-08',
    maxParticipants: 6,
    currentParticipants: 6,
    participants: [mockUsers[2], mockUsers[1], mockUsers[3], mockUsers[4]],
    depositAmount: '0.8',
    totalCost: '1800',
    status: 'completed',
    description: 'Discover Jaipur through its incredible food scene and vibrant heritage. From royal thalis to majestic forts, we\'ll experience the best of the Pink City.',
    images: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
    ],
    itinerary: [
      'Day 1: Jaipur bazaars & street food',
      'Day 2: Amber Fort & heritage walk',
      'Day 3: City Palace & Jantar Mantar',
      'Day 4: Hawa Mahal & local crafts',
      'Day 5: Nahargarh Fort sunset',
      'Day 6-7: Cooking class & farewell dinner',
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
    title: 'Ladakh Himalayan Adventure',
    destination: 'Leh-Ladakh',
    country: 'India',
    startDate: '2025-07-10',
    endDate: '2025-07-20',
    maxParticipants: 10,
    currentParticipants: 10,
    participants: [mockUsers[1], mockUsers[0], mockUsers[2], mockUsers[3], mockUsers[4], mockUsers[0], mockUsers[1]],
    depositAmount: '1.0',
    totalCost: '2500',
    status: 'completed',
    description: 'Epic adventure through Ladakh\'s most stunning landscapes! We\'ll explore high-altitude monasteries, ride through Khardung La pass, and camp under the Himalayan stars. For serious adventure seekers only!',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1589227365533-cee3700d6862?w=800',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    ],
    itinerary: [
      'Day 1-2: Arrive Leh, acclimatization',
      'Day 3-6: Nubra Valley via Khardung La',
      'Day 7-8: Pangong Lake camping',
      'Day 9: Monastery circuit - Thiksey & Hemis',
      'Day 10: Departure from Leh',
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
    title: 'Yoga Retreat in Rishikesh',
    destination: 'Rishikesh',
    country: 'India',
    startDate: '2025-06-20',
    endDate: '2025-06-27',
    maxParticipants: 12,
    currentParticipants: 12,
    participants: [mockUsers[4], mockUsers[0], mockUsers[2], mockUsers[3], mockUsers[1], mockUsers[0], mockUsers[2], mockUsers[3], mockUsers[4]],
    depositAmount: '0.6',
    totalCost: '1500',
    status: 'completed',
    description: 'Find your zen in the yoga capital of the world! Daily yoga sessions by the Ganges, meditation in ancient ashrams, healthy vegetarian meals, and Himalayan views. Perfect for beginners and experienced yogis alike.',
    images: [
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
      'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800',
      'https://images.unsplash.com/photo-1506452819137-0422416856b8?w=800',
    ],
    itinerary: [
      'Daily morning yoga by the Ganges',
      'Afternoon meditation in caves',
      'Ayurvedic massage & treatment',
      'Himalayan waterfall trek',
      'Ganga Aarti ceremony at sunset',
      'Free time for spiritual exploration',
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
    title: 'Kerala Backwaters & Spice Trail',
    destination: 'Alleppey',
    country: 'India',
    startDate: '2025-05-15',
    endDate: '2025-05-22',
    maxParticipants: 8,
    currentParticipants: 8,
    participants: [mockUsers[3], mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[4], mockUsers[0], mockUsers[1], mockUsers[2]],
    depositAmount: '0.9',
    totalCost: '2200',
    status: 'completed',
    description: 'Experience God\'s Own Country! Houseboat cruises through serene backwaters, spice plantation tours, Ayurvedic treatments, and authentic Kerala cuisine. Tropical paradise at its finest!',
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
      'https://images.unsplash.com/photo-1596414087706-d5c0f1e5b6f8?w=800',
      'https://images.unsplash.com/photo-1588580000645-4562a6d2c839?w=800',
    ],
    itinerary: [
      'Day 1: Arrive Kochi, explore Fort Kochi',
      'Day 2-3: Houseboat cruise in backwaters',
      'Day 4: Spice plantation tour in Thekkady',
      'Day 5: Tea gardens in Munnar',
      'Day 6-7: Beach relaxation in Varkala',
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
    title: 'Rajasthan Desert & Palaces',
    destination: 'Udaipur',
    country: 'India',
    startDate: '2025-04-01',
    endDate: '2025-04-10',
    maxParticipants: 10,
    currentParticipants: 10,
    participants: [mockUsers[0], mockUsers[2], mockUsers[4]],
    depositAmount: '0.7',
    totalCost: '1400',
    status: 'completed',
    description: 'Explore the magic of Rajasthan! From majestic palaces in Udaipur to sleeping under stars in the Thar Desert. Experience royal heritage, amazing Rajasthani food, and warm hospitality.',
    images: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
      'https://images.unsplash.com/photo-1608204409950-f71c1d933b6f?w=800',
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800',
    ],
    itinerary: [
      'Day 1-2: Udaipur palaces & Lake Pichola',
      'Day 3: Chittorgarh Fort day trip',
      'Day 4-5: Thar desert camp in Jaisalmer',
      'Day 6-7: Jodhpur blue city',
      'Day 8: Pushkar camel fair',
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
