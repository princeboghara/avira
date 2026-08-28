"use client";

import React from "react";
import Link from "next/link";
import { Menu, RefreshCw, Leaf, Package } from "lucide-react";
import { User } from "@/types";

interface AdminHeaderProps {
  user: User | null;
  pendingOrdersCount?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  onToggleMenu: () => void;
  desktopSidebarOpen: boolean;
}

export default function AdminHeader({
  user,
  pendingOrdersCount = 0,
  onRefresh,
  refreshing = false,
  onToggleMenu,
  desktopSidebarOpen,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xs h-16 sm:h-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Universal 3-line Menu Button (ALWAYS VISIBLE ON ALL SCREENS) + Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* 100% Guaranteed Visible 3-Line Menu Trigger (Mobile, Tablet, Laptop, Desktop) */}
          <button
            type="button"
            onClick={onToggleMenu}
            className="flex items-center justify-center p-2.5 rounded-xl border border-gray-200 bg-white text-[#1a1c1c] hover:bg-emerald-50 hover:text-[#006d36] hover:border-emerald-300 transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0"
            title={desktopSidebarOpen ? "Toggle Admin Menu" : "Open Admin Menu"}
            aria-label="Toggle Admin Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#006d36]" />
          </button>

          <Link href="/admin/dashboard" className="flex items-center gap-2.5 active:scale-95 transition-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avira-logo.png"
              alt="Avira Lifecare Global Private Limited"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <div className="hidden min-[420px]:block">
              <span className="font-black text-xs sm:text-sm tracking-tight text-[#1a1c1c] block leading-tight">
                AVIRA LIFECARE <span className="text-[#006d36] font-mono text-[10px] sm:text-xs">ADMIN</span>
              </span>
              <span className="text-[7.5px] sm:text-[8.5px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
                Central Operations Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Pending Alert + Live Refresh + Profile Chip */}
        <div className="flex items-center gap-2 sm:gap-3">
          {pendingOrdersCount > 0 && (
            <Link
              href="/admin/orders/approve"
              className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 flex items-center gap-1.5 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <span>{pendingOrdersCount} Pending</span>
            </Link>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl border border-gray-200 text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Refresh Live Admin Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#006d36]" : ""}`} />
            </button>
          )}

          {/* Admin Profile Chip */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="w-6 h-6 rounded-full bg-[#006d36] text-white text-[10px] font-black flex items-center justify-center">
              A
            </div>
            <span className="text-xs font-bold text-[#1a1c1c] font-mono">
              {user?.memberId || "ADMIN"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
