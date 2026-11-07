import { Invoice, TelemetryTrace, UnitEconomicsStats } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchStats(): Promise<UnitEconomicsStats> {
  const res = await fetch(`${API_BASE}/api/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchInvoices(status?: string, search?: string): Promise<Invoice[]> {
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  if (search) params.append("search", search);

  const url = `${API_BASE}/api/invoices${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}

export async function fetchInvoiceDetail(invoiceId: string): Promise<{ invoice: Invoice; telemetry: TelemetryTrace | null }> {
  const res = await fetch(`${API_BASE}/api/invoices/${encodeURIComponent(invoiceId)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch invoice details");
  return res.json();
}

export async function confirmOutcome(invoiceId: string, verdict: "confirmed" | "rejected", notes?: string) {
  const res = await fetch(`${API_BASE}/api/invoices/${encodeURIComponent(invoiceId)}/confirm-outcome`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verdict, notes }),
  });
  if (!res.ok) throw new Error("Failed to confirm outcome");
  return res.json();
}

export async function runTelemetryBatch() {
  const res = await fetch(`${API_BASE}/api/batch/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to trigger batch run");
  return res.json();
}

export async function resetLedger() {
  const res = await fetch(`${API_BASE}/api/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to reset ledger");
  return res.json();
}

export async function reconcileSingleInvoice(payload: {
  vendor_name: string;
  invoice_id: string;
  invoice_date?: string;
  line_items: Array<{ description: string; amount: number }>;
  tax_amount: number;
  stated_total: number;
  raw_text?: string;
}) {
  const res = await fetch(`${API_BASE}/api/invoices/reconcile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to reconcile invoice");
  return res.json();
}

export async function apiGoogleAuth(payload: { email: string; name: string; avatar_url?: string; company?: string; google_id?: string }) {
  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Backend Google auth failed");
  return res.json();
}

export async function apiSignUp(payload: { email: string; password: string; name: string; organization?: string; role?: string }) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Backend sign up failed");
  return res.json();
}

export async function apiLogin(payload: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Backend login failed");
  return res.json();
}

export async function apiGetUsers() {
  const res = await fetch(`${API_BASE}/api/auth/users`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}
