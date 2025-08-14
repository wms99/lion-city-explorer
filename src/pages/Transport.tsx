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

interface DayBucket {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  displayLabel: string; // "Day 1 (Mon, 12 Aug)"
  transportItems: TransportItem[];
}

const Transport = () => {
  const { t } = useTranslation();
  const [savedItems, setSavedItems] = useState<ItineraryItem[]>([]);
  const [dayBuckets, setDayBuckets] = useState<DayBucket[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [transportItems, setTransportItems] = useState<TransportItem[]>([]);
  const [defaultTimezone] = useState<string>('Asia/Singapore');

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
    
    // Load transport items (mock data for now)
    const mockTransportItems = generateMockTransportItems(saved);
    setTransportItems(mockTransportItems);
    
    // Create day buckets
    const buckets = createDayBuckets(saved, mockTransportItems);
    setDayBuckets(buckets);
    
    // Set default selected day (today if in range, otherwise Day 1)
    const defaultDay = getDefaultSelectedDay(buckets);
    setSelectedDay(defaultDay);
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
        transportItems: []
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

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'mrt': return <Train className="h-4 w-4" />;
      case 'bus': return <Bus className="h-4 w-4" />;
      case 'grab':
      case 'taxi':
      case 'tada':
      case 'gojek':
      case 'private_hire':
      case 'own_car': return <Car className="h-4 w-4" />;
      case 'walk': return <Footprints className="h-4 w-4" />;
      default: return <Route className="h-4 w-4" />;
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

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Transport Schedule
          </h1>
          <p className="text-muted-foreground mt-1">
            Transport options organized by day from your itinerary
          </p>
        </div>

        {/* Day Navigation */}
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

        {/* Transport Items Display */}
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

        {/* Summary Log */}
        {dayBuckets.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Transport Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Buckets created:</span> {dayBuckets.length}
                </div>
                <div>
                  <span className="font-medium">Items assigned:</span> {transportItems.length}
                </div>
                <div>
                  <span className="font-medium">Split segments:</span> {transportItems.filter(item => item.is_segment).length}
                </div>
                <div>
                  <span className="font-medium">Default day:</span> Day {selectedDay}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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