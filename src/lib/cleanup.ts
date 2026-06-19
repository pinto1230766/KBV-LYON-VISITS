import { useSpeakerStore } from "../store/useSpeakerStore";
import { useHostStore } from "../store/useHostStore";
import { logger } from "./logger";

/**
 * Performs one-time migrations and data cleanups.
 */
export async function runDataCleanups() {
  // 0. Security cleanup: remove any persisted Supabase keys from localStorage (v5)
  if (!localStorage.getItem("kbv-security-cleanup-v5")) {
    localStorage.removeItem("VITE_SUPABASE_URL");
    localStorage.removeItem("VITE_SUPABASE_ANON_KEY");
    localStorage.setItem("kbv-security-cleanup-v5", "true");
    logger.log("Security cleanup: removed persisted Supabase keys from localStorage.");
  }

  // 1. Photo path migration (v1)
  if (!localStorage.getItem("kbv-photo-paths-migrated-v1")) {
    const patch = (url?: string) => {
      if (!url) return undefined;
      if (url.startsWith("/")) return "." + url;
      if (url.startsWith("images/")) return "./" + url;
      return undefined;
    };
    
    const speakers = useSpeakerStore.getState().speakers;
    speakers.forEach((s) => {
      const np = patch(s.photoUrl);
      if (np) useSpeakerStore.getState().updateSpeaker(s.id, { photoUrl: np });
    });
    
    const hosts = useHostStore.getState().hosts;
    hosts.forEach((h) => {
      const np = patch(h.photoUrl);
      if (np) useHostStore.getState().updateHost(h.id, { photoUrl: np });
    });
    
    localStorage.setItem("kbv-photo-paths-migrated-v1", "true");
    logger.log("Photo path migration completed.");
  }

  // 2. (removed: example data creation and cleanup — no longer needed)
}
