# ReconcileAI & Morse Observability Launch Posts

---

## 🧵 Post 1: X (Twitter) Thread

**1/7**  
Most AI agent monitoring is broken.  
Dashboards report "Raw Cost per API Call" (e.g. $0.00027) and call it a day.  

In production B2B finance, that metric is a lie.  

Here is how we built **ReconcileAI** with @morsehq to reveal the true **Canonical Cost per Confirmed Outcome** 👇

**2/7**  
The core problem in accounting AI: zero tolerance for hallucinations.  
An LLM can extract messy OCR text from 30 invoices, but `sum(line_items) + tax` MUST match `stated_total`.  

When math fails, your agent triggers 2 self-correction retries. That burns tokens fast.

**3/7**  
In our 30-invoice test batch:
- 18 clean invoices reconciled on attempt #1 ($0 variance)
- 6 invoices had a 10% TDS deduction (Section 194J) requiring Human-in-the-Loop review
- 6 corrupted invoices failed the math audit and triggered retry loops

**4/7**  
Here’s what @morsehq observability caught that standard APM misses:
- Raw API call cost: **$0.00027**
- Total wasted retry tokens: **4,740 tokens** (+20.8% spend)
- True Canonical Cost per Confirmed Outcome: **$0.00034**

That’s a **25.9% Ghost Cost margin** hidden in failed attempts and retry loops.

**5/7**  
Architecture stack:
- Backend: Python 3.12 + FastAPI + `morse-ai` SDK (`run()`, `span()`, `set_outcome()`)
- Deterministic Layer: Python arithmetic verifier that gates whether a trace succeeds
- Frontend: Next.js 16 App Router audited against @nutlope’s Hallmark anti-AI-slop design rules

**6/7**  
Zero AI slop in the UI:
❌ No purple/blue glassmorphism
❌ No glowing 3D floating cards
❌ No hero marketing fluff
✅ Warm archival paper (`#F7F6F2`), `Newsreader` serif headers, `JetBrains Mono` with strictly enforced `tabular-nums`.

**7/7**  
Takeaway: Don’t measure what your LLM spent while thinking. Measure what it cost to get an auditor-approved result.  

Huge kudos to the Morse team (`morsehq.dev`) for building a verdict-first observability primitive. Full evaluation report is live in the repo! 🚀

---

## 💼 Post 2: LinkedIn Long-Form Post

**Headline:** Why "Cost per API Call" is a Dangerous Metric for AI Agents (and what we learned building ReconcileAI with Morse Observability)

If you ask an AI engineer how much their production agent costs, they will usually quote their average LLM token spend per request. In our case, ~$0.00027 per invocation.

If you ask a CFO what that agent costs, they want to know the unit economics: *“What did it cost to get an approved, reconciled ledger entry into our ERP?”*

Those two numbers are almost never the same.

This week, we built **ReconcileAI** — an autonomous B2B invoice and bank ledger reconciliation workbench built specifically to stress-test the new **Morse AI Observability SDK** (`morsehq.dev`).

Here is the architectural breakdown and the surprising data:

### 1. The Deterministic Floor
Probabilistic models should extract unstructured data, but they should never be the judge of mathematical truth. In ReconcileAI:
- Span 1 (`parse_invoice`): Structured OCR parsing across diverse Indian & global B2B invoices.
- Span 2 (`verify_math`): A deterministic Python audit verifying `sum(line_items) + tax_amount == stated_total`. If corrupted digits cause a discrepancy, up to 2 retry spans fire with self-correction prompts.
- Span 3 (`match_ledger`): Bank deposit matching against our SQLite ledger, isolating exact matches from 10% TDS (Tax Deducted at Source) deductions.

### 2. The Verdict-First Observability Model
Unlike traditional APMs where a 200 OK means success, Morse introduces `morse_ai.set_outcome(success=bool, outcome="...")`. 
If an invoice is corrupted and fails math verification after 2 retries, it’s not an unhandled crash—it’s an explicit failure verdict: `math_audit_failed`.

### 3. The Quantitative Reality Check
Running our 30-invoice stress batch revealed:
- 18 Clean exact reconciliations (60%)
- 6 Valid TDS shortfalls flagged for human sign-off (20%)
- 6 Intentionally corrupted OCR scans that triggered retry loops (20%)
- **4,740 wasted retry tokens** logged across failed self-correction attempts
- **Raw cost per call:** $0.00027
- **Canonical cost per confirmed outcome:** $0.00034

That’s a **+25.9% unit cost delta** caused entirely by retry burn and unrecoverable inputs. If you’re processing 500,000 documents a month, that discrepancy is the difference between an AI product that is profitable and one that silently bleeds margin.

### 4. Anti-AI-Slop Craft
We audited the frontend against the `hallmark` and `no-slop-ui` design standards:
- Warm paper/stone archival theme (`#F7F6F2` background, `#FFFFFF` crisp sheet)
- Editorial financial typography pairing: Google Fonts `Newsreader` + `Plus Jakarta Sans`
- Strict `JetBrains Mono` with `tabular-nums` on every currency figure and trace ID
- Zero purple gradients, zero glassmorphism, zero filler hero sections. You enter directly into the working ledger.

Check out the full evaluation report and code in the repo.

#ArtificialIntelligence #Fintech #LLMObservability #SoftwareEngineering #Python #NextJS #AccountingTech #MorseAI
