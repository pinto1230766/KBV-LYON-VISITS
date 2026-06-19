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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-header border-t border-border/50 safe-bottom">
      <div className="flex items-center px-2 py-2 overflow-x-auto hide-scrollbar w-full">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl flex-shrink-0 transition-colors duration-200 min-w-[72px]"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTabPill"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10 shadow-inner"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon 
                className={`w-6 h-6 transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-muted-foreground"}`} 
              />
              <span className={`text-[9px] font-bold uppercase tracking-widest leading-tight truncate max-w-[64px] text-center ${isActive ? "text-primary opacity-100" : "text-muted-foreground opacity-70"}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.span 
                  layoutId="mobileActiveDot"
                  className="w-1 h-1 bg-primary rounded-full absolute bottom-1" 
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
