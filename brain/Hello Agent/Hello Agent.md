---
tags: [hub, proiect]
status: demo, funcțional
---

# Hello Agent

Cel mai simplu exemplu de agent AI posibil — construit ca test: să vedem dacă fluxul "lucrăm la ceva nou aici → apare documentat în brain" chiar funcționează.

Cod: `agents/hello-agent/`.

## Ce e, concret

Un script Node (`agent.mjs`) care trimite o sarcină lui Claude împreună cu 2 unelte (`add`, `get_time`). Diferența față de un simplu chat: Claude poate alege singur să ceară rularea unei unelte înainte să răspundă, iar agentul execută unealta local și îi dă rezultatul înapoi — asta e, în esență, ce înseamnă "agent" față de "chat": bucla tool-use, nu doar întrebare-răspuns.

## Ce NU e

Nu e legat de [[Personal AI]] — proiect separat, de test/învățare. Nu e deployat nicăieri, rulează doar local din linia de comandă.

## Cum îl rulezi

```bash
cd agents/hello-agent
npm install
export ANTHROPIC_API_KEY=sk-...
node agent.mjs "cât e 12 + 30, și cât e ora acum?"
```

## Verificat

Codul a fost testat cu o cheie falsă — totul funcționează până la apelul real către Anthropic (a picat exact unde trebuia, pe autentificare invalidă), deci logica de tool-use loop e corectă. Nu a fost testat încă cu o cheie reală.

## Următorul pas, dacă vrem să-l dezvoltăm

- Unelte mai utile (căutare, citire fișiere, etc.)
- Eventual: integrare cu [[Personal AI]] — un "agent" real care acționează, nu doar discută
