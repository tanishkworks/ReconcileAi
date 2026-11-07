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
import { LandingHero } from "@/components/LandingHero";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<string>("home");
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
    if (!u) {
      setActiveTab("home");
    }
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
    if (user) {
      loadData();
    }
  }, [filterStatus, searchQuery, user, loadData]);

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
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
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
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
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

  // Strictly Gated Navigation Handlers
  const handleTabChange = (tab: string) => {
    if (tab === "home") {
      setActiveTab("home");
      return;
    }
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleLaunchWorkbench = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setActiveTab("ledger");
  };

  const handleOpenUpload = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsIngestOpen(true);
  };

  const handleAuthSuccess = (loggedUser: any) => {
    setUser(loggedUser);
    setIsAuthOpen(false);
    setActiveTab("ledger");
  };

  const handleSignOut = () => {
    signOutUser();
    setUser(null);
    setActiveTab("home");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F6F2]">
      {/* Top Commercial Navbar (Displayed on all workspace views) */}
      {activeTab !== "home" && (
        <Navbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenUpload={handleOpenUpload}
          onOpenAuth={() => setIsAuthOpen(true)}
          user={user}
          onSignOut={handleSignOut}
          morseActive={stats?.morse_sdk_status.active || false}
          supabaseConnected={isSupabaseConfigured()}
        />
      )}

      {/* View Router */}
      {activeTab === "home" && (
        <LandingHero
          onLaunchApp={handleLaunchWorkbench}
          onOpenAuth={() => setIsAuthOpen(true)}
          user={user}
        />
      )}

      {/* Gated Access Block: If unauthenticated user navigates into workspace */}
      {activeTab !== "home" && !user && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[60vh]">
          <div className="w-14 h-14 rounded-full bg-[#FAF9F5] border border-[#D4D1C5] flex items-center justify-center text-[#141413] shadow-xs">
            <Lock className="w-6 h-6 text-[#141413]" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="font-editorial text-2xl font-bold text-[#141413]">
              Authentication Required
            </h2>
            <p className="text-xs text-[#615F59] leading-relaxed">
              The Enterprise Financial Ledger, Ingestion Pipeline, and Morse Telemetry Engine are restricted to verified accounts. Please sign in or create an account to unlock all features.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="btn-ledger-primary py-2.5 px-5 text-xs font-semibold cursor-pointer shadow flex items-center gap-2"
            >
              <span>Sign In with Google / Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab("home")}
              className="btn-ledger py-2.5 px-4 text-xs font-medium cursor-pointer"
            >
              Back to Overview & Demo
            </button>
          </div>
        </div>
      )}

      {/* Authenticated Workspace Views */}
      {activeTab === "ledger" && user && (
        <div className="flex flex-col flex-1">
          {/* Top Ledger Header & Unit Economics Strip */}
          <HeaderMetrics
            stats={stats}
            isRunningBatch={isRunningBatch}
            onRunBatch={handleRunBatch}
            onReset={handleReset}
            onOpenIngest={handleOpenUpload}
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

      {activeTab === "uploader" && user && (
        <div className="flex-1 py-4">
          <DocumentUploader
            onDocumentProcessed={handleInvoiceCreated}
            onNavigateToLedger={() => setActiveTab("ledger")}
          />
        </div>
      )}

      {activeTab === "bank_feeds" && user && (
        <div className="flex-1 py-4">
          <BankFeeds />
        </div>
      )}

      {activeTab === "analytics" && user && (
        <div className="flex-1 py-4">
          <AnalyticsView stats={stats} />
        </div>
      )}

      {activeTab === "settings" && user && (
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
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
