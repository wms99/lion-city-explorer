export interface Attraction {
  id: string;
  name: string;
  description: string;
  category: 'tourist' | 'food' | 'shopping' | 'culture';
  rating: number;
  reviewCount: number;
  openingHours: string;
  ticketPrice: string;
  budgetCategory: 'budget' | 'mid-range' | 'luxury';
  images: string[];
  coordinates: {
    x: number; // percentage from left
    y: number; // percentage from top
  };
  highlights: string[];
  nearbyFood?: string[];
}

export const singaporeAttractions: Attraction[] = [
  {
    id: "marina-bay-sands",
    name: "Marina Bay Sands",
    description: "Iconic integrated resort featuring luxury hotel, casino, shopping, and the famous infinity pool with stunning city views.",
    category: "tourist",
    rating: 4.6,
    reviewCount: 25847,
    openingHours: "24/7 (SkyPark: 9:30 AM - 10:00 PM)",
    ticketPrice: "SkyPark: S$25 adults, S$20 children",
    budgetCategory: "luxury",
    images: ["/placeholder.svg"],
    coordinates: { x: 65, y: 55 },
    highlights: ["Infinity Pool", "SkyPark", "Shopping Mall", "Casino", "Fine Dining"],
    nearbyFood: ["CÉ LA VIE Restaurant", "Bread Street Kitchen", "Waku Ghin"]
  },
  {
    id: "gardens-by-the-bay",
    name: "Gardens by the Bay",
    description: "Futuristic botanical garden featuring the iconic Supertree Grove and stunning conservatories with exotic plants.",
    category: "tourist",
    rating: 4.7,
    reviewCount: 31256,
    openingHours: "5:00 AM - 2:00 AM (Conservatories: 9:00 AM - 9:00 PM)",
    ticketPrice: "Outdoor gardens: Free, Conservatories: S$28 adults",
    budgetCategory: "mid-range",
    images: ["/placeholder.svg"],
    coordinates: { x: 67, y: 60 },
    highlights: ["Supertree Grove", "Cloud Forest", "Flower Dome", "Light Show", "OCBC Skyway"],
    nearbyFood: ["Pollen Restaurant", "IndoCHine", "Satay by the Bay"]
  },
  {
    id: "sentosa-island",
    name: "Sentosa Island",
    description: "Resort island packed with theme parks, beaches, attractions, and entertainment for the whole family.",
    category: "tourist",
    rating: 4.5,
    reviewCount: 42891,
    openingHours: "24/7 (Individual attractions vary)",
    ticketPrice: "Island entry: S$1, Attractions vary",
    budgetCategory: "mid-range",
    images: ["/placeholder.svg"],
    coordinates: { x: 55, y: 80 },
    highlights: ["Universal Studios", "S.E.A. Aquarium", "Adventure Cove", "Beaches", "Cable Car"],
    nearbyFood: ["Coastes", "Tanjong Beach Club", "Greenwood Fish Market"]
  },
  {
    id: "singapore-zoo",
    name: "Singapore Zoo",
    description: "World-renowned open-concept zoo home to over 2,800 animals in naturalistic habitats.",
    category: "tourist",
    rating: 4.6,
    reviewCount: 18743,
    openingHours: "8:30 AM - 6:00 PM",
    ticketPrice: "S$39 adults, S$26 children",
    budgetCategory: "mid-range",
    images: ["/placeholder.svg"],
    coordinates: { x: 45, y: 25 },
    highlights: ["Orangutan Breakfast", "Elephant Show", "Reptile Garden", "Tram Ride", "White Rhino"],
    nearbyFood: ["Ah Meng Restaurant", "Inuka Café", "Ben & Jerry's"]
  },
  {
    id: "chinatown",
    name: "Chinatown",
    description: "Historic district featuring traditional shophouses, temples, street food, and cultural heritage.",
    category: "culture",
    rating: 4.4,
    reviewCount: 15632,
    openingHours: "24/7 (Shops: 9:00 AM - 9:00 PM)",
    ticketPrice: "Free to explore",
    budgetCategory: "budget",
    images: ["/placeholder.svg"],
    coordinates: { x: 58, y: 52 },
    highlights: ["Buddha Tooth Relic Temple", "Chinatown Street Market", "Heritage Centre", "Traditional Medicine Hall"],
    nearbyFood: ["Maxwell Food Centre", "Chinatown Complex", "Tian Tian Hainanese Chicken Rice"]
  },
  {
    id: "orchard-road",
    name: "Orchard Road",
    description: "Singapore's premier shopping district with luxury malls, international brands, and dining options.",
    category: "shopping",
    rating: 4.3,
    reviewCount: 22145,
    openingHours: "10:00 AM - 10:00 PM (varies by store)",
    ticketPrice: "Free to walk, shopping varies",
    budgetCategory: "luxury",
    images: ["/placeholder.svg"],
    coordinates: { x: 52, y: 45 },
    highlights: ["ION Orchard", "Takashimaya", "Ngee Ann City", "313@Somerset", "Emerald Hill"],
    nearbyFood: ["Din Tai Fung", "Crystal Jade", "Tim Ho Wan", "Food Republic"]
  },
  {
    id: "hawker-centres",
    name: "Hawker Centres",
    description: "Traditional food courts offering authentic local cuisines at affordable prices throughout Singapore.",
    category: "food",
    rating: 4.8,
    reviewCount: 8954,
    openingHours: "6:00 AM - 11:00 PM (varies by stall)",
    ticketPrice: "S$3-8 per dish",
    budgetCategory: "budget",
    images: ["/placeholder.svg"],
    coordinates: { x: 60, y: 48 },
    highlights: ["Chicken Rice", "Laksa", "Satay", "Char Kway Teow", "Rojak"],
    nearbyFood: ["Lau Pa Sat", "Newton Food Centre", "Chinatown Complex", "Tekka Centre"]
  },
  {
    id: "singapore-flyer",
    name: "Singapore Flyer",
    description: "Giant observation wheel offering panoramic 360-degree views of Singapore's skyline and beyond.",
    category: "tourist",
    rating: 4.4,
    reviewCount: 19837,
    openingHours: "8:30 AM - 10:30 PM",
    ticketPrice: "S$35 adults, S$25 children",
    budgetCategory: "mid-range",
    images: ["/placeholder.svg"],
    coordinates: { x: 70, y: 50 },
    highlights: ["360° City Views", "Capsule Dining", "Photography", "Sunset Views", "Marina Bay Views"],
    nearbyFood: ["Singapore Flyer Sky Dining", "Kopitiam", "1-Altitude Gallery & Bar"]
  }
];

export const getCategoryColor = (category: Attraction['category']) => {
  switch (category) {
    case 'tourist':
      return 'bg-primary text-primary-foreground';
    case 'food':
      return 'bg-secondary text-secondary-foreground';
    case 'shopping':
      return 'bg-accent text-accent-foreground';
    case 'culture':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const getBudgetColor = (budget: Attraction['budgetCategory']) => {
  switch (budget) {
    case 'budget':
      return 'text-green-600 bg-green-50';
    case 'mid-range':
      return 'text-yellow-600 bg-yellow-50';
    case 'luxury':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};