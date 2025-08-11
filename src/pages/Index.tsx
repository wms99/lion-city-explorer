import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { WeatherCard } from "@/components/home/WeatherCard";
import { EventsCard } from "@/components/home/EventsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Bus } from "lucide-react";
import heroImage from "@/assets/singapore-hero.jpg";

const Index = () => {
  const { t } = useTranslation();
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
          <div className="text-center text-white space-y-4 px-4">
            {showNameInput ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-4">What's your name?</h2>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
                  />
                  <Button onClick={handleNameSave} className="bg-gradient-sunrise border-0">
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                  {userName ? t('home.personalizedGreeting', { name: userName }) : t('home.welcome')}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 animate-fade-in">
                  Discover the Lion City with your personal travel companion
                </p>
                <Button 
                  onClick={() => setShowNameInput(true)}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 mt-4"
                >
                  Change Name
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-gradient-to-b from-background/0 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 -mt-16 relative z-10">
            <Card className="bg-card/80 backdrop-blur-sm shadow-card hover:shadow-elegant transition-smooth cursor-pointer">
              <CardContent className="p-6 text-center">
                <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Explore Spots</h3>
                <p className="text-muted-foreground text-sm">Discover amazing tourist attractions and local food</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm shadow-card hover:shadow-elegant transition-smooth cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="h-10 w-10 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Plan Itinerary</h3>
                <p className="text-muted-foreground text-sm">Create your perfect Singapore adventure</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm shadow-card hover:shadow-elegant transition-smooth cursor-pointer">
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