"use client";

import React from "react";
import { UnitEconomicsStats } from "@/lib/types";
import {
  BarChart3,
  TrendingDown,
  Coins,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

interface AnalyticsViewProps {
  stats: UnitEconomicsStats | null;
}

export function AnalyticsView({ stats }: AnalyticsViewProps) {
  const confirmedRate = stats?.confirmed_rate_str || "24 / 30 Labeled";
  const confirmedPct = stats ? `${stats.confirmed_percentage}%` : "80.0%";
  const totalSpend = stats ? `$${stats.total_telemetry_spend_usd.toFixed(5)}` : "$0.00823";
  const canonicalCost = stats ? `$${stats.canonical_cost_per_confirmed_usd.toFixed(5)}` : "$0.00034";
  const rawCost = stats ? `$${stats.raw_cost_per_call_usd.toFixed(5)}` : "$0.00027";
  const retryWaste = stats ? `$${stats.retry_waste_spend_usd.toFixed(5)}` : "$0.00071";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-editorial text-2xl font-bold text-[#141413]">
          Morse Observability & Unit Economics
        </h2>
        <p className="text-xs text-[#615F59] mt-1">
          Honest telemetry auditing the cost delta between raw LLM API calls and canonical confirmed outcomes.
        </p>
      </div>

      {/* Hero Comparative Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Raw Call View */}
        <div className="border border-[#EBE9E1] rounded-lg p-5 bg-[#FFFFFF] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8980]">
              Traditional APM Metric
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF9F5] text-[#615F59] border border-[#EBE9E1]">
              Naive View
            </span>
          </div>

          <div>
            <div className="num text-3xl font-bold text-[#141413]">{rawCost}</div>
            <div className="text-xs font-medium text-[#615F59] mt-0.5">Average Spend per API Call</div>
          </div>

          <p className="text-[11px] text-[#8C8980] leading-relaxed pt-2 border-t border-[#EBE9E1]">
            Averages every prompt invocation regardless of whether the extracted data balanced mathematically or hallucinated.
          </p>
        </div>

        {/* Card 2: Morse Canonical Honest Number */}
        <div className="border-2 border-[#1B5E3A] rounded-lg p-5 bg-[#FFFFFF] shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#1B5E3A]">
              Morse Canonical Unit Cost
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#E6F2EB] text-[#1B5E3A] font-semibold border border-[#C2E2CF]">
              True Enterprise Cost
            </span>
          </div>

          <div>
            <div className="num text-3xl font-bold text-[#1B5E3A]">{canonicalCost}</div>
            <div className="text-xs font-semibold text-[#141413] mt-0.5">
              Cost per Confirmed Reconciled Outcome (+25.9% Delta)
            </div>
          </div>

          <p className="text-[11px] text-[#615F59] leading-relaxed pt-2 border-t border-[#EBE9E1]">
            Total LLM spend (including failed runs and wasted self-correction retries) divided strictly by auditor-approved reconciliations.
          </p>
        </div>
      </div>

      {/* Quantitative Analysis Breakdown Table */}
      <div className="border border-[#EBE9E1] rounded bg-[#FFFFFF] overflow-hidden">
        <div className="p-4 border-b border-[#EBE9E1] bg-[#FAF9F5] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[#141413]">
            30-Invoice Telemetry Simulation Breakdown
          </h3>
          <span className="text-[11px] text-[#8C8980]">Deterministic Floor + Morse Traces</span>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded bg-[#FAF9F5] border border-[#EBE9E1]">
              <span className="text-[10px] uppercase text-[#8C8980] block font-medium">Clean Reconciliations</span>
              <span className="num text-xl font-bold text-[#1B5E3A] block mt-1">18 / 30</span>
              <span className="text-[10px] text-[#615F59]">Zero Variance ($0.00)</span>
            </div>
            <div className="p-3 rounded bg-[#FAF9F5] border border-[#EBE9E1]">
              <span className="text-[10px] uppercase text-[#8C8980] block font-medium">TDS / Shortfalls Flagged</span>
              <span className="num text-xl font-bold text-[#9A5B13] block mt-1">6 / 30</span>
              <span className="text-[10px] text-[#615F59]">10% Sec 194J Review</span>
            </div>
            <div className="p-3 rounded bg-[#FAF9F5] border border-[#EBE9E1]">
              <span className="text-[10px] uppercase text-[#8C8980] block font-medium">Deterministic Math Fails</span>
              <span className="num text-xl font-bold text-[#A62626] block mt-1">6 / 30</span>
              <span className="text-[10px] text-[#615F59]">Rejected after 2 retries</span>
            </div>
            <div className="p-3 rounded bg-[#FAF9F5] border border-[#EBE9E1]">
              <span className="text-[10px] uppercase text-[#8C8980] block font-medium">Wasted Retry Tokens</span>
              <span className="num text-xl font-bold text-[#141413] block mt-1">4,740 tok</span>
              <span className="text-[10px] text-[#A62626]">+{retryWaste} Burn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
