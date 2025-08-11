import { useState } from "react";
import { Home, MapPin, Calendar, Bus, Settings, Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation();
  const collapsed = state === "collapsed";

  const items = [
    { title: t('nav.home'), url: "/", icon: Home },
    { title: t('nav.touristSpots'), url: "/tourist-spots", icon: MapPin },
    { title: t('nav.itinerary'), url: "/itinerary", icon: Calendar },
    { title: t('nav.transport'), url: "/transport", icon: Bus },
    { title: t('nav.settings'), url: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => currentPath === path;
  const isExpanded = items.some((i) => isActive(i.url));
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-sm border-l-2 border-primary-light" 
      : "hover:bg-muted/80 hover:text-foreground text-foreground/80 transition-smooth font-medium";

  return (
    <Sidebar
      className="border-r border-border/50 bg-card/98 backdrop-blur-sm transition-smooth"
      collapsible="icon"
    >
      <SidebarContent className="py-6">
        {/* Logo/Title */}
        <div className="px-6 py-3 mb-6">
          {!collapsed ? (
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Singapore
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Travel Guide
              </p>
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider px-6 pb-2">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>

          <SidebarGroupContent className="px-3">
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-xl h-11 transition-smooth">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className={`h-5 w-5 ${!collapsed ? 'mr-3' : ''} flex-shrink-0`} />
                      {!collapsed && (
                        <span className="truncate text-sm font-medium">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}