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
    <div className="flex h-screen w-screen overflow-x-hidden bg-background text-foreground">
      {/* Desktop Left Sidebar */}
      <aside className="w-[280px] bg-card border-r border-border flex flex-col py-8 z-[60] hidden md:flex flex-shrink-0">
        <div className="px-6 mb-12">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">COORDINATION</span>
            <span className="text-xl font-bold text-primary">KBV - {congregationName || "Lyon KBV"}</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3.5 transition-all text-left group ${
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary active-nav-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-semibold capitalize">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative min-h-screen">
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
        <main className="flex-1 px-4 md:px-8 pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-12 overflow-y-auto overscroll-contain bg-background">
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
              className="h-full py-6"
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

      {/* Desktop Sidebar (Right) */}
      <aside className="w-[350px] border-l border-border hidden lg:block overflow-hidden flex-shrink-0 sidebar-dark">
        <div className="h-full w-full">
          {sidebar}
        </div>
      </aside>

      <OfflineIndicator />
    </div>
  );
};
