"use client";

import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";

export function BankFeeds() {
  const bankAccounts = [
    {
      id: "acc_1",
      bank: "Silicon Valley Bank (SVB)",
      type: "Primary Operating Account",
      accountMask: "•••• 8912",
      balance: "$4,289,140.50",
      status: "Connected & Live",
      lastSync: "3 minutes ago",
    },
    {
      id: "acc_2",
      bank: "Chase Commercial Banking",
      type: "Disbursement & Payroll Account",
      accountMask: "•••• 4410",
      balance: "$1,820,400.00",
      status: "Connected & Live",
      lastSync: "10 minutes ago",
    },
    {
      id: "acc_3",
      bank: "HDFC Bank Enterprise",
      type: "India Operations & INR Treasury",
      accountMask: "•••• 3391",
      balance: "₹1,45,82,300.00",
      status: "Connected & Live",
      lastSync: "1 minute ago",
    },
    {
      id: "acc_4",
      bank: "ICICI Bank Corporate",
      type: "Vendor Settlement Account",
      accountMask: "•••• 7721",
      balance: "₹82,40,900.00",
      status: "Connected & Live",
      lastSync: "Just now",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-[#141413]">
            Connected Bank Accounts & Ledgers
          </h2>
          <p className="text-xs text-[#615F59] mt-1">
            Real-time automated treasury feeds synced with SQLite ledger and Supabase database.
          </p>
        </div>

        <button className="btn-ledger text-xs py-1.5 px-3 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-[#615F59]" />
          <span>Sync All Feeds</span>
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {bankAccounts.map((acc) => (
          <div key={acc.id} className="border border-[#EBE9E1] rounded p-4 bg-[#FFFFFF] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <Building2 className="w-4 h-4 text-[#615F59]" />
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#E6F2EB] text-[#1B5E3A] border border-[#C2E2CF]">
                {acc.status}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#141413]">{acc.bank}</h4>
              <p className="text-[11px] text-[#8C8980]">{acc.type}</p>
            </div>
            <div className="pt-2 border-t border-[#EBE9E1]">
              <div className="num font-bold text-sm text-[#141413]">{acc.balance}</div>
              <div className="text-[10px] text-[#8C8980] mt-0.5 flex justify-between">
                <span>{acc.accountMask}</span>
                <span>{acc.lastSync}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bank Statement Transactions Preview */}
      <div className="border border-[#EBE9E1] rounded bg-[#FFFFFF] overflow-hidden">
        <div className="p-4 border-b border-[#EBE9E1] bg-[#FAF9F5] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[#141413]">
            Recent Ledger Deposit Transactions
          </h3>
          <span className="text-[11px] text-[#8C8980]">Direct Plaid / Open Banking Feed</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EBE9E1] bg-[#F7F6F2] text-[#615F59] font-medium text-[11px]">
                <th className="py-2.5 px-3">Deposit ID</th>
                <th className="py-2.5 px-3">Transaction Date</th>
                <th className="py-2.5 px-3">Vendor / Beneficiary</th>
                <th className="py-2.5 px-3">Reference No</th>
                <th className="py-2.5 px-3 text-right">Settled Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE9E1]">
              <tr className="hover:bg-[#FAF9F5]">
                <td className="py-2.5 px-3 num font-medium text-[#141413]">DEP-2026-001</td>
                <td className="py-2.5 px-3 text-[#615F59]">2026-03-02</td>
                <td className="py-2.5 px-3 font-medium text-[#141413]">Cloudflare Inc</td>
                <td className="py-2.5 px-3 num text-[#615F59]">ACH-CF-9812</td>
                <td className="py-2.5 px-3 num text-right font-medium text-[#141413]">$2,832.00</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#E6F2EB] text-[#1B5E3A] font-medium">Reconciled Exact</span>
                </td>
              </tr>
              <tr className="hover:bg-[#FAF9F5]">
                <td className="py-2.5 px-3 num font-medium text-[#141413]">DEP-2026-002</td>
                <td className="py-2.5 px-3 text-[#615F59]">2026-03-03</td>
                <td className="py-2.5 px-3 font-medium text-[#141413]">Amazon Internet Services Pvt Ltd</td>
                <td className="py-2.5 px-3 num text-[#615F59]">NEFT-AWS-00412</td>
                <td className="py-2.5 px-3 num text-right font-medium text-[#141413]">₹1,46,910.00</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#E6F2EB] text-[#1B5E3A] font-medium">Reconciled Exact</span>
                </td>
              </tr>
              <tr className="hover:bg-[#FAF9F5]">
                <td className="py-2.5 px-3 num font-medium text-[#141413]">DEP-2026-019</td>
                <td className="py-2.5 px-3 text-[#615F59]">2026-03-20</td>
                <td className="py-2.5 px-3 font-medium text-[#141413]">Ernst & Young LLP India</td>
                <td className="py-2.5 px-3 num text-[#615F59]">RTGS-EY-9912</td>
                <td className="py-2.5 px-3 num text-right font-medium text-[#141413]">₹4,50,000.00</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#FDF3E7] text-[#9A5B13] font-medium">10% TDS Withheld</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
