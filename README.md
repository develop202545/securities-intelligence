# Securities Intelligence Platform

A browser-based research workspace for Securities Regulation final-exam company assessments. It helps you screen candidate companies, log evidence with source provenance, map facts to the elements of each claim, test causation, and track whether a 12–15-page paper is ready to submit.

> **Educational tool, not legal advice.** Scores are research aids, not estimates of liability, and are not SEC ratings. The built-in authority library is **unverified**: read every case, statute and release yourself before citing it. Follow your professor's AI-use and collaboration rules.

**Live version:** `https://<your-github-username>.github.io/securities-intelligence/` (once GitHub Pages is turned on; see [Deploying to GitHub Pages](#deploying-to-github-pages)).

---

## Contents

- [What it does](#what-it-does)
- [Quick start (no install)](#quick-start-no-install)
- [Run from source](#run-from-source)
- [Scripts](#scripts)
- [Using the app](#using-the-app)
- [Your data: where it lives and how to back it up](#your-data-where-it-lives-and-how-to-back-it-up)
- [Demonstration dataset (fictional)](#demonstration-dataset-fictional)
- [Features that only work inside Claude](#features-that-only-work-inside-claude)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Project structure](#project-structure)
- [Research-engine tools (optional, Python)](#research-engine-tools-optional-python)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## What it does

| Area | What you can do |
|---|---|
| **Command Center** | Phase tracker, readiness checklist, key numbers, next actions |
| **Company Intelligence** | Screen and rank candidate companies with weighted, evidence-linked criteria; compare finalists side by side |
| **Regulatory Analysis** | Create issues from claim templates (Rule 10b-5, SEC enforcement, §§ 11, 12(a)(2), 5, insider trading, control persons, § 16(b), § 14(a), manipulation, SEC-only compliance); grade each element; doctrine and statute tables; private-remedy vs. SEC-enforcement map |
| **Disclosure Intelligence** | Track filings and statements; compare what the company said on the same topic over time |
| **Financial Forensics** | Record financial metrics and ratios with sources |
| **Litigation Strategy** | Claims vs. defenses, chronology, price events with raw and market-adjusted returns |
| **Evidence Vault** | Evidence register with verification status, sources, legal authorities, verification log |
| **Paper Production** | Outline, red-team checklist, citation readiness |
| **Audit** | Nine automatic integrity checks (e.g., a "verified fact" without a source or pinpoint, a high-confidence conclusion resting on an unsupported element) |
| **Exam Activation** | Paste the assignment (company list, perspective, page limit, AI-use policy) when it arrives |
| **Data & Backup** | JSON export/import, CSV export/import per table, fictional sample download, storage status |

Two separate workspaces: **Demo** (fictional, pre-loaded) and **Real** (yours, starts empty). Records can't cross between them by accident.

---

## Quick start (no install)

**Option A — use the hosted version.** Open the GitHub Pages link above. Your data stays in your own browser.

**Option B — single offline file.** Download `securities-intelligence.html` from the repository's **Releases** page (or build it yourself with `npm run build:standalone`) and double-click it. It works without internet; fonts fall back to system fonts.

---

## Run from source

**Requirements:** [Node.js](https://nodejs.org/) 18.18 or later (20 LTS recommended) and npm (included with Node). Git is optional.

```bash
# 1. Get the code
git clone https://github.com/<your-github-username>/securities-intelligence.git
cd securities-intelligence
#    (or: download the ZIP from GitHub → "Code" → "Download ZIP", unzip, and cd into the folder)

# 2. Install dependencies (Vite for serving/building, jsdom for tests)
npm install

# 3. Start the development server (opens http://localhost:5173)
npm run dev
```

To build and preview the production version:

```bash
npm run build      # outputs to dist/
npm run preview    # serves dist/ at http://localhost:4173
```

`dist/` is plain static files. You can open it with any static web server or copy it to any static host.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with live reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run build:standalone` | Build, then inline everything into `standalone/securities-intelligence.html` (one offline file) |
| `npm test` | Functional test of the source: loads the real app in jsdom and drives the UI (~160 checks) |
| `npm run test:dist` | Build, then run the same test against `dist/` |
| `npm run sample-data` | Regenerate `public/sample-data/SAMPLE_DATASET_FICTIONAL.json` from the app's demo builder |

---

## Using the app

1. **Learn the controls in the Demo workspace** (default on first open). Everything there is fictional and clearly bannered.
2. **Switch to Real** (top bar) when you start your own research.
3. **Load the authority library**: *Evidence Vault → Authorities → Add authority library (84)*. Every record starts as *verification pending*; changing a record's validity status requires you to write down the basis.
4. **Add your course doctrines**: *Regulatory Analysis → Doctrines → Add doctrine*, or import a doctrines CSV/JSON (see [docs/COURSE_INDEX_FORMAT.md](docs/COURSE_INDEX_FORMAT.md)).
5. **When the final arrives**: *Exam Activation* → paste the professor's instructions and company list, then screen companies in *Company Intelligence*.
6. **For each issue**: *Regulatory Analysis → Issues → New issue* from a claim template. Grade every element with one of six labels (*Supported by verified evidence*, *Supported by reasonable inference*, *Contested*, *Unsupported*, *Not established from available sources*, *Not applicable*) and link evidence.
7. **Before you write**: run *Audit*, then work through *Paper Production*'s red-team checklist.

### Import and export

- **Export:** *Data & Backup → Export real/demo workspace (JSON)* saves the whole active workspace as `securities-intelligence-<workspace>-<date>.json`. CSV export is available for each table.
- **Import:** *Data & Backup → Import* accepts a workspace JSON (a preview shows counts, warnings and migrations; then choose to add new records, add and update by ID, or replace the workspace), research-engine JSON files (`{"evidence":[…]}` or `{"authorities":[…]}`), or a CSV for one table.
- Demo-labelled records (IDs starting `DEMO-`) are blocked from the Real workspace.
- Older exports are migrated forward automatically (schema 0.9.0 → 1.0.0).

---

## Your data: where it lives and how to back it up

- **Run on its own** (hosted page, `npm run dev`, or the standalone file), the app saves to your browser's **localStorage**. That data stays on your device and is never sent anywhere. Each browser, device and profile has its own separate copy.
- Clearing site data, private/incognito windows and switching browsers all lose or hide that data. **Export a JSON backup after every session.**
- Sites on the same `*.github.io` origin share localStorage. If you host several apps under one GitHub account, back up regularly anyway.
- Don't commit your real workspace exports to a public repository. `.gitignore` already excludes `my-data/` and files named `securities-intelligence-real-*.json`.

---

## Demonstration dataset (fictional)

`public/sample-data/SAMPLE_DATASET_FICTIONAL.json` (also available in-app: *Data & Backup → Download fictional sample dataset*).

- **Everything in it is invented:** four fictional companies with fictional tickers and figures, fictional people, filings, statements, prices and findings. Any resemblance to real entities is coincidental.
- All IDs start with `DEMO-`. The file carries `"export_note": "FICTIONAL DEMONSTRATION DATA…"`. The app shows a demo banner whenever it is loaded.
- Use it to learn the workflow or to test imports. Don't cite it.

---

## Features that only work inside Claude

This app was first built as a Claude artifact. The exported version is fully functional on its own. The table below is the complete list of differences.

| Feature | Inside Claude | Exported / GitHub version |
|---|---|---|
| Storage | Artifact database: survives reloads and can be shared with invited editors | Browser localStorage (per browser/device). Use JSON export/import to move or share data |
| File downloads | Claude's download capability | Normal browser download (Blob link). If a browser blocks it, the app shows a copy-to-clipboard dialog |
| Claude reading your saved workspace in later chats | Possible in the author's Claude Project | Not available. Export JSON and give it to whatever assistant or tool you use |
| AI research assistance (finding filings, drafting analysis) | Done by Claude in conversation, outside this app | Not part of the app. The app never calls an AI service or any external API |
| Course doctrine index built from one student's private notes | Included in the author's copy | **Not distributed.** Add your own doctrines (see [docs/COURSE_INDEX_FORMAT.md](docs/COURSE_INDEX_FORMAT.md)) |

The storage adapter in `public/js/store.js` checks for `window.claude`. When it's absent (always, outside Claude), the app uses localStorage. No API keys, accounts or environment variables are needed.

The app also cannot fetch EDGAR filings or market prices itself, inside or outside Claude. You enter or import data from sources you have opened.

---

## Deploying to GitHub Pages

The repository includes `.github/workflows/deploy.yml`. On every push to `main` it installs dependencies, runs the tests, builds, and publishes `dist/` to GitHub Pages.

One-time setup after your first push:

1. On GitHub, open the repository → **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open the **Actions** tab. Re-run "Deploy to GitHub Pages" if it already ran, or push any commit.
4. When it finishes, the site URL appears in **Settings → Pages** and in the workflow run summary. It is usually `https://<username>.github.io/<repository-name>/`.

The build uses relative paths (`base: "./"` in `vite.config.js`), so it works under any repository name without changes.

---

## Project structure

```
securities-intelligence/
├── index.html                    # App shell; loads the scripts below in order
├── public/
│   ├── css/app.css               # All styles
│   ├── js/
│   │   ├── supplemental.js       # Authority library (84 records, UNVERIFIED)
│   │   ├── course.js             # Course index — empty in this distribution
│   │   ├── schema.js             # Entities, enums, claim templates, migrations, validation
│   │   ├── store.js              # Persistence (localStorage; Claude adapter), downloads
│   │   ├── demo.js               # Fictional demo workspace builder
│   │   ├── core.js               # State, helpers, tables/forms, scoring, audit, import/export
│   │   └── views.js              # All screens, charts, dialogs, event handling
│   ├── sample-data/SAMPLE_DATASET_FICTIONAL.json
│   └── favicon.svg
├── scripts/
│   ├── build-standalone.mjs      # dist/ → one self-contained HTML file
│   └── generate-sample-data.mjs  # rebuilds the fictional sample JSON
├── tests/functional.test.cjs     # jsdom UI test (npm test)
├── research-engine/              # optional Python tools, schemas, CSV templates
├── docs/
├── .github/workflows/deploy.yml  # GitHub Pages deployment
├── vite.config.js
└── package.json
```

**Why not React?** The application is ~300 KB of working, tested vanilla JavaScript: a small rendering layer, handler tables, and hash routing. A React rewrite would mean re-implementing every screen and would risk breaking tested behaviour, with no benefit to users. Vite is used for the dev server, production build and Pages deployment. The scripts are served as classic ordered `<script>` tags from `public/` because they share globals.

---

## Research-engine tools (optional, Python)

`research-engine/` contains command-line helpers that work with the app's import format:

```bash
cd research-engine
python3 -m pip install -r requirements.txt          # jsonschema (validate.py only)

# Validate evidence or authority files against the JSON Schemas (and run the self-test)
python3 tools/validate.py evidence examples/demo_evidence.json
python3 tools/validate.py selftest

# JSON <-> CSV for spreadsheet editing
python3 tools/convert.py to-csv evidence examples/demo_evidence.json evidence.csv

# Single-firm market-model event window (FICTIONAL example prices)
python3 tools/event_study.py examples/DEMO_synthetic_prices.csv \
  --event 2025-06-02 --est-start 2025-01-02 --est-end 2025-04-30 --window=-1,1
```

The event-study script is a teaching estimate (market model, one firm), not an expert opinion. Check for confounding news and event timing.

---

## Testing

```bash
npm test           # source
npm run test:dist  # production build
```

The test loads the actual scripts into jsdom and drives the interface. It covers every tab in every scope, CRUD, filters, scoring, the audit, imports (including blocked demo IDs and the research-engine format), exports, storage modes (database, localStorage and fallback), and checks that every control has a handler. The test exits non-zero on failure, and the Pages workflow won't deploy a failing build.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Blank page when opening `dist/index.html` directly | Use `npm run preview`, a static server, or the standalone single file |
| "Changes are only kept in this browser" | Expected outside Claude. Export JSON backups |
| My data disappeared | You're in a different browser/profile, or site data was cleared. Import your last JSON export |
| Pages site shows 404 | Settings → Pages → Source must be **GitHub Actions**; check the Actions run for errors |
| Fonts look different offline | Fonts load from Google Fonts. Offline, system fonts are used |

---

## License

MIT. See [LICENSE](LICENSE). Change the copyright line if you want your name on it.
