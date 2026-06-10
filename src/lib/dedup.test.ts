import { describe, it, expect } from "vitest";
import { mergeSpeakers, mergeVisits, normalizeName } from "./dedup";
import type { Speaker, HostAssignment } from "../store/visitTypes";

describe("Deduplication & Merge Logic", () => {
  it("devrait normaliser les noms correctement", () => {
    expect(normalizeName("  Jean-Luc  ")).toBe("jean-luc");
    expect(normalizeName("Émilie")).toBe("emilie"); // Test accents
  });

  it("devrait fusionner deux versions d'un orateur (le plus récent gagne)", () => {
    const local: Speaker = {
      id: "1",
      nom: "Jean Dupont",
      congregation: "Lyon",
      updatedAt: "2023-01-01T10:00:00Z"
    };
    const remote: Speaker = {
      id: "1",
      nom: "Jean Dupont",
      congregation: "Lyon Nord", // Changement
      updatedAt: "2023-01-01T11:00:00Z" // Plus récent
    };

    const result = mergeSpeakers([local], [remote]);
    expect(result[0].congregation).toBe("Lyon Nord");
  });

  it("devrait conserver les champs définis si le gagnant ne les a pas", () => {
    const local: Speaker = {
      id: "1",
      nom: "Jean Dupont",
      congregation: "Lyon",
      telephone: "0600000000",
      updatedAt: "2023-01-01T10:00:00Z"
    };
    const remote: Speaker = {
      id: "1",
      nom: "Jean Dupont",
      congregation: "Lyon",
      updatedAt: "2023-01-01T11:00:00Z"
    };
    const result = mergeSpeakers([local], [remote]);
    expect(result[0].telephone).toBe("0600000000");
  });

  it("devrait fusionner les tableaux d'assignation d'hôtes sans les écraser", () => {
    const local = {
      visitId: "v-1",
      nom: "Jean Dupont",
      congregation: "Lyon",
      visitDate: "2026-06-20",
      talkNoOrType: "45",
      locationType: "kingdom_hall" as const,
      status: "scheduled" as const,
      hostAssignments: [
        { role: "hebergement" as const, hostName: "Famille Accueil A" }
      ],
      updatedAt: "2026-06-10T10:00:00Z"
    };

    const remote = {
      visitId: "v-1",
      nom: "Jean Dupont",
      congregation: "Lyon",
      visitDate: "2026-06-20",
      talkNoOrType: "45",
      locationType: "kingdom_hall" as const,
      status: "scheduled" as const,
      hostAssignments: [
        { role: "repas" as const, hostName: "Famille Repas B" }
      ],
      updatedAt: "2026-06-10T10:05:00Z"
    };

    const result = mergeVisits([local], [remote]);
    expect(result).toHaveLength(1);
    expect(result[0].hostAssignments).toHaveLength(2);
    expect(result[0].hostAssignments!.find((h: HostAssignment) => h.role === "hebergement")?.hostName).toBe("Famille Accueil A");
    expect(result[0].hostAssignments!.find((h: HostAssignment) => h.role === "repas")?.hostName).toBe("Famille Repas B");
  });
});