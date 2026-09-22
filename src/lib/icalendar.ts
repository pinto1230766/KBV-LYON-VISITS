import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import type { Visit } from "../store/visitTypes";
import type { CongregationProfile } from "../store/settingsTypes";

/**
 * Escapes characters for iCalendar (RFC 5545) text values.
 */
export function escapeIcsText(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Formats a Date object to iCalendar compact format: YYYYMMDDTHHmmss.
 */
export function formatIcsDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Computes start and end Date objects for a visit.
 * Defaults to 1h45 (105 minutes) meeting duration.
 */
export function getVisitDates(visit: Visit, defaultTime = "11:30"): { start: Date; end: Date } {
  const timeStr = visit.heure_visite || defaultTime || "11:30";
  const [hours, minutes] = timeStr.split(":").map((v) => parseInt(v, 10) || 0);

  const [y, m, d] = visit.visitDate.split("-").map((v) => parseInt(v, 10));
  const start = new Date(y, m - 1, d, hours, minutes, 0);
  const end = new Date(start.getTime() + 105 * 60 * 1000); // 1h45 duration
  return { start, end };
}

/**
 * Builds a single VEVENT block for a visit.
 */
export function buildVEvent(visit: Visit, congregation?: CongregationProfile): string {
  const { start, end } = getVisitDates(visit, congregation?.time || "11:30");
  const now = new Date();

  const titleParts: string[] = [];
  if (visit.nom) titleParts.push(visit.nom);
  if (visit.congregation) titleParts.push(`(${visit.congregation})`);
  const summary = titleParts.length > 0 ? `🎤 Visite : ${titleParts.join(" ")}` : "🎤 Visite orateur";

  const descLines: string[] = [];
  if (visit.talkNoOrType || visit.talkTheme) {
    const talkNumber = visit.talkNoOrType ? `N° ${visit.talkNoOrType}` : "";
    const talkTheme = visit.talkTheme ? `« ${visit.talkTheme} »` : "";
    descLines.push(`Thème : ${[talkNumber, talkTheme].filter(Boolean).join(" - ")}`);
  }
  if (visit.nom) {
    descLines.push(`Orateur : ${visit.nom}`);
  }
  if (visit.congregation) {
    descLines.push(`Congrégation d'origine : ${visit.congregation}`);
  }
  if (visit.speakerPhone) {
    descLines.push(`Téléphone : ${visit.speakerPhone}`);
  }
  if (visit.hostAssignments && visit.hostAssignments.length > 0) {
    descLines.push("");
    descLines.push("Familles d'accueil :");
    visit.hostAssignments.forEach((ha) => {
      const roleLabel =
        ha.role === "hebergement"
          ? "Hébergement"
          : ha.role === "repas"
          ? "Repas"
          : ha.role === "transport"
          ? "Transport"
          : "Visite";
      descLines.push(`• ${roleLabel} : ${ha.hostName || "Non défini"}`);
    });
  }
  if (visit.notes) {
    descLines.push("");
    descLines.push(`Remarques : ${visit.notes}`);
  }

  const description = descLines.join("\n");
  const location = congregation?.kingdomHallAddress || "Salle du Royaume";
  const uid = `visit-${visit.visitId || visit.id || Date.now()}@kbv-lyon.org`;

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDateTime(now)}Z`,
    `DTSTART:${formatIcsDateTime(start)}`,
    `DTEND:${formatIcsDateTime(end)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    "STATUS:CONFIRMED",
    // 24-hour advance alarm
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcsText(`Rappel : Visite de ${visit.nom} demain`)}`,
    "END:VALARM",
    // 2-hour advance alarm
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcsText(`Rappel : Réunion / Visite de ${visit.nom} dans 2 heures`)}`,
    "END:VALARM",
    "END:VEVENT",
  ].join("\r\n");
}

/**
 * Generates a full RFC 5545 iCalendar (.ics) string for a single visit.
 */
export function generateVisitIcs(visit: Visit, congregation?: CongregationProfile): string {
  const event = buildVEvent(visit, congregation);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KBV Lyon//KBV Lyon Visits//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    event,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Generates an RFC 5545 iCalendar (.ics) string containing multiple visits (full schedule).
 */
export function generateScheduleIcs(visits: Visit[], congregation?: CongregationProfile): string {
  const events = visits
    .filter((v) => v.status !== "cancelled")
    .map((v) => buildVEvent(v, congregation))
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KBV Lyon//KBV Lyon Visits//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    events,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Downloads or shares the generated .ics file.
 * Compatible with Web browsers, PWAs, and Native mobile (Android / iOS via Capacitor).
 */
export async function downloadOrShareIcs(
  filename: string,
  icsContent: string,
  title = "Ajouter à l'agenda"
): Promise<void> {
  const safeFilename = filename.endsWith(".ics") ? filename : `${filename}.ics`;

  if (Capacitor.isNativePlatform()) {
    try {
      // Write to Cache directory then trigger native share sheet
      const result = await Filesystem.writeFile({
        path: safeFilename,
        data: icsContent,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      await Share.share({
        title,
        url: result.uri,
        dialogTitle: "Ouvrir avec Google Agenda / Samsung Calendar",
      });
      return;
    } catch {
      // Fallback to web download if native share fails or user cancels
    }
  }

  // Browser / PWA fallback
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
