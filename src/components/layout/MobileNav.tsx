import React from "react";
import { LucideIcon } from "lucide-react";
import { AppTab } from "../../store/useUIStore";
import { motion } from "framer-motion";

interface MobileNavProps {
  navItems: Array<{ id: AppTab; label: string; icon: LucideIcon }>;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ navItems, activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden ios-glass border-t border-border/60 safe-bottom transition-colors">
      <div className="flex items-center justify-around px-2 py-0.5 sm:py-1.5 w-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-0.5 sm:py-1 px-1 rounded-2xl transition-all duration-200 min-w-0 active:scale-90 touch-manipulation"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTabPill"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10 shadow-inner"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon 
                className={`w-5 h-5 transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-muted-foreground"}`} 
              />
              <span className={`text-[10px] font-bold uppercase tracking-wider leading-tight truncate w-full text-center ${isActive ? "text-primary opacity-100" : "text-muted-foreground opacity-70"}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.span 
                  layoutId="mobileActiveDot"
                  className="w-1 h-1 bg-primary rounded-full absolute bottom-0.5" 
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
