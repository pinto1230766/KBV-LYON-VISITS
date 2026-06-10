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
    <div className="flex h-screen w-screen overflow-x-hidden bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
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
        <main className="flex-1 px-4 md:px-8 pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-12 overflow-y-auto overscroll-contain bg-background/50">
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

      {/* Desktop Sidebar */}
      <aside className="w-[380px] bg-card/30 glass-header border-l border-border/40 hidden lg:block overflow-hidden">
        <div className="h-full w-full">
          {sidebar}
        </div>
      </aside>

      <OfflineIndicator />
    </div>
  );
};
