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
    
    if (items.length === 1) {
      suggestions.push("Consider adding more attractions to make a full day itinerary.");
    }
    
    if (items.length >= 2) {
      suggestions.push("Plan 2-3 hours per major attraction for a comfortable pace.");
    }
    
    const hasFood = items.some(item => item.category === 'food');
    if (!hasFood) {
      suggestions.push("Consider adding food stops from Singapore's famous hawker centers between attractions.");
    }
    
    const hasCulture = items.some(item => item.category === 'culture');
    const hasTourist = items.some(item => item.category === 'tourist');
    
    if (hasCulture && hasTourist) {
      suggestions.push("Great mix! Visit cultural sites in the morning when it's cooler, and indoor attractions during midday heat.");
    }
    
    if (items.length >= 3) {
      suggestions.push("Consider grouping nearby attractions together to minimize travel time.");
      suggestions.push("Book tickets online in advance for popular attractions like Marina Bay Sands SkyPark.");
    }
    
    if (items.length >= 4) {
      suggestions.push("This looks like a full day! Start early (9 AM) and plan for dinner at one of the food locations.");
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

  const getOptimalSchedule = () => {
    if (savedItems.length === 0) return [];
    
    // Simple scheduling logic - group by area and suggest timing
    const schedule = savedItems.map((item, index) => {
      const attraction = getAttractionDetails(item.id);
      if (!attraction) return null;
      
      let timeSlot = "";
      let duration = "";
      
      if (index === 0) {
        timeSlot = "9:00 AM - 11:30 AM";
        duration = "2.5 hours";
      } else if (index === 1) {
        timeSlot = "12:00 PM - 2:30 PM";
        duration = "2.5 hours";
      } else if (index === 2) {
        timeSlot = "3:00 PM - 5:30 PM";
        duration = "2.5 hours";
      } else {
        timeSlot = "6:00 PM - 8:30 PM";
        duration = "2.5 hours";
      }
      
      return {
        ...item,
        attraction,
        timeSlot,
        duration
      };
    }).filter(Boolean);
    
    return schedule;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              {t('nav.itinerary')}
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
                        {Math.ceil(savedItems.length * 2.5)}h
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