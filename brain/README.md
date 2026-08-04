# Brain

Acesta e vault-ul Obsidian al workspace-ului `cyberslap` — creierul persistent al proiectelor de aici. Trăiește în git, nu pe un disc anume, ca să fie același lucru și pentru tine (în Obsidian) și pentru Claude (aici, în sesiune).

## Cum îl deschizi în Obsidian

1. Ai deja repo-ul clonat local (sau `git clone` acest repo).
2. În Obsidian: **Open folder as vault** → alegi folderul `brain/` din clona locală.
3. Gata — vezi notele, graful de linkuri, tot.

## Cum rămâne sincronizat

E doar git. Două variante:
- **Manual**: `git pull` înainte să deschizi Obsidian, `git add brain/ && git commit && git push` după ce editezi ceva acolo.
- **Automat**: instalezi plugin-ul comunitar **Obsidian Git** (Settings → Community plugins → Browse → "Obsidian Git") și îl configurezi să facă auto-pull/auto-commit periodic. Așa nu te mai gândești la sincronizare.

## Cum funcționează cu Claude

De fiecare dată când lucrăm la ceva nou aici (feature, decizie, infrastructură), actualizez notele relevante din `brain/` și le includ în commit-ul de lucru. Nu e un jurnal separat de ținut manual — se scrie singur, ca parte din sesiune.

## Structură

- [[Cyberslap]] — hub-ul general, pornește de aici
- `Personal AI/` — sistemul de analiză personală (proiectul activ)
- `Cofetăria Sas/` — site-ul de prezentare (context, nu se mai lucrează activ la el)
- `Templates/` — șabloane pentru notă de decizie / jurnal zilnic
