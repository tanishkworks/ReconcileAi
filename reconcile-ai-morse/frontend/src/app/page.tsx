"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HeaderMetrics } from "@/components/HeaderMetrics";
import { ReconciliationTable } from "@/components/ReconciliationTable";
import { TraceInspector } from "@/components/TraceInspector";
import { IngestionModal } from "@/components/IngestionModal";
import {
  fetchStats,
  fetchInvoices,
  fetchInvoiceDetail,
  confirmOutcome,
  runTelemetryBatch,
  resetLedger,
} from "@/lib/api";
import { Invoice, TelemetryTrace, UnitEconomicsStats } from "@/lib/types";

export default function ReconcileWorkbench() {
  const [stats, setStats] = useState<UnitEconomicsStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [telemetryDetail, setTelemetryDetail] = useState<TelemetryTrace | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRunningBatch, setIsRunningBatch] = useState<boolean>(false);
  const [isIngestOpen, setIsIngestOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [statsData, invoicesData] = await Promise.all([
        fetchStats(),
        fetchInvoices(filterStatus, searchQuery),
      ]);
      setStats(statsData);
      setInvoices(invoicesData);

      // Auto-select first invoice if none selected
      if (!selectedInvoice && invoicesData.length > 0) {
        setSelectedInvoice(invoicesData[0]);
      }
    } catch (err) {
      console.error("Error loading ledger data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, searchQuery, selectedInvoice]);

  useEffect(() => {
    loadData();
  }, [filterStatus, searchQuery]);

  // Load selected invoice trace detail
  useEffect(() => {
    if (selectedInvoice) {
      fetchInvoiceDetail(selectedInvoice.invoice_id)
        .then((data) => {
          setTelemetryDetail(data.telemetry);
        })
        .catch((err) => {
          console.error("Error fetching trace detail:", err);
          setTelemetryDetail(null);
        });
    } else {
      setTelemetryDetail(null);
    }
  }, [selectedInvoice]);

  // Batch Simulation Trigger
  const handleRunBatch = async () => {
    setIsRunningBatch(true);
    try {
      await runTelemetryBatch();
      await loadData();
      // Select the first shortfall item or math fail item to immediately highlight the difference
      const updated = await fetchInvoices("all", "");
      if (updated.length > 0) {
        setSelectedInvoice(updated[18] || updated[0]);
      }
    } catch (err) {
      console.error("Batch run failed:", err);
    } finally {
      setIsRunningBatch(false);
    }
  };

  // Reset Trigger
  const handleReset = async () => {
    if (confirm("Reset SQLite ledger database and re-seed bank transactions?")) {
      await resetLedger();
      setSelectedInvoice(null);
      setTelemetryDetail(null);
      await loadData();
    }
  };

  // Delayed Outcome Human Confirmation
  const handleConfirmOutcome = async (invoiceId: string, verdict: "confirmed" | "rejected") => {
    await confirmOutcome(invoiceId, verdict);
    // Refresh stats & invoice
    const [updatedStats, detail] = await Promise.all([
      fetchStats(),
      fetchInvoiceDetail(invoiceId),
    ]);
    setStats(updatedStats);
    setSelectedInvoice(detail.invoice);
    setTelemetryDetail(detail.telemetry);
    // Update local table row
    setInvoices((prev) =>
      prev.map((inv) => (inv.invoice_id === invoiceId ? detail.invoice : inv))
    );
  };

  // New Invoice Ingested
  const handleInvoiceCreated = (newInv: Invoice) => {
    loadData();
    setSelectedInvoice(newInv);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F6F2]">
      {/* Top Ledger Header & Unit Economics Strip */}
      <HeaderMetrics
        stats={stats}
        isRunningBatch={isRunningBatch}
        onRunBatch={handleRunBatch}
        onReset={handleReset}
        onOpenIngest={() => setIsIngestOpen(true)}
      />

      {/* Main Split Workbench */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-180px)] border-t border-[#EBE9E1]">
        {/* Left / Center (70% width = col-span-8): Filterable Dense Accounting Table */}
        <section className="lg:col-span-8 flex flex-col border-b lg:border-b-0 lg:border-r border-[#EBE9E1] bg-[#FFFFFF]">
          <ReconciliationTable
            invoices={invoices}
            selectedInvoice={selectedInvoice}
            onSelectInvoice={setSelectedInvoice}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </section>

        {/* Right Slide-Over / Inspector Panel (30% width = col-span-4) */}
        <section className="lg:col-span-4 bg-[#FFFFFF] flex flex-col">
          <TraceInspector
            invoice={selectedInvoice}
            telemetry={telemetryDetail}
            onClose={() => setSelectedInvoice(null)}
            onConfirmOutcome={handleConfirmOutcome}
          />
        </section>
      </main>

      {/* Upload / Ingestion Modal */}
      <IngestionModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onInvoiceCreated={handleInvoiceCreated}
      />
    </div>
  );
}
