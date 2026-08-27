"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  Package,
  Users,
  Award,
  Filter,
  Loader2,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface ReportSummary {
  totalRevenue: number;
  totalPv: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  packedOrders: number;
  dispatchedOrders: number;
  newMembers: number;
  activeNewMembers: number;
  totalCommissionsDistributed: number;
  commissionPayoutsCount: number;
}

interface ReportOrder {
  id: string;
  user_id: string;
  amount: number;
  pv: number;
  status: string;
  created_at: string;
  customer_name?: string;
  customer_mobile?: string;
  member_id?: string;
  full_name?: string;
}

interface ReportMember {
  id: string;
  member_id: string;
  full_name: string;
  mobile: string;
  personal_pv: number;
  status: string;
  created_at: string;
  sponsor_id?: string;
}

export default function BusinessReportsPage() {
  const [range, setRange] = useState<"today" | "week" | "month" | "custom">("today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<ReportSummary>({
    totalRevenue: 0,
    totalPv: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    packedOrders: 0,
    dispatchedOrders: 0,
    newMembers: 0,
    activeNewMembers: 0,
    totalCommissionsDistributed: 0,
    commissionPayoutsCount: 0,
  });

  const [orders, setOrders] = useState<ReportOrder[]>([]);
  const [members, setMembers] = useState<ReportMember[]>([]);

  const fetchReport = async (selectedRange: string, fDate?: string, tDate?: string) => {
    setLoading(true);
    try {
      let url = `/api/admin/reports?range=${selectedRange}`;
      if (selectedRange === "custom" && fDate && tDate) {
        url += `&from=${encodeURIComponent(fDate)}&to=${encodeURIComponent(tDate)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setOrders(data.orders || []);
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(range, fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const handleCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromDate && toDate) {
      fetchReport("custom", fromDate, toDate);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header Banner */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#006d36] via-[#005a2c] to-[#4f378a] text-white shadow-xl shadow-[#006d36]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-bold font-mono">
              <BarChart3 className="w-4 h-4" />
              <span>Business Intelligence & Ledger Audit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Enterprise Business Reports
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Analyze daily revenue, PV volume generation, order fulfilment pipelines, and commission distributions across all associate nodes.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-3 rounded-2xl bg-white text-[#006d36] font-bold text-xs flex items-center gap-2 shadow-md hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>

        {/* Filter Navigation Tabs & Custom Range Picker */}
        <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "today", label: "Today's Report" },
                { id: "week", label: "Week Report (Last 7 Days)" },
                { id: "month", label: "Month Report (Last 30 Days)" },
                { id: "custom", label: "Custom Date Range" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRange(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    range === tab.id
                      ? "bg-[#006d36] text-white shadow-xs"
                      : "bg-gray-50 border border-gray-200 text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-emerald-50/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-semibold text-[#5f5e5e]">
              Active Scope: <strong className="text-[#006d36] uppercase font-mono">{range}</strong>
            </div>
          </div>

          {/* Custom Date Inputs */}
          {range === "custom" && (
            <form onSubmit={handleCustomFilter} className="pt-4 border-t border-gray-100 flex flex-wrap items-end gap-3 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5f5e5e] mb-1">From Date:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                  className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-bold text-[#1a1c1c] outline-hidden focus:border-[#006d36]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5f5e5e] mb-1">To Date:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                  className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-bold text-[#1a1c1c] outline-hidden focus:border-[#006d36]"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#006d36] text-white font-bold text-xs hover:bg-[#005025] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Apply Date Filter</span>
              </button>
            </form>
          )}
        </div>

        {/* Summary Metrics Grid */}
        {loading ? (
          <div className="py-16 text-center text-[#006d36] flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">Generating Business Report...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Total Revenue */}
              <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-50/70 via-white to-white border border-emerald-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#006d36]">Total Period Revenue</span>
                  <TrendingUp className="w-4 h-4 text-[#006d36]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-[#1a1c1c]">
                  ₹{summary.totalRevenue.toLocaleString("en-IN")}
                </div>
                <span className="text-[10px] text-[#5f5e5e] block mt-1">From product orders</span>
              </div>

              {/* Total PV Generated */}
              <div className="rounded-3xl p-6 bg-gradient-to-br from-purple-50/70 via-white to-white border border-purple-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Total PV Volume</span>
                  <Award className="w-4 h-4 text-purple-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-[#1a1c1c]">
                  {summary.totalPv.toLocaleString("en-IN")} <span className="text-sm font-sans font-bold text-[#5f5e5e]">PV</span>
                </div>
                <span className="text-[10px] text-[#5f5e5e] block mt-1">Binary & repurchase volume</span>
              </div>

              {/* Total Orders */}
              <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-50/70 via-white to-white border border-blue-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Orders Processed</span>
                  <Package className="w-4 h-4 text-blue-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-[#1a1c1c]">
                  {summary.totalOrders}
                </div>
                <span className="text-[10px] text-[#5f5e5e] block mt-1">
                  Conf: {summary.confirmedOrders} • Packed: {summary.packedOrders} • Disp: {summary.dispatchedOrders}
                </span>
              </div>

              {/* New Members */}
              <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-50/70 via-white to-white border border-amber-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">New Joinings</span>
                  <Users className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-[#1a1c1c]">
                  +{summary.newMembers}
                </div>
                <span className="text-[10px] text-[#5f5e5e] block mt-1">
                  Active (100+ PV): {summary.activeNewMembers}
                </span>
              </div>
            </div>

            {/* Detailed Orders Table */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-[#1a1c1c] mb-4">Orders List in Selected Period</h2>
              {orders.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#5f5e5e] bg-gray-50 rounded-2xl">
                  No orders created in this timeframe.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-[#5f5e5e] uppercase font-bold">
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Associate</th>
                        <th className="py-3 px-3">PV</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-mono text-[#5f5e5e]">
                            {new Date(ord.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold">{ord.id}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold block">{ord.full_name || ord.customer_name || "Associate"}</span>
                            <span className="font-mono text-[10px] text-[#006d36]">{ord.member_id}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-purple-700">{ord.pv} PV</td>
                          <td className="py-2.5 px-3 font-mono font-bold">₹{ord.amount.toLocaleString("en-IN")}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-[#006d36]">
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
