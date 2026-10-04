import { create } from "zustand";

export type AppTab = "dashboard" | "planning" | "speakers" | "hosts" | "settings" | "install";

interface UIState {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  pendingVisitId: string | null;
  setPendingVisit: (visitId: string | null) => void;
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
  showUserManual: boolean;
  setShowUserManual: (show: boolean) => void;
  pendingAction: "new-visit" | "recorder" | null;
  setPendingAction: (action: "new-visit" | "recorder" | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
  pendingVisitId: null,
  setPendingVisit: (pendingVisitId) => set({ pendingVisitId }),
  isOnline: navigator.onLine,
  setIsOnline: (isOnline) => set({ isOnline }),
  showUserManual: false,
  setShowUserManual: (showUserManual) => set({ showUserManual }),
  pendingAction: null,
  setPendingAction: (pendingAction) => set({ pendingAction }),
}));
