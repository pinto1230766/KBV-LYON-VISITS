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

const EVENT_KEYWORDS = [
  'congrès', 'congres', 'kongrésu', 'kongresu', 'assembleia', 'asenbleia',
  'visita do superintendente', 'visite du surveillant',
  'simana spesial', 'semaine spéciale', 'semaine speciale',
  'runion ku francês', 'runion ku frances', 'reunião com francês',
  'diskursu spesial', 'discours spécial', 'discours special',
  'komemorason', 'mémorial', 'memorial', 'comemoração',
  'assemblée', 'assemblee', 'special week'
];

async function cleanSpeakers() {
  const { data: allSpeakers, error } = await client.from('speakers').select('*');
  if (error) throw error;
  console.log(`Total orateurs récupérés : ${allSpeakers.length}`);

  const byKey = new Map();
  const toDelete = [];

  for (const s of allSpeakers) {
    const norm = normalizeName(s.nom);
    const isEvent = EVENT_KEYWORDS.some(k => norm.includes(k));
    if (isEvent) {
      toDelete.push(s);
      continue;
    }

    if (!byKey.has(norm)) {
      byKey.set(norm, [s]);
    } else {
      byKey.get(norm).push(s);
    }
  }

  for (const [norm, group] of byKey.entries()) {
    if (group.length > 1) {
      group.sort((a, b) => {
        const aHasDetails = Boolean(a.telephone || a.email || a.photo_url || a.notes);
        const bHasDetails = Boolean(b.telephone || b.email || b.photo_url || b.notes);
        if (aHasDetails && !bHasDetails) return -1;
        if (!aHasDetails && bHasDetails) return 1;

        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      });

      const winner = group[0];
      const losers = group.slice(1);
      for (const loser of losers) {
        toDelete.push(loser);
      }
    }
  }

  console.log(`Orateurs/événements à supprimer : ${toDelete.length}`);
  if (toDelete.length > 0) {
    const ids = toDelete.map(s => s.id);
    const { error: delErr } = await client.from('speakers').delete().in('id', ids);
    if (delErr) console.error('Erreur suppression:', delErr);
    else console.log('✅ Orateurs en doublon supprimés.');

    const tombstones = ids.map(id => ({
      id,
      table_name: 'speakers',
      deleted_at: new Date().toISOString()
    }));
    const { error: tombErr } = await client.from('tombstones').upsert(tombstones, { onConflict: 'id' });
    if (tombErr) console.error('Erreur tombstones:', tombErr);
    else console.log(`✅ ${tombstones.length} tombstones créées pour les orateurs.`);
  }

  const { count } = await client.from('speakers').select('*', { count: 'exact', head: true });
  console.log(`Nombre total d'orateurs uniques restants : ${count}`);
}

cleanSpeakers().catch(console.error);
