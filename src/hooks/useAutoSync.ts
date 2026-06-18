import { useEffect, useRef, useCallback } from "react";
import { useVisitStore } from "../store/useVisitStore";
import { useSpeakerStore } from "../store/useSpeakerStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { deleteRemoteItem, syncCloud } from "../lib/syncCloud";
import { toast } from "sonner";
import { parseCSV, extractSheetInfo, parseRowsToData } from "../lib/sheetUtils";
import { getSpeakerKey, getVisitKey, mergeSpeakers, mergeVisits } from "../lib/dedup";
import { logger } from "../lib/logger";

async function syncGoogleSheet(sheetUrl: string): Promise<{ addedVisits: number; addedSpeakers: number; removedVisits: number }> {
  const info = extractSheetInfo(sheetUrl);
  if (!info) return { addedVisits: 0, addedSpeakers: 0, removedVisits: 0 };

  // Use the official Google Sheets CSV export endpoint (works for public sheets)
  // Docs: https://developers.google.com/sheets/api/guides/concepts#public_sheet_export
  const csvUrl = `https://docs.google.com/spreadsheets/d/${info.id}/export?format=csv&gid=${info.gid}`;
  let text: string;
  try {
    const resp = await fetch(csvUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    text = await resp.text();
  } catch {
    return { addedVisits: 0, addedSpeakers: 0, removedVisits: 0 };
  }

  const rows = parseCSV(text);
  const { visits: newVisits, speakers: newSpeakers } = parseRowsToData(rows);

  const currentVisits = useVisitStore.getState().visits;
  const newVisitKeys = new Set(newVisits.map(getVisitKey));
  const newVisitDates = new Set(newVisits.map((v) => v.visitDate));
  const ghosts = currentVisits.filter((v) => {
    const isDateManagedBySheet = newVisitDates.has(v.visitDate);
    const isStillInSheet = newVisitKeys.has(getVisitKey(v));
    return isDateManagedBySheet && !isStillInSheet;
  });

  for (const ghost of ghosts) {
    useVisitStore.getState().deleteVisit(ghost.visitId);
    await deleteRemoteItem("visits", ghost.visitId);
  }

  const updatedVisits = useVisitStore.getState().visits;
  const currentVisitKeys = new Set(updatedVisits.map(getVisitKey));
  const mergedVisits = mergeVisits(updatedVisits, newVisits);
  useVisitStore.getState().setVisits(mergedVisits);
  const addedVisits = mergedVisits.filter((v) => !currentVisitKeys.has(getVisitKey(v))).length;

  const currentSpeakers = useSpeakerStore.getState().speakers;
  const currentSpeakerKeys = new Set(currentSpeakers.map(getSpeakerKey));
  const mergedSpeakers = mergeSpeakers(currentSpeakers, newSpeakers);
  useSpeakerStore.getState().setSpeakers(mergedSpeakers);
  const addedSpeakers = mergedSpeakers.filter((s) => !currentSpeakerKeys.has(getSpeakerKey(s))).length;

  return { addedVisits, addedSpeakers, removedVisits: ghosts.length };
}

/** Auto-sync on mount + every 15 min. Deduplicates before inserting. */
export function useAutoSync() {
  const lastSyncRef = useRef(0);

  const runSync = useCallback(async (silent = true) => {
    const now = Date.now();
    // Minimum 5 min between silent auto-syncs; manual sync must always run.
    if (silent && now - lastSyncRef.current < 5 * 60 * 1000) return;
    lastSyncRef.current = now;

    const sheetUrl = useSettingsStore.getState().settings.congregation.googleSheetUrl;

    try {
      // 1. Google Sheets sync (if configured)
      let sheetResult = { addedVisits: 0, addedSpeakers: 0, removedVisits: 0 };
      if (sheetUrl) {
        sheetResult = await syncGoogleSheet(sheetUrl);
      }

      // 2. Supabase cloud sync
      let cloudResult;
      try {
        logger.log("🔄 Triggering cloud sync from useAutoSync...");
        cloudResult = await syncCloud();
        logger.log("✅ Cloud sync finished:", cloudResult);
      } catch (err) {
        logger.error("❌ Cloud sync critical error:", err);
        cloudResult = null;
      }

      // Update last sync timestamp
      useSettingsStore.getState().updateCongregation({
        lastSyncAt: new Date().toISOString(),
      });

      if (!silent) {
        const parts: string[] = [];
        if (sheetResult.addedVisits || sheetResult.addedSpeakers || sheetResult.removedVisits) {
          parts.push(`Sheet: +${sheetResult.addedVisits} visites, -${sheetResult.removedVisits} doublons, +${sheetResult.addedSpeakers} orateurs`);
        }
        if (cloudResult) {
          const pushed = cloudResult.pushed.visits + cloudResult.pushed.speakers + cloudResult.pushed.hosts;
          const pulled = cloudResult.pulled.visits + cloudResult.pulled.speakers + cloudResult.pulled.hosts;
          parts.push(`Cloud: ↑${pushed} ↓${pulled}`);
        }
        if (parts.length > 0) {
          toast.success(`🔄 Sync OK — ${parts.join(" | ")}`);
        } else {
          toast.success("🔄 Déjà à jour — aucun doublon");
        }
      }
    } catch (err) {
      logger.error("Auto-sync error:", err);
      if (!silent) toast.error("Erreur de synchronisation automatique");
    }
  }, []);

  useEffect(() => {
    // Sync once on mount (silent) — no more periodic polling to reduce egress.
    // Manual sync triggered via the ↻ button in the sidebar.
    const timeout = setTimeout(() => runSync(true), 5000);
    return () => clearTimeout(timeout);
  }, [runSync]);

  return { runSync };
}
