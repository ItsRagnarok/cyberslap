---
tags: [hub, proiect]
status: adus dintr-o sesiune anterioară, funcțional
---

# Person Detection

Aplicație web dintr-o pagină: pornește camera și încadrează persoanele din cadru cu eticheta "HUMAN" + procent de încredere. Detecție, nu identificare — nu recunoaște *cine* ești, doar *că* ești o persoană. Tot rulează local, în browser, cu TensorFlow.js (COCO-SSD + BlazeFace) — nicio imagine nu pleacă spre vreun server.

Cod: `person-detection/`.

## De unde vine

Construită inițial într-o sesiune separată de Claude Code ("Aplicație de recunoaștere persoane cu cameră", branch original `claude/person-detection-camera-app-epn14h`, tot în repo-ul `cyberslap`). Utilizatorul a cerut să fie adusă aici și continuată, în locul sesiunii vechi.

## Ce avea deja, la aducere

- Comutare cameră față/spate
- Încadrare inteligentă pe față/corp
- Procent de încredere pe eticheta HUMAN
- Tap oriunde pe imagine → clasifică obiectul de-acolo
- Fix-uri anterioare: WebGL pe iOS Safari, buton de cameră blocat dacă modelul nu se încarcă, hardening la eșecuri silențioase de detecție

## Ce NU e

Nu e legat de [[Personal AI]] sau [[Hello Agent]] — proiect separat.

## Următorul pas

Nedefinit încă — adus aici la cererea utilizatorului, urmează să se stabilească ce se dezvoltă mai departe.
