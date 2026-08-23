# Rights Navigator - India Law Edition

Rights Navigator is an educational and navigational instrument designed to help users evaluate statutory conditions and legal rights based on Indian laws. It provides deterministic legal matching, document checklists, and action plans.

**Live demo:** https://rights-navigator-v8pc.onrender.com/

> ⚠️ **Known issue:** the deployment above runs `server.js`, whose `/api/assess`
> and `/api/explain` routes are still stub handlers — they return canned
> placeholder JSON, not real results. The real matching/explanation logic
> exists (`api/assess.js`, `api/explain.js`) but isn't wired into the running
> server yet. See `INTEGRATION_NOTES.md` for the full picture and the fix.

## Features

- **Domain Specific Navigation:** Covers Consumer, Workplace, and Tenancy disputes.
- **Statutory Matcher:** Deterministic assessment against 16 verified bare-act/rule records (Consumer, Workplace, and Tenancy — all three domains now have coverage).
- **Plain-Language Explanation:** Optional Gemini-powered layer that phrases the server's verified matches in plain language, with citation sanitization so it can never introduce an unverified source.
- **Case Vault:** Persistent storage for user cases (scoped by user), with save/view/delete.
- **PDF Export:** Generate PDFs of Legal Notices or RTI applications (via `jspdf`).
- **Document Checklist:** Domain-specific evidence checklist per case.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start the Development Server:**
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

   ⚠️ As of now, `/api/*` calls made through this dev server will fail (404 /
   500) — see "Known Issues" below. Auth, assessment, explanation, and case
   saving will not work end-to-end from `npm run dev` alone.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Lucide React, jsPDF
- **Backend (as currently deployed on Render):** a single Express server, `server.js`, started with `npm start`. It handles `/api/auth` for real (backed by Supabase) but returns stub/placeholder data for `/api/assess`, `/api/explain`, and `/api/cases`.
- **Backend (written but not wired in):** Vercel-style serverless functions in `api/` (`assess.js`, `explain.js`, `auth.js`, `cases.js`) containing the real deterministic matcher and Gemini explanation logic. These are not what's currently running in production — see `INTEGRATION_NOTES.md`.
- **Database:** Supabase (`users` table) for authentication. Case Vault persistence (`api/cases.js`) is written against MongoDB-style calls that don't currently resolve — see Known Issues.
- **Legal Data:** `src/data/legalSources.json` — 16 fact-checked records across Consumer, Workplace, and Tenancy (state-specific tenancy acts for MP, Delhi, Maharashtra, Karnataka, and Tamil Nadu).

## Known Issues

These are real, currently-existing gaps — not hypothetical risks. See `INTEGRATION_NOTES.md` for details and the fix plan for each:

1. **Production `/api/assess` and `/api/explain` are stubs.** `server.js` (what Render actually runs) never calls the real matcher or Gemini — it returns hardcoded placeholder JSON.
2. **Local dev API is broken.** `vite.config.ts`'s dev middleware loads `./api/${endpoint}.ts`, but the actual files are `.js` — so none of `/api/assess`, `/api/explain`, `/api/cases`, `/api/auth` resolve under `npm run dev`.
3. **`api/cases.js` won't run even if invoked.** It imports `connectDB` from `./db` and a `Case` model from `./models` — `./db` actually exports a Supabase client (no `connectDB` export), and `./models` doesn't exist in the project at all.
4. **Two disconnected backend implementations exist side by side** (`api/*.js` vs. `server.js`) with different data stores (Supabase vs. an intended-but-missing Mongo layer) and different behavior for the same routes.

## Security

Authentication is handled by Supabase (`SUPABASE_URL` / `SUPABASE_ANON_KEY`), with SHA-256 password hashing and a base64-encoded token. `src/data/users.json` and `src/data/savedCases.json` are unused leftovers from an earlier local-JSON-storage version — both are empty and already gitignored.

> **Note:** This tool is for educational purposes and does not substitute formal legal counsel.
