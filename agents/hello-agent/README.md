# hello-agent

Un agent AI mic, care rulează doar local pe mașina ta — fără deploy, fără costuri în plus față de propria ta cheie Anthropic. Poate fi folosit din linia de comandă sau printr-o interfață web animată.

## Ce face

Are 5 unelte pe care le poate folosi singur, când decide că are nevoie:

- `add`, `get_time` — demo, ca la început
- `list_files`, `read_file`, `search_files` — citește și caută în tot repo-ul (cod + notele din `brain/`), strict limitat la acest repo — nu poate ieși din el

Practic: îl poți întreba lucruri despre proiect ("ce am decis despre baza de date?", "ce e în Personal AI?") și el chiar caută prin fișiere reale înainte să răspundă, nu inventează.

## Rulare — linie de comandă

```bash
npm install
export ANTHROPIC_API_KEY=sk-...
node agent.mjs "ce proiecte sunt în acest repo?"
```

## Rulare — interfață web (locală, animată)

```bash
npm install
export ANTHROPIC_API_KEY=sk-...
npm run web
```

Deschizi `http://localhost:4141` în browser. Chat cu streaming de text (apare cuvânt cu cuvânt), și un indicator vizual animat de fiecare dată când agentul folosește o unealtă (vezi ce unealtă rulează și ce a returnat, live). Responsive — merge și pe mobil dacă deschizi de pe telefon în aceeași rețea locală (`http://<ip-ul-calculatorului>:4141`).

Rulează 100% local — nimic nu e trimis altundeva decât către Anthropic (pentru răspunsurile AI). Nicio bază de date, niciun serviciu extern, niciun cost în plus.

## Structură

```
tools.mjs    — uneltele, comune între CLI și server
agent.mjs    — versiunea CLI
server.mjs   — server local + streaming (SSE) pentru interfața web
public/      — interfața web (HTML/CSS/JS simplu, fără framework)
```

## De ce există

Test: să vedem că fluxul "construim ceva nou aici → apare documentat în brain" funcționează. Vezi nota `Hello Agent.md` din vault (proiect propriu, separat de Personal AI — legat din hub-ul `Cyberslap.md`).
