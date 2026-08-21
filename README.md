# Rights Navigator - India Law Edition

Rights Navigator is an educational and navigational instrument designed to help users evaluate statutory conditions and legal rights based on Indian laws. It provides deterministic legal matching, document checklists, and action plans.

## Features

- **Domain Specific Navigation:** Covers Consumer, Workplace, and Tenancy disputes.
- **Evidence Uploads:** Securely upload and preview supporting documents.
- **Statutory Matcher:** Deterministic assessment against bare acts and rules.
- **Case Vault:** Persistent storage for user cases (scoped by user).
- **PDF Export:** Generate court-grade PDFs of Legal Notices or RTI applications.

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

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Vercel Serverless Functions (`api/` directory)
- **Local Database:** JSON file-based local storage (`users.json`, `savedCases.json`)

## Security

This project includes a lightweight authentication system using local JSON storage for user registration and JWT-like token generation.

> **Note:** This tool is for educational purposes and does not substitute formal legal counsel.
