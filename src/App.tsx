import { useEffect, useMemo, useState, useCallback, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { SplashScreen } from "./components/SplashScreen";
import { usePWA } from "./hooks/usePWA";
import {
  LayoutGrid,
  Users,
  Settings,
  Home,
  Calendar,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useVisitStore } from "./store/useVisitStore";
import { useHostStore } from "./store/useHostStore";
import { useSpeakerStore } from "./store/useSpeakerStore";
import { useAudioStore } from "./store/useAudioStore";
import { useUIStore } from "./store/useUIStore";
import { useSettingsStore } from "./store/useSettingsStore";
import type { AppTab } from "./store/useUIStore";
import { useTranslation } from "./hooks/useTranslation";
import { useReminderEngine } from "./hooks/useReminderEngine";
import { useAutoSync } from "./hooks/useAutoSync";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppLayout } from "./components/layout/AppLayout";
import { SearchResult } from "./components/layout/Header";
import { CalendarSidebar } from "./components/CalendarSidebar";
import { runDataCleanups } from "./lib/cleanup";

// Lazy-loaded heavy routes
const DashboardView = lazy(() => import("./components/DashboardView").then(m => ({ default: m.DashboardView })));
const InstallPage = lazy(() => import("./components/InstallPage").then(m => ({ default: m.InstallPage })));
const PlanningHub = lazy(() => import("./components/PlanningHub").then(m => ({ default: m.PlanningHub })));
const SpeakerList = lazy(() => import("./components/SpeakerList").then(m => ({ default: m.SpeakerList })));
const GlobalHostList = lazy(() => import("./components/GlobalHostList").then(m => ({ default: m.GlobalHostList })));
const SettingsPage = lazy(() => import("./components/SettingsPage").then(m => ({ default: m.SettingsPage })));
const UserManualPage = lazy(() => import("./components/UserManualPage").then(m => ({ default: m.UserManualPage })));
const OnboardingWizard = lazy(() => import("./components/OnboardingWizard").then(m => ({ default: m.OnboardingWizard })));

import { Skeleton } from "./components/ui/skeleton";

const RouteFallback = () => (
  <div className="p-4 md:p-8 space-y-4 animate-in fade-in" aria-busy="true" aria-live="polite">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-1/2" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
      ))}
    </div>
    <span className="sr-only">Chargement…</span>
  </div>
);

