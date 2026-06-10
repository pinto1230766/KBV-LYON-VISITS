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

          if (existingIndex > -1) {
            const updated = [...s.entries];
            updated[existingIndex] = {
              ...updated[existingIndex],
              payload,
              timestamp: newEntry.timestamp,
            };
            return { entries: updated };
          }

          return { entries: [...s.entries, newEntry] };
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
            return { entries: filtered };
          }

          const newEntry: OutboxEntry = {
            id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
            tableName,
            action: "delete",
            recordId,
            timestamp: new Date().toISOString(),
          };

          return { entries: [...filtered, newEntry] };
        }),
      remove: (ids) =>
        set((s) => ({
          entries: s.entries.filter((e) => !ids.includes(e.id)),
        })),
      clear: () => set({ entries: [] }),
    }),
    { name: "kbv-outbox" }
  )
);
