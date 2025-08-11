import { Home, MapPin, Calendar, Bus, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function TopNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation();

  const items = [
    { title: t('nav.home'), url: "/", icon: Home },
    { title: t('nav.touristSpots'), url: "/tourist-spots", icon: MapPin },
    { title: t('nav.itinerary'), url: "/itinerary", icon: Calendar },
    { title: t('nav.transport'), url: "/transport", icon: Bus },
    { title: t('nav.settings'), url: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => currentPath === path;

  const getNavCls = (path: string) =>
    isActive(path)
      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
      : "hover:bg-muted/80 hover:text-foreground text-foreground/80 transition-smooth font-medium";

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {items.map((item) => (
        <Button
          key={item.title}
          asChild
          variant="ghost"
          size="sm"
          className={`h-9 px-3 rounded-lg ${getNavCls(item.url)}`}
        >
          <NavLink to={item.url} end className="flex items-center space-x-2">
            <item.icon className="h-4 w-4" />
            <span className="text-sm">{item.title}</span>
          </NavLink>
        </Button>
      ))}
    </nav>
  );
}