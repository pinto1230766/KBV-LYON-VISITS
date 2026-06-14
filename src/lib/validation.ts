import { z } from "zod";

export const speakerSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  congregation: z.string().min(1, "La congrégation est requise"),
  telephone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  photoUrl: z.string().optional(),
  spousePhotoUrl: z.string().optional(),
  householdType: z.enum(["single", "couple"]).default("single"),
  spouseName: z.string().optional(),
  childrenCount: z.number().min(0).optional(),
  childrenAges: z.string().optional(),
  dietary: z.string().optional(),
  spouseDietary: z.string().optional(),
  notes: z.string().optional(),
});

export const hostSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  adresse: z.string().optional(),
  capacity: z.number().min(1).optional(),
  role: z.enum(["hebergement", "transport", "repas"]).optional(),
  photoUrl: z.string().optional(),
  notes: z.string().optional(),
});

export const visitSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  congregation: z.string().min(1, "La congrégation est requise"),
  visitDate: z.string().min(1, "La date est requise"),
  talkNoOrType: z.string().optional(),
  talkTheme: z.string().optional(),
  speakerPhone: z.string().optional(),
  locationType: z.enum(["kingdom_hall", "zoom", "streaming", "other"]).default("kingdom_hall"),
  status: z.enum(["scheduled", "confirmed", "cancelled", "completed"]).default("scheduled"),
  notes: z.string().optional(),
});

export type SpeakerFormData = z.infer<typeof speakerSchema>;
export type HostFormData = z.infer<typeof hostSchema>;
export type VisitFormData = z.infer<typeof visitSchema>;

// === Backup / import schemas =================================================
// Permissive schemas: accept unknown extra fields, only enforce minimum shape
// so that imports from older app versions or partial backups still work.

export const backupSpeakerSchema = z.object({
  id: z.string().min(1),
  nom: z.any().optional(),
}).passthrough();

export const backupHostSchema = z.object({
  id: z.string().min(1),
  nom: z.any().optional(),
}).passthrough();

export const backupVisitSchema = z.object({
  visitId: z.string().min(1),
  nom: z.any().optional(),
}).passthrough();

export const backupFileSchema = z.object({
  visits: z.array(backupVisitSchema).optional(),
  speakers: z.array(backupSpeakerSchema).optional(),
  hosts: z.array(backupHostSchema).optional(),
  settings: z.any().optional(),
  exportedAt: z.string().optional(),
}).passthrough();

export type BackupFile = z.infer<typeof backupFileSchema>;

/**
 * Safely parse a backup file payload, returning typed sane data and a count
 * of dropped malformed entries per category.
 */
export function safeParseBackup(raw: unknown): {
  ok: boolean;
  data: BackupFile;
  dropped: { visits: number; speakers: number; hosts: number };
  error?: string;
} {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, data: {}, dropped: { visits: 0, speakers: 0, hosts: 0 }, error: "Invalid payload" };
  }
  const obj = raw as Record<string, unknown>;
  const dropped = { visits: 0, speakers: 0, hosts: 0 };

  const sift = <T>(arr: unknown, schema: z.ZodTypeAny, key: keyof typeof dropped): T[] => {
    if (!Array.isArray(arr)) return [];
    const out: T[] = [];
    for (const item of arr) {
      const r = schema.safeParse(item);
      if (r.success) out.push(r.data as T);
      else dropped[key]++;
    }
    return out;
  };

  const data: BackupFile = {
    visits: sift(obj.visits, backupVisitSchema, "visits"),
    speakers: sift(obj.speakers, backupSpeakerSchema, "speakers"),
    hosts: sift(obj.hosts, backupHostSchema, "hosts"),
    settings: obj.settings,
    exportedAt: typeof obj.exportedAt === "string" ? obj.exportedAt : undefined,
  };
  return { ok: true, data, dropped };
}
