import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bus, 
  Train, 
  Car, 
  MapPin, 
  Clock, 
  DollarSign, 
  Route, 
  Navigation,
  Wallet,
  Footprints,
  Route as RouteIcon,
  ChevronDown
} from "lucide-react";
import { singaporeAttractions, type Attraction } from "@/data/attractions";
import { oneMapService } from "@/services/oneMapService";

interface ItineraryItem {
  id: string;
  name: string;
  category: string;
  addedAt: string;
  day?: number;
}

interface TransportOption {
  type: 'mrt' | 'bus' | 'taxi' | 'grab' | 'tada' | 'gojek' | 'private_hire' | 'walk' | 'public_transport' | 'own_car';
  provider?: string;
  duration: string;
  cost: string;
  description: string;
  steps: string[];
  walkingTime?: string;
  realRouteData?: any; // OneMap route data
  features?: string[]; // Additional features like "Air-conditioned", "Door-to-door", etc.
}

interface ComfortChoice {
  selectedOption: TransportOption | null;
  availableOptions: TransportOption[];
}

interface RouteSegment {
  from: string;
  to: string;
  fromCoords: { lat: number; lng: number };
  toCoords: { lat: number; lng: number };
  distance: number;
  transportOptions: TransportOption[];
  recommended: TransportOption;
  comfortChoice?: ComfortChoice;
}

interface DayRoute {
  day: number;
  date: string;
  segments: RouteSegment[];
}

