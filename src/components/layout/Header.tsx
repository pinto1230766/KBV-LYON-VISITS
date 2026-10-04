import React from "react";
import { Search, MapPin, User, Home, MessageSquare, Download, Sun, Moon } from "lucide-react";
import { KbvLogo } from "../KbvLogo";
import { useTranslation } from "../../hooks/useTranslation";
import { AppTab } from "../../store/useUIStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { LucideIcon } from "lucide-react";

export interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  type: "visit" | "speaker" | "host";
  payload?: unknown;
}

interface HeaderProps {
  congregationName: string;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  searchResults: SearchResult[];
  handleResultClick: (result: SearchResult) => void;
  navItems: Array<{ id: AppTab; label: string; icon: LucideIcon }>;
}

export const Header: React.FC<HeaderProps> = ({
  congregationName,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  isSearchFocused,
  setIsSearchFocused,
  searchResults,
  handleResultClick,
}) => {
  const { t } = useTranslation();
  const darkMode = useSettingsStore((s) => s.settings.darkMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  return (
    <header className="h-14 sm:h-16 md:h-18 lg:h-20 shrink-0 ios-glass border-b border-border/60 flex justify-between items-center px-3 sm:px-6 md:px-8 sticky top-0 z-50 safe-top transition-colors">
      {/* Mobile Logo & Desktop Tab Title */}
      <div className="flex items-center gap-6">
        {/* Mobile only logo */}
        <div className="flex lg:hidden items-center gap-2 flex-shrink-0 min-w-0">
          <div className="w-8 h-8 rounded-2xl overflow-hidden shadow-md bg-primary/15 p-0.5 flex-shrink-0 border border-primary/20">
            <KbvLogo className="w-full h-full" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-black text-foreground truncate max-w-[120px] xs:max-w-[160px]">
              KBV {congregationName && `- ${congregationName}`}
            </h1>
          </div>
        </div>

        {/* Desktop Title */}
        <h1 className="hidden lg:block text-xl font-bold uppercase tracking-wider text-foreground font-sans">
          {t(activeTab) || activeTab}
        </h1>

        {/* Global Search Bar (Style Spotlight iOS) */}
        <div className="relative flex bg-muted/60 hover:bg-muted focus-within:bg-card rounded-full px-3.5 py-1.5 md:px-4 md:py-2 items-center gap-2 md:gap-3 flex-1 min-w-[120px] max-w-[200px] sm:max-w-[260px] md:max-w-[320px] border border-border/60 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-2xs">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
          <input
            id="kbv-global-search"
            type="text"
            placeholder={t("search") || "Rechercher..."}
            aria-label={t("search") || "Rechercher..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
            onKeyDown={(e) => { if (e.key === "Escape") { setSearchTerm(""); (e.target as HTMLInputElement).blur(); } }}
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs md:text-sm text-foreground placeholder:text-muted-foreground w-full uppercase tracking-wider"
          />
          <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border border-border bg-card/60 text-[9px] font-bold text-muted-foreground pointer-events-none shadow-2xs">
            ⌘K
          </kbd>

          {isSearchFocused && searchTerm.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-slide-up">
              {searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">{t("no_results")}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {searchResults.map((result) => (
                    <li key={`${result.type}-${result.id}`}>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors"
                      >
                        <span className="p-2 rounded-xl bg-primary/20 text-primary">
                          {result.type === "visit" ? (
                            <MapPin className="w-4 h-4" />
                          ) : result.type === "speaker" ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Home className="w-4 h-4" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{result.label}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                            {result.sublabel}
                          </p>
                        </div>
                        <MessageSquare className="w-4 h-4 text-muted-foreground/50" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Header Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle Button (Sombre / Clair) */}
        <button
          onClick={() => setThemeMode(darkMode ? "light" : "dark")}
          className="p-2.5 rounded-xl bg-card hover:bg-accent border border-border transition-all text-foreground flex items-center justify-center shadow-2xs touch-manipulation active:scale-95"
          title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
          aria-label={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" aria-hidden="true" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180 duration-300" aria-hidden="true" />
          )}
        </button>

        {/* Quick App Install Button */}
        <button
          onClick={() => setActiveTab("install")}
          className="p-2.5 rounded-xl bg-card hover:bg-accent border border-border transition-colors shadow-2xs touch-manipulation active:scale-95"
          title="Installer l'app"
          aria-label="Installer l'application"
        >
          <Download className="w-4 h-4 text-foreground" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};
