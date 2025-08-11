import { useState } from "react";
import { MapPin, X, Star, Clock, DollarSign, Plus } from "lucide-react";
import { singaporeAttractions, getCategoryColor, getBudgetColor, type Attraction } from "@/data/attractions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import mapImage from "@/assets/singapore-map.jpg";

export function InteractiveMap() {
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const { toast } = useToast();

  const handlePinClick = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
  };

  const handleAddToItinerary = (attraction: Attraction) => {
    // For now, just show a toast. Later this will integrate with the itinerary system
    const savedItinerary = JSON.parse(localStorage.getItem('singapore-itinerary') || '[]');
    const isAlreadyAdded = savedItinerary.some((item: any) => item.id === attraction.id);
    
    if (isAlreadyAdded) {
      toast({
        title: "Already in itinerary",
        description: `${attraction.name} is already in your itinerary.`,
        variant: "default"
      });
    } else {
      savedItinerary.push({
        id: attraction.id,
        name: attraction.name,
        category: attraction.category,
        addedAt: new Date().toISOString()
      });
      localStorage.setItem('singapore-itinerary', JSON.stringify(savedItinerary));
      
      toast({
        title: "Added to itinerary",
        description: `${attraction.name} has been added to your itinerary!`,
        variant: "default"
      });
    }
    setSelectedAttraction(null);
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-xl border border-border shadow-card">
      {/* Map Image */}
      <img
        src={mapImage}
        alt="Singapore Map"
        className="w-full h-full object-cover"
      />
      
      {/* Interactive Pins */}
      {singaporeAttractions.map((attraction) => (
        <button
          key={attraction.id}
          onClick={() => handlePinClick(attraction)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group hover:scale-110 transition-transform"
          style={{
            left: `${attraction.coordinates.x}%`,
            top: `${attraction.coordinates.y}%`,
          }}
        >
          <div className="relative">
            <MapPin 
              className={`w-6 h-6 drop-shadow-lg group-hover:scale-110 transition-all ${
                attraction.category === 'food' 
                  ? 'text-orange-500' 
                  : attraction.category === 'tourist'
                  ? 'text-blue-500'
                  : attraction.category === 'culture'
                  ? 'text-purple-500'
                  : 'text-green-500'
              }`}
              fill="currentColor"
            />
            <div className={`absolute -top-2 -left-2 w-10 h-10 rounded-full animate-ping opacity-75 group-hover:opacity-100 ${
              attraction.category === 'food' 
                ? 'bg-orange-500/20' 
                : attraction.category === 'tourist'
                ? 'bg-blue-500/20'
                : attraction.category === 'culture'
                ? 'bg-purple-500/20'
                : 'bg-green-500/20'
            }`}></div>
          </div>
          
          {/* Tooltip on hover */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {attraction.name}
            </div>
            <div className="w-2 h-2 bg-black transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </button>
      ))}

      {/* Popup Modal */}
      {selectedAttraction && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
          <Card className="w-full max-w-md max-h-[80%] overflow-y-auto shadow-elegant">
            <CardHeader className="relative pb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAttraction(null)}
                className="absolute right-2 top-2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold pr-8">
                    {selectedAttraction.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getCategoryColor(selectedAttraction.category)}>
                      {selectedAttraction.category}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getBudgetColor(selectedAttraction.budgetCategory)}
                    >
                      {selectedAttraction.budgetCategory}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{selectedAttraction.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({selectedAttraction.reviewCount.toLocaleString()} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {selectedAttraction.description}
              </p>

              {/* Key Details */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedAttraction.openingHours}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedAttraction.ticketPrice}</span>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <h4 className="font-medium text-sm mb-2">Highlights</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedAttraction.highlights.map((highlight, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Nearby Food */}
              {selectedAttraction.nearbyFood && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Nearby Food</h4>
                  <div className="text-sm text-muted-foreground">
                    {selectedAttraction.nearbyFood.join(", ")}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={() => handleAddToItinerary(selectedAttraction)}
                className="w-full bg-gradient-ocean text-white hover:shadow-elegant transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Itinerary
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}