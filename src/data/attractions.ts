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
    lat: number; // latitude
    lng: number; // longitude
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
    coordinates: { lat: 1.2834, lng: 103.8607 },
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
    coordinates: { lat: 1.2816, lng: 103.8636 },
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
    coordinates: { lat: 1.2494, lng: 103.8303 },
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
    coordinates: { lat: 1.4043, lng: 103.7930 },
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
    coordinates: { lat: 1.2821, lng: 103.8442 },
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
    coordinates: { lat: 1.3048, lng: 103.8318 },
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
    coordinates: { lat: 1.3049, lng: 103.8454 },
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
    coordinates: { lat: 1.2929, lng: 103.8547 },
    highlights: ["360° City Views", "Capsule Dining", "Photography", "Sunset Views", "Marina Bay Views"],
    nearbyFood: ["Singapore Flyer Sky Dining", "Kopitiam", "1-Altitude Gallery & Bar"]
  },
  {
    id: "merlion-park",
    name: "Merlion Park",
    description: "Singapore's iconic symbol - a mythical creature with a lion's head and fish body, spouting water into Marina Bay.",
    category: "tourist",
    rating: 4.3,
    reviewCount: 45621,
    openingHours: "24/7",
    ticketPrice: "Free",
    budgetCategory: "budget",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.2866, lng: 103.8545 },
    highlights: ["Iconic Photo Spot", "Marina Bay Views", "Singapore Symbol", "Waterfront Walk"],
    nearbyFood: ["Fullerton Bay Hotel", "The Clifford Pier", "One Fullerton"]
  },
  {
    id: "universal-studios",
    name: "Universal Studios Singapore",
    description: "Southeast Asia's first Universal Studios theme park featuring thrilling rides and movie-themed attractions.",
    category: "tourist",
    rating: 4.5,
    reviewCount: 38947,
    openingHours: "10:00 AM - 7:00 PM (varies by season)",
    ticketPrice: "S$79 adults, S$59 children",
    budgetCategory: "luxury",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.2540, lng: 103.8238 },
    highlights: ["Transformers Ride", "Jurassic Park", "Shrek 4-D Adventure", "Battlestar Galactica", "Movie Magic"],
    nearbyFood: ["Mel's Drive-In", "Discovery Food Court", "KT's Grill"]
  },
  {
    id: "singapore-botanic-gardens",
    name: "Singapore Botanic Gardens",
    description: "UNESCO World Heritage tropical garden featuring the world-famous National Orchid Garden.",
    category: "tourist",
    rating: 4.6,
    reviewCount: 28543,
    openingHours: "5:00 AM - 12:00 AM",
    ticketPrice: "Free (Orchid Garden: S$5 adults)",
    budgetCategory: "budget",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.3138, lng: 103.8159 },
    highlights: ["National Orchid Garden", "Swan Lake", "Heritage Trees", "Concert Performances", "Nature Walks"],
    nearbyFood: ["Casa Verde", "Corner House", "Halia Restaurant"]
  },
  {
    id: "clarke-quay",
    name: "Clarke Quay",
    description: "Historic riverside quay transformed into a vibrant dining and nightlife destination along the Singapore River.",
    category: "tourist",
    rating: 4.4,
    reviewCount: 21456,
    openingHours: "24/7 (Individual venues vary)",
    ticketPrice: "Free to explore",
    budgetCategory: "mid-range",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.2884, lng: 103.8467 },
    highlights: ["River Cruise", "Nightlife", "Dining", "Historic Architecture", "Entertainment"],
    nearbyFood: ["Jumbo Seafood", "Long Beach Seafood", "Brewerkz", "Ministry of Sound"]
  },
  {
    id: "little-india",
    name: "Little India",
    description: "Vibrant ethnic quarter showcasing Indian culture, temples, colorful shophouses, and authentic cuisine.",
    category: "culture",
    rating: 4.2,
    reviewCount: 16789,
    openingHours: "24/7 (Shops: 9:00 AM - 9:00 PM)",
    ticketPrice: "Free to explore",
    budgetCategory: "budget",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.3067, lng: 103.8513 },
    highlights: ["Sri Veeramakaliamman Temple", "Mustafa Centre", "Tekka Centre", "Traditional Crafts", "Spice Shopping"],
    nearbyFood: ["Tekka Centre", "Banana Leaf Apolo", "Muthu's Curry", "Indian Heritage Centre Café"]
  },
  {
    id: "kampong-glam",
    name: "Kampong Glam",
    description: "Historic Malay-Arab quarter featuring the iconic Sultan Mosque, traditional crafts, and Middle Eastern cuisine.",
    category: "culture",
    rating: 4.3,
    reviewCount: 14523,
    openingHours: "24/7 (Shops: 10:00 AM - 8:00 PM)",
    ticketPrice: "Free to explore",
    budgetCategory: "budget",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.3014, lng: 103.8591 },
    highlights: ["Sultan Mosque", "Haji Lane", "Malay Heritage Centre", "Traditional Crafts", "Arab Street"],
    nearbyFood: ["Zam Zam Restaurant", "Piedra Negra", "Café Le Caire", "Turkish Delights"]
  },
  {
    id: "jurong-bird-park",
    name: "Jurong Bird Park",
    description: "World's largest walk-in aviary featuring over 5,000 birds from 400 species in naturalistic habitats.",
    category: "tourist",
    rating: 4.5,
    reviewCount: 12847,
    openingHours: "8:30 AM - 6:00 PM",
    ticketPrice: "S$37 adults, S$25 children",
    budgetCategory: "mid-range",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.3192, lng: 103.7065 },
    highlights: ["Waterfall Aviary", "African Wetlands", "Penguin Coast", "Bird Shows", "Breeding Programs"],
    nearbyFood: ["Bongo Burgers", "Song of the Sea", "Flamingo Pool Café"]
  },
  {
    id: "night-safari",
    name: "Night Safari",
    description: "World's first nocturnal zoo offering unique wildlife experiences in a moonlit tropical setting.",
    category: "tourist",
    rating: 4.5,
    reviewCount: 23156,
    openingHours: "7:15 PM - 12:00 AM",
    ticketPrice: "S$49 adults, S$33 children",
    budgetCategory: "mid-range",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.4030, lng: 103.7894 },
    highlights: ["Tram Safari", "Walking Trails", "Animal Shows", "Fire Dance", "Nocturnal Animals"],
    nearbyFood: ["Ulu Ulu Safari Restaurant", "Bongo Burgers", "Ben & Jerry's"]
  },
  {
    id: "newton-food-centre",
    name: "Newton Food Centre",
    description: "Famous 24-hour hawker center known for barbecued seafood, satay, and authentic local dishes.",
    category: "food",
    rating: 4.1,
    reviewCount: 18945,
    openingHours: "24/7",
    ticketPrice: "S$5-15 per dish",
    budgetCategory: "budget",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.3120, lng: 103.8383 },
    highlights: ["BBQ Seafood", "Satay", "Carrot Cake", "Oyster Omelette", "Late Night Dining"],
    nearbyFood: ["Alliance Seafood", "Hup Kee Fried Oyster", "Newton Circus Satay"]
  },
  {
    id: "lau-pa-sat",
    name: "Lau Pa Sat",
    description: "Historic Victorian-era market turned hawker center in the heart of the financial district.",
    category: "food",
    rating: 4.2,
    reviewCount: 22643,
    openingHours: "24/7",
    ticketPrice: "S$4-12 per dish",
    budgetCategory: "budget",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.2804, lng: 103.8500 },
    highlights: ["Historic Architecture", "Satay Street", "Local Cuisine", "Central Location", "Night Market"],
    nearbyFood: ["Satay Stalls", "Ye Olde Breadshop", "Traditional Hokkien Mee", "Ice Kachang"]
  },
  {
    id: "east-coast-park",
    name: "East Coast Park Food Centre",
    description: "Beachside hawker center offering fresh seafood and local favorites with ocean views.",
    category: "food",
    rating: 4.3,
    reviewCount: 15782,
    openingHours: "6:00 AM - 11:00 PM",
    ticketPrice: "S$5-18 per dish",
    budgetCategory: "budget",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.3016, lng: 103.9067 },
    highlights: ["Seafood BBQ", "Laksa", "Chili Crab", "Beach Dining", "Cycling Nearby"],
    nearbyFood: ["Long Beach Seafood", "Roland Restaurant", "East Coast Lagoon Food Village"]
  },
  {
    id: "holland-village",
    name: "Holland Village Food Centre",
    description: "Popular expat dining hub featuring diverse Asian cuisine and vibrant nightlife scene.",
    category: "food",
    rating: 4.2,
    reviewCount: 13456,
    openingHours: "8:00 AM - 11:00 PM",
    ticketPrice: "S$4-15 per dish",
    budgetCategory: "budget",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.3115, lng: 103.7965 },
    highlights: ["Wanton Mee", "Chicken Rice", "International Food", "Bar Scene", "Expat Favorite"],
    nearbyFood: ["Holland Drive Food Centre", "Holland Village Shopping Centre", "Various Bars & Cafes"]
  },
  {
    id: "raffles-hotel",
    name: "Raffles Hotel Singapore",
    description: "Legendary colonial-style luxury hotel and birthplace of the Singapore Sling cocktail.",
    category: "tourist",
    rating: 4.4,
    reviewCount: 8934,
    openingHours: "24/7 (Tours: 10:00 AM - 7:00 PM)",
    ticketPrice: "Free to visit lobby and shops",
    budgetCategory: "luxury",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.2966, lng: 103.8544 },
    highlights: ["Singapore Sling", "Colonial Architecture", "Long Bar", "Luxury Shopping", "Historic Tours"],
    nearbyFood: ["Long Bar", "Tiffin Room", "La Dame de Pic", "Raffles Grill"]
  },
  {
    id: "haw-par-villa",
    name: "Haw Par Villa",
    description: "Unique theme park featuring over 1,000 statues and dioramas depicting Chinese mythology and folklore.",
    category: "culture",
    rating: 4.0,
    reviewCount: 7821,
    openingHours: "9:00 AM - 7:00 PM",
    ticketPrice: "Free",
    budgetCategory: "budget",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.2820, lng: 103.7818 },
    highlights: ["Ten Courts of Hell", "Chinese Mythology", "Colorful Statues", "Educational Exhibits", "Unique Experience"],
    nearbyFood: ["Haw Par Villa Café", "Pasir Panjang Food Centre", "VivoCity Food Court"]
  },
  {
    id: "sea-aquarium",
    name: "S.E.A. Aquarium",
    description: "One of the world's largest aquariums featuring over 100,000 marine animals from 1,000 species.",
    category: "tourist",
    rating: 4.3,
    reviewCount: 31247,
    openingHours: "10:00 AM - 7:00 PM",
    ticketPrice: "S$41 adults, S$29 children",
    budgetCategory: "mid-range",
    images: ["/placeholder.svg"],
    coordinates: { lat: 1.2581, lng: 103.8197 },
    highlights: ["Open Ocean Gallery", "Shark Seas", "Dolphin Island", "Marine Life", "Educational Programs"],
    nearbyFood: ["Ocean Restaurant", "Feng Shui Inn", "Malaysian Food Street"]
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