import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Host } from "./visitTypes";
import { mergeHosts } from "../lib/dedup";
import { idbStorage } from "../lib/idbStorage";
import { useOutboxStore } from "./useOutboxStore";

interface HostState {
  hosts: Host[];
  addHost: (host: Host) => void;
  setHosts: (hosts: Host[]) => void;
  updateHost: (id: string, data: Partial<Host>) => void;
  deleteHost: (id: string) => void;
}

export const useHostStore = create<HostState>()(
  persist(
    (set) => ({
      hosts: [],
      addHost: (host) => {
        const withTime = { ...host, updatedAt: host.updatedAt || new Date().toISOString() };
        set((s) => ({ 
          hosts: mergeHosts(s.hosts, [withTime]) 
        }));
        useOutboxStore.getState().addUpsert("hosts", withTime.id, withTime);
      },
      setHosts: (hosts) => set({ hosts: mergeHosts(hosts) }),
      updateHost: (id, data) =>
        set((s) => {
          const updated = s.hosts.map((h) => (h.id === id ? { ...h, ...data, updatedAt: new Date().toISOString() } : h));
          const updatedItem = updated.find((h) => h.id === id);
          if (updatedItem) {
            useOutboxStore.getState().addUpsert("hosts", id, updatedItem);
          }
          return { hosts: updated };
        }),
      deleteHost: (id) => {
        set((s) => ({ hosts: s.hosts.filter((h) => h.id !== id) }));
        useOutboxStore.getState().addDelete("hosts", id);
      },
    }),
    {
      name: "kbv-hosts",
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => () => {
        try { localStorage.removeItem("kbv-hosts"); } catch { /* noop */ }
      },
    }
  )
);
