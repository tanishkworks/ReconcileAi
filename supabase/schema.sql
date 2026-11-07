-- ====================================================================
-- ReconcileAI Enterprise Database Schema for Supabase (PostgreSQL)
-- ====================================================================

-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    organization_name TEXT DEFAULT 'Enterprise Treasury',
    role TEXT DEFAULT 'Financial Controller',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bank Accounts & Feeds
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    bank_name TEXT NOT NULL,
    account_number_mask TEXT NOT NULL,
    currency TEXT DEFAULT 'USD',
    current_balance NUMERIC(14, 2) DEFAULT 0.00,
    feed_status TEXT DEFAULT 'active', -- active, syncing, disconnected
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bank Transactions / Deposit Ledger
CREATE TABLE IF NOT EXISTS public.bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_id TEXT UNIQUE NOT NULL,
    bank_account_id UUID REFERENCES public.bank_accounts(id),
    transaction_date DATE NOT NULL,
    vendor_name TEXT NOT NULL,
    deposit_amount NUMERIC(14, 2) NOT NULL,
    reference_no TEXT NOT NULL,
    notes TEXT,
    is_matched BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users,
    vendor_name TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    currency TEXT DEFAULT 'USD',
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    line_items_sum NUMERIC(14, 2) NOT NULL,
    tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    stated_total NUMERIC(14, 2) NOT NULL,
    math_valid BOOLEAN NOT NULL DEFAULT TRUE,
    math_discrepancy NUMERIC(14, 2) DEFAULT 0.00,
    retry_count INT DEFAULT 0,
    bank_deposit_amount NUMERIC(14, 2),
    shortfall_variance NUMERIC(14, 2),
    morse_trace_id TEXT NOT NULL,
    morse_outcome TEXT NOT NULL, -- reconciled_exact, reconciled_tds_or_shortfall, math_audit_failed
    morse_success BOOLEAN NOT NULL,
    token_spend INT NOT NULL,
    retry_token_waste INT DEFAULT 0,
    estimated_cost_usd NUMERIC(10, 6) NOT NULL,
    human_verdict TEXT DEFAULT 'pending', -- pending, confirmed, rejected
    human_confirmed_at TIMESTAMPTZ,
    raw_ocr_payload TEXT,
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Telemetry Traces Table (Mirror of Morse Traces)
CREATE TABLE IF NOT EXISTS public.telemetry_traces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trace_id TEXT UNIQUE NOT NULL,
    invoice_id TEXT REFERENCES public.invoices(invoice_id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL DEFAULT 'invoice-reconciliation-agent',
    outcome TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    prompt_tokens INT NOT NULL,
    completion_tokens INT NOT NULL,
    total_tokens INT NOT NULL,
    retry_tokens INT DEFAULT 0,
    cost_usd NUMERIC(10, 6) NOT NULL,
    latency_ms NUMERIC(10, 2) NOT NULL,
    spans JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_traces ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public read for demo mode" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Public read for bank tx" ON public.bank_transactions FOR ALL USING (true);
CREATE POLICY "Public read for telemetry" ON public.telemetry_traces FOR ALL USING (true);
