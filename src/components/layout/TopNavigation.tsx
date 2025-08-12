import { Home, MapPin, Calendar, Bus, Settings, User } from "lucide-react";
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
    { title: "Home", url: "/", icon: Home },
    { title: "Attractions", url: "/tourist-spots", icon: MapPin },
    { title: "Itinerary", url: "/itinerary", icon: Calendar },
    { title: "Transport", url: "/transport", icon: Bus },
    { title: "Settings", url: "/settings", icon: Settings },
    { title: "Profile", url: "/profile-preferences", icon: User },
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