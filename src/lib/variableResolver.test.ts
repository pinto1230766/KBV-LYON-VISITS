import { describe, it, expect } from "vitest";
import { resolveVariables } from "./variableResolver";
import type { Visit, Speaker, CongregationProfile } from "../store/visitTypes";

describe("variableResolver", () => {
  const mockVisit: Visit = {
    visitId: "v1",
    nom: "Jean Dupont",
    congregation: "Paris Centre",
    visitDate: "2026-06-15",
    heure_visite: "10:30",
    locationType: "kingdom_hall",
    status: "scheduled",
    talkNoOrType: "45",
    talkTheme: "Vivre avec espoir",
    hostAssignments: [
      { hostId: "h1", hostName: "Famille Martin", role: "hebergement" }
    ],
    updatedAt: new Date().toISOString(),
  };

  const mockCongregation: CongregationProfile = {
    name: "Paris Centre",
    city: "Paris",
    day: "Dimanche",
    time: "10:30",
    responsableName: "Admin",
    responsablePhone: "0102030405",
    kingdomHallAddress: "42 Rue des Anges, Lyon",
    whatsappGroup: "Groupe Paris Centre",
    whatsappInviteId: "invite123",
  };

  const mockCtx = {
    viewVisit: mockVisit,
    detailForm: mockVisit,
    templateLang: "fr" as const,
    speakers: [] as Speaker[],
    congregation: mockCongregation,
    formatDateFull: (s?: string) => s || "",
    formatDayOnly: (s?: string) => s || "",
    t: (key: string) => key,
  };

  it("should resolve basic variables like name and congregation", () => {
    const template = "Bonjour {prenom_orateur}, votre visite à {congregation} est prévue.";
    const result = resolveVariables(template, mockCtx);
    expect(result).toContain("Bonjour Jean");
    expect(result).toContain("Paris Centre");
  });

  it("should resolve date and time variables", () => {
    const template = "Date: {date_visite}, Heure: {heure_visite}";
    const result = resolveVariables(template, mockCtx);
    expect(result).toContain("2026-06-15");
    expect(result).toContain("10:30");
  });

  it("should resolve host information", () => {
    const template = "Hébergement: {nom_hebergeur}";
    const result = resolveVariables(template, mockCtx);
    expect(result).toContain("Famille Martin");
  });

  it("should handle missing host information gracefully", () => {
    const ctxWithoutHost = { 
      ...mockCtx, 
      detailForm: { ...mockVisit, hostAssignments: [] } 
    };
    const template = "Hébergement: {nom_hebergeur}";
    const result = resolveVariables(template, ctxWithoutHost);
    expect(result).toContain("___");
  });

  it("should resolve theme and talk number", () => {
    const template = "Thème: {theme_discours}, N°: {numero_discours}";
    const result = resolveVariables(template, mockCtx);
    expect(result).toContain("Vivre avec espoir");
    expect(result).toContain("45");
  });

  it("should handle emojis or special characters if present in template", () => {
    const template = "Salut ! \u{1F600} {prenom_orateur}";
    const result = resolveVariables(template, mockCtx);
    expect(result).toContain("\u{1F600} Jean");
  });

  it("should format meals block with short Google Maps link and auto-fill Kingdom Hall address", () => {
    const ctxWithKHRepas = {
      ...mockCtx,
      congregation: {
        ...mockCongregation,
        kingdomHallAddress: "42 Rue des Anges, Lyon"
      },
      detailForm: {
        ...mockVisit,
        hostAssignments: [
          { hostName: "Repas Salle du Royaume", role: "repas" as const, origin: "kingdom_hall" }
        ]
      }
    };
    const template = "{speaker_repas_block}";
    const result = resolveVariables(template, ctxWithKHRepas);
    expect(result).toContain("Repas");
    expect(result).toContain("42 Rue des Anges, Lyon");
    expect(result).toContain("maps.google.com/?q=42+Rue+des+Anges,+Lyon");
    expect(result).toContain("Raccourci Google Maps");
  });

  it("should translate Repas Salle du Royaume to Kumida na Salon di Reinu in Cape Verdean Creole", () => {
    const ctxWithKHRepasCv = {
      ...mockCtx,
      templateLang: "cv" as const,
      congregation: {
        ...mockCongregation,
        kingdomHallAddress: "42 Rue des Anges, Lyon"
      },
      detailForm: {
        ...mockVisit,
        hostAssignments: [
          { hostName: "Repas Salle du Royaume", role: "repas" as const, origin: "kingdom_hall" }
        ]
      }
    };
    const template = "{speaker_repas_block}";
    const result = resolveVariables(template, ctxWithKHRepasCv);
    expect(result).toContain("Kumida na Salon di Reinu");
  });

  it("should suppress transport block when transportType is car", () => {
    const ctxWithCar = {
      ...mockCtx,
      detailForm: {
        ...mockVisit,
        transportType: "car" as const
      }
    };
    const template = "Start{speaker_transport_block}End";
    const result = resolveVariables(template, ctxWithCar);
    expect(result).toBe("StartEnd");
  });

  it("should resolve companions details including with_speaker transport type", () => {
    const ctxWithCompanions = {
      ...mockCtx,
      t: (key: string) => {
        if (key === "with_speaker") return "Avec l'orateur";
        return key;
      },
      detailForm: {
        ...mockVisit,
        companions: [
          {
            id: "c1",
            nom: "Marc Laurent",
            ageGroup: "adult" as const,
            dietary: "Sans gluten",
            transportType: "with_speaker" as const,
            notes: "Besoin de repos",
          }
        ]
      }
    };
    const template = "{accompagnants_details}";
    const result = resolveVariables(template, ctxWithCompanions);
    expect(result).toContain("Marc Laurent");
    expect(result).toContain("adulte");
    expect(result).toContain("Allergies : Sans gluten");
    expect(result).toContain("Transport : Avec l'orateur");
    expect(result).toContain("Besoins : Besoin de repos");
  });

  it("should resolve reunion_lieu_block with Salle du Royaume address and Google Maps shortcut", () => {
    const ctxWithKH = {
      ...mockCtx,
      congregation: {
        ...mockCongregation,
        kingdomHallAddress: "42 Rue des Anges, Lyon"
      }
    };
    const template = "{reunion_lieu_block}";
    const result = resolveVariables(template, ctxWithKH);
    expect(result).toContain("Salle du Royaume, 42 Rue des Anges, Lyon");
    expect(result).toContain("maps.google.com/?q=42+Rue+des+Anges,+Lyon");
    expect(result).toContain("Raccourci Google Maps");
  });
});

