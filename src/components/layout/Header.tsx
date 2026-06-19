import React from "react";
import { Search, MapPin, User, Home, MessageSquare, Download } from "lucide-react";
import { KbvLogo } from "../KbvLogo";
import { useTranslation } from "../../hooks/useTranslation";
import { AppTab } from "../../store/useUIStore";
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

  return (
    <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border flex justify-between items-center px-4 md:px-8 sticky top-0 z-50 safe-top">
      {/* Mobile Logo & Desktop Tab Title */}
      <div className="flex items-center gap-6">
        {/* Mobile only logo */}
        <div className="flex md:hidden items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg bg-primary/20 p-0.5">
            <KbvLogo className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-sm font-black text-foreground">
              KBV {congregationName && `- ${congregationName}`}
            </h1>
          </div>
        </div>

        {/* Desktop Title */}
        <h1 className="hidden md:block text-xl font-bold uppercase tracking-wider text-foreground">
          {t(activeTab) || activeTab}
        </h1>

        {/* Global Search Bar */}
        <div className="relative flex bg-card rounded-xl px-4 py-2 items-center gap-3 w-48 sm:w-64 md:w-80 border border-border focus-within:border-primary/50 transition-colors">
          <Search className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
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
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground/50 w-full uppercase tracking-wider"
          />
          <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border/50 bg-accent/30 text-[9px] font-bold text-muted-foreground pointer-events-none">
            ⌘K
          </kbd>

          {isSearchFocused && searchTerm.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-slide-up">
              {searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground/80 p-4 text-center">{t("no_results")}</p>
              ) : (
                <ul className="divide-y divide-border/50">
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
                        <MessageSquare className="w-4 h-4 text-muted-foreground/30" />
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
      <div className="flex items-center gap-4">
        {/* Quick App Install Button */}
        <button
          onClick={() => setActiveTab("install")}
          className="p-2 rounded-xl hover:bg-accent/50 transition-colors"
          title="Installer l'app"
          aria-label="Installer l'application"
        >
          <Download className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};
