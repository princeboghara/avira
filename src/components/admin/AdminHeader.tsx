"use client";

import React from "react";
import Link from "next/link";
import { Menu, RefreshCw } from "lucide-react";
import { User } from "@/types";
import { ThemeToggle } from "@/components/providers/ThemeProvider";

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
    <header className="sticky top-0 z-40 glass-header h-16 sm:h-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Universal 3-line Menu Button + Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleMenu}
            className="neo-btn-icon flex items-center justify-center p-2.5 rounded-2xl text-[#0f172a] hover:text-[#006d36] cursor-pointer active:scale-95 shrink-0"
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
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-2xs"
            />
            <div className="hidden min-[420px]:block">
              <span className="font-heading font-extrabold text-xs sm:text-sm tracking-tight text-[#0f172a] block leading-tight">
                AVIRA LIFECARE <span className="text-[#006d36] font-mono text-[10px] sm:text-xs">ADMIN</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[#64748b] block">
                Central Operations Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Theme Toggle + Pending Alert + Live Refresh + Profile Chip */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Theme Toggle */}
          <ThemeToggle />

          {pendingOrdersCount > 0 && (
            <Link
              href="/admin/orders/approve"
              className="px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-bold hover:bg-amber-500/20 flex items-center gap-1.5 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{pendingOrdersCount} Pending</span>
            </Link>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="neo-btn-icon p-2.5 rounded-2xl text-[#64748b] hover:text-[#006d36] cursor-pointer"
              title="Refresh Live Admin Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#006d36]" : ""}`} />
            </button>
          )}

          {/* Admin Profile Chip */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl glass-panel">
            <div className="w-6 h-6 rounded-full bg-[#006d36] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
              A
            </div>
            <span className="text-xs font-bold text-[#0f172a] font-mono">
              {user?.memberId || "ADMIN"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
