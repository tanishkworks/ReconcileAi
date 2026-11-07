"use client";

import React, { useState } from "react";
import { X, Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, User, Building, Mail, Sparkles } from "lucide-react";
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signInDemoController } from "@/lib/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await signInWithGoogle();
      if (res && res.user) {
        onSuccess(res.user);
        onClose();
      } else if (res && res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      setError(err.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoControllerLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInDemoController();
      if (res && res.user) {
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter a valid work email");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const res = await signUpWithEmail(email, password, fullName, company);
        if (res?.user) {
          onSuccess(res.user);
          onClose();
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (res?.user) {
          onSuccess(res.user);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16]/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#D4D1C5] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#EBE9E1] bg-[#FAF9F5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#141413] flex items-center justify-center text-white font-serif font-bold text-sm shadow-xs">
              R
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#141413]">
                {mode === "signin" ? "Sign In to ReconcileAI" : "Create Enterprise Account"}
              </h3>
              <p className="text-[10px] text-[#8C8980]">Financial Ledger & Morse Observability Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[#EBE9E1] text-[#615F59] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 border-b border-[#EBE9E1] bg-[#F7F6F2] text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(null); }}
            className={`py-2.5 text-center transition-colors cursor-pointer ${
              mode === "signin"
                ? "bg-[#FFFFFF] text-[#141413] border-b-2 border-[#141413]"
                : "text-[#615F59] hover:text-[#141413]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(null); }}
            className={`py-2.5 text-center transition-colors cursor-pointer ${
              mode === "signup"
                ? "bg-[#FFFFFF] text-[#141413] border-b-2 border-[#141413]"
                : "text-[#615F59] hover:text-[#141413]"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-[#FCEAEA] border border-[#F7C8C8] text-[#A62626] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In / Sign Up Primary Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded border border-[#D4D1C5] bg-[#FFFFFF] hover:bg-[#F8F7F3] transition-colors flex items-center justify-center gap-3 text-xs font-semibold text-[#141413] shadow-xs cursor-pointer"
          >
            {/* Google SVG Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.57-5.17 3.57-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.24A7.18 7.18 0 0 1 4.89 12c0-.78.13-1.54.38-2.24V6.61H1.25A11.967 11.967 0 0 0 0 12c0 1.92.45 3.74 1.25 5.39l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
              />
            </svg>
            <span>{mode === "signin" ? "Continue with Google" : "Sign Up with Google"}</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[#EBE9E1] w-full" />
            <span className="bg-[#FFFFFF] px-3 text-[10px] uppercase tracking-wider text-[#8C8980] absolute">
              or use corporate email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-[#615F59] mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D4D1C5] rounded focus:outline-none focus:border-[#141413] text-[#141413]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#615F59] mb-1">
                    Company / Organization
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Acme Financial Corp"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D4D1C5] rounded focus:outline-none focus:border-[#141413] text-[#141413]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[#615F59] mb-1">
                Work Email Address
              </label>
              <input
                type="email"
                required
                placeholder="controller@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D4D1C5] rounded focus:outline-none focus:border-[#141413] text-[#141413]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#615F59] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D4D1C5] rounded focus:outline-none focus:border-[#141413] text-[#141413]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-ledger-primary py-2.5 text-xs font-medium cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{mode === "signin" ? "Sign In to Financial Ledger" : "Create Account & Unlock Ledger"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* 1-Click Evaluation Controller Login */}
          <div className="pt-1 border-t border-[#EBE9E1]">
            <button
              type="button"
              onClick={handleDemoControllerLogin}
              disabled={loading}
              className="w-full py-2 px-3 rounded border border-[#C2E2CF] bg-[#E6F2EB] hover:bg-[#D5EADF] text-[#1B5E3A] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Test Login as Lead Controller (Alex Morgan)</span>
            </button>
          </div>

          {/* Supabase Status Note */}
          <div className="p-2.5 bg-[#FAF9F5] border border-[#EBE9E1] rounded text-[10px] text-[#615F59] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1B5E3A] shrink-0" />
            <span>
              <strong>Supabase Cloud Connected:</strong> User profiles and reconciliation sessions are synchronized to Supabase PostgreSQL with RLS.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
