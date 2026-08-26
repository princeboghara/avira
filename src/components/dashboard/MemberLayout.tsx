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
} from "lucide-react";
import { User } from "@/types";

interface MemberLayoutProps {
  user?: User | null;
  children: React.ReactNode;
}

export default function MemberLayout({ user, children }: MemberLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

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
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      name: "Shopping",
      href: "/dashboard/store",
      icon: ShoppingBag,
      active: pathname === "/dashboard/store",
    },
    {
      name: "My Community",
      href: "/dashboard/community",
      icon: Users,
      active: pathname === "/dashboard/community" || pathname === "/dashboard/tree",
    },
  ];

  const isUserActive = user ? user.personalPv >= 100 : false;

  const toggleSidebar = () => {
    // On medium/large screens (laptop/desktop), toggle the desktop sidebar
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setDesktopSidebarOpen((prev) => !prev);
    } else {
      // On mobile / small screens, toggle the slide-out drawer
      setMobileDrawerOpen((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans flex flex-col selection:bg-[#50c878] selection:text-[#005025]">
      {/* 1. TOP APP BAR (Visible on BOTH Laptop/Desktop & Mobile) */}
      <header className="h-16 bg-white border-b border-[#e2e2e2] sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Toggle Button (Works on Laptop, Tablet & Mobile) */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl border border-[#e2e2e2] text-[#1a1c1c] hover:bg-[#f9f9f9] hover:text-[#006d36] transition-colors cursor-pointer flex items-center justify-center"
            title="Toggle Side Menubar"
            aria-label="Toggle Side Menubar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 active:scale-95 transition-transform">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[18px]">eco</span>
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-[#006d36] block leading-tight">
                AVIRA LIFE CARE
              </span>
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
                Global Associate
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions: Member Pill, Wallet, Logout */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              {/* Wallet Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-[#006d36] text-xs font-bold">
                <Wallet className="w-3.5 h-3.5" />
                <span className="font-mono">₹{user.walletBalance.toLocaleString()}</span>
              </div>

              {/* Member ID Pill */}
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#e2e2e2]">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#1a1c1c] block truncate max-w-[120px]">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#006d36] block">
                    {user.memberId}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#006d36] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.fullName.charAt(0)}
                </div>
              </div>
            </>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. BODY CONTAINER: SIDE MENUBAR + MAIN CONTENT */}
      <div className="flex-1 flex relative min-h-0">
        {/* DESKTOP / LAPTOP SIDE MENUBAR (Fixed width, collapsible with toggle) */}
        <aside
          className={`bg-white border-r border-[#e2e2e2] hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out z-30 sticky top-16 h-[calc(100vh-4rem)] ${
            desktopSidebarOpen
              ? "w-64 min-w-[16rem]"
              : "w-0 min-w-0 opacity-0 overflow-hidden border-none pointer-events-none"
          }`}
        >
          {/* User Identity Pill in Sidebar */}
          {user && (
            <div className="p-4 border-b border-[#e2e2e2] bg-[#f9f9f9]/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#006d36] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
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
                  className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border shrink-0 ${
                    isUserActive
                      ? "bg-emerald-50 text-[#006d36] border-emerald-300"
                      : "bg-red-50 text-red-700 border-red-300"
                  }`}
                >
                  {isUserActive ? "Active" : "Red"}
                </span>
              </div>
            </div>
          )}

          {/* Sidebar Navigation Items */}
          <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    item.active
                      ? "bg-[#006d36] text-white shadow-sm shadow-[#006d36]/20"
                      : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-[#f9f9f9]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}

            {/* Logout Action in Side Menubar */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>{loggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </nav>

          {/* Sidebar Footer */}
          {user && (
            <div className="p-4 border-t border-[#e2e2e2] bg-[#f9f9f9]/50 text-xs">
              <span className="text-[10px] text-[#5f5e5e] font-bold uppercase tracking-wider block mb-1">
                Wallet Balance
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black text-[#006d36]">
                  ₹{user.walletBalance.toLocaleString()}
                </span>
                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                    isUserActive
                      ? "bg-emerald-50 text-[#006d36] border-emerald-300"
                      : "bg-red-50 text-red-700 border-red-300"
                  }`}
                >
                  {isUserActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* 3. MOBILE & TABLET OFF-CANVAS SIDE MENUBAR DRAWER */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative bg-white w-72 max-w-[85vw] h-full p-5 space-y-4 flex flex-col justify-between shadow-2xl z-10">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#006d36] flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[18px]">eco</span>
                    </div>
                    <span className="font-black text-sm text-[#006d36]">AVIRA LIFE CARE</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-[#5f5e5e] hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {user && (
                  <div className="py-3 border-b border-[#e2e2e2] mb-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#006d36] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {user.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-extrabold text-xs text-[#1a1c1c] block truncate">
                        {user.fullName}
                      </span>
                      <span className="font-mono text-xs text-[#006d36] font-bold">
                        {user.memberId}
                      </span>
                    </div>
                    <span
                      className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border shrink-0 ${
                        isUserActive
                          ? "bg-emerald-50 text-[#006d36] border-emerald-300"
                          : "bg-red-50 text-red-700 border-red-300"
                      }`}
                    >
                      {isUserActive ? "Active" : "Red"}
                    </span>
                  </div>
                )}

                <nav className="space-y-1 mt-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                          item.active
                            ? "bg-[#006d36] text-white shadow-sm"
                            : "text-[#5f5e5e] hover:bg-[#f9f9f9] hover:text-[#1a1c1c]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                  </button>
                </nav>
              </div>

              {/* Drawer Footer */}
              {user && (
                <div className="p-3 bg-[#f9f9f9] rounded-xl border border-[#e2e2e2] text-xs">
                  <span className="text-[10px] text-[#5f5e5e] font-bold uppercase tracking-wider block mb-1">
                    Wallet Balance
                  </span>
                  <span className="font-mono text-sm font-black text-[#006d36]">
                    ₹{user.walletBalance.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
