# person-detection

Aplicație web dintr-o singură pagină: pornește camera și încadrează persoanele detectate în cadru cu eticheta "HUMAN" (plus procent de încredere). Rulează 100% în browser — folosește TensorFlow.js cu modelele COCO-SSD (detecție de obiecte, inclusiv persoane) și BlazeFace (poziționare față, doar pentru încadrare — nu identifică cine ești, doar că ești o persoană). Nicio imagine nu pleacă vreodată către un server.

Adus din sesiunea/branch-ul original `claude/person-detection-camera-app-epn14h` (aceeași funcționalitate, doar mutat aici ca folder propriu, lângă `personal-ai/` și `agents/hello-agent/`).

## Rulare

Fișier static, fără build — deschizi `index.html` direct în browser, sau îl servești cu orice server static:

```bash
cd person-detection
npx serve .
```

Cere permisiune de acces la cameră (normal, din browser).

## Funcții existente

- Comutare cameră față/spate
- Încadrare inteligentă pe față/corp
- Procent de încredere afișat pe eticheta HUMAN
- Tap oriunde pe imagine → clasifică obiectul de-acolo

## Deploy

`vercel.json` e configurat ca site static simplu (fără framework), Root Directory la deploy: `person-detection`.
