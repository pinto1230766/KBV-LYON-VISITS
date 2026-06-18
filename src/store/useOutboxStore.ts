import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OutboxEntry {
  id: string;
  tableName: "visits" | "speakers" | "hosts";
  action: "upsert" | "delete";
  recordId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
  timestamp: string;
}

interface OutboxState {
  entries: OutboxEntry[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addUpsert: (tableName: "visits" | "speakers" | "hosts", recordId: string, payload: any) => void;
  addDelete: (tableName: "visits" | "speakers" | "hosts", recordId: string) => void;
  remove: (ids: string[]) => void;
  clear: () => void;
}

// ─── Outbox limits ───
const MAX_ENTRIES = 500;
const MAX_AGE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Purge expired entries (older than MAX_AGE_DAYS).
 * Keeps the store lean and avoids sending stale operations.
 */
function pruneExpired(entries: OutboxEntry[]): OutboxEntry[] {
  const cutoff = Date.now() - MAX_AGE_DAYS * DAY_MS;
  return entries.filter((e) => new Date(e.timestamp).getTime() > cutoff);
}

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set) => ({
      entries: [],
      addUpsert: (tableName, recordId, payload) =>
        set((s) => {
          // Consolidate upsert operations: if there is already a pending upsert for the same item,
          // simply update its payload in-place rather than sending duplicates.
          const existingIndex = s.entries.findIndex(
            (e) => e.tableName === tableName && e.recordId === recordId && e.action === "upsert"
          );

          const newEntry: OutboxEntry = {
            id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
            tableName,
            action: "upsert",
            recordId,
            payload,
            timestamp: new Date().toISOString(),
          };

          let updatedEntries: OutboxEntry[];
          if (existingIndex > -1) {
            updatedEntries = [...s.entries];
            updatedEntries[existingIndex] = {
              ...updatedEntries[existingIndex],
              payload,
              timestamp: newEntry.timestamp,
            };
          } else {
            updatedEntries = [...s.entries, newEntry];
          }

          // Prune expired + enforce max size (keep most recent)
          updatedEntries = pruneExpired(updatedEntries);
          if (updatedEntries.length > MAX_ENTRIES) {
            updatedEntries = updatedEntries.slice(-MAX_ENTRIES);
          }

          return { entries: updatedEntries };
        }),
      addDelete: (tableName, recordId) =>
        set((s) => {
          // If we delete an item, discard any pending upserts for it since they are now obsolete.
          const filtered = s.entries.filter(
            (e) => !(e.tableName === tableName && e.recordId === recordId && e.action === "upsert")
          );

          // Avoid duplicates in deletes
          const alreadyDeleted = filtered.some(
            (e) => e.tableName === tableName && e.recordId === recordId && e.action === "delete"
          );

          if (alreadyDeleted) {
            return { entries: pruneExpired(filtered) };
          }

          const newEntry: OutboxEntry = {
            id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
            tableName,
            action: "delete",
            recordId,
            timestamp: new Date().toISOString(),
          };

          let updatedEntries = [...filtered, newEntry];
          updatedEntries = pruneExpired(updatedEntries);
          if (updatedEntries.length > MAX_ENTRIES) {
            updatedEntries = updatedEntries.slice(-MAX_ENTRIES);
          }

          return { entries: updatedEntries };
        }),
      remove: (ids) =>
        set((s) => ({
          entries: pruneExpired(s.entries.filter((e) => !ids.includes(e.id))),
        })),
      clear: () => set({ entries: [] }),
    }),
    { name: "kbv-outbox" }
  )
);
