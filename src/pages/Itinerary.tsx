import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Star, Calendar, Trash2, Plus, Route } from "lucide-react";
import { singaporeAttractions, getCategoryColor, type Attraction } from "@/data/attractions";
import { useToast } from "@/hooks/use-toast";

interface ItineraryItem {
  id: string;
  name: string;
  category: string;
  addedAt: string;
  suggestedDuration?: number; // in minutes
  optimalTimeSlot?: 'morning' | 'afternoon' | 'evening' | 'night';
  visitType?: 'quick' | 'standard' | 'extended';
}

const Itinerary = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [savedItems, setSavedItems] = useState<ItineraryItem[]>([]);
  const [scheduleSuggestions, setScheduleSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const loadItinerary = () => {
      const saved = JSON.parse(localStorage.getItem('singapore-itinerary') || '[]');
      setSavedItems(saved);
      generateScheduleSuggestions(saved);
    };

    loadItinerary();
  }, []);

  const generateScheduleSuggestions = (items: ItineraryItem[]) => {
    if (items.length === 0) {
      setScheduleSuggestions([]);
      return;
    }

    const suggestions = [];
    const attractions = items.map(item => getAttractionDetails(item.id)).filter(Boolean);
    
    // Calculate total estimated time
    const totalDuration = attractions.reduce((total, attraction) => {
      return total + getAttractionDuration(attraction!);
    }, 0);
    
    const totalHours = Math.ceil(totalDuration / 60);
    
    // Duration-based suggestions
    if (totalHours < 4) {
      suggestions.push(`Perfect half-day itinerary! Your ${totalHours}-hour schedule allows for a relaxed pace with time for meals.`);
    } else if (totalHours <= 8) {
      suggestions.push(`Great full-day adventure! Plan for ${totalHours} hours with meal breaks included.`);
    } else {
      suggestions.push(`Ambitious ${totalHours}-hour itinerary! Consider splitting across multiple days for the best experience.`);
    }
    
    // Category-specific suggestions
    const categories = attractions.map(a => a!.category);
    const hasFood = categories.includes('food');
    const hasCulture = categories.includes('culture');
    const hasTourist = categories.includes('tourist');
    const hasShopping = categories.includes('shopping');
    
    if (!hasFood && items.length >= 2) {
      suggestions.push("💡 Add a hawker center or restaurant between attractions for authentic Singapore cuisine.");
    }
    
    if (hasCulture && hasTourist) {
      suggestions.push("🌅 Visit cultural sites (Chinatown, Little India) in the morning when it's cooler and less crowded.");
    }
    
    if (attractions.some(a => a!.id === 'gardens-by-the-bay')) {
      suggestions.push("✨ Gardens by the Bay is spectacular at sunset - plan your visit for 6-8 PM for the light show.");
    }
    
    if (attractions.some(a => a!.id === 'marina-bay-sands')) {
      suggestions.push("🏙️ Marina Bay Sands SkyPark offers stunning views - consider visiting during golden hour or after dark.");
    }
    
    if (attractions.some(a => a!.id === 'sentosa-island' || a!.id === 'universal-studios')) {
      suggestions.push("🎢 Sentosa/Universal Studios are full-day destinations - allocate 6-8 hours and start early!");
    }
    
    // Practical tips based on attractions
    const outdoorAttractions = attractions.filter(a => 
      ['singapore-zoo', 'singapore-botanic-gardens', 'east-coast-park', 'sentosa-island'].includes(a!.id)
    );
    
    if (outdoorAttractions.length >= 2) {
      suggestions.push("☀️ Multiple outdoor attractions detected - bring sunscreen, water, and plan for Singapore's tropical weather.");
    }
    
    // Transportation tips
    if (items.length >= 3) {
      suggestions.push("🚇 Group nearby attractions: Marina Bay area, Chinatown/Chinatown Heritage, Orchard Road for efficient travel.");
      suggestions.push("📱 Download the Singapore MRT app for real-time public transport directions between attractions.");
    }
    
    // Advanced booking suggestions
    const needsBooking = attractions.filter(a => 
      ['marina-bay-sands', 'singapore-flyer', 'universal-studios', 'night-safari'].includes(a!.id)
    );
    
    if (needsBooking.length > 0) {
      suggestions.push("🎫 Book tickets online in advance for popular attractions to skip queues and save money.");
    }

    setScheduleSuggestions(suggestions);
  };

  const removeFromItinerary = (id: string) => {
    const updatedItems = savedItems.filter(item => item.id !== id);
    setSavedItems(updatedItems);
    localStorage.setItem('singapore-itinerary', JSON.stringify(updatedItems));
    generateScheduleSuggestions(updatedItems);
    
    toast({
      title: "Removed from itinerary",
      description: "Item has been removed from your itinerary.",
      variant: "default"
    });
  };

  const clearItinerary = () => {
    setSavedItems([]);
    localStorage.setItem('singapore-itinerary', JSON.stringify([]));
    setScheduleSuggestions([]);
    
    toast({
      title: "Itinerary cleared",
      description: "All items have been removed from your itinerary.",
      variant: "default"
    });
  };

  const getAttractionDetails = (id: string): Attraction | null => {
    return singaporeAttractions.find(attraction => attraction.id === id) || null;
  };

  // Research-based duration recommendations (in minutes)
  const getAttractionDuration = (attraction: Attraction, visitType: 'quick' | 'standard' | 'extended' = 'standard'): number => {
    const baseDurations: Record<string, { quick: number; standard: number; extended: number }> = {
      // Major Tourist Attractions
      'marina-bay-sands': { quick: 60, standard: 120, extended: 180 },
      'gardens-by-the-bay': { quick: 90, standard: 150, extended: 240 },
      'sentosa-island': { quick: 240, standard: 480, extended: 720 }, // Full day destination
      'singapore-zoo': { quick: 120, standard: 180, extended: 300 },
      'universal-studios': { quick: 300, standard: 480, extended: 600 }, // Theme park - full day
      'singapore-flyer': { quick: 45, standard: 60, extended: 90 },
      'night-safari': { quick: 120, standard: 180, extended: 240 },
      'jurong-bird-park': { quick: 120, standard: 180, extended: 240 },
      'sea-aquarium': { quick: 90, standard: 120, extended: 180 },
      'singapore-botanic-gardens': { quick: 60, standard: 120, extended: 180 },
      'raffles-hotel': { quick: 30, standard: 45, extended: 75 },
      
      // Cultural Sites
      'chinatown': { quick: 60, standard: 120, extended: 180 },
      'little-india': { quick: 60, standard: 90, extended: 150 },
      'kampong-glam': { quick: 45, standard: 75, extended: 120 },
      'haw-par-villa': { quick: 45, standard: 90, extended: 120 },
      
      // Quick Visits
      'merlion-park': { quick: 20, standard: 30, extended: 45 },
      'clarke-quay': { quick: 45, standard: 90, extended: 180 },
      
      // Food Centers
      'hawker-centres': { quick: 30, standard: 60, extended: 90 },
      'newton-food-centre': { quick: 30, standard: 60, extended: 90 },
      'lau-pa-sat': { quick: 30, standard: 45, extended: 75 },
      'east-coast-park': { quick: 45, standard: 90, extended: 150 },
      'holland-village': { quick: 45, standard: 75, extended: 120 },
      
      // Shopping
      'orchard-road': { quick: 60, standard: 180, extended: 360 }, // Shopping can take all day
    };

    const duration = baseDurations[attraction.id] || { quick: 60, standard: 90, extended: 120 };
    return duration[visitType];
  };

  // Determine optimal time slot based on attraction type and characteristics
  const getOptimalTimeSlot = (attraction: Attraction): 'morning' | 'afternoon' | 'evening' | 'night' => {
    // Night-specific attractions
    if (attraction.id === 'night-safari' || attraction.id === 'clarke-quay') return 'night';
    
    // Evening attractions (better lighting, cooler)
    if (attraction.id === 'gardens-by-the-bay' || attraction.id === 'singapore-flyer' || 
        attraction.id === 'marina-bay-sands') return 'evening';
    
    // Morning attractions (cooler weather, fewer crowds)
    if (attraction.category === 'culture' || attraction.id === 'singapore-zoo' || 
        attraction.id === 'singapore-botanic-gardens' || attraction.id === 'jurong-bird-park') return 'morning';
    
    // Food centers for meal times
    if (attraction.category === 'food') {
      if (attraction.id.includes('newton') || attraction.id.includes('clarke')) return 'night';
      return 'afternoon'; // Most food centers for lunch/dinner
    }
    
    // Shopping in afternoon (avoid morning rush, cool indoor environment)
    if (attraction.category === 'shopping') return 'afternoon';
    
    // Default to afternoon for most tourist attractions
    return 'afternoon';
  };

  const getOptimalSchedule = () => {
    if (savedItems.length === 0) return [];
    
    // Get attraction details with enhanced duration info
    const itemsWithDetails = savedItems.map(item => {
      const attraction = getAttractionDetails(item.id);
      if (!attraction) return null;
      
      const suggestedDuration = getAttractionDuration(attraction);
      const optimalTimeSlot = getOptimalTimeSlot(attraction);
      
      return {
        ...item,
        attraction,
        suggestedDuration,
        optimalTimeSlot,
        visitType: 'standard' as const
      };
    }).filter(Boolean);

    // Sort by optimal time slot priority
    const timeSlotPriority = { morning: 1, afternoon: 2, evening: 3, night: 4 };
    const sortedItems = itemsWithDetails.sort((a, b) => {
      const aPriority = timeSlotPriority[a.optimalTimeSlot];
      const bPriority = timeSlotPriority[b.optimalTimeSlot];
      return aPriority - bPriority;
    });

    // Create realistic schedule with proper time allocation
    let currentTime = 9 * 60; // Start at 9:00 AM (in minutes)
    const schedule = sortedItems.map((item, index) => {
      const duration = item.suggestedDuration;
      const startHour = Math.floor(currentTime / 60);
      const startMin = currentTime % 60;
      const endTime = currentTime + duration;
      const endHour = Math.floor(endTime / 60);
      const endMin = endTime % 60;
      
      const timeSlot = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')} - ${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      
      // Add travel time between attractions (15-30 min depending on distance)
      const travelTime = index < sortedItems.length - 1 ? 30 : 0;
      currentTime = endTime + travelTime;
      
      // Add meal breaks for long schedules
      if (currentTime > 12 * 60 && currentTime < 13 * 60 && index < sortedItems.length - 1) {
        currentTime = 13 * 60; // Lunch break until 1 PM
      }
      if (currentTime > 18 * 60 && currentTime < 19 * 60 && index < sortedItems.length - 1) {
        currentTime = 19 * 60; // Dinner break until 7 PM
      }
      
      return {
        ...item,
        timeSlot,
        duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
        travelTime: travelTime > 0 ? `${travelTime}m travel` : null
      };
    });
    
    return schedule;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Itinerary Planner
            </h1>
            <p className="text-muted-foreground mt-1">
              Plan your perfect Singapore adventure with personalized schedule recommendations
            </p>
          </div>
          
          {savedItems.length > 0 && (
            <Button 
              onClick={clearItinerary}
              variant="outline" 
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {savedItems.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your itinerary is empty</h3>
              <p className="text-muted-foreground mb-6">
                Start adding attractions from the Explore Spots page to build your perfect Singapore adventure!
              </p>
              <Button onClick={() => window.location.href = '/tourist-spots'}>
                <Plus className="h-4 w-4 mr-2" />
                Explore Spots
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Saved Attractions */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Your Attractions ({savedItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {savedItems.map((item) => {
                    const attraction = getAttractionDetails(item.id);
                    if (!attraction) return null;
                    
                    return (
                      <div key={item.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:shadow-sm transition-smooth">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-lg">{attraction.name}</h4>
                            <Button
                              onClick={() => removeFromItinerary(item.id)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getCategoryColor(attraction.category)}>
                              {attraction.category}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{attraction.rating}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {attraction.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{attraction.openingHours}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>{attraction.ticketPrice}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Schedule & Recommendations */}
            <div className="space-y-4">
              {/* Suggested Schedule */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Route className="h-5 w-5 mr-2" />
                    Suggested Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getOptimalSchedule().map((item, index) => (
                    <div key={item.id} className="mb-4 last:mb-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm">{item.timeSlot}</span>
                      </div>
                      <div className="ml-8">
                        <h5 className="font-medium">{item.attraction?.name}</h5>
                        <p className="text-xs text-muted-foreground">Duration: {item.duration}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Smart Recommendations */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Smart Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scheduleSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{savedItems.length}</div>
                      <div className="text-xs text-muted-foreground">Attractions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-secondary">
                        {(() => {
                          const totalMinutes = savedItems.reduce((total, item) => {
                            const attraction = getAttractionDetails(item.id);
                            return total + (attraction ? getAttractionDuration(attraction) : 90);
                          }, 0);
                          const hours = Math.floor(totalMinutes / 60);
                          const minutes = totalMinutes % 60;
                          return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
                        })()}
                      </div>
                      <div className="text-xs text-muted-foreground">Est. Duration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Itinerary;