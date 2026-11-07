import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.config import DB_PATH

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

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

    # Local Telemetry Trace Mirror (for on-screen observability)
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

    conn.commit()
    conn.close()

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
