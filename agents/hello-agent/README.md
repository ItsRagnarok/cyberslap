# hello-agent

Cel mai mic exemplu posibil de agent AI: un loop unde Claude poate alege singur să folosească niște unelte (tools) înainte să răspundă, în loc să răspundă direct.

## Ce face

Primește o sarcină ca text, o trimite lui Claude împreună cu 2 unelte disponibile (`add`, `get_time`). Dacă Claude decide că are nevoie de o unealtă, agentul o execută local și îi trimite rezultatul înapoi — asta se repetă până Claude dă un răspuns final în text.

## Rulare

```bash
npm install
export ANTHROPIC_API_KEY=sk-...
node agent.mjs "cât e 12 + 30, și cât e ora acum?"
```

Fără argument, rulează cu o sarcină demo predefinită.

## De ce există

Test rapid: să vedem că fluxul "construim ceva nou aici → apare documentat în brain" chiar funcționează. Vezi nota `Hello Agent.md` din vault (proiect propriu, separat de Personal AI — legat din hub-ul `Cyberslap.md`).
