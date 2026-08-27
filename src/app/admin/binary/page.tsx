"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
  ArrowRight,
  Info,
  Calendar,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface CutoffResult {
  processedCount: number;
  totalPayoutDistributed: number;
  timestamp?: string;
  details?: Array<{
    memberId: string;
    matchedPv: number;
    grossAmount: number;
    netAmount: number;
  }>;
}

export default function AdminBinaryManagementPage() {
  const [running, setRunning] = useState(false);
  const [cutoffResult, setCutoffResult] = useState<CutoffResult | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleExecuteCutoff = async () => {
    if (
      !confirm(
        "Are you sure you want to execute the Daily Binary Cutoff now?\n\nThis will compute 1:1 PV matching across all associates, credit earnings to wallets, deduct TDS & admin fees, and carry forward unused PV to the next cycle."
      )
    ) {
      return;
    }

    setRunning(true);
    setSuccessMessage("");
    setErrorMessage("");
    setCutoffResult(null);

    try {
      const res = await fetch("/api/admin/binary/cutoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(
          data.message ||
            `Daily Binary Cutoff executed successfully! Processed ${data.data?.processedCount || 0} members.`
        );
        if (data.data) {
          setCutoffResult(data.data);
        }
      } else {
        setErrorMessage(data.message || "Failed to execute binary cutoff.");
      }
    } catch {
      setErrorMessage("Network error occurred while executing binary cutoff.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fadeIn pb-12 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Financial Operations
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Payout Engine • Binary Cutoff Control
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Binary Matching & Payouts Engine
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1 max-w-2xl">
              Calculate daily 1:1 binary matching pairs, credit associate wallet earnings with statutory TDS & admin fee deductions, and automatically carry forward power-leg volume.
            </p>
          </div>

          {/* Top Quick Trigger Button */}
          <div>
            <button
              type="button"
              onClick={handleExecuteCutoff}
              disabled={running}
              className="px-6 py-3.5 rounded-2xl bg-[#006d36] hover:bg-[#005025] disabled:opacity-60 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#006d36]/20 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Cutoff...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Daily Cutoff Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#006d36] flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Cutoff Execution Successful</h4>
              <p className="text-xs mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-300 text-red-700 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Cutoff Error</h4>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Execution Summary Card (If cutoff was just run) */}
        {cutoffResult && (
          <div className="bg-gradient-to-br from-emerald-900 to-[#005025] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#50c878]" />
                <span className="font-mono text-xs text-[#50c878] font-bold uppercase tracking-wider">
                  Latest Cutoff Ledger Summary
                </span>
              </div>
              <span className="text-[11px] font-mono opacity-80">
                {new Date().toLocaleString("en-IN")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <span className="text-[11px] text-emerald-200 font-bold uppercase tracking-wider block">
                  Eligible Associates Matched
                </span>
                <span className="text-3xl font-black font-mono mt-1 block">
                  {cutoffResult.processedCount} Members
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <span className="text-[11px] text-emerald-200 font-bold uppercase tracking-wider block">
                  Total Matching Payout Distributed
                </span>
                <span className="text-3xl font-black font-mono text-[#50c878] mt-1 block">
                  ₹{cutoffResult.totalPayoutDistributed.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* System Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-[#e2e2e2] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#5f5e5e] uppercase tracking-wider block">
              Matching Ratio
            </span>
            <div className="text-2xl font-black font-mono text-[#1a1c1c]">1 : 1 PV</div>
            <p className="text-[11px] text-[#5f5e5e]">
              Equal volume from Left and Right leg matched automatically.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e2e2e2] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#5f5e5e] uppercase tracking-wider block">
              Pair Value Rate
            </span>
            <div className="text-2xl font-black font-mono text-blue-900">₹15 / PV</div>
            <p className="text-[11px] text-[#5f5e5e]">
              Gross commission calculated per matched pair volume.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e2e2e2] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#5f5e5e] uppercase tracking-wider block">
              Daily Capping
            </span>
            <div className="text-2xl font-black font-mono text-purple-900">₹5,000 / Day</div>
            <p className="text-[11px] text-[#5f5e5e]">
              Maximum binary matching earnings credited per associate per day.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e2e2e2] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#5f5e5e] uppercase tracking-wider block">
              Statutory Deductions
            </span>
            <div className="text-2xl font-black font-mono text-amber-900">10% Total</div>
            <p className="text-[11px] text-[#5f5e5e]">
              5% TDS + 5% Admin Charge automatically deducted at disbursement.
            </p>
          </div>
        </div>

        {/* Operational Workflow Guide */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e2e2e2]">
            <Info className="w-5 h-5 text-[#006d36]" />
            <h3 className="font-black text-base text-[#1a1c1c]">
              Binary Matching Logic & Execution Protocols
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#3e4a3f]">
            <div className="p-4 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] space-y-2">
              <div className="font-bold text-[#1a1c1c] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#006d36] text-white flex items-center justify-center text-[10px] font-mono font-black">
                  1
                </span>
                <span>Active Account Qualification</span>
              </div>
              <p>
                Only associates who maintain <strong>100 Personal PV or above</strong> are eligible to participate and earn binary matching commissions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] space-y-2">
              <div className="font-bold text-[#1a1c1c] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#006d36] text-white flex items-center justify-center text-[10px] font-mono font-black">
                  2
                </span>
                <span>Carry Forward Volume</span>
              </div>
              <p>
                When Left PV and Right PV differ, the lesser leg volume is matched and deducted from both sides. The remaining un-matched power leg PV is safely carried forward.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] space-y-2">
              <div className="font-bold text-[#1a1c1c] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#006d36] text-white flex items-center justify-center text-[10px] font-mono font-black">
                  3
                </span>
                <span>Wallet Credit & Statement</span>
              </div>
              <p>
                Net payout is directly credited to each associate&apos;s wallet balance, updating lifetime total earnings and recording an immutable transaction entry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
