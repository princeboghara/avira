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
  ChevronDown,
  Package,
  PlusCircle,
  KeyRound,
  FileCheck,
  Layers,
  Network,
  TrendingUp,
  HelpCircle,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { User } from "@/types";

interface MemberLayoutProps {
  user?: User | null;
  children: React.ReactNode;
}

// In-memory cache for snappy instant transitions between pages
let cachedMemberUser: User | null = null;

export default function MemberLayout({ user: initialUser, children }: MemberLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(initialUser || cachedMemberUser);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Accordion Section States inside Side Menubar
  const [profileMenuOpen, setProfileMenuOpen] = useState(
    pathname.startsWith("/dashboard/profile") ||
      pathname.startsWith("/dashboard/kyc") ||
      pathname.startsWith("/dashboard/password")
  );
  const [shoppingMenuOpen, setShoppingMenuOpen] = useState(
    pathname.startsWith("/dashboard/store") ||
      pathname.startsWith("/dashboard/orders") ||
      pathname.startsWith("/dashboard/cart") ||
      pathname.startsWith("/dashboard/checkout")
  );
  const [communityMenuOpen, setCommunityMenuOpen] = useState(
    pathname.startsWith("/dashboard/community") || pathname.startsWith("/dashboard/tree")
  );
  const [earningMenuOpen, setEarningMenuOpen] = useState(
    pathname.startsWith("/dashboard/earnings")
  );

  // Auto-close drawer on route navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Load User with optimistic background cache (Non-blocking)
  useEffect(() => {
    if (initialUser) {
      cachedMemberUser = initialUser;
      setCurrentUser(initialUser);
      return;
    }

    if (!cachedMemberUser) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            cachedMemberUser = data.user;
            setCurrentUser(data.user);
          } else {
            cachedMemberUser = null;
            router.push("/login");
          }
        })
        .catch((err) => {
          console.error("Error fetching user in layout:", err);
          router.push("/login");
        });
    }
  }, [initialUser]);

  // Close drawer on ESC key
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
      cachedMemberUser = null;
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const isUserActive = currentUser ? currentUser.personalPv >= 100 : false;

  // Header quick links
  const topNavLinks = [
    { name: "Dashboard", href: "/dashboard", active: pathname === "/dashboard" },
    { name: "Create Order", href: "/dashboard/store", active: pathname === "/dashboard/store" },
    { name: "Cart", href: "/dashboard/cart", active: pathname === "/dashboard/cart" },
    { name: "Past Orders", href: "/dashboard/orders", active: pathname === "/dashboard/orders" },
    { name: "Binary Tree", href: "/dashboard/tree", active: pathname === "/dashboard/tree" },
    { name: "Binary Income", href: "/dashboard/earnings/binary", active: pathname === "/dashboard/earnings/binary" },
    { name: "Help Desk", href: "/dashboard/support", active: pathname === "/dashboard/support" },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans flex flex-col justify-between selection:bg-[#50c878] selection:text-[#005025]">
      {/* ========================================================
          1. TOP APP HEADER (Snappy, Soft & Clean)
         ======================================================== */}
      <header className="h-18 bg-white/95 backdrop-blur-md border-b border-[#e2e2e2] sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
        {/* Left: 3-line Hamburger + Brand + Desktop Quick Nav */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 sm:p-2.5 rounded-xl border border-[#e2e2e2] text-[#1a1c1c] hover:bg-emerald-50 hover:text-[#006d36] hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-center group shadow-xs active:scale-95"
            title="Open Side Menubar"
            aria-label="Open Side Menubar"
          >
            <Menu className="w-5 h-5 text-[#006d36] group-hover:scale-110 transition-transform" />
          </button>

          <Link href="/dashboard" prefetch={true} className="flex items-center gap-2.5 active:scale-95 transition-transform">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-sm shadow-[#006d36]/20">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">eco</span>
            </div>
            <div>
              <span className="font-black text-sm sm:text-base tracking-tight text-[#006d36] block leading-tight">
                AVIRA LIFE CARE
              </span>
              <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
                Associate Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 pl-4 border-l border-[#e2e2e2]">
            {topNavLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
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

        {/* Right: Wallet + RP Wallet + User Identity + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser && (
            <>
              {/* RP Wallet (Repurchase) */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold shadow-xs">
                <span className="text-[10px] font-extrabold uppercase">RP:</span>
                <span className="font-mono">₹{currentUser.rpWallet?.toLocaleString("en-IN") || 0}</span>
              </div>

              {/* Main Wallet */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#006d36] text-xs font-bold shadow-xs">
                <Wallet className="w-3.5 h-3.5" />
                <span className="font-mono">₹{currentUser.walletBalance?.toLocaleString("en-IN") || 0}</span>
              </div>

              {/* User Identity Pill */}
              <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-[#e2e2e2]">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#1a1c1c] block truncate max-w-[120px]">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#006d36] block">
                    {currentUser.memberId}
                  </span>
                </div>
                {currentUser.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-9 h-9 rounded-xl object-cover border border-emerald-300 shadow-xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {currentUser.fullName?.charAt(0) || "A"}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Quick Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 sm:p-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer flex items-center justify-center"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================
          2. REBUILT SOFT & CLEAN SIDE MENUBAR DRAWER
         ======================================================== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Soft Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Slide-out Drawer Menu */}
          <aside className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 border-r border-[#e2e2e2] animate-slideRight overflow-y-auto">
            <div className="space-y-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#006d36] flex items-center justify-center text-white font-bold">
                    <span className="material-symbols-outlined text-[18px]">eco</span>
                  </div>
                  <span className="font-black text-sm tracking-tight text-[#006d36]">
                    AVIRA LIFE CARE
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[#5f5e5e] hover:bg-gray-100 hover:text-[#1a1c1c] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Identity Card */}
              {currentUser && (
                <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] space-y-2">
                  <div className="flex items-center gap-3">
                    {currentUser.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentUser.avatarUrl}
                        alt="Avatar"
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#006d36] text-white flex items-center justify-center font-bold text-sm">
                        {currentUser.fullName?.charAt(0) || "A"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-extrabold text-xs text-[#1a1c1c] block truncate">
                        {currentUser.fullName}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#006d36] block">
                        {currentUser.memberId}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        isUserActive
                          ? "bg-emerald-50 text-[#006d36] border-emerald-300"
                          : "bg-red-50 text-red-700 border-red-300"
                      }`}
                    >
                      {isUserActive ? "Active" : "Red"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#5f5e5e] pt-1 border-t border-[#e2e2e2]/60">
                    <span>PV: <strong className="text-[#006d36] font-mono">{currentUser.personalPv} PV</strong></span>
                    <span>RP Wallet: <strong className="text-purple-700 font-mono">₹{currentUser.rpWallet || 0}</strong></span>
                  </div>
                </div>
              )}

              {/* Navigation Menu Links */}
              <nav className="space-y-3 pt-1 text-xs">
                {/* 1. Main Overview */}
                <div>
                  <Link
                    href="/dashboard"
                    prefetch={true}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                      pathname === "/dashboard"
                        ? "bg-[#006d36] text-white shadow-xs"
                        : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-[#f9f9f9]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard Overview</span>
                    </div>
                  </Link>
                </div>

                {/* 2. PROFILE MENU (3 OPTIONS: 1. My Profile, 2. KYC Verification, 3. Change Password) */}
                <div className="border-t border-[#e2e2e2]/60 pt-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-black uppercase tracking-wider text-[#006d36] cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        profileMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {profileMenuOpen && (
                    <div className="pl-2 space-y-1 animate-fadeIn">
                      <Link
                        href="/dashboard/profile"
                        prefetch={true}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                          pathname === "/dashboard/profile"
                            ? "bg-emerald-100 text-[#006d36]"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/50"
                        }`}
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[#006d36]" />
                        <span>1. My Profile</span>
                      </Link>

                      <Link
                        href="/dashboard/kyc"
                        prefetch={true}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                          pathname === "/dashboard/kyc"
                            ? "bg-emerald-100 text-[#006d36]"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/50"
                        }`}
                      >
                        <FileCheck className="w-3.5 h-3.5 text-[#006d36]" />
                        <span>2. KYC Verification</span>
                      </Link>

                      <Link
                        href="/dashboard/password"
                        prefetch={true}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                          pathname === "/dashboard/password"
                            ? "bg-emerald-100 text-[#006d36]"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/50"
                        }`}
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[#006d36]" />
                        <span>3. Change Password</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. SHOPPING PORTAL MENU (2 OPTIONS + CART/CHECKOUT) */}
                <div className="border-t border-[#e2e2e2]/60 pt-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => setShoppingMenuOpen(!shoppingMenuOpen)}
                    className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-black uppercase tracking-wider text-[#006d36] cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Shopping Portal</span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        shoppingMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {shoppingMenuOpen && (
                    <div className="pl-2 space-y-1 animate-fadeIn">
                      <Link
                        href="/dashboard/store"
                        prefetch={true}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                          pathname === "/dashboard/store"
                            ? "bg-emerald-100 text-[#006d36]"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/50"
                        }`}
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#006d36]" />
                        <span>1. Create New Order</span>
                      </Link>

                      <Link
                        href="/dashboard/cart"
                        prefetch={true}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                          pathname === "/dashboard/cart"
                            ? "bg-emerald-100 text-[#006d36]"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/50"
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#006d36]" />
                        <span>View Cart Invoice</span>
                      </Link>

                      <Link
                        href="/dashboard/orders"
                        prefetch={true}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                          pathname === "/dashboard/orders"
                            ? "bg-emerald-100 text-[#006d36]"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/50"
                        }`}
                      >
                        <Package className="w-3.5 h-3.5 text-[#006d36]" />
                        <span>2. View Past Orders</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4. MY COMMUNITY MENU (3 OPTIONS) */}
                <div className="border-t border-[#e2e2e2]/60 pt-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => setCommunityMenuOpen(!communityMenuOpen)}
                    className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-black uppercase tracking-wider text-[#006d36] cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>My Community</span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        communityMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {communityMenuOpen && (
                    <div className="pl-2 space-y-1 animate-fadeIn">
                      <Link
                        href="/dashboard/community/referrals"
                        prefetch={true}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                          pathname === "/dashboard/community/referrals"
                            ? "bg-emerald-100 text-[#006d36]"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/50"
                        }`}
                      >
                        <Users className="w-3.5 h-3.5 text-[#006d36]" />
                        <span>1. My Direct Referral</span>
                      </Link>

                      <Link
                        href="/dashboard/community/team"
                        prefetch={true}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                          pathname === "/dashboard/community/team"
                            ? "bg-emerald-100 text-[#006d36]"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/50"
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 text-[#006d36]" />
                        <span>2. All Team (Levels)</span>
                      </Link>

                      <Link
                        href="/dashboard/tree"
                        prefetch={true}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                          pathname === "/dashboard/tree"
                            ? "bg-emerald-100 text-[#006d36]"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/50"
                        }`}
                      >
                        <Network className="w-3.5 h-3.5 text-[#006d36]" />
                        <span>3. My Tree (Binary)</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 5. MY EARNING MENU (1. Binary Income) */}
                <div className="border-t border-[#e2e2e2]/60 pt-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => setEarningMenuOpen(!earningMenuOpen)}
                    className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-black uppercase tracking-wider text-[#006d36] cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>My Earning</span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        earningMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {earningMenuOpen && (
                    <div className="pl-2 space-y-1 animate-fadeIn">
                      <Link
                        href="/dashboard/earnings/binary"
                        prefetch={true}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                          pathname === "/dashboard/earnings/binary"
                            ? "bg-emerald-100 text-[#006d36]"
                            : "text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50/50"
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-[#006d36]" />
                        <span>1. Binary Income</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 6. HELP DESK */}
                <div className="border-t border-[#e2e2e2]/60 pt-2">
                  <Link
                    href="/dashboard/support"
                    prefetch={true}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                      pathname === "/dashboard/support"
                        ? "bg-[#006d36] text-white shadow-xs"
                        : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-[#f9f9f9]"
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-[#006d36]" />
                    <span>Help Desk (Support)</span>
                  </Link>
                </div>

                {/* 7. Logout */}
                <div className="pt-2 border-t border-[#e2e2e2]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{loggingOut ? "Signing out..." : "Logout"}</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Bottom Brand */}
            <div className="pt-4 border-t border-[#e2e2e2] text-center">
              <span className="text-[10px] text-[#5f5e5e] font-mono block">
                Avira Life Care v2.4 Enterprise
              </span>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================
          3. MAIN CONTENT
         ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* ========================================================
          4. FOOTER
         ======================================================== */}
      <footer className="bg-white border-t border-[#e2e2e2] py-6 px-4 text-center text-xs text-[#5f5e5e]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Avira Life Care. All rights reserved.</span>
          <span className="font-mono text-[11px] text-[#006d36]">
            Secure Associate Gateway
          </span>
        </div>
      </footer>
    </div>
  );
}
