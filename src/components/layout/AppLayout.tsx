import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Header */}
        <header className="h-16 border-b border-border/50 bg-card/95 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="p-2.5 hover:bg-muted/80 rounded-lg transition-smooth text-foreground/80 hover:text-foreground" />
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                Singapore Travel Companion
              </h1>
            </div>
          </div>
          <LanguageSwitcher />
        </header>

        <div className="flex w-full">
          <AppSidebar />
          
          <main className="flex-1 overflow-hidden">
            <div className="h-full animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}