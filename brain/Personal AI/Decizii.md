---
tags: [proiect/personal-ai, decizii]
---

# Decizii — Personal AI

Vezi [[Personal AI]]. Ordine cronologică.

## Proiect separat de site-ul cofetăriei
Repo-ul `cyberslap` conținea doar site-ul [[Cofetăria Sas]], neînrudit. Alegere: cod complet separat (`personal-ai/`), nu amestecat, nu înlocuiește nimic din site-ul existent.

## Neon în loc de Supabase, pentru bază de date
Contul Supabase al utilizatorului avea deja 2 proiecte active pe planul gratuit (ALPORA.RO, FPV ACADEMY) — limita liberă. Prima încercare: tabele izolate (`pai_*`, RLS) direct în proiectul FPV ACADEMY. **Utilizatorul a respins asta** — teamă justificată de a nu strica un proiect existent prin amestec, chiar dacă izolat logic. Am șters imediat acele tabele (rollback curat, fără date pierdute) și am trecut pe **Neon.tech**, cont separat, bază de date complet independentă. Lecție: separarea fizică (alt provider) contează mai mult pentru încredere decât separarea logică (schema/prefix), chiar dacă tehnic ambele sunt sigure.

## Autentificare: passcode, nu cont complet
Sistem cu un singur utilizator — nu are sens o infrastructură de auth completă (signup, recuperare parolă etc.). Un `APP_PASSCODE` + cookie de sesiune semnat e suficient și mult mai simplu de operat.

## Canal de notificare: email, nu Telegram
Telegram ar fi cerut creare de bot + token; email funcționează imediat cu adresa existentă a utilizatorului. Rămâne opțiune de adăugat ulterior, nu blocantă acum.

## Predicțiile sunt estimări, nu profeții
Cerința inițială: "prezice când și cum voi fi milionar". Design ales: promptul de predicție cere explicit incertitudine numită, pattern-uri observate concret, și bifurcații care ar schimba rezultatul — niciodată afirmații deterministe. Un sistem care garantează succesul ar fi fals și, pe termen lung, ar induce în eroare exact persoana pe care trebuie s-o ajute.

## Cheile secrete nu circulă prin chat
`ANTHROPIC_API_KEY` (și, când e cazul, alte chei sensibile) se pun direct în Vercel, niciodată trimise în conversație.
