"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ShieldCheck,
  LayoutDashboard,
  Users,
  FileCheck,
  ShoppingBag,
  FolderPlus,
  Percent,
  Package,
  CheckCircle,
  Clock,
  RefreshCw,
  LogOut,
  ChevronDown,
  ChevronRight,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { User } from "@/types";

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: User | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

// In-memory cache for fast instant transitions across admin routes
let cachedAdminUser: User | null = null;
let cachedPendingOrders = 0;
let cachedApprovedOrders = 0;
let cachedKycPending = 0;
let cachedTotalMembers = 0;

const defaultAdminUser: User = {
  id: "admin-root",
  memberId: "AV00001",
  fullName: "Avira Central Operations",
  mobile: "9876543210",
  passwordHash: "",
  sponsorId: "",
  sponsorName: "",
  pincode: "395001",
  city: "Surat",
  state: "Gujarat",
  role: "ADMIN",
  status: "ACTIVE",
  walletBalance: 0,
  rpWallet: 0,
  totalEarnings: 0,
  directReferralsCount: 0,
  totalTeamCount: 0,
  todayEarnings: 0,
  joinedDate: "2026-01-01",
  personalPv: 100,
  leftPv: 0,
  rightPv: 0,
  carryLeftPv: 0,
  carryRightPv: 0,
  dailyCapping: 5000,
};

