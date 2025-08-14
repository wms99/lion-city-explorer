import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { WeatherCard } from "@/components/home/WeatherCard";
import { EventsCard } from "@/components/home/EventsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Bus } from "lucide-react";
import heroImage from "@/assets/singapore-hero.jpg";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("singapore-tourist-name");
    if (savedName) {
      setUserName(savedName);
    } else {
      setShowNameInput(true);
    }
  }, []);

  const handleNameSave = () => {
    if (userName.trim()) {
      localStorage.setItem("singapore-tourist-name", userName.trim());
      setShowNameInput(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-80 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-6 px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
              Welcome to Singapore!
            </h1>
            <p className="text-xl md:text-2xl text-white/90 animate-fade-in mb-8">
              Discover the Lion City with your personal travel companion
            </p>
            <div className="space-y-6 animate-fade-in">
              <Button 
                onClick={() => navigate('/profile-preferences')}
                size="lg"
                className="bg-gradient-hero hover:opacity-90 text-white border-0 rounded-2xl px-10 py-5 text-xl font-semibold shadow-elegant hover:shadow-glow transition-smooth transform hover:scale-[1.02] hover:-translate-y-0.5 min-w-[260px] backdrop-blur-sm"
              >
                Get Started
              </Button>
              
              <div className="space-y-2">
                <p className="text-white/90 text-lg font-medium">
                  Plan your perfect Singapore trip
                </p>
                <p className="text-white/70 text-sm">
                  Personalized recommendations • Smart itineraries • Local insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-gradient-to-b from-background/0 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-8 relative z-10">
            <Card 
              className="bg-card/80 backdrop-blur-sm shadow-card hover:shadow-elegant transition-smooth cursor-pointer"
              onClick={() => navigate('/tourist-spots')}
            >
              <CardContent className="p-6 text-center">
                <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Explore Spots</h3>
                <p className="text-muted-foreground text-sm">Discover amazing tourist attractions and local food</p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-card/80 backdrop-blur-sm shadow-card hover:shadow-elegant transition-smooth cursor-pointer"
              onClick={() => navigate('/itinerary')}
            >
              <CardContent className="p-6 text-center">
                <Calendar className="h-10 w-10 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Plan Itinerary</h3>
                <p className="text-muted-foreground text-sm">Create your perfect Singapore adventure</p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-card/80 backdrop-blur-sm shadow-card hover:shadow-elegant transition-smooth cursor-pointer"
              onClick={() => navigate('/transport')}
            >
              <CardContent className="p-6 text-center">
                <Bus className="h-10 w-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Transport</h3>
                <p className="text-muted-foreground text-sm">Navigate the city with ease</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <WeatherCard />
            <EventsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;