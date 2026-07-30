import { sql } from "./db";

export async function getProfile() {
  const rows = await sql`select * from profile where id = 'me'`;
  return rows[0] as unknown as {
    narrative: string;
    traits: Record<string, unknown>;
    strengths: string[];
    weaknesses: string[];
    goals: string[];
    updated_at: string;
  };
}

export async function updateProfileNarrative(narrative: string) {
  await sql`update profile set narrative = ${narrative}, updated_at = now() where id = 'me'`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function getEntriesForDate(date: string) {
  const rows = await sql`
    select role, content, created_at from daily_entries
    where entry_date = ${date}
    order by created_at asc
  `;
  return rows as unknown as { role: "user" | "assistant"; content: string; created_at: string }[];
}

export async function addEntry(date: string, role: "user" | "assistant", content: string) {
  await sql`
    insert into daily_entries (entry_date, role, content)
    values (${date}, ${role}, ${content})
  `;
}

export async function getRecentSummaries(limit = 7) {
  const rows = await sql`
    select entry_date, summary, mood, learned from daily_summaries
    order by entry_date desc
    limit ${limit}
  `;
  return rows as unknown as { entry_date: string; summary: string; mood: string; learned: string }[];
}

export async function upsertDailySummary(date: string, data: {
  summary: string;
  mood: string;
  key_actions: string[];
  learned: string;
}) {
  await sql`
    insert into daily_summaries (entry_date, summary, mood, key_actions, learned)
    values (${date}, ${data.summary}, ${data.mood}, ${JSON.stringify(data.key_actions)}, ${data.learned})
    on conflict (entry_date) do update set
      summary = excluded.summary,
      mood = excluded.mood,
      key_actions = excluded.key_actions,
      learned = excluded.learned
  `;
}

export async function getDailySummaries(limit = 30) {
  const rows = await sql`
    select * from daily_summaries order by entry_date desc limit ${limit}
  `;
  return rows;
}

export async function addPrediction(data: {
  horizon: string;
  narrative: string;
  confidence: string;
  focus_areas: string[];
}) {
  await sql`
    insert into predictions (horizon, narrative, confidence, focus_areas)
    values (${data.horizon}, ${data.narrative}, ${data.confidence}, ${JSON.stringify(data.focus_areas)})
  `;
}

export async function getLatestPredictions() {
  const rows = await sql`
    select distinct on (horizon) * from predictions
    order by horizon, created_at desc
  `;
  return rows;
}
