"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Layers,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Database,
  Radio,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenAuth: () => void;
  user: any;
  onSignOut: () => void;
  morseActive: boolean;
  supabaseConnected: boolean;
}

export function Navbar({
  activeTab,
  onTabChange,
  onOpenUpload,
  onOpenAuth,
  user,
  onSignOut,
  morseActive,
  supabaseConnected,
}: NavbarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Overview", icon: Sparkles },
    { id: "ledger", label: "Ledger Workbench", icon: Layers },
    { id: "uploader", label: "Document Ingestion", icon: Upload },
    { id: "bank_feeds", label: "Bank Accounts", icon: Building2 },
    { id: "analytics", label: "Unit Economics", icon: BarChart3 },
    { id: "settings", label: "Integrations & API", icon: Settings },
  ];

  return (
    <nav className="border-b border-[#EBE9E1] bg-[#FFFFFF] sticky top-0 z-30 px-5 py-3">
      <div className="flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onTabChange("home")}>
            <div className="w-8 h-8 rounded bg-[#141413] flex items-center justify-center text-white font-serif font-bold text-lg shadow-xs">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-editorial text-xl font-bold tracking-tight text-[#141413]">
                  ReconcileAI
                </span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded font-semibold bg-[#F0EEE6] text-[#615F59]">
                  Enterprise
                </span>
              </div>
              <p className="text-[10px] text-[#8C8980]">Autonomous Financial Ledger & Telemetry</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-[#F7F6F2] p-1 rounded border border-[#EBE9E1]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[#FFFFFF] text-[#141413] shadow-xs"
                      : "text-[#615F59] hover:text-[#141413]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Controls: Ingest Button, Status Badges & User Profile */}
        <div className="flex items-center gap-3">
          {/* Supabase Pill */}
          <button
            onClick={() => onTabChange("settings")}
            className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium border border-[#EBE9E1] bg-[#FAF9F5] text-[#615F59] hover:bg-[#F0EEE6]"
            title="Configure Supabase Database"
          >
            <Database className="w-3 h-3 text-[#3ECF8E]" />
            <span>{supabaseConnected ? "Supabase Live" : "Supabase Schema Ready"}</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="btn-ledger-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Invoices</span>
          </button>

          {/* User Auth Profile Dropdown */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded border border-[#EBE9E1] hover:bg-[#FAF9F5] transition-colors"
              >
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-[#141413] leading-none">{user.name}</div>
                  <div className="text-[10px] text-[#8C8980] leading-none mt-0.5">{user.role || "Controller"}</div>
                </div>
                <img
                  src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop"}
                  alt={user.name}
                  width={28}
                  height={28}
                  style={{ width: "28px", height: "28px", minWidth: "28px", minHeight: "28px", borderRadius: "9999px" }}
                  className="w-7 h-7 rounded-full object-cover border border-[#D4D1C5]"
                />
                <ChevronDown className="w-3 h-3 text-[#615F59]" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-ledger text-xs py-1.5 px-3"
              >
                Sign In
              </button>
            )}

            {/* Profile Menu Popup */}
            {profileMenuOpen && user && (
              <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] border border-[#D4D1C5] rounded shadow-lg p-2 z-50 text-xs">
                <div className="p-2 border-b border-[#EBE9E1] mb-1">
                  <div className="font-semibold text-[#141413]">{user.name}</div>
                  <div className="text-[#8C8980] truncate">{user.email}</div>
                  <div className="text-[10px] mt-1 text-[#1B5E3A] font-medium bg-[#E6F2EB] px-1.5 py-0.5 rounded inline-block">
                    {user.company || "Enterprise Account"}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onTabChange("settings");
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F8F7F3] flex items-center gap-2 text-[#615F59]"
                >
                  <Settings className="w-3.5 h-3.5" />
                  API Keys & Supabase
                </button>

                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[#FCEAEA] text-[#A62626] flex items-center gap-2 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
