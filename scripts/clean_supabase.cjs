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

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function cleanVisits() {
  console.log('--- 1. NETTOYAGE DES VISITES ---');
  let allVisits = [];
  let from = 0;
  while (true) {
    const { data, error } = await client.from('visits').select('*').range(from, from + 999);
    if (error) {
      console.error('Erreur lecture visits:', error);
      break;
    }
    if (!data || data.length === 0) break;
    allVisits.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log(`Total visites récupérées : ${allVisits.length}`);

  const bestVisits = new Map();
  const toDelete = [];

  for (const v of allVisits) {
    const key = `${normalizeName(v.nom)}|${v.visit_date || ''}`;
    if (!bestVisits.has(key)) {
      bestVisits.set(key, v);
    } else {
      const existing = bestVisits.get(key);
      const vHasHosts = v.host_assignments && Array.isArray(v.host_assignments) && v.host_assignments.length > 0;
      const exHasHosts = existing.host_assignments && Array.isArray(existing.host_assignments) && existing.host_assignments.length > 0;
      const vTime = new Date(v.updated_at || 0).getTime();
      const exTime = new Date(existing.updated_at || 0).getTime();

      let vWins = false;
      if (vHasHosts && !exHasHosts) {
        vWins = true;
      } else if (!vHasHosts && exHasHosts) {
        vWins = false;
      } else {
        vWins = vTime >= exTime;
      }

      if (vWins) {
        toDelete.push(existing.visit_id);
        bestVisits.set(key, v);
      } else {
        toDelete.push(v.visit_id);
      }
    }
  }

  console.log(`Visites uniques conservées : ${bestVisits.size}`);
  console.log(`Lignes de doublons à supprimer : ${toDelete.length}`);

  const chunks = chunkArray(toDelete, 50);
  let deletedCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const { error } = await client.from('visits').delete().in('visit_id', chunk);
    if (error) {
      console.error(`Erreur suppression batch ${i + 1}/${chunks.length}:`, error.message);
    } else {
      deletedCount += chunk.length;
      process.stdout.write(`\rSuppression visites : ${deletedCount}/${toDelete.length}`);
    }
  }
  console.log('\n✅ Nettoyage des visites terminé.');
}

async function cleanSpeakers() {
  console.log('\n--- 2. NETTOYAGE DES ORATEURS ---');
  let allSpeakers = [];
  let from = 0;
  while (true) {
    const { data, error } = await client.from('speakers').select('*').range(from, from + 999);
    if (error) {
      console.error('Erreur lecture speakers:', error);
      break;
    }
    if (!data || data.length === 0) break;
    allSpeakers.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log(`Total orateurs récupérés : ${allSpeakers.length}`);

  const bestSpeakers = new Map();
  const toDelete = [];

  for (const s of allSpeakers) {
    const key = normalizeName(s.nom);
    if (!bestSpeakers.has(key)) {
      bestSpeakers.set(key, s);
    } else {
      const existing = bestSpeakers.get(key);
      const sHasDetails = Boolean(s.telephone || s.email || s.photo_url);
      const exHasDetails = Boolean(existing.telephone || existing.email || existing.photo_url);
      const sTime = new Date(s.updated_at || 0).getTime();
      const exTime = new Date(existing.updated_at || 0).getTime();

      let sWins = false;
      if (sHasDetails && !exHasDetails) {
        sWins = true;
      } else if (!sHasDetails && exHasDetails) {
        sWins = false;
      } else {
        sWins = sTime >= exTime;
      }

      if (sWins) {
        toDelete.push(existing.id);
        bestSpeakers.set(key, s);
      } else {
        toDelete.push(s.id);
      }
    }
  }

  console.log(`Orateurs uniques conservés : ${bestSpeakers.size}`);
  console.log(`Doublons d'orateurs à supprimer : ${toDelete.length}`);

  const chunks = chunkArray(toDelete, 50);
  let deletedCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const { error } = await client.from('speakers').delete().in('id', chunk);
    if (error) {
      console.error(`Erreur suppression batch speakers ${i + 1}/${chunks.length}:`, error.message);
    } else {
      deletedCount += chunk.length;
      process.stdout.write(`\rSuppression orateurs : ${deletedCount}/${toDelete.length}`);
    }
  }
  console.log('\n✅ Nettoyage des orateurs terminé.');
}

async function cleanTombstones() {
  console.log('\n--- 3. NETTOYAGE DES TOMBSTONES ---');
  const { error } = await client.from('tombstones').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.error('Erreur suppression tombstones:', error.message);
  } else {
    console.log('✅ Tombstones résiduelles purgées.');
  }
}

async function main() {
  await cleanVisits();
  await cleanSpeakers();
  await cleanTombstones();

  console.log('\n--- BILAN FINAL ---');
  const { count: vCount } = await client.from('visits').select('*', { count: 'exact', head: true });
  const { count: sCount } = await client.from('speakers').select('*', { count: 'exact', head: true });
  const { count: tCount } = await client.from('tombstones').select('*', { count: 'exact', head: true });
  console.log(`Visites restantes : ${vCount}`);
  console.log(`Orateurs restants : ${sCount}`);
  console.log(`Tombstones restantes : ${tCount}`);
}

main().catch((err) => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
