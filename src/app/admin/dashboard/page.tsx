"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  TrendingUp,
  Package,
  Users,
  CheckCircle2,
  FileCheck,
  ShoppingBag,
  RefreshCw,
  Zap,
  BarChart3,
  Calendar,
  Wallet,
  ChevronRight,
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
            1. COMPACT NEUMORPHIC EXECUTIVE CONTROL HEADER
           ======================================================== */}
        <div className="bg-white/95 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md">
          {/* Subtle Ambient Light Orb */}
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-emerald-100/40 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#006d36] to-[#10b981] text-white flex items-center justify-center shadow-md shadow-emerald-700/25 shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-[10px] font-bold font-mono text-emerald-800 uppercase tracking-wider">
                  Enterprise Central Operations
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-heading font-black text-[#0f172a] tracking-tight">
                Avira Executive Command Center
              </h1>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto relative z-10">
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={refreshing}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh Live</span>
            </button>

            <Link
              href="/admin/orders/approve"
              className="neo-btn-primary flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Package className="w-4 h-4" />
              <span>Approve Orders</span>
            </Link>
          </div>
        </div>

        {/* ========================================================
            2. CRITICAL ACTION PENDING QUEUES (Orders, KYC, Withdrawals)
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pending Orders Alert (Sunset Coral) */}
          <Link
            href="/admin/orders/approve"
            className="p-6 rounded-[32px] neo-card-coral neo-card-hover flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#fb923c] text-white flex items-center justify-center font-bold shadow-md shadow-orange-600/30 group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#c2410c] block">
                  Pending Orders
                </span>
                <div className="text-2xl font-heading font-black text-orange-900">
                  {stats.pendingOrders} Orders
                </div>
                <span className="text-[10px] text-orange-700/90 font-medium block">
                  Awaiting payment slip verification
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-orange-900 bg-orange-200/80 px-3.5 py-1.5 rounded-xl flex items-center gap-1 group-hover:bg-orange-300 transition-colors shadow-xs">
              <span>Review</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Pending KYC Alert (Royal Fuchsia) */}
          <Link
            href="/admin/kyc"
            className="p-6 rounded-[32px] neo-card-fuchsia neo-card-hover flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c026d3] to-[#e879f9] text-white flex items-center justify-center font-bold shadow-md shadow-fuchsia-600/30 group-hover:scale-105 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#86198f] block">
                  Pending KYC Submissions
                </span>
                <div className="text-2xl font-heading font-black text-[#86198f]">
                  {stats.pendingKyc} Requests
                </div>
                <span className="text-[10px] text-fuchsia-700/90 font-medium block">
                  Aadhaar & Bank verification
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-fuchsia-900 bg-fuchsia-200/80 px-3.5 py-1.5 rounded-xl flex items-center gap-1 group-hover:bg-fuchsia-300 transition-colors shadow-xs">
              <span>Verify</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Weekly Payouts Withdraw Master (Emerald Mint) */}
          <Link
            href="/admin/withdraw"
            className="p-6 rounded-[32px] neo-card-emerald neo-card-hover flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#006d36] to-[#10b981] text-white flex items-center justify-center font-bold shadow-md shadow-emerald-700/30 group-hover:scale-105 transition-transform">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#065f46] block">
                  Withdraw Master
                </span>
                <div className="text-2xl font-heading font-black text-[#006d36]">
                  Weekly Settlement
                </div>
                <span className="text-[10px] text-emerald-700/90 font-medium block">
                  15% statutory deduction engine
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#006d36] bg-emerald-200/80 px-3.5 py-1.5 rounded-xl flex items-center gap-1 group-hover:bg-emerald-300 transition-colors shadow-xs">
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
            <h2 className="text-base sm:text-lg font-heading font-black text-[#0f172a] flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Today&apos;s Live Business Metrics</span>
            </h2>
            <span className="text-xs font-mono font-bold text-[#64748b]">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today Revenue (Caribbean Teal) */}
            <div className="p-6 rounded-[30px] neo-card-teal neo-card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#115e59]">
                  Today&apos;s Revenue
                </span>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0d9488] to-[#14b8a6] text-white flex items-center justify-center shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-heading font-black text-[#0f766e]">
                ₹{stats.todayRevenue.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-teal-700 font-bold block mt-1">
                Gross received today
              </span>
            </div>

            {/* Today PV Generated (Twilight Indigo) */}
            <div className="p-6 rounded-[30px] neo-card-indigo neo-card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#3730a3]">
                  Today&apos;s PV Volume
                </span>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4338ca] to-[#6366f1] text-white flex items-center justify-center shadow-xs">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-heading font-black text-[#3730a3]">
                {stats.todayPvRevenue.toLocaleString("en-IN")} PV
              </div>
              <span className="text-[10px] text-indigo-700 font-bold block mt-1">
                Volume injected in tree
              </span>
            </div>

            {/* Today New Associates (Ruby Rose) */}
            <div className="p-6 rounded-[30px] neo-card-rose neo-card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#9f1239]">
                  Today&apos;s New Joining
                </span>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#e11d48] to-[#f43f5e] text-white flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-heading font-black text-rose-700">
                {stats.todayNewMembers} Associates
              </div>
              <span className="text-[10px] text-rose-600 font-bold block mt-1">
                New member registrations
              </span>
            </div>

            {/* Today Orders (Electric Cyan) */}
            <div className="p-6 rounded-[30px] neo-card-cyan neo-card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0e7490]">
                  Today&apos;s Total Orders
                </span>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0891b2] to-[#06b6d4] text-white flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-heading font-black text-[#0e7490]">
                {stats.todayOrders} Orders
              </div>
              <span className="text-[10px] text-cyan-700 font-bold block mt-1">
                In-store & member purchases
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. LIFETIME ENTERPRISE VOLUME & TOTAL STATS
           ======================================================== */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-heading font-black text-[#0f172a] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#006d36]" />
            <span>Lifetime Enterprise Cumulative Totals</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Lifetime Revenue (Emerald) */}
            <div className="p-6 rounded-[30px] neo-card-emerald neo-card-hover">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#065f46] block">
                Total Lifetime Revenue
              </span>
              <div className="text-2xl sm:text-3xl font-heading font-black text-[#006d36] mt-1">
                ₹{stats.totalRevenue.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                Gross turnover generated
              </span>
            </div>

            {/* Total Cumulative PV (Royal Violet) */}
            <div className="p-6 rounded-[30px] neo-card-violet neo-card-hover">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#5b21b6] block">
                Total Cumulative PV
              </span>
              <div className="text-2xl sm:text-3xl font-heading font-black text-[#6d28d9] mt-1">
                {stats.totalPvRevenue.toLocaleString("en-IN")} PV
              </div>
              <span className="text-[10px] text-purple-600 font-bold block mt-1">
                All historical binary points
              </span>
            </div>

            {/* Total Orders Processed (Solar Amber) */}
            <div className="p-6 rounded-[30px] neo-card-amber neo-card-hover">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#92400e] block">
                Total Orders Registry
              </span>
              <div className="text-2xl sm:text-3xl font-heading font-black text-amber-700 mt-1">
                {stats.totalOrders.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-amber-600 font-bold block mt-1">
                Approved & dispatched orders
              </span>
            </div>

            {/* Total Registered Network (Royal Fuchsia) */}
            <div className="p-6 rounded-[30px] neo-card-fuchsia neo-card-hover">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#86198f] block">
                Total Registered Network
              </span>
              <div className="text-2xl sm:text-3xl font-heading font-black text-[#a21caf] mt-1">
                {stats.totalMembers.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-fuchsia-700 font-black block mt-1">
                {stats.activeMembers} Active Associates
              </span>
            </div>
          </div>
        </div>

        {/* Pan-India Associates Geographic Distribution Map (Master Map) */}
        <IndiaStateMap scope="admin" />
      </div>
    </AdminLayout>
  );
}
