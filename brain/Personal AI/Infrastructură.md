---
tags: [proiect/personal-ai, infra]
---

# Infrastructură — Personal AI

Vezi [[Personal AI]] și [[Arhitectură]].

## Conturi / servicii

| Serviciu | Rol | Status |
|---|---|---|
| Neon.tech | `DATABASE_URL` | ⏳ utilizatorul trebuie să creeze contul + proiectul și să trimită connection string-ul |
| console.anthropic.com | `ANTHROPIC_API_KEY` | ⏳ de pus direct în Vercel, nu în chat |
| Resend.com | `RESEND_API_KEY` | ⏳ cont gratuit, de creat |
| GitHub — `itsragnarok/cyberslap` | cod | ✅ push pe `claude/personal-ai-analysis-system-ymtka5` |
| Vercel | deploy + cron | ⏳ nefăcut încă — așteaptă `DATABASE_URL` |

## Ce a rămas de făcut ca să fie live

1. Utilizator: connection string Neon.
2. Aplicare `personal-ai/migrations/0001_init.sql` pe DB-ul Neon (`npm run migrate`).
3. Deploy pe Vercel (proiect nou, root directory = `personal-ai/`).
4. Setare env vars în Vercel: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `APP_PASSCODE`, `SESSION_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NOTIFY_EMAIL_TO`, `APP_URL`. `CRON_SECRET` — Vercel îl poate genera/atașa automat pentru cron jobs.
5. Verificare manuală: login cu passcode, un mesaj în chat, declanșare manuală a rutelor `/api/cron/*` (au nevoie de header `Authorization: Bearer $CRON_SECRET` odată setat).

## Note despre Supabase (context, nu se folosește în acest proiect)

Contul Supabase al utilizatorului (`findnaza@gmail.com`) are 2 proiecte pe planul gratuit: **ALPORA.RO** și **FPV ACADEMY** — ambele neînrudite cu Personal AI, nu se ating. Detalii despre de ce nu s-a folosit Supabase aici: [[Decizii]].
