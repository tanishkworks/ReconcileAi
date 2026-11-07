import sqlite3
import json
import uuid
import requests
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.config import DB_PATH, SUPABASE_URL, SUPABASE_ANON_KEY

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_supabase_headers() -> Dict[str, str]:
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation"
    }

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Bank Ledger Entries
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bank_ledger_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deposit_id TEXT UNIQUE NOT NULL,
        transaction_date TEXT NOT NULL,
        vendor_name TEXT NOT NULL,
        deposit_amount REAL NOT NULL,
        reference_no TEXT NOT NULL,
        notes TEXT,
        is_matched INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    );
    """)

    # Reconciled Invoices
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reconciled_invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id TEXT UNIQUE NOT NULL,
        vendor_name TEXT NOT NULL,
        invoice_date TEXT NOT NULL,
        line_items_json TEXT NOT NULL,
        line_items_sum REAL NOT NULL,
        tax_amount REAL NOT NULL,
        stated_total REAL NOT NULL,
        math_valid INTEGER NOT NULL,
        math_discrepancy REAL NOT NULL,
        retry_count INTEGER DEFAULT 0,
        bank_deposit_amount REAL,
        shortfall_variance REAL,
        morse_trace_id TEXT NOT NULL,
        morse_outcome TEXT NOT NULL,
        morse_success INTEGER NOT NULL,
        token_spend INTEGER NOT NULL,
        retry_token_waste INTEGER DEFAULT 0,
        estimated_cost_usd REAL NOT NULL,
        human_verdict TEXT DEFAULT 'pending',
        human_confirmed_at TEXT,
        raw_ocr_payload TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # Local Telemetry Trace Mirror
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry_traces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trace_id TEXT UNIQUE NOT NULL,
        invoice_id TEXT NOT NULL,
        agent_name TEXT NOT NULL,
        outcome TEXT NOT NULL,
        success INTEGER NOT NULL,
        prompt_tokens INTEGER NOT NULL,
        completion_tokens INTEGER NOT NULL,
        total_tokens INTEGER NOT NULL,
        retry_tokens INTEGER DEFAULT 0,
        cost_usd REAL NOT NULL,
        latency_ms REAL NOT NULL,
        spans_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    # Local Users table (mirror of Supabase profiles)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        avatar_url TEXT,
        organization_name TEXT,
        role TEXT,
        password_hash TEXT,
        auth_provider TEXT DEFAULT 'google',
        created_at TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()

# -------------------------------------------------------------------------
# Supabase Synchronization Functions
# -------------------------------------------------------------------------
def sync_invoice_to_supabase(invoice_data: Dict[str, Any]):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return
    try:
        url = f"{SUPABASE_URL}/rest/v1/invoices"
        payload = [{
            "invoice_id": invoice_data["invoice_id"],
            "vendor_name": invoice_data["vendor_name"],
            "invoice_date": invoice_data["invoice_date"],
            "line_items": invoice_data["line_items"],
            "line_items_sum": float(invoice_data["line_items_sum"]),
            "tax_amount": float(invoice_data["tax_amount"]),
            "stated_total": float(invoice_data["stated_total"]),
            "math_valid": bool(invoice_data["math_valid"]),
            "math_discrepancy": float(invoice_data["math_discrepancy"]),
            "retry_count": int(invoice_data.get("retry_count", 0)),
            "bank_deposit_amount": float(invoice_data["bank_deposit_amount"]) if invoice_data.get("bank_deposit_amount") is not None else None,
            "shortfall_variance": float(invoice_data["shortfall_variance"]) if invoice_data.get("shortfall_variance") is not None else None,
            "morse_trace_id": invoice_data["morse_trace_id"],
            "morse_outcome": invoice_data["morse_outcome"],
            "morse_success": bool(invoice_data["morse_success"]),
            "token_spend": int(invoice_data["token_spend"]),
            "retry_token_waste": int(invoice_data.get("retry_token_waste", 0)),
            "estimated_cost_usd": float(invoice_data["estimated_cost_usd"]),
            "human_verdict": invoice_data.get("human_verdict", "pending"),
            "raw_ocr_payload": invoice_data.get("raw_ocr_payload", "")
        }]
        requests.post(url, headers=get_supabase_headers(), json=payload, timeout=4)
    except Exception as e:
        print(f"[Supabase Sync] Warning syncing invoice: {e}")

def sync_telemetry_to_supabase(trace_data: Dict[str, Any]):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return
    try:
        url = f"{SUPABASE_URL}/rest/v1/telemetry_traces"
        payload = [{
            "trace_id": trace_data["trace_id"],
            "invoice_id": trace_data["invoice_id"],
            "agent_name": trace_data["agent_name"],
            "outcome": trace_data["outcome"],
            "success": bool(trace_data["success"]),
            "prompt_tokens": int(trace_data["prompt_tokens"]),
            "completion_tokens": int(trace_data["completion_tokens"]),
            "total_tokens": int(trace_data["total_tokens"]),
            "retry_tokens": int(trace_data.get("retry_tokens", 0)),
            "cost_usd": float(trace_data["cost_usd"]),
            "latency_ms": float(trace_data["latency_ms"]),
            "spans": trace_data["spans"]
        }]
        requests.post(url, headers=get_supabase_headers(), json=payload, timeout=4)
    except Exception as e:
        print(f"[Supabase Sync] Warning syncing trace: {e}")

# -------------------------------------------------------------------------
# User Profiles & Auth Persistence
# -------------------------------------------------------------------------
def save_or_update_user_profile(
    email: str,
    full_name: str,
    avatar_url: Optional[str] = None,
    organization_name: str = "Enterprise Treasury",
    role: str = "Financial Controller",
    auth_provider: str = "google",
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    now_iso = datetime.now(timezone.utc).isoformat()
    uid = user_id or str(uuid.uuid5(uuid.NAMESPACE_URL, f"mailto:{email.lower()}"))
    avatar = avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={full_name}"

    # 1. Save to SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO users (id, email, full_name, avatar_url, organization_name, role, auth_provider, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
        full_name=excluded.full_name,
        avatar_url=excluded.avatar_url,
        organization_name=excluded.organization_name,
        role=excluded.role,
        auth_provider=excluded.auth_provider
    """, (uid, email.lower(), full_name, avatar, organization_name, role, auth_provider, now_iso))
    conn.commit()
    conn.close()

    user_data = {
        "id": uid,
        "email": email.lower(),
        "name": full_name,
        "full_name": full_name,
        "avatar_url": avatar,
        "company": organization_name,
        "organization_name": organization_name,
        "role": role,
        "auth_provider": auth_provider,
        "created_at": now_iso
    }

    # 2. Sync to Supabase public.profiles
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        try:
            url = f"{SUPABASE_URL}/rest/v1/profiles"
            payload = [{
                "id": uid,
                "email": email.lower(),
                "full_name": full_name,
                "avatar_url": avatar,
                "organization_name": organization_name,
                "role": role,
                "updated_at": now_iso
            }]
            requests.post(url, headers=get_supabase_headers(), json=payload, timeout=4)
        except Exception as e:
            print(f"[Supabase Profiles] Warning syncing profile: {e}")

    return user_data

