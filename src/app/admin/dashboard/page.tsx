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
  Plus,
  FolderPlus,
  Percent,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { User } from "@/types";

interface DashboardSummary {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  completedOrders: number;
  rejectedOrders: number;
  totalRevenue: number;
  totalPv: number;
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

  const [summary, setSummary] = useState<DashboardSummary>({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    completedOrders: 0,
    rejectedOrders: 0,
    totalRevenue: 0,
    totalPv: 0,
  });

  const [totalMembers, setTotalMembers] = useState(0);
  const [pendingKyc, setPendingKyc] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      const [userData, ordersData, memData, kycData] = await Promise.all([
        fetch("/api/auth/me").then((r) => r.json()).catch(() => null),
        fetch("/api/admin/orders").then((r) => r.json()).catch(() => null),
        fetch("/api/admin/members").then((r) => r.json()).catch(() => null),
        fetch("/api/admin/kyc").then((r) => r.json()).catch(() => null),
      ]);

      if (userData?.success && userData.user) {
        setAdminUser(userData.user);
      }

      if (ordersData?.success) {
        if (ordersData.summary) setSummary(ordersData.summary);
        if (ordersData.orders) setRecentOrders(ordersData.orders.slice(0, 6));
      }

      if (memData?.success && memData.members) {
        setTotalMembers(memData.members.length);
      }

