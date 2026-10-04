import { create } from "zustand";
import {
  AudioMetadata,
  AudioBookmark,
  getAllAudioMetadata,
  getAudioBlobById,
  saveAudioRecording,
  deleteAudioRecording,
  updateAudioTitle,
  addBookmarkToAudio,
} from "../lib/audioRecordingStorage";
import type { Visit } from "./visitTypes";

interface AudioStoreState {
  recordings: AudioMetadata[];
  isLoading: boolean;
  activeVisit: Visit | null;
  isModalOpen: boolean;
  loadRecordings: () => Promise<void>;
  openRecorder: (visit: Visit) => void;
  closeRecorder: () => void;
  saveRecording: (meta: AudioMetadata, blob: Blob) => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  renameRecording: (id: string, newTitle: string) => Promise<void>;
  addBookmark: (id: string, bookmark: AudioBookmark) => Promise<void>;
  getBlob: (id: string) => Promise<Blob | null>;
  getVisitRecordings: (visitId: string) => AudioMetadata[];
}

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  recordings: [],
  isLoading: false,
  activeVisit: null,
  isModalOpen: false,

  loadRecordings: async () => {
    set({ isLoading: true });
    try {
      const all = await getAllAudioMetadata();
      set({ recordings: all, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  openRecorder: (visit: Visit) => {
    set({ activeVisit: visit, isModalOpen: true });
    get().loadRecordings();
  },

  closeRecorder: () => {
    set({ isModalOpen: false });
  },

  saveRecording: async (meta: AudioMetadata, blob: Blob) => {
    await saveAudioRecording(meta, blob);
    await get().loadRecordings();
  },

  deleteRecording: async (id: string) => {
    await deleteAudioRecording(id);
    await get().loadRecordings();
  },

  renameRecording: async (id: string, newTitle: string) => {
    await updateAudioTitle(id, newTitle);
    await get().loadRecordings();
  },

  addBookmark: async (id: string, bookmark: AudioBookmark) => {
    await addBookmarkToAudio(id, bookmark);
    await get().loadRecordings();
  },

  getBlob: async (id: string) => {
    return await getAudioBlobById(id);
  },

  getVisitRecordings: (visitId: string) => {
    return get().recordings.filter((r) => r.visitId === visitId);
  },
}));
