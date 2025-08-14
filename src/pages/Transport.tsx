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
  ChevronDown,
  Calendar,
  Plus
} from "lucide-react";
import { singaporeAttractions, type Attraction } from "@/data/attractions";
import { oneMapService } from "@/services/oneMapService";

interface ItineraryItem {
  id: string;
  name: string;
  category: string;
  addedAt: string;
  day?: number;
  date?: string; // YYYY-MM-DD format
  start_time?: string; // HH:mm format
  end_time?: string; // HH:mm format
  location_from?: string;
  location_to?: string;
}

interface TransportItem {
  id: string;
  mode: 'mrt' | 'bus' | 'taxi' | 'grab' | 'tada' | 'gojek' | 'private_hire' | 'walk' | 'public_transport' | 'own_car' | 'flight' | 'train';
  carrier?: string;
  code?: string;
  location_from: string;
  location_to: string;
  date: string; // YYYY-MM-DD
  depart_time?: string; // HH:mm
  arrive_time?: string; // HH:mm
  duration?: number; // minutes
  cost?: string;
  notes?: string;
  created_at: string;
  itinerary_item_id?: string;
  is_segment?: boolean; // for overnight splits
  segment_label?: string;
}

interface TransportOption {
  type: 'mrt' | 'bus' | 'taxi' | 'grab' | 'tada' | 'gojek' | 'private_hire' | 'walk' | 'public_transport' | 'own_car';
  provider?: string;
  duration: string;
  cost: string;
  description: string;
  steps: string[];
  walkingTime?: string;
  realRouteData?: any;
  features?: string[];
}

