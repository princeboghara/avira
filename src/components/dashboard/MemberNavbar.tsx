"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User as UserIcon,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { User } from "@/types";

interface MemberNavbarProps {
  user?: User | null;
}

export default function MemberNavbar({ user }: MemberNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: UserIcon,
      active: pathname === "/dashboard/profile",
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e2e2e2] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-md shadow-[#006d36]/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">eco</span>
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-[#006d36] block leading-tight">
                AVIRA LIFE CARE
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
                Member Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#f9f9f9] p-1.5 rounded-2xl border border-[#e2e2e2]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    item.active
                      ? "bg-[#006d36] text-white shadow-sm shadow-[#006d36]/30"
                      : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Logout Button in Menu Bar */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{loggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </nav>

          {/* User Quick Info */}
          {user && (
            <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-[#e2e2e2]">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-black text-[#1a1c1c]">{user.fullName}</span>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${
                      isUserActive
                        ? "bg-emerald-50 text-[#006d36] border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {isUserActive ? "Active" : "Red"}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 text-[10px] text-[#5f5e5e]">
                  <span className="font-mono font-bold text-[#006d36]">{user.memberId}</span>
                  <span>•</span>
                  <span>Wallet: <strong className="text-[#1a1c1c]">₹{user.walletBalance.toLocaleString()}</strong></span>
                </div>
              </div>

              <Link
                href="/dashboard/profile"
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] text-white flex items-center justify-center font-bold text-sm shadow-sm hover:scale-105 transition-transform"
              >
                {user.fullName.charAt(0)}
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl border border-[#e2e2e2] bg-[#f9f9f9] text-[#1a1c1c] hover:bg-white transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e2e2e2] bg-white px-4 py-4 space-y-2 shadow-lg animate-fadeIn">
          {user && (
            <div className="p-3 bg-[#f9f9f9] rounded-xl border border-[#e2e2e2] flex items-center justify-between mb-3">
              <div>
                <span className="font-extrabold text-sm text-[#1a1c1c] block">{user.fullName}</span>
                <span className="font-mono text-xs text-[#006d36] font-bold">{user.memberId}</span>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  isUserActive
                    ? "bg-emerald-50 text-[#006d36] border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {isUserActive ? "Active" : "Red (<100 PV)"}
              </span>
            </div>
          )}

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    item.active
                      ? "bg-[#006d36] text-white shadow-sm"
                      : "text-[#5f5e5e] hover:bg-[#f9f9f9] hover:text-[#1a1c1c]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>{loggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
