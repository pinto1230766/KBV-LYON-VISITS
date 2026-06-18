import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Speaker } from "./visitTypes";
import { mergeSpeakers } from "../lib/dedup";
import { idbStorage } from "../lib/idbStorage";
import { useOutboxStore } from "./useOutboxStore";
import { speakerStoredSchema, safeRehydrate } from "../lib/validation";
import { logger } from "../lib/logger";

interface SpeakerState {
  speakers: Speaker[];
  addSpeaker: (speaker: Speaker) => void;
  setSpeakers: (speakers: Speaker[]) => void;
  updateSpeaker: (id: string, data: Partial<Speaker>) => void;
  deleteSpeaker: (id: string) => void;
}

export const useSpeakerStore = create<SpeakerState>()(
  persist(
    (set) => ({
      speakers: [],
      addSpeaker: (speaker) => {
        const withTime = { ...speaker, updatedAt: speaker.updatedAt || new Date().toISOString() };
        set((s) => ({
          speakers: mergeSpeakers(s.speakers, [withTime])
        }));
        useOutboxStore.getState().addUpsert("speakers", withTime.id, withTime);
      },
      setSpeakers: (speakers) => set({ speakers: mergeSpeakers(speakers) }),
      updateSpeaker: (id, data) =>
        set((s) => {
          const updated = s.speakers.map((sp) => (sp.id === id ? { ...sp, ...data, updatedAt: new Date().toISOString() } : sp));
          const updatedItem = updated.find((sp) => sp.id === id);
          if (updatedItem) {
            useOutboxStore.getState().addUpsert("speakers", id, updatedItem);
          }
          return { speakers: updated };
        }),
      deleteSpeaker: (id) => {
        set((s) => ({ speakers: s.speakers.filter((sp) => sp.id !== id) }));
        useOutboxStore.getState().addDelete("speakers", id);
      },
    }),
    {
      name: "kbv-speakers",
      // Photos Base64 peuvent dépasser le quota ~5 Mo de localStorage.
      // On utilise IndexedDB (quota beaucoup plus élevé) pour tout persister
      // sans perdre les photos au reload.
      storage: createJSONStorage(() => idbStorage),
      // Migration : on nettoie l'ancienne entrée localStorage qui pouvait
      // contenir une version sans photos (partialize précédent).
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.speakers)) {
          const originalCount = state.speakers.length;
          state.speakers = safeRehydrate(state.speakers, speakerStoredSchema, "speaker") as Speaker[];
          if (state.speakers.length !== originalCount) {
            logger.warn(`Speaker store rehydration: dropped ${originalCount - state.speakers.length} malformed items`);
          }
        }
        try { localStorage.removeItem("kbv-speakers"); } catch { /* noop */ }
      },
    }
  )
);
