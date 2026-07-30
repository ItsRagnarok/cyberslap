import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { passcode } = await req.json();
  if (!process.env.APP_PASSCODE) {
    return NextResponse.json({ error: "APP_PASSCODE not configured" }, { status: 500 });
  }
  if (passcode !== process.env.APP_PASSCODE) {
    return NextResponse.json({ error: "invalid passcode" }, { status: 401 });
  }
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
