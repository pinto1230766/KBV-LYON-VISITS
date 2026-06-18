import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Visit } from "./visitTypes";
import { mergeVisits } from "../lib/dedup";
import { useOutboxStore } from "./useOutboxStore";
import { visitStoredSchema, safeRehydrate } from "../lib/validation";
import { logger } from "../lib/logger";

interface VisitState {
  visits: Visit[];
  addVisit: (visit: Visit) => void;
  setVisits: (visits: Visit[]) => void;
  updateVisit: (visitId: string, data: Partial<Visit>) => void;
  deleteVisit: (visitId: string) => void;
}

export const useVisitStore = create<VisitState>()(
  persist(
    (set) => ({
      visits: [],
      addVisit: (visit) => {
        const withTime = { ...visit, updatedAt: visit.updatedAt || new Date().toISOString() };
        set((s) => ({
          visits: mergeVisits(s.visits, [withTime])
        }));
        useOutboxStore.getState().addUpsert("visits", withTime.visitId, withTime);
      },
      setVisits: (visits) => set({ visits: mergeVisits(visits) }),
      updateVisit: (visitId, data) =>
        set((s) => {
          const updated = s.visits.map((v) =>
            v.visitId === visitId ? { ...v, ...data, updatedAt: new Date().toISOString() } : v
          );
          const updatedItem = updated.find((v) => v.visitId === visitId);
          if (updatedItem) {
            useOutboxStore.getState().addUpsert("visits", visitId, updatedItem);
          }
          return { visits: updated };
        }),
      deleteVisit: (visitId) => {
        set((s) => ({ visits: s.visits.filter((v) => v.visitId !== visitId) }));
        useOutboxStore.getState().addDelete("visits", visitId);
      },
    }),
    {
      name: "kbv-visits",
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.visits)) {
          const originalCount = state.visits.length;
          state.visits = safeRehydrate(state.visits, visitStoredSchema, "visit") as Visit[];
          if (state.visits.length !== originalCount) {
            logger.warn(`Visit store rehydration: dropped ${originalCount - state.visits.length} malformed items`);
          }
        }
      },
    }
  )
);
