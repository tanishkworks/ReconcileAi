"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { HeaderMetrics } from "@/components/HeaderMetrics";
import { ReconciliationTable } from "@/components/ReconciliationTable";
import { TraceInspector } from "@/components/TraceInspector";
import { IngestionModal } from "@/components/IngestionModal";
import { DocumentUploader } from "@/components/DocumentUploader";
import { BankFeeds } from "@/components/BankFeeds";
import { AnalyticsView } from "@/components/AnalyticsView";
import { SettingsView } from "@/components/SettingsView";
import { AuthModal } from "@/components/AuthModal";
import {
  fetchStats,
  fetchInvoices,
  fetchInvoiceDetail,
  confirmOutcome,
  runTelemetryBatch,
  resetLedger,
} from "@/lib/api";
import { getCurrentUser, signOutUser, isSupabaseConfigured } from "@/lib/supabase/client";
import { Invoice, TelemetryTrace, UnitEconomicsStats } from "@/lib/types";

export default function ReconcileApp() {
  const [activeTab, setActiveTab] = useState<string>("ledger");
  const [stats, setStats] = useState<UnitEconomicsStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [telemetryDetail, setTelemetryDetail] = useState<TelemetryTrace | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRunningBatch, setIsRunningBatch] = useState<boolean>(false);
  const [isIngestOpen, setIsIngestOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  // Initialize User from Supabase/LocalStorage
  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
  }, []);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [statsData, invoicesData] = await Promise.all([
        fetchStats(),
        fetchInvoices(filterStatus, searchQuery),
      ]);
      setStats(statsData);
      setInvoices(invoicesData);

      if (!selectedInvoice && invoicesData.length > 0) {
        setSelectedInvoice(invoicesData[0]);
      }
    } catch (err) {
      console.error("Error loading ledger data:", err);
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
    const [updatedStats, detail] = await Promise.all([
      fetchStats(),
      fetchInvoiceDetail(invoiceId),
    ]);
    setStats(updatedStats);
    setSelectedInvoice(detail.invoice);
    setTelemetryDetail(detail.telemetry);
    setInvoices((prev) =>
      prev.map((inv) => (inv.invoice_id === invoiceId ? detail.invoice : inv))
    );
  };

  // New Invoice Ingested
  const handleInvoiceCreated = (newInv: Invoice) => {
    loadData();
    setSelectedInvoice(newInv);
    setActiveTab("ledger");
  };

  const handleSignOut = () => {
    signOutUser();
    setUser(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F6F2]">
      {/* Top Commercial Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenUpload={() => setIsIngestOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        onSignOut={handleSignOut}
        morseActive={stats?.morse_sdk_status.active || false}
        supabaseConnected={isSupabaseConfigured()}
      />

      {/* View Router */}
      {activeTab === "ledger" && (
        <div className="flex flex-col flex-1">
          {/* Top Ledger Header & Unit Economics Strip */}
          <HeaderMetrics
            stats={stats}
            isRunningBatch={isRunningBatch}
            onRunBatch={handleRunBatch}
            onReset={handleReset}
            onOpenIngest={() => setIsIngestOpen(true)}
          />

          {/* Main Split Workbench */}
          <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-210px)] border-t border-[#EBE9E1]">
            {/* Left (70%): Accounting Table */}
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

            {/* Right (30%): Slide-Over Trace Inspector */}
            <section className="lg:col-span-4 bg-[#FFFFFF] flex flex-col">
              <TraceInspector
                invoice={selectedInvoice}
                telemetry={telemetryDetail}
                onClose={() => setSelectedInvoice(null)}
                onConfirmOutcome={handleConfirmOutcome}
              />
            </section>
          </main>
        </div>
      )}

      {activeTab === "uploader" && (
        <div className="flex-1 py-4">
          <DocumentUploader
            onDocumentProcessed={handleInvoiceCreated}
            onNavigateToLedger={() => setActiveTab("ledger")}
          />
        </div>
      )}

      {activeTab === "bank_feeds" && (
        <div className="flex-1 py-4">
          <BankFeeds />
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="flex-1 py-4">
          <AnalyticsView stats={stats} />
        </div>
      )}

      {activeTab === "settings" && (
        <div className="flex-1 py-4">
          <SettingsView />
        </div>
      )}

      {/* Ingestion Modal */}
      <IngestionModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onInvoiceCreated={handleInvoiceCreated}
      />

      {/* Google Sign In / Supabase Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />
    </div>
  );
}
