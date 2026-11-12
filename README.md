# Securities Intelligence — GitHub Pages build

This folder **is the website**. Put every file at the root of the `gh-pages` branch, next to `index.html`.

| File | Purpose |
|---|---|
| `index.html` | Page shell; loads the files below with relative `./` paths |
| `app.css` | Styles |
| `supplemental.js`, `course.js`, `schema.js`, `store.js`, `demo.js`, `core.js`, `views.js` | The application (loaded in this order) |
| `favicon.svg` | Tab icon |
| `SAMPLE_DATASET_FICTIONAL.json` | Fictional demo data you can import (Data & Backup → Import). Everything in it is invented |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |

Data is saved in each visitor's own browser (localStorage). Use **Data & Backup → Export** to make backups.
Fonts load from Google Fonts; if they're unavailable, system fonts are used.
Educational tool — not legal advice. The authority library is unverified.
