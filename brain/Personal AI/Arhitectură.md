---
tags: [proiect/personal-ai]
---

# Arhitectură — Personal AI

Vezi [[Personal AI]].

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind) — `personal-ai/`
- **Neon Postgres** — bază de date dedicată, complet separată de proiectele Supabase existente (vezi [[Decizii]])
- **Anthropic API** (`claude-sonnet-5` implicit, configurabil prin `ANTHROPIC_MODEL`) — motorul de chat, rezumate, predicții
- **Resend** — email-uri (prompt de dimineață, recap de seară)
- **Vercel** — hosting + 2 cron jobs

## Model de date (`migrations/0001_init.sql`)

Single-user, fără `user_id` — o singură persoană folosește sistemul.

- `profile` — rând unic (`id = 'me'`), narativul curent + traits/strengths/weaknesses/goals
- `daily_entries` — mesajele chat-ului, per zi
- `daily_summaries` — un rând pe zi: rezumat, mood, key_actions, ce s-a "învățat"
- `predictions` — istoric de predicții pe orizonturi (3 luni / 1 an / 5 ani)
- `goals` — obiective explicite

## Fluxul zilnic

1. Utilizatorul scrie în `/chat` → `POST /api/chat` → salvează mesajul, cere răspuns de la Claude cu tot narativul curent ca context, salvează răspunsul.
2. Cron `daily-prompt` (06:00 UTC) → email "ce ai făcut azi" cu link spre `/chat`.
3. Cron `daily-summary` (19:00 UTC) → citește conversația zilei, generează JSON structurat (summary/mood/key_actions/learned/updated_narrative) prin Claude, salvează, **rescrie `profile.narrative`**, trimite recap pe email.
4. Duminica, `daily-summary` regenerează și cele 3 predicții (foloseşte narativul + ultimele 14 rezumate + headline-uri de presă via RSS, fără cheie API — vezi `src/lib/news.ts`).

## Auth

Nu e Supabase Auth / NextAuth — un singur `APP_PASSCODE` (env var), sesiune semnată cu `jose` (JWT HS256), cookie httpOnly. Suficient pentru un sistem cu un singur utilizator, fără cont de gestionat.

## Fișiere cheie

- `src/lib/anthropic.ts` — toate prompt-urile (persona de coach, JSON schemas pentru summary/prediction)
- `src/lib/data.ts` — toate query-urile Postgres
- `src/middleware.ts` — protejează tot, exceptând `/login` și `/api/cron/*`
- `vercel.json` — definiția celor 2 cron jobs
