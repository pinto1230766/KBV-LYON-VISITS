import type { Visit, Speaker } from "../store/visitTypes";
import { normalizeName } from "./dedup";
import { EVENT_KEYWORDS } from "./eventDetection";

/** Generate a unique ID */
export function generateId(): string {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2, 11);
}

/** Parse CSV text into rows of cells */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') { current += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { current += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ",") { row.push(current.trim()); current = ""; }
      else if (char === "\n" || (char === "\r" && text[i + 1] === "\n")) {
        row.push(current.trim()); current = "";
        if (row.some((c) => c !== "")) rows.push(row);
        row = [];
        if (char === "\r") i++;
      } else { current += char; }
    }
  }
  row.push(current.trim());
  if (row.some((c) => c !== "")) rows.push(row);
  return rows;
}

/** Extract Google Sheet ID and gid from a URL */
export function extractSheetInfo(url: string): { id: string; gid: string } | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return null;
  const gidMatch = url.match(/gid=(\d+)/);
  return { id: match[1], gid: gidMatch ? gidMatch[1] : "0" };
}

/** Fetch all tabs from the Google Sheet htmlview */
export async function fetchSheetTabs(sheetId: string): Promise<Array<{ name: string; gid: string }>> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/htmlview`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch htmlview: HTTP ${response.status}`);
  }
  const html = await response.text();
  const tabs: Array<{ name: string; gid: string }> = [];

  // Regex to match items.push({name: "...", pageUrl: "...", gid: "..."})
  const regex = /items\.push\(\s*\{\s*name:\s*"((?:[^"\\]|\\.)*)",\s*pageUrl:\s*"((?:[^"\\]|\\.)*)",\s*gid:\s*"([^"]*)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const rawName = match[1];
    const gid = match[3];
    try {
      // Safely unescape the JavaScript string containing Unicode escapes like \u00e9 or escaped slashes \/
      const name = JSON.parse(`"${rawName}"`);
      tabs.push({ name, gid });
    } catch {
      // Fallback unescape if JSON.parse fails
      const name = rawName
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\(.)/g, '$1');
      tabs.push({ name, gid });
    }
  }
  return tabs;
}

/** Check if a tab name looks like a planning tab */
export function isPlanningTab(name: string): boolean {
  const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Blacklist: if it contains any of these, it's definitely not a planning tab
  const blacklist = [
    "roulement",
    "liste",
    "lista",
    "irmon",
    "irmao",
    "konvidi",
    "convid",
    "invite",
    "realise",
    "realiza",
    "parametre",
    "settings",
    "config",
    "orateur"
  ];

  if (blacklist.some(word => norm.includes(word))) {
    return false;
  }

  // Whitelist: must contain either a year or a month name or planning keywords
  const monthKeywords = [
    // French
    "janvier", "janv", "fevrier", "fev", "mars", "avril", "avr", "mai", "juin", "juillet", "juil", "aout", "septembre", "sept", "octobre", "oct", "novembre", "nov", "decembre", "dec",
    // Portuguese / Creole
    "janeiro", "janeru", "fevereiro", "fubreru", "marco", "marsu", "abril", "maio", "maiu", "junho", "junhu", "julho", "julhu", "agosto", "agostu", "setembro", "setenbru", "outubro", "otubru", "novembro", "novemburu", "nuvenbru", "dezembro", "dizenbru",
    // Generic planning terms
    "planning", "plan", "trimestre", "trimestri", "impression", "dp"
  ];

  // Check if it has a 2 or 4 digit year (e.g. "26", "2026")
  const hasYear = /\b(20)?\d{2}\b/.test(norm);

  const hasMonthOrKeyword = monthKeywords.some(word => norm.includes(word));

  return hasYear || hasMonthOrKeyword;
}


