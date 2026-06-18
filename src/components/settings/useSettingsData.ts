import { useState } from "react";
import { toast } from "sonner";
import { logger } from "../../lib/logger";
import { useVisitStore } from "../../store/useVisitStore";
import { useSpeakerStore } from "../../store/useSpeakerStore";
import { useHostStore } from "../../store/useHostStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { syncCloud, deleteRemoteItem } from "../../lib/syncCloud";
import { idbStorage } from "../../lib/idbStorage";
import { parseCSV, extractSheetInfo, parseRowsToData, fetchSheetTabs, isPlanningTab } from "../../lib/sheetUtils";
import { getSpeakerKey, getVisitKey, mergeSpeakers, mergeVisits } from "../../lib/dedup";
import { exportFullBackup, exportRepertoire, pickAndImportBackup, findDuplicates as findDups, deleteFromAllStores } from "../../lib/backup";
import { useTranslation } from "../../hooks/useTranslation";
import type { Visit, Speaker } from "../../store/visitTypes";

export type CloudStatus = "idle" | "syncing" | "done" | "error";

/**
 * Encapsulates all data-management state and side effects used by the
 * Settings "Data" tab (cloud sync, Google Sheet sync, import/export,
 * Supabase config, duplicates).
 */
export function useSettingsData() {
  const { t } = useTranslation();
  const { settings, updateCongregation } = useSettingsStore();
  const congregation = settings.congregation;
  const visits = useVisitStore((s) => s.visits);
  const hosts = useHostStore((s) => s.hosts);
  const speakers = useSpeakerStore((s) => s.speakers);

  const [duplicates, setDuplicates] = useState<Array<{ type: string; name: string; ids: string[] }>>([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>("idle");
  const [sheetUrlInput, setSheetUrlInput] = useState(congregation.googleSheetUrl || "");
  const [showSheetConfig, setShowSheetConfig] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(import.meta.env.VITE_SUPABASE_URL || "");
  const [supabaseKeyInput, setSupabaseKeyInput] = useState("");
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(false);
  const [showSupabaseGuide, setShowSupabaseGuide] = useState(false);
  const [showSheetGuide, setShowSheetGuide] = useState(false);

  const handleResetAllData = async () => {
    try {
      await idbStorage.removeItem("kbv-speakers");
      await idbStorage.removeItem("kbv-hosts");
    } catch (e) {
      logger.warn("Failed to clear IndexedDB during reset:", e);
    }
    localStorage.clear();
    window.location.reload();
  };

  const handleCloudSync = async () => {
    setIsCloudSyncing(true);
    setCloudStatus("syncing");
    try {
      const result = await syncCloud();
      setCloudStatus("done");
      const totalPushed = result.pushed.visits + result.pushed.speakers + result.pushed.hosts;
      const totalPulled = result.pulled.visits + result.pulled.speakers + result.pulled.hosts;
      toast.success(`Cloud sync OK — ↑${totalPushed} envoyés, ↓${totalPulled} récupérés`);
      setTimeout(() => setCloudStatus("idle"), 5000);
    } catch (err) {
      logger.error("Cloud sync error:", err);
      setCloudStatus("error");
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Erreur cloud: " + msg);
      setTimeout(() => setCloudStatus("idle"), 5000);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const importData = async (newVisits: Visit[], newSpeakers: Speaker[]) => {
    const currentVisits = useVisitStore.getState().visits;
    const currentSpeakers = useSpeakerStore.getState().speakers;

    const newVisitKeys = new Set(newVisits.map(getVisitKey));
    const newVisitDates = new Set(newVisits.map((v) => v.visitDate));

    const ghosts = currentVisits.filter((v) => {
      const isSheetId = v.visitId.startsWith("sheet-");
      const isKeyInImport = newVisitKeys.has(getVisitKey(v));
      const isDateInImport = newVisitDates.has(v.visitDate);
      if (isSheetId && !isKeyInImport) return true;
      if (isDateInImport && !isKeyInImport) return true;
      return false;
    });

    if (ghosts.length > 0) {
      logger.log(`Removing ${ghosts.length} ghost visits...`, ghosts.map((g) => g.nom));
      for (const ghost of ghosts) {
        useVisitStore.getState().deleteVisit(ghost.visitId);
        await deleteRemoteItem("visits", ghost.visitId);
      }
    }

    const newSpeakerKeys = new Set(newSpeakers.map(getSpeakerKey));
    const ghostSpeakers = currentSpeakers.filter((s) => {
      const isSheetId = s.id.startsWith("sheet-");
      const isKeyInImport = newSpeakerKeys.has(getSpeakerKey(s));
      return isSheetId && !isKeyInImport;
    });

    if (ghostSpeakers.length > 0) {
      for (const gs of ghostSpeakers) {
        useSpeakerStore.getState().deleteSpeaker(gs.id);
        await deleteRemoteItem("speakers", gs.id);
      }
    }

    const updatedVisits = useVisitStore.getState().visits;
    const updatedSpeakers = useSpeakerStore.getState().speakers;

    const finalVisits = mergeVisits(updatedVisits, newVisits);
    useVisitStore.getState().setVisits(finalVisits);

    const finalSpeakers = mergeSpeakers(updatedSpeakers, newSpeakers);
    useSpeakerStore.getState().setSpeakers(finalSpeakers);

    updateCongregation({ lastSyncAt: new Date().toISOString() });

    toast.success(`${t("sync_success")}: ${newVisits.length} entrées synchronisées (${ghosts.length} fantômes supprimés)`);
  };

  const handleSyncGoogleSheet = async () => {
    const url = congregation.googleSheetUrl || sheetUrlInput;
    if (!url) {
      setShowSheetConfig(true);
      return;
    }
    const info = extractSheetInfo(url);
    if (!info) {
      toast.error(t("invalid_sheet_url"));
      return;
    }

    setIsSyncing(true);
    try {
      // 1. Fetch available tabs in the spreadsheet
      let tabs: Array<{ name: string; gid: string }> = [];
      try {
        tabs = await fetchSheetTabs(info.id);
      } catch (tabErr) {
        logger.warn("Failed to fetch sheet tabs from htmlview, using fallback:", tabErr);
        // Fallback to only the single tab specified in the URL
        tabs = [{ name: "Default", gid: info.gid }];
      }

      // 2. Filter tabs to only planning/schedule tabs (always keep the user's specified tab gid)
      const planningTabs = tabs.filter(t => isPlanningTab(t.name) || t.gid === info.gid);
      logger.log(`Syncing ${planningTabs.length} sheets out of ${tabs.length}:`, planningTabs.map(t => t.name));

      if (planningTabs.length === 0) {
        throw new Error("Aucun onglet de planning trouvé.");
      }

      // 3. Fetch CSV for each planning tab
      const allVisits: Visit[] = [];
      const allSpeakers: Speaker[] = [];

      await Promise.all(
        planningTabs.map(async (tab) => {
          try {
            const csvUrl = `https://docs.google.com/spreadsheets/d/${info.id}/gviz/tq?tqx=out:csv&gid=${tab.gid}`;
            let response = await fetch(csvUrl);
            if (!response.ok) {
              const fallbackUrl = `https://docs.google.com/spreadsheets/d/${info.id}/export?format=csv&gid=${tab.gid}`;
              response = await fetch(fallbackUrl);
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
            }
            const text = await response.text();
            const rows = parseCSV(text);
            const { visits, speakers } = parseRowsToData(rows);
            allVisits.push(...visits);
            allSpeakers.push(...speakers);
          } catch (err) {
            logger.error(`Error syncing tab "${tab.name}" (gid: ${tab.gid}):`, err);
            // Non-blocking error for a single tab so that other tabs still import successfully
            toast.error(`Erreur sur l'onglet "${tab.name}": ` + (err instanceof Error ? err.message : String(err)));
          }
        })
      );

      // 4. Import the aggregated data
      await importData(allVisits, allSpeakers);
    } catch (err) {
      logger.error("Sync error:", err);
      toast.error(t("sync_error") + ": " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveSheetUrl = async () => {
    if (!sheetUrlInput) return;
    const info = extractSheetInfo(sheetUrlInput);
    if (!info) {
      toast.error(t("invalid_sheet_url"));
      return;
    }
    updateCongregation({ googleSheetUrl: sheetUrlInput });
    setShowSheetConfig(false);
    toast.success(t("sheet_url_saved"));
    setTimeout(() => handleSyncGoogleSheet(), 300);
  };

  const handleSaveSupabaseConfig = () => {
    if (!supabaseUrlInput || !supabaseKeyInput) {
      toast.error("Veuillez saisir l'URL et la clé Supabase");
      return;
    }
    useSettingsStore.getState().setSupabaseConfig(supabaseUrlInput);
    useSettingsStore.getState().setSupabaseKey(supabaseKeyInput);
    setShowSupabaseConfig(false);
    toast.success("Configuration Supabase sauvegardée.");
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleExport = () => {
    exportFullBackup(visits, hosts, speakers);
    toast.success(t("export_success"));
  };

  const handleImport = async () => {
    const ok = await pickAndImportBackup();
    if (ok) toast.success(t("import_success"));
    else toast.error(t("import_error"));
  };

  const handleExportRepertoire = () => {
    exportRepertoire(speakers, hosts);
    toast.success(t("export_success"));
  };

  const findDuplicates = () => {
    const dups = findDups(visits, speakers, hosts);
    setDuplicates(dups);
    setSelectedDuplicates([]);
    if (dups.length === 0) toast.success(t("no_duplicates"));
    else toast.info(`${dups.length} ${t("duplicates_found")}`);
  };

  const deleteSelectedDuplicates = () => {
    deleteFromAllStores(selectedDuplicates);
    setSelectedDuplicates([]);
    findDuplicates();
    toast.success(t("duplicates_deleted"));
  };

  return {
    // state
    congregation, hosts, speakers,
    duplicates, selectedDuplicates, setSelectedDuplicates,
    isSyncing, isCloudSyncing, cloudStatus,
    sheetUrlInput, setSheetUrlInput, showSheetConfig, setShowSheetConfig,
    supabaseUrlInput, setSupabaseUrlInput, supabaseKeyInput, setSupabaseKeyInput,
    showSupabaseConfig, setShowSupabaseConfig,
    showSupabaseGuide, setShowSupabaseGuide,
    showSheetGuide, setShowSheetGuide,
    // actions
    handleResetAllData, handleCloudSync, handleSyncGoogleSheet,
    handleSaveSheetUrl, handleSaveSupabaseConfig,
    handleExport, handleImport, handleExportRepertoire,
    findDuplicates, deleteSelectedDuplicates,
  };
}
