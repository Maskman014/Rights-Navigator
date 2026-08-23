# Rights Navigator - India Law Edition

Rights Navigator is an educational and navigational instrument designed to help users evaluate statutory conditions and legal rights based on Indian laws. It provides deterministic legal matching, document checklists, and action plans.

**Live demo:** https://rights-navigator-v8pc.onrender.com/

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

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Lucide React, jsPDF
- **Backend:** Express server (`server.js`), plus a set of Vercel-style serverless functions in `api/` for deployment flexibility.
- **Database:** Supabase for authentication and user data.
- **Legal Data:** `src/data/legalSources.json` — fact-checked records across Consumer, Workplace, and Tenancy domains (state-specific tenancy acts for MP, Delhi, Maharashtra, Karnataka, and Tamil Nadu).

## Security

Authentication is handled by Supabase, with SHA-256 password hashing and token-based sessions.

> **Note:** This tool is for educational purposes and does not substitute formal legal counsel.