interface DayBucket {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  displayLabel: string; // "Day 1 (Mon, 12 Aug)"
  transportItems: TransportItem[];
  routeSegments: RouteSegment[]; // for backward compatibility
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

interface ComfortChoice {
  selectedOption: TransportOption | null;
  availableOptions: TransportOption[];
}

const Transport = () => {
  const { t } = useTranslation();
  const [savedItems, setSavedItems] = useState<ItineraryItem[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [dayBuckets, setDayBuckets] = useState<DayBucket[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [transportItems, setTransportItems] = useState<TransportItem[]>([]);
  const [defaultTimezone] = useState<string>('Asia/Singapore');
  
  // Legacy route support for backward compatibility
  const [routes, setRoutes] = useState<{
    budget: RouteSegment[];
    comfort: RouteSegment[];
    minimal_transfer: RouteSegment[];
  }>({ budget: [], comfort: [], minimal_transfer: [] });
  const [comfortChoices, setComfortChoices] = useState<{ [segmentIndex: number]: ComfortChoice }>({});

  useEffect(() => {
    loadItineraryAndTransportData();
    // Restore selected day from localStorage
    const savedDay = localStorage.getItem('transport-selected-day');
    if (savedDay) {
      setSelectedDay(parseInt(savedDay));
    }
  }, []);

  useEffect(() => {
    // Persist selected day
    localStorage.setItem('transport-selected-day', selectedDay.toString());
  }, [selectedDay]);

  const loadItineraryAndTransportData = () => {
    // Load itinerary items
    const saved = JSON.parse(localStorage.getItem('singapore-itinerary') || '[]');
    setSavedItems(saved);
    
    // Get full attraction details
    const attractionDetails = saved.map((item: ItineraryItem) => 
      singaporeAttractions.find(attraction => attraction.id === item.id)
    ).filter(Boolean) as Attraction[];
    
    setAttractions(attractionDetails);
    
    // Load transport items (mock data for now)
    const mockTransportItems = generateMockTransportItems(saved);
    setTransportItems(mockTransportItems);
    
    // Create day buckets
    const buckets = createDayBuckets(saved, mockTransportItems);
    setDayBuckets(buckets);
    
    // Set default selected day (today if in range, otherwise Day 1)
    const defaultDay = getDefaultSelectedDay(buckets);
    setSelectedDay(defaultDay);
    
    // Generate legacy routes for backward compatibility
    if (attractionDetails.length >= 2) {
      generateRoutes(attractionDetails).catch(console.error);
    }
  };

  const generateMockTransportItems = (itineraryItems: ItineraryItem[]): TransportItem[] => {
    const items: TransportItem[] = [];
    const today = new Date();
    
    itineraryItems.forEach((item, index) => {
      if (index < itineraryItems.length - 1) {
        const nextItem = itineraryItems[index + 1];
        const date = today.toISOString().split('T')[0];
        const departTime = `${9 + Math.floor(index * 2)}:${30 + (index % 2) * 30}`;
        const arriveTime = `${10 + Math.floor(index * 2)}:${0 + (index % 2) * 30}`;
        
        items.push({
          id: `transport-${index}`,
          mode: index % 3 === 0 ? 'mrt' : index % 3 === 1 ? 'grab' : 'bus',
          location_from: item.name,
          location_to: nextItem.name,
          date,
          depart_time: departTime,
          arrive_time: arriveTime,
          duration: 30 + index * 10,
          cost: `S$${(5 + index * 2).toFixed(2)}`,
          created_at: new Date().toISOString(),
          itinerary_item_id: item.id
        });
      }
    });
    
    return items;
  };

  const createDayBuckets = (itineraryItems: ItineraryItem[], transportItems: TransportItem[]): DayBucket[] => {
    const buckets: DayBucket[] = [];
    const dateMap = new Map<string, DayBucket>();
    
    // Extract unique dates from itinerary
    const dates = Array.from(new Set(
      itineraryItems.map(item => item.date || new Date().toISOString().split('T')[0])
    )).sort();
    
    dates.forEach((date, index) => {
      const dayNumber = index + 1;
      const dateObj = new Date(date);
      const displayLabel = `Day ${dayNumber} (${dateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })})`;
      
      const bucket: DayBucket = {
        date,
        dayNumber,
        displayLabel,
        transportItems: [],
        routeSegments: []
      };
      
      buckets.push(bucket);
      dateMap.set(date, bucket);
    });
    
    // Assign transport items to buckets
    transportItems.forEach(item => {
      const targetDate = item.date;
      const bucket = dateMap.get(targetDate);
      
      if (bucket) {
        // Check for overnight transport
        if (item.depart_time && item.arrive_time) {
          const departMinutes = timeToMinutes(item.depart_time);
          const arriveMinutes = timeToMinutes(item.arrive_time);
          
          if (arriveMinutes < departMinutes) {
            // Overnight transport - split into segments
            const segment1: TransportItem = {
              ...item,
              id: `${item.id}-seg1`,
              arrive_time: '23:59',
              is_segment: true,
              segment_label: 'Day 1 segment'
            };
            
            const nextDate = new Date(new Date(targetDate).getTime() + 24 * 60 * 60 * 1000)
              .toISOString().split('T')[0];
            const nextBucket = dateMap.get(nextDate);
            
            const segment2: TransportItem = {
              ...item,
              id: `${item.id}-seg2`,
              date: nextDate,
              depart_time: '00:00',
              is_segment: true,
              segment_label: 'Day 2 segment'
            };
            
            bucket.transportItems.push(segment1);
            if (nextBucket) {
              nextBucket.transportItems.push(segment2);
            }
          } else {
            bucket.transportItems.push(item);
          }
        } else {
          bucket.transportItems.push(item);
        }
      }
    });
    
    // Sort transport items within each bucket chronologically
    buckets.forEach(bucket => {
      bucket.transportItems.sort((a, b) => {
        if (a.depart_time && b.depart_time) {
          return timeToMinutes(a.depart_time) - timeToMinutes(b.depart_time);
        }
        if (a.depart_time && !b.depart_time) return -1;
        if (!a.depart_time && b.depart_time) return 1;
        
        // Fall back to created_at then location_from
        const timeCompare = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (timeCompare !== 0) return timeCompare;
        
        return a.location_from.localeCompare(b.location_from);
      });
    });
    
    return buckets;
  };

  const getDefaultSelectedDay = (buckets: DayBucket[]): number => {
    if (buckets.length === 0) return 1;
    
    const today = new Date().toISOString().split('T')[0];
    const todayBucket = buckets.find(bucket => bucket.date === today);
    
    return todayBucket ? todayBucket.dayNumber : 1;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

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
    
    try {
      // Get real routing data from OneMap
      const [walkRoute, ptRoute, driveRoute] = await Promise.all([
        oneMapService.getWalkingRoute(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng),
        oneMapService.getPublicTransportRoute(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng),
        oneMapService.getDrivingRoute(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng)
      ]);

      // Walking option (with real route data)
      if (walkRoute && walkRoute.route_summary) {
        const walkTime = Math.round(walkRoute.route_summary.total_time / 60);
        const walkDistance = oneMapService.formatDistance(walkRoute.route_summary.total_distance);
        
        options.push({
          type: 'walk',
          duration: oneMapService.formatTime(walkRoute.route_summary.total_time),
          cost: 'Free',
          description: `Walk directly (${walkDistance})`,
          steps: walkRoute.route_instructions?.map(instruction => instruction.instruction) || [`Walk from ${from} to ${to}`],
          walkingTime: `${walkTime} min`,
          realRouteData: walkRoute
        });
      } else {
        // Fallback to distance calculation
        const walkTime = Math.ceil(distance * 12);
        options.push({
          type: 'walk',
          duration: `${walkTime} min`,
          cost: 'Free',
          description: 'Walk directly to destination',
          steps: [`Walk from ${from} to ${to}`],
          walkingTime: `${walkTime} min`
        });
      }

      // Public Transport option (MRT + Bus combined using OneMap)
      if (ptRoute && ptRoute.route_summary) {
        const ptTime = oneMapService.formatTime(ptRoute.route_summary.total_time);
        const ptDistance = oneMapService.formatDistance(ptRoute.route_summary.total_distance);
        
        options.push({
          type: 'public_transport',
          duration: ptTime,
          cost: 'S$1.07 - S$2.50',
          description: `Public Transport (${ptDistance})`,
          steps: ptRoute.route_instructions?.map(instruction => instruction.instruction) || [
            `Take MRT/Bus from ${from}`,
            `Travel via public transport`,
            `Arrive at ${to}`
          ],
          realRouteData: ptRoute
        });
      }

      // Individual MRT/Bus options (fallback)
      if (distance > 0.5) {
        const mrtTime = Math.ceil(distance * 8 + 10);
        options.push({
          type: 'mrt',
          duration: `${mrtTime} min`,
          cost: 'S$1.40 - S$2.50',
          description: 'Take MRT (Mass Rapid Transit)',
          steps: [
            `Walk to nearest MRT station (5-8 min)`,
            `Take MRT towards destination`,
            `Walk from MRT station to ${to} (5-8 min)`
          ]
        });
      }

      const busTime = Math.ceil(distance * 10 + 8);
      options.push({
        type: 'bus',
        duration: `${busTime} min`,
        cost: 'S$1.07 - S$2.17',
        description: 'Take public bus',
        steps: [
          `Walk to nearest bus stop (3-5 min)`,
          `Take bus towards destination`,
          `Walk from bus stop to ${to} (3-5 min)`
        ]
      });

      // Comfort transport options with accurate Singapore pricing
      if (distance > 0.5 || (driveRoute && driveRoute.route_summary)) {
        let taxiTime, comfortDelGroCost, grabCost, tadaCost, gojekCost, privateHireCost;
        
        if (driveRoute && driveRoute.route_summary) {
          taxiTime = oneMapService.formatTime(driveRoute.route_summary.total_time);
          const distanceKm = driveRoute.route_summary.total_distance / 1000;
          
          const comfortDelGroEstimate = oneMapService.estimateComfortDelGroCost(distanceKm);
          const grabEstimate = oneMapService.estimateGrabCost(distanceKm);
          const tadaEstimate = oneMapService.estimateTadaCost(distanceKm);
          const gojekEstimate = oneMapService.estimateGojekCost(distanceKm);
          const privateHireEstimate = oneMapService.estimatePrivateHireCost(distanceKm);
          
          comfortDelGroCost = `S$${comfortDelGroEstimate.min} - S$${comfortDelGroEstimate.max}`;
          grabCost = `S$${grabEstimate.min} - S$${grabEstimate.max}`;
          tadaCost = `S$${tadaEstimate.min} - S$${tadaEstimate.max}`;
          gojekCost = `S$${gojekEstimate.min} - S$${gojekEstimate.max}`;
          privateHireCost = `S$${privateHireEstimate.min} - S$${privateHireEstimate.max}`;
        } else {
          // Fallback calculations for short distances
          taxiTime = `${Math.ceil(distance * 4 + 3)} min`;
          comfortDelGroCost = distance < 2 ? "S$3.90 - S$6.00" : `S$${(3.90 + distance * 0.6).toFixed(2)} - S$${(3.90 + distance * 0.9).toFixed(2)}`;
          grabCost = distance < 2 ? "S$3.50 - S$8.00" : `S$${(3.50 + distance * 0.65).toFixed(2)} - S$${(3.50 + distance * 1.4).toFixed(2)}`;
          tadaCost = distance < 2 ? "S$3.00 - S$6.50" : `S$${(3.00 + distance * 0.6).toFixed(2)} - S$${(3.00 + distance * 0.8).toFixed(2)}`;
          gojekCost = distance < 2 ? "S$3.20 - S$7.50" : `S$${(3.20 + distance * 0.62).toFixed(2)} - S$${(3.20 + distance * 1.1).toFixed(2)}`;
          privateHireCost = `S$${(8.00 + distance * 1.2).toFixed(2)} - S$${(8.00 + distance * 1.8).toFixed(2)}`;
        }
        
        // ComfortDelGro Taxi
        options.push({
          type: 'taxi',
          provider: 'ComfortDelGro',
          duration: taxiTime,
          cost: comfortDelGroCost,
          description: 'ComfortDelGro Taxi',
          steps: [`Book via ComfortDelGro app or hail on street`, `Direct ride to ${to}`],
          features: ['Street hail available', 'Licensed taxi', 'Meter fare', 'No surge pricing'],
          realRouteData: driveRoute
        });

        // Grab
        options.push({
          type: 'grab',
          provider: 'Grab',
          duration: taxiTime,
          cost: grabCost,
          description: 'Grab Ride',
          steps: [`Book Grab via app`, `Driver picks up and drives to ${to}`],
          features: ['Cashless payment', 'Real-time tracking', 'Dynamic pricing', 'Multiple car types'],
          realRouteData: driveRoute
        });

        // Tada
        options.push({
          type: 'tada',
          provider: 'Tada',
          duration: taxiTime,
          cost: tadaCost,
          description: 'Tada Ride',
          steps: [`Book Tada via app`, `Driver picks up and drives to ${to}`],
          features: ['Competitive rates', 'Frequent promotions', 'Cashless payment', 'Good service'],
          realRouteData: driveRoute
        });

        // Gojek
        options.push({
          type: 'gojek',
          provider: 'Gojek',
          duration: taxiTime,
          cost: gojekCost,
          description: 'Gojek Ride',
          steps: [`Book Gojek via app`, `Driver picks up and drives to ${to}`],
          features: ['Multi-service app', 'Competitive pricing', 'Reliable service', 'Cashless payment'],
          realRouteData: driveRoute
        });

        // Private Hire Car (for longer distances or premium service)
        if (distance > 5) {
          options.push({
            type: 'private_hire',
            provider: 'Premium',
            duration: taxiTime,
            cost: privateHireCost,
            description: 'Private Hire Car',
            steps: [`Book premium car service`, `Professional driver picks up`, `Comfortable ride to ${to}`],
            features: ['Professional driver', 'Premium vehicles', 'Door-to-door service', 'Fixed pricing'],
            realRouteData: driveRoute
          });
        }

        // Own Car option
        options.push({
          type: 'own_car',
          provider: 'Personal Vehicle',
          duration: taxiTime,
          cost: 'Parking & Fuel',
          description: 'Drive Your Own Car',
          steps: [`Drive from ${from} to ${to}`, `Find parking near destination`],
          features: ['Personal convenience', 'No waiting time', 'Privacy', 'Storage space'],
          realRouteData: driveRoute
        });
      }

    } catch (error) {
      console.error('Error fetching routes from OneMap:', error);
      // Fallback to original distance-based calculations
      return generateFallbackOptions(distance, from, to);
    }

    return options;
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
      options.push({
        type: 'mrt',
        duration: `${mrtTime} min`,
        cost: 'S$1.40 - S$2.50',
        description: 'Take MRT (Mass Rapid Transit)',
        steps: [
          `Walk to nearest MRT station (5-8 min)`,
          `Take MRT towards destination`,
          `Walk from MRT station to ${to} (5-8 min)`
        ]
      });
    }

    const busTime = Math.ceil(distance * 10 + 8);
    options.push({
      type: 'bus',
      duration: `${busTime} min`,
      cost: 'S$1.07 - S$2.17',
      description: 'Take public bus',
      steps: [
        `Walk to nearest bus stop (3-5 min)`,
        `Take bus towards destination`,
        `Walk from bus stop to ${to} (3-5 min)`
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
    
    // Bonus for direct transport options
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
      recommended: segment.transportOptions.reduce((bestOption, current) => {
        // Prioritize options with minimal transfers and walking
        const bestScore = getTransferScore(bestOption);
        const currentScore = getTransferScore(current);
        return currentScore < bestScore ? current : bestOption;
      })
    }));

    setRoutes({
      budget: budgetRoutes || [],
      comfort: comfortRoutes || [],
      minimal_transfer: minimalTransferRoutes || []
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

  const getTransportIcon = (type: TransportItem['mode'] | TransportOption['type']) => {
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
      case 'flight': return <Navigation className="h-4 w-4" />;
      case 'train': return <Train className="h-4 w-4" />;
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

  const calculateTotalCost = (segments: RouteSegment[] | undefined, useComfortChoices: boolean = false) => {
    if (!segments || !Array.isArray(segments)) return 0;
    
    return segments.reduce((total, segment, index) => {
      let option = segment.recommended;
      
      if (useComfortChoices && comfortChoices[index]?.selectedOption) {
        option = comfortChoices[index].selectedOption;
      }
      
      const cost = parseFloat(option.cost.replace(/[^0-9.]/g, '') || '0');
      return total + cost;
    }, 0);
  };

  const calculateTotalTime = (segments: RouteSegment[] | undefined, useComfortChoices: boolean = false) => {
    if (!segments || !Array.isArray(segments)) return 0;
    
    return segments.reduce((total, segment, index) => {
      let option = segment.recommended;
      
      if (useComfortChoices && comfortChoices[index]?.selectedOption) {
        option = comfortChoices[index].selectedOption;
      }
      
      const time = parseInt(option.duration);
      return total + time;
    }, 0);
  };

  const generateDayRoutes = (attractionList: Attraction[]) => {
    // This function is kept for backward compatibility but now uses dayBuckets
    console.log('Legacy generateDayRoutes called, using dayBuckets instead');
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

        {/* New Transport Items Display */}
        {dayBuckets.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {dayBuckets.length > 1 ? `Day ${selectedDay} Transport Schedule` : 'Transport Schedule'}
                </span>
                <div className="text-sm text-muted-foreground">
                  {dayBuckets.find(d => d.dayNumber === selectedDay)?.transportItems.length || 0} transport{((dayBuckets.find(d => d.dayNumber === selectedDay)?.transportItems.length || 0) !== 1) ? 's' : ''} planned
                </div>
              </CardTitle>
              {dayBuckets.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {dayBuckets.find(d => d.dayNumber === selectedDay)?.displayLabel}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {(() => {
                const selectedBucket = dayBuckets.find(d => d.dayNumber === selectedDay);
                const transportItems = selectedBucket?.transportItems || [];
                
                if (transportItems.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <RouteIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No transport planned for this day</h3>
                      <p className="text-muted-foreground mb-4">Add transport options to get detailed routing information.</p>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transport
                      </Button>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {transportItems.map((item, index) => (
                      <div key={item.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                              {getTransportIcon(item.mode)}
                            </div>
                            <div>
                              <div className="font-medium text-base">
                                {item.location_from} → {item.location_to}
                                {item.is_segment && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    {item.segment_label}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {item.mode.toUpperCase()}
                                {item.carrier && ` • ${item.carrier}`}
                                {item.code && ` • ${item.code}`}
                              </div>
                            </div>
                          </div>
                          {item.cost && (
                            <div className="text-sm font-medium text-primary">
                              {item.cost}
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {item.depart_time ? `${item.depart_time}` : 'Departure TBD'}
                              {item.arrive_time ? ` → ${item.arrive_time}` : ' → ETA unknown'}
                              <span className="text-muted-foreground ml-1">SGT</span>
                            </span>
                          </div>
                          
                          {item.duration && (
                            <div className="flex items-center space-x-2">
                              <Navigation className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDuration(item.duration)}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{new Date(`${item.date}T${item.depart_time || '00:00'}`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                        
                        {item.notes && (
                          <div className="mt-3 p-2 bg-muted/30 rounded text-sm">
                            <strong>Notes:</strong> {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Day Filter for Route Options */}
        {dayBuckets.length > 1 && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Route Planning Options</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose from different routing strategies for your selected day
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dayBuckets.map((bucket) => (
                  <Button
                    key={bucket.dayNumber}
                    variant={selectedDay === bucket.dayNumber ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDay(bucket.dayNumber)}
                    className="flex flex-col h-auto py-2 px-3"
                  >
                    <span className="font-medium">Day {bucket.dayNumber}</span>
                    <span className="text-xs opacity-75">{bucket.date}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
              <span>Less Transfer</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="budget" className="space-y-4">
            {/* Day Filter Card */}
            {dayBuckets.length > 1 && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Select Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {dayBuckets.map((bucket) => (
                      <Button
                        key={bucket.dayNumber}
                        variant={selectedDay === bucket.dayNumber ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDay(bucket.dayNumber)}
                        className="flex flex-col h-auto py-2 px-3"
                      >
                        <span className="font-medium">Day {bucket.dayNumber}</span>
                        <span className="text-xs opacity-75">{bucket.date}</span>
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
                    {dayBuckets.length > 1 ? `Day ${selectedDay} Budget-Friendly Route` : 'Budget-Friendly Route'}
                  </span>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{(routes.budget && routes.budget.length > 0) ? calculateTotalTime(dayBuckets.length > 0 ? (dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []) : routes.budget) : 0} min total</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>~S${(routes.budget && routes.budget.length > 0) ? calculateTotalCost(dayBuckets.length > 0 ? (dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []) : routes.budget).toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                </CardTitle>
                {dayBuckets.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {dayBuckets.find(d => d.dayNumber === selectedDay)?.displayLabel} • 
                    {(dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []).length} route{(dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []).length !== 1 ? 's' : ''} planned
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {(dayBuckets.length > 0 ? (dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []) : routes.budget).map((segment, index) => {
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
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comfort" className="space-y-4">
            {/* Day Filter Card */}
            {dayBuckets.length > 1 && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Select Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {dayBuckets.map((bucket) => (
                      <Button
                        key={bucket.dayNumber}
                        variant={selectedDay === bucket.dayNumber ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDay(bucket.dayNumber)}
                        className="flex flex-col h-auto py-2 px-3"
                      >
                        <span className="font-medium">Day {bucket.dayNumber}</span>
                        <span className="text-xs opacity-75">{bucket.date}</span>
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
                    {dayBuckets.length > 1 ? `Day ${selectedDay} Comfort Route` : 'Comfort Route'}
                  </span>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{(routes.comfort && routes.comfort.length > 0) ? calculateTotalTime(dayBuckets.length > 0 ? (dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []) : routes.comfort, true) : 0} min total</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>~S${(routes.comfort && routes.comfort.length > 0) ? calculateTotalCost(dayBuckets.length > 0 ? (dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []) : routes.comfort, true).toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                </CardTitle>
                {dayBuckets.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {dayBuckets.find(d => d.dayNumber === selectedDay)?.displayLabel} • 
                    {(dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []).length} route{(dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []).length !== 1 ? 's' : ''} planned
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {(dayBuckets.length > 0 ? (dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []) : routes.comfort).map((segment, index) => {
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
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="minimal_transfer" className="space-y-4">
            {/* Day Filter Card */}
            {dayBuckets.length > 1 && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Select Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {dayBuckets.map((bucket) => (
                      <Button
                        key={bucket.dayNumber}
                        variant={selectedDay === bucket.dayNumber ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDay(bucket.dayNumber)}
                        className="flex flex-col h-auto py-2 px-3"
                      >
                        <span className="font-medium">Day {bucket.dayNumber}</span>
                        <span className="text-xs opacity-75">{bucket.date}</span>
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
                    {dayBuckets.length > 1 ? `Day ${selectedDay} Less Transfer Route` : 'Less Transfer Route'}
                  </span>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{(routes.minimal_transfer && routes.minimal_transfer.length > 0) ? calculateTotalTime(dayBuckets.length > 0 ? (dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []) : routes.minimal_transfer) : 0} min total</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>~S${(routes.minimal_transfer && routes.minimal_transfer.length > 0) ? calculateTotalCost(dayBuckets.length > 0 ? (dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []) : routes.minimal_transfer).toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                </CardTitle>
                {dayBuckets.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {dayBuckets.find(d => d.dayNumber === selectedDay)?.displayLabel} • 
                    {(dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []).length} route{(dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []).length !== 1 ? 's' : ''} planned
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {(dayBuckets.length > 0 ? (dayBuckets.find(d => d.dayNumber === selectedDay)?.routeSegments || []) : routes.minimal_transfer).map((segment, index) => {
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
                })}
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