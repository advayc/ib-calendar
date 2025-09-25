#!/usr/bin/env node
/**
 * Simple migration helper: fetches local /api/clubs and /api/events and inserts
 * them into Supabase using service role key. Run with:
 *
 * SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=service_role_xxx node scripts/migrate-to-supabase.js
 */
const fetch = globalThis.fetch || require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchLocal(path) {
  const res = await fetch(`http://localhost:3000${path}`);
  if (!res.ok) throw new Error(`Local fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function main() {
  console.log('Fetching local clubs & events from http://localhost:3000');
  const clubs = await fetchLocal('/api/clubs');
  const events = await fetchLocal('/api/events');

  console.log(`Found ${clubs.length} clubs and ${events.length} events locally`);

  // Insert clubs
  for (const c of clubs) {
    const payload = {
      id: c.id,
      slug: c.slug,
      name: c.name,
      color: c.color,
      enabled: c.enabled,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    };
    const { error } = await supabase.from('Club').insert(payload, { returning: 'minimal' });
    if (error) console.error('Club insert error', error.message);
  }

  // Insert events
  for (const e of events) {
    const payload = {
      id: e.id,
      title: e.title,
      description: e.description || null,
      location: e.location || null,
      date: e.date, // should be ISO
      time: e.time || null,
      clubId: e.clubId,
      recurrenceFrequency: e.recurrenceFrequency || null,
      recurrenceInterval: e.recurrenceInterval || null,
      recurrenceCount: e.recurrenceCount || null,
      recurrenceUntil: e.recurrenceUntil || null,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    };
    const { error } = await supabase.from('Event').insert(payload, { returning: 'minimal' });
    if (error) console.error('Event insert error', error.message);
  }

  console.log('Migration complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
