import { Home, MapPin, Calendar, Bus, Settings, Compass } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function TopNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation();

  const mainItems = [
    { 
      title: t('nav.home'), 
      url: "/", 
      icon: Home,
      description: "Welcome page and overview"
    },
    { 
      title: "Explore", 
      icon: Compass,
      items: [
        { 
          title: t('nav.touristSpots'), 
          url: "/tourist-spots", 
          icon: MapPin,
          description: "Discover Singapore's attractions"
        },
        { 
          title: t('nav.itinerary'), 
          url: "/itinerary", 
          icon: Calendar,
          description: "Plan your daily schedule"
        },
        { 
          title: t('nav.transport'), 
          url: "/transport", 
          icon: Bus,
          description: "Get around Singapore efficiently"
        }
      ]
    },
    { 
      title: t('nav.settings'), 
      url: "/settings", 
      icon: Settings,
      description: "App preferences and settings"
    },
  ];

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items: any[]) => items.some(item => isActive(item.url));

  return (
    <NavigationMenu className="hidden md:block">
      <NavigationMenuList className="space-x-1">
        {mainItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.items ? (
              <>
                <NavigationMenuTrigger 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "h-9 px-3 gap-2 data-[state=open]:bg-accent data-[active]:bg-accent",
                    isGroupActive(item.items) && "bg-primary text-primary-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[300px] gap-2 p-4">
                    {item.items.map((subItem) => (
                      <NavigationMenuLink
                        key={subItem.title}
                        asChild
                      >
                        <NavLink
                          to={subItem.url}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group",
                            isActive(subItem.url) && "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <subItem.icon className="h-4 w-4" />
                            <div className="text-sm font-medium leading-none">
                              {subItem.title}
                            </div>
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground group-hover:text-accent-foreground/80">
                            {subItem.description}
                          </p>
                        </NavLink>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild>
                <NavLink
                  to={item.url!}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "h-9 px-3 gap-2",
                    isActive(item.url!) 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </NavLink>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}