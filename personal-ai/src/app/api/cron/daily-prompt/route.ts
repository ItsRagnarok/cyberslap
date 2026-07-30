import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured — allow (dev / not yet set up)
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const appUrl = process.env.APP_URL ?? "";
  await sendEmail(
    "Ce ai făcut azi?",
    `<div style="font-family:sans-serif;max-width:480px">
      <p>Salut. Ce ai făcut azi și unde te-ai blocat?</p>
      <p><a href="${appUrl}/chat" style="display:inline-block;padding:10px 16px;background:#6a5cff;color:#fff;border-radius:8px;text-decoration:none">Deschide check-in-ul</a></p>
    </div>`
  );

  return NextResponse.json({ ok: true });
}
