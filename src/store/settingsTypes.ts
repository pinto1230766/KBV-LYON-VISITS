// App-wide settings types.

export type Language = "fr" | "cv" | "pt";

export interface CongregationProfile {
  name: string;
  city: string;
  day: string;
  time: string;
  responsableName: string;
  responsablePhone: string;
  responsablePhoto?: string;
  kingdomHallAddress: string;
  whatsappGroup: string;
  whatsappInviteId: string;
  googleSheetUrl?: string;
  lastSyncAt?: string;
}

export type ThemeMode = "light" | "dark" | "system";
export type TintColor = "amber" | "blue" | "purple" | "green" | "coral" | "graphite";

export interface AppSettings {
  language: Language;
  themeMode: ThemeMode;
  darkMode: boolean;
  tintColor?: TintColor;
  tintedIcons?: boolean;
  notifications: {
    enabled: boolean;
    steps: {
      remindJ7: boolean;
      remindJ2: boolean;
    };
  };
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  managerNotes?: string;
  /** Si true, cet appareil est l'appareil maître (tablette) : sa sync écrase le cloud. */
  isMasterDevice?: boolean;
  /** Si true, l'application effectue une synchronisation automatique au démarrage (5s). Par défaut false. */
  autoSyncEnabled?: boolean;
  congregation: CongregationProfile;
}
