import { describe, it, expect, beforeEach, vi } from "vitest";
import { runDataCleanups } from "./cleanup";
import { useSpeakerStore } from "../store/useSpeakerStore";
import { useHostStore } from "../store/useHostStore";

describe("runDataCleanups", () => {
  beforeEach(() => {
    localStorage.clear();
    useSpeakerStore.getState().setSpeakers([]);
    useHostStore.getState().setHosts([]);
    vi.clearAllMocks();
  });

  it("should migrate photo paths only once", async () => {
    // Setup state with old paths
    useSpeakerStore.getState().addSpeaker({
      id: "s1",
      nom: "Speaker 1",
      congregation: "Paris",
      photoUrl: "/images/old.jpg"
    });

    await runDataCleanups();

    // Check migration
    expect(useSpeakerStore.getState().speakers[0].photoUrl).toBe("./images/old.jpg");
    expect(localStorage.getItem("kbv-photo-paths-migrated-v1")).toBe("true");

    // Second run should not change anything if paths were manually updated differently
    useSpeakerStore.getState().updateSpeaker("s1", { photoUrl: "custom.jpg" });
    await runDataCleanups();
    expect(useSpeakerStore.getState().speakers[0].photoUrl).toBe("custom.jpg");
  });


});
