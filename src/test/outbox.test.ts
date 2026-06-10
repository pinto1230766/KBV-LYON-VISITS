import { describe, it, expect, beforeEach } from "vitest";
import { useOutboxStore } from "../store/useOutboxStore";
import { useVisitStore } from "../store/useVisitStore";
import type { Visit } from "../store/entities";

describe("Outbox Store", () => {
  beforeEach(() => {
    useOutboxStore.getState().clear();
    useVisitStore.getState().visits.forEach((v) => useVisitStore.getState().deleteVisit(v.visitId));
    // Clear outbox again as deleteVisit might have logged to it
    useOutboxStore.getState().clear();
  });

  it("should queue upsert and delete operations", () => {
    const store = useOutboxStore.getState();
    expect(useOutboxStore.getState().entries).toHaveLength(0);

    store.addUpsert("visits", "v-1", { visitId: "v-1", nom: "Test Orateur" });
    expect(useOutboxStore.getState().entries).toHaveLength(1);
    expect(useOutboxStore.getState().entries[0].action).toBe("upsert");
    expect(useOutboxStore.getState().entries[0].recordId).toBe("v-1");

    store.addDelete("speakers", "s-1");
    expect(useOutboxStore.getState().entries).toHaveLength(2);
    expect(useOutboxStore.getState().entries[1].action).toBe("delete");
    expect(useOutboxStore.getState().entries[1].tableName).toBe("speakers");
  });

  it("should consolidate multiple upserts to the same item", () => {
    const store = useOutboxStore.getState();
    store.addUpsert("visits", "v-1", { visitId: "v-1", nom: "First Version" });
    store.addUpsert("visits", "v-1", { visitId: "v-1", nom: "Second Version" });

    expect(useOutboxStore.getState().entries).toHaveLength(1);
    expect(useOutboxStore.getState().entries[0].payload.nom).toBe("Second Version");
  });

  it("should remove pending upsert when a delete comes in for the same item", () => {
    const store = useOutboxStore.getState();
    store.addUpsert("visits", "v-1", { visitId: "v-1", nom: "Test Visit" });
    expect(useOutboxStore.getState().entries).toHaveLength(1);

    store.addDelete("visits", "v-1");
    // Upsert should be removed, and only the delete entry should be present
    expect(useOutboxStore.getState().entries).toHaveLength(1);
    expect(useOutboxStore.getState().entries[0].action).toBe("delete");
  });

  it("should remove processed entries by id", () => {
    const store = useOutboxStore.getState();
    store.addUpsert("visits", "v-1", { visitId: "v-1" });
    store.addUpsert("visits", "v-2", { visitId: "v-2" });
    expect(useOutboxStore.getState().entries).toHaveLength(2);

    const firstId = useOutboxStore.getState().entries[0].id;
    store.remove([firstId]);
    expect(useOutboxStore.getState().entries).toHaveLength(1);
    expect(useOutboxStore.getState().entries[0].recordId).toBe("v-2");
  });
});

describe("Outbox Integration with Visit Store", () => {
  beforeEach(() => {
    useOutboxStore.getState().clear();
    useVisitStore.getState().visits.forEach((v) => useVisitStore.getState().deleteVisit(v.visitId));
    useOutboxStore.getState().clear();
  });

  it("should automatically queue actions to outbox when visits are modified", () => {
    const visit: Visit = {
      visitId: "visit-int-1",
      nom: "Integrated Visit",
      congregation: "Lyon Sud",
      visitDate: "2026-07-10",
      status: "scheduled",
      talkNoOrType: "12",
      locationType: "kingdom_hall",
    };

    // 1. Add Visit
    useVisitStore.getState().addVisit(visit);
    expect(useOutboxStore.getState().entries).toHaveLength(1);
    expect(useOutboxStore.getState().entries[0].action).toBe("upsert");
    expect(useOutboxStore.getState().entries[0].recordId).toBe("visit-int-1");

    // 2. Update Visit
    useVisitStore.getState().updateVisit("visit-int-1", { talkTheme: "Peace" });
    // Still 1 since it consolidates the upsert
    expect(useOutboxStore.getState().entries).toHaveLength(1);
    expect(useOutboxStore.getState().entries[0].payload.talkTheme).toBe("Peace");

    // 3. Delete Visit
    useVisitStore.getState().deleteVisit("visit-int-1");
    // Upsert consolidated out, should only be 1 delete action in queue
    expect(useOutboxStore.getState().entries).toHaveLength(1);
    expect(useOutboxStore.getState().entries[0].action).toBe("delete");
  });
});
