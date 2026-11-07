"use client";

import React, { useState } from "react";
import { Invoice, TelemetryTrace } from "@/lib/types";
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Coins,
  ChevronDown,
  ChevronRight,
  FileText,
  Building,
  Scale,
  GitBranch,
} from "lucide-react";

interface TraceInspectorProps {
  invoice: Invoice | null;
  telemetry: TelemetryTrace | null;
  onClose: () => void;
  onConfirmOutcome: (invoiceId: string, verdict: "confirmed" | "rejected") => Promise<void>;
}

export function TraceInspector({
  invoice,
  telemetry,
  onClose,
  onConfirmOutcome,
}: TraceInspectorProps) {
  const [copiedTrace, setCopiedTrace] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedSpans, setExpandedSpans] = useState<Record<string, boolean>>({
    span_0: true,
    span_1: true,
  });
  const [showRawPayload, setShowRawPayload] = useState(false);

  if (!invoice) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center text-[#8C8980] bg-[#FAF9F5] border-l border-[#EBE9E1]">
        <div>
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#615F59]" />
          <p className="text-xs">Select any row from the ledger table to inspect its Morse trace and reconciliation diff.</p>
        </div>
      </div>
    );
  }

  const handleCopyTrace = () => {
    if (invoice.morse_trace_id) {
      navigator.clipboard.writeText(invoice.morse_trace_id);
      setCopiedTrace(true);
      setTimeout(() => setCopiedTrace(false), 2000);
    }
  };

  const toggleSpan = (id: string) => {
    setExpandedSpans((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOutcomeAction = async (verdict: "confirmed" | "rejected") => {
    setIsUpdating(true);
    try {
      await onConfirmOutcome(invoice.invoice_id, verdict);
    } finally {
      setIsUpdating(false);
    }
  };

  const isShortfall = invoice.morse_outcome === "reconciled_tds_or_shortfall";
  const isMathFailed = invoice.morse_outcome === "math_audit_failed";
  const isExact = invoice.morse_outcome === "reconciled_exact";

  return (
    <div className="h-full flex flex-col bg-[#FFFFFF] border-l border-[#EBE9E1] overflow-y-auto">
      {/* Inspector Header */}
      <div className="p-4 border-b border-[#EBE9E1] bg-[#FAF9F5] sticky top-0 z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="num font-semibold text-sm text-[#141413]">
                {invoice.invoice_id}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded border border-[#D4D1C5] bg-[#FFFFFF] text-[#615F59]">
                v1.0.0
              </span>
            </div>
            <h2 className="text-xs text-[#615F59] font-medium mt-0.5 truncate max-w-[260px]">
              {invoice.vendor_name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#EBE9E1] text-[#615F59]"
            title="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trace ID Strip */}
        <div className="mt-3 flex items-center justify-between p-2 rounded bg-[#F0EEE6] border border-[#EBE9E1] text-[11px]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[#8C8980]">Trace:</span>
            <span className="num font-medium text-[#141413] truncate">
              {invoice.morse_trace_id}
            </span>
          </div>
          <button
            onClick={handleCopyTrace}
            className="text-[#615F59] hover:text-[#141413] p-0.5"
            title="Copy Trace ID"
          >
            {copiedTrace ? <Check className="w-3.5 h-3.5 text-[#1B5E3A]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Telemetry Strip: Tokens, Latency, Cost */}
        <div className="grid grid-cols-3 gap-2 mt-2 text-center text-[10px]">
          <div className="p-1.5 rounded border border-[#EBE9E1] bg-[#FFFFFF]">
            <span className="block text-[#8C8980]">Latency</span>
            <span className="num font-medium text-[#141413]">
              {telemetry?.latency_ms ? `${telemetry.latency_ms} ms` : "< 10 ms"}
            </span>
          </div>
          <div className="p-1.5 rounded border border-[#EBE9E1] bg-[#FFFFFF]">
            <span className="block text-[#8C8980]">Tokens</span>
            <span className="num font-medium text-[#141413]">
              {invoice.token_spend.toLocaleString()}
            </span>
          </div>
          <div className="p-1.5 rounded border border-[#EBE9E1] bg-[#FFFFFF]">
            <span className="block text-[#8C8980]">Spend</span>
            <span className="num font-medium text-[#141413]">
              ${invoice.estimated_cost_usd.toFixed(5)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Human-in-the-Loop Delayed Outcome Banner (for shortfalls / pending items) */}
        {isShortfall && (
          <div className="p-3 rounded border border-[#F5DEC2] bg-[#FDF3E7]">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-[#9A5B13]" />
              <span className="text-xs font-semibold text-[#9A5B13]">
                Human-in-the-Loop Outcome Action
              </span>
            </div>
            <p className="text-[11px] text-[#615F59] mb-3 leading-relaxed">
              Variance matches standard 10% TDS withholding under Section 194J. Confirming marks the trace as a successful reconciled outcome in Morse telemetry.
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={isUpdating || invoice.human_verdict === "confirmed"}
                onClick={() => handleOutcomeAction("confirmed")}
                className="flex-1 py-1.5 px-2 text-xs font-medium rounded bg-[#1B5E3A] text-white hover:bg-[#15462B] transition-colors disabled:opacity-50"
              >
                {invoice.human_verdict === "confirmed" ? "Outcome Confirmed ✓" : "Confirm Outcome"}
              </button>
              <button
                disabled={isUpdating || invoice.human_verdict === "rejected"}
                onClick={() => handleOutcomeAction("rejected")}
                className="py-1.5 px-3 text-xs font-medium rounded border border-[#A62626] text-[#A62626] hover:bg-[#FCEAEA] transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Line-Item Math Check */}
        <div className="border border-[#EBE9E1] rounded overflow-hidden">
          <div className="bg-[#FAF9F5] px-3 py-2 border-b border-[#EBE9E1] flex items-center justify-between">
            <span className="text-xs font-medium text-[#141413] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#615F59]" />
              Line-Item Math Audit
            </span>
            {invoice.math_valid === 1 ? (
              <span className="text-[10px] text-[#1B5E3A] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Balanced
              </span>
            ) : (
              <span className="text-[10px] text-[#A62626] font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Failed ({invoice.retry_count} retries)
              </span>
            )}
          </div>

          <div className="p-3 text-xs">
            <table className="w-full text-left border-collapse mb-2">
              <thead>
                <tr className="text-[#8C8980] border-b border-[#EBE9E1] text-[10px]">
                  <th className="py-1">Description</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F6F2]">
                {invoice.line_items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1 text-[#141413]">{item.description}</td>
                    <td className="py-1 text-right num text-[#141413]">
                      {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-1 text-[#615F59]">Tax / GST</td>
                  <td className="py-1 text-right num text-[#615F59]">
                    {invoice.tax_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="pt-2 border-t border-[#EBE9E1] flex justify-between items-center text-xs">
              <span className="text-[#615F59]">Computed Sum:</span>
              <span className="num font-medium text-[#141413]">
                {(invoice.line_items_sum + invoice.tax_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-[#615F59]">Stated Document Total:</span>
              <span className="num font-semibold text-[#141413]">
                {invoice.stated_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {invoice.math_discrepancy > 0 && (
              <div className="mt-2 p-2 rounded bg-[#FCEAEA] text-[#A62626] text-[11px] flex items-center justify-between">
                <span>Discrepancy Delta:</span>
                <span className="num font-bold">
                  {invoice.math_discrepancy.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Bank Deposit Match & Variance */}
        <div className="border border-[#EBE9E1] rounded overflow-hidden">
          <div className="bg-[#FAF9F5] px-3 py-2 border-b border-[#EBE9E1] flex items-center justify-between">
            <span className="text-xs font-medium text-[#141413] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#615F59]" />
              Bank Deposit Matching
            </span>
            <span className="text-[10px] text-[#615F59]">SQLite Ledger</span>
          </div>

          <div className="p-3 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#615F59]">Bank Deposit Amount:</span>
              <span className="num font-medium text-[#141413]">
                {invoice.bank_deposit_amount !== null
                  ? invoice.bank_deposit_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })
                  : "No deposit record found"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#615F59]">Shortfall / Variance:</span>
              <span className={`num font-semibold ${
                invoice.shortfall_variance && invoice.shortfall_variance > 0
                  ? "text-[#9A5B13]"
                  : invoice.shortfall_variance === 0
                  ? "text-[#1B5E3A]"
                  : "text-[#8C8980]"
              }`}>
                {invoice.shortfall_variance !== null
                  ? `₹${invoice.shortfall_variance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  : "N/A"}
              </span>
            </div>

            {isShortfall && invoice.shortfall_variance && (
              <div className="p-2 rounded bg-[#FDF3E7] text-[#9A5B13] text-[10px] leading-snug">
                <strong>Analysis:</strong> Variance of ₹{invoice.shortfall_variance.toLocaleString()} corresponds to 10.0% TDS deduction under Section 194J on professional/technical services.
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Morse Span Timeline */}
        <div className="border border-[#EBE9E1] rounded overflow-hidden">
          <div className="bg-[#FAF9F5] px-3 py-2 border-b border-[#EBE9E1] flex items-center justify-between">
            <span className="text-xs font-medium text-[#141413] flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#615F59]" />
              Morse Span Execution Timeline
            </span>
            <span className="num text-[10px] text-[#8C8980]">
              {telemetry?.spans.length || 0} spans
            </span>
          </div>

          <div className="divide-y divide-[#EBE9E1]">
            {telemetry?.spans && telemetry.spans.length > 0 ? (
              telemetry.spans.map((s, idx) => {
                const isExpanded = expandedSpans[`span_${idx}`];
                const isFail = s.name.includes("retry") || s.status === "error";

                return (
                  <div key={s.span_id || idx} className="text-xs">
                    <button
                      onClick={() => toggleSpan(`span_${idx}`)}
                      className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#FAF9F5] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-[#8C8980]" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-[#8C8980]" />
                        )}
                        <span className={`font-mono text-[11px] ${isFail ? "text-[#A62626] font-semibold" : "text-[#141413]"}`}>
                          {s.name}
                        </span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-[#F0EEE6] text-[#615F59]">
                          {s.span_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 num text-[10px] text-[#615F59]">
                        <span>{s.tokens} tok</span>
                        <span>{s.duration_ms} ms</span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-2.5 pt-1 bg-[#FDFCFB] text-[10px] font-mono space-y-1">
                        {s.input && (
                          <div>
                            <span className="text-[#8C8980]">input:</span>
                            <pre className="p-1.5 rounded bg-[#F7F6F2] text-[#615F59] overflow-x-auto whitespace-pre-wrap">
                              {s.input}
                            </pre>
                          </div>
                        )}
                        {s.output && (
                          <div>
                            <span className="text-[#8C8980]">output:</span>
                            <pre className="p-1.5 rounded bg-[#F7F6F2] text-[#141413] overflow-x-auto whitespace-pre-wrap">
                              {s.output}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-xs text-[#8C8980]">
                Span timeline details recorded in local telemetry mirror.
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Raw OCR / Document Payload */}
        <div className="border border-[#EBE9E1] rounded overflow-hidden">
          <button
            onClick={() => setShowRawPayload(!showRawPayload)}
            className="w-full bg-[#FAF9F5] px-3 py-2 flex items-center justify-between text-xs font-medium text-[#141413]"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#615F59]" />
              Raw OCR / Document Text
            </span>
            {showRawPayload ? <ChevronDown className="w-3 h-3 text-[#8C8980]" /> : <ChevronRight className="w-3 h-3 text-[#8C8980]" />}
          </button>

          {showRawPayload && (
            <div className="p-3 bg-[#FDFCFB] border-t border-[#EBE9E1]">
              <pre className="text-[11px] font-mono text-[#615F59] whitespace-pre-wrap leading-relaxed p-2 rounded bg-[#F7F6F2]">
                {invoice.raw_ocr_payload || "No raw text available"}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
