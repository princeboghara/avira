"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  Award,
  Wallet,
  Calendar,
  Layers,
  ArrowDownRight,
  Filter,
  Users,
  Sparkles,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import DataTable, { Column } from "@/components/ui/DataTable";
import { User } from "@/types";

interface LeadershipRecord extends Record<string, any> {
  id: string;
  srNo: number;
  date: string;
  level: string;
  grossAmount: number;
  tdsAmount: number;
  adminCharge: number;
  netAmount: number;
  description: string;
  status: string;
}

interface LeadershipSummary {
  totalGross: number;
  totalLevel1: number;
  totalLevel2: number;
  countLevel1: number;
  countLevel2: number;
  totalRecords: number;
}

export default function LeadershipEarningsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<LeadershipRecord[]>([]);
  const [summary, setSummary] = useState<LeadershipSummary>({
    totalGross: 0,
    totalLevel1: 0,
    totalLevel2: 0,
    countLevel1: 0,
    countLevel2: 0,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  // Statement Filters
  const [rangePreset, setRangePreset] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      let url = "/api/member/earnings/leadership";
      const params = new URLSearchParams();

      if (rangePreset !== "all" && rangePreset !== "custom") {
        params.set("range", rangePreset);
      } else if (rangePreset === "custom" && startDate && endDate) {
        params.set("startDate", startDate);
        params.set("endDate", endDate);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const [meRes, earnRes] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }),
        fetch(url, { cache: "no-store" }),
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
      console.error("Error loading leadership earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangePreset]);

  const handleApplyCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      loadData();
    }
  };

  const columns: Column<LeadershipRecord>[] = [
    {
      header: "#",
      accessorKey: "srNo",
      className: "w-12 text-center font-mono font-bold text-slate-400 text-xs",
    },
    {
      header: "Date & Time",
      accessorKey: "date",
      className: "text-xs font-mono whitespace-nowrap text-slate-700 font-semibold",
    },
    {
      header: "Generation Level",
      accessorKey: "level",
      className: "text-xs whitespace-nowrap",
      cell: (row) => {
        const isL1 = row.level.includes("15%") || row.level.includes("Level 1");
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              isL1
                ? "bg-amber-50 text-amber-900 border-amber-300 shadow-2xs"
                : "bg-purple-50 text-purple-900 border-purple-300 shadow-2xs"
            }`}
          >
            <Sparkles className={`w-3 h-3 ${isL1 ? "text-amber-500 fill-amber-400" : "text-purple-500"}`} />
            <span>{row.level}</span>
          </span>
        );
      },
    },
    {
      header: "Description / Source Details",
      accessorKey: "description",
      className: "text-xs text-slate-600 max-w-[280px] truncate",
      cell: (row) => (
        <span className="truncate block font-medium" title={row.description}>
          {row.description}
        </span>
      ),
    },
    {
      header: "Gross Bonus",
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

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
        {/* 1. Header Banner */}
        <div className="bg-gradient-to-br from-[#006d36] via-[#00552a] to-[#01381b] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#006d36]/15 border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-md border border-white/20">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>2nd Income Stream • 2-Level Sponsor Bonus</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                <span>Leadership Supporting Bonus</span>
                <Sparkles className="w-6 h-6 text-amber-400 fill-amber-300" />
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
                Earn <strong>15% on Level 1</strong> direct referrals and <strong>5% on Level 2</strong> indirect referrals whenever they achieve Binary Matching Income.
              </p>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                Total Leadership Bonus
              </span>
              <strong className="text-2xl sm:text-3xl font-black font-mono text-white">
                ₹{summary.totalGross.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </div>

        {/* 2. Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-amber-600 fill-amber-400" />
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                Level 1 • 15%
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
              Direct Referrals Bonus
            </span>
            <div className="text-xl font-black font-mono text-slate-900">
              ₹{summary.totalLevel1.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {summary.countLevel1} bonus payouts received
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                Level 2 • 5%
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
              2nd Generation Bonus
            </span>
            <div className="text-xl font-black font-mono text-slate-900">
              ₹{summary.totalLevel2.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {summary.countLevel2} bonus payouts received
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-[#006d36]">
                Lifetime
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
              Gross Total Earned
            </span>
            <div className="text-xl font-black font-mono text-slate-900">
              ₹{summary.totalGross.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block mt-1">
              Credited directly to wallet
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                Ledger
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
              Total Bonus Counts
            </span>
            <div className="text-xl font-black font-mono text-slate-900">
              {summary.totalRecords}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Matching bonus distributions
            </span>
          </div>
        </div>

        {/* 3. Filter Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Period:</span>
            </span>
            {(
              [
                { label: "All Time", value: "all" },
                { label: "Today", value: "today" },
                { label: "This Week", value: "week" },
                { label: "This Month", value: "month" },
                { label: "Custom Range", value: "custom" },
              ] as const
            ).map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setRangePreset(p.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  rangePreset === p.value
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Form */}
          {rangePreset === "custom" && (
            <form onSubmit={handleApplyCustomFilter} className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 outline-hidden focus:border-[#006d36]"
                required
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 outline-hidden focus:border-[#006d36]"
                required
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-[#006d36] text-white text-xs font-bold hover:bg-[#00552a] transition-all cursor-pointer shadow-xs"
              >
                Apply
              </button>
            </form>
          )}
        </div>

        {/* 4. Detailed Data Table */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#006d36]" />
              <span className="text-xs font-mono font-bold">Loading Leadership Bonus Statement...</span>
            </div>
          ) : (
            <DataTable
              data={records}
              columns={columns}
              keyExtractor={(item) => item.id}
              searchPlaceholder="Search by date or source member details..."
              searchableKeys={["description", "date", "level"]}
              initialPageSize={10}
              title="Leadership Supporting Bonus Ledger"
              emptyMessage="No Leadership Supporting Bonus records found for the selected period."
            />
          )}
        </div>
      </div>
    </MemberLayout>
  );
}
