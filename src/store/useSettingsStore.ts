import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logger } from "../lib/logger";
import { resetSupabaseClient } from "../lib/supabase";
import type { AppSettings, Language, CongregationProfile, ThemeMode, TintColor } from "./visitTypes";

export interface SettingsState {
  settings: AppSettings;
  setLanguage: (lang: Language) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDarkMode: (dark: boolean) => void;
  setTintColor: (tint: TintColor) => void;
  setTintedIcons: (enabled: boolean) => void;
  updateNotifications: (notif: Partial<AppSettings["notifications"]>) => void;
  updateCongregation: (data: Partial<CongregationProfile>) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setSupabaseConfig: (url: string) => void;
  setSupabaseKey: (key: string) => void;
  updateManagerNotes: (notes: string) => void;
  setMasterDevice: (val: boolean) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
}

const defaultSettings: AppSettings = {
  language: "fr",
  themeMode: "system",
  darkMode: false,
  tintColor: "amber",
  tintedIcons: false,
  autoSyncEnabled: false,
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
  managerNotes: "",
};

export const TINT_PALETTES: Record<TintColor, { light: string; dark: string; label: string; hex: string }> = {
  amber: { light: "28 95% 45%", dark: "28 100% 64%", label: "Ambre Solaire", hex: "#f59e0b" },
  blue: { light: "211 100% 50%", dark: "211 100% 62%", label: "Bleu Cupertino", hex: "#007aff" },
  purple: { light: "280 67% 55%", dark: "280 85% 70%", label: "Violet Électrique", hex: "#af52de" },
  green: { light: "134 65% 42%", dark: "134 65% 55%", label: "Vert Émeraude", hex: "#34c759" },
  coral: { light: "348 100% 55%", dark: "348 100% 65%", label: "Corail / Rose", hex: "#ff2d55" },
  graphite: { light: "240 5% 40%", dark: "240 5% 75%", label: "Graphite / Minuit", hex: "#636366" },
};

const applyTintColor = (tint: TintColor = "amber", isDark: boolean, tintedIcons?: boolean) => {
  const palette = TINT_PALETTES[tint] || TINT_PALETTES.amber;
  const primaryVal = isDark ? palette.dark : palette.light;
  document.documentElement.style.setProperty("--primary", primaryVal);
  document.documentElement.style.setProperty("--ring", primaryVal);
  document.documentElement.setAttribute("data-tint", tint);
  
  if (tintedIcons) {
    document.documentElement.classList.add("apple-tinted-icons");
  } else {
    document.documentElement.classList.remove("apple-tinted-icons");
  }
};

const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add("dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#090d16");
  } else {
    document.documentElement.classList.remove("dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#f8fafc");
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
        applyTintColor(get().settings.tintColor, darkMode, get().settings.tintedIcons);
        set((s) => ({ settings: { ...s.settings, darkMode } }));
      },
      setTintColor: (tintColor) => {
        const isDark = get().settings.darkMode;
        applyTintColor(tintColor, isDark, get().settings.tintedIcons);
        set((s) => ({ settings: { ...s.settings, tintColor } }));
      },
      setTintedIcons: (tintedIcons) => {
        const isDark = get().settings.darkMode;
        applyTintColor(get().settings.tintColor, isDark, tintedIcons);
        set((s) => ({ settings: { ...s.settings, tintedIcons } }));
      },
      updateNotifications: (notif) =>
        set((s) => ({
          settings: {
            ...s.settings,
            notifications: { ...s.settings.notifications, ...notif },
          },
        })),
      updateCongregation: (data) =>
        set((s) => {
          const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined)
          );
          return {
            settings: {
              ...s.settings,
              congregation: { ...s.settings.congregation, ...cleanData },
            },
          };
        }),
      setSoundEnabled: (soundEnabled) =>
        set((s) => ({ settings: { ...s.settings, soundEnabled } })),
      setVibrationEnabled: (vibrationEnabled) =>
        set((s) => ({ settings: { ...s.settings, vibrationEnabled } })),
      setSupabaseConfig: (url) =>
        set((s) => ({ settings: { ...s.settings, supabaseUrl: url } })),
      setSupabaseKey: (key: string) =>
        set((s) => ({ settings: { ...s.settings, supabaseAnonKey: key } })),
      updateManagerNotes: (notes: string) =>
        set((s) => ({ settings: { ...s.settings, managerNotes: notes } })),
      setMasterDevice: (val: boolean) =>
        set((s) => ({ settings: { ...s.settings, isMasterDevice: val } })),
      setAutoSyncEnabled: (val: boolean) =>
        set((s) => ({ settings: { ...s.settings, autoSyncEnabled: val } })),
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
        applyTintColor(state.settings.tintColor || "amber", isDark, state.settings.tintedIcons);

        if (state.settings.language) {
          try { document.documentElement.lang = state.settings.language === "cv" ? "kea" : state.settings.language; } catch (e) { logger.warn("Failed to set document lang on rehydrate:", e); }
        }
        resetSupabaseClient();
      },
    }
  )
);