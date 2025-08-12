import { Home, MapPin, Calendar, Bus, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

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

  return (
    <NavigationMenu className="hidden md:block">
      <NavigationMenuList className="space-x-1">
        {items.map((item) => (
          <NavigationMenuItem key={item.title}>
            <NavigationMenuLink asChild>
              <NavLink
                to={item.url}
                className={cn(
                  navigationMenuTriggerStyle(),
                  "h-9 px-3 gap-2",
                  isActive(item.url) 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}