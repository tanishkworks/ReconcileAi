"use client";

import React from "react";
import { UnitEconomicsStats } from "@/lib/types";
import { Play, RotateCcw, Plus, Radio, ArrowUpRight } from "lucide-react";

interface HeaderMetricsProps {
  stats: UnitEconomicsStats | null;
  isRunningBatch: boolean;
  onRunBatch: () => void;
  onReset: () => void;
  onOpenIngest: () => void;
}

export function HeaderMetrics({
  stats,
  isRunningBatch,
  onRunBatch,
  onReset,
  onOpenIngest,
}: HeaderMetricsProps) {
  const confirmedRate = stats?.confirmed_rate_str || "0 / 0 Labeled";
  const confirmedPct = stats ? `${stats.confirmed_percentage}%` : "0.0%";
  const totalSpend = stats ? `$${stats.total_telemetry_spend_usd.toFixed(5)}` : "$0.00000";
  const canonicalCost = stats ? `$${stats.canonical_cost_per_confirmed_usd.toFixed(5)}` : "$0.00000";
  const rawCost = stats ? `$${stats.raw_cost_per_call_usd.toFixed(5)}` : "$0.00000";
  const retryWaste = stats ? `$${stats.retry_waste_spend_usd.toFixed(5)}` : "$0.00000";
  const morseBadge = stats?.morse_sdk_status.badge || "Morse Local Mirror";
  const isLiveMorse = stats?.morse_sdk_status.active || false;

  return (
    <header className="border-b border-[#EBE9E1] bg-[#FFFFFF] px-6 py-5">
      {/* Top Bar: Title & Primary Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-editorial text-2xl md:text-3xl font-semibold tracking-tight text-[#141413]">
              ReconcileAI
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded border border-[#EBE9E1] bg-[#F7F6F2] text-[#615F59]">
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveMorse ? "bg-[#1B5E3A]" : "bg-[#9A5B13]"}`} />
              {morseBadge}
            </span>
          </div>
          <p className="text-xs text-[#615F59] mt-0.5">
            Autonomous B2B Invoice & Bank Ledger Reconciliation Workbench with Morse Telemetry
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenIngest}
            className="btn-ledger"
            title="Upload or paste custom invoice payload"
          >
            <Plus className="w-3.5 h-3.5 text-[#615F59]" />
            Ingest Invoice
          </button>

          <button
            onClick={onReset}
            className="btn-ledger"
            title="Reset SQLite ledger database"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#615F59]" />
            Reset Ledger
          </button>

          <button
            onClick={onRunBatch}
            disabled={isRunningBatch}
            className="btn-ledger-primary disabled:opacity-50"
          >
            {isRunningBatch ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Simulating 30 Traces...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run 30-Invoice Telemetry Batch
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Crisp Bordered Unit Economics Metric Cells */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Cell 1: Confirmed Outcome Rate */}
        <div className="border border-[#EBE9E1] bg-[#FDFCFB] p-3 rounded">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#615F59]">
            Confirmed Outcome Rate
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="num text-xl font-semibold text-[#141413]">
              {confirmedPct}
            </span>
            <span className="num text-xs text-[#615F59]">
              ({confirmedRate})
            </span>
          </div>
          <div className="text-[10px] text-[#8C8980] mt-1">
            18 Exact + 6 TDS vs 6 Corrupt
          </div>
        </div>

        {/* Cell 2: Total Telemetry Spend */}
        <div className="border border-[#EBE9E1] bg-[#FDFCFB] p-3 rounded">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#615F59]">
            Total Telemetry Spend
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="num text-xl font-semibold text-[#141413]">
              {totalSpend}
            </span>
            <span className="num text-[11px] text-[#A62626]">
              +{retryWaste} waste
            </span>
          </div>
          <div className="text-[10px] text-[#8C8980] mt-1">
            {stats?.total_tokens.toLocaleString() || 0} tokens ({stats?.retry_tokens.toLocaleString() || 0} retry)
          </div>
        </div>

        {/* Cell 3: Canonical Cost per Confirmed Outcome */}
        <div className="border border-[#EBE9E1] bg-[#FDFCFB] p-3 rounded">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#615F59]">
            Canonical Cost / Confirmed
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="num text-xl font-semibold text-[#1B5E3A]">
              {canonicalCost}
            </span>
            <span className="num text-[11px] text-[#615F59]">
              raw: {rawCost}
            </span>
          </div>
          <div className="text-[10px] text-[#8C8980] mt-1">
            Total Spend ÷ Confirmed Successes
          </div>
        </div>

        {/* Cell 4: Morse SDK Status & Attribution */}
        <div className="border border-[#EBE9E1] bg-[#FDFCFB] p-3 rounded">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#615F59]">
            Morse Observability Status
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-2 h-2 rounded-full ${isLiveMorse ? "bg-[#1B5E3A] animate-pulse" : "bg-[#9A5B13]"}`} />
            <span className="text-sm font-medium text-[#141413]">
              {isLiveMorse ? "OTLP Stream Connected" : "Local Database Mirror"}
            </span>
          </div>
          <div className="text-[10px] text-[#8C8980] mt-1 truncate">
            {stats?.morse_sdk_status.endpoint || "https://api.morsehq.dev"}
          </div>
        </div>
      </div>
    </header>
  );
}
