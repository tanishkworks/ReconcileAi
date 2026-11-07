import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import (
    PORT,
    HOST,
    ENVIRONMENT,
    MORSE_API_KEY,
    MORSE_ENDPOINT,
    AGENT_NAME,
    AGENT_VERSION
)
from app.database import (
    init_db,
    get_db_connection,
    save_invoice_and_telemetry,
    save_or_update_user_profile,
    get_user_by_email_or_id,
    list_all_users
)
from app.telemetry import (
    init_morse,
    is_morse_active
)
from app.agent import (
    process_invoice
)
from app.seed_data import (
    SEED_BANK_LEDGER,
    SEED_INVOICES
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and Morse Telemetry
    init_db()
    init_morse()
    seed_bank_ledger_if_empty()
    yield
    # Shutdown

app = FastAPI(
    title="ReconcileAI - Morse Financial Observability Engine",
    version=AGENT_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_bank_ledger_if_empty():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM bank_ledger_entries")
    row = cursor.fetchone()
    if row["count"] == 0:
        now_iso = datetime.now(timezone.utc).isoformat()
        for item in SEED_BANK_LEDGER:
            cursor.execute("""
            INSERT INTO bank_ledger_entries (
                deposit_id, transaction_date, vendor_name, deposit_amount,
                reference_no, notes, is_matched, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item["deposit_id"],
                item["transaction_date"],
                item["vendor_name"],
                item["deposit_amount"],
                item["reference_no"],
                item["notes"],
                0,
                now_iso
            ))
        conn.commit()
    conn.close()

# -------------------------------------------------------------------------
# Request / Response Models
# -------------------------------------------------------------------------
class SingleReconcileRequest(BaseModel):
    vendor_name: str
    invoice_id: str
    invoice_date: Optional[str] = "2026-03-01"
    line_items: List[Dict[str, Any]]
    tax_amount: float = 0.0
    stated_total: float
    raw_text: Optional[str] = ""

class OutcomeConfirmRequest(BaseModel):
    verdict: str  # "confirmed" or "rejected"
    notes: Optional[str] = ""

class GoogleAuthRequest(BaseModel):
    email: str
    name: str
    avatar_url: Optional[str] = None
    company: Optional[str] = "Enterprise Treasury"
    google_id: Optional[str] = None

class SignUpRequest(BaseModel):
    email: str
    password: str
    name: str
    organization: Optional[str] = "Enterprise Treasury"
    role: Optional[str] = "Financial Controller"

class LoginRequest(BaseModel):
    email: str
    password: str

# -------------------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------------------
@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "agent": AGENT_NAME,
        "version": AGENT_VERSION,
        "environment": ENVIRONMENT,
        "morse_connected": is_morse_active(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/stats")
def get_unit_economics_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Invoice counts
    cursor.execute("SELECT COUNT(*) as count FROM reconciled_invoices")
    total_invoices = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM reconciled_invoices WHERE morse_success = 1")
    confirmed_outcomes = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM reconciled_invoices WHERE morse_outcome = 'reconciled_exact'")
    exact_reconciled = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM reconciled_invoices WHERE morse_outcome = 'reconciled_tds_or_shortfall'")
    shortfall_count = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM reconciled_invoices WHERE morse_outcome = 'math_audit_failed'")
    math_failures = cursor.fetchone()["count"]

    # Telemetry spend totals
    cursor.execute("SELECT SUM(cost_usd) as total_spend, SUM(total_tokens) as total_toks, SUM(retry_tokens) as retry_toks, AVG(cost_usd) as avg_cost FROM telemetry_traces")
    spend_row = cursor.fetchone()

    total_spend = round(spend_row["total_spend"] or 0.0, 5)
    total_tokens = spend_row["total_toks"] or 0
    retry_tokens = spend_row["retry_toks"] or 0
    raw_cost_per_call = round(spend_row["avg_cost"] or 0.0, 5)

    # Retry waste cost
    # $0.15 / 1M prompt retry tokens
    retry_waste_spend = round(retry_tokens * (0.15 / 1_000_000), 5)

    # Canonical cost per confirmed outcome
    # Total spend (including all retries and failed runs) / Confirmed Outcomes
    canonical_cost = round(total_spend / confirmed_outcomes, 5) if confirmed_outcomes > 0 else 0.0

    conn.close()

    return {
        "total_invoices": total_invoices,
        "confirmed_outcomes": confirmed_outcomes,
        "confirmed_rate_str": f"{confirmed_outcomes} / {total_invoices} Labeled" if total_invoices > 0 else "0 / 0 Labeled",
        "confirmed_percentage": round((confirmed_outcomes / total_invoices * 100), 1) if total_invoices > 0 else 0.0,
        "total_telemetry_spend_usd": total_spend,
        "canonical_cost_per_confirmed_usd": canonical_cost,
        "raw_cost_per_call_usd": raw_cost_per_call,
        "retry_waste_spend_usd": retry_waste_spend,
        "total_tokens": total_tokens,
        "retry_tokens": retry_tokens,
        "breakdown": {
            "exact_matches": exact_reconciled,
            "shortfall_tds": shortfall_count,
            "math_failures": math_failures
        },
        "morse_sdk_status": {
            "active": is_morse_active(),
            "badge": "Morse OTLP Live" if is_morse_active() else "Morse Local Mirror",
            "endpoint": MORSE_ENDPOINT,
            "environment": ENVIRONMENT
        }
    }

@app.get("/api/invoices")
def list_invoices(
    status: Optional[str] = Query(None, description="Filter by outcome: exact, shortfall, math_failed"),
    search: Optional[str] = Query(None, description="Search vendor or invoice ID")
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM reconciled_invoices WHERE 1=1"
    params = []

    if status:
        if status == "exact":
            query += " AND morse_outcome = 'reconciled_exact'"
        elif status == "shortfall":
            query += " AND morse_outcome = 'reconciled_tds_or_shortfall'"
        elif status == "math_failed":
            query += " AND morse_outcome = 'math_audit_failed'"

    if search and search.strip():
        query += " AND (vendor_name LIKE ? OR invoice_id LIKE ?)"
        s = f"%{search.strip()}%"
        params.extend([s, s])

    query += " ORDER BY id ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        d = dict(r)
        d["line_items"] = json.loads(d["line_items_json"])
        result.append(d)

    return result

@app.get("/api/invoices/{invoice_id}")
def get_invoice_detail(invoice_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM reconciled_invoices WHERE invoice_id = ?", (invoice_id,))
    inv_row = cursor.fetchone()

    if not inv_row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Invoice {invoice_id} not found")

    invoice_data = dict(inv_row)
    invoice_data["line_items"] = json.loads(invoice_data["line_items_json"])

    # Fetch corresponding telemetry trace
    cursor.execute("SELECT * FROM telemetry_traces WHERE invoice_id = ? ORDER BY id DESC LIMIT 1", (invoice_id,))
    trace_row = cursor.fetchone()
    conn.close()

    trace_data = None
    if trace_row:
        trace_data = dict(trace_row)
        trace_data["spans"] = json.loads(trace_data["spans_json"])

    return {
        "invoice": invoice_data,
        "telemetry": trace_data
    }

@app.post("/api/invoices/reconcile")
def reconcile_single_invoice(payload: SingleReconcileRequest):
    result = process_invoice(payload.model_dump())
    return result

@app.post("/api/invoices/{invoice_id}/confirm-outcome")
def confirm_invoice_outcome(invoice_id: str, req: OutcomeConfirmRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM reconciled_invoices WHERE invoice_id = ?", (invoice_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Invoice not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    new_verdict = req.verdict
    # If confirmed by human, guarantee morse_success = 1
    new_success = 1 if new_verdict == "confirmed" else 0

    cursor.execute("""
    UPDATE reconciled_invoices
    SET human_verdict = ?, human_confirmed_at = ?, morse_success = ?
    WHERE invoice_id = ?
    """, (new_verdict, now_iso, new_success, invoice_id))

    # Update telemetry trace mirror as well
    cursor.execute("""
    UPDATE telemetry_traces
    SET success = ?
    WHERE invoice_id = ?
    """, (new_success, invoice_id))

    conn.commit()
    conn.close()

    # If Morse is active, we can set delayed outcome as well
    if is_morse_active():
        try:
            import morse_ai
            morse_ai.set_outcome(success=(new_success == 1), outcome=f"hitl_{new_verdict}")
        except Exception:
            pass

    return {
        "status": "updated",
        "invoice_id": invoice_id,
        "human_verdict": new_verdict,
        "confirmed_at": now_iso
    }

@app.post("/api/batch/run")
def run_telemetry_batch():
    """
    Executes the 30-Invoice Telemetry Batch Stress-Test:
    - 18 Clean invoices
    - 6 TDS / Shortfall invoices
    - 6 Corrupted OCR math failure invoices
    Computes live unit economics and logs full telemetry traces.
    """
    results = []
    for item in SEED_INVOICES:
        res = process_invoice(item)
        results.append(res)

    return {
        "status": "complete",
        "batch_size": len(results),
        "processed_invoices": results
    }

@app.post("/api/reset")
def reset_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS reconciled_invoices")
    cursor.execute("DROP TABLE IF EXISTS telemetry_traces")
    cursor.execute("DROP TABLE IF EXISTS bank_ledger_entries")
    conn.commit()
    conn.close()

    init_db()
    seed_bank_ledger_if_empty()

    return {"status": "reset_successful"}

@app.get("/api/bank-ledger")
def get_bank_ledger():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bank_ledger_entries ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# -------------------------------------------------------------------------
# User Authentication & Profiles (Synced to Supabase)
# -------------------------------------------------------------------------
@app.post("/api/auth/google")
def auth_google(req: GoogleAuthRequest):
    user = save_or_update_user_profile(
        email=req.email,
        full_name=req.name,
        avatar_url=req.avatar_url,
        organization_name=req.company or "Enterprise Treasury",
        role="Financial Controller",
        auth_provider="google"
    )
    return {"status": "success", "user": user, "token": f"bearer_{user['id']}"}

@app.post("/api/auth/signup")
def auth_signup(req: SignUpRequest):
    user = save_or_update_user_profile(
        email=req.email,
        full_name=req.name,
        avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={req.name}",
        organization_name=req.organization or "Enterprise Treasury",
        role=req.role or "Financial Controller",
        auth_provider="email"
    )
    return {"status": "success", "user": user, "token": f"bearer_{user['id']}"}

@app.post("/api/auth/login")
def auth_login(req: LoginRequest):
    existing = get_user_by_email_or_id(req.email)
    if not existing:
        name = req.email.split("@")[0].replace(".", " ").title()
        existing = save_or_update_user_profile(
            email=req.email,
            full_name=name,
            organization_name="Enterprise Treasury",
            role="Financial Controller",
            auth_provider="email"
        )
    return {"status": "success", "user": existing, "token": f"bearer_{existing['id']}"}

@app.get("/api/auth/users")
def get_users():
    return {"users": list_all_users()}

