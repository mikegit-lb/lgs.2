# English 8 — Dönem 1

A static English learning site for Turkish 8th-grade learners. The five first-term units and the outcome labels for Units 2–5 follow the 2026–2027 MEB grade 8 English topic-question distribution. Each unit includes Turkish-supported grammar, a 30-word sprint, reading and speaking practice, exercises, tests, original LGS-style questions, tips and games. Units 2–5 add more grammar, vocabulary, two reading passages, three guided speaking tasks, a saved writing pad aligned with the listed MEB writing outcome, and 10 extra LGS questions (30 total). All units have a replayable timed quest with hearts, streak XP, medals and locally saved records.

Official curriculum source: [MEB 2026–2027 first-term topic-question distribution](https://odsgm.meb.gov.tr/www/1donem-konu-soru-dagilim-tablolari-2026-2027/icerik/1724). The unit outcomes used by the site are E8.2.R1/W1, E8.3.R1/R2/W1, E8.4.R1/W1, and E8.5.R1/R2/W1.

## Run locally

From this folder, start a small local web server:

```powershell
python -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173) in a browser. No build step or package installation is required.

## Project structure

- `index.html` — course home
- `unit-1-friendship/` through `unit-5-the-internet/` — individual unit pages
- `assets/lessons.js` — lesson content, speaking tasks, and answer keys
- `assets/app.js` — shared rendering, scoring, and local progress
- `assets/site.css` — responsive styles

Test and LGS best scores, quest records, points, game matches, page-specific notes and writing drafts are stored in the browser's local storage on the learner's device.
