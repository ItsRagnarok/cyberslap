import { NextResponse } from "next/server";
import { addPrediction, getProfile, getRecentSummaries } from "@/lib/data";
import { generatePrediction } from "@/lib/anthropic";
import { fetchHeadlines } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { horizon } = await req.json();
  if (!horizon || typeof horizon !== "string") {
    return NextResponse.json({ error: "horizon required" }, { status: 400 });
  }

  const [profile, recentSummaries, headlines] = await Promise.all([
    getProfile(),
    getRecentSummaries(14),
    fetchHeadlines(),
  ]);

  const prediction = await generatePrediction({
    narrative: profile.narrative,
    recentSummaries: recentSummaries.map((s) => `${s.entry_date}: ${s.summary}`),
    headlines: headlines.map((h) => h.title),
    horizon,
  });

  await addPrediction({ horizon, ...prediction });
  return NextResponse.json(prediction);
}
