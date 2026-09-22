import { describe, it, expect } from "vitest";
import { getNotificationId } from "./localNotifications";

describe("localNotifications module", () => {
  it("generates deterministic positive 31-bit integers for notification IDs", () => {
    const id1 = getNotificationId("visit-123", "j7");
    const id2 = getNotificationId("visit-123", "j7");
    const id3 = getNotificationId("visit-123", "j2");
    const testId = getNotificationId("any", "test");

    expect(id1).toBe(id2);
    expect(id1).not.toBe(id3);
    expect(id1).toBeGreaterThanOrEqual(0);
    expect(id1).toBeLessThan(2147483647);
    expect(testId).toBe(999999);
  });
});
