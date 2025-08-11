import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Zap
} from "lucide-react";
import { singaporeAttractions, type Attraction } from "@/data/attractions";
import { oneMapService } from "@/services/oneMapService";

interface ItineraryItem {
  id: string;
  name: string;
  category: string;
  addedAt: string;
}

interface TransportOption {
  type: 'mrt' | 'bus' | 'taxi' | 'grab' | 'walk' | 'public_transport';
  duration: string;
  cost: string;
  description: string;
  steps: string[];
  walkingTime?: string;
  realRouteData?: any; // OneMap route data
}

interface RouteSegment {
  from: string;
  to: string;
  fromCoords: { lat: number; lng: number };
  toCoords: { lat: number; lng: number };
  distance: number;
  transportOptions: TransportOption[];
  recommended: TransportOption;
}

const Transport = () => {
  const { t } = useTranslation();
  const [savedItems, setSavedItems] = useState<ItineraryItem[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [routes, setRoutes] = useState<{
    budget: RouteSegment[];
    comfort: RouteSegment[];
    speed: RouteSegment[];
  }>({ budget: [], comfort: [], speed: [] });

  useEffect(() => {
    const loadItinerary = () => {
      const saved = JSON.parse(localStorage.getItem('singapore-itinerary') || '[]');
      setSavedItems(saved);
      
      // Get full attraction details
      const attractionDetails = saved.map((item: ItineraryItem) => 
        singaporeAttractions.find(attraction => attraction.id === item.id)
      ).filter(Boolean) as Attraction[];
      
      setAttractions(attractionDetails);
      
      if (attractionDetails.length >= 2) {
        generateRoutes(attractionDetails).catch(console.error);
      }
    };

    loadItinerary();
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

      // Taxi/Grab options (with real driving route data)
      if (distance > 1 || (driveRoute && driveRoute.route_summary)) {
        let taxiTime, taxiCost, grabCost;
        
        if (driveRoute && driveRoute.route_summary) {
          taxiTime = oneMapService.formatTime(driveRoute.route_summary.total_time);
          const distanceKm = driveRoute.route_summary.total_distance / 1000;
          
          const taxiEstimate = oneMapService.estimateTaxiCost(distanceKm);
          const grabEstimate = oneMapService.estimateGrabCost(distanceKm);
          
          taxiCost = `S$${taxiEstimate.min} - S$${taxiEstimate.max}`;
          grabCost = `S$${grabEstimate.min} - S$${grabEstimate.max}`;
        } else {
          // Fallback calculations
          taxiTime = `${Math.ceil(distance * 5 + 5)} min`;
          const estimatedCost = Math.ceil(distance * 2 + 6);
          taxiCost = `S$${estimatedCost} - S$${estimatedCost + 5}`;
          grabCost = `S$${estimatedCost - 2} - S$${estimatedCost + 3}`;
        }
        
        options.push({
          type: 'taxi',
          duration: taxiTime,
          cost: taxiCost,
          description: 'Take taxi or ComfortDelGro cab',
          steps: [`Take taxi directly to ${to}`],
          realRouteData: driveRoute
        });

        options.push({
          type: 'grab',
          duration: taxiTime,
          cost: grabCost,
          description: 'Book Grab ride',
          steps: [`Book Grab ride to ${to}`],
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

    if (distance > 1) {
      const taxiTime = Math.ceil(distance * 5 + 5);
      const estimatedCost = Math.ceil(distance * 2 + 6);
      
      options.push({
        type: 'taxi',
        duration: `${taxiTime} min`,
        cost: `S$${estimatedCost} - S$${estimatedCost + 5}`,
        description: 'Take taxi or ComfortDelGro cab',
        steps: [`Take taxi directly to ${to}`]
      });

      options.push({
        type: 'grab',
        duration: `${taxiTime} min`,
        cost: `S$${estimatedCost - 2} - S$${estimatedCost + 3}`,
        description: 'Book Grab ride',
        steps: [`Book Grab ride to ${to}`]
      });
    }

    return options;
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
        recommended: transportOptions[0] // Default to first option
      });
    }

    // Generate different route optimizations
    setRoutes({
      budget: segments.map(segment => ({
        ...segment,
        recommended: segment.transportOptions.reduce((cheapest, current) => {
          const cheapestCost = parseFloat(cheapest.cost.replace(/[^0-9.]/g, '') || '999');
          const currentCost = parseFloat(current.cost.replace(/[^0-9.]/g, '') || '999');
          return currentCost < cheapestCost ? current : cheapest;
        })
      })),
      comfort: segments.map(segment => ({
        ...segment,
        recommended: segment.distance > 1.5 
          ? segment.transportOptions.find(opt => opt.type === 'grab' || opt.type === 'taxi') || 
            segment.transportOptions.find(opt => opt.type === 'public_transport') || 
            segment.transportOptions[0]
          : segment.transportOptions.find(opt => opt.type === 'public_transport' || opt.type === 'mrt') || segment.transportOptions[0]
      })),
      speed: segments.map(segment => ({
        ...segment,
        recommended: segment.transportOptions.reduce((fastest, current) => {
          const fastestTime = parseInt(fastest.duration);
          const currentTime = parseInt(current.duration);
          return currentTime < fastestTime ? current : fastest;
        })
      }))
    });
  };

  const getTransportIcon = (type: TransportOption['type']) => {
    switch (type) {
      case 'mrt': return <Train className="h-4 w-4" />;
      case 'bus': return <Bus className="h-4 w-4" />;
      case 'public_transport': return <Train className="h-4 w-4" />;
      case 'taxi':
      case 'grab': return <Car className="h-4 w-4" />;
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
      case 'grab': return 'bg-purple-500';
      case 'walk': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateTotalCost = (segments: RouteSegment[]) => {
    return segments.reduce((total, segment) => {
      const cost = parseFloat(segment.recommended.cost.replace(/[^0-9.]/g, '') || '0');
      return total + cost;
    }, 0);
  };

  const calculateTotalTime = (segments: RouteSegment[]) => {
    return segments.reduce((total, segment) => {
      const time = parseInt(segment.recommended.duration);
      return total + time;
    }, 0);
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
            {t('nav.transport')}
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
            <TabsTrigger value="speed" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Fastest</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="budget" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    Budget-Friendly Route
                  </span>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{calculateTotalTime(routes.budget)} min total</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>~S${calculateTotalCost(routes.budget).toFixed(2)}</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {routes.budget.map((segment, index) => (
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
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comfort" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    Comfort Route
                  </span>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{calculateTotalTime(routes.comfort)} min total</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>~S${calculateTotalCost(routes.comfort).toFixed(2)}</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {routes.comfort.map((segment, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xs font-medium">
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
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="speed" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Fastest Route
                  </span>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{calculateTotalTime(routes.speed)} min total</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>~S${calculateTotalCost(routes.speed).toFixed(2)}</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {routes.speed.map((segment, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-medium">
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
                ))}
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