const Transport = () => {
  const { t } = useTranslation();
  const [savedItems, setSavedItems] = useState<ItineraryItem[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [routes, setRoutes] = useState<{
    budget: RouteSegment[];
    comfort: RouteSegment[];
    minimal_transfer: RouteSegment[];
  }>({ budget: [], comfort: [], minimal_transfer: [] });
  const [comfortChoices, setComfortChoices] = useState<{ [segmentIndex: number]: ComfortChoice }>({});
  const [dayRoutes, setDayRoutes] = useState<DayRoute[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Sync selected day with localStorage for cross-tab consistency
  useEffect(() => {
    const savedSelectedDay = localStorage.getItem('transport-selected-day');
    if (savedSelectedDay) {
      setSelectedDay(parseInt(savedSelectedDay));
    }
  }, []);

  const handleDayChange = (day: number) => {
    setSelectedDay(day);
    localStorage.setItem('transport-selected-day', day.toString());
    // Dispatch event to sync with Itinerary tab
    window.dispatchEvent(new CustomEvent('day-changed', { detail: { day } }));
  };

  useEffect(() => {
    const handleDayChangeFromOtherTab = (e: CustomEvent) => {
      if (e.detail?.day) {
        setSelectedDay(e.detail.day);
      }
    };

    window.addEventListener('day-changed', handleDayChangeFromOtherTab as EventListener);
    
    return () => {
      window.removeEventListener('day-changed', handleDayChangeFromOtherTab as EventListener);
    };
  }, []);

  useEffect(() => {
    const loadItinerary = () => {
      const saved = JSON.parse(localStorage.getItem('singapore-itinerary') || '[]');
      console.log('Loading itinerary for transport:', saved);
      setSavedItems(saved);
      
      // Get full attraction details maintaining the exact order from itinerary
      const attractionDetails = saved
        .map((item: ItineraryItem) => {
          const attraction = singaporeAttractions.find(a => a.id === item.id);
          return attraction ? { ...attraction, day: item.day, order: saved.indexOf(item) } : null;
        })
        .filter(Boolean) as (Attraction & { day?: number; order: number })[];
      
      console.log('Attraction details with day assignments:', attractionDetails);
      setAttractions(attractionDetails);
      
      if (attractionDetails.length >= 1) {
        generateRoutes(attractionDetails).then(async () => {
          // Generate day routes after main routes are created
          await generateDayRoutes(attractionDetails);
        }).catch(console.error);
      }
    };

    loadItinerary();
    
    // Listen for changes to the itinerary
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'singapore-itinerary') {
        console.log('Itinerary changed, reloading transport routes');
        loadItinerary();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when itinerary is updated in the same tab
    const handleItineraryUpdate = () => {
      console.log('Itinerary updated, reloading transport routes');
      setTimeout(loadItinerary, 100); // Small delay to ensure localStorage is updated
    };
    
    window.addEventListener('itinerary-updated', handleItineraryUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('itinerary-updated', handleItineraryUpdate);
    };
  }, []);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const generateTransportOptions = async (distance: number, from: string, to: string, fromCoords: { lat: number; lng: number }, toCoords: { lat: number; lng: number }): Promise<TransportOption[]> => {
    const options: TransportOption[] = [];
    
    // Skip OneMap API calls for now to improve performance
    // Generate options based on distance calculations for faster loading
    try {
      // Generate fallback options immediately for better performance
      const fallbackOptions = generateFallbackOptions(distance, from, to);
      return fallbackOptions;

    } catch (error) {
      console.error('Error generating transport options:', error);
      // Return fallback options if there's any error
      return generateFallbackOptions(distance, from, to);
    }
  };

  const generateFallbackOptions = (distance: number, from: string, to: string): TransportOption[] => {
    // Original distance-based calculations as fallback
    const options: TransportOption[] = [];
    
    const walkTime = Math.ceil(distance * 12);
    options.push({
      type: 'walk',
      duration: `${walkTime} min`,
      cost: 'Free',
      description: 'Walk directly to destination',
      steps: [`Walk from ${from} to ${to}`],
      walkingTime: `${walkTime} min`
    });

    if (distance > 0.5) {
      const mrtTime = Math.ceil(distance * 8 + 10);
      const walkToMrt = Math.round(distance * 300); // Estimate walk distance
      const walkFromMrt = Math.round(distance * 250);
      
      options.push({
        type: 'mrt',
        duration: `${mrtTime} min`,
        cost: 'S$1.40 - S$2.50',
        description: 'Take MRT (Mass Rapid Transit) - Budget Option',
        steps: [
          `Walk to nearest MRT station (~${walkToMrt}m, 5-8 min)`,
          `Take MRT Line towards destination area`,
          `Walk from MRT station to ${to} (~${walkFromMrt}m, 5-8 min)`
        ]
      });
    }

    const busTime = Math.ceil(distance * 10 + 8);
    const walkToBus = Math.round(distance * 200); // Shorter walk to bus stops
    const walkFromBus = Math.round(distance * 200);
    
    options.push({
      type: 'bus',
      duration: `${busTime} min`,
      cost: 'S$1.07 - S$2.17',
      description: 'Take public bus - Most Budget-Friendly',
      steps: [
        `Walk to nearest bus stop (~${walkToBus}m, 3-5 min)`,
        `Take public bus (check bus routes via CitymapperSG app)`,
        `Walk from bus stop to ${to} (~${walkFromBus}m, 3-5 min)`
      ]
    });

    if (distance > 0.5) {
      const taxiTime = Math.ceil(distance * 4 + 3);
      
      options.push({
        type: 'taxi',
        provider: 'ComfortDelGro',
        duration: `${taxiTime} min`,
        cost: distance < 2 ? "S$3.90 - S$6.00" : `S$${(3.90 + distance * 0.6).toFixed(2)} - S$${(3.90 + distance * 0.9).toFixed(2)}`,
        description: 'ComfortDelGro Taxi',
        steps: [`Book taxi or hail on street`, `Direct ride to ${to}`],
        features: ['Licensed taxi', 'Meter fare']
      });

      options.push({
        type: 'grab',
        provider: 'Grab',
        duration: `${taxiTime} min`,
        cost: distance < 2 ? "S$3.50 - S$8.00" : `S$${(3.50 + distance * 0.65).toFixed(2)} - S$${(3.50 + distance * 1.4).toFixed(2)}`,
        description: 'Grab Ride',
        steps: [`Book Grab via app`, `Driver picks up and drives to ${to}`],
        features: ['Cashless payment', 'Real-time tracking']
      });

      options.push({
        type: 'tada',
        provider: 'Tada', 
        duration: `${taxiTime} min`,
        cost: distance < 2 ? "S$3.00 - S$6.50" : `S$${(3.00 + distance * 0.6).toFixed(2)} - S$${(3.00 + distance * 0.8).toFixed(2)}`,
        description: 'Tada Ride',
        steps: [`Book Tada via app`, `Driver picks up and drives to ${to}`],
        features: ['Competitive rates', 'Frequent promotions']
      });
    }

    return options;
  };

  // Score transport options based on transfers and walking time
  const getTransferScore = (option: TransportOption): number => {
    let score = 0;
    
    // Count transfers based on steps
    const transferCount = option.steps.filter(step => 
      step.toLowerCase().includes('take') || 
      step.toLowerCase().includes('transfer') ||
      step.toLowerCase().includes('change')
    ).length;
    
    // Add penalty for each transfer
    score += transferCount * 10;
    
    // Add penalty for walking steps
    const walkingSteps = option.steps.filter(step => 
      step.toLowerCase().includes('walk')
    ).length;
    score += walkingSteps * 5;
    
    // Penalty for longer walking time
    if (option.walkingTime) {
      const walkMinutes = parseInt(option.walkingTime);
      score += Math.max(0, walkMinutes - 5); // No penalty for walking < 5 min
    }
    
    // Bonus for direct transport options (only for comfort routes, not minimal transfer)
    if (option.type === 'grab' || option.type === 'tada' || option.type === 'taxi' || option.type === 'own_car') {
      score -= 15; // Direct transport bonus
    }
    
    // Bonus for public transport with minimal transfers
    if (option.type === 'public_transport' && transferCount <= 1) {
      score -= 5;
    }
    
    return score;
  };

  // Get benefit description for minimal transfer options
  const getTransferBenefit = (option: TransportOption): string => {
    const transferCount = option.steps.filter(step => 
      step.toLowerCase().includes('take') || 
      step.toLowerCase().includes('transfer') ||
      step.toLowerCase().includes('change')
    ).length;
    
    const walkingSteps = option.steps.filter(step => 
      step.toLowerCase().includes('walk')
    ).length;
    
    if (option.type === 'grab' || option.type === 'tada' || option.type === 'taxi' || option.type === 'own_car') {
      return 'Direct door-to-door service';
    }
    
    if (transferCount === 0) {
      return 'No transfers required';
    }
    
    if (transferCount === 1) {
      return 'Single transfer only';
    }
    
    if (walkingSteps <= 2) {
      return 'Minimal walking required';
    }
    
    return 'Optimized for fewer transfers';
  };

  const generateRoutes = async (attractionList: Attraction[]) => {
    const segments: RouteSegment[] = [];
    
    // Generate route segments with real OneMap data
    for (let i = 0; i < attractionList.length - 1; i++) {
      const from = attractionList[i];
      const to = attractionList[i + 1];
      const distance = calculateDistance(
        from.coordinates.lat, from.coordinates.lng,
        to.coordinates.lat, to.coordinates.lng
      );
      
      const transportOptions = await generateTransportOptions(
        distance, 
        from.name, 
        to.name,
        from.coordinates,
        to.coordinates
      );
      
      segments.push({
        from: from.name,
        to: to.name,
        fromCoords: from.coordinates,
        toCoords: to.coordinates,
        distance,
        transportOptions,
        recommended: transportOptions[0], // Default to first option
        comfortChoice: {
          selectedOption: null,
          availableOptions: transportOptions.filter(opt => 
            ['taxi', 'grab', 'tada', 'gojek', 'private_hire', 'own_car'].includes(opt.type)
          )
        }
      });
    }

    // Generate different route optimizations
    const budgetRoutes = segments.map(segment => ({
      ...segment,
      recommended: segment.transportOptions.reduce((cheapest, current) => {
        const cheapestCost = parseFloat(cheapest.cost.replace(/[^0-9.]/g, '') || '999');
        const currentCost = parseFloat(current.cost.replace(/[^0-9.]/g, '') || '999');
        return currentCost < cheapestCost ? current : cheapest;
      })
    }));

    const comfortRoutes = segments.map(segment => ({
      ...segment,
      recommended: segment.distance > 1.0 
        ? segment.transportOptions.find(opt => opt.type === 'grab' || opt.type === 'tada') || 
          segment.transportOptions.find(opt => opt.type === 'taxi') ||
          segment.transportOptions.find(opt => opt.type === 'public_transport') || 
          segment.transportOptions[0]
        : segment.transportOptions.find(opt => opt.type === 'public_transport' || opt.type === 'mrt') || segment.transportOptions[0]
    }));

    const minimalTransferRoutes = segments.map(segment => ({
      ...segment,
      recommended: segment.transportOptions
        .filter(option => 
          // Only include public transport and walking for minimal transfer
          ['walk', 'mrt', 'bus', 'public_transport'].includes(option.type)
        )
        .reduce((bestOption, current) => {
          // Prioritize options with minimal transfers and walking
          const bestScore = getTransferScore(bestOption);
          const currentScore = getTransferScore(current);
          return currentScore < bestScore ? current : bestOption;
        })
    }));

    setRoutes({
      budget: budgetRoutes,
      comfort: comfortRoutes,
      minimal_transfer: minimalTransferRoutes
    });

    // Generate day routes after setting main routes
    return Promise.resolve();
  };

  const handleComfortChoice = (segmentIndex: number, option: TransportOption) => {
    setComfortChoices(prev => ({
      ...prev,
      [segmentIndex]: {
        selectedOption: option,
        availableOptions: routes.comfort[segmentIndex]?.comfortChoice?.availableOptions || []
      }
    }));
  };

  const getTransportIcon = (type: TransportOption['type']) => {
    switch (type) {
      case 'mrt': return <Train className="h-4 w-4" />;
      case 'bus': return <Bus className="h-4 w-4" />;
      case 'public_transport': return <Train className="h-4 w-4" />;
      case 'taxi':
      case 'grab':
      case 'tada':
      case 'gojek':
      case 'private_hire': return <Car className="h-4 w-4" />;
      case 'own_car': return <Car className="h-4 w-4" />;
      case 'walk': return <Footprints className="h-4 w-4" />;
      default: return <Navigation className="h-4 w-4" />;
    }
  };

  const getTransportColor = (type: TransportOption['type']) => {
    switch (type) {
      case 'mrt': return 'bg-blue-500';
      case 'bus': return 'bg-green-500';
      case 'public_transport': return 'bg-indigo-500';
      case 'taxi': return 'bg-yellow-500';
      case 'grab': return 'bg-green-600';
      case 'tada': return 'bg-purple-500';
      case 'gojek': return 'bg-orange-500';
      case 'private_hire': return 'bg-gray-700';
      case 'own_car': return 'bg-blue-600';
      case 'walk': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateTotalCost = (segments: RouteSegment[], useComfortChoices: boolean = false) => {
    return segments.reduce((total, segment, index) => {
      let option = segment.recommended;
      
      if (useComfortChoices && comfortChoices[index]?.selectedOption) {
        option = comfortChoices[index].selectedOption;
      }
      
      // Extract first number from cost string (e.g., "S$3.50 - S$8.00" -> 3.50)
      const costMatch = option.cost.match(/\d+\.?\d*/);
      const cost = costMatch ? parseFloat(costMatch[0]) : 0;
      return total + cost;
    }, 0);
  };

  const calculateTotalTime = (segments: RouteSegment[], useComfortChoices: boolean = false) => {
    return segments.reduce((total, segment, index) => {
      let option = segment.recommended;
      
      if (useComfortChoices && comfortChoices[index]?.selectedOption) {
        option = comfortChoices[index].selectedOption;
      }
      
      // Extract number from duration string (e.g., "15 min" -> 15)
      const timeMatch = option.duration.match(/\d+/);
      const time = timeMatch ? parseInt(timeMatch[0]) : 0;
      return total + time;
    }, 0);
  };

  const generateDayRoutes = async (attractionList: (Attraction & { day?: number; order: number })[]) => {
    console.log('Generating day routes for', attractionList.length, 'attractions');
    
    // Get the saved itinerary items with exact order and day assignments
    const saved = JSON.parse(localStorage.getItem('singapore-itinerary') || '[]');
    console.log('Saved itinerary items:', saved);
    
    // Get all unique days from the saved itinerary
    const allDays = new Set<number>();
    saved.forEach((item: ItineraryItem) => {
      if (item.day) {
        allDays.add(item.day);
      }
    });
    
    // If no days are assigned, create a default day 1
    if (allDays.size === 0 && attractionList.length > 0) {
      allDays.add(1);
    }
    
    // Group attractions by day, maintaining the order within each day
    const dayGroups: { [day: number]: (Attraction & { day?: number; order: number })[] } = {};
    
    attractionList.forEach((attraction) => {
      const day = attraction.day || 1; // Default to day 1 if no day assigned
      if (!dayGroups[day]) {
        dayGroups[day] = [];
      }
      dayGroups[day].push(attraction);
    });
    
    // Sort attractions within each day by their original order in the itinerary
    Object.keys(dayGroups).forEach(dayKey => {
      const day = parseInt(dayKey);
      dayGroups[day].sort((a, b) => a.order - b.order);
    });
    
    console.log('Day groups with sorted order:', dayGroups);
    console.log('All days from itinerary:', Array.from(allDays).sort());
    
    // Create day routes for ALL days that exist in the itinerary
    const days: DayRoute[] = [];
    const today = new Date();
    
    const dayNumbers = Array.from(allDays).sort((a, b) => a - b);
    
    for (const dayNum of dayNumbers) {
      const dayAttractions = dayGroups[dayNum] || [];
      console.log(`Day ${dayNum} attractions in order:`, dayAttractions.map(a => a.name));
      
      const daySegments: RouteSegment[] = [];
      
      // Only generate transport segments if there are 2+ attractions
      if (dayAttractions.length >= 2) {
        // Generate transport options for consecutive attractions in this day
        for (let j = 0; j < dayAttractions.length - 1; j++) {
          const fromAttraction = dayAttractions[j];
          const toAttraction = dayAttractions[j + 1];
          
          const distance = calculateDistance(
            fromAttraction.coordinates.lat, fromAttraction.coordinates.lng,
            toAttraction.coordinates.lat, toAttraction.coordinates.lng
          );
          
          const transportOptions = await generateTransportOptions(
            distance, 
            fromAttraction.name, 
            toAttraction.name,
            fromAttraction.coordinates,
            toAttraction.coordinates
          );
          
          daySegments.push({
            from: fromAttraction.name,
            to: toAttraction.name,
            fromCoords: fromAttraction.coordinates,
            toCoords: toAttraction.coordinates,
            distance,
            transportOptions,
            recommended: transportOptions[0] || {
              type: 'walk',
              duration: `${Math.ceil(distance * 12)} min`,
              cost: 'Free',
              description: 'Walk directly',
              steps: [`Walk from ${fromAttraction.name} to ${toAttraction.name}`]
            }
          });
        }
      }
      
      const dayDate = new Date(today.getTime() + (dayNum - 1) * 24 * 60 * 60 * 1000);
      days.push({
        day: dayNum,
        date: dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        segments: daySegments
      });
    }
    
    console.log('Generated day routes for all itinerary days:', days);
    setDayRoutes(days);
    
    // Set the selected day to the first day if not already set or if current day doesn't exist
    if (days.length > 0 && !dayNumbers.includes(selectedDay)) {
      const firstDay = days[0].day;
      setSelectedDay(firstDay);
      localStorage.setItem('transport-selected-day', firstDay.toString());
    }
  };

  if (savedItems.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Route className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No itinerary found</h3>
              <p className="text-muted-foreground mb-6">
                Add attractions to your itinerary first to get personalized transport recommendations!
              </p>
              <Button onClick={() => window.location.href = '/tourist-spots'}>
                <MapPin className="h-4 w-4 mr-2" />
                Explore Attractions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (attractions.length < 2) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Route className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Need more destinations</h3>
              <p className="text-muted-foreground mb-6">
                Add at least 2 attractions to your itinerary to generate transport routes!
              </p>
              <Button onClick={() => window.location.href = '/tourist-spots'}>
                <MapPin className="h-4 w-4 mr-2" />
                Add More Attractions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Transport Options
          </h1>
          <p className="text-muted-foreground mt-1">
            Optimized transport routes for your Singapore itinerary
          </p>
        </div>

        {/* Route Options */}
        <Tabs defaultValue="budget" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="budget" className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span>Budget-Friendly</span>
            </TabsTrigger>
            <TabsTrigger value="comfort" className="flex items-center space-x-2">
              <Car className="h-4 w-4" />
              <span>Comfort</span>
            </TabsTrigger>
            <TabsTrigger value="minimal_transfer" className="flex items-center space-x-2">
              <RouteIcon className="h-4 w-4" />
              <span>Less Transfer/Walking</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="budget" className="space-y-4">
            {/* Day Filter Card - Always show if there are multiple days */}
            {dayRoutes.length > 1 && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Select Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {dayRoutes.map((day) => (
                      <Button
                        key={day.day}
                        variant={selectedDay === day.day ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDayChange(day.day)}
                        className="flex flex-col h-auto py-2 px-3"
                      >
                        <span className="font-medium">Day {day.day}</span>
                        <span className="text-xs opacity-75">{day.date}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    {dayRoutes.length > 1 ? `Day ${selectedDay} Budget-Friendly Route` : 'Budget-Friendly Route'}
                  </span>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{dayRoutes.length > 0 ? calculateTotalTime(dayRoutes.find(d => d.day === selectedDay)?.segments || []) : calculateTotalTime(routes.budget)} min total</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>~S${dayRoutes.length > 0 ? calculateTotalCost(dayRoutes.find(d => d.day === selectedDay)?.segments || []).toFixed(2) : calculateTotalCost(routes.budget).toFixed(2)}</span>
                    </div>
                  </div>
                </CardTitle>
                {dayRoutes.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {dayRoutes.find(d => d.day === selectedDay)?.date} • 
                    {(dayRoutes.find(d => d.day === selectedDay)?.segments || []).length} route{(dayRoutes.find(d => d.day === selectedDay)?.segments || []).length !== 1 ? 's' : ''} planned
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {dayRoutes.length > 0 ? (
                  // Day-based routing
                  (() => {
                    const currentDayRoute = dayRoutes.find(d => d.day === selectedDay);
                    const daySegments = currentDayRoute?.segments || [];
                    
                    if (daySegments.length === 0) {
                      // Show single destination message for days with only one attraction
                      const saved = JSON.parse(localStorage.getItem('singapore-itinerary') || '[]');
                      const dayAttractions = saved.filter((item: ItineraryItem) => item.day === selectedDay);
                      
                      return (
                        <div className="text-center py-8">
                          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            {dayAttractions.length === 0 ? `No Transport for Day ${selectedDay}` : 'Single Destination Day'}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {dayAttractions.length === 0 
                              ? `No attractions are planned for Day ${selectedDay}.`
                              : dayAttractions.length === 1 
                                ? `You have planned to visit ${dayAttractions[0].name} on this day.`
                                : "This day has only one planned destination."
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {dayAttractions.length === 0 
                              ? "Add attractions to this day in the Itinerary tab to see transport options."
                              : "No transport routes needed within the day. Consider adding more attractions for route planning."
                            }
                          </p>
                        </div>
                      );
                    }
                    
                    return daySegments.map((segment, index) => {
                      // Get the budget option for this segment
                      const budgetSegment = routes.budget.find(r => r.from === segment.from && r.to === segment.to) || segment;
                      
                      return (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              <span className="font-medium">{budgetSegment.from}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium">{budgetSegment.to}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {budgetSegment.distance.toFixed(1)} km
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 mb-2">
                            <div className={`w-8 h-8 ${getTransportColor(budgetSegment.recommended.type)} rounded-lg flex items-center justify-center text-white`}>
                              {getTransportIcon(budgetSegment.recommended.type)}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{budgetSegment.recommended.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {budgetSegment.recommended.duration} • {budgetSegment.recommended.cost}
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-12 space-y-1">
                            {budgetSegment.recommended.steps.map((step, stepIndex) => (
                              <div key={stepIndex} className="text-sm text-muted-foreground flex items-center space-x-2">
                                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  // Fallback to full route when no day routes available
                  routes.budget.map((segment, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium">{segment.from}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{segment.to}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {segment.distance.toFixed(1)} km
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-2">
                        <div className={`w-8 h-8 ${getTransportColor(segment.recommended.type)} rounded-lg flex items-center justify-center text-white`}>
                          {getTransportIcon(segment.recommended.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{segment.recommended.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {segment.recommended.duration} • {segment.recommended.cost}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-12 space-y-1">
                        {segment.recommended.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="text-sm text-muted-foreground flex items-center space-x-2">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comfort" className="space-y-4">
            {/* Day Filter Card */}
            {dayRoutes.length > 1 && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Select Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {dayRoutes.map((day) => (
                      <Button
                        key={day.day}
                        variant={selectedDay === day.day ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDayChange(day.day)}
                        className="flex flex-col h-auto py-2 px-3"
                      >
                        <span className="font-medium">Day {day.day}</span>
                        <span className="text-xs opacity-75">{day.date}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comfort Route Card */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    {dayRoutes.length > 1 ? `Day ${selectedDay} Comfort Route` : 'Comfort Route'}
                  </span>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{dayRoutes.length > 0 ? calculateTotalTime(dayRoutes.find(d => d.day === selectedDay)?.segments || [], true) : calculateTotalTime(routes.comfort, true)} min total</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>~S${dayRoutes.length > 0 ? calculateTotalCost(dayRoutes.find(d => d.day === selectedDay)?.segments || [], true).toFixed(2) : calculateTotalCost(routes.comfort, true).toFixed(2)}</span>
                    </div>
                  </div>
                </CardTitle>
                {dayRoutes.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {dayRoutes.find(d => d.day === selectedDay)?.date} • 
                    {(dayRoutes.find(d => d.day === selectedDay)?.segments || []).length} route{(dayRoutes.find(d => d.day === selectedDay)?.segments || []).length !== 1 ? 's' : ''} planned
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {dayRoutes.length > 0 ? (
                  // Day-based routing for comfort
                  (() => {
                    const currentDayRoute = dayRoutes.find(d => d.day === selectedDay);
                    const daySegments = currentDayRoute?.segments || [];
                    
                    if (daySegments.length === 0) {
                      // Show single destination message for days with only one attraction
                      const saved = JSON.parse(localStorage.getItem('singapore-itinerary') || '[]');
                      const dayAttractions = saved.filter((item: ItineraryItem) => item.day === selectedDay);
                      
                      return (
                        <div className="text-center py-8">
                          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            {dayAttractions.length === 0 ? `No Transport for Day ${selectedDay}` : 'Single Destination Day'}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {dayAttractions.length === 0 
                              ? `No attractions are planned for Day ${selectedDay}.`
                              : dayAttractions.length === 1 
                                ? `You have planned to visit ${dayAttractions[0].name} on this day.`
                                : "This day has only one planned destination."
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {dayAttractions.length === 0 
                              ? "Add attractions to this day in the Itinerary tab to see transport options."
                              : "No transport routes needed within the day. Consider adding more attractions for route planning."
                            }
                          </p>
                        </div>
                      );
                    }
                    
                    return daySegments.map((segment, index) => {
                      // Find the actual segment index in the full routes array for comfort choices
                      const actualIndex = routes.comfort.findIndex(r => r.from === segment.from && r.to === segment.to);
                      const currentChoice = comfortChoices[actualIndex];
                      const displayOption = currentChoice?.selectedOption || segment.recommended;
                      
                      return (
                        <div key={`${segment.from}-${segment.to}`} className="border border-border rounded-lg p-4 space-y-4">
                          {/* Route Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-base">{segment.from} → {segment.to}</div>
                                <div className="text-sm text-muted-foreground">{segment.distance.toFixed(1)} km</div>
                              </div>
                            </div>
                          </div>

                          {/* Transport Option Selector */}
                          {segment.comfortChoice && segment.comfortChoice.availableOptions.length > 0 && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Choose transport:</label>
                              <Select 
                                value={displayOption.type + (displayOption.provider || '')} 
                                onValueChange={(value) => {
                                  const option = segment.comfortChoice?.availableOptions.find(opt => 
                                    (opt.type + (opt.provider || '')) === value
                                  );
                                  if (option) {
                                    // Use the actual index for comfort choices
                                    handleComfortChoice(actualIndex, option);
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select transport option" />
                                </SelectTrigger>
                                <SelectContent className="bg-background border shadow-lg z-50">
                                  {segment.comfortChoice.availableOptions.map((option, optionIndex) => (
                                    <SelectItem 
                                      key={optionIndex} 
                                      value={option.type + (option.provider || '')}
                                      className="cursor-pointer hover:bg-accent"
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center space-x-3">
                                          <div className={`w-5 h-5 ${getTransportColor(option.type)} rounded flex items-center justify-center text-white`}>
                                            {getTransportIcon(option.type)}
                                          </div>
                                          <span className="font-medium">{option.description}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground ml-4">
                                          {option.duration} • {option.cost}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          {/* Selected Option Summary */}
                          <div className="bg-muted/30 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-6 h-6 ${getTransportColor(displayOption.type)} rounded-lg flex items-center justify-center text-white`}>
                                  {getTransportIcon(displayOption.type)}
                                </div>
                                <div>
                                  <div className="font-medium">{displayOption.description}</div>
                                  {displayOption.provider && (
                                    <div className="text-xs text-muted-foreground">{displayOption.provider}</div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{displayOption.cost}</div>
                                <div className="text-sm text-muted-foreground">{displayOption.duration}</div>
                              </div>
                            </div>
                            
                            {/* Key Features (simplified) */}
                            {displayOption.features && displayOption.features.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {displayOption.features.slice(0, 3).map((feature, featureIndex) => (
                                  <Badge key={featureIndex} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                                {displayOption.features.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{displayOption.features.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  // Fallback to full route when no day routes available
                  routes.comfort.map((segment, index) => {
                    // Find the actual segment index in the full routes array for comfort choices
                    const actualIndex = routes.comfort.findIndex(r => r.from === segment.from && r.to === segment.to);
                    const currentChoice = comfortChoices[actualIndex];
                    const displayOption = currentChoice?.selectedOption || segment.recommended;
                    
                    return (
                      <div key={`${segment.from}-${segment.to}`} className="border border-border rounded-lg p-4 space-y-4">
                        {/* Route Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-base">{segment.from} → {segment.to}</div>
                              <div className="text-sm text-muted-foreground">{segment.distance.toFixed(1)} km</div>
                            </div>
                          </div>
                        </div>

                        {/* Transport Option Selector */}
                        {segment.comfortChoice && segment.comfortChoice.availableOptions.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Choose transport:</label>
                            <Select 
                              value={displayOption.type + (displayOption.provider || '')} 
                              onValueChange={(value) => {
                                const option = segment.comfortChoice?.availableOptions.find(opt => 
                                  (opt.type + (opt.provider || '')) === value
                                );
                                if (option) {
                                  // Use the actual index for comfort choices
                                  handleComfortChoice(actualIndex, option);
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select transport option" />
                              </SelectTrigger>
                              <SelectContent className="bg-background border shadow-lg z-50">
                                {segment.comfortChoice.availableOptions.map((option, optionIndex) => (
                                  <SelectItem 
                                    key={optionIndex} 
                                    value={option.type + (option.provider || '')}
                                    className="cursor-pointer hover:bg-accent"
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-5 h-5 ${getTransportColor(option.type)} rounded flex items-center justify-center text-white`}>
                                          {getTransportIcon(option.type)}
                                        </div>
                                        <span className="font-medium">{option.description}</span>
                                      </div>
                                      <div className="text-sm text-muted-foreground ml-4">
                                        {option.duration} • {option.cost}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        {/* Selected Option Summary */}
                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 ${getTransportColor(displayOption.type)} rounded-lg flex items-center justify-center text-white`}>
                                {getTransportIcon(displayOption.type)}
                              </div>
                              <div>
                                <div className="font-medium">{displayOption.description}</div>
                                {displayOption.provider && (
                                  <div className="text-xs text-muted-foreground">{displayOption.provider}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{displayOption.cost}</div>
                              <div className="text-sm text-muted-foreground">{displayOption.duration}</div>
                            </div>
                          </div>
                          
                          {/* Key Features (simplified) */}
                          {displayOption.features && displayOption.features.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {displayOption.features.slice(0, 3).map((feature, featureIndex) => (
                                <Badge key={featureIndex} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {displayOption.features.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{displayOption.features.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="minimal_transfer" className="space-y-4">
            {/* Day Filter Card */}
            {dayRoutes.length > 1 && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Select Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {dayRoutes.map((day) => (
                      <Button
                        key={day.day}
                        variant={selectedDay === day.day ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDayChange(day.day)}
                        className="flex flex-col h-auto py-2 px-3"
                      >
                        <span className="font-medium">Day {day.day}</span>
                        <span className="text-xs opacity-75">{day.date}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <RouteIcon className="h-5 w-5 mr-2" />
                    {dayRoutes.length > 1 ? `Day ${selectedDay} Less Transfer/Walking Route` : 'Less Transfer/Walking Route'}
                  </span>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{dayRoutes.length > 0 ? calculateTotalTime(dayRoutes.find(d => d.day === selectedDay)?.segments || []) : calculateTotalTime(routes.minimal_transfer)} min total</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>~S${dayRoutes.length > 0 ? calculateTotalCost(dayRoutes.find(d => d.day === selectedDay)?.segments || []).toFixed(2) : calculateTotalCost(routes.minimal_transfer).toFixed(2)}</span>
                    </div>
                  </div>
                </CardTitle>
                {dayRoutes.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {dayRoutes.find(d => d.day === selectedDay)?.date} • 
                    {(dayRoutes.find(d => d.day === selectedDay)?.segments || []).length} route{(dayRoutes.find(d => d.day === selectedDay)?.segments || []).length !== 1 ? 's' : ''} planned
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {dayRoutes.length > 0 ? (
                  // Day-based routing for minimal transfer
                  (() => {
                    const currentDayRoute = dayRoutes.find(d => d.day === selectedDay);
                    const daySegments = currentDayRoute?.segments || [];
                    
                    if (daySegments.length === 0) {
                      // Show single destination message for days with only one attraction
                      const saved = JSON.parse(localStorage.getItem('singapore-itinerary') || '[]');
                      const dayAttractions = saved.filter((item: ItineraryItem) => item.day === selectedDay);
                      
                      return (
                        <div className="text-center py-8">
                          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            {dayAttractions.length === 0 ? `No Transport for Day ${selectedDay}` : 'Single Destination Day'}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {dayAttractions.length === 0 
                              ? `No attractions are planned for Day ${selectedDay}.`
                              : dayAttractions.length === 1 
                                ? `You have planned to visit ${dayAttractions[0].name} on this day.`
                                : "This day has only one planned destination."
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {dayAttractions.length === 0 
                              ? "Add attractions to this day in the Itinerary tab to see transport options."
                              : "No transport routes needed within the day. Consider adding more attractions for route planning."
                            }
                          </p>
                        </div>
                      );
                    }
                    
                    return daySegments.map((segment, index) => {
                      // Get the minimal transfer option for this segment
                      const minimalTransferSegment = routes.minimal_transfer.find(r => r.from === segment.from && r.to === segment.to) || segment;
                      
                      return (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              <span className="font-medium">{minimalTransferSegment.from}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium">{minimalTransferSegment.to}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {minimalTransferSegment.distance.toFixed(1)} km
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 mb-2">
                            <div className={`w-8 h-8 ${getTransportColor(minimalTransferSegment.recommended.type)} rounded-lg flex items-center justify-center text-white`}>
                              {getTransportIcon(minimalTransferSegment.recommended.type)}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{minimalTransferSegment.recommended.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {minimalTransferSegment.recommended.duration} • {minimalTransferSegment.recommended.cost}
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                ✓ {getTransferBenefit(minimalTransferSegment.recommended)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-12 space-y-1">
                            {minimalTransferSegment.recommended.steps.map((step, stepIndex) => (
                              <div key={stepIndex} className="text-sm text-muted-foreground flex items-center space-x-2">
                                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  // Fallback to full route when no day routes available
                  routes.minimal_transfer.map((segment, index) => {
                    // Get the minimal transfer option for this segment
                    const minimalTransferSegment = routes.minimal_transfer.find(r => r.from === segment.from && r.to === segment.to) || segment;
                    
                    return (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <span className="font-medium">{minimalTransferSegment.from}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium">{minimalTransferSegment.to}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {minimalTransferSegment.distance.toFixed(1)} km
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-2">
                          <div className={`w-8 h-8 ${getTransportColor(minimalTransferSegment.recommended.type)} rounded-lg flex items-center justify-center text-white`}>
                            {getTransportIcon(minimalTransferSegment.recommended.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{minimalTransferSegment.recommended.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {minimalTransferSegment.recommended.duration} • {minimalTransferSegment.recommended.cost}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              ✓ {getTransferBenefit(minimalTransferSegment.recommended)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-12 space-y-1">
                          {minimalTransferSegment.recommended.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="text-sm text-muted-foreground flex items-center space-x-2">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Transport Tips */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Singapore Transport Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">🚇 MRT (Mass Rapid Transit)</h4>
                <p className="text-sm text-muted-foreground">
                  Most efficient for longer distances. Buy an EZ-Link card for easy payment across all public transport.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">🚌 Public Buses</h4>
                <p className="text-sm text-muted-foreground">
                  Extensive network covering all areas. Use the SG BusLeh app to track real-time bus arrivals.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">🚗 Grab & Taxis</h4>
                <p className="text-sm text-muted-foreground">
                  Convenient but more expensive. Book in advance during peak hours and bad weather.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">🚶 Walking</h4>
                <p className="text-sm text-muted-foreground">
                  Many attractions are within walking distance. Singapore is very pedestrian-friendly with covered walkways.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transport;