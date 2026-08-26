"use client";

import React, { useState } from "react";
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
  Zap,
} from "lucide-react";
import { User } from "@/types";

interface MemberLayoutProps {
  user?: User | null;
  children: React.ReactNode;
}

export default function MemberLayout({ user, children }: MemberLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans flex flex-col md:flex-row selection:bg-[#50c878] selection:text-[#005025]">
      {/* 1. DESKTOP SIDE MENUBAR (w-64 fixed left) */}
      <aside className="w-64 bg-white border-r border-[#e2e2e2] hidden md:flex flex-col h-screen sticky top-0 z-40 shadow-xs">
        {/* Brand Logo */}
        <div className="h-20 flex items-center px-6 border-b border-[#e2e2e2] gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]">eco</span>
          </div>
          <div>
            <span className="font-black text-sm tracking-tight text-[#006d36] block leading-tight">
              AVIRA LIFE CARE
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
              Global Associate
            </span>
          </div>
        </div>

        {/* User Identity Pill in Sidebar */}
        {user && (
          <div className="p-4 border-b border-[#e2e2e2] bg-[#f9f9f9]/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#006d36] text-white flex items-center justify-center font-bold text-xs shadow-xs">
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
                className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border ${
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
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
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
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
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
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        {user && (
          <div className="p-4 border-t border-[#e2e2e2] bg-[#f9f9f9]/50 text-xs">
            <span className="text-[10px] text-[#5f5e5e] font-bold uppercase tracking-wider block mb-1">
              Wallet Balance
            </span>
            <span className="font-mono text-base font-black text-[#006d36]">
              ₹{user.walletBalance.toLocaleString()}
            </span>
          </div>
        )}
      </aside>

      {/* 2. MOBILE TOP BAR & OFF-CANVAS SIDE MENUBAR */}
      <div className="md:hidden bg-white border-b border-[#e2e2e2] sticky top-0 z-40 px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#006d36] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[18px]">eco</span>
          </div>
          <span className="font-black text-sm text-[#006d36]">AVIRA LIFE CARE</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl border border-[#e2e2e2] text-[#1a1c1c] hover:bg-[#f9f9f9] cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-64 h-full p-6 space-y-4 flex flex-col justify-between animate-slideRight">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#e2e2e2]">
                <span className="font-black text-sm text-[#006d36]">Menu Navigation</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-[#5f5e5e] hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {user && (
                <div className="py-3 border-b border-[#e2e2e2] mb-3">
                  <span className="font-extrabold text-xs text-[#1a1c1c] block">{user.fullName}</span>
                  <span className="font-mono text-xs text-[#006d36] font-bold">{user.memberId}</span>
                </div>
              )}

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
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

            <div className="text-[10px] text-[#5f5e5e] text-center">
              Avira Life Care Global Network
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
