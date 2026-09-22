import { describe, it, expect } from "vitest";
import {
  escapeIcsText,
  formatIcsDateTime,
  getVisitDates,
  buildVEvent,
  generateVisitIcs,
  generateScheduleIcs,
} from "./icalendar";
import type { Visit } from "../store/visitTypes";
import type { CongregationProfile } from "../store/settingsTypes";

describe("icalendar module", () => {
  it("escapes special characters correctly according to RFC 5545", () => {
    expect(escapeIcsText("Hello, world; with \\ backslash\nand newline")).toBe(
      "Hello\\, world\\; with \\\\ backslash\\nand newline"
    );
    expect(escapeIcsText("")).toBe("");
  });

  it("formats Date into YYYYMMDDTHHmmss string", () => {
    const d = new Date(2026, 8, 26, 14, 30, 0); // Sept 26, 2026 14:30:00
    expect(formatIcsDateTime(d)).toBe("20260926T143000");
  });

  it("computes start and end dates with default 105 min duration", () => {
    const mockVisit: Visit = {
      id: "1",
      visitId: "v-1",
      nom: "Carlos Silva",
      congregation: "Paris Nord",
      visitDate: "2026-10-04",
      talkNoOrType: "42",
      talkTheme: "L'amour divin",
      speakerPhone: "0601020304",
      status: "scheduled",
      heure_visite: "10:00",
    };

    const { start, end } = getVisitDates(mockVisit);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(9); // October is 9
    expect(start.getDate()).toBe(4);
    expect(start.getHours()).toBe(10);
    expect(start.getMinutes()).toBe(0);

    // End is 10:00 + 1h45 -> 11:45
    expect(end.getHours()).toBe(11);
    expect(end.getMinutes()).toBe(45);
  });

  it("builds a valid VEVENT block with alarms", () => {
    const mockVisit: Visit = {
      id: "1",
      visitId: "v-123",
      nom: "Jean Dupont",
      congregation: "Marseille",
      visitDate: "2026-11-15",
      talkNoOrType: "15",
      talkTheme: "La paix véritable",
      speakerPhone: "0612345678",
      status: "confirmed",
      heure_visite: "15:00",
      notes: "Arrive en train",
      hostAssignments: [
        {
          hostId: "h-1",
          hostName: "Famille Martin",
          role: "repas",
        },
      ],
    };

    const mockCongregation: CongregationProfile = {
      name: "Lyon KBV",
      kingdomHallAddress: "123 Rue de Lyon, 69000 Lyon",
      time: "15:00",
    };

    const vevent = buildVEvent(mockVisit, mockCongregation);
    expect(vevent).toContain("BEGIN:VEVENT");
    expect(vevent).toContain("UID:visit-v-123@kbv-lyon.org");
    expect(vevent).toContain("SUMMARY:🎤 Visite : Jean Dupont (Marseille)");
    expect(vevent).toContain("LOCATION:123 Rue de Lyon\\, 69000 Lyon");
    expect(vevent).toContain("BEGIN:VALARM");
    expect(vevent).toContain("TRIGGER:-P1D");
    expect(vevent).toContain("END:VEVENT");
  });

  it("generates a full single visit calendar (.ics)", () => {
    const mockVisit: Visit = {
      id: "1",
      visitId: "v-99",
      nom: "Antonio Ramos",
      congregation: "Nice",
      visitDate: "2026-12-05",
      status: "scheduled",
    };

    const ics = generateVisitIcs(mockVisit);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("PRODID:-//KBV Lyon//KBV Lyon Visits//FR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("UID:visit-v-99@kbv-lyon.org");
    expect(ics.endsWith("END:VCALENDAR")).toBe(true);
  });

  it("generates a schedule calendar with multiple visits, omitting cancelled", () => {
    const visits: Visit[] = [
      {
        id: "1",
        visitId: "v-1",
        nom: "Frère 1",
        visitDate: "2026-10-03",
        status: "scheduled",
      },
      {
        id: "2",
        visitId: "v-2",
        nom: "Frère Annulé",
        visitDate: "2026-10-10",
        status: "cancelled",
      },
      {
        id: "3",
        visitId: "v-3",
        nom: "Frère 3",
        visitDate: "2026-10-17",
        status: "confirmed",
      },
    ];

    const ics = generateScheduleIcs(visits);
    expect(ics).toContain("Frère 1");
    expect(ics).toContain("Frère 3");
    expect(ics).not.toContain("Frère Annulé");
  });
});
