"use client";

import React, { useState } from "react";
import { X, Sparkles, Plus, Trash2, ArrowRight } from "lucide-react";
import { reconcileSingleInvoice } from "@/lib/api";
import { Invoice } from "@/lib/types";

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (newInvoice: Invoice) => void;
}

export function IngestionModal({
  isOpen,
  onClose,
  onInvoiceCreated,
}: IngestionModalProps) {
  const [vendorName, setVendorName] = useState("Vercel Inc");
  const [invoiceId, setInvoiceId] = useState(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [invoiceDate, setInvoiceDate] = useState("2026-03-31");
  const [lineItems, setLineItems] = useState([
    { description: "Vercel Enterprise Fluid Compute Units", amount: 1200 },
    { description: "AI Gateway Cached Ingestion Tier", amount: 350 },
  ]);
  const [taxAmount, setTaxAmount] = useState(279);
  const [statedTotal, setStatedTotal] = useState(1829);
  const [rawText, setRawText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddLine = () => {
    setLineItems([...lineItems, { description: "Additional Line Item", amount: 100 }]);
  };

  const handleRemoveLine = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: "description" | "amount", val: any) => {
    const updated = [...lineItems];
    if (field === "amount") {
      updated[idx].amount = parseFloat(val) || 0;
    } else {
      updated[idx].description = val;
    }
    setLineItems(updated);
  };

  const loadPreset = (type: "clean" | "tds" | "corrupt") => {
    if (type === "clean") {
      setVendorName("Cloudflare Inc");
      setInvoiceId("INV-TEST-CLEAN");
      setLineItems([
        { description: "Enterprise Edge CDN Bandwidth", amount: 1800 },
        { description: "Advanced DDoS Bot Management", amount: 600 },
      ]);
      setTaxAmount(432);
      setStatedTotal(2832);
      setRawText("CLOUDFLARE INC. Invoice #INV-TEST-CLEAN\nSubtotal: $2,400.00\nTax: $432.00\nTotal Due: $2,832.00");
    } else if (type === "tds") {
      setVendorName("Ernst & Young LLP India");
      setInvoiceId("INV-TEST-TDS");
      setLineItems([
        { description: "Statutory Financial Audit Retainer Fee", amount: 350000 },
        { description: "Direct & International Tax Advisory", amount: 73728.81 },
      ]);
      setTaxAmount(76271.19);
      setStatedTotal(500000);
      setRawText("ERNST & YOUNG LLP INDIA\nTax Invoice: INV-TEST-TDS\nAudit: INR 3,50,000.00\nTax Advisory: INR 73,728.81\nGST: INR 76,271.19\nGross Total: INR 5,00,000.00 (Subject to 10% TDS Sec 194J)");
    } else {
      setVendorName("Apex Logistics Services");
      setInvoiceId("INV-TEST-CORRUPT");
      setLineItems([
        { description: "Interstate Freight Dispatch MH-KA", amount: 32000 },
        { description: "Pallet Handling & Cold Chain Storage", amount: 16500 },
      ]);
      setTaxAmount(8730);
      setStatedTotal(62400); // Mismatch: 57,230 vs 62,400
      setRawText("[CORRUPTED SCAN] APEX LOG1STICS\nLine 1: 32000.00\nLine 2: 16500.00\nTax: 8730.00\nCLAIMED TOTAL: 62,400.00 [Intentional Discrepancy]");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await reconcileSingleInvoice({
        vendor_name: vendorName,
        invoice_id: invoiceId,
        invoice_date: invoiceDate,
        line_items: lineItems,
        tax_amount: taxAmount,
        stated_total: statedTotal,
        raw_text: rawText || `Invoice from ${vendorName} total: ${statedTotal}`,
      });

      onInvoiceCreated(res as unknown as Invoice);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141413]/40 p-4">
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#D4D1C5] rounded shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#EBE9E1] bg-[#FAF9F5] flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-lg font-semibold text-[#141413]">
              Ingest Document or Webhook Payload
            </h3>
            <p className="text-xs text-[#615F59]">
              Reconcile custom invoice through OCR extraction, math audit, and bank ledger matching.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#EBE9E1] text-[#615F59]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Buttons */}
        <div className="px-5 py-2.5 bg-[#F7F6F2] border-b border-[#EBE9E1] flex items-center gap-2 text-xs">
          <span className="text-[#8C8980]">Quick Presets:</span>
          <button
            type="button"
            onClick={() => loadPreset("clean")}
            className="px-2 py-0.5 rounded border border-[#C2E2CF] bg-[#E6F2EB] text-[#1B5E3A] hover:opacity-90"
          >
            Clean Match
          </button>
          <button
            type="button"
            onClick={() => loadPreset("tds")}
            className="px-2 py-0.5 rounded border border-[#F5DEC2] bg-[#FDF3E7] text-[#9A5B13] hover:opacity-90"
          >
            10% TDS Shortfall
          </button>
          <button
            type="button"
            onClick={() => loadPreset("corrupt")}
            className="px-2 py-0.5 rounded border border-[#F7C8C8] bg-[#FCEAEA] text-[#A62626] hover:opacity-90"
          >
            Corrupted Math
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded bg-[#FCEAEA] border border-[#F7C8C8] text-[#A62626]">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#615F59] font-medium mb-1">Vendor Name</label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D4D1C5] rounded text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>
            <div>
              <label className="block text-[#615F59] font-medium mb-1">Invoice ID / Reference</label>
              <input
                type="text"
                required
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D4D1C5] rounded num text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[#615F59] font-medium">Extracted Line Items</label>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-[11px] text-[#141413] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Line
              </button>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto border border-[#EBE9E1] p-2 rounded bg-[#FAF9F5]">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleLineChange(idx, "description", e.target.value)}
                    placeholder="Description"
                    className="flex-1 px-2 py-1 bg-[#FFFFFF] border border-[#D4D1C5] rounded text-[11px]"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => handleLineChange(idx, "amount", e.target.value)}
                    placeholder="Amount"
                    className="w-24 px-2 py-1 bg-[#FFFFFF] border border-[#D4D1C5] rounded num text-right text-[11px]"
                  />
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="text-[#8C8980] hover:text-[#A62626] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#615F59] font-medium mb-1">Tax Amount</label>
              <input
                type="number"
                step="0.01"
                value={taxAmount}
                onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D4D1C5] rounded num text-right text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>
            <div>
              <label className="block text-[#615F59] font-medium mb-1">Stated Total Due</label>
              <input
                type="number"
                step="0.01"
                required
                value={statedTotal}
                onChange={(e) => setStatedTotal(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D4D1C5] rounded num text-right font-semibold text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#615F59] font-medium mb-1">Raw OCR Payload (Optional)</label>
            <textarea
              rows={3}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw OCR scanner output or invoice text..."
              className="w-full p-2 bg-[#FFFFFF] border border-[#D4D1C5] rounded font-mono text-[11px] text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#EBE9E1] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ledger"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-ledger-primary disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running Agent...
                </>
              ) : (
                <>
                  Execute Multi-Step Reconcile
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
