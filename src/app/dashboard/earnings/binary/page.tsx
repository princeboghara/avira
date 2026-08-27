"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  TrendingUp,
  Wallet,
  Percent,
  Sparkles,
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";
import MemberLayout from "@/components/dashboard/MemberLayout";
import { User } from "@/types";

interface BinaryRecord {
  id: string;
  srNo: number;
  date: string;
  grossAmount: number;
  tdsAmount: number;
  adminCharge: number;
  rpWalletAmount: number;
  netAmount: number;
  description: string;
  status: string;
}

interface EarningsSummary {
  totalGross: number;
  totalTds: number;
  totalAdmin: number;
  totalRp: number;
  totalNet: number;
  rpWalletBalance: number;
}

export default function BinaryEarningsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<BinaryRecord[]>([]);
  const [summary, setSummary] = useState<EarningsSummary>({
    totalGross: 0,
    totalTds: 0,
    totalAdmin: 0,
    totalRp: 0,
    totalNet: 0,
    rpWalletBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, earnRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/member/earnings/binary"),
        ]);

        const meData = await meRes.json();
        if (meData.success && meData.user) {
          setUser(meData.user);
        }

        const earnData = await earnRes.json();
        if (earnData.success) {
          setRecords(earnData.records || []);
          if (earnData.summary) {
            setSummary(earnData.summary);
          }
        }
      } catch (err) {
        console.error("Error loading binary earnings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                My Earning
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                1. Binary Matching Income
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              1:1 Binary PV Match Earnings Ledger
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Live ledger of binary PV pair matches with standard deductions: TDS (2%), Admin (8%), and RP Wallet (5%).
            </p>
          </div>

          {/* RP Wallet Accumulation Badge */}
          <div className="p-4 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-2xl border border-emerald-300 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006d36] text-white flex items-center justify-center font-bold shadow-xs">
              <Wallet className="w-5 h-5 text-[#50c878]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#5f5e5e] tracking-wider block">
                Accumulated RP Wallet (5%)
              </span>
              <span className="font-mono text-xl font-black text-[#006d36]">
                ₹{summary.rpWalletBalance.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* 5 Distinct Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs font-mono">
          {/* 1. Gross Income */}
          <div className="bg-white rounded-2xl p-4 border border-[#e2e2e2] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
              Total Binary Gross
            </span>
            <span className="font-black text-lg text-[#1a1c1c] block mt-1">
              ₹{summary.totalGross.toLocaleString("en-IN")}
            </span>
            <span className="text-[9px] text-[#5f5e5e] block mt-0.5">100% Gross Volume</span>
          </div>

          {/* 2. TDS 2% */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/40 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">
              TDS Deducted (2%)
            </span>
            <span className="font-black text-lg text-amber-900 block mt-1">
              -₹{summary.totalTds.toLocaleString("en-IN")}
            </span>
            <span className="text-[9px] text-amber-700 block mt-0.5">Govt Income Tax</span>
          </div>

          {/* 3. Admin Fee 8% */}
          <div className="bg-white rounded-2xl p-4 border border-blue-200 bg-blue-50/40 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-blue-800 block">
              Admin Charge (8%)
            </span>
            <span className="font-black text-lg text-blue-900 block mt-1">
              -₹{summary.totalAdmin.toLocaleString("en-IN")}
            </span>
            <span className="text-[9px] text-blue-700 block mt-0.5">Platform Maintenance</span>
          </div>

          {/* 4. RP Wallet 5% */}
          <div className="bg-white rounded-2xl p-4 border border-purple-200 bg-purple-50/40 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-purple-800 block">
              RP Wallet (5%)
            </span>
            <span className="font-black text-lg text-purple-900 block mt-1">
              +₹{summary.totalRp.toLocaleString("en-IN")}
            </span>
            <span className="text-[9px] text-purple-700 block mt-0.5">Repurchase Shopping</span>
          </div>

          {/* 5. Net Amount 85% */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-300 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-[#006d36] block">
              Net Binary Income
            </span>
            <span className="font-black text-xl text-[#006d36] block mt-1">
              ₹{summary.totalNet.toLocaleString("en-IN")}
            </span>
            <span className="text-[9px] text-[#005025] font-bold block mt-0.5">85% Net Payout</span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
            <div>
              <h2 className="text-base font-black text-[#1a1c1c]">
                Binary Income Statement Records ({records.length})
              </h2>
              <span className="text-xs text-[#5f5e5e]">
                Transparent breakdown of matching dates, gross credits, and standard deductions.
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#006d36] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              Formula: Net = Gross - 2% TDS - 8% Admin - 5% RP
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f9f9f9] border-b border-[#e2e2e2] text-[#5f5e5e] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Sr No</th>
                  <th className="py-3.5 px-4">Income Date & Time</th>
                  <th className="py-3.5 px-4">Binary Income (Gross)</th>
                  <th className="py-3.5 px-4">TDS (2%)</th>
                  <th className="py-3.5 px-4">Admin Charge (8%)</th>
                  <th className="py-3.5 px-4">RP Wallet (5%)</th>
                  <th className="py-3.5 px-4 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading binary income ledger...</span>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#5f5e5e]">
                      No binary matching income credited yet. Match PV on Left & Right legs to generate binary income!
                    </td>
                  </tr>
                ) : (
                  records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-emerald-50/30 transition-colors font-mono">
                      <td className="py-3.5 px-4 font-bold text-[#5f5e5e]">{rec.srNo}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#1a1c1c]">
                        {formatDateTime(rec.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1a1c1c] whitespace-nowrap">
                        ₹{rec.grossAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-amber-800 font-bold whitespace-nowrap">
                        -₹{rec.tdsAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-blue-800 font-bold whitespace-nowrap">
                        -₹{rec.adminCharge.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-purple-800 font-bold whitespace-nowrap">
                        +₹{rec.rpWalletAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-sm text-[#006d36] whitespace-nowrap">
                        ₹{rec.netAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
