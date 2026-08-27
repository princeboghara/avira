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
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { User } from "@/types";

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
        fetch("/api/admin/auth/me").then((r) => r.json()).catch(() => null),
        fetch("/api/admin/stats").then((r) => r.json()).catch(() => null),
        fetch("/api/admin/orders").then((r) => r.json()).catch(() => null),
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
          <span className="text-xs font-bold font-mono">Loading Real-time Admin Operations...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout user={adminUser} onRefresh={loadDashboardData} refreshing={refreshing}>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* ========================================================
            1. WELCOME BANNER & LIVE SYSTEM INDICATOR
           ======================================================== */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#006d36] via-[#005a2c] to-[#4f378a] text-white shadow-xl shadow-[#006d36]/15 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-[#50c878] animate-pulse" />
                <span>Enterprise Central Administrator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Avira Operations Hub
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-xl">
                Monitor real-time company orders, KYC approvals, PV allocation, and daily 1:1 binary matching revenue.
              </p>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/admin/products"
                className="px-4 py-2.5 rounded-xl bg-white text-[#006d36] font-bold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Product Master</span>
              </Link>
              <Link
                href="/admin/pv/self"
                className="px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white font-bold text-xs hover:bg-white/25 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>PV Manager</span>
              </Link>
              <Link
                href="/admin/reports"
                className="px-4 py-2.5 rounded-xl bg-purple-500/30 backdrop-blur-md border border-purple-300/30 text-white font-bold text-xs hover:bg-purple-500/40 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Business Reports</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. PENDING REQUESTS ALERTS + LIVE REFRESH BUTTON
           ======================================================== */}
        <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Pending Orders Badge */}
            <Link
              href="/admin/orders/approve"
              className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                <Package className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">Pending Orders</span>
                <span className="text-lg font-black font-mono text-amber-900">{stats.pendingOrders} Requests</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Pending KYC Badge */}
            <Link
              href="/admin/kyc"
              className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-200 text-blue-900 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                <FileCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">Pending KYC</span>
                <span className="text-lg font-black font-mono text-blue-900">{stats.pendingKyc} Submissions</span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Instant Live Refresh Button */}
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={refreshing}
            className="px-5 py-3 rounded-2xl bg-[#006d36] text-white hover:bg-[#005025] font-bold text-xs flex items-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            title="Sync Live System Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Live Data"}</span>
          </button>
        </div>

        {/* ========================================================
            3. TODAY'S REAL-TIME PERFORMANCE METRICS
           ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1a1c1c] flex items-center gap-2">
              <Zap className="w-4.5 h-4.5 text-[#006d36]" />
              <span>Today&apos;s Real-time Operations</span>
            </h2>
            <span className="text-xs font-mono font-bold text-[#006d36] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              CURRENT DATE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Today's Revenue */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-50/70 via-white to-white border border-emerald-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#006d36]">
                  Today&apos;s Revenue
                </span>
                <TrendingUp className="w-4 h-4 text-[#006d36]" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#1a1c1c]">
                ₹{stats.todayRevenue.toLocaleString("en-IN")}
              </div>
              <div className="mt-2 text-[11px] text-[#5f5e5e]">
                Gross sales volume today
              </div>
            </div>

            {/* Today's PV Revenue */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-purple-50/70 via-white to-white border border-purple-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                  Today&apos;s PV Volume
                </span>
                <Award className="w-4 h-4 text-purple-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#1a1c1c]">
                {stats.todayPvRevenue.toLocaleString("en-IN")} <span className="text-sm font-sans font-bold text-[#5f5e5e]">PV</span>
              </div>
              <div className="mt-2 text-[11px] text-[#5f5e5e]">
                Matching & repurchase volume
              </div>
            </div>

            {/* Today's New Joining Members */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-50/70 via-white to-white border border-blue-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Today&apos;s New Members
                </span>
                <Users className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#1a1c1c]">
                +{stats.todayNewMembers}
              </div>
              <div className="mt-2 text-[11px] text-[#5f5e5e]">
                New registrations today
              </div>
            </div>

            {/* Today's Total Orders */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-50/70 via-white to-white border border-amber-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Today&apos;s Total Orders
                </span>
                <Package className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#1a1c1c]">
                {stats.todayOrders}
              </div>
              <div className="mt-2 text-[11px] text-[#5f5e5e]">
                Product orders created today
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. TOTAL LIFETIME COMPANY METRICS
           ======================================================== */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#1a1c1c] flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-[#4f378a]" />
            <span>Total Lifetime Company Performance</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Revenue */}
            <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e]">
                  Total Revenue
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006d36] flex items-center justify-center font-bold">
                  ₹
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#006d36]">
                ₹{stats.totalRevenue.toLocaleString("en-IN")}
              </div>
              <div className="mt-2 text-[11px] text-[#5f5e5e]">
                Cumulative gross order sales
              </div>
            </div>

            {/* Total PV Revenue */}
            <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e]">
                  Total PV Volume
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  PV
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-purple-700">
                {stats.totalPvRevenue.toLocaleString("en-IN")}
              </div>
              <div className="mt-2 text-[11px] text-[#5f5e5e]">
                Lifetime point volume generated
              </div>
            </div>

            {/* Total Orders */}
            <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e]">
                  Total Orders
                </span>
                <Package className="w-4 h-4 text-gray-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#1a1c1c]">
                {stats.totalOrders.toLocaleString("en-IN")}
              </div>
              <div className="mt-2 text-[11px] text-[#5f5e5e]">
                All completed & pipeline orders
              </div>
            </div>

            {/* Total Members */}
            <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e]">
                  Total Registered Members
                </span>
                <Users className="w-4 h-4 text-gray-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#1a1c1c]">
                {stats.totalMembers.toLocaleString("en-IN")}
              </div>
              <div className="mt-2 text-[11px] text-[#5f5e5e]">
                Active: <strong className="text-[#006d36]">{stats.activeMembers}</strong> Associates
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. RECENT NETWORK ORDERS STREAM
           ======================================================== */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#1a1c1c]">Recent Order Stream</h2>
              <p className="text-xs text-[#5f5e5e]">Live pipeline orders and package purchases across all associate legs</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#5f5e5e] bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
              No orders recorded in the pipeline yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200/80 text-[#5f5e5e] uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Associate</th>
                    <th className="py-3 px-4">PV</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#1a1c1c]">
                        {ord.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1a1c1c]">{ord.fullName || "Associate"}</div>
                        <div className="font-mono text-[10px] text-[#006d36]">{ord.memberId}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#4f378a]">
                        {ord.pv} PV
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#1a1c1c]">
                        ₹{ord.amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.status === "APPROVED" || ord.status === "CONFIRMED" || ord.status === "DISPATCHED"
                              ? "bg-emerald-100 text-[#006d36]"
                              : ord.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/orders`}
                          className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:text-[#006d36] text-[11px] font-bold transition-all inline-block"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
