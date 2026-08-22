# What was added, and what's left to wire up

## New files (Phases 2, 3, 4, 5) — safe to drop in, nothing existing was touched

- `src/types/legal.ts` — engine schema (Phase 2)
- `src/utils/sourceMatcher.ts` — deterministic matcher, zero LLM calls (Phase 2)
- `src/utils/factMapping.ts` — bridges your existing checkbox ids (c1, w2, t4...)
  and capitalized Domain values to the engine's canonical keys
- `src/data/legalSources.json` — 4 verified legal records (Phase 5)
- `api/assess.ts` — server-authoritative status endpoint (Phase 3)
- `api/explain.ts` — Gemini explanation layer + citation sanitizer (Phase 4)

**Why only 4 records, and why Tenant has zero:** every record was
independently fact-checked (section numbers, effective dates) against real
sources before inclusion. A 5th record (Model Tenancy Act, Andhra Pradesh)
was deliberately excluded — during verification we found the actual
legislative history didn't clearly support the specific section number and
effective date being claimed, and shipping an unverified "verified" record
would undermine the entire point of this architecture. This means any
Tenant-domain submission will correctly return `unavailable` for now — see
"Fallback Screen" in Step5Action, which already handles this case.

## What's NOT done yet — this is the real remaining work

**I did not modify `Step4Assessment.tsx` or `Step5Action.tsx`.** They
currently render `MOCK_ASSESSMENT` — clearly labeled as such, which is
honest and fine for a demo, but the real pipeline isn't connected to the UI
yet. To finish that wiring, `App.tsx` needs to, on reaching Step 4:

1. Convert `form.domain` (capitalized) to engine format via
   `mapDomainToEngine()` from `factMapping.ts`.
2. Convert `form.confirmedFacts` (checkbox ids) to canonical fact keys via
   `mapConfirmedFactsToEngine()`.
3. Build the incident_date object from `form.incidentYear/Month/Day` and
   `form.datePrecision` (there's already a `formatIncidentDate()` helper in
   `types.ts` you can adapt).
4. POST that payload to `/api/assess`.
5. Take the response's `matched_sources`/`partial_sources`, POST them plus
   a short incident summary (e.g. `form.narrative`) to `/api/explain`.
6. Pass the combined real result into `Step4Assessment` as a prop instead
   of the hardcoded `MOCK_ASSESSMENT` import, and update that component to
   render the real `status`, `rights`, `procedural_steps`, and
   `potential_relief` fields instead of the mock `statutes`/`sources`
   shape (the field names differ — this is the one place a shape mismatch
   needs resolving).

I didn't make this change directly because I can't run `npm run build` or
`npm run dev` in this environment to verify it compiles and renders
correctly — editing a tested, working component blind risks breaking it
in a way a non-coding team can't debug under deadline pressure. This
specific step (#6) is the highest-value thing to spend remaining AI-tool
tokens on, since it's UI-shape reconciliation, not new logic.

## Deployment (Vercel — required for /api routes to work)

1. `npm install` (pulls in the new `@vercel/node` dev dependency).
2. Push this whole folder to a GitHub repo.
3. Go to vercel.com → New Project → import the repo. Vercel auto-detects
   Vite + the `/api` folder — no extra config needed.
4. In Vercel's project settings → Environment Variables, add:
   - `GEMINI_API_KEY` = your free Gemini key
   - `GEMINI_MODEL_ID` = `gemini-2.0-flash` (optional, this is the default)
5. Deploy. The live URL is both your hosted prototype link AND the only
   environment where `/api/assess` and `/api/explain` will actually work —
   plain `npm run dev` (Vite only) will NOT run the API routes locally.
   **Deploy early and test on the live preview URL** rather than fighting
   local serverless dev setup — much simpler for a team without a coder.
   (If you do want local API testing, install the Vercel CLI and run
   `vercel dev` instead of `npm run dev` — but this is optional.)

## Suggested order if tokens/time are tight

1. Deploy as-is right now (Steps 1-2 above) — confirms the build doesn't
   break with the new files added, even before wiring is finished.
2. Do the App.tsx → Step4Assessment wiring (the 6 steps above) — this is
   the one piece that turns "looks real" into "is real."
3. Only then, if time allows: Phase 6 (test suite) and Phase 7 (polish).
   A working, honestly-labeled pipeline beats a polished mock every time
   a judge actually reads the code.