      if (kycData?.success && kycData.submissions) {
        const pending = kycData.submissions.filter(
          (k: any) => k.kycStatus === "PENDING"
        ).length;
        setPendingKyc(pending);
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
          <Loader2 className="w-10 h-10 animate-spin mb-3" />
          <span className="text-sm font-bold">
            Loading Central Operations Overview...
          </span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout user={adminUser} onRefresh={loadDashboardData} refreshing={refreshing}>
      <div className="space-y-8 animate-fadeIn">
        {/* ========================================================
            1. TOP HERO WELCOME BANNER
           ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase">
                System Live
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Welcome, {adminUser?.fullName || "Administrator"}
            </h1>
            <p className="text-xs text-[#5f5e5e] max-w-2xl leading-relaxed">
              Real-time monitoring of associate orders, product catalog inventory, network growth, and financial operations.
            </p>
          </div>

          {/* Action Quick Links */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/admin/orders/approve"
              className="px-4 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>Pending Orders ({summary.pendingOrders})</span>
            </Link>

            <Link
              href="/admin/products/new"
              className="px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[#006d36] font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* ========================================================
            2. KEY PERFORMANCE METRICS (KPIs)
           ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="bg-white rounded-3xl p-5 border border-[#e2e2e2] shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#5f5e5e] uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                ₹
              </div>
            </div>
            <div>
              <span className="text-2xl font-black font-mono text-[#1a1c1c] block">
                ₹{summary.totalRevenue.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-[#006d36] font-semibold flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>From Approved & Completed Orders</span>
              </span>
            </div>
          </div>

          {/* Volume PV */}
          <div className="bg-white rounded-3xl p-5 border border-[#e2e2e2] shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#5f5e5e] uppercase tracking-wider">
                Total PV Volume
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                PV
              </div>
            </div>
            <div>
              <span className="text-2xl font-black font-mono text-[#006d36] block">
                +{summary.totalPv.toLocaleString("en-IN")} PV
              </span>
              <span className="text-[11px] text-[#5f5e5e] font-medium block mt-0.5">
                Binary commission volume credited
              </span>
            </div>
          </div>

          {/* Total Network Associates */}
          <div className="bg-white rounded-3xl p-5 border border-[#e2e2e2] shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#5f5e5e] uppercase tracking-wider">
                Total Associates
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black font-mono text-[#1a1c1c] block">
                {totalMembers}
              </span>
              <Link
                href="/admin/members"
                className="text-[11px] text-[#006d36] font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                <span>View Member Master</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Action Required: Pending Orders & KYC */}
          <div className="bg-white rounded-3xl p-5 border border-[#e2e2e2] shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#5f5e5e] uppercase tracking-wider">
                Pending Approvals
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5f5e5e]">Orders Queue:</span>
                <Link
                  href="/admin/orders/approve"
                  className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded hover:bg-amber-200"
                >
                  {summary.pendingOrders} Pending
                </Link>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5f5e5e]">KYC Desk:</span>
                <Link
                  href="/admin/kyc"
                  className="font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded hover:bg-blue-200"
                >
                  {pendingKyc} Pending
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. OPERATIONS CONTROL CENTER (Direct Navigation Grid)
           ======================================================== */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-[#1a1c1c] tracking-tight">
            Central Operations Modules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Order Manager - Approve Order */}
            <Link
              href="/admin/orders/approve"
              className="bg-white rounded-3xl p-6 border border-[#e2e2e2] hover:border-emerald-300 hover:shadow-md transition-all group block"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                {summary.pendingOrders > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-black uppercase">
                    {summary.pendingOrders} New Orders
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-[#1a1c1c] mt-4 mb-1 group-hover:text-[#006d36] transition-colors">
                2. Approve Order Desk
              </h3>
              <p className="text-xs text-[#5f5e5e] line-clamp-2">
                Verify customer payment slips, check transaction UTRs, and approve orders to credit PV.
              </p>
              <div className="mt-4 pt-3 border-t border-[#e2e2e2]/60 flex items-center text-xs font-bold text-[#006d36] gap-1">
                <span>Open Approval Desk</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Order Manager - All Orders */}
            <Link
              href="/admin/orders"
              className="bg-white rounded-3xl p-6 border border-[#e2e2e2] hover:border-emerald-300 hover:shadow-md transition-all group block"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-[#5f5e5e]">
                  {summary.totalOrders} Orders
                </span>
              </div>
              <h3 className="text-base font-black text-[#1a1c1c] mt-4 mb-1 group-hover:text-[#006d36] transition-colors">
                1. All Orders Audit Registry
              </h3>
              <p className="text-xs text-[#5f5e5e] line-clamp-2">
                Search, sort, edit order statuses, mark orders completed, and inspect itemized tax invoices.
              </p>
              <div className="mt-4 pt-3 border-t border-[#e2e2e2]/60 flex items-center text-xs font-bold text-[#006d36] gap-1">
                <span>View Order Registry</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. Product Manager - Item Manager */}
            <Link
              href="/admin/products"
              className="bg-white rounded-3xl p-6 border border-[#e2e2e2] hover:border-emerald-300 hover:shadow-md transition-all group block"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[#5f5e5e] font-mono text-[10px] font-bold">
                  Catalog
                </span>
              </div>
              <h3 className="text-base font-black text-[#1a1c1c] mt-4 mb-1 group-hover:text-[#006d36] transition-colors">
                3. Item Manager & Inventory
              </h3>
              <p className="text-xs text-[#5f5e5e] line-clamp-2">
                Manage active store products, stocks, HSN tax configurations, PV points, and retail prices.
              </p>
              <div className="mt-4 pt-3 border-t border-[#e2e2e2]/60 flex items-center text-xs font-bold text-[#006d36] gap-1">
                <span>Manage Catalog Items</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 4. Product Manager - Category Master */}
            <Link
              href="/admin/products/categories"
              className="bg-white rounded-3xl p-6 border border-[#e2e2e2] hover:border-emerald-300 hover:shadow-md transition-all group block"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <FolderPlus className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-base font-black text-[#1a1c1c] mt-4 mb-1 group-hover:text-[#006d36] transition-colors">
                1. Category Master
              </h3>
              <p className="text-xs text-[#5f5e5e] line-clamp-2">
                Define product categories, departments, and wellness classification tags.
              </p>
              <div className="mt-4 pt-3 border-t border-[#e2e2e2]/60 flex items-center text-xs font-bold text-[#006d36] gap-1">
                <span>Manage Categories</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 5. Product Manager - HSN Code Master */}
            <Link
              href="/admin/products/hsn"
              className="bg-white rounded-3xl p-6 border border-[#e2e2e2] hover:border-emerald-300 hover:shadow-md transition-all group block"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Percent className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-base font-black text-[#1a1c1c] mt-4 mb-1 group-hover:text-[#006d36] transition-colors">
                2. HSN Code & GST Master
              </h3>
              <p className="text-xs text-[#5f5e5e] line-clamp-2">
                Configure SGST, CGST, and IGST percentages mapped to statutory HSN codes.
              </p>
              <div className="mt-4 pt-3 border-t border-[#e2e2e2]/60 flex items-center text-xs font-bold text-[#006d36] gap-1">
                <span>Manage Tax Rates</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 6. Member Manager - KYC Master */}
            <Link
              href="/admin/kyc"
              className="bg-white rounded-3xl p-6 border border-[#e2e2e2] hover:border-emerald-300 hover:shadow-md transition-all group block"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <FileCheck className="w-6 h-6" />
                </div>
                {pendingKyc > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-mono text-[10px] font-black uppercase">
                    {pendingKyc} Pending
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-[#1a1c1c] mt-4 mb-1 group-hover:text-[#006d36] transition-colors">
                2. KYC Master Verification
              </h3>
              <p className="text-xs text-[#5f5e5e] line-clamp-2">
                Review associate PAN cards, Aadhaar IDs, and bank account proofs for payouts.
              </p>
              <div className="mt-4 pt-3 border-t border-[#e2e2e2]/60 flex items-center text-xs font-bold text-[#006d36] gap-1">
                <span>Open KYC Desk</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* ========================================================
            4. RECENT ORDERS SNIPPET TABLE
           ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
            <div>
              <h3 className="text-base font-black text-[#1a1c1c]">Recent Order Submissions</h3>
              <span className="text-xs text-[#5f5e5e]">Latest orders recorded across the network</span>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f9f9f9] border-b border-[#e2e2e2] text-[#5f5e5e] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Associate</th>
                  <th className="py-3 px-4">Billed By</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">PV</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-[#5f5e5e]">
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#1a1c1c]">#{ord.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#1a1c1c] block">{ord.fullName}</span>
                        <span className="font-mono text-[10px] text-[#5f5e5e]">{ord.memberId}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#006d36]">
                        {ord.billedBy || ord.memberId}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#1a1c1c]">
                        ₹{ord.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#006d36]">+{ord.pv} PV</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === "COMPLETED"
                              ? "bg-emerald-100 text-[#006d36]"
                              : ord.status === "APPROVED"
                              ? "bg-blue-100 text-blue-800"
                              : ord.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#5f5e5e]">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
