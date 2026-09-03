"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  TrendingUp,
  Wallet,
  Calendar,
  Layers,
  FileSpreadsheet,
  ArrowDownRight,
  Filter,
} from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import DataTable, { Column } from "@/components/ui/DataTable";
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

  // Statement Filters
  const [rangePreset, setRangePreset] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      let url = "/api/member/earnings/binary";
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
      console.error("Error loading binary earnings:", err);
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
    if (!startDate || !endDate) {
      alert("Please select both Start Date and End Date.");
      return;
    }
    loadData();
  };

  const columns: Column<BinaryRecord>[] = [
    {
      header: "Payout Date",
      accessorKey: "date",
      sortable: true,
      cell: (row) => {
        const d = row.date
          ? new Date(row.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—";
        return <span className="font-mono text-xs font-bold text-[#1a1c1c]">{d}</span>;
      },
    },
    {
      header: "Gross Income",
      accessorKey: "grossAmount",
      sortable: true,
      align: "right",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#1a1c1c]">
          ₹{row.grossAmount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "2% TDS",
      accessorKey: "tdsAmount",
      sortable: true,
      align: "right",
      cell: (row) => (
        <span className="font-mono text-xs text-red-600">
          - ₹{row.tdsAmount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "8% Admin Fee",
      accessorKey: "adminCharge",
      sortable: true,
      align: "right",
      cell: (row) => (
        <span className="font-mono text-xs text-amber-700">
          - ₹{row.adminCharge.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "5% RP Wallet",
      accessorKey: "rpWalletAmount",
      sortable: true,
      align: "right",
      cell: (row) => (
        <span className="font-mono text-xs text-purple-700 font-bold">
          + ₹{row.rpWalletAmount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "85% Net Paid",
      accessorKey: "netAmount",
      sortable: true,
      align: "right",
      cell: (row) => (
        <span className="font-mono font-black text-xs text-[#006d36]">
          ₹{row.netAmount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      align: "center",
      cell: (row) => (
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006d36] text-[10px] font-black uppercase">
          {row.status || "PAID"}
        </span>
      ),
    },
  ];

  return (
    <MemberLayout user={user}>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Neumorphic Header Card */}
        <div className="neo-card rounded-2xl sm:rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#006d36] border border-emerald-200 text-xs font-bold font-mono">
              <TrendingUp className="w-4 h-4 text-[#006d36]" />
              <span>Income Statement & Commission Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              1:1 Binary PV Income Statement
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Daily binary matching commissions credited after standard statutory deductions: 2% TDS, 8% Admin Charge, and 5% RP Wallet.
            </p>
          </div>

          <div className="neo-inset p-4 rounded-2xl text-center shrink-0 min-w-[150px] border border-purple-100 bg-purple-50/30">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block">
              RP Repurchase Wallet
            </span>
            <span className="text-2xl font-black font-mono text-purple-900 block mt-0.5">
              ₹{summary.rpWalletBalance.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* 5 KEY DEDUCTION METRICS CARDS (NEUMORPHIC) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="neo-card rounded-2xl p-4 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">1. Gross Earnings</span>
            <span className="text-lg font-black font-mono text-slate-900 block">
              ₹{summary.totalGross.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="neo-card rounded-2xl p-4 border border-red-100 bg-red-50/20 space-y-1">
            <span className="text-[10px] font-bold text-red-600 uppercase block">2. TDS (2%)</span>
            <span className="text-lg font-black font-mono text-red-600 block">
              - ₹{summary.totalTds.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="neo-card rounded-2xl p-4 border border-amber-100 bg-amber-50/20 space-y-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase block">3. Admin Fee (8%)</span>
            <span className="text-lg font-black font-mono text-amber-700 block">
              - ₹{summary.totalAdmin.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="neo-card rounded-2xl p-4 border border-purple-100 bg-purple-50/20 space-y-1">
            <span className="text-[10px] font-bold text-purple-700 uppercase block">4. RP Wallet (5%)</span>
            <span className="text-lg font-black font-mono text-purple-700 block">
              + ₹{summary.totalRp.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="neo-card rounded-2xl p-4 border border-emerald-200 bg-emerald-50/40 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-black text-[#006d36] uppercase block">5. Net Paid Out (85%)</span>
            <span className="text-lg font-black font-mono text-[#006d36] block">
              ₹{summary.totalNet.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* DATE RANGE FILTER BAR */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#5f5e5e] mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Statement Period:</span>
            </span>

            <button
              type="button"
              onClick={() => setRangePreset("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rangePreset === "all"
                  ? "bg-[#006d36] text-white"
                  : "bg-gray-50 border border-gray-200 text-[#5f5e5e] hover:bg-emerald-50"
              }`}
            >
              Lifetime
            </button>

            <button
              type="button"
              onClick={() => setRangePreset("today")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rangePreset === "today"
                  ? "bg-[#006d36] text-white"
                  : "bg-gray-50 border border-gray-200 text-[#5f5e5e] hover:bg-emerald-50"
              }`}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setRangePreset("week")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rangePreset === "week"
                  ? "bg-[#006d36] text-white"
                  : "bg-gray-50 border border-gray-200 text-[#5f5e5e] hover:bg-emerald-50"
              }`}
            >
              Last 7 Days
            </button>

            <button
              type="button"
              onClick={() => setRangePreset("month")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rangePreset === "month"
                  ? "bg-[#006d36] text-white"
                  : "bg-gray-50 border border-gray-200 text-[#5f5e5e] hover:bg-emerald-50"
              }`}
            >
              Last 30 Days
            </button>

            <button
              type="button"
              onClick={() => setRangePreset("custom")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rangePreset === "custom"
                  ? "bg-[#006d36] text-white"
                  : "bg-gray-50 border border-gray-200 text-[#5f5e5e] hover:bg-emerald-50"
              }`}
            >
              Custom Range
            </button>
          </div>

          {rangePreset === "custom" && (
            <form onSubmit={handleApplyCustomFilter} className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36]"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36]"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-[#006d36] text-white text-xs font-bold hover:bg-[#005025] cursor-pointer"
              >
                Apply
              </button>
            </form>
          )}
        </div>

        {/* DataTable */}
        {loading ? (
          <div className="py-16 text-center text-[#006d36] flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">Loading Binary Income Statement...</span>
          </div>
        ) : (
          <DataTable
            data={records}
            columns={columns}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search statement by date or description..."
            searchableKeys={["date", "description", "status"]}
            initialPageSize={10}
            title="Binary Payout Statement"
            emptyMessage="No binary pair matching records found for this period."
          />
        )}
      </div>
    </MemberLayout>
  );
}
