import { useTranslation } from "react-i18next";
import { MapPin, Filter, Grid, List } from "lucide-react";
import { InteractiveMap } from "@/components/tourist-spots/InteractiveMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { singaporeAttractions } from "@/data/attractions";
import { useState } from "react";

const TouristSpots = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', 'tourist', 'food', 'shopping', 'culture'];
  const filteredAttractions = filterCategory === 'all' 
    ? singaporeAttractions 
    : singaporeAttractions.filter(a => a.category === filterCategory);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              {t('nav.touristSpots')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover Singapore's most amazing attractions and local food spots
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Map View
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid View
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filterCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory(category)}
                  className="capitalize"
                >
                  {category === 'all' ? 'All Attractions' : category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === 'map' ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Singapore Interactive Map</CardTitle>
              <p className="text-sm text-muted-foreground">
                Click on the pins to explore attractions and add them to your itinerary
              </p>
            </CardHeader>
            <CardContent>
              <InteractiveMap />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttractions.map((attraction) => (
              <Card key={attraction.id} className="shadow-card hover:shadow-elegant transition-smooth">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{attraction.name}</CardTitle>
                    <Badge className={`capitalize`}>
                      {attraction.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{attraction.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({attraction.reviewCount.toLocaleString()})
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {attraction.description}
                  </p>
                  <div className="text-sm">
                    <div className="font-medium">{attraction.ticketPrice}</div>
                    <div className="text-muted-foreground">{attraction.openingHours}</div>
                  </div>
                  <Button className="w-full" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{singaporeAttractions.length}</div>
                <div className="text-sm text-muted-foreground">Total Attractions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {singaporeAttractions.filter(a => a.category === 'tourist').length}
                </div>
                <div className="text-sm text-muted-foreground">Tourist Spots</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">
                  {singaporeAttractions.filter(a => a.category === 'food').length}
                </div>
                <div className="text-sm text-muted-foreground">Food Places</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted-foreground">
                  {singaporeAttractions.filter(a => a.budgetCategory === 'budget').length}
                </div>
                <div className="text-sm text-muted-foreground">Budget-Friendly</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TouristSpots;