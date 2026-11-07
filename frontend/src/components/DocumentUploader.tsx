"use client";

import React, { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Sparkles,
  Eye,
  RefreshCw,
} from "lucide-react";
import { reconcileSingleInvoice } from "@/lib/api";
import { Invoice } from "@/lib/types";

interface DocumentUploaderProps {
  onDocumentProcessed: (invoice: Invoice) => void;
  onNavigateToLedger: () => void;
}

export function DocumentUploader({
  onDocumentProcessed,
  onNavigateToLedger,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState<Invoice | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const sampleTemplates = [
    {
      name: "Google Cloud Vertex AI & BigQuery ($132,160.00)",
      type: "Clean Match",
      payload: {
        vendor_name: "Google Cloud India Pvt Ltd",
        invoice_id: `INV-GCP-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: "2026-03-31",
        line_items: [
          {"description": "Google Vertex AI Foundation Model Inference", "amount": 62000.00},
          {"description": "BigQuery Analysis Slots & Storage Tier", "amount": 50000.00}
        ],
        tax_amount: 20160.00,
        stated_total: 132160.00,
        raw_text: "GOOGLE CLOUD INDIA PVT LTD - TAX INVOICE\n1. Vertex AI Foundation Inference: 62,000.00\n2. BigQuery Analysis Slots: 50,000.00\nIGST 18%: 20,160.00\nTotal Payable: 1,32,160.00"
      }
    },
    {
      name: "Ernst & Young Statutory Audit (₹5,00,000 - 10% TDS Sec 194J)",
      type: "TDS Shortfall",
      payload: {
        vendor_name: "Ernst & Young LLP India",
        invoice_id: `INV-EY-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: "2026-03-31",
        line_items: [
          {"description": "Statutory Annual Financial Audit Retainer", "amount": 350000.00},
          {"description": "Direct & Corporate International Tax Advisory", "amount": 73728.81}
        ],
        tax_amount: 76271.19,
        stated_total: 500000.00,
        raw_text: "ERNST & YOUNG LLP INDIA\nStatutory Audit: INR 3,50,000.00\nTax Advisory: INR 73,728.81\nGST: INR 76,271.19\nGross Total Due: INR 5,00,000.00\n(Subject to 10% TDS under Section 194J)"
      }
    },
    {
      name: "Apex Logistics Corrupted Scan ($62,400.00 - Arithmetic Mismatch)",
      type: "Math Mismatch",
      payload: {
        vendor_name: "Apex Logistics Services",
        invoice_id: `INV-ERR-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: "2026-03-31",
        line_items: [
          {"description": "Interstate Freight Dispatch MH-KA", "amount": 32000.00},
          {"description": "Pallet Cold Chain Storage Handling", "amount": 16500.00}
        ],
        tax_amount: 8730.00,
        stated_total: 62400.00, // Discrepancy: 57,230 vs 62,400
        raw_text: "[CORRUPTED SCAN] APEX LOG1STICS\nLine 1: 32000.00\nLine 2: 16500.00\nTax: 8730.00\nCLAIMED TOTAL: 62,400.00 (Math Mismatch)"
      }
    }
  ];

  const handleSimulatedUpload = async (template: typeof sampleTemplates[0]) => {
    setIsProcessing(true);
    setFileName(template.name);
    try {
      const res = await reconcileSingleInvoice(template.payload);
      setProcessedFile(res as unknown as Invoice);
      onDocumentProcessed(res as unknown as Invoice);
    } catch (err) {
      console.error("Upload processing failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      handleSimulatedUpload(sampleTemplates[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-editorial text-2xl font-bold text-[#141413]">
          Autonomous Document Ingestion & Reconciliation
        </h2>
        <p className="text-xs text-[#615F59] mt-1">
          Upload PDF invoices, scans, or ERP transaction files. The autonomous agent parses line items, runs deterministic arithmetic audits, and matches against bank deposits.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-all bg-[#FFFFFF] ${
          isDragging
            ? "border-[#141413] bg-[#F7F6F2]"
            : "border-[#D4D1C5] hover:border-[#BBB7AA]"
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#EBE9E1] flex items-center justify-center mx-auto text-[#141413]">
            <Upload className="w-5 h-5 text-[#615F59]" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#141413]">
              Drag and drop invoices or receipts here
            </h3>
            <p className="text-xs text-[#8C8980] mt-0.5">
              Supports PDF, PNG, JPG, CSV, JSON (up to 50MB per batch)
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleSimulatedUpload(sampleTemplates[0])}
              className="btn-ledger-primary text-xs py-2 px-4 cursor-pointer"
            >
              Browse Files or Select Test Document
            </button>
          </div>
        </div>
      </div>

      {/* Preset Documents Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#615F59]">
          One-Click Enterprise Document Presets
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleTemplates.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSimulatedUpload(item)}
              className="border border-[#EBE9E1] rounded p-4 bg-[#FFFFFF] hover:border-[#141413] transition-all cursor-pointer shadow-xs hover:shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-4 h-4 text-[#615F59]" />
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                    item.type === "Clean Match"
                      ? "bg-[#E6F2EB] text-[#1B5E3A] border-[#C2E2CF]"
                      : item.type === "TDS Shortfall"
                      ? "bg-[#FDF3E7] text-[#9A5B13] border-[#F5DEC2]"
                      : "bg-[#FCEAEA] text-[#A62626] border-[#F7C8C8]"
                  }`}
                >
                  {item.type}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-[#141413] line-clamp-2">
                {item.name}
              </h4>
              <p className="text-[11px] text-[#8C8980] mt-1">
                Vendor: {item.payload.vendor_name}
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-[#141413] pt-2 border-t border-[#EBE9E1]">
                <span className="num">
                  Total: {item.payload.stated_total.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-[#615F59]">
                  Run Agent <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Processing Card */}
      {isProcessing && (
        <div className="border border-[#D4D1C5] rounded p-6 bg-[#FFFFFF] flex items-center justify-center gap-4 text-xs font-medium text-[#141413]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#141413]" />
          <span>Executing Multi-Step Pipeline on {fileName}... (OCR Span → Math Audit Span → Bank Match Span)</span>
        </div>
      )}

      {/* Result Card */}
      {processedFile && !isProcessing && (
        <div className="border border-[#1B5E3A] rounded-lg p-5 bg-[#FFFFFF] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE9E1]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#1B5E3A]" />
              <div>
                <h4 className="text-xs font-semibold text-[#141413]">
                  Document Processed Successfully ({processedFile.invoice_id})
                </h4>
                <p className="text-[11px] text-[#615F59]">{processedFile.vendor_name}</p>
              </div>
            </div>

            <button
              onClick={onNavigateToLedger}
              className="btn-ledger-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <span>Inspect in Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[#FAF9F5] border border-[#EBE9E1] rounded">
              <span className="text-[#8C8980] block text-[10px]">Stated Total</span>
              <span className="num font-semibold text-[#141413] text-sm">
                {processedFile.stated_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-[#FAF9F5] border border-[#EBE9E1] rounded">
              <span className="text-[#8C8980] block text-[10px]">Math Audit</span>
              <span className={`font-semibold text-xs ${processedFile.math_valid ? "text-[#1B5E3A]" : "text-[#A62626]"}`}>
                {processedFile.math_valid ? "Passed (Balanced)" : `Failed (${processedFile.retry_count} retries)`}
              </span>
            </div>
            <div className="p-3 bg-[#FAF9F5] border border-[#EBE9E1] rounded">
              <span className="text-[#8C8980] block text-[10px]">Bank Match</span>
              <span className="num font-semibold text-[#141413] text-sm">
                {processedFile.bank_deposit_amount ? processedFile.bank_deposit_amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "None"}
              </span>
            </div>
            <div className="p-3 bg-[#FAF9F5] border border-[#EBE9E1] rounded">
              <span className="text-[#8C8980] block text-[10px]">Morse Verdict</span>
              <span className="font-semibold text-xs text-[#141413]">
                {processedFile.morse_outcome}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
