# ⚖️ Rights Navigator — India Law Edition

<p align="center">
  <img src="https://img.shields.io/badge/AI-Legal%20Tech-blueviolet?style=for-the-badge" alt="AI Legal Tech">
  <img src="https://img.shields.io/badge/Civic-Tech-blue?style=for-the-badge" alt="Civic Tech">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
</p>

<h1 align="center">⚖️ Rights Navigator</h1>

<h3 align="center">
Understand Your Rights. Take the Right Action.
</h3>

<p align="center">
An AI-assisted Civic & Legal Technology platform designed to help citizens understand their rights, navigate common legal situations, organize evidence, and discover practical next steps.
</p>

<p align="center">
  <a href="https://rights-navigator-v8pc.onrender.com/">
    🌐 Live Demo
  </a>
  •
  <a href="https://github.com/Maskman014/Rights-Navigator">
    📦 GitHub Repository
  </a>
</p>

---

## 🚀 About The Project

**Rights Navigator** is a Civic-Tech and Legal-Tech platform created to make legal and civic information easier for ordinary citizens to understand and navigate.

Many citizens face problems related to:

- 🛒 Consumer complaints
- 💼 Workplace issues
- 🏠 Tenant and rental disputes
- 📄 Legal notices
- 🏛️ Government procedures
- 📋 RTI applications
- ⚖️ Understanding basic rights

However, legal information is often difficult to understand because it is distributed across laws, government portals, legal documents, and complex terminology.

**Rights Navigator** brings these resources into a simple, citizen-friendly workflow.

The platform helps users:

> **Describe a problem → Understand applicable rights → Identify useful evidence → Explore possible actions → Organize the case**

---

## 🎯 Problem Statement

Citizens often know that something is wrong but don't know:

> ❓ What are my rights?

> ❓ Which law applies to my situation?

> ❓ What evidence should I collect?

> ❓ Where should I complain?

> ❓ What should I do next?

Traditional legal research can be intimidating, time-consuming, and difficult for people without legal knowledge.

### Our Goal

Build a technology platform that transforms complicated legal information into:

- Simple explanations
- Structured legal guidance
- Evidence checklists
- Practical next steps
- Organized case records
- Useful document templates

---

## 💡 Our Solution

Rights Navigator provides a guided legal-navigation workflow.

```text
                 USER
                   │
                   ▼
        Describe Your Problem
                   │
                   ▼
          Select Legal Domain
                   │
                   ▼
          Provide Case Details
                   │
                   ▼
        Evaluate Relevant Rules
                   │
                   ▼
          Understand Your Rights
                   │
                   ▼
        Evidence / Document List
                   │
                   ▼
          Possible Next Actions
                   │
                   ▼
              Save Case
                   │
                   ▼
          Generate Documents
---
##System Architecture

┌──────────────────────────────────────────────┐
│                    USER                      │
│                                              │
│   Problem → Details → Rights → Action       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              REACT FRONTEND                  │
│                                              │
│  • User Interface                            │
│  • Forms                                     │
│  • Legal Results                             │
│  • Case Vault                                │
│  • Evidence Checklist                        │
│  • PDF Generation                            │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              EXPRESS BACKEND                 │
│                                              │
│        API / Authentication / Data           │
└───────────────┬──────────────────────────────┘
                │
       ┌────────┴─────────┐
       │                  │
       ▼                  ▼
┌───────────────┐  ┌─────────────────────────┐
│ Legal Sources │  │       Supabase          │
│               │  │                         │
│ legalSources  │  │ Authentication          │
│    .json      │  │ User Data               │
└───────┬───────┘  └─────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│     Legal Rule Matching     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│    AI Explanation Layer     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Guidance + Evidence +       │
│ Action + Documents          │
└─────────────────────────────┘
