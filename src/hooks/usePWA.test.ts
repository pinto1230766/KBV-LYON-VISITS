import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePWA } from "./usePWA";

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => ({
  matches,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

// Mock Notification API
const mockNotification = {
  permission: "default",
  requestPermission: vi.fn(() => Promise.resolve("granted")),
};

// Mock serviceWorker
const mockServiceWorker: {
  ready: Promise<unknown>;
  controller: ServiceWorker | null;
} = {
  ready: Promise.resolve({
    addEventListener: vi.fn(),
  }),
  controller: null,
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => {
    if (query === "(display-mode: standalone)") {
      return mockMatchMedia(false);
    }
    return mockMatchMedia(false);
  }),
});

Object.defineProperty(window, "Notification", {
  writable: true,
  value: mockNotification,
});

Object.defineProperty(navigator, "serviceWorker", {
  writable: true,
  value: mockServiceWorker,
});

describe("usePWA", () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    addEventListenerSpy = vi.spyOn(window, "addEventListener");

    mockNotification.permission = "default";
    mockServiceWorker.controller = null;
  });

  it("should return initial PWA states correctly", () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isStandalone).toBe(false);
    expect(result.current.isIOS).toBe(false);
    expect(result.current.showIOSInstallGuide).toBe(false);
    expect(result.current.updateAvailable).toBe(false);
  });

  it("should update canInstall when beforeinstallprompt is fired", async () => {
    const { result } = renderHook(() => usePWA());

    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn(() => Promise.resolve({ outcome: "accepted" })),
      userChoice: Promise.resolve({ outcome: "accepted" }),
    };

    act(() => {
      const call = addEventListenerSpy.mock.calls.find(
        (call: [string, ...unknown[]]) => call[0] === "beforeinstallprompt"
      );
      if (call) {
        (call[1] as (e: Event) => void)(mockEvent as unknown as Event);
      }
    });

    expect(result.current.canInstall).toBe(true);
    expect(mockEvent.preventDefault).toHaveBeenCalled();

    await act(async () => {
      await result.current.promptInstall();
    });
    expect(mockEvent.prompt).toHaveBeenCalled();
  });

  it("should update isInstalled when appinstalled is fired", () => {
    const { result } = renderHook(() => usePWA());
    act(() => {
      const call = addEventListenerSpy.mock.calls.find(
        (call: [string, ...unknown[]]) => call[0] === "appinstalled"
      );
      if (call) {
        (call[1] as () => void)();
      }
    });
    expect(result.current.isInstalled).toBe(true);
  });

  it("should detect iOS correctly", () => {
    Object.defineProperty(navigator, "userAgent", {
      writable: true,
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1",
    });
    const { result } = renderHook(() => usePWA());
    expect(result.current.isIOS).toBe(true);
    expect(result.current.showIOSInstallGuide).toBe(true);
  });

  it("should detect updateAvailable when service worker updates", async () => {
    const swInstalling = {
      addEventListener: vi.fn(),
      state: "installing",
    };
    const swRegistration = {
      installing: swInstalling,
      addEventListener: vi.fn(),
    };
    mockServiceWorker.ready = Promise.resolve(
      swRegistration as unknown as ServiceWorkerRegistration
    );
    mockServiceWorker.controller = { state: "activated" } as ServiceWorker;

    const { result } = renderHook(() => usePWA());

    // Wait for the ready promise to resolve and effect to wire up listeners
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Simulate 'updatefound' event
    act(() => {
      const call = swRegistration.addEventListener.mock.calls.find(
        (c: unknown[]) => c[0] === "updatefound"
      );
      if (call) (call[1] as () => void)();
    });

    // Simulate 'statechange' to 'installed'
    act(() => {
      swInstalling.state = "installed";
      const call = swInstalling.addEventListener.mock.calls.find(
        (c: unknown[]) => c[0] === "statechange"
      );
      if (call) (call[1] as () => void)();
    });

    expect(result.current.updateAvailable).toBe(true);
  });

  it("should reload window on applyUpdate", () => {
    const reloadFn = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload: reloadFn },
    });
    const { result } = renderHook(() => usePWA());
    act(() => {
      result.current.applyUpdate();
    });
    expect(reloadFn).toHaveBeenCalled();
  });
});
