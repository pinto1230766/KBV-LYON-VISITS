import { useVisitStore } from "../store/useVisitStore";
import { useSpeakerStore } from "../store/useSpeakerStore";
import { useHostStore } from "../store/useHostStore";
import { deleteRemoteItem } from "./syncCloud";
import { isExampleName } from "./utils";
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

  // 2. Example data cleanup (v4)
  if (!localStorage.getItem("kbv-examples-cleaned-v4")) {
    const spks = useSpeakerStore.getState().speakers;
    const hsts = useHostStore.getState().hosts;
    const vsts = useVisitStore.getState().visits;

    const toDelSpk = spks.filter(s => isExampleName(s.nom));
    const toDelHst = hsts.filter(h => isExampleName(h.nom));
    const toDelVst = vsts.filter(v => isExampleName(v.nom));

    if (toDelSpk.length > 0 || toDelHst.length > 0 || toDelVst.length > 0) {
      logger.log(`Cleaning up ${toDelSpk.length + toDelHst.length + toDelVst.length} example items...`);
      
      for (const s of toDelSpk) {
        useSpeakerStore.getState().deleteSpeaker(s.id);
        try { await deleteRemoteItem("speakers", s.id); } catch (e) { logger.warn("Failed to delete remote speaker example:", e); }
      }
      for (const h of toDelHst) {
        useHostStore.getState().deleteHost(h.id);
        try { await deleteRemoteItem("hosts", h.id); } catch (e) { logger.warn("Failed to delete remote host example:", e); }
      }
      for (const v of toDelVst) {
        useVisitStore.getState().deleteVisit(v.visitId);
        try { await deleteRemoteItem("visits", v.visitId); } catch (e) { logger.warn("Failed to delete remote visit example:", e); }
      }
    }

    localStorage.setItem("kbv-examples-cleaned-v4", "true");
  }
}