def get_user_by_email_or_id(identifier: str) -> Optional[Dict[str, Any]]:
    # First check SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ? OR id = ?", (identifier.lower(), identifier))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)

    # Check Supabase
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        try:
            url = f"{SUPABASE_URL}/rest/v1/profiles?or=(email.eq.{identifier.lower()},id.eq.{identifier})&select=*"
            r = requests.get(url, headers=get_supabase_headers(), timeout=4)
            if r.status_code == 200 and len(r.json()) > 0:
                p = r.json()[0]
                return {
                    "id": p["id"],
                    "email": p["email"],
                    "name": p["full_name"],
                    "full_name": p["full_name"],
                    "avatar_url": p["avatar_url"],
                    "company": p.get("organization_name", "Enterprise Treasury"),
                    "role": p.get("role", "Financial Controller")
                }
        except Exception as e:
            print(f"[Supabase] Error reading user: {e}")

    return None

def list_all_users() -> List[Dict[str, Any]]:
    # Check Supabase first
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        try:
            url = f"{SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc"
            r = requests.get(url, headers=get_supabase_headers(), timeout=4)
            if r.status_code == 200 and len(r.json()) > 0:
                return r.json()
        except Exception:
            pass

    # Fallback to SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# -------------------------------------------------------------------------
# Core Persistence
# -------------------------------------------------------------------------
def save_invoice_and_telemetry(invoice_data: Dict[str, Any], trace_data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()

    now_iso = datetime.now(timezone.utc).isoformat()

    # Upsert into reconciled_invoices
    cursor.execute("""
    INSERT INTO reconciled_invoices (
        invoice_id, vendor_name, invoice_date, line_items_json,
        line_items_sum, tax_amount, stated_total, math_valid,
        math_discrepancy, retry_count, bank_deposit_amount,
        shortfall_variance, morse_trace_id, morse_outcome,
        morse_success, token_spend, retry_token_waste,
        estimated_cost_usd, human_verdict, raw_ocr_payload, created_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    ) ON CONFLICT(invoice_id) DO UPDATE SET
        vendor_name=excluded.vendor_name,
        invoice_date=excluded.invoice_date,
        line_items_json=excluded.line_items_json,
        line_items_sum=excluded.line_items_sum,
        tax_amount=excluded.tax_amount,
        stated_total=excluded.stated_total,
        math_valid=excluded.math_valid,
        math_discrepancy=excluded.math_discrepancy,
        retry_count=excluded.retry_count,
        bank_deposit_amount=excluded.bank_deposit_amount,
        shortfall_variance=excluded.shortfall_variance,
        morse_trace_id=excluded.morse_trace_id,
        morse_outcome=excluded.morse_outcome,
        morse_success=excluded.morse_success,
        token_spend=excluded.token_spend,
        retry_token_waste=excluded.retry_token_waste,
        estimated_cost_usd=excluded.estimated_cost_usd,
        raw_ocr_payload=excluded.raw_ocr_payload
    """, (
        invoice_data["invoice_id"],
        invoice_data["vendor_name"],
        invoice_data["invoice_date"],
        json.dumps(invoice_data["line_items"]),
        invoice_data["line_items_sum"],
        invoice_data["tax_amount"],
        invoice_data["stated_total"],
        1 if invoice_data["math_valid"] else 0,
        invoice_data["math_discrepancy"],
        invoice_data.get("retry_count", 0),
        invoice_data.get("bank_deposit_amount"),
        invoice_data.get("shortfall_variance"),
        invoice_data["morse_trace_id"],
        invoice_data["morse_outcome"],
        1 if invoice_data["morse_success"] else 0,
        invoice_data["token_spend"],
        invoice_data.get("retry_token_waste", 0),
        invoice_data["estimated_cost_usd"],
        invoice_data.get("human_verdict", "pending"),
        invoice_data.get("raw_ocr_payload", ""),
        now_iso
    ))

    # Upsert into telemetry_traces
    cursor.execute("""
    INSERT INTO telemetry_traces (
        trace_id, invoice_id, agent_name, outcome, success,
        prompt_tokens, completion_tokens, total_tokens,
        retry_tokens, cost_usd, latency_ms, spans_json, created_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    ) ON CONFLICT(trace_id) DO UPDATE SET
        outcome=excluded.outcome,
        success=excluded.success,
        prompt_tokens=excluded.prompt_tokens,
        completion_tokens=excluded.completion_tokens,
        total_tokens=excluded.total_tokens,
        retry_tokens=excluded.retry_tokens,
        cost_usd=excluded.cost_usd,
        latency_ms=excluded.latency_ms,
        spans_json=excluded.spans_json
    """, (
        trace_data["trace_id"],
        trace_data["invoice_id"],
        trace_data["agent_name"],
        trace_data["outcome"],
        1 if trace_data["success"] else 0,
        trace_data["prompt_tokens"],
        trace_data["completion_tokens"],
        trace_data["total_tokens"],
        trace_data.get("retry_tokens", 0),
        trace_data["cost_usd"],
        trace_data["latency_ms"],
        json.dumps(trace_data["spans"]),
        now_iso
    ))

    conn.commit()
    conn.close()

    # Sync to Supabase in background
    sync_invoice_to_supabase(invoice_data)
    sync_telemetry_to_supabase(trace_data)
