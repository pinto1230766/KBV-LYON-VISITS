import { createClient } from "@supabase/supabase-js";
import { useSettingsStore } from "../store/useSettingsStore";

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const settings = useSettingsStore.getState().settings;
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || settings.supabaseUrl || "";
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  
  console.log('Supabase initialization:', {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_ANON_KEY,
    urlPrefix: SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : '',
    keyPrefix: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : ''
  });

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client created successfully');
  } else {
    console.warn('Supabase client not created - missing URL or key');
  }
  
  return supabaseInstance;
};

export const isSupabaseConfigured = () => {
  const settings = useSettingsStore.getState().settings;
  return Boolean(import.meta.env.VITE_SUPABASE_URL || settings.supabaseUrl);
};
