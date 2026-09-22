const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mlcanzkssfrdrsubmqnt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_l_0Y7pScFKdIwfydwchxmw_Su44uJJN';
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

function normalizeName(name) {
  return (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function generateDeterministicId(prefix, seed) {
  let h0 = 0x811c9dc5, h1 = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h0 = Math.imul(h0 ^ c, 16777619);
    h1 = Math.imul(h1 ^ c, 2246822519);
  }
  const hex = (n) => (n >>> 0).toString(16).padStart(8, '0');
  return `${prefix}-${hex(h0)}${hex(h1)}`;
}

function toUUID(str) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str;
  }
  let h0 = 0x811c9dc5, h1 = 0xdeadbeef, h2 = 0x41c64e6d, h3 = 0x12345678;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h0 = Math.imul(h0 ^ c, 16777619);
    h1 = Math.imul(h1 ^ c, 2246822519);
    h2 = Math.imul(h2 ^ c, 3266489917);
    h3 = Math.imul(h3 ^ c, 668265263);
  }
  const hex = (n) => (n >>> 0).toString(16).padStart(8, '0');
  const full = hex(h0) + hex(h1) + hex(h2) + hex(h3);
  return `${full.slice(0, 8)}-${full.slice(8, 12)}-4${full.slice(13, 16)}-8${full.slice(17, 20)}-${full.slice(20, 32)}`;
}

async function run() {
  console.log('--- 1. RECUPERATION DE TOUTES LES VISITES SUPABASE ---');
  const { data: allVisits, error } = await client.from('visits').select('*').order('visit_date', { ascending: true });
  if (error) throw error;
  console.log(`Total visites dans Supabase : ${allVisits.length}`);

  // Regrouper par clé : nom normalisé + date
  const byKey = new Map();
  const toDelete = [];

  // Supprimer expressément le 27/12/2026 (car l'événement est le 26/12 dans le sheet officiel)
  for (const v of allVisits) {
    if (v.visit_date === '2026-12-27') {
      toDelete.push(v);
      continue;
    }

    const key = `${normalizeName(v.nom)}|${v.visit_date}`;
    if (!byKey.has(key)) {
      byKey.set(key, [v]);
    } else {
      byKey.get(key).push(v);
    }
  }

  // Pour chaque groupe de même nom et même date, n'en garder qu'un seul
  for (const [key, group] of byKey.entries()) {
    if (group.length > 1) {
      // Priorité 1 : La visite qui a des assignations d'hôtes (host_assignments)
      // Priorité 2 : La visite avec l'ID déterministe
      // Priorité 3 : La plus récente updated_at
      const [nomNorm, date] = key.split('|');
      const targetId = toUUID(generateDeterministicId('sheet', `${nomNorm}|${date}`));

      group.sort((a, b) => {
        const aHasHosts = a.host_assignments && Array.isArray(a.host_assignments) && a.host_assignments.length > 0;
        const bHasHosts = b.host_assignments && Array.isArray(b.host_assignments) && b.host_assignments.length > 0;
        if (aHasHosts && !bHasHosts) return -1;
        if (!aHasHosts && bHasHosts) return 1;

        if (a.visit_id === targetId && b.visit_id !== targetId) return -1;
        if (a.visit_id !== targetId && b.visit_id === targetId) return 1;

        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      });

      const winner = group[0];
      const losers = group.slice(1);
      for (const loser of losers) {
        toDelete.push(loser);
      }
    }
  }

  console.log(`\n--- 2. SUPPRESSION DES DOUBLONS RESTANTS (${toDelete.length}) ---`);
  if (toDelete.length > 0) {
    const ids = toDelete.map(v => v.visit_id);
    for (const v of toDelete) {
      console.log(`🗑️ [${v.visit_date}] ${(v.nom || '').replace(/\n/g, ' ')} (ID: ${v.visit_id})`);
    }

    const { error: delErr } = await client.from('visits').delete().in('visit_id', ids);
    if (delErr) console.error('Erreur suppression:', delErr);
    else console.log('✅ Visites en doublon supprimées.');

    const tombstones = ids.map(id => ({
      id,
      table_name: 'visits',
      deleted_at: new Date().toISOString()
    }));
    const { error: tombErr } = await client.from('tombstones').upsert(tombstones, { onConflict: 'id' });
    if (tombErr) console.error('Erreur tombstones:', tombErr);
    else console.log(`✅ ${tombstones.length} tombstones créées pour la synchronisation.`);
  }

  console.log('\n--- BILAN FINAL DE SUPABASE ---');
  const { data: finalVisits } = await client.from('visits').select('visit_date,nom,congregation').order('visit_date', { ascending: true });
  console.log(`Nombre total de visites dans Supabase : ${finalVisits.length}`);

  console.log('\n--- PLANNING SEPTEMBRE - DECEMBRE 2026 ---');
  finalVisits
    .filter(v => v.visit_date >= '2026-09-01' && v.visit_date <= '2026-12-31')
    .forEach((v, idx) => {
      console.log(`${idx + 1}. [${v.visit_date}] ${(v.nom || '').replace(/\n/g, ' ')} (${v.congregation || ''})`);
    });
}

run().catch(console.error);
