import { ReactNode } from "react";
import { TopNavigation } from "./TopNavigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="h-16 border-b border-border/50 bg-card/95 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-y-1">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Singapore
            </h1>
          </div>
          <TopNavigation />
        </div>
        <LanguageSwitcher />
      </header>

      <main className="w-full">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}