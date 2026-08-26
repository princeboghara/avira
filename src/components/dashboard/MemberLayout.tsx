"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User as UserIcon,
  LayoutDashboard,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
  Wallet,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { User } from "@/types";

interface MemberLayoutProps {
  user?: User | null;
  children: React.ReactNode;
}

export default function MemberLayout({ user, children }: MemberLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Auto-close drawer on route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const menuItems = [
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: UserIcon,
      active: pathname === "/dashboard/profile",
      badge: "Account",
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
      badge: "Overview",
    },
    {
      name: "Shopping",
      href: "/dashboard/store",
      icon: ShoppingBag,
      active: pathname === "/dashboard/store",
      badge: "Store",
    },
    {
      name: "My Community",
      href: "/dashboard/community",
      icon: Users,
      active: pathname === "/dashboard/community" || pathname === "/dashboard/tree",
      badge: "Network",
    },
  ];

  const isUserActive = user ? user.personalPv >= 100 : false;

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans flex flex-col justify-between selection:bg-[#50c878] selection:text-[#005025]">
      {/* ========================================================
          1. TOP APP HEADER (Consistent across Laptop & Mobile)
         ======================================================== */}
      <header className="h-18 bg-white/95 backdrop-blur-md border-b border-[#e2e2e2] sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
        {/* Left: 3-line Hamburger Button + Brand Logo + Quick Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* 3-Line Hamburger Menu Button (OPENS Side Menubar on Laptop & Mobile) */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 sm:p-2.5 rounded-xl border border-[#e2e2e2] text-[#1a1c1c] hover:bg-emerald-50 hover:text-[#006d36] hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-center group shadow-xs active:scale-95"
            title="Open Side Menubar"
            aria-label="Open Side Menubar"
          >
            <Menu className="w-5 h-5 text-[#006d36] group-hover:scale-110 transition-transform" />
          </button>

          {/* Brand Logo & Name */}
          <Link href="/dashboard" className="flex items-center gap-2.5 active:scale-95 transition-transform">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-sm shadow-[#006d36]/20">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">eco</span>
            </div>
            <div>
              <span className="font-black text-sm sm:text-base tracking-tight text-[#006d36] block leading-tight">
                AVIRA LIFE CARE
              </span>
              <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
                Global Associate Portal
              </span>
            </div>
          </Link>

          {/* Quick Header Navigation Links (Laptop / Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 pl-4 border-l border-[#e2e2e2]">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  item.active
                    ? "bg-emerald-50 text-[#006d36]"
                    : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-gray-100"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Network Status, Wallet Balance, Member Identity, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Network Status Indicator (Tablet & Laptop) */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[#006d36] text-[11px] font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#50c878] animate-pulse" />
            <span>Supabase Live</span>
          </div>

          {user && (
            <>
              {/* Wallet Balance Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#006d36] text-xs font-bold shadow-xs">
                <Wallet className="w-3.5 h-3.5" />
                <span className="font-mono">₹{user.walletBalance.toLocaleString("en-IN")}</span>
              </div>

              {/* Member ID Pill (Laptop / Desktop) */}
              <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-[#e2e2e2]">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#1a1c1c] block truncate max-w-[130px]">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#006d36] block">
                    {user.memberId}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.fullName.charAt(0)}
                </div>
              </div>
            </>
          )}

          {/* Quick Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 sm:p-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-red-200"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================
          2. OFF-CANVAS SIDE MENUBAR DRAWER (Opens on 3-Line Click on Laptop & Mobile)
         ======================================================== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Dark Backdrop with Blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Slide-out Drawer Panel (From Left) */}
          <div className="relative bg-white w-80 max-w-[85vw] h-full p-6 flex flex-col justify-between shadow-2xl z-10 animate-slideRight">
            <div className="space-y-4">
              {/* Drawer Top Bar: Brand + Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-[#e2e2e2]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">eco</span>
                  </div>
                  <div>
                    <span className="font-black text-sm text-[#006d36] block leading-tight">
                      AVIRA LIFE CARE
                    </span>
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
                      Side Navigation
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

              {/* User Identity Card inside Side Menubar */}
              {user && (
                <div className="p-3.5 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#006d36] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {user.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-extrabold text-xs text-[#1a1c1c] block truncate">
                        {user.fullName}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#006d36] block">
                        {user.memberId}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                        isUserActive
                          ? "bg-emerald-50 text-[#006d36] border-emerald-300"
                          : "bg-red-50 text-red-700 border-red-300"
                      }`}
                    >
                      {isUserActive ? "Active" : "Red"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#5f5e5e] pt-1 border-t border-[#e2e2e2]/60">
                    <span>Sponsor: <strong className="text-[#1a1c1c] font-mono">{user.sponsorId || "Root"}</strong></span>
                    <span>Self PV: <strong className="text-[#006d36] font-mono">{user.personalPv} PV</strong></span>
                  </div>
                </div>
              )}

              {/* Navigation Menu Items */}
              <nav className="space-y-1.5 pt-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        item.active
                          ? "bg-[#006d36] text-white shadow-sm shadow-[#006d36]/20"
                          : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-[#f9f9f9]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded-md font-extrabold ${
                          item.active
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-[#5f5e5e]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </Link>
                  );
                })}

                {/* Direct Link to Binary Tree */}
                <Link
                  href="/dashboard/tree"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    pathname === "/dashboard/tree"
                      ? "bg-[#006d36] text-white shadow-sm"
                      : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-[#f9f9f9]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px]">account_tree</span>
                    <span>Binary Tree</span>
                  </div>
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded-md font-extrabold bg-gray-100 text-[#5f5e5e]">
                    Tree
                  </span>
                </Link>

                {/* Logout Action in Side Menubar */}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all text-left cursor-pointer mt-2"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>{loggingOut ? "Signing out..." : "Logout"}</span>
                </button>
              </nav>
            </div>

            {/* Drawer Bottom Section: Wallet Card + Network Brand */}
            <div className="space-y-3 pt-4 border-t border-[#e2e2e2]">
              {user && (
                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/70 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#5f5e5e] font-extrabold uppercase tracking-wider">
                      Wallet Balance
                    </span>
                    <span className="text-[10px] text-[#006d36] font-bold">Available</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-black text-[#006d36]">
                      ₹{user.walletBalance.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#5f5e5e]">
                      Cap: ₹{user.dailyCapping.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="text-center text-[10px] text-[#5f5e5e] font-medium">
                Avira Life Care Global Network • 256-Bit SSL
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. MAIN CONTENT AREA (Clean, full width, optimized)
         ======================================================== */}
      <div className="flex-1 w-full">
        {children}
      </div>

      {/* ========================================================
          4. COMPREHENSIVE DASHBOARD FOOTER
         ======================================================== */}
      <footer className="bg-white border-t border-[#e2e2e2] text-[#5f5e5e] text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Col */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#006d36] flex items-center justify-center text-white shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">eco</span>
                </div>
                <span className="font-extrabold text-sm text-[#006d36] tracking-tight">
                  AVIRA LIFE CARE GLOBAL
                </span>
              </div>
              <p className="text-xs text-[#5f5e5e] max-w-md leading-relaxed">
                Official Associate & Member Portal. Next-generation wellness commerce with instant 1:1 binary matching, carry-forward volume, and transparent Supabase PostgreSQL ledgers.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#006d36] font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#50c878]" /> 256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span>100% Ledger Audited</span>
                <span>•</span>
                <span>Instant Payout Engine</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-extrabold text-[#1a1c1c] uppercase tracking-wider text-[11px] mb-3">
                Member Portal
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/dashboard" className="hover:text-[#006d36] transition-colors">
                    Associate Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/profile" className="hover:text-[#006d36] transition-colors">
                    Digital Associate ID Pass
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/store" className="hover:text-[#006d36] transition-colors">
                    Product Store & PV Activation
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/community" className="hover:text-[#006d36] transition-colors">
                    Binary Community & Team Tree
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/tree" className="hover:text-[#006d36] transition-colors">
                    Interactive Binary Tree View
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account & Support Info */}
            <div>
              <h4 className="font-extrabold text-[#1a1c1c] uppercase tracking-wider text-[11px] mb-3">
                Account & Help Desk
              </h4>
              <div className="space-y-2 text-xs">
                {user && (
                  <p className="font-mono text-[11px] text-[#1a1c1c]">
                    Member ID: <strong className="text-[#006d36]">{user.memberId}</strong>
                  </p>
                )}
                <p className="text-[11px]">Direct Support: support@aviracare.com</p>
                <p className="text-[11px]">Hours: Mon - Sat (10:00 AM - 6:00 PM IST)</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-red-600 font-bold hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Securely</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom copyright line */}
          <div className="pt-6 border-t border-[#e2e2e2] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <span>© 2026 Avira Life Care Global Pvt Ltd. All rights reserved.</span>
            <div className="flex items-center gap-4 text-[#5f5e5e]">
              <Link href="/" className="hover:text-[#006d36]">Home</Link>
              <span>•</span>
              <Link href="/dashboard/profile" className="hover:text-[#006d36]">Associate Terms</Link>
              <span>•</span>
              <span className="font-mono text-[#006d36]">Enterprise v1.5</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
