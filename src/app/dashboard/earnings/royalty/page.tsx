"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  Crown,
  Wallet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Users,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import DataTable, { Column } from "@/components/ui/DataTable";
import { User } from "@/types";

interface RoyaltyRecord extends Record<string, any> {
  id: string;
  srNo: number;
  date: string;
  grossAmount: number;
  tdsAmount: number;
  adminCharge: number;
  netAmount: number;
  description: string;
  status: string;
}

interface QualificationData {
  isQualified: boolean;
  leftDirects1000Pv: number;
  rightDirects1000Pv: number;
  leftRequired: number;
  rightRequired: number;
  leftList: Array<{ id: string; memberId: string; fullName: string; personalPv: number }>;
  rightList: Array<{ id: string; memberId: string; fullName: string; personalPv: number }>;
}

interface PoolSummary {
  monthIdentifier: string;
  monthLabel: string;
  startDate: string;
  endDate: string;
  totalCompanyPv: number;
  royaltyPercentage: number;
  poolAmount: number;
  totalAchieversCount: number;
  projectedSharePerAchiever: number;
}

export default function RoyaltyEarningsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [qualification, setQualification] = useState<QualificationData | null>(null);
  const [poolSummary, setPoolSummary] = useState<PoolSummary | null>(null);
  const [records, setRecords] = useState<RoyaltyRecord[]>([]);
  const [totalGross, setTotalGross] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meRes, royRes] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }),
        fetch("/api/member/earnings/royalty", { cache: "no-store" }),
      ]);

      const meData = await meRes.json();
      if (meData.success && meData.user) {
        setUser(meData.user);
      }

      const royData = await royRes.json();
      if (royData.success) {
        setQualification(royData.qualification || null);
        setPoolSummary(royData.poolSummary || null);
        setRecords(royData.records || []);
        setTotalGross(royData.summary?.totalGross || 0);
      }
    } catch (err) {
      console.error("Error loading royalty earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<RoyaltyRecord>[] = [
    {
      header: "#",
      accessorKey: "srNo",
      className: "w-12 text-center font-mono font-bold text-slate-400 text-xs",
    },
    {
      header: "Settlement Date",
      accessorKey: "date",
      className: "text-xs font-mono whitespace-nowrap text-slate-700 font-semibold",
    },
    {
      header: "Description / Pool Details",
      accessorKey: "description",
      className: "text-xs text-slate-600 max-w-[320px] truncate",
      cell: (row) => (
        <span className="truncate block font-medium" title={row.description}>
          {row.description}
        </span>
      ),
    },
    {
      header: "Gross Royalty Share",
      accessorKey: "grossAmount",
      className: "text-right font-mono font-black text-xs text-[#006d36]",
      cell: (row) => `₹${row.grossAmount.toLocaleString("en-IN")}`,
    },
    {
      header: "TDS (2%)",
      accessorKey: "tdsAmount",
      className: "text-right font-mono text-xs text-slate-500",
      cell: (row) => `₹${row.tdsAmount.toFixed(2)}`,
    },
    {
      header: "Admin (8%)",
      accessorKey: "adminCharge",
      className: "text-right font-mono text-xs text-slate-500",
      cell: (row) => `₹${row.adminCharge.toFixed(2)}`,
    },
    {
      header: "RP (5%)",
      accessorKey: "rpWalletAmount",
      className: "text-right font-mono text-xs text-blue-600 font-semibold",
      cell: (row) => `₹${(row.rpWalletAmount || row.grossAmount * 0.05).toFixed(2)}`,
    },
    {
      header: "Net Credited",
      accessorKey: "netAmount",
      className: "text-right font-mono font-black text-xs text-emerald-950",
      cell: (row) => `₹${row.netAmount.toFixed(2)}`,
    },
    {
      header: "Status",
      accessorKey: "status",
      className: "text-center",
      cell: () => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-[#006d36] border border-emerald-300">
          <ShieldCheck className="w-3 h-3 text-[#006d36]" />
          <span>Credited</span>
        </span>
      ),
    },
  ];

  const leftCount = qualification?.leftDirects1000Pv || 0;
  const rightCount = qualification?.rightDirects1000Pv || 0;
  const isQualified = qualification?.isQualified || false;

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
        {/* 1. Neumorphic Executive Banner */}
        <div className="neo-card rounded-2xl sm:rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-black uppercase tracking-wider border border-amber-200">
              <Crown className="w-4 h-4 text-amber-600 fill-amber-300" />
              <span>3rd Income Stream • Monthly Global Royalty Pool</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <span>Royalty Income Club</span>
              <Sparkles className="w-6 h-6 text-amber-500 fill-amber-300" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Earn an equal share of <strong>5% of the Total Company Monthly Activation PV Pool</strong> every single month as a qualified Royalty Club Achiever.
            </p>
          </div>

          <div className="neo-inset p-4 rounded-2xl shrink-0 text-center sm:text-right border border-amber-100 bg-amber-50/30 min-w-[170px]">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">
              Total Royalty Earned
            </span>
            <strong className="text-2xl sm:text-3xl font-black font-mono text-amber-950 block mt-0.5">
              ₹{totalGross.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        {/* 2. Live Qualification Progress Card (5 Left + 5 Right 1000 PV) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h3 className="text-lg font-black text-slate-900">
                  Royalty Achiever Qualification Meter
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Criteria: Minimum <strong>5 Direct Referrals (1000+ PV)</strong> in Left Leg + <strong>5 Direct Referrals (1000+ PV)</strong> in Right Leg.
              </p>
            </div>

            <div>
              {isQualified ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-100 text-[#006d36] font-black text-xs border border-emerald-300 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#006d36]" />
                  <span>👑 ROYALTY ACHIEVER (QUALIFIED)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>In Progress ({Math.max(0, 5 - leftCount)} Left, {Math.max(0, 5 - rightCount)} Right needed)</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Leg Directs Meter */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-800 text-[10px] font-black font-mono">
                    LEFT LEG
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Direct Referrals (1000+ PV)
                  </span>
                </div>
                <strong className="text-base font-black font-mono text-purple-900">
                  {leftCount} / 5
                </strong>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (leftCount / 5) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium block text-right">
                  {leftCount >= 5 ? "✅ Requirement Completed" : `${5 - leftCount} more needed`}
                </span>
              </div>

              {/* Left Directs List */}
              {qualification?.leftList && qualification.leftList.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Qualified Left Directs:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {qualification.leftList.map((m) => (
                      <span
                        key={m.id}
                        className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-bold font-mono text-slate-800 flex items-center gap-1 shadow-2xs"
                      >
                        <span>{m.fullName}</span>
                        <span className="text-purple-700 font-normal">({m.personalPv} PV)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Leg Directs Meter */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-800 text-[10px] font-black font-mono">
                    RIGHT LEG
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Direct Referrals (1000+ PV)
                  </span>
                </div>
                <strong className="text-base font-black font-mono text-indigo-900">
                  {rightCount} / 5
                </strong>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (rightCount / 5) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium block text-right">
                  {rightCount >= 5 ? "✅ Requirement Completed" : `${5 - rightCount} more needed`}
                </span>
              </div>

              {/* Right Directs List */}
              {qualification?.rightList && qualification.rightList.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Qualified Right Directs:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {qualification.rightList.map((m) => (
                      <span
                        key={m.id}
                        className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-bold font-mono text-slate-800 flex items-center gap-1 shadow-2xs"
                      >
                        <span>{m.fullName}</span>
                        <span className="text-indigo-700 font-normal">({m.personalPv} PV)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Monthly Company Pool & Projected Share */}
        {poolSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-[#006d36]">
                  {poolSummary.monthIdentifier}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Monthly Company PV Turnover
              </span>
              <div className="text-xl font-black font-mono text-slate-900">
                {poolSummary.totalCompanyPv.toLocaleString("en-IN")} PV
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                {poolSummary.monthLabel}
              </span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold">
                  <Crown className="w-5 h-5 text-amber-600 fill-amber-300" />
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  5% Pool
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                5% Royalty Pool Size
              </span>
              <div className="text-xl font-black font-mono text-amber-900">
                ₹{poolSummary.poolAmount.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-amber-700 font-bold block mt-1">
                5% of total company turnover
              </span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                  Achievers
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Qualified Achievers
              </span>
              <div className="text-xl font-black font-mono text-slate-900">
                {poolSummary.totalAchieversCount}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Active Royalty Club members
              </span>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 via-white to-white rounded-3xl p-5 border border-emerald-300 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#006d36] text-white flex items-center justify-center font-bold shadow-xs">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#006d36] text-white">
                  Equal Share
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#006d36] block mb-0.5">
                Projected Share / Achiever
              </span>
              <div className="text-xl font-black font-mono text-[#006d36]">
                ₹{poolSummary.projectedSharePerAchiever.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-emerald-800 font-bold block mt-1">
                Pool ÷ {Math.max(1, poolSummary.totalAchieversCount)} Achievers
              </span>
            </div>
          </div>
        )}

        {/* 4. Detailed Royalty Income Statement */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#006d36]" />
              <span className="text-xs font-mono font-bold">Loading Royalty Statement...</span>
            </div>
          ) : (
            <DataTable
              data={records}
              columns={columns}
              keyExtractor={(item) => item.id}
              searchPlaceholder="Search royalty payouts..."
              searchableKeys={["description", "date", "status"]}
              initialPageSize={10}
              title="Royalty Income Statement Ledger"
              emptyMessage="No Royalty Income payouts credited yet. Complete your qualification to receive monthly royalty shares!"
            />
          )}
        </div>
      </div>
    </MemberLayout>
  );
}
