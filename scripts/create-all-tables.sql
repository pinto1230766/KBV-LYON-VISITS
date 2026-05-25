-- ══════════════════════════════════════════════════════════════════════════════════════
-- KBV2 – Script d'Initialisation Complet de la Base Supabase (Tables, Triggers et Index)
-- ══════════════════════════════════════════════════════════════════════════════════════
-- Exécutez ce script dans l'éditeur SQL de votre nouveau projet Supabase.
-- URL de l'éditeur : https://supabase.com/dashboard/project/_/editor
-- ══════════════════════════════════════════════════════════════════════════════════════

-- ── 1. TABLE : congregation ──
CREATE TABLE IF NOT EXISTS public.congregation (
  id                   TEXT PRIMARY KEY DEFAULT 'default',
  name                 TEXT NOT NULL DEFAULT '',
  city                 TEXT NOT NULL DEFAULT '',
  day                  TEXT NOT NULL DEFAULT 'Dimanche',
  time                 TEXT NOT NULL DEFAULT '11:30',
  responsable_name     TEXT NOT NULL DEFAULT '',
  responsable_phone    TEXT NOT NULL DEFAULT '',
  responsable_photo    TEXT,
  kingdom_hall_address TEXT NOT NULL DEFAULT '',
  whatsapp_group       TEXT NOT NULL DEFAULT '',
  whatsapp_invite_id   TEXT NOT NULL DEFAULT '',
  google_sheet_url     TEXT DEFAULT '',
  last_sync_at         TEXT DEFAULT '',
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- Insertion de la ligne par défaut
INSERT INTO public.congregation (id, name, city, day, time)
VALUES ('default', '', '', 'Dimanche', '11:30')
ON CONFLICT (id) DO NOTHING;

-- ── 2. TABLE : speakers ──
CREATE TABLE IF NOT EXISTS public.speakers (
  id             UUID PRIMARY KEY,
  nom            TEXT NOT NULL,
  congregation   TEXT NOT NULL DEFAULT '',
  telephone      TEXT,
  email          TEXT,
  photo_url      TEXT,
  wife_photo_url TEXT,
  household_type TEXT DEFAULT 'single',
  wife_name      TEXT,
  notes          TEXT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. TABLE : hosts ──
CREATE TABLE IF NOT EXISTS public.hosts (
  id         UUID PRIMARY KEY,
  nom        TEXT NOT NULL,
  telephone  TEXT,
  email      TEXT,
  adresse    TEXT,
  notes      TEXT,
  role       TEXT,
  photo_url  TEXT,
  capacity   INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 4. TABLE : visits ──
CREATE TABLE IF NOT EXISTS public.visits (
  visit_id         UUID PRIMARY KEY,
  nom              TEXT NOT NULL,
  congregation     TEXT NOT NULL DEFAULT '',
  visit_date       TEXT NOT NULL,
  heure_visite     TEXT,
  location_type    TEXT NOT NULL DEFAULT 'kingdom_hall',
  status           TEXT NOT NULL DEFAULT 'scheduled',
  is_event         BOOLEAN DEFAULT false,
  event_type       TEXT,
  talk_no_or_type  TEXT,
  talk_theme       TEXT,
  speaker_phone    TEXT,
  notes            TEXT,
  feedback         TEXT,
  feedback_rating  INTEGER,
  host_assignments JSONB DEFAULT '[]'::jsonb,
  companions       JSONB DEFAULT '[]'::jsonb,
  date_arrivee     TEXT,
  heure_arrivee    TEXT,
  date_depart      TEXT,
  heure_depart     TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5. TABLE : tombstones (suivi des suppressions) ──
CREATE TABLE IF NOT EXISTS public.tombstones (
  id         TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════════════
-- 🔒 CONFIGURATION DE LA SECURITE (Row-Level Security - RLS)
-- ══════════════════════════════════════════════════════════════════════════════════════

-- Activation de RLS sur toutes les tables
ALTER TABLE public.congregation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tombstones ENABLE ROW LEVEL SECURITY;

-- Autoriser l'accès complet pour les utilisateurs authentifiés (si configuré)
CREATE POLICY "auth_full_access" ON public.congregation FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_access" ON public.speakers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_access" ON public.hosts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_access" ON public.visits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_access" ON public.tombstones FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Autoriser l'accès anonyme (clés API Anon publiques utilisées par l'application locale)
CREATE POLICY "anon_full_access" ON public.congregation FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access" ON public.speakers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access" ON public.hosts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access" ON public.visits FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_full_access" ON public.tombstones FOR ALL TO anon USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════════════════════════════
-- ⚡ AUTOMATISATION DE LA COLONNE updated_at (Triggers)
-- ══════════════════════════════════════════════════════════════════════════════════════

-- Fonction commune de trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ajout des triggers
DO $$ BEGIN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.visits
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.speakers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.hosts
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════════════
-- 🔍 INDEXES DE PERFORMANCE (Réduction drastique de l'egress et des temps de réponse)
-- ══════════════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_visits_updated_at ON public.visits(updated_at);
CREATE INDEX IF NOT EXISTS idx_speakers_updated_at ON public.speakers(updated_at);
CREATE INDEX IF NOT EXISTS idx_hosts_updated_at ON public.hosts(updated_at);
CREATE INDEX IF NOT EXISTS idx_tombstones_deleted_at ON public.tombstones(deleted_at);
