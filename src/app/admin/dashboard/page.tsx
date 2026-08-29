"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  TrendingUp,
  Package,
  Users,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShoppingBag,
  RefreshCw,
  Zap,
  Award,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  Wallet,
  Truck,
  Boxes,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { User } from "@/types";
import IndiaStateMap from "@/components/dashboard/IndiaStateMap";

interface AdminDashboardStats {
  pendingOrders: number;
  pendingKyc: number;
  todayRevenue: number;
  todayPvRevenue: number;
  todayNewMembers: number;
  todayOrders: number;
  totalRevenue: number;
  totalPvRevenue: number;
  totalOrders: number;
  totalMembers: number;
  activeMembers: number;
}

interface RecentOrder {
  id: string;
  billedBy: string;
  memberId: string;
  fullName: string;
  amount: number;
  pv: number;
  status: string;
  createdAt: string;
}

export default function AdminOverviewDashboardPage() {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<AdminDashboardStats>({
    pendingOrders: 0,
    pendingKyc: 0,
    todayRevenue: 0,
    todayPvRevenue: 0,
    todayNewMembers: 0,
    todayOrders: 0,
    totalRevenue: 0,
    totalPvRevenue: 0,
    totalOrders: 0,
    totalMembers: 0,
    activeMembers: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      const [userData, statsData, ordersData] = await Promise.all([
        fetch("/api/admin/auth/me", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch("/api/admin/stats", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch("/api/admin/orders", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      ]);

      if (userData?.success && (userData.admin || userData.user)) {
        setAdminUser(userData.admin || userData.user);
      }

      if (statsData?.success && statsData.data) {
        setStats(statsData.data);
      }

      if (ordersData?.success && ordersData.orders) {
        setRecentOrders(ordersData.orders.slice(0, 6));
      }
    } catch (err) {
      console.error("Error loading admin dashboard metrics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#006d36]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-bold font-mono">Loading Real-time Executive Control Center...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout user={adminUser} onRefresh={loadDashboardData} refreshing={refreshing}>
      <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-fadeIn">
        {/* ========================================================
            1. EXECUTIVE CONTROL HERO (Deep Obsidian & Emerald)
           ======================================================== */}
        <div className="relative rounded-3xl p-7 sm:p-9 bg-gradient-to-br from-[#022814] via-[#04331b] to-[#01170b] text-white shadow-xl shadow-[#022814]/15 border border-emerald-900/30 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#50c878]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-black/40 border border-white/15 text-emerald-300 text-xs font-bold font-mono backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#50c878] animate-pulse" />
                <span>Enterprise Central Operations Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Avira Executive Command Center
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/80 font-medium max-w-xl">
                Real-time oversight for order fulfillment, KYC approvals, 1:1 binary matching volume, and weekly payout settlements.
              </p>
            </div>

            {/* Header Action Tools */}
            <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={loadDashboardData}
                disabled={refreshing}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh Live</span>
              </button>

              <Link
                href="/admin/orders/approve"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white text-[#006d36] font-bold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Approve Orders</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. CRITICAL ACTION PENDING QUEUES (Orders, KYC, Withdrawals)
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pending Orders Alert */}
          <Link
            href="/admin/orders/approve"
            className="p-6 rounded-3xl bg-white border border-amber-200/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Pending Orders
                </span>
                <div className="text-2xl font-black font-mono text-amber-800">
                  {stats.pendingOrders} Orders
                </div>
                <span className="text-[10px] text-amber-700 font-medium block">
                  Awaiting payment slip verification
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1.5 rounded-xl flex items-center gap-1 group-hover:bg-amber-200 transition-colors">
              <span>Review</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Pending KYC Alert */}
          <Link
            href="/admin/kyc"
            className="p-6 rounded-3xl bg-white border border-purple-200/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Pending KYC Submissions
                </span>
                <div className="text-2xl font-black font-mono text-purple-700">
                  {stats.pendingKyc} Requests
                </div>
                <span className="text-[10px] text-purple-600 font-medium block">
                  Aadhaar & Bank verification
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-100/80 px-3 py-1.5 rounded-xl flex items-center gap-1 group-hover:bg-purple-200 transition-colors">
              <span>Verify</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Weekly Payouts Withdraw Master */}
          <Link
            href="/admin/withdraw"
            className="p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#006d36] flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Withdraw Master
                </span>
                <div className="text-2xl font-black font-mono text-[#006d36]">
                  Weekly Settlement
                </div>
                <span className="text-[10px] text-emerald-700 font-medium block">
                  15% statutory deduction engine
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#006d36] bg-emerald-100/80 px-3 py-1.5 rounded-xl flex items-center gap-1 group-hover:bg-emerald-200 transition-colors">
              <span>Payouts</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* ========================================================
            3. TODAY'S OPERATIONS KPI MATRIX
           ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Today&apos;s Live Business Metrics</span>
            </h2>
            <span className="text-xs font-mono font-bold text-slate-400">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today Revenue */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Today&apos;s Revenue
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900">
                ₹{stats.todayRevenue.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                Gross received today
              </span>
            </div>

            {/* Today PV Generated */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Today&apos;s PV Volume
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900">
                {stats.todayPvRevenue.toLocaleString("en-IN")} PV
              </div>
              <span className="text-[10px] text-indigo-600 font-medium block mt-1">
                Volume injected in binary tree
              </span>
            </div>

            {/* Today New Associates */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Today&apos;s New Joining
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900">
                {stats.todayNewMembers} Associates
              </div>
              <span className="text-[10px] text-purple-600 font-medium block mt-1">
                New member registrations
              </span>
            </div>

            {/* Today Orders */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Today&apos;s Total Orders
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900">
                {stats.todayOrders} Orders
              </div>
              <span className="text-[10px] text-blue-600 font-medium block mt-1">
                In-store & member purchases
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. LIFETIME ENTERPRISE VOLUME & TOTAL STATS
           ======================================================== */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#006d36]" />
            <span>Lifetime Enterprise Cumulative Totals</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Lifetime Revenue */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-white border border-emerald-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Lifetime Revenue
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#006d36] mt-1">
                ₹{stats.totalRevenue.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                Gross turnover generated
              </span>
            </div>

            {/* Total Cumulative PV */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Cumulative PV
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1">
                {stats.totalPvRevenue.toLocaleString("en-IN")} PV
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                All historical binary points
              </span>
            </div>

            {/* Total Orders Processed */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Orders Registry
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1">
                {stats.totalOrders.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                All approved and dispatched orders
              </span>
            </div>

            {/* Total Registered Network */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Registered Network
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1">
                {stats.totalMembers.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-[#006d36] font-bold block mt-1">
                {stats.activeMembers} Active Active Associates
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. RECENT LIVE ORDERS FEED
           ======================================================== */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Recent Orders Stream
              </h2>
              <p className="text-xs text-slate-500">
                Live customer orders requiring approval, packing, and dispatch tracking
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>All Orders Registry</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400 flex flex-col items-center gap-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-300" />
              <span>No recent orders recorded yet.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Associate</th>
                    <th className="py-3 px-4">PV Value</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#006d36]">
                        {ord.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ord.fullName || "Associate"}</div>
                        <div className="text-[10px] font-mono text-slate-400">{ord.memberId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {ord.pv} PV
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                        ₹{ord.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.status === "CONFIRMED"
                              ? "bg-emerald-100 text-[#006d36]"
                              : ord.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : ord.status === "PACKED"
                              ? "bg-indigo-100 text-indigo-700"
                              : ord.status === "DISPATCHED"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/invoice/${ord.id}`}
                          target="_blank"
                          className="text-[#006d36] hover:underline font-bold text-xs inline-flex items-center gap-1"
                        >
                          <span>Invoice</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pan-India Associates Geographic Distribution Map */}
        <IndiaStateMap scope="admin" />
      </div>
    </AdminLayout>
  );
}
