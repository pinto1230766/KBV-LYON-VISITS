import { createClient } from "@supabase/supabase-js";
import { useSettingsStore } from "../store/useSettingsStore";

let supabaseInstance: ReturnType<typeof createClient> | null = null;

function buildSupabase(): ReturnType<typeof createClient> | null {
  const settings = useSettingsStore.getState().settings;
  let SUPABASE_URL = settings.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || "";
  let SUPABASE_ANON_KEY = settings.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || "";

  // Auto-upgrade en HTTPS si la page est chargée en HTTPS pour éviter le blocage Mixed Content
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    if (!SUPABASE_URL || SUPABASE_URL.includes("192.168.1.111:8000") || SUPABASE_URL.startsWith("http://")) {
      SUPABASE_URL = "https://api-visites.fp12397.site";
    }
  }

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    supabaseInstance = null;
  }
  return supabaseInstance;
}

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  return buildSupabase();
};

// Reset the cached instance so it is rebuilt from the latest store state.
export const resetSupabaseClient = () => {
  supabaseInstance = null;
  buildSupabase();
};

export const isSupabaseConfigured = () => {
  const settings = useSettingsStore.getState().settings;
  return Boolean(import.meta.env.VITE_SUPABASE_URL || settings.supabaseUrl);
};
