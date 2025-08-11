import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WeatherData {
  location: string;
  current: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
}

// Mock weather data for demo
const mockWeatherData: WeatherData = {
  location: "Singapore",
  current: {
    temp: 32,
    condition: "Partly Cloudy",
    humidity: 75,
    windSpeed: 8,
    icon: "partly-cloudy"
  },
  forecast: [
    { date: "2024-01-15", day: "Today", high: 32, low: 26, condition: "Partly Cloudy", icon: "partly-cloudy" },
    { date: "2024-01-16", day: "Tomorrow", high: 31, low: 25, condition: "Sunny", icon: "sunny" },
    { date: "2024-01-17", day: "Wed", high: 30, low: 24, condition: "Light Rain", icon: "light-rain" },
    { date: "2024-01-18", day: "Thu", high: 29, low: 23, condition: "Thunderstorms", icon: "thunderstorm" },
    { date: "2024-01-19", day: "Fri", high: 31, low: 25, condition: "Partly Cloudy", icon: "partly-cloudy" },
    { date: "2024-01-20", day: "Sat", high: 33, low: 27, condition: "Sunny", icon: "sunny" },
    { date: "2024-01-21", day: "Sun", high: 32, low: 26, condition: "Light Rain", icon: "light-rain" }
  ]
};

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case "sunny":
      return <Sun className="h-6 w-6 text-yellow-500" />;
    case "partly-cloudy":
      return <Cloud className="h-6 w-6 text-gray-500" />;
    case "light-rain":
    case "thunderstorm":
      return <CloudRain className="h-6 w-6 text-blue-500" />;
    default:
      return <Sun className="h-6 w-6 text-yellow-500" />;
  }
};

export function WeatherCard() {
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setWeather(mockWeatherData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('home.weather')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted rounded-lg"></div>
            <div className="space-y-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="shadow-card hover:shadow-elegant transition-smooth">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Thermometer className="h-5 w-5 text-primary" />
          <span>{t('home.weather')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Weather */}
        <div className="bg-gradient-ocean rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{weather.current.temp}°C</h3>
              <p className="text-white/80">{weather.current.condition}</p>
              <p className="text-sm text-white/60">{weather.location}</p>
            </div>
            <div className="text-right">
              {getWeatherIcon(weather.current.icon)}
              <div className="flex items-center space-x-4 mt-2 text-sm text-white/80">
                <div className="flex items-center space-x-1">
                  <Droplets className="h-3 w-3" />
                  <span>{weather.current.humidity}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Wind className="h-3 w-3" />
                  <span>{weather.current.windSpeed}km/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div>
          <h4 className="font-medium mb-3 text-foreground">{t('home.next7Days')}</h4>
          <div className="space-y-2">
            {weather.forecast.map((day, index) => (
              <div
                key={day.date}
                className={`flex items-center justify-between p-3 rounded-lg transition-smooth hover:bg-muted/50 ${
                  index === 0 ? 'bg-muted/30' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getWeatherIcon(day.icon)}
                  <div>
                    <p className="font-medium text-sm">
                      {index === 0 ? t('home.today') : day.day}
                    </p>
                    <p className="text-xs text-muted-foreground">{day.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm">{day.high}°</span>
                    <span className="text-muted-foreground text-sm">{day.low}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}