import { NextRequest, NextResponse } from "next/server";
import { addEntry, getEntriesForDate, getProfile, today } from "@/lib/data";
import { chatReply } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function GET() {
  const date = today();
  const entries = await getEntriesForDate(date);
  return NextResponse.json({ date, entries });
}

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const date = today();
  await addEntry(date, "user", message);

  const [profile, entries] = await Promise.all([getProfile(), getEntriesForDate(date)]);
  const reply = await chatReply(
    entries.map((e) => ({ role: e.role, content: e.content })),
    profile.narrative
  );

  await addEntry(date, "assistant", reply);
  return NextResponse.json({ reply });
}
