import { getSupabase } from "./supabase";
export { getSupabase };
import type { Visit, Speaker, Host, HostAssignment, Companion } from "../store/visitTypes";
import type { CongregationProfile } from "../store/settingsTypes";
import { useVisitStore } from "../store/useVisitStore";
import { useSpeakerStore } from "../store/useSpeakerStore";
import { useHostStore } from "../store/useHostStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useOutboxStore } from "../store/useOutboxStore";
import { mergeHosts, mergeSpeakers, mergeVisits } from "./dedup";
import { isExampleName, chunkArray } from "./utils";
import { logger } from "./logger";

import { normalizeName } from "./dedup";
export { normalizeName };

// ─── Retry helper with exponential backoff ───
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 500;
        logger.warn(`Retry ${attempt}/${MAX_RETRIES} for "${label}" after ${Math.round(delay)}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Wrapper for Supabase `.from(table).upsert()` on an untyped client.
 * Without generated Database types, the upsert parameter resolves to `never[]`,
 * causing false TypeScript errors. This helper centralises the single required
 * type assertion so that the rest of the codebase stays `any`-free.
 */
function supabaseUpsert(
  client: NonNullable<ReturnType<typeof getSupabase>>,
  table: string,
  rows: Record<string, unknown> | Record<string, unknown>[],
  options: { onConflict: string },
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return client.from(table).upsert(rows as any, options);
}

// ─── Types for Supabase database rows ───

interface CongregationRow {
  id: string;
  name: string;
  city: string;
  day: string;
  time: string;
  responsable_name: string;
  responsable_phone: string;
  responsable_photo: string | null;
  kingdom_hall_address: string;
  whatsapp_group: string;
  whatsapp_invite_id: string;
  google_sheet_url: string | null;
  last_sync_at: string | null;
  updated_at: string | null;
}

interface VisitRow {
  visit_id: string;
  nom: string;
  congregation: string;
  visit_date: string;
  heure_visite: string | null;
  location_type: string;
  status: string;
  is_event: boolean | null;
  event_type: string | null;
  talk_no_or_type: string | null;
  talk_theme: string | null;
  speaker_phone: string | null;
  notes: string | null;
  feedback: string | null;
  feedback_rating: number | null;
  host_assignments: HostAssignment[] | null;
  companions: Companion[] | null;
  date_arrivee: string | null;
  heure_arrivee: string | null;
  date_depart: string | null;
  heure_depart: string | null;
  updated_at: string;
}

interface SpeakerRow {
  id: string;
  nom: string;
  congregation: string;
  telephone: string | null;
  email: string | null;
  photo_url: string | null;
  wife_photo_url: string | null;
  household_type: string | null;
  wife_name: string | null;
  notes: string | null;
  updated_at: string | null;
}

interface HostRow {
  id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  notes: string | null;
  role?: string | null;
  photo_url: string | null;
  capacity: number | null;
  updated_at: string | null;
}

interface TombstoneRow {
  id: string;
  table_name: string;
  deleted_at: string;
}

// ─── UUID Conversion & Validation ───
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

function toUUID(str: string): string {
  if (!str) return "00000000-0000-4000-8000-000000000000";
  if (isValidUUID(str)) return str;

  let h0 = 0x811c9dc5, h1 = 0xdeadbeef, h2 = 0x9e3779b1, h3 = 0x85ebca77;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h0 = Math.imul(h0 ^ c, 16777619);
    h1 = Math.imul(h1 ^ c, 2246822519);
    h2 = Math.imul(h2 ^ c, 3266489917);
    h3 = Math.imul(h3 ^ (c + i), 374761393);
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  const a = hex(h0);
  const b = hex(h1).slice(0, 4);
  const c = "4" + hex(h2).slice(1, 4);
  const d = "8" + hex(h2).slice(5, 8).slice(0, 3);
  const e = (hex(h3) + hex(h0 ^ h1)).slice(0, 12);
  return `${a}-${b}-${c}-${d}-${e}`;
}

// ─── Safety Parse ───
function safeJson(val: unknown) {
  if (!val) return [];
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch (e) { logger.warn("safeJson parse error:", e); return []; }
  }
  return val;
}

// ─── Helpers: convert between app model and actual DB columns ───

function visitToRow(v: Visit): Partial<VisitRow> {
  return {
    visit_id: toUUID(v.visitId),
    nom: v.nom,
    congregation: v.congregation,
    visit_date: v.visitDate || "",
    heure_visite: v.heure_visite || null,
    location_type: v.locationType,
    status: v.status,
    is_event: v.isEvent || false,
    event_type: v.eventType || null,
    talk_no_or_type: v.talkNoOrType,
    talk_theme: v.talkTheme || null,
    speaker_phone: v.speakerPhone || null,
    notes: v.notes || null,
    feedback: v.feedback || null,
    feedback_rating: v.feedbackRating || null,
    host_assignments: v.hostAssignments || [],
    companions: v.companions || [],
    date_arrivee: v.date_arrivee || null,
    heure_arrivee: v.heure_arrivee || null,
    date_depart: v.date_depart || null,
    heure_depart: v.heure_depart || null,
    updated_at: v.updatedAt || new Date().toISOString(),
  };
}

function rowToVisit(r: VisitRow): Visit {
  return {
    visitId: r.visit_id,
    nom: r.nom,
    congregation: r.congregation,
    visitDate: r.visit_date,
    heure_visite: r.heure_visite || undefined,
    locationType: (r.location_type || "kingdom_hall") as Visit["locationType"],
    status: (r.status || "scheduled") as Visit["status"],
    isEvent: r.is_event ?? undefined,
    eventType: r.event_type as Visit["eventType"],
    talkNoOrType: r.talk_no_or_type ?? "",
    talkTheme: r.talk_theme ?? undefined,
    speakerPhone: r.speaker_phone ?? undefined,
    notes: r.notes ?? undefined,
    feedback: r.feedback ?? undefined,
    feedbackRating: r.feedback_rating ?? undefined,
    hostAssignments: safeJson(r.host_assignments),
    companions: safeJson(r.companions),
    date_arrivee: r.date_arrivee ?? undefined,
    heure_arrivee: r.heure_arrivee ?? undefined,
    date_depart: r.date_depart ?? undefined,
    heure_depart: r.heure_depart ?? undefined,
    updatedAt: r.updated_at,
  };
}

function speakerToRow(s: Speaker): Partial<SpeakerRow> {
  return {
    id: toUUID(s.id),
    nom: s.nom,
    congregation: s.congregation,
    telephone: s.telephone || null,
    email: s.email || null,
    // Les photos Base64 restent locales (IndexedDB) — pas de sync cloud
    // pour éviter de saturer l'egress Supabase (chaque photo = 100-500 KB).
    photo_url: null,
    wife_photo_url: null,
    household_type: s.householdType || "single",
    wife_name: s.spouseName || null,
    notes: s.notes || null,
    updated_at: s.updatedAt || new Date().toISOString(),
  };
}

function rowToSpeaker(r: SpeakerRow): Speaker {
  return {
    id: r.id,
    nom: r.nom,
    congregation: r.congregation,
    telephone: r.telephone || undefined,
    email: r.email || undefined,
    photoUrl: r.photo_url || undefined,
    spousePhotoUrl: r.wife_photo_url || undefined,
    householdType: r.household_type as Speaker["householdType"],
    spouseName: r.wife_name ?? undefined,
    notes: r.notes ?? undefined,
    updatedAt: r.updated_at || undefined,
  };
}

function hostToRow(h: Host): Partial<HostRow> {
  return {
    id: toUUID(h.id),
    nom: h.nom,
    telephone: h.telephone || null,
    email: h.email || null,
    adresse: h.adresse || null,
    notes: h.notes || null,
    // Les photos Base64 restent locales — pas de sync cloud
    photo_url: null,
    updated_at: h.updatedAt || new Date().toISOString(),
  };
}

function rowToHost(r: HostRow): Host {
  return {
    id: r.id,
    nom: r.nom,
    telephone: r.telephone || "",
    email: r.email || undefined,
    adresse: r.adresse || undefined,
    notes: r.notes || undefined,
    role: r.role as Host["role"] ?? undefined,
    photoUrl: r.photo_url || undefined,
    updatedAt: r.updated_at || undefined,
  };
}

export interface SyncResult {
  pushed: { visits: number; speakers: number; hosts: number };
  pulled: { visits: number; speakers: number; hosts: number };
  deleted: { visits: number; speakers: number; hosts: number };
  bytesEstimate: number;
}

// ─── Congregation sync helpers ───

function congregationToRow(p: CongregationProfile): Partial<CongregationRow> {
  return {
    id: "default",
    name: p.name,
    city: p.city,
    day: p.day,
    time: p.time,
    responsable_name: p.responsableName,
    responsable_phone: p.responsablePhone,
    responsable_photo: p.responsablePhoto ?? null,
    kingdom_hall_address: p.kingdomHallAddress,
    whatsapp_group: p.whatsappGroup,
    whatsapp_invite_id: p.whatsappInviteId,
    google_sheet_url: p.googleSheetUrl ?? null,
    last_sync_at: p.lastSyncAt ?? null,
    updated_at: new Date().toISOString(),
  };
}

function rowToCongregation(r: CongregationRow): CongregationProfile {
  return {
    name: r.name || "",
    city: r.city || "",
    day: r.day || "Dimanche",
    time: r.time || "11:30",
    responsableName: r.responsable_name || "",
    responsablePhone: r.responsable_phone || "",
    responsablePhoto: r.responsable_photo ?? undefined,
    kingdomHallAddress: r.kingdom_hall_address || "",
    whatsappGroup: r.whatsapp_group || "",
    whatsappInviteId: r.whatsapp_invite_id || "",
    googleSheetUrl: r.google_sheet_url ?? undefined,
    lastSyncAt: r.last_sync_at ?? undefined,
  };
}

/**
 * Fetch rows modified since a given ISO date from a table.
 * If `since` is undefined, fetches ALL rows (first sync).
 * Uses ordered keyset-pagination with `.order("id")` for index performance
 * and retries with smaller pages on statement timeout (57014).
 */
async function fetchChangesSince<T>(
  table: string,
  since?: string,
  pageSize = 250
): Promise<{ rows: T[]; bytes: number }> {
  const supabase = getSupabase();
  if (!supabase) return { rows: [], bytes: 0 };

  const rows: T[] = [];
  let from = 0;
  let hasMore = true;
  let currentPageSize = pageSize;

  // Build base query
  // NOTE: we do NOT add .order("id") here because on large tables without
  // an index, ORDER BY forces a full-table sort even at offset 0, causing
  // timeout 57014. The pagination via .range().limit() is sufficient; the
  // dedup/merge logic handles ordering client-side.
  // For incremental syncs we use .gt("updated_at", since) which benefits
  // from the index created by the SQL migration.
  let q = supabase.from(table).select("*");

  if (since) {
    q = q.gt("updated_at", since);
  }
  const idCol = table === "visits" ? "visit_id" : "id";
  const baseQuery = since ? q.order(idCol, { ascending: true }) : q;

  while (hasMore) {
    const q = baseQuery
      .range(from, from + currentPageSize - 1)
      .limit(currentPageSize);

    const { data, error } = await q;

    if (error && error.code === "57014" && currentPageSize >= 100) {
      logger.warn(
        `Timeout fetching ${table}[${from}–${from + currentPageSize - 1}], ` +
        `retrying with page size ${currentPageSize >> 1}`
      );
      currentPageSize = currentPageSize >> 1;
      const retry = await baseQuery
        .range(from, from + currentPageSize - 1)
        .limit(currentPageSize);
      if (retry.error) {
        logger.warn(`Fetch ${table} error after retry:`, retry.error);
        break;
      }
      const retryRows = (retry.data || []) as unknown as T[];
      rows.push(...retryRows);
      from += currentPageSize;
      continue;
    }

    if (error) {
      logger.warn(`Fetch ${table}[${from}–${from + currentPageSize - 1}] error:`, error);
      break;
    }

    const batch = (data || []) as unknown as T[];
    rows.push(...batch);

    if (batch.length < currentPageSize) {
      hasMore = false;
    } else {
      from += currentPageSize;
    }
  }

  const bytes = JSON.stringify(rows).length;
  return { rows, bytes };
}

/**
 * Check if an ISO date string is a valid date and returns its timestamp.
 */
function parseTime(d?: string): number {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export async function syncCloud(opts?: { forceMaster?: boolean }): Promise<SyncResult> {
  const forceMaster = opts?.forceMaster ?? false;
  // Try to init getSupabase (may fail on native if config not yet loaded)
  const supabase = getSupabase();
  const empty: SyncResult = {
    pushed: { visits: 0, speakers: 0, hosts: 0 },
    pulled: { visits: 0, speakers: 0, hosts: 0 },
    deleted: { visits: 0, speakers: 0, hosts: 0 },
    bytesEstimate: 0,
  };
  if (!supabase) {
    logger.warn("syncCloud: Supabase not configured, skipping sync");
    return empty;
  }

  const lastSyncAt = useSettingsStore.getState().settings.congregation.lastSyncAt;
  const nowISO = new Date().toISOString();

  // ── 0. PROCESS OUTBOX FIRST (BATCHED) ──
  // Replay all offline operations to Supabase with batching to reduce request count
  const outboxStore = useOutboxStore.getState();
  const entries = [...outboxStore.entries];

  // Log volume outbox for diagnostics
  logger.log(`📊 Outbox volume: ${entries.length} total entries`);

  // Collect
  const upsertsByTable: Record<"visits" | "speakers" | "hosts", (Partial<VisitRow> | Partial<SpeakerRow> | Partial<HostRow>)[]> = {
    visits: [],
    speakers: [],
    hosts: [],
  };
  const deleteIdsByTable: Record<"visits" | "speakers" | "hosts", string[]> = {
    visits: [],
    speakers: [],
    hosts: [],
  };

  const processedIds: string[] = [];

  for (const entry of entries) {
    const table = entry.tableName as "visits" | "speakers" | "hosts";

    // recordId stable => convert for DB PK
    const uuidId = toUUID(entry.recordId);

    if (entry.action === "upsert") {
      const convertFn =
        table === "visits" ? visitToRow : table === "speakers" ? speakerToRow : hostToRow;

      try {
        const row = convertFn(entry.payload);
        upsertsByTable[table].push(row);
        processedIds.push(entry.id);
      } catch (e) {
        logger.error(`Error converting outbox payload for ${table} (${entry.recordId}):`, e);
        // We still mark it as processed to avoid blocking the outbox indefinitely
        // OR we can choose to skip it and keep it in outbox.
        // Given it's a conversion error (likely code bug or data corruption),
        // removing it is probably safer than retrying forever.
        processedIds.push(entry.id);
      }
    } else if (entry.action === "delete") {
      deleteIdsByTable[table].push(uuidId);
      processedIds.push(entry.id);
    }
  }

  // Dedup delete IDs (IN (...) cleaner)
  (Object.keys(deleteIdsByTable) as Array<keyof typeof deleteIdsByTable>).forEach((table) => {
    deleteIdsByTable[table] = Array.from(new Set(deleteIdsByTable[table]));
  });

  // Log detailed outbox breakdown
  logger.log(`📊 Outbox breakdown:`, {
    upserts: { visits: upsertsByTable.visits.length, speakers: upsertsByTable.speakers.length, hosts: upsertsByTable.hosts.length },
    deletes: { visits: deleteIdsByTable.visits.length, speakers: deleteIdsByTable.speakers.length, hosts: deleteIdsByTable.hosts.length }
  });

  const UPSERT_CHUNK_VISITS = 25;
  const UPSERT_CHUNK_OTHERS = 50;
  const DELETE_CHUNK_VISITS = 100;
  const DELETE_CHUNK_OTHERS = 250;

  const getIdField = (table: "visits" | "speakers" | "hosts") => (table === "visits" ? "visit_id" : "id");

  const upsertTable = async (table: "visits" | "speakers" | "hosts", rows: (Partial<VisitRow> | Partial<SpeakerRow> | Partial<HostRow>)[]) => {
    if (!rows.length) return;

    const chunkSize = table === "visits" ? UPSERT_CHUNK_VISITS : UPSERT_CHUNK_OTHERS;
    const chunks = chunkArray<Partial<VisitRow> | Partial<SpeakerRow> | Partial<HostRow>>(rows, chunkSize);

    const idField = getIdField(table);

    for (const chunk of chunks) {
      await withRetry(
        async () => {
          const { error } = await supabaseUpsert(supabase, table, chunk as Record<string, unknown>[], { onConflict: idField });
          if (error) throw new Error(`Outbox upsert error on ${table}: ${error.message}`);
        },
        `outbox upsert (${table}, ${chunk.length})`
      );
    }
  };

  const deleteTable = async (table: "visits" | "speakers" | "hosts", ids: string[]) => {
    if (!ids.length) return;

    const chunkSize = table === "visits" ? DELETE_CHUNK_VISITS : DELETE_CHUNK_OTHERS;
    const chunks = chunkArray(ids, chunkSize);

    const idField = getIdField(table);

    for (const chunk of chunks) {
      await withRetry(
        async () => {
          // Batch delete
          const { error } = await supabase.from(table).delete().in(idField, chunk);
          if (error) throw new Error(`Outbox delete error on ${table}: ${error.message}`);
        },
        `outbox delete (${table}, ${chunk.length})`
      );
    }
  };

  const tombstoneTable = async (table: "visits" | "speakers" | "hosts", ids: string[]) => {
    if (!ids.length) return;

    const chunkSize = table === "visits" ? UPSERT_CHUNK_VISITS : UPSERT_CHUNK_OTHERS;
    const chunks = chunkArray<string>(ids, chunkSize);

    for (const chunk of chunks) {
      const tombRows = chunk.map((uuidId) => ({
        id: uuidId,
        table_name: table,
        deleted_at: new Date().toISOString(),
      }));

      await withRetry(
        async () => {
          const { error } = await supabaseUpsert(supabase, "tombstones", tombRows, { onConflict: "id" });

          if (error) throw new Error(`Outbox tombstone error (${table}, ${chunk.length}): ${error.message}`);
        },
        `outbox tombstones (${table}, ${chunk.length})`
      );
    }
  };

  try {
    logger.log(`🚀 Starting outbox replay...`);
    // Upserts first (same behavior intention: outbox "apply")
    logger.log(`📤 Upserting visits: ${upsertsByTable.visits.length} rows`);
    await upsertTable("visits", upsertsByTable.visits);
    logger.log(`📤 Upserting speakers: ${upsertsByTable.speakers.length} rows`);
    await upsertTable("speakers", upsertsByTable.speakers);
    logger.log(`📤 Upserting hosts: ${upsertsByTable.hosts.length} rows`);
    await upsertTable("hosts", upsertsByTable.hosts);

    // Deletes + tombstones
    logger.log(`🗑️ Deleting visits: ${deleteIdsByTable.visits.length} rows`);
    await deleteTable("visits", deleteIdsByTable.visits);
    logger.log(`🪦 Tombstoning visits: ${deleteIdsByTable.visits.length} rows`);
    await tombstoneTable("visits", deleteIdsByTable.visits);

    logger.log(`🗑️ Deleting speakers: ${deleteIdsByTable.speakers.length} rows`);
    await deleteTable("speakers", deleteIdsByTable.speakers);
    logger.log(`🪦 Tombstoning speakers: ${deleteIdsByTable.speakers.length} rows`);
    await tombstoneTable("speakers", deleteIdsByTable.speakers);

    logger.log(`🗑️ Deleting hosts: ${deleteIdsByTable.hosts.length} rows`);
    await deleteTable("hosts", deleteIdsByTable.hosts);
    logger.log(`🪦 Tombstoning hosts: ${deleteIdsByTable.hosts.length} rows`);
    await tombstoneTable("hosts", deleteIdsByTable.hosts);
  } catch (err) {
    // En cas d'échec, on ne purge pas l'outbox (pour retry plus tard)
    logger.error("❌ Outbox replay batch failed:", err);
    throw err;
  }

  logger.log(`✅ Outbox replay completed, clearing ${processedIds.length} processed entries`);
  // Clear successfully processed entries
  if (processedIds.length > 0) {
    outboxStore.remove(processedIds);
  }

  // ── 0.1 SYNC CONGREGATION PROFILE (single row) ──
  const { data: remoteCongregation, error: congError } = await supabase
    .from("congregation")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (congError) {
    logger.warn("Fetch congregation error:", congError);
  } else if (remoteCongregation) {
    const remoteProfile = rowToCongregation(remoteCongregation as CongregationRow);
    const localProfile = useSettingsStore.getState().settings.congregation;
    const localTime = parseTime(localProfile.lastSyncAt);
    const remoteTime = parseTime(remoteProfile.lastSyncAt);
    if (remoteTime > localTime) {
      const mergedProfile = {
        ...remoteProfile,
        responsableName: remoteProfile.responsableName || localProfile.responsableName,
        responsablePhoto: remoteProfile.responsablePhoto || localProfile.responsablePhoto,
      };
      useSettingsStore.getState().updateCongregation(mergedProfile);
      logger.log("Synced congregation profile from remote (newer).");
    } else if (localTime > 0) {
      const { error } = await supabaseUpsert(supabase, "congregation", congregationToRow(localProfile), { onConflict: "id" });
      if (error) throw new Error(`Congregation sync error: ${error.message}`);
    }

    // Si le local possède une photo administrateur mais que le remote n'en a pas, pousser la photo vers Supabase
    if (localProfile.responsablePhoto && !remoteProfile.responsablePhoto) {
      await supabaseUpsert(supabase, "congregation", congregationToRow({
        ...localProfile,
        lastSyncAt: nowISO,
      }), { onConflict: "id" });
      logger.log("Uploaded local admin photo to remote Supabase.");
    }
  } else {
    const localProfile = useSettingsStore.getState().settings.congregation;
    const { error } = await supabaseUpsert(supabase, "congregation", congregationToRow(localProfile), { onConflict: "id" });
    if (error) throw new Error(`Congregation creation error: ${error.message}`);
  }

  // ── 1. PULL INCREMENTAL TRANSACTIONAL ──
  // Fetch ALL tables AND tombstones in a single Promise.all, so if any fails, we abort before modifying state.

  logger.log(`📥 Pull incremental from: ${lastSyncAt || "début (full pull)"}`);

  const pullSince = lastSyncAt || undefined;
  const INITIAL_PAGE_SIZE = pullSince ? 250 : 100;

  logger.log(`📥 Fetching remote data...`);
  const [visitsResult, speakersResult, hostsResult, tombstonesResult] = await Promise.all([
    fetchChangesSince<VisitRow>("visits", pullSince, INITIAL_PAGE_SIZE),
    fetchChangesSince<SpeakerRow>("speakers", pullSince, INITIAL_PAGE_SIZE),
    fetchChangesSince<HostRow>("hosts", pullSince, INITIAL_PAGE_SIZE),
    supabase.from("tombstones").select("*").gt("deleted_at", pullSince || "1970-01-01"),
  ]);
  logger.log(`📥 Pull results: visits=${visitsResult.rows.length}, speakers=${speakersResult.rows.length}, hosts=${hostsResult.rows.length}, tombstones=${tombstonesResult.data?.length || 0}`);

  if (tombstonesResult.error) {
    throw new Error(`Failed to fetch tombstones: ${tombstonesResult.error.message}`);
  }

  const remoteVisits = visitsResult.rows;
  const remoteSpeakers = speakersResult.rows;
  const remoteHosts = hostsResult.rows;
  const tombstones = tombstonesResult.data;
  let totalBytes = visitsResult.bytes + speakersResult.bytes + hostsResult.bytes;

  // ── 2. APPLY TOMBSTONES (remote deletes) ──
  const deleted = { visits: 0, speakers: 0, hosts: 0 };

  if (tombstones && tombstones.length > 0) {
    const visitIdsToDelete = new Set<string>();
    const speakerIdsToDelete = new Set<string>();
    const hostIdsToDelete = new Set<string>();

    for (const t of tombstones as TombstoneRow[]) {
      if (t.table_name === "visits") {
        visitIdsToDelete.add(t.id);
        deleted.visits++;
      } else if (t.table_name === "speakers") {
        speakerIdsToDelete.add(t.id);
        deleted.speakers++;
      } else if (t.table_name === "hosts") {
        hostIdsToDelete.add(t.id);
        deleted.hosts++;
      }
    }

    // Apply deletions directly to the store state without queuing new outbox delete actions (which causes infinite sync loops)
    if (visitIdsToDelete.size > 0) {
      useVisitStore.setState((s) => ({
        visits: s.visits.filter((v) => !visitIdsToDelete.has(v.visitId) && !visitIdsToDelete.has(toUUID(v.visitId))),
      }));
    }
    if (speakerIdsToDelete.size > 0) {
      useSpeakerStore.setState((s) => ({
        speakers: s.speakers.filter((sp) => !speakerIdsToDelete.has(sp.id) && !speakerIdsToDelete.has(toUUID(sp.id))),
      }));
    }
    if (hostIdsToDelete.size > 0) {
      useHostStore.setState((s) => ({
        hosts: s.hosts.filter((h) => !hostIdsToDelete.has(h.id) && !hostIdsToDelete.has(toUUID(h.id))),
      }));
    }
    totalBytes += JSON.stringify(tombstones).length;
  }

  // ── 3. MERGE ──
  // En mode maître, on ignore le remote : les données locales priment.
  // Sur les autres appareils, le merge normal par timestamp s'applique.
  if (!forceMaster) {
    if (remoteVisits.length > 0) {
      const converted = remoteVisits.map(rowToVisit);
      const exampleVisits = converted.filter((v) => isExampleName(v.nom));
      for (const v of exampleVisits) {
        await deleteRemoteItem("visits", v.visitId);
      }
      const cleanRemoteVisits = converted.filter((v) => !isExampleName(v.nom));
      const merged = mergeVisits(
        useVisitStore.getState().visits.filter((v) => !isExampleName(v.nom)),
        cleanRemoteVisits
      );
      useVisitStore.getState().setVisits(merged);
    }

    if (remoteSpeakers.length > 0) {
      const converted = remoteSpeakers.map(rowToSpeaker);
      const exampleSpeakers = converted.filter((s) => isExampleName(s.nom));
      for (const s of exampleSpeakers) {
        await deleteRemoteItem("speakers", s.id);
      }
      const cleanRemoteSpeakers = converted.filter((s) => !isExampleName(s.nom));
      const merged = mergeSpeakers(
        useSpeakerStore.getState().speakers.filter((s) => !isExampleName(s.nom)),
        cleanRemoteSpeakers
      );
      useSpeakerStore.getState().setSpeakers(merged);
    }

    if (remoteHosts.length > 0) {
      const converted = remoteHosts.map(rowToHost);
      const exampleHosts = converted.filter((h) => isExampleName(h.nom));
      for (const h of exampleHosts) {
        await deleteRemoteItem("hosts", h.id);
      }
      const cleanRemoteHosts = converted.filter((h) => !isExampleName(h.nom));
      const merged = mergeHosts(
        useHostStore.getState().hosts.filter((h) => !isExampleName(h.nom)),
        cleanRemoteHosts
      );
      useHostStore.getState().setHosts(merged);
    }
  } else {
    logger.log("🏅 Mode maître activé : merge remote ignoré, les données locales ont priorité.");
  }

  // ── 4. PUSH FALLBACK (Incremental safety net) ──
  logger.log(`📤 Preparing push fallback...`);
  const localVisits = useVisitStore.getState().visits.filter((v) => !isExampleName(v.nom));
  const localSpeakers = useSpeakerStore.getState().speakers.filter((s) => !isExampleName(s.nom));
  const localHosts = useHostStore.getState().hosts.filter((h) => !isExampleName(h.nom));

  // En mode maître : push TOTAL de toutes les données locales avec updatedAt = now
  // pour garantir que la tablette écrase toujours le cloud.
  // En mode normal : push incrémental (seulement les modifiés depuis lastSyncAt).
  const isRemoteEmpty = !pullSince && remoteVisits.length === 0 && remoteSpeakers.length === 0 && remoteHosts.length === 0;
  const forceFullPush = forceMaster || (isRemoteEmpty && (localVisits.length > 0 || localSpeakers.length > 0 || localHosts.length > 0));

  const changedVisits = forceFullPush
    ? localVisits.map((v) => forceMaster ? { ...v, updatedAt: nowISO } : v)
    : localVisits.filter((v) => !lastSyncAt || (v.updatedAt && v.updatedAt > lastSyncAt));
  const changedSpeakers = forceFullPush
    ? localSpeakers.map((s) => forceMaster ? { ...s, updatedAt: nowISO } : s)
    : localSpeakers.filter((s) => !lastSyncAt || (s.updatedAt && s.updatedAt > lastSyncAt));
  const changedHosts = forceFullPush
    ? localHosts.map((h) => forceMaster ? { ...h, updatedAt: nowISO } : h)
    : localHosts.filter((h) => !lastSyncAt || (h.updatedAt && h.updatedAt > lastSyncAt));

  // Deduplicate by ID to avoid "ON CONFLICT DO UPDATE command cannot affect row a second time" error
  const dedupVisits = Array.from(new Map(changedVisits.map(v => [v.visitId, v])).values());
  const dedupSpeakers = Array.from(new Map(changedSpeakers.map(s => [s.id, s])).values());
  const dedupHosts = Array.from(new Map(changedHosts.map(h => [h.id, h])).values());

  logger.log(`📤 Push fallback: visits=${dedupVisits.length}, speakers=${dedupSpeakers.length}, hosts=${dedupHosts.length} (forceFullPush=${forceFullPush})`);

  // ── BATCHED UPSERTS ──
  // Reduce number of requests from 100+ to 2-3 per table to avoid timeouts
  // Visits: batchSize=25 (heavy JSON payload with host_assignments/companions)
  if (dedupVisits.length > 0) {
    logger.log(`📤 Pushing visits in batches...`);
    const visitChunks = chunkArray(dedupVisits, 25);
    for (const chunk of visitChunks) {
      await withRetry(async () => {
        const { error } = await supabaseUpsert(supabase, "visits", chunk.map(visitToRow) as Record<string, unknown>[], { onConflict: "visit_id" });
        if (error) throw new Error(`Visit batch upload error: ${error.message}`);
      }, `visit batch upsert (${chunk.length} rows)`);
    }
  }

  // Speakers: batchSize=50 (lighter payload)
  if (dedupSpeakers.length > 0) {
    logger.log(`📤 Pushing speakers in batches...`);
    const speakerChunks = chunkArray(dedupSpeakers, 50);
    for (const chunk of speakerChunks) {
      await withRetry(async () => {
        const { error } = await supabaseUpsert(supabase, "speakers", chunk.map(speakerToRow) as Record<string, unknown>[], { onConflict: "id" });
        if (error) throw new Error(`Speaker batch upload error: ${error.message}`);
      }, `speaker batch upsert (${chunk.length} rows)`);
    }
  }

  // Hosts: batchSize=50 (lighter payload)
  if (dedupHosts.length > 0) {
    logger.log(`📤 Pushing hosts in batches...`);
    const hostChunks = chunkArray(dedupHosts, 50);
    for (const chunk of hostChunks) {
      await withRetry(async () => {
        const { error } = await supabaseUpsert(supabase, "hosts", chunk.map(hostToRow) as Record<string, unknown>[], { onConflict: "id" });
        if (error) throw new Error(`Host batch upload error: ${error.message}`);
      }, `host batch upsert (${chunk.length} rows)`);
    }
  }

  totalBytes += JSON.stringify(dedupVisits).length;
  totalBytes += JSON.stringify(dedupSpeakers).length;
  totalBytes += JSON.stringify(dedupHosts).length;

  // ── 5. FINALIZE ──
  useSettingsStore.getState().updateCongregation({ lastSyncAt: nowISO });

  const result: SyncResult = {
    pushed: {
      visits: dedupVisits.length,
      speakers: dedupSpeakers.length,
      hosts: dedupHosts.length,
    },
    pulled: {
      visits: remoteVisits.length,
      speakers: remoteSpeakers.length,
      hosts: remoteHosts.length,
    },
    deleted,
    bytesEstimate: totalBytes,
  };

  const mb = (totalBytes / 1024 / 1024).toFixed(3);
  logger.log(
    `✅ Sync terminée. Volume: ${mb} Mo ` +
    `↓${remoteVisits.length + remoteSpeakers.length + remoteHosts.length} ` +
    `↑${changedVisits.length + changedSpeakers.length + changedHosts.length} ` +
    `🗑 ${deleted.visits + deleted.speakers + deleted.hosts}`,
    result
  );

  return result;
}

/**
 * Delete an item AND record a tombstone so other devices see the deletion.
 */
export async function deleteRemoteItem(table: "visits" | "speakers" | "hosts", id: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const idField = table === "visits" ? "visit_id" : "id";
  const uuidId = toUUID(id);

  // Delete from the main table
  const { error } = await supabase.from(table).delete().eq(idField, uuidId);
  if (error) {
    logger.error(`Delete from ${table} error:`, error);
    return;
  }

  // Record tombstone so other devices pick up the deletion
  await supabaseUpsert(supabase, "tombstones", { id: uuidId, table_name: table, deleted_at: new Date().toISOString() }, { onConflict: "id" });
}