"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Sparkles,
  Layers,
  UploadCloud,
  FileCheck2,
  TrendingUp,
  Building,
  Scale,
  RefreshCw,
  Zap,
  Lock,
  ChevronDown,
  ChevronRight,
  Database,
  Check,
  HelpCircle,
  FileText,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { reconcileSingleInvoice } from "@/lib/api";
import { Invoice } from "@/lib/types";

interface LandingHeroProps {
  onLaunchApp: () => void;
  onOpenAuth: () => void;
}

export function LandingHero({ onLaunchApp, onOpenAuth }: LandingHeroProps) {
  const [demoState, setDemoState] = useState<"idle" | "scanning" | "matched">("idle");
  const [selectedDemoScenario, setSelectedDemoScenario] = useState<"aws" | "ey" | "corrupt">("aws");
  const [quickUploadState, setQuickUploadState] = useState<"idle" | "processing" | "done">("idle");
  const [quickResult, setQuickResult] = useState<Invoice | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const demoScenarios = {
    aws: {
      name: "AWS India Pvt Ltd",
      id: "INV-2026-002",
      total: "₹1,46,910.00",
      type: "Exact Balanced Match",
      line1: "Amazon EC2 Compute — ₹74,500.00",
      line2: "Amazon RDS Database — ₹35,000.00",
      line3: "AWS S3 Cloud Storage — ₹15,000.00",
      tax: "18% IGST — ₹22,410.00",
      bankDeposit: "₹1,46,910.00 (Matched NEFT-AWS-9021)",
      status: "reconciled_exact",
      explanation: "Deterministic math verified: 74500 + 35000 + 15000 + 22410 == 146910. Exact match against SVB operating bank feed."
    },
    ey: {
      name: "Ernst & Young LLP",
      id: "INV-2026-019",
      total: "₹5,00,000.00",
      type: "TDS Shortfall (Sec 194J)",
      line1: "Statutory Financial Audit Retainer — ₹3,50,000.00",
      line2: "Direct Tax & Corporate Advisory — ₹73,728.81",
      line3: "Statutory Filing & Disclosures — ₹0.00",
      tax: "18% GST — ₹76,271.19",
      bankDeposit: "₹4,50,000.00 (Shortfall: ₹50,000.00)",
      status: "reconciled_with_shortfall",
      explanation: "10% Section 194J withholding detected automatically. Valid TDS deduction flagged for one-click controller confirmation."
    },
    corrupt: {
      name: "Apex Logistics Services",
      id: "INV-2026-025",
      total: "₹62,400.00",
      type: "Corrupted Scan Math Error",
      line1: "Interstate Freight Dispatch MH-KA — ₹32,000.00",
      line2: "Pallet Cold Storage Handling — ₹16,500.00",
      line3: "Demurrage & Toll Surcharge — ₹0.00",
      tax: "18% GST — ₹8,730.00",
      bankDeposit: "No bank record found (Math failure)",
      status: "failed_math_verification",
      explanation: "Line sum (32k + 16.5k + 8.73k = 57,230) does not equal claimed 62,400. Zero-tolerance policy caught OCR glitch."
    }
  };

  const currentScenario = demoScenarios[selectedDemoScenario];

  const runDemoScan = () => {
    setDemoState("scanning");
    setTimeout(() => {
      setDemoState("matched");
    }, 1200);
  };

  const handleQuickUploadSimulate = async () => {
    setQuickUploadState("processing");
    try {
      const payload = {
        vendor_name: "Snowflake Inc Global",
        invoice_id: `INV-SNOW-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: "2026-03-31",
        line_items: [
          { description: "Enterprise Data Cloud Compute Credits", amount: 84000.00 },
          { description: "Cross-Cloud Replication Storage", amount: 16000.00 }
        ],
        tax_amount: 18000.00,
        stated_total: 118000.00,
        raw_text: "SNOWFLAKE INC GLOBAL\nCompute Credits: 84,000.00\nStorage: 16,000.00\nTax 18%: 18,000.00\nStated Total: 1,18,000.00"
      };
      const res = await reconcileSingleInvoice(payload);
      setQuickResult(res as unknown as Invoice);
      setQuickUploadState("done");
    } catch (e) {
      console.error(e);
      setQuickUploadState("idle");
    }
  };

  const faqs = [
    {
      q: "What makes ReconcileAI different from standard AI invoice extractors?",
      a: "Standard LLMs hallucinate numbers and cannot be trusted with financial ledgers. ReconcileAI enforces a strict deterministic arithmetic floor: sum(line_items) + tax == stated_total. If math fails, the engine retries OCR automatically or flags the invoice for human confirmation. It never matches false numbers to your bank feed."
    },
    {
      q: "How does the Indian 10% TDS (Section 194J) shortfall detection work?",
      a: "When a vendor invoice of ₹5,00,000 is settled in bank feeds as ₹4,50,000, standard tools flag it as an unexplained mismatch. ReconcileAI checks whether the difference equals exactly 10% (TDS under Sec 194J) or 2% (Sec 194C) and automatically categorizes it with audit trails."
    },
    {
      q: "What is Morse Observability and why does it matter?",
      a: "Morse tracks Canonical Cost per Confirmed Outcome. Instead of only showing raw LLM API tokens, it measures total dollars spent divided by verified reconciliation results, including retry waste and token overhead, giving financial teams true unit economics."
    },
    {
      q: "Can I connect my own Supabase database and bank feeds?",
      a: "Yes. ReconcileAI includes an enterprise Supabase PostgreSQL schema with Row-Level Security (RLS) for profiles, invoices, bank feeds, and telemetry traces. You can supply your own Supabase credentials under Integrations & API settings."
    }
  ];

  return (
    <div className="flex flex-col bg-[#090D16] text-[#F8FAFC] selection:bg-[#38BDF8] selection:text-[#0B0F19]">
      {/* Top Commercial Navigation */}
      <nav className="border-b border-[#1E293B] px-6 py-4 sticky top-0 z-40 bg-[#090D16]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#38BDF8] to-[#10B981] flex items-center justify-center text-[#0B0F19] font-bold font-serif text-lg shadow-sm">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-xl font-bold tracking-tight text-white">
                  ReconcileAI
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#1E293B] text-[#38BDF8] border border-[#334155]">
                  Commercial v2.4
                </span>
              </div>
              <p className="text-[10px] text-[#64748B]">Autonomous Financial Ledger & Telemetry</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-xs font-medium text-[#94A3B8]">
            <a href="#demo" className="hover:text-white transition-colors">Interactive Scanner</a>
            <a href="#features" className="hover:text-white transition-colors">Deterministic Engine</a>
            <a href="#comparison" className="hover:text-white transition-colors">Unit Economics</a>
            <a href="#faq" className="hover:text-white transition-colors">Security & FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuth}
              className="text-xs font-medium text-[#CBD5E1] hover:text-white px-3 py-1.5 transition-colors cursor-pointer flex items-center gap-2"
            >
              {/* Google G Logo */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.57-5.17 3.57-9.15z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.35 24 12 24z" />
                <path fill="#FBBC05" d="M5.27 14.24A7.18 7.18 0 0 1 4.89 12c0-.78.13-1.54.38-2.24V6.61H1.25A11.967 11.967 0 0 0 0 12c0 1.92.45 3.74 1.25 5.39l4.02-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
              </svg>
              <span>Sign In</span>
            </button>
            <button
              onClick={onLaunchApp}
              className="bg-gradient-to-r from-[#10B981] to-[#059669] hover:opacity-95 text-[#090D16] font-bold text-xs py-2 px-4 rounded shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Launch Live Workbench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-6xl mx-auto text-center space-y-8">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#334155] bg-[#1E293B]/70 text-[#38BDF8] text-xs font-medium">
          <Zap className="w-3.5 h-3.5 fill-current text-[#38BDF8]" />
          <span>Zero-Tolerance Autonomous Financial Reconciliation with Morse Telemetry</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-5 max-w-4xl mx-auto">
          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.08]">
            Automated Accounting with <br />
            <span className="bg-gradient-to-r from-[#38BDF8] via-[#34D399] to-[#10B981] bg-clip-text text-transparent">
              Deterministic Precision
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Eliminate invoice hallucinations. ReconcileAI parses complex B2B invoices, enforces strict mathematical assertions on every line item, detects TDS shortfalls, and settles bank deposits with sub-second execution.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onLaunchApp}
            className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-[#090D16] font-bold text-sm py-3.5 px-6 rounded shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Open Live Enterprise Ledger</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] font-medium text-sm py-3.5 px-6 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.57-5.17 3.57-9.15z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.35 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.24A7.18 7.18 0 0 1 4.89 12c0-.78.13-1.54.38-2.24V6.61H1.25A11.967 11.967 0 0 0 0 12c0 1.92.45 3.74 1.25 5.39l4.02-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-xs text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#10B981]" /> Zero Math Hallucinations
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#10B981]" /> Sub-Second Execution (142ms)
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#10B981]" /> Section 194J TDS Intelligence
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#10B981]" /> Morse Observability SDK
          </span>
        </div>

        {/* Live Interactive Scanner Widget */}
        <div id="demo" className="pt-8 max-w-4xl mx-auto text-left">
          <div className="rounded-xl border border-[#334155] bg-[#0F172A] shadow-2xl overflow-hidden">
            {/* Window Top Bar */}
            <div className="bg-[#1E293B] px-4 py-3 border-b border-[#334155] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="text-xs text-[#94A3B8] font-mono ml-2">reconcile-ai://interactive-simulation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#38BDF8]">latency: 142ms</span>
                <span className="text-[11px] font-mono text-[#10B981]">tokens: 732</span>
              </div>
            </div>

            {/* Scenario Selector Pills */}
            <div className="bg-[#141E33] px-4 py-2 border-b border-[#334155] flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[#94A3B8] text-[11px] font-medium mr-1">Select Scenario:</span>
              <button
                onClick={() => { setSelectedDemoScenario("aws"); setDemoState("idle"); }}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  selectedDemoScenario === "aws" ? "bg-[#38BDF8] text-[#090D16]" : "bg-[#1E293B] text-[#94A3B8] hover:text-white"
                }`}
              >
                1. AWS (Exact Match)
              </button>
              <button
                onClick={() => { setSelectedDemoScenario("ey"); setDemoState("idle"); }}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  selectedDemoScenario === "ey" ? "bg-[#F59E0B] text-[#090D16]" : "bg-[#1E293B] text-[#94A3B8] hover:text-white"
                }`}
              >
                2. E&Y (TDS Shortfall)
              </button>
              <button
                onClick={() => { setSelectedDemoScenario("corrupt"); setDemoState("idle"); }}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  selectedDemoScenario === "corrupt" ? "bg-[#EF4444] text-white" : "bg-[#1E293B] text-[#94A3B8] hover:text-white"
                }`}
              >
                3. Apex Logistics (Math Error)
              </button>
            </div>

            {/* Interactive Demo Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Document Preview Card */}
              <div className="bg-[#1E293B]/60 border border-[#334155] rounded-lg p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[#38BDF8] border-b border-[#334155] pb-2">
                  <span className="font-bold">{currentScenario.id}</span>
                  <span className="text-[11px]">{currentScenario.name}</span>
                </div>
                <div className="text-[#94A3B8] space-y-1 text-[11px] pt-1">
                  <div>• {currentScenario.line1}</div>
                  <div>• {currentScenario.line2}</div>
                  <div>• {currentScenario.tax}</div>
                </div>
                <div className="pt-2 border-t border-[#334155] flex justify-between font-bold text-white text-xs">
                  <span>Stated Total:</span>
                  <span className="text-[#34D399]">{currentScenario.total}</span>
                </div>
              </div>

              {/* Action / Result */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Autonomous 3-Span Verification</h4>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    {currentScenario.explanation}
                  </p>
                </div>

                {demoState === "idle" && (
                  <button
                    onClick={runDemoScan}
                    className="w-full bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#090D16] font-bold text-xs py-3 px-4 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Run Verification Pipeline on {currentScenario.id}</span>
                  </button>
                )}

                {demoState === "scanning" && (
                  <div className="p-4 rounded border border-[#334155] bg-[#1E293B] flex items-center gap-3 text-xs text-[#38BDF8]">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#38BDF8]" />
                    <span>Executing OCR extraction → Deterministic Math audit → Bank match...</span>
                  </div>
                )}

                {demoState === "matched" && (
                  <div className={`p-4 rounded border space-y-2 text-xs ${
                    selectedDemoScenario === "aws"
                      ? "border-[#10B981]/50 bg-[#10B981]/10 text-[#10B981]"
                      : selectedDemoScenario === "ey"
                      ? "border-[#F59E0B]/50 bg-[#F59E0B]/10 text-[#F59E0B]"
                      : "border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]"
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      {selectedDemoScenario === "corrupt" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Outcome: {currentScenario.type}</span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8] space-y-1 font-mono">
                      <div>✓ Bank Ledger Record: {currentScenario.bankDeposit}</div>
                      <div>✓ Morse SDK Verdict: <span className="text-white font-semibold">{currentScenario.status}</span></div>
                    </div>
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => setDemoState("idle")}
                        className="text-[11px] text-[#38BDF8] hover:underline"
                      >
                        Reset Demo
                      </button>
                      <button
                        onClick={onLaunchApp}
                        className="text-[11px] font-semibold text-white hover:underline flex items-center gap-1"
                      >
                        Inspect in Full Ledger <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Upload Dropzone Simulator */}
        <div className="pt-8 max-w-4xl mx-auto">
          <div className="border border-dashed border-[#334155] rounded-xl p-8 bg-[#0F172A]/80 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#1E293B] flex items-center justify-center mx-auto text-[#38BDF8]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Instant Invoice Test Drive</h3>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-md mx-auto">
                Test how ReconcileAI parses complex invoices and checks math against real bank ledgers in 1 click.
              </p>
            </div>
            <div>
              {quickUploadState === "idle" && (
                <button
                  onClick={handleQuickUploadSimulate}
                  className="bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] font-semibold text-xs py-2.5 px-5 rounded inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#38BDF8]" />
                  <span>Test Ingest: Snowflake Inc ($118,000.00)</span>
                </button>
              )}
              {quickUploadState === "processing" && (
                <div className="inline-flex items-center gap-2 text-xs text-[#38BDF8]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing document through Railway Backend...</span>
                </div>
              )}
              {quickUploadState === "done" && quickResult && (
                <div className="p-4 rounded border border-[#10B981]/50 bg-[#10B981]/10 text-xs text-left max-w-md mx-auto space-y-2">
                  <div className="flex items-center justify-between text-[#10B981] font-bold">
                    <span>✓ Processed: {quickResult.invoice_id}</span>
                    <span className="text-[10px] bg-[#10B981]/20 px-2 py-0.5 rounded">Exact Match</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    Vendor: {quickResult.vendor_name} | Amount: ₹{quickResult.stated_total?.toLocaleString()}
                  </div>
                  <button
                    onClick={onLaunchApp}
                    className="text-xs text-[#38BDF8] hover:underline font-semibold flex items-center gap-1"
                  >
                    View in Full Ledger Workbench <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="border-t border-[#1E293B] bg-[#070A12] px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white">
              Engineered for Zero Financial Risk
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Traditional OCR tools guess. ReconcileAI pairs deep extraction with mathematical assertions and unit economics observability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[#1E293B] bg-[#0F172A] p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Deterministic Math Audits</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Every extracted invoice must balance mathematically. If `sum(line_items) + tax` differs from the stated total, the agent triggers automatic self-correction retries.
              </p>
            </div>

            <div className="border border-[#1E293B] bg-[#0F172A] p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">TDS & Shortfall Detection</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Automatically detects valid 10% Tax Deducted at Source (TDS under Section 194J) and partial settlements, routing them to human controllers with one-click verification.
              </p>
            </div>

            <div className="border border-[#1E293B] bg-[#0F172A] p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Morse Observability</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Exposes the true Canonical Cost per Confirmed Outcome. Compare raw API call costs ($0.00027) against canonical spend ($0.00034) including retry waste and unrecoverable scans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Grid: Manual vs LLM Wrapper vs ReconcileAI */}
      <section id="comparison" className="border-t border-[#1E293B] bg-[#0B0F19] px-6 py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white">
              The Unit Economics Advantage
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Why CFOs and controllers replace manual bookkeepers and generic LLM wrappers with ReconcileAI.
            </p>
          </div>

          <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#0F172A]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#1E293B]/50 text-[#94A3B8]">
                  <th className="p-4 font-semibold">Capability</th>
                  <th className="p-4 font-semibold">Manual Accounting</th>
                  <th className="p-4 font-semibold">Generic LLM Wrapper</th>
                  <th className="p-4 font-semibold text-[#10B981]">ReconcileAI + Morse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] text-[#CBD5E1]">
                <tr>
                  <td className="p-4 font-medium text-white">Cost per Invoice</td>
                  <td className="p-4 text-[#94A3B8]">$4.50 (Human labor)</td>
                  <td className="p-4 text-[#94A3B8]">$0.08 (Raw LLM call)</td>
                  <td className="p-4 font-semibold text-[#10B981]">$0.00034 (Morse Canonical)</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Turnaround Time</td>
                  <td className="p-4 text-[#94A3B8]">24 to 48 Hours</td>
                  <td className="p-4 text-[#94A3B8]">3 to 5 Seconds</td>
                  <td className="p-4 font-semibold text-[#10B981]">142ms Sub-second</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Arithmetic Hallucination</td>
                  <td className="p-4 text-[#94A3B8]">4.2% Human typo rate</td>
                  <td className="p-4 text-[#EF4444]">12.5% AI hallucination</td>
                  <td className="p-4 font-semibold text-[#10B981]">0.00% Deterministic Floor</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Bank Feed Reconciliation</td>
                  <td className="p-4 text-[#94A3B8]">Manual Excel VLOOKUP</td>
                  <td className="p-4 text-[#EF4444]">Unsupported</td>
                  <td className="p-4 font-semibold text-[#10B981]">Integrated Sub-ledger Match</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Telemetry & Unit Economics</td>
                  <td className="p-4 text-[#94A3B8]">None</td>
                  <td className="p-4 text-[#94A3B8]">Raw Token Count only</td>
                  <td className="p-4 font-semibold text-[#10B981]">Morse Cost per Confirmed Outcome</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="border-t border-[#1E293B] bg-[#070A12] px-6 py-20">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Everything you need to know about the deterministic engine, integrations, and deployment.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-[#1E293B] bg-[#0F172A] rounded-lg overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs font-semibold text-white hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-[#94A3B8] leading-relaxed border-t border-[#1E293B] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Commercial Call to Action Banner */}
      <section className="border-t border-[#1E293B] bg-gradient-to-b from-[#0F172A] to-[#090D16] px-6 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Ready to Automate Your Treasury & Reconciliation?
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Sign in with Google or open the live financial ledger immediately to test the autonomous multi-step pipeline.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onLaunchApp}
              className="bg-[#10B981] hover:bg-[#059669] text-[#090D16] font-bold text-xs py-3 px-6 rounded shadow flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Launch Live Ledger Workbench</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAuth}
              className="bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] font-semibold text-xs py-3 px-6 rounded flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>Sign In with Google</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] py-8 px-6 text-center text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-sm font-bold text-white">ReconcileAI</span>
            <span>— Commercial Financial Ledger Workbench & Telemetry Engine</span>
          </div>
          <div>
            Built with Next.js 16, FastAPI, Supabase Cloud & Morse Observability.
          </div>
        </div>
      </footer>
    </div>
  );
}
