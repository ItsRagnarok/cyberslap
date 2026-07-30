import { NextRequest, NextResponse } from "next/server";
import {
  addPrediction,
  getEntriesForDate,
  getProfile,
  getRecentSummaries,
  today,
  updateProfileNarrative,
  upsertDailySummary,
} from "@/lib/data";
import { generateDailySummary, generatePrediction } from "@/lib/anthropic";
import { fetchHeadlines } from "@/lib/news";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

const HORIZONS = ["3 luni", "1 an", "5 ani"];

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const date = today();
  const entries = await getEntriesForDate(date);
  const profile = await getProfile();

  if (entries.length === 0) {
    await sendEmail(
      "N-am avut niciun check-in azi",
      `<p>Nu am nicio conversație de azi de analizat. Mâine începem din nou.</p>`
    );
    return NextResponse.json({ ok: true, skipped: true });
  }

  const result = await generateDailySummary({
    entries: entries.map((e) => ({ role: e.role, content: e.content })),
    previousNarrative: profile.narrative,
  });

  await upsertDailySummary(date, {
    summary: result.summary,
    mood: result.mood,
    key_actions: result.key_actions,
    learned: result.learned,
  });
  await updateProfileNarrative(result.updated_narrative);

  const appUrl = process.env.APP_URL ?? "";
  await sendEmail(
    `Recap ${date}`,
    `<div style="font-family:sans-serif;max-width:520px">
      <h2>Ce am învățat azi despre tine</h2>
      <p>${result.learned}</p>
      <h3>Rezumat</h3>
      <p>${result.summary}</p>
      <h3>Stare</h3>
      <p>${result.mood}</p>
      <p><a href="${appUrl}/dashboard">Vezi tot în dashboard</a></p>
    </div>`
  );

  const isSunday = new Date().getUTCDay() === 0;
  if (isSunday) {
    const [recentSummaries, headlines] = await Promise.all([
      getRecentSummaries(14),
      fetchHeadlines(),
    ]);
    for (const horizon of HORIZONS) {
      const prediction = await generatePrediction({
        narrative: result.updated_narrative,
        recentSummaries: recentSummaries.map((s) => `${s.entry_date}: ${s.summary}`),
        headlines: headlines.map((h) => h.title),
        horizon,
      });
      await addPrediction({ horizon, ...prediction });
    }
  }

  return NextResponse.json({ ok: true });
}
