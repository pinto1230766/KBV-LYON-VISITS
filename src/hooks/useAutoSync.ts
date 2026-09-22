import { useEffect, useRef, useCallback } from "react";
import { useVisitStore } from "../store/useVisitStore";
import { useSpeakerStore } from "../store/useSpeakerStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { deleteRemoteItem, syncCloud } from "../lib/syncCloud";
import { toast } from "sonner";
import { parseCSV, extractSheetInfo, parseRowsToData, fetchSheetTabs, isPlanningTab } from "../lib/sheetUtils";
import { getSpeakerKey, getVisitKey, mergeSpeakers, mergeVisits } from "../lib/dedup";
import { logger } from "../lib/logger";

interface SheetSyncResult {
  addedVisits: number;
  addedSpeakers: number;
  removedVisits: number;
  error?: string;
}

async function syncGoogleSheet(sheetUrl: string): Promise<SheetSyncResult> {
  const info = extractSheetInfo(sheetUrl);
  if (!info) return { addedVisits: 0, addedSpeakers: 0, removedVisits: 0, error: "URL de feuille invalide" };

  let targetGid = info.gid;
  if (!targetGid || targetGid === "0") {
    try {
      const tabs = await fetchSheetTabs(info.id);
      if (tabs.length > 0) {
        const impressionTab = tabs.find(t => isPlanningTab(t.name) && /impression/i.test(t.name));
        targetGid = (impressionTab || tabs[0]).gid;
      }
    } catch {
      // Ignore tab fetch error and use default
    }
  }

  // Use the official Google Sheets CSV export endpoint (works for public sheets)
  // Docs: https://developers.google.com/sheets/api/guides/concepts#public_sheet_export
  const csvUrl = `https://docs.google.com/spreadsheets/d/${info.id}/export?format=csv&gid=${targetGid}`;
  let text: string;
  try {
    const resp = await fetch(csvUrl);
    if (!resp.ok) {
      const err = `HTTP ${resp.status}`;
      logger.warn(`syncGoogleSheet failed: ${err}`);
      return {
        addedVisits: 0,
        addedSpeakers: 0,
        removedVisits: 0,
        error: resp.status === 401
          ? "Google Sheet privé (HTTP 401). Vérifiez que le document est partagé avec 'Tous les utilisateurs disposant du lien'."
          : `Erreur d'accès Google Sheet (${err})`,
      };
    }
    text = await resp.text();
    if (text.includes("<!DOCTYPE html") || text.includes("<html") || text.includes("accounts.google.com")) {
      return {
        addedVisits: 0,
        addedSpeakers: 0,
        removedVisits: 0,
        error: "Google Sheet privé (connexion requise). Partagez le fichier avec 'Tous les utilisateurs disposant du lien : Lecteur'.",
      };
    }
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return { addedVisits: 0, addedSpeakers: 0, removedVisits: 0, error: err };
  }

  const rows = parseCSV(text);
  const { visits: newVisits, speakers: newSpeakers } = parseRowsToData(rows);

  // Safety guard: Never delete local visits if sheet parsing resulted in 0 visits
  if (newVisits.length === 0) {
    return { addedVisits: 0, addedSpeakers: 0, removedVisits: 0 };
  }

  const currentVisits = useVisitStore.getState().visits;
  const newVisitKeys = new Set(newVisits.map(getVisitKey));
  const newVisitDates = new Set(newVisits.map((v) => v.visitDate));

  const sortedDates = [...newVisitDates].filter(Boolean).sort();
  const minDate = sortedDates[0];
  const maxDate = sortedDates[sortedDates.length - 1];

  const ghosts = currentVisits.filter((v) => {
    const isSheetId = v.visitId.startsWith("sheet-");
    const isKeyInSheet = newVisitKeys.has(getVisitKey(v));
    const isDateInSheet = newVisitDates.has(v.visitDate);
    const isDateInRange = Boolean(minDate && maxDate && v.visitDate && v.visitDate >= minDate && v.visitDate <= maxDate);

    if (isSheetId && !isKeyInSheet) return true;
    if (isDateInSheet && !isKeyInSheet) return true;
    if (isDateInRange && !isKeyInSheet) return true;
    return false;
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

/** Auto-sync on mount (if enabled in settings). Deduplicates before inserting. */
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
      let sheetResult: SheetSyncResult = { addedVisits: 0, addedSpeakers: 0, removedVisits: 0 };
      if (sheetUrl) {
        sheetResult = await syncGoogleSheet(sheetUrl);
      }

      // 2. Supabase cloud sync
      let cloudResult;
      try {
        const isMasterDevice = useSettingsStore.getState().settings.isMasterDevice ?? false;
        logger.log(`🔄 Triggering cloud sync from useAutoSync... [master=${isMasterDevice}]`);
        cloudResult = await syncCloud({ forceMaster: isMasterDevice });
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
        if (sheetResult.error) {
          toast.warning(`⚠️ Google Sheet: ${sheetResult.error}`);
        } else if (parts.length > 0) {
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
    // Only auto-sync on startup if enabled by user in settings.
    const isAutoSync = useSettingsStore.getState().settings.autoSyncEnabled ?? false;
    if (!isAutoSync) {
      logger.log("⏸️ Auto-sync au démarrage désactivée (mode manuel actif).");
      return;
    }
    const timeout = setTimeout(() => runSync(true), 5000);
    return () => clearTimeout(timeout);
  }, [runSync]);

  return { runSync };
}
