import { useEffect, useRef, useState } from "react";
import { MapPin, X, Star, Clock, DollarSign, Plus } from "lucide-react";
import { singaporeAttractions, getCategoryColor, getBudgetColor, type Attraction } from "@/data/attractions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface InteractiveMapProps {
  filteredAttractions?: Attraction[];
}

export function InteractiveMap({ filteredAttractions = singaporeAttractions }: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clear existing markers when filters change
    markersRef.current.forEach(marker => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([1.3521, 103.8198], 11);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapRef.current);
    }

    // Add markers for filtered attractions
    filteredAttractions.forEach((attraction) => {
      const iconColor = getMarkerColor(attraction.category);
      
      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative">
            <div class="w-8 h-8 ${iconColor} rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer transform hover:scale-110 transition-transform">
              <div class="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div class="absolute -top-1 -left-1 w-10 h-10 ${iconColor.replace('bg-', 'bg-opacity-20 bg-')} rounded-full animate-ping"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([attraction.coordinates.lat, attraction.coordinates.lng], {
        icon: customIcon,
      }).addTo(mapRef.current!);

      // Add popup on click
      marker.on('click', () => {
        setSelectedAttraction(attraction);
      });

      // Add tooltip on hover
      marker.bindTooltip(attraction.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'custom-tooltip',
      });

      markersRef.current.push(marker);
    });

    // Cleanup function - only when component unmounts
    return () => {
      if (mapRef.current && mapContainerRef.current?.children.length === 0) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [filteredAttractions]);

  const getMarkerColor = (category: Attraction['category']) => {
    switch (category) {
      case 'food':
        return 'bg-orange-500';
      case 'tourist':
        return 'bg-blue-500';
      case 'culture':
        return 'bg-purple-500';
      case 'shopping':
        return 'bg-green-500';
      case 'events':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAddToItinerary = (attraction: Attraction) => {
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
    <>
      <style>{`
        .custom-marker {
          background: none !important;
          border: none !important;
        }
        .custom-tooltip {
          background: rgba(0, 0, 0, 0.8) !important;
          color: white !important;
          border: none !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          padding: 4px 8px !important;
        }
        .custom-tooltip::before {
          border-top-color: rgba(0, 0, 0, 0.8) !important;
        }
        .leaflet-popup-content-wrapper {
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
      `}</style>
      
      <div className="relative w-full h-[600px] overflow-hidden rounded-xl border border-border shadow-card">
        {/* Map Container */}
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Legend */}
        <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-border">
          <h4 className="font-medium text-sm mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Tourist Attractions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Food Places</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Cultural Sites</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Shopping</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Events</span>
            </div>
          </div>
        </div>

        {/* Popup Modal */}
        {selectedAttraction && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
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
    </>
  );
}