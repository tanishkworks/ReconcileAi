export interface LineItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: number;
  invoice_id: string;
  vendor_name: string;
  invoice_date: string;
  line_items: LineItem[];
  line_items_sum: number;
  tax_amount: number;
  stated_total: number;
  math_valid: number;
  math_discrepancy: number;
  retry_count: number;
  bank_deposit_amount: number | null;
  shortfall_variance: number | null;
  morse_trace_id: string;
  morse_outcome: "reconciled_exact" | "reconciled_tds_or_shortfall" | "math_audit_failed" | "unmatched_or_hallucinated" | string;
  morse_success: number;
  token_spend: number;
  retry_token_waste: number;
  estimated_cost_usd: number;
  human_verdict: string;
  human_confirmed_at: string | null;
  raw_ocr_payload: string;
  created_at: string;
}

export interface TelemetrySpan {
  span_id: string;
  name: string;
  span_type: string;
  duration_ms: number;
  status: string;
  tokens: number;
  input: string | null;
  output: string | null;
}

export interface TelemetryTrace {
  id: number;
  trace_id: string;
  invoice_id: string;
  agent_name: string;
  outcome: string;
  success: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  retry_tokens: number;
  cost_usd: number;
  latency_ms: number;
  spans: TelemetrySpan[];
  created_at: string;
}

export interface UnitEconomicsStats {
  total_invoices: number;
  confirmed_outcomes: number;
  confirmed_rate_str: string;
  confirmed_percentage: number;
  total_telemetry_spend_usd: number;
  canonical_cost_per_confirmed_usd: number;
  raw_cost_per_call_usd: number;
  retry_waste_spend_usd: number;
  total_tokens: number;
  retry_tokens: number;
  breakdown: {
    exact_matches: number;
    shortfall_tds: number;
    math_failures: number;
  };
  morse_sdk_status: {
    active: boolean;
    badge: string;
    endpoint: string;
    environment: string;
  };
}
