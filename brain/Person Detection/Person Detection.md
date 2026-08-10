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

## Modificări făcute aici

**Responsive, prima trecere** (după aducere): layout-ul original era gândit doar pentru telefon vertical — pe orizontal (landscape) cu înălțime mică, tot ce era sub cameră (butoane, status, contor) putea depăși ecranul și forța scroll, ceea ce strică o aplicație de cameră live. Reparat:
- Pe landscape sub 560px înălțime: layout trece pe orizontal, camera ia tot spațiul rămas, controalele devin o coloană îngustă (168px) lângă ea, titlul și hint-ul de tap se ascund ca să încapă tot.
- `100dvh` în loc de `height:100%` — se comportă corect cu barele de browser mobile care apar/dispar.
- Padding cu `env(safe-area-inset-*)` — nu mai stă nimic sub notch/colțuri rotunjite pe telefoane cu safe area.
- Butoane minim 44px înălțime (prag standard pentru zone de atins pe touch) + `touch-action: manipulation` ca să nu mai apară zoom la dublu-tap din greșeală.
- Verificat cu Playwright pe 5 dimensiuni de ecran (telefon vertical/orizontal, ecran mic, desktop) — fără overflow pe niciuna.

## Următorul pas

Nedefinit — ce urmează depinde de ce mai cere utilizatorul.
