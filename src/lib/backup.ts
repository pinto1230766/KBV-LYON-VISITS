// Pure helpers for backup, import/export and duplicate detection.
// Extracted from SettingsPage to keep the component focused on UI.

import type { Host, Speaker, Visit } from "../store/visitTypes";
import type { CongregationProfile } from "../store/settingsTypes";
import { useVisitStore } from "../store/useVisitStore";
import { useSpeakerStore } from "../store/useSpeakerStore";
import { useHostStore } from "../store/useHostStore";
import { mergeHosts, mergeSpeakers, mergeVisits, getHostKey, getSpeakerKey, getVisitKey } from "./dedup";
import { safeParseBackup } from "./validation";
import { logger } from "./logger";

export interface BackupData {
  visits?: Visit[];
  speakers?: Speaker[];
  hosts?: Host[];
  settings?: Record<string, unknown> | null;
  exportedAt?: string;
}

export interface DuplicateEntry {
  type: "visit" | "speaker" | "host";
  name: string;
  ids: string[];
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportFullBackup(visits: Visit[], hosts: Host[], speakers: Speaker[]) {
  // Try to grab current settings from Zustand if available
  let currentSettings = null;
  try {
    const { useSettingsStore } = await import("../store/useSettingsStore");
    currentSettings = useSettingsStore.getState().settings;
  } catch (e) {
    logger.warn("Could not fetch settings for backup", e);
  }

  downloadJson(
    `kbv-backup-${new Date().toISOString().slice(0, 10)}.json`,
    { visits, hosts, speakers, settings: currentSettings, exportedAt: new Date().toISOString() }
  );
}

export function exportRepertoire(speakers: Speaker[], hosts: Host[]) {
  downloadJson(
    `kbv-repertoire-${new Date().toISOString().slice(0, 10)}.json`,
    { speakers, hosts, exportedAt: new Date().toISOString() }
  );
}

/**
 * Open a file picker, parse the JSON, and merge into the stores.
 * Returns true on success.
 */
export function pickAndImportBackup(): Promise<boolean> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return resolve(false);
      try {
        const raw = JSON.parse(await file.text());
        const parsed = safeParseBackup(raw);
        if (!parsed.ok) return resolve(false);
        const { data, dropped } = parsed;
        if (data.visits?.length) {
          useVisitStore
            .getState()
            .setVisits(mergeVisits(useVisitStore.getState().visits, data.visits as unknown as Visit[]));
        }
        if (data.hosts?.length) {
          useHostStore
            .getState()
            .setHosts(mergeHosts(useHostStore.getState().hosts, data.hosts as unknown as Host[]));
        }
        if (data.speakers?.length) {
          useSpeakerStore
            .getState()
            .setSpeakers(mergeSpeakers(useSpeakerStore.getState().speakers, data.speakers as unknown as Speaker[]));
        }
        if (data.settings) {
          try {
            const { useSettingsStore } = await import("../store/useSettingsStore");
            const store = useSettingsStore.getState();
            if (data.settings.congregation) {
              store.updateCongregation(data.settings.congregation as Partial<CongregationProfile>);
            }
            if (data.settings.language) store.setLanguage(data.settings.language as never);
            if (data.settings.themeMode) store.setThemeMode(data.settings.themeMode as never);
          } catch (err) {
            logger.warn("Could not import settings", err);
          }
        }
        // Force lastSyncAt to empty string to ensure the next cloud sync
        // reconciles and pushes all imported data to the cloud.
        try {
          const { useSettingsStore } = await import("../store/useSettingsStore");
          useSettingsStore.getState().updateCongregation({ lastSyncAt: "" });
        } catch (err) {
          logger.warn("Could not reset lastSyncAt after import", err);
        }
        if (dropped.visits + dropped.speakers + dropped.hosts > 0) {
          logger.warn("Backup import: dropped malformed entries", dropped);
        }
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    input.click();
  });
}

/**
 * Group entities by their normalized business key and report any group
 * with more than one record.
 */
export function findDuplicates(
  visits: Visit[],
  speakers: Speaker[],
  hosts: Host[]
): DuplicateEntry[] {
  const result: DuplicateEntry[] = [];

  const collect = <T>(
    items: T[],
    keyFn: (item: T) => string,
    idFn: (item: T) => string,
    type: DuplicateEntry["type"]
  ) => {
    const map = new Map<string, string[]>();
    items.forEach((item) => {
      const key = keyFn(item);
      const list = map.get(key) ?? [];
      list.push(idFn(item));
      map.set(key, list);
    });
    map.forEach((ids, name) => {
      if (ids.length > 1) result.push({ type, name, ids });
    });
  };

  collect(visits, getVisitKey, (v) => v.visitId, "visit");
  collect(speakers, getSpeakerKey, (s) => s.id, "speaker");
  collect(hosts, getHostKey, (h) => h.id, "host");

  return result;
}

/**
 * Try to delete each id from every store (silently ignores misses).
 */
export function deleteFromAllStores(ids: string[]) {
  ids.forEach((id) => {
    try { useVisitStore.getState().deleteVisit(id); } catch { /* ignore */ }
    try { useSpeakerStore.getState().deleteSpeaker(id); } catch { /* ignore */ }
    try { useHostStore.getState().deleteHost(id); } catch { /* ignore */ }
  });
}
