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
      ? "bg-gradient-ocean text-white font-medium shadow-card" 
      : "hover:bg-muted/80 hover:text-primary transition-smooth";

  return (
    <Sidebar
      className="border-r border-border/50 bg-card/50 backdrop-blur-sm transition-smooth"
      collapsible="icon"
    >
      <SidebarContent className="py-4">
        {/* Logo/Title */}
        <div className="px-4 py-2 mb-4">
          {!collapsed ? (
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Singapore Touristy
            </h1>
          ) : (
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-lg">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className={`h-5 w-5 ${!collapsed ? 'mr-3' : ''}`} />
                      {!collapsed && <span className="truncate">{item.title}</span>}
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