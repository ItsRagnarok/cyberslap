---
tags: [hub, proiect]
status: demo, funcțional, cu interfață web
---

# Hello Agent

Cel mai simplu exemplu de agent AI posibil — pornit ca test: să vedem dacă fluxul "lucrăm la ceva nou aici → apare documentat în brain" chiar funcționează. A crescut de-atunci în unelte reale.

Cod: `agents/hello-agent/`.

## Ce e, concret

Un loop unde Claude poate alege singur să ceară rularea unei unelte înainte să răspundă, în loc să răspundă direct — asta e diferența dintre "agent" și "chat".

**Unelte disponibile:**
- `add`, `get_time` — demo, de la început
- `list_files`, `read_file`, `search_files` — citesc și caută în tot repo-ul (cod + `brain/`), strict limitate la acest folder (verificat: o cale de tip `../../etc/passwd` e refuzată explicit)

Practic, acum poate răspunde la întrebări reale despre proiect ("ce am decis despre baza de date?") citind fișierele adevărate, nu inventând.

**Două moduri de rulare:**
- CLI (`agent.mjs`) — o sarcină, un răspuns, în terminal
- Web local (`server.mjs` + `public/`) — interfață de chat animată, cu streaming de text (apare cuvânt cu cuvânt) și un indicator vizual pentru fiecare apel de unealtă (nume + input + rezultat, live). Rulează doar pe `localhost` — nimic deployat, niciun cost în plus față de cheia Anthropic.

## Ce NU e

Nu e legat de [[Personal AI]] — proiect separat, de test/învățare. Nu e deployat nicăieri — rulează exclusiv local.

## Cum îl rulezi

```bash
cd agents/hello-agent
npm install
export ANTHROPIC_API_KEY=sk-...
npm run web            # interfață web, pe http://localhost:4141
# sau:
node agent.mjs "ce proiecte sunt în acest repo?"   # varianta CLI
```

## Verificat

- CLI-ul și serverul au fost testate cu o cheie falsă — totul funcționează până la apelul real către Anthropic (pică exact pe autentificare, cum trebuie), deci logica e corectă.
- Uneltele `list_files`/`search_files`/`read_file` au fost testate direct: găsesc corect notele din `brain/`, caută "Neon" în tot repo-ul și dau rezultate reale, citesc fișiere corect, și blochează explicit orice încercare de a ieși din repo.
- Nu a fost încă testat cap-coadă cu o cheie Anthropic reală (utilizatorul rulează local, pe mașina lui).

## Următorul pas, dacă vrem să-l dezvoltăm

- Testare reală cu cheie Anthropic validă, de către utilizator, local
- Eventual: integrare cu [[Personal AI]] — un "agent" real care acționează, nu doar discută
- Unelte suplimentare, dacă apare nevoie — deocamdată intenționat doar unelte de citire, fără execuție de comenzi, din motive de siguranță
