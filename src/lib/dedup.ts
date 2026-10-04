import type { Host, Speaker, Visit } from "../store/visitTypes";

export function normalizeName(name: string | undefined | null): string {
  return (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeDatePart(date: string | undefined | null): string {
  return (date || "").split("T")[0].trim();
}

export function getVisitKey(visit: Visit): string {
  const name = normalizeName(visit.nom);
  const date = normalizeDatePart(visit.visitDate);
  return name && date ? `${name}|${date}` : `id:${visit.visitId}`;
}

export function getSpeakerKey(speaker: Speaker): string {
  const name = normalizeName(speaker.nom);
  return name || `id:${speaker.id}`;
}

export function getHostKey(host: Host): string {
  const name = normalizeName(host.nom);
  return name || `id:${host.id}`;
}

function timestamp(value?: string): number {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Merge two records of the same logical entity.
 * The newer one (by updatedAt) wins ALL its declared fields, including
 * intentional clears (empty string, null). This is critical so that a user
 * editing a field — for example switching householdType from "couple" back
 * to "single" or clearing a spouseName — is not silently reverted by an
 * older remote copy carrying the previous value.
 *
 * Fields that are `undefined` in the winner fall back to the loser's value.
 */
function mergeItem<T extends { updatedAt?: string }>(a: T, b: T, idField: keyof T): T {
  const aTime = timestamp(a.updatedAt);
  const bTime = timestamp(b.updatedAt);
  // Strictly newer wins. On equality we keep `a` (caller controls order:
  // local data is passed first so local edits win ties against remote).
  const winner = bTime > aTime ? b : a;
  const loser = winner === a ? b : a;

  const output: Record<string, unknown> = { ...(loser as Record<string, unknown>) };

  Object.entries(winner as Record<string, unknown>).forEach(([field, value]) => {
    if (field === idField) return;
    // `undefined` means "field was not provided" — fall back to loser.
    if (value === undefined) return;

    // Field-level deep merge for arrays of sub-objects
    if (Array.isArray(value) && Array.isArray(output[field])) {
      if (field === "hostAssignments") {
        const aMap = new Map<string, Record<string, unknown>>();
        (output[field] as Record<string, unknown>[]).forEach((x) => {
          if (x && typeof x.role === "string") {
            const key = `${x.role}|${x.hostId || x.hostName || ""}|${x.day || ""}|${x.time || ""}`;
            aMap.set(key, x);
          }
        });
        (value as Record<string, unknown>[]).forEach((x) => {
          if (x && typeof x.role === "string") {
            const key = `${x.role}|${x.hostId || x.hostName || ""}|${x.day || ""}|${x.time || ""}`;
            const existing = aMap.get(key);
            aMap.set(key, existing ? { ...existing, ...x } : x);
          }
        });
        output[field] = Array.from(aMap.values());
        return;
      } else if (field === "companions" || field === "expenses") {
        const aMap = new Map<string, Record<string, unknown>>();
        (output[field] as Record<string, unknown>[]).forEach((x) => {
          if (x && typeof x.id === "string") aMap.set(x.id, x);
        });
        (value as Record<string, unknown>[]).forEach((x) => {
          if (x && typeof x.id === "string") {
            const existing = aMap.get(x.id);
            aMap.set(x.id, existing ? { ...existing, ...x } : x);
          }
        });
        output[field] = Array.from(aMap.values());
        return;
      }
    }

    output[field] = value;
  });

  // Preserve the loser's id (caller-controlled stable identity).
  output[idField as string] = (output[idField as string] ?? (loser as Record<string, unknown>)[idField as string]);

  // Always advance updatedAt to the newer of the two so subsequent merges
  // continue to honor this resolved state.
  output.updatedAt = winner.updatedAt || loser.updatedAt;

  return output as T;
}

function mergeByKey<T extends { updatedAt?: string }>(items: T[], keyFn: (item: T) => string, idField: keyof T): T[] {
  const merged = new Map<string, T>();
  items.forEach((item) => {
    const key = keyFn(item);
    const existing = merged.get(key);
    merged.set(key, existing ? mergeItem(existing, item, idField) : item);
  });
  return Array.from(merged.values());
}

export function mergeVisits(...groups: Visit[][]): Visit[] {
  return mergeByKey(groups.flat(), getVisitKey, "visitId");
}

export function mergeSpeakers(...groups: Speaker[][]): Speaker[] {
  return mergeByKey(groups.flat(), getSpeakerKey, "id");
}

export function mergeHosts(...groups: Host[][]): Host[] {
  return mergeByKey(groups.flat(), getHostKey, "id");
}
