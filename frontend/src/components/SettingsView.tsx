"use client";

import React, { useState } from "react";
import {
  Database,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Save,
} from "lucide-react";

export function SettingsView() {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [morseKey, setMorseKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      if (supabaseUrl) localStorage.setItem("custom_supabase_url", supabaseUrl);
      if (supabaseAnonKey) localStorage.setItem("custom_supabase_anon_key", supabaseAnonKey);
      if (morseKey) localStorage.setItem("custom_morse_key", morseKey);
    }
    setSaved(true);
    setTestStatus("Configuration saved successfully to local browser state.");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="font-editorial text-2xl font-bold text-[#141413]">
          Platform Settings & Integrations
        </h2>
        <p className="text-xs text-[#615F59] mt-1">
          Connect your Supabase database, Google OAuth credentials, and Morse Observability SDK.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Supabase Configuration Card */}
        <div className="border border-[#EBE9E1] rounded-lg bg-[#FFFFFF] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#EBE9E1] bg-[#FAF9F5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#3ECF8E]" />
              <h3 className="text-xs font-semibold text-[#141413]">
                Supabase PostgreSQL Database Connection
              </h3>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-[#615F59] hover:text-[#141413] flex items-center gap-1"
            >
              <span>Supabase Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div>
              <label className="block text-[#615F59] font-medium mb-1">
                Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D4D1C5] rounded text-[#141413] font-mono text-[11px] focus:outline-none focus:border-[#141413]"
              />
            </div>

            <div>
              <label className="block text-[#615F59] font-medium mb-1">
                Anon Public Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D4D1C5] rounded text-[#141413] font-mono text-[11px] focus:outline-none focus:border-[#141413]"
              />
            </div>

            <div className="p-3 bg-[#FAF9F5] border border-[#EBE9E1] rounded text-[11px] text-[#615F59] space-y-1">
              <p className="font-semibold text-[#141413]">Schema Migration Setup:</p>
              <p>
                Run the included SQL file (`supabase/schema.sql`) in your Supabase SQL Editor to initialize `profiles`, `invoices`, `bank_transactions`, and `telemetry_traces` with Row Level Security.
              </p>
            </div>
          </div>
        </div>

        {/* Morse Observability Card */}
        <div className="border border-[#EBE9E1] rounded-lg bg-[#FFFFFF] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#EBE9E1] bg-[#FAF9F5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#141413]" />
              <h3 className="text-xs font-semibold text-[#141413]">
                Morse AI Observability API Key
              </h3>
            </div>
            <a
              href="https://morsehq.dev"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-[#615F59] hover:text-[#141413] flex items-center gap-1"
            >
              <span>morsehq.dev</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-5 space-y-3 text-xs">
            <div>
              <label className="block text-[#615F59] font-medium mb-1">
                Morse API Key (`MORSE_API_KEY`)
              </label>
              <input
                type="password"
                placeholder="mhq_live_..."
                value={morseKey}
                onChange={(e) => setMorseKey(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D4D1C5] rounded text-[#141413] font-mono text-[11px] focus:outline-none focus:border-[#141413]"
              />
              <p className="text-[10px] text-[#8C8980] mt-1">
                When set, live OTLP telemetry spans stream directly to your Morse dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Status & Save Button */}
        <div className="flex items-center justify-between pt-2">
          {testStatus && (
            <span className="text-xs text-[#1B5E3A] flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {testStatus}
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="btn-ledger-primary text-xs py-2 px-5 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saved ? "Saved Configuration!" : "Save Credentials"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
