# Personal AI

Sistem privat de analiză zilnică, coaching și predicție a traiectoriei — chat zilnic, rezumat automat, email-uri de notificare, predicții regenerate automat săptămânal.

## Setup local

```bash
npm install
cp .env.example .env.local   # completează valorile
npm run migrate              # aplică schema pe DATABASE_URL
npm run dev
```

## Variabile de mediu necesare

| Variabilă | De unde |
|---|---|
| `DATABASE_URL` | Neon (Postgres) — connection string din dashboard |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `APP_PASSCODE` | alege tu un cod de acces |
| `SESSION_SECRET` | un string aleator lung, ex: `openssl rand -hex 32` |
| `RESEND_API_KEY` | resend.com (plan gratuit) |
| `RESEND_FROM_EMAIL` | ex: `Personal AI <onboarding@resend.dev>` (domeniul default Resend merge fără verificare) |
| `NOTIFY_EMAIL_TO` | adresa ta de email |
| `APP_URL` | URL-ul de producție, pentru linkurile din email |
| `CRON_SECRET` | Vercel îl adaugă automat dacă îl setezi ca env var — protejează rutele de cron |

## Deploy

Proiectul include `vercel.json` cu două cron job-uri: prompt de dimineață (`/api/cron/daily-prompt`) și rezumat de seară (`/api/cron/daily-summary`, care duminica regenerează și predicțiile pe 3 luni / 1 an / 5 ani).
