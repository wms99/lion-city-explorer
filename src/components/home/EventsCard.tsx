import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, ExternalLink, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  featured: boolean;
  image?: string;
}

// Mock events data
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Singapore Night Festival",
    description: "A spectacular light installation and arts festival in the Civic District",
    date: "2024-01-20",
    time: "7:00 PM - 11:00 PM",
    location: "Civic District",
    category: "Festival",
    featured: true
  },
  {
    id: "2",
    title: "Gardens by the Bay Light Show",
    description: "Mesmerizing light and music show at the iconic Supertree Grove",
    date: "2024-01-15",
    time: "7:45 PM & 8:45 PM",
    location: "Gardens by the Bay",
    category: "Entertainment",
    featured: true
  },
  {
    id: "3",
    title: "Chinatown Food Festival",
    description: "Sample authentic local delicacies and street food",
    date: "2024-01-18",
    time: "5:00 PM - 10:00 PM",
    location: "Chinatown",
    category: "Food",
    featured: false
  },
  {
    id: "4",
    title: "Singapore Art Museum Exhibition",
    description: "Contemporary Southeast Asian art showcase",
    date: "2024-01-16",
    time: "10:00 AM - 6:00 PM",
    location: "Singapore Art Museum",
    category: "Culture",
    featured: false
  }
];

export function EventsCard() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'festival':
        return 'bg-gradient-sunrise text-white';
      case 'entertainment':
        return 'bg-gradient-ocean text-white';
      case 'food':
        return 'bg-gradient-garden text-white';
      case 'culture':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('home.events')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card hover:shadow-elegant transition-smooth">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Star className="h-5 w-5 text-accent" />
          <span>{t('home.events')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className={`p-4 rounded-xl border transition-smooth hover:shadow-card cursor-pointer ${
              event.featured 
                ? 'bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20' 
                : 'bg-card border-border/50 hover:border-border'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-sm text-foreground">{event.title}</h4>
                  {event.featured && (
                    <Badge className="bg-gradient-sunrise text-white text-xs px-2 py-1">
                      Featured
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
                
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <Badge className={`text-xs px-2 py-1 ${getCategoryColor(event.category)}`}>
                  {event.category}
                </Badge>
                <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-auto">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {t('home.viewDetails')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}