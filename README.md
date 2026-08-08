# CyberSlap: Bomb Toss 💣

Joc party pentru 2 jucători, pe același WiFi local. Un laptop/PC e „TV"-ul (scor mare, cod de cameră, cod QR), fiecare telefon e o telecomandă — scuturi telefonul (sau apeși ecranul) ca să paseze bomba mai departe înainte să explodeze.

## Cum se joacă

1. Bomba trece de la un jucător la altul. Nimeni nu știe cât mai are fitilul.
2. Cine ține bomba în mână când explodează pierde runda — punctul merge la celălalt.
3. Primul la 3 / 5 / 7 puncte câștigă meciul (se alege pe TV).
4. Fitilul se scurtează progresiv de la o rundă la alta — spre finalul meciului, tensiunea crește.

## Pornire (o singură dată)

Ai nevoie de [Node.js](https://nodejs.org) instalat pe laptopul/PC-ul care va fi „gazda" (TV-ul).

```bash
npm install
npm start
```

Terminalul va afișa ceva de genul:

```
Pe PC/laptop deschide:  http://localhost:3210/tv.html
Telefoanele se conectează la:  http://192.168.1.23:3210/controller.html
```

## Pe fiecare sesiune de joc

1. **Pe laptop/PC**: deschide adresa `.../tv.html` într-un browser (Chrome/Edge/Firefox). Aici apare codul camerei (4 cifre) și un cod QR.
2. **Pe fiecare telefon**: deschide un browser și mergi la adresa `.../controller.html` afișată în terminal (sau scanează codul QR de pe TV — te duce direct acolo). Introdu codul camerei și un nume, apoi apasă „INTRĂ ÎN JOC".
3. Pe iPhone, la prima intrare browserul va cere permisiune pentru senzorul de mișcare — apasă „Activează și continuă".
4. Când ambii jucători apar ca ✅ conectați pe TV, alege Bo3/Bo5/Bo7 și apasă „ÎNCEPE MECIUL".
5. Cine are bomba scutură telefonul (sau apasă ecranul, funcționează la fel) ca s-o paseze.

Telefoanele și laptopul trebuie să fie **pe aceeași rețea WiFi**.

## Dacă telefoanele nu se pot conecta

- Verifică faptul că telefoanele sunt pe **același WiFi** ca laptopul (nu date mobile).
- Firewall-ul laptopului poate bloca portul `3210` — pe Windows, la primul `npm start` apare un pop-up „Allow access" (Rețele private) — acceptă-l. Pe Mac, System Settings → Network → Firewall → permite pentru „node".
- Unele rețele WiFi de birou/facultate izolează dispozitivele între ele („client isolation") — folosește hotspot-ul unui telefon sau un router de acasă în loc.
- Poți schimba portul cu `PORT=8080 npm start` dacă 3210 e ocupat.

## Structură

- `server.js` — server Node (Express + Socket.IO): ține scorul, camerele, deține autoritatea asupra „fitilului" (timpul exact până la explozie e ascuns de la clienți, ca să nu poată fi „calculat").
- `public/tv.html` — ecranul mare (scor, cod cameră, cod QR, animația rundei).
- `public/controller.html` — telecomanda de telefon (join, permisiuni senzor, ecranul de joc).