export default function AdminLayout({
  children,
  user,
  onRefresh,
  refreshing = false,
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [adminUser, setAdminUser] = useState<User>(user || cachedAdminUser || defaultAdminUser);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Accordion states in Drawer
  const [memberAccordionOpen, setMemberAccordionOpen] = useState(
    pathname.startsWith("/admin/members") || pathname.startsWith("/admin/kyc")
  );
  const [productAccordionOpen, setProductAccordionOpen] = useState(
    pathname.startsWith("/admin/products")
  );
  const [orderAccordionOpen, setOrderAccordionOpen] = useState(
    pathname.startsWith("/admin/orders")
  );

  // Live Notification Counts for Badge
  const [pendingOrdersCount, setPendingOrdersCount] = useState(cachedPendingOrders);
  const [approvedOrdersCount, setApprovedOrdersCount] = useState(cachedApprovedOrders);
  const [kycPendingCount, setKycPendingCount] = useState(cachedKycPending);
  const [totalMembersCount, setTotalMembersCount] = useState(cachedTotalMembers);

  // Load Admin User & System Notification Badges in parallel in background
  const fetchCounts = async () => {
    try {
      // 1. Verify admin session against /api/admin/auth/me
      fetch("/api/admin/auth/me")
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.admin) {
            cachedAdminUser = data.admin;
            setAdminUser(data.admin);
          } else {
            cachedAdminUser = null;
            router.push("/admin/login");
          }
        })
        .catch(() => {
          router.push("/admin/login");
        });

      // 2. Fetch notification badge summaries in parallel in background
      Promise.allSettled([
        fetch("/api/admin/orders").then((r) => r.json()),
        fetch("/api/admin/kyc").then((r) => r.json()),
        fetch("/api/admin/members").then((r) => r.json()),
      ]).then(([ordersResult, kycResult, memResult]) => {
        if (ordersResult.status === "fulfilled" && ordersResult.value?.success) {
          cachedPendingOrders = ordersResult.value.summary?.pendingOrders || 0;
          cachedApprovedOrders = ordersResult.value.summary?.approvedOrders || 0;
          setPendingOrdersCount(cachedPendingOrders);
          setApprovedOrdersCount(cachedApprovedOrders);
        }
        if (kycResult.status === "fulfilled" && kycResult.value?.success) {
          const pending = (kycResult.value.submissions || []).filter(
            (k: any) => k.kycStatus === "PENDING"
          ).length;
          cachedKycPending = pending;
          setKycPendingCount(pending);
        }
        if (memResult.status === "fulfilled" && memResult.value?.success) {
          cachedTotalMembers = (memResult.value.members || []).length;
          setTotalMembersCount(cachedTotalMembers);
        }
      });
    } catch (err) {
      console.error("Error fetching admin layout info:", err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleLogout = async () => {
    try {
      cachedAdminUser = null;
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    router.push("/admin/login");
  };

  const handleManualRefresh = () => {
    fetchCounts();
    if (onRefresh) {
      onRefresh();
    }
  };

  const isOverviewActive = pathname === "/admin/dashboard";
  const isMemberMasterActive = pathname === "/admin/members";
  const isKycMasterActive = pathname === "/admin/kyc";
  const isCategoryMasterActive = pathname === "/admin/products/categories";
  const isHsnMasterActive = pathname === "/admin/products/hsn";
  const isItemManagerActive =
    pathname === "/admin/products" || pathname.startsWith("/admin/products/new");
  const isAllOrdersActive = pathname === "/admin/orders";
  const isApproveOrderActive = pathname === "/admin/orders/approve";

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col font-sans selection:bg-[#50c878] selection:text-[#005025]">
      {/* ========================================================
          1. STYLISH TOP ADMIN BAR (White & Green Theme)
         ======================================================== */}
      <header className="h-18 bg-white/95 backdrop-blur-md border-b border-[#e2e2e2] sticky top-0 z-40 px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between shadow-xs">
        {/* Left: 3-line Hamburger + Brand + Top Navigation Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 sm:p-2.5 rounded-xl border border-[#e2e2e2] text-[#1a1c1c] hover:bg-emerald-50 hover:text-[#006d36] hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-center group shadow-xs active:scale-95"
            title="Open Admin Menubar"
            aria-label="Open Admin Menubar"
          >
            <Menu className="w-5 h-5 text-[#006d36] group-hover:scale-110 transition-transform" />
          </button>

          {/* Brand Identity */}
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-sm shadow-[#006d36]/20">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-[#006d36]">
                  AVIRA LIFE CARE
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-[#006d36] font-mono text-[10px] font-extrabold uppercase">
                  MASTER ADMIN
                </span>
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
                Central Operations Portal
              </span>
            </div>
          </Link>

          {/* Top Header Navigation Links with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1 pl-4 border-l border-[#e2e2e2]">
            {/* Overview */}
            <Link
              href="/admin/dashboard"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isOverviewActive
                  ? "bg-emerald-50 text-[#006d36]"
                  : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-gray-100"
              }`}
            >
              Overview
            </Link>

            {/* MEMBER MANAGER */}
            <div className="relative group">
              <Link
                href="/admin/members"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isMemberMasterActive || isKycMasterActive
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/60"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Member Manager</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </Link>

              <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-[#e2e2e2] p-1.5 hidden group-hover:block z-50 animate-fadeIn">
                <Link
                  href="/admin/members"
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                    isMemberMasterActive
                      ? "bg-emerald-50 text-[#006d36]"
                      : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#006d36]" />
                    <span>1. Member Master</span>
                  </div>
                  {totalMembersCount > 0 && (
                    <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.2 rounded">
                      {totalMembersCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/kyc"
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                    isKycMasterActive
                      ? "bg-emerald-50 text-[#006d36]"
                      : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#006d36]" />
                    <span>2. KYC Master</span>
                  </div>
                  {kycPendingCount > 0 && (
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                      {kycPendingCount} New
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* PRODUCT MANAGER */}
            <div className="relative group">
              <Link
                href="/admin/products"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isItemManagerActive || isCategoryMasterActive || isHsnMasterActive
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/60"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Product Manager</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </Link>

              <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-[#e2e2e2] p-1.5 hidden group-hover:block z-50 animate-fadeIn">
                <Link
                  href="/admin/products/categories"
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    isCategoryMasterActive
                      ? "bg-emerald-50 text-[#006d36]"
                      : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50"
                  }`}
                >
                  <FolderPlus className="w-4 h-4 text-[#006d36]" />
                  <span>1. Category Master</span>
                </Link>
                <Link
                  href="/admin/products/hsn"
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    isHsnMasterActive
                      ? "bg-emerald-50 text-[#006d36]"
                      : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50"
                  }`}
                >
                  <Percent className="w-4 h-4 text-[#006d36]" />
                  <span>2. HSN Code Master</span>
                </Link>
                <Link
                  href="/admin/products"
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    isItemManagerActive
                      ? "bg-emerald-50 text-[#006d36]"
                      : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50"
                  }`}
                >
                  <Package className="w-4 h-4 text-[#006d36]" />
                  <span>3. Item Manager</span>
                </Link>
              </div>
            </div>

            {/* ORDER MANAGER */}
            <div className="relative group">
              <Link
                href="/admin/orders"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isAllOrdersActive || isApproveOrderActive
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/60"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Order Manager</span>
                {pendingOrdersCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
                <ChevronDown className="w-3 h-3 opacity-70" />
              </Link>

              <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-[#e2e2e2] p-1.5 hidden group-hover:block z-50 animate-fadeIn">
                <Link
                  href="/admin/orders"
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                    isAllOrdersActive
                      ? "bg-emerald-50 text-[#006d36]"
                      : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#006d36]" />
                    <span>1. All Orders</span>
                  </div>
                  {approvedOrdersCount > 0 && (
                    <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.2 rounded">
                      {approvedOrdersCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/orders/approve"
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                    isApproveOrderActive
                      ? "bg-emerald-50 text-[#006d36]"
                      : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>2. Approve Order</span>
                  </div>
                  {pendingOrdersCount > 0 && (
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                      {pendingOrdersCount} New
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* HELP DESK */}
            <Link
              href="/admin/support"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                pathname === "/admin/support"
                  ? "bg-[#006d36] text-white shadow-xs"
                  : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/60"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help Desk</span>
            </Link>
          </nav>
        </div>

        {/* Right: Live Sync, Admin User Info, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[#006d36] text-[11px] font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#50c878] animate-pulse" />
            <span>Supabase Live</span>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 sm:p-2.5 rounded-xl border border-[#e2e2e2] text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50 transition-colors cursor-pointer"
            title="Refresh All System Data"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin text-[#006d36]" : ""}`}
            />
          </button>

          {adminUser && (
            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-[#e2e2e2]">
              <div className="text-right">
                <span className="text-xs font-extrabold text-[#1a1c1c] block">
                  {adminUser.fullName}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#006d36] block">
                  ID: {adminUser.memberId}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#006d36] text-white flex items-center justify-center font-black text-xs shadow-xs">
                A
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 sm:p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer ml-1"
            title="Logout Admin Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================
          2. ENHANCED & STYLISH SIDE MENUBAR DRAWER
         ======================================================== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="relative bg-white w-84 max-w-[85vw] h-full p-6 flex flex-col justify-between shadow-2xl z-10 animate-slideRight overflow-y-auto">
            <div className="space-y-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#e2e2e2]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-[#006d36] block leading-tight">
                      AVIRA LIFE CARE
                    </span>
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
                      Admin Navigation
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl text-[#5f5e5e] hover:bg-gray-100 hover:text-[#1a1c1c] transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Admin Profile Box */}
              {adminUser && (
                <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#006d36] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-extrabold text-xs text-[#1a1c1c] block truncate">
                        {adminUser.fullName}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#006d36] block">
                        {adminUser.memberId}
                      </span>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white text-[#006d36] border border-emerald-300 shrink-0">
                      Master
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="space-y-3 pt-2">
                {/* 1. Overview */}
                <Link
                  href="/admin/dashboard"
                  onClick={() => setDrawerOpen(false)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isOverviewActive
                      ? "bg-[#006d36] text-white shadow-sm shadow-[#006d36]/20"
                      : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-[#f9f9f9]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span>Master Overview</span>
                  </div>
                  <span
                    className={`text-[9px] uppercase px-2 py-0.5 rounded-md font-extrabold ${
                      isOverviewActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-[#5f5e5e]"
                    }`}
                  >
                    KPI
                  </span>
                </Link>

                {/* 2. MEMBER MANAGER ACCORDION */}
                <div className="space-y-1 pt-2 border-t border-[#e2e2e2]/60">
                  <div
                    onClick={() => setMemberAccordionOpen(!memberAccordionOpen)}
                    className="flex items-center justify-between px-2 py-1 cursor-pointer select-none group"
                  >
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#006d36] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Member Manager</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] bg-emerald-100 text-[#006d36] font-bold px-1.5 py-0.5 rounded">
                        2 Tools
                      </span>
                      {memberAccordionOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-[#006d36]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#5f5e5e]" />
                      )}
                    </div>
                  </div>

                  {memberAccordionOpen && (
                    <div className="pl-2 space-y-1 pt-1 animate-fadeIn">
                      <Link
                        href="/admin/members"
                        onClick={() => setDrawerOpen(false)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isMemberMasterActive
                            ? "bg-[#006d36] text-white shadow-sm"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-3.5 h-3.5 shrink-0" />
                          <span>1. Member Master</span>
                        </div>
                        {totalMembersCount > 0 && (
                          <span className="text-[9px] font-mono bg-gray-100 px-1.5 py-0.2 rounded">
                            {totalMembersCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/admin/kyc"
                        onClick={() => setDrawerOpen(false)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isKycMasterActive
                            ? "bg-[#006d36] text-white shadow-sm"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <FileCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>2. KYC Master</span>
                        </div>
                        {kycPendingCount > 0 && (
                          <span className="text-[9px] font-mono bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                            {kycPendingCount} New
                          </span>
                        )}
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. PRODUCT MANAGER ACCORDION */}
                <div className="space-y-1 pt-2 border-t border-[#e2e2e2]/60">
                  <div
                    onClick={() => setProductAccordionOpen(!productAccordionOpen)}
                    className="flex items-center justify-between px-2 py-1 cursor-pointer select-none group"
                  >
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#006d36] flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Product Manager</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] bg-emerald-100 text-[#006d36] font-bold px-1.5 py-0.5 rounded">
                        3 Tools
                      </span>
                      {productAccordionOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-[#006d36]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#5f5e5e]" />
                      )}
                    </div>
                  </div>

                  {productAccordionOpen && (
                    <div className="pl-2 space-y-1 pt-1 animate-fadeIn">
                      <Link
                        href="/admin/products/categories"
                        onClick={() => setDrawerOpen(false)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isCategoryMasterActive
                            ? "bg-[#006d36] text-white shadow-sm"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <FolderPlus className="w-3.5 h-3.5 shrink-0" />
                          <span>1. Category Master</span>
                        </div>
                      </Link>

                      <Link
                        href="/admin/products/hsn"
                        onClick={() => setDrawerOpen(false)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isHsnMasterActive
                            ? "bg-[#006d36] text-white shadow-sm"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Percent className="w-3.5 h-3.5 shrink-0" />
                          <span>2. HSN Code Master</span>
                        </div>
                      </Link>

                      <Link
                        href="/admin/products"
                        onClick={() => setDrawerOpen(false)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isItemManagerActive
                            ? "bg-[#006d36] text-white shadow-sm"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="w-3.5 h-3.5 shrink-0" />
                          <span>3. Item Manager</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4. ORDER MANAGER ACCORDION */}
                <div className="space-y-1 pt-2 border-t border-[#e2e2e2]/60">
                  <div
                    onClick={() => setOrderAccordionOpen(!orderAccordionOpen)}
                    className="flex items-center justify-between px-2 py-1 cursor-pointer select-none group"
                  >
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#006d36] flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      <span>Order Manager</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {pendingOrdersCount > 0 && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          {pendingOrdersCount} Pending
                        </span>
                      )}
                      {orderAccordionOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-[#006d36]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#5f5e5e]" />
                      )}
                    </div>
                  </div>

                  {orderAccordionOpen && (
                    <div className="pl-2 space-y-1 pt-1 animate-fadeIn">
                      <Link
                        href="/admin/orders"
                        onClick={() => setDrawerOpen(false)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isAllOrdersActive
                            ? "bg-[#006d36] text-white shadow-sm"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>1. All Orders</span>
                        </div>
                        {approvedOrdersCount > 0 && (
                          <span className="text-[9px] font-mono bg-gray-100 px-1.5 py-0.2 rounded">
                            {approvedOrdersCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/admin/orders/approve"
                        onClick={() => setDrawerOpen(false)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isApproveOrderActive
                            ? "bg-[#006d36] text-white shadow-sm"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>2. Approve Order</span>
                        </div>
                        {pendingOrdersCount > 0 && (
                          <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                            {pendingOrdersCount} New
                          </span>
                        )}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Help Desk Link */}
                <div className="pt-2 border-t border-[#e2e2e2]/60">
                  <Link
                    href="/admin/support"
                    onClick={() => setDrawerOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      pathname === "/admin/support"
                        ? "bg-[#006d36] text-white shadow-sm"
                        : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/60"
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>Help Desk (Tickets)</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all text-left cursor-pointer mt-2"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Logout Master Session</span>
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-[#e2e2e2] text-center text-[10px] text-[#5f5e5e] font-medium">
              Avira Life Care Global • PostgreSQL 256-Bit SSL
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. MAIN CONTENT CONTAINER
         ======================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {children}
      </main>
    </div>
  );
}
