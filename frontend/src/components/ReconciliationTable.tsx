"use client";

import React, { useState } from "react";
import { Invoice } from "@/lib/types";
import { Search, AlertCircle, CheckCircle2, AlertTriangle, Eye, ArrowRight } from "lucide-react";

interface ReconciliationTableProps {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  onSelectInvoice: (invoice: Invoice) => void;
  filterStatus: string;
  onFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ReconciliationTable({
  invoices,
  selectedInvoice,
  onSelectInvoice,
  filterStatus,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: ReconciliationTableProps) {
  const counts = {
    all: invoices.length,
    exact: invoices.filter((i) => i.morse_outcome === "reconciled_exact").length,
    shortfall: invoices.filter((i) => i.morse_outcome === "reconciled_tds_or_shortfall").length,
    math_failed: invoices.filter((i) => i.morse_outcome === "math_audit_failed").length,
  };

  const getVerdictBadge = (outcome: string) => {
    switch (outcome) {
      case "reconciled_exact":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#E6F2EB] text-[#1B5E3A] border border-[#C2E2CF]">
            <CheckCircle2 className="w-3 h-3" />
            Reconciled Exact
          </span>
        );
      case "reconciled_tds_or_shortfall":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#FDF3E7] text-[#9A5B13] border border-[#F5DEC2]">
            <AlertTriangle className="w-3 h-3" />
            TDS / Shortfall Flagged
          </span>
        );
      case "math_audit_failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#FCEAEA] text-[#A62626] border border-[#F7C8C8]">
            <AlertCircle className="w-3 h-3" />
            Math Audit Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7F6F2] text-[#615F59] border border-[#EBE9E1]">
            {outcome}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF]">
      {/* Table Toolbar & Filter Tabs */}
      <div className="p-4 border-b border-[#EBE9E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F5]">
        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 bg-[#EBE9E1] p-0.5 rounded text-xs">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1 font-medium rounded transition-colors ${
              filterStatus === "all"
                ? "bg-[#FFFFFF] text-[#141413] shadow-xs"
                : "text-[#615F59] hover:text-[#141413]"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => onFilterChange("exact")}
            className={`px-3 py-1 font-medium rounded transition-colors ${
              filterStatus === "exact"
                ? "bg-[#FFFFFF] text-[#1B5E3A] shadow-xs"
                : "text-[#615F59] hover:text-[#141413]"
            }`}
          >
            Exact ({counts.exact})
          </button>
          <button
            onClick={() => onFilterChange("shortfall")}
            className={`px-3 py-1 font-medium rounded transition-colors ${
              filterStatus === "shortfall"
                ? "bg-[#FFFFFF] text-[#9A5B13] shadow-xs"
                : "text-[#615F59] hover:text-[#141413]"
            }`}
          >
            TDS Shortfall ({counts.shortfall})
          </button>
          <button
            onClick={() => onFilterChange("math_failed")}
            className={`px-3 py-1 font-medium rounded transition-colors ${
              filterStatus === "math_failed"
                ? "bg-[#FFFFFF] text-[#A62626] shadow-xs"
                : "text-[#615F59] hover:text-[#141413]"
            }`}
          >
            Failed Math ({counts.math_failed})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#8C8980] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor or invoice ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-[#FFFFFF] border border-[#D4D1C5] rounded focus:outline-none focus:border-[#141413] text-[#141413] placeholder-[#8C8980]"
          />
        </div>
      </div>

      {/* Dense Ledger Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EBE9E1] bg-[#F7F6F2] text-[#615F59] font-medium">
              <th className="py-2.5 px-3">Invoice ID</th>
              <th className="py-2.5 px-3">Vendor</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3 text-right">Line Sum + Tax vs Stated</th>
              <th className="py-2.5 px-3 text-right">Bank Deposit</th>
              <th className="py-2.5 px-3 text-right">Shortfall</th>
              <th className="py-2.5 px-2 text-center">Retries</th>
              <th className="py-2.5 px-3">Morse Verdict</th>
              <th className="py-2.5 px-3 text-right">Cost</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE9E1]">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#8C8980]">
                  No matching invoice records found in ledger.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const isSelected = selectedInvoice?.invoice_id === inv.invoice_id;
                const calculatedSum = inv.line_items_sum + inv.tax_amount;
                const hasMathMismatch = inv.math_valid === 0;

                return (
                  <tr
                    key={inv.invoice_id}
                    onClick={() => onSelectInvoice(inv)}
                    className={`cursor-pointer transition-colors hover:bg-[#F8F7F3] ${
                      isSelected ? "bg-[#F0EEE6] font-medium" : ""
                    }`}
                  >
                    {/* Invoice ID */}
                    <td className="py-2.5 px-3 num font-medium text-[#141413] whitespace-nowrap">
                      {inv.invoice_id}
                    </td>

                    {/* Vendor */}
                    <td className="py-2.5 px-3 text-[#141413] max-w-[180px] truncate" title={inv.vendor_name}>
                      {inv.vendor_name}
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-3 text-[#615F59] whitespace-nowrap">
                      {inv.invoice_date}
                    </td>

                    {/* Line Sum + Tax vs Stated */}
                    <td className="py-2.5 px-3 text-right num whitespace-nowrap">
                      {hasMathMismatch ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[#A62626] font-semibold">
                            {calculatedSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-[#8C8980] line-through">
                            stated: {inv.stated_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#141413]">
                          {inv.stated_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>

                    {/* Bank Deposit */}
                    <td className="py-2.5 px-3 text-right num whitespace-nowrap">
                      {inv.bank_deposit_amount !== null && inv.bank_deposit_amount !== undefined ? (
                        <span className="text-[#141413]">
                          {inv.bank_deposit_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-[#8C8980]">N/A</span>
                      )}
                    </td>

                    {/* Shortfall */}
                    <td className="py-2.5 px-3 text-right num whitespace-nowrap">
                      {inv.shortfall_variance !== null && inv.shortfall_variance > 0 ? (
                        <span className="text-[#9A5B13] font-semibold">
                          +{inv.shortfall_variance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      ) : inv.shortfall_variance === 0 ? (
                        <span className="text-[#1B5E3A]">₹0.00</span>
                      ) : (
                        <span className="text-[#8C8980]">N/A</span>
                      )}
                    </td>

                    {/* Retries */}
                    <td className="py-2.5 px-2 text-center num">
                      {inv.retry_count > 0 ? (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] bg-[#FCEAEA] text-[#A62626] font-medium">
                          {inv.retry_count} retries
                        </span>
                      ) : (
                        <span className="text-[#8C8980]">0</span>
                      )}
                    </td>

                    {/* Morse Verdict */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getVerdictBadge(inv.morse_outcome)}
                    </td>

                    {/* Cost */}
                    <td className="py-2.5 px-3 text-right num text-[#615F59] whitespace-nowrap">
                      ${inv.estimated_cost_usd.toFixed(5)}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInvoice(inv);
                        }}
                        className="p-1 rounded hover:bg-[#EBE9E1] text-[#615F59] hover:text-[#141413]"
                        title="View Trace & Ledger Diff"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