function App() {
  usePWA();
  const [showSplash, setShowSplash] = useState(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    return standalone;
  });
  const hideSplash = useCallback(() => setShowSplash(false), []);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // If onboarding is already done, don't show it
    if (localStorage.getItem("kbv-onboarding-done")) return false;
    
    // Auto-bypass onboarding in automated E2E test environments
    if (typeof navigator !== "undefined" && navigator.webdriver) {
      localStorage.setItem("kbv-onboarding-done", "true");
      return false;
    }

    // If we have pre-configured Supabase keys in the build (.env), 
    // we can skip onboarding to provide a "Ready to use" experience
    const hasPreConfig = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    if (hasPreConfig) {
      localStorage.setItem("kbv-onboarding-done", "true");
      return false;
    }
    
    return true;
  });

  const visits = useVisitStore((s) => s.visits);
  const hosts = useHostStore((s) => s.hosts);
  const speakers = useSpeakerStore((s) => s.speakers);
  const activeTab = useUIStore((s) => s.activeTab);
  const showUserManual = useUIStore((s) => s.showUserManual);
  const settings = useSettingsStore((s) => s.settings);
  const congregationName = settings?.congregation?.name || "";
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const setPendingVisit = useUIStore((s) => s.setPendingVisit);
  const setShowUserManual = useUIStore((s) => s.setShowUserManual);
  const setIsOnline = useUIStore((s) => s.setIsOnline);
  const { t, language } = useTranslation();
  const { pendingCount: _pendingCount } = useReminderEngine();
  const { runSync } = useAutoSync();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Sync activeTab from URL on mount and browser back/forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const actionParam = params.get("action");
      const validTabs: AppTab[] = ["dashboard", "planning", "speakers", "hosts", "settings", "install"];
      if (tabParam && validTabs.includes(tabParam as AppTab)) {
        setActiveTab(tabParam as AppTab);
      }

      if (actionParam === "new-visit") {
        setActiveTab("dashboard");
        useUIStore.getState().setPendingAction("new-visit");
      } else if (actionParam === "recorder") {
        const currentVisits = useVisitStore.getState().visits;
        const now = new Date();
        const nextVisit =
          currentVisits.find((v) => new Date(v.visitDate) >= now && v.status !== "cancelled") ||
          currentVisits[0];
        useAudioStore.getState().openRecorder(nextVisit || null);
      }
    };

    handlePopState();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setActiveTab]);

  // Update URL search parameters when activeTab changes programmatically
  useEffect(() => {
    const url = new URL(window.location.href);
    const currentTab = url.searchParams.get("tab");
    
    if (activeTab === "dashboard") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", activeTab);
    }
    
    // Only replace state if the URL actually changed to avoid unnecessary history operations
    if (url.searchParams.get("tab") !== currentTab) {
      window.history.replaceState({}, "", url.toString());
    }
  }, [activeTab]);


  // Online/offline listeners — independent of data
  useEffect(() => {
    const connectionMessages = {
      fr: {
        online: "Connexion rétablie. Synchronisation des données en cours...",
        offline: "Connexion perdue. L'application reste utilisable hors-ligne.",
      },
      pt: {
        online: "Ligação restabelecida. A sincronizar dados...",
        offline: "Sem ligação à internet. A aplicação continua utilizável offline.",
      },
      cv: {
        online: "Ligason re-stabelesidu. Sincronisason di dadus em kursu...",
        offline: "Sem ligason internet. Aplikason ta kontinua ta funsiona offline.",
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      const lang = language === "pt" ? "pt" : language === "cv" ? "cv" : "fr";
      toast.success(connectionMessages[lang].online, { icon: "⚡" });
      runSync(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      const lang = language === "pt" ? "pt" : language === "cv" ? "cv" : "fr";
      toast.warning(connectionMessages[lang].offline, { icon: "⚠️" });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // System theme listener
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e: Event) => {
      const target = e.target as MediaQueryList;
      const currentMode = useSettingsStore.getState().settings.themeMode;
      if (currentMode === "system") {
        useSettingsStore.getState().setDarkMode(target.matches);
      }
    };
    mediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, [setIsOnline, language, runSync]);

  // Cmd/Ctrl+K — focus global search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("kbv-global-search") as HTMLInputElement | null;
        el?.focus();
        el?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // One-shot migrations and cleanups
  useEffect(() => {
    runDataCleanups();
  }, []);


  const trimmedTerm = searchTerm.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (trimmedTerm.length < 2) return [];

    const visitMatches = visits
      .filter(
        (v) =>
          v.nom.toLowerCase().includes(trimmedTerm) ||
          v.congregation.toLowerCase().includes(trimmedTerm) ||
          (v.talkTheme || "").toLowerCase().includes(trimmedTerm)
      )
      .slice(0, 3)
      .map((v) => ({ id: v.visitId, label: v.nom, sublabel: v.congregation, type: "visit" as const, payload: v }));

    const speakerMatches = speakers
      .filter((s) => s.nom.toLowerCase().includes(trimmedTerm))
      .slice(0, 3)
      .map((s) => ({ id: s.id, label: s.nom, sublabel: s.congregation, type: "speaker" as const }));

    const hostMatches = hosts
      .filter((h) => h.nom.toLowerCase().includes(trimmedTerm))
      .slice(0, 3)
      .map((h) => ({ id: h.id, label: h.nom, sublabel: h.adresse || "Hôte", type: "host" as const }));

    return [...visitMatches, ...speakerMatches, ...hostMatches];
  }, [trimmedTerm, visits, speakers, hosts]);

  const handleResultClick = (result: SearchResult) => {
    setIsSearchFocused(false);
    setSearchTerm("");
    if (result.type === "visit" && result.payload) {
      setPendingVisit((result.payload as { visitId: string }).visitId);
      setActiveTab("planning");
      return;
    }
    if (result.type === "speaker") {
      setActiveTab("speakers");
      return;
    }
    setActiveTab("hosts");
  };

  const navItems: Array<{ id: AppTab; label: string; icon: LucideIcon }> = [
    { id: "dashboard", label: t("dashboard"), icon: LayoutGrid },
    { id: "planning", label: t("planning"), icon: Calendar },
    { id: "speakers", label: t("speakers"), icon: Users },
    { id: "hosts", label: t("hosts"), icon: Home },
    { id: "settings", label: t("settings"), icon: Settings },
  ];

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem("kbv-onboarding-done", "true");
    setShowOnboarding(false);
  }, []);

  if (activeTab === "install") {
    return (
      <div className="h-full w-full">
        {showSplash && <SplashScreen onFinished={hideSplash} />}
        <Suspense fallback={<RouteFallback />}>
          <InstallPage />
        </Suspense>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-full w-full overflow-hidden flex flex-col">
        {showSplash && <SplashScreen onFinished={hideSplash} />}
        {!showSplash && showOnboarding && (
          <Suspense fallback={<RouteFallback />}>
            <OnboardingWizard
              onComplete={handleOnboardingComplete}
              onShowUserManual={() => setShowUserManual(true)}
            />
          </Suspense>
        )}

        {/* Main Interface Refactored */}
        <AppLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          congregationName={congregationName}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
          searchResults={searchResults}
          handleResultClick={handleResultClick}
          navItems={navItems}
          sidebar={
            <CalendarSidebar
              visits={visits}
              onVisitClick={(visit) => {
                setPendingVisit(visit.visitId);
                setActiveTab("planning");
              }}
              onSyncNow={() => runSync(false)}
            />
          }
        >
          <Suspense fallback={<RouteFallback />}>
            {activeTab === "dashboard" && <DashboardView />}
            {activeTab === "planning" && <PlanningHub />}
            {activeTab === "speakers" && <SpeakerList />}
            {activeTab === "hosts" && <GlobalHostList />}
            {activeTab === "settings" && (
              showUserManual ? (
                <UserManualPage onBack={() => setShowUserManual(false)} />
              ) : (
                <SettingsPage onShowUserManual={() => setShowUserManual(true)} />
              )
            )}
          </Suspense>
        </AppLayout>

        <Toaster position="top-center" richColors closeButton />
      </div>
    </ErrorBoundary>
  );
}

export default App;
