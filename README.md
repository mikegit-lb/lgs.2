# English 8 — Dönem 1

A static English learning site for Turkish 8th-grade learners. It includes a course home page and five unit folders, with expanded grammar notes, vocabulary challenges, three reading passages with comprehension questions, guided speaking tasks, two exercise sets, a scored unit test, 20 original LGS-style questions, study tips, a matching game, and a five-round vocabulary sprint in each unit. Teen Life includes extra model-supported daily-hobby speaking practice in the Simple Present.

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

Test and LGS best scores, points, game matches, and page-specific notes are stored separately in the browser's local storage on the learner's device.
