"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, LogOut, User as UserIcon } from "lucide-react";
import { User } from "@/types";

export default function DashboardNavbar({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#022c22]/90 border-b border-emerald-500/20 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-200 p-0.5 shadow-lg shadow-emerald-900/50 flex items-center justify-center">
            <div className="w-full h-full bg-[#022c22] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">
              AVIRA<span className="text-emerald-400">CARE</span>
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-emerald-300 font-bold">
              Associate Portal
            </span>
          </div>
        </Link>

        {/* Member Badge & Actions */}
        <div className="flex items-center gap-4">
          {/* Member ID Badge */}
          <div className="hidden sm:flex items-center gap-2.5 bg-emerald-900/80 px-4 py-2 rounded-xl border border-emerald-500/30">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div className="text-left">
              <span className="text-[9px] uppercase tracking-wider text-emerald-300 block font-semibold">
                Logged in ID
              </span>
              <span className="text-xs font-mono font-extrabold text-white tracking-wider">
                {user.memberId}
              </span>
            </div>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 bg-emerald-950/90 px-3.5 py-1.5 rounded-xl border border-emerald-500/30">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-emerald-100 font-bold text-xs border border-emerald-400/40">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-white block leading-tight">
                {user.fullName}
              </span>
              <span className="text-[10px] text-emerald-300 font-medium capitalize">
                {user.role.toLowerCase()}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold bg-red-950/60 hover:bg-red-900/80 text-red-200 px-3 py-2 rounded-xl border border-red-500/30 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
