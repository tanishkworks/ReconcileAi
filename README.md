# ReconcileAI — Autonomous Bank & Invoice Ledger with Morse Observability

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688)](https://fastapi.tiangolo.com/)
[![Morse AI](https://img.shields.io/badge/Morse-SDK%20v0.8.0-3b82f6)](https://morsehq.dev)
[![Anti-Slop UI](https://img.shields.io/badge/Design-Swiss%20Archival%20Ledger-141413)](https://github.com/nutlope/hallmark)

ReconcileAI is an autonomous B2B financial reconciliation workbench built to stress-test **Morse (`morsehq.dev`) Observability**. Accounting workflows require zero-tolerance for hallucinations: invoices must balance mathematically against line items, and disbursements must be audited against real bank ledger records.

---

## 🏛 Key Architectural Features

1. **Deterministic Floor + LLM Multi-Span Agent (`invoice-reconciliation-agent`)**:
   - **Span 1 (`parse_invoice`)**: Structured OCR parsing of messy invoices.
   - **Span 2 (`verify_math`)**: Deterministic Python audit (`sum(line_items) + tax == stated_total`). If arithmetic fails, triggers up to 2 retry spans with self-correction prompts. If unrecoverable, explicitly records `morse_ai.set_outcome(success=False, outcome="math_audit_failed")` and tracks wasted retry tokens.
   - **Span 3 (`match_ledger`)**: Bank deposit matching via fuzzy vendor normalization and invoice references. Distinguishes exact zero-variance reconciliations from valid 10% TDS (Tax Deducted at Source under Section 194J) withholdings.
2. **Honest Unit Economics Telemetry**:
   - Compares **Raw Cost per API Call** ($0.00027) vs. **Canonical Cost per Confirmed Outcome** ($0.00034), revealing a **+25.9% "Ghost Cost" margin** hidden in failed attempts and retry loops.
3. **Delayed Human-in-the-Loop (HITL) Outcome Confirmation**:
   - Interactive UI allowing financial controllers to confirm or reject flagged TDS shortfalls, dynamically updating trace outcome verdicts.
4. **Anti-AI-Slop Swiss Archival Ledger UI**:
   - Stamped and audited against `no-slop-ui` and `hallmark` (`Dusk` / `Furrow` specifications).
   - Zero glassmorphism, zero floating 3D cards, zero generic marketing hero pages. Opens directly into the active financial ledger.
   - Palette: Warm paper/stone (`#F7F6F2`, `#FFFFFF`, `#EBE9E1`).
   - Typography: Google Fonts `Newsreader` (editorial serif) + `Plus Jakarta Sans` + strict `JetBrains Mono` with `tabular-nums` enforced.

---

## 📊 30-Invoice Telemetry Simulation Results

| Metric | Raw / Naive APM View | Morse Canonical Truth | Impact |
| :--- | :--- | :--- | :--- |
| **Total Invoices** | 30 | 30 | 100% Volume |
| **Confirmed Outcomes** | 30 (Assumed) | **24** (18 Exact + 6 TDS) | **80.0% Success Rate** |
| **Arithmetic Failures** | 0 (Hidden in logs) | **6** (Corrupted OCR) | **20.0% Rejection Rate** |
| **Retry Waste Burn** | 0 tokens | **4,740 tokens** | **+20.8% Token Penalty** |
| **Cost per Unit** | **$0.00027** (Raw Call) | **$0.00034** (Per Approved Outcome) | **+25.9% True Unit Cost** |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### 2. Backend Setup (FastAPI & Morse SDK)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup (Next.js 16 App Router)
```bash
cd frontend
npm install
npm run dev -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Repository Structure

```
├── backend/
│   ├── app/
│   │   ├── agent.py         # Multi-step reconciliation agent & spans
│   │   ├── config.py        # Environment variables & constants
│   │   ├── database.py      # SQLite ledger & local telemetry mirror
│   │   ├── main.py          # FastAPI application & API endpoints
│   │   ├── seed_data.py     # 30 diverse Indian & global B2B invoices
│   │   └── telemetry.py     # Graceful Morse SDK wrapper & unit economics
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router (layout, page, styles)
│   │   ├── components/      # Ledger table, metrics strip, inspector, modal
│   │   └── lib/             # API client & TypeScript types
│   └── package.json
├── MORSE_EVALUATION_REPORT.md # Deep-dive evaluation report for the Morse team
├── SOCIAL_MEDIA_POSTS.md      # Ready-to-publish X (Twitter) and LinkedIn posts
└── README.md
```

---

## 📄 License
MIT License. Built for Moonshot Factory & Morse Observability.
