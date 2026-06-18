import { createClient } from "@supabase/supabase-js";
import { useSettingsStore } from "../store/useSettingsStore";

let supabaseInstance: ReturnType<typeof createClient> | null = null;

function buildSupabase(): ReturnType<typeof createClient> | null {
  const settings = useSettingsStore.getState().settings;
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || settings.supabaseUrl || "";
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || settings.supabaseAnonKey || "";
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
