import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReminderEngine } from "./useReminderEngine";
import { useVisitStore } from "../store/useVisitStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useNotificationStore } from "../store/useNotificationStore";
import type { Visit } from "../store/visitTypes";

// Mock Notification API
const mockNotification = {
  permission: "default",
  requestPermission: vi.fn(() => Promise.resolve("granted")),
};
vi.stubGlobal("Notification", mockNotification);

// Mock window.location.reload (without replacing the entire window object)
Object.defineProperty(window, "location", {
  configurable: true,
  value: { ...window.location, reload: vi.fn() },
});

// Mock Date to control time
const MOCK_DATE = new Date("2024-05-15T10:00:00Z"); // Wednesday

describe("useReminderEngine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
    vi.clearAllMocks();
    useVisitStore.getState().setVisits([]);
    useNotificationStore.getState().clearAll();
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getInitialState().settings,
        language: "fr",
        notifications: {
          enabled: true,
          steps: {
            remindJ7: true,
            remindJ2: true,
          },
        },
        congregation: {
          name: "Test Cong",
          city: "Test City",
          day: "Dimanche",
          time: "11:30",
          responsableName: "John Doe",
          responsablePhone: "",
          whatsappGroup: "",
          whatsappInviteId: "",
          googleSheetUrl: "",
          lastSyncAt: "",
        },
      },
    });
    mockNotification.permission = "default";
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("should request notification permission if enabled", () => {
    renderHook(() => useReminderEngine());
    act(() => {
      vi.advanceTimersByTime(1000); // Advance past initial timeout
    });
    expect(mockNotification.requestPermission).toHaveBeenCalled();
  });

  it("should not request notification permission if disabled", () => {
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        notifications: { ...useSettingsStore.getState().settings.notifications, enabled: false },
      },
    });
    renderHook(() => useReminderEngine());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(mockNotification.requestPermission).not.toHaveBeenCalled();
  });

  it("should create J-7 reminder for upcoming visit", () => {
    mockNotification.permission = "granted";
    const visitDate = "2024-05-22"; // 7 days from MOCK_DATE (Wednesday to Wednesday)
    const visit: Visit = {
      visitId: "v1",
      nom: "Speaker One",
      congregation: "Cong One",
      visitDate,
      locationType: "kingdom_hall",
      status: "scheduled",
      talkNoOrType: "1",
    };
    useVisitStore.getState().addVisit(visit);

    renderHook(() => useReminderEngine());
    act(() => {
      vi.advanceTimersByTime(1000); // Trigger initial check
    });

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe("j7");
    expect(notifications[0].speakerName).toBe("Speaker One");
    expect(notifications[0].whatsappMessage).toContain("Cher frère Speaker");
  });

  it("should create J-2 reminder for upcoming visit", () => {
    mockNotification.permission = "granted";
    const visitDate = "2024-05-17"; // 2 days from MOCK_DATE (Wednesday to Friday)
    const visit: Visit = {
      visitId: "v2",
      nom: "Speaker Two",
      congregation: "Cong Two",
      visitDate,
      locationType: "kingdom_hall",
      status: "scheduled",
      talkNoOrType: "2",
    };
    useVisitStore.getState().addVisit(visit);

    renderHook(() => useReminderEngine());
    act(() => {
      vi.advanceTimersByTime(1000); // Trigger initial check
    });

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe("j2");
    expect(notifications[0].speakerName).toBe("Speaker Two");
    expect(notifications[0].whatsappMessage).toContain("Votre visite approche");
  });

  it("should not create duplicate notifications", () => {
    mockNotification.permission = "granted";
    const visitDate = "2024-05-22";
    const visit: Visit = {
      visitId: "v3",
      nom: "Speaker Three",
      congregation: "Cong Three",
      visitDate,
      locationType: "kingdom_hall",
      status: "scheduled",
      talkNoOrType: "3",
    };
    useVisitStore.getState().addVisit(visit);

    renderHook(() => useReminderEngine());
    act(() => {
      vi.advanceTimersByTime(1000); // First check
    });
    expect(useNotificationStore.getState().notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000); // Second check (30 min later)
    });
    // Should still be 1, no new notification created
    expect(useNotificationStore.getState().notifications).toHaveLength(1);
  });

  it("should build WhatsApp message correctly for different languages", () => {
    const visitDate = "2024-05-22";
    const visit: Visit = {
      visitId: "v4",
      nom: "Speaker Four",
      congregation: "Cong Four",
      visitDate,
      locationType: "kingdom_hall",
      status: "scheduled",
      talkNoOrType: "4",
    };
    useVisitStore.getState().addVisit(visit);

    useSettingsStore.getState().setLanguage("pt");
    renderHook(() => useReminderEngine());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const notifications = useNotificationStore.getState().notifications;
    expect(notifications[0].whatsappMessage).toContain("Querido irmão Speaker");
    expect(notifications[0].whatsappMessage).toContain("Fraternalmente,\nJohn Doe");
  });
});