/** Parse a sheet date string (various formats) to YYYY-MM-DD, or null if unrecognizable */
export function parseSheetDate(dateStr: string): string {
  const s = dateStr.trim();
  if (!s) return "";

  // Already ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY or D/M/YYYY or DD/MM/YY or D/M/YY
  const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (slashMatch) {
    const [, d, m, y] = slashMatch;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // DD-MM-YYYY or D-M-YYYY or DD-MM-YY or D-M-YY
  const dashMatch = s.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
  if (dashMatch) {
    const [, d, m, y] = dashMatch;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // DD.MM.YYYY or D.M.YYYY or DD.MM.YY or D.M.YY
  const dotMatch = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
  if (dotMatch) {
    const [, d, m, y] = dotMatch;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // DD/MM or D/M or DD-MM or D-M or DD.MM or D.M (assume current year)
  const num2Match = s.match(/^(\d{1,2})[/\-.](\d{1,2})$/);
  if (num2Match) {
    const [, d, m] = num2Match;
    const year = new Date().getFullYear();
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // French written date parsing (e.g. "12 octobre 2025", "Dimanche 12 oct. 2025")
  const monthsFr: Record<string, string> = {
    janvier: "01", janv: "01",
    fevrier: "02", fev: "02", fevr: "02",
    mars: "03",
    avril: "04", avr: "04",
    mai: "05",
    juin: "06",
    juillet: "07", juil: "07",
    aout: "08",
    septembre: "09", sept: "09",
    octobre: "10", oct: "10",
    novembre: "11", nov: "11",
    decembre: "12", dec: "12", dece: "12"
  };

  const cleanStr = s.toLowerCase()
    .replace(/^(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi|dim|lun|mar|mer|jeu|ven|sam)[.,]?\s+/i, "")
    .replace(/[./\-,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Try matching 3-part: Day Month Year (e.g. "12 oct 25", "12 octobre 2025")
  const wordMatch3 = cleanStr.match(/^(\d{1,2})\s+(\S+)\s+(\d{2}|\d{4})$/);
  if (wordMatch3) {
    const [, d, m, y] = wordMatch3;
    const normMonth = m.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const monthNum = monthsFr[normMonth];
    if (monthNum) {
      const year = y.length === 2 ? `20${y}` : y;
      return `${year}-${monthNum}-${d.padStart(2, "0")}`;
    }
  }

  // Try matching 2-part: Day Month (e.g. "12 oct", "12 octobre") -> fallback to current year
  const wordMatch2 = cleanStr.match(/^(\d{1,2})\s+(\S+)$/);
  if (wordMatch2) {
    const [, d, m] = wordMatch2;
    const normMonth = m.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const monthNum = monthsFr[normMonth];
    if (monthNum) {
      const year = new Date().getFullYear();
      return `${year}-${monthNum}-${d.padStart(2, "0")}`;
    }
  }

  // Try native Date parse as last resort
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return "";
}

/** Check if a raw date string from the sheet is parseable */
function isParseableDate(s: string): boolean {
  return parseSheetDate(s) !== "";
}




/** Parse CSV rows into Visit and Speaker objects */
export function parseRowsToData(rows: string[][]): { visits: Visit[]; speakers: Speaker[] } {
  const visits: Visit[] = [];
  const speakerMap = new Map<string, Speaker>();

  for (const row of rows) {
    const dateStr = row[1]?.trim();
    if (!dateStr || !isParseableDate(dateStr)) continue;
    const orador = row[2]?.trim() || "";
    const congregation = row[3]?.trim() || "";
    const talkNo = row[4]?.trim() || "";
    const theme = row[5]?.trim() || "";
    if (!orador) continue;

    // Détection événements (congrès / semaines spéciales) — pas de plan d'hôtes nécessaire
    const oradorNorm = normalizeName(orador);
    const isEvent = !talkNo && EVENT_KEYWORDS.some((k) => oradorNorm.includes(k));

    const visitDate = parseSheetDate(dateStr);
    const visitId = "sheet-" + generateId();

    visits.push({
      visitId,
      nom: orador,
      congregation,
      visitDate,
      locationType: "kingdom_hall",
      status: new Date(visitDate) < new Date() ? "completed" : "scheduled",
      isEvent: isEvent || undefined,
      talkNoOrType: talkNo || (isEvent ? "event" : ""),
      talkTheme: theme,
    });

    if (!isEvent) {
      const key = normalizeName(orador);
      if (!speakerMap.has(key)) {
        speakerMap.set(key, {
          id: "sheet-" + generateId(),
          nom: orador,
          congregation,
        });
      }
    }
  }
  return { visits, speakers: Array.from(speakerMap.values()) };
}
