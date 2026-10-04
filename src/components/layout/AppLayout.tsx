import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { AppTab } from "../../store/useUIStore";
import { LucideIcon } from "lucide-react";
import { OfflineIndicator } from "../OfflineIndicator";
import { PWAInstallBanner } from "../PWAInstallBanner";
import { SearchResult } from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  congregationName: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  searchResults: SearchResult[];
  handleResultClick: (result: SearchResult) => void;
  navItems: Array<{ id: AppTab; label: string; icon: LucideIcon }>;
  sidebar: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  congregationName,
  searchTerm,
  setSearchTerm,
  isSearchFocused,
  setIsSearchFocused,
  searchResults,
  handleResultClick,
  navItems,
  sidebar,
}) => {
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Left Sidebar (Style Apple iPadOS / macOS Sequoia) */}
      <aside className="w-[240px] lg:w-[270px] bg-card/75 backdrop-blur-2xl border-r border-border/70 flex flex-col py-3 md:py-6 h-full overflow-y-auto z-[60] hidden md:flex flex-shrink-0 select-none">
        {/* Apple App Header */}
        <div className="px-5 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-primary to-blue-600 p-2 shadow-md shadow-primary/25 flex items-center justify-center flex-shrink-0 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <rect x="3" y="4" width="18" height="18" rx="4" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-foreground tracking-tight truncate">KBV Visites</h2>
            <p className="text-[11px] font-medium text-muted-foreground truncate">{congregationName || "Lyon KBV"}</p>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-5 pb-2 text-[11px] font-bold text-muted-foreground/70 tracking-wider uppercase">
          Navigation
        </div>

        {/* Navigation Items with Apple Squircle Badges */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            
            // Apple HIG icon squircle colors (iOS Settings / Reminders style)
            const badgeColorMap: Record<string, string> = {
              dashboard: "bg-[#007AFF] text-white shadow-blue-500/25",
              planning: "bg-[#5856D6] text-white shadow-indigo-500/25",
              speakers: "bg-[#FF9500] text-white shadow-orange-500/25",
              hosts: "bg-[#34C759] text-white shadow-green-500/25",
              settings: "bg-[#8E8E93] text-white shadow-gray-500/25",
              install: "bg-[#32ADE6] text-white shadow-sky-500/25",
            };
            const badgeBg = badgeColorMap[item.id] || "bg-primary text-white shadow-primary/25";

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 text-left group ${
                  isActive
                    ? "bg-primary/15 text-primary font-semibold shadow-2xs"
                    : "text-foreground/80 hover:bg-muted/70 hover:text-foreground font-medium"
                }`}
              >
                {/* Apple Squircle Icon Badge */}
                <span className={`w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 shadow-2xs transition-transform group-hover:scale-105 group-active:scale-95 ${badgeBg}`}>
                  <item.icon className="w-4 h-4 text-white stroke-[2.2]" />
                </span>
                <span className="text-[13.5px] tracking-tight truncate flex-1">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Apple Sidebar Footer: System Status */}
        <div className="px-5 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 inline-block" />
            Connecté & Prêt
          </span>
          <span className="font-semibold text-[10px] text-muted-foreground/70">iOS HIG</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        <Header
          congregationName={congregationName}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
          searchResults={searchResults}
          handleResultClick={handleResultClick}
          navItems={navItems}
        />

        <PWAInstallBanner />

        {/* Dynamic Content with Transitions */}
        <main className="flex-1 min-h-0 px-3 sm:px-4 md:px-8 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-10 overflow-y-auto overscroll-contain bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={isMobile ? { opacity: 0, x: 20 } : { opacity: 0, y: 15, scale: 0.98 }}
              animate={isMobile ? { opacity: 1, x: 0 } : { opacity: 1, y: 0, scale: 1 }}
              exit={isMobile ? { opacity: 0, x: -20 } : { opacity: 0, y: -15, scale: 0.98 }}
              transition={isMobile ? {
                type: "spring",
                stiffness: 380,
                damping: 30
              } : { 
                duration: 0.3, 
                ease: [0.23, 1, 0.32, 1] 
              }}
              className="min-h-full py-3 md:py-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <MobileNav
          navItems={navItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Desktop Sidebar (Right) - Shown on large screens >= 1280px to leave plenty of space for tablets */}
      <aside className="w-[350px] border-l border-border hidden xl:block overflow-hidden flex-shrink-0 sidebar-dark">
        <div className="h-full w-full">
          {sidebar}
        </div>
      </aside>

      <OfflineIndicator />
    </div>
  );
};
