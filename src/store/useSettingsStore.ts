import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logger } from "../lib/logger";
import type { AppSettings, Language, CongregationProfile, ThemeMode } from "./visitTypes";

export interface SettingsState {
  settings: AppSettings;
  setLanguage: (lang: Language) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDarkMode: (dark: boolean) => void;
  updateNotifications: (notif: Partial<AppSettings["notifications"]>) => void;
  updateCongregation: (data: Partial<CongregationProfile>) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setSupabaseConfig: (url: string) => void;
}

const defaultSettings: AppSettings = {
  language: "fr",
  themeMode: "system",
  darkMode: false,
  notifications: {
    enabled: false,
    steps: { remindJ7: true, remindJ2: true },
  },
  soundEnabled: true,
  vibrationEnabled: true,
  congregation: {
    name: "Lyon KBV",
    city: "Lyon",
    day: "Dimanche",
    time: "11:30",
    responsableName: "",
    responsablePhone: "",
    kingdomHallAddress: "",
    whatsappGroup: "",
    whatsappInviteId: "",
    googleSheetUrl: "",
    lastSyncAt: "",
  },
};

const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add("dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#1e1b4b");
  } else {
    document.documentElement.classList.remove("dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#4f46e5");
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      setLanguage: (language) => {
        try { document.documentElement.lang = language === "cv" ? "kea" : language; } catch (e) { logger.warn("Failed to set document lang:", e); }
        set((s) => ({ settings: { ...s.settings, language } }));
      },
      setThemeMode: (themeMode) => {
        set((s) => ({ settings: { ...s.settings, themeMode } }));
        if (themeMode === "system") {
          const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          get().setDarkMode(isDark);
        } else {
          get().setDarkMode(themeMode === "dark");
        }
      },
      setDarkMode: (darkMode) => {
        applyTheme(darkMode);
        set((s) => ({ settings: { ...s.settings, darkMode } }));
      },
      updateNotifications: (notif) =>
        set((s) => ({
          settings: {
            ...s.settings,
            notifications: { ...s.settings.notifications, ...notif },
          },
        })),
      updateCongregation: (data) =>
        set((s) => ({
          settings: {
            ...s.settings,
            congregation: { ...s.settings.congregation, ...data },
          },
        })),
      setSoundEnabled: (soundEnabled) =>
        set((s) => ({ settings: { ...s.settings, soundEnabled } })),
      setVibrationEnabled: (vibrationEnabled) =>
        set((s) => ({ settings: { ...s.settings, vibrationEnabled } })),
      setSupabaseConfig: (url) =>
        set((s) => ({ settings: { ...s.settings, supabaseUrl: url } })),
    }),
    {
      name: "kbv-settings",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        
        let isDark = state.settings.darkMode;
        if (state.settings.themeMode === "system") {
          isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        } else {
          isDark = state.settings.themeMode === "dark";
        }
        
        applyTheme(isDark);
        
        if (state.settings.language) {
          try { document.documentElement.lang = state.settings.language === "cv" ? "kea" : state.settings.language; } catch (e) { logger.warn("Failed to set document lang on rehydrate:", e); }
        }
      },
    }
  )
);