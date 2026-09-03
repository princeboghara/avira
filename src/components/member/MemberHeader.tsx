"use client";

import React from "react";
import Link from "next/link";
import { Menu, Wallet, ShoppingCart } from "lucide-react";
import { User } from "@/types";
import { ThemeToggle } from "@/components/providers/ThemeProvider";

interface MemberHeaderProps {
  user: User | null;
  onToggleMenu: () => void;
  desktopSidebarOpen: boolean;
}

export default function MemberHeader({
  user,
  onToggleMenu,
  desktopSidebarOpen,
}: MemberHeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass-header h-16 sm:h-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Universal 3-line Menu Button + Official Company Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleMenu}
            className="neo-btn-icon flex items-center justify-center p-2.5 rounded-2xl text-[#0f172a] hover:text-[#006d36] cursor-pointer active:scale-95 shrink-0"
            title={desktopSidebarOpen ? "Toggle Menu" : "Open Menu"}
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#006d36]" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 active:scale-95 transition-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avira-logo.png"
              alt="Avira Lifecare Global Private Limited"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-2xs"
            />
            <div className="hidden min-[420px]:block">
              <span className="font-heading font-extrabold text-xs sm:text-sm tracking-tight text-[#006d36] block leading-tight">
                AVIRA LIFECARE
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[#64748b] block">
                Associate Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Theme Toggle + Quick Cart + Wallet Pills + User Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Switcher */}
          <ThemeToggle />

          {user && (
            <>
              {/* Quick View Cart Button */}
              <Link
                href="/dashboard/cart"
                className="neo-btn-secondary px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5"
                title="View Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4 text-[#006d36]" />
                <span className="hidden sm:inline">Cart</span>
              </Link>

              {/* RP Wallet */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-900 text-xs font-bold shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase text-purple-700">RP:</span>
                <span className="font-mono">₹{user.rpWallet?.toLocaleString("en-IN") || 0}</span>
              </div>

              {/* Main Wallet */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#006d36] text-xs font-bold shadow-2xs">
                <Wallet className="w-3.5 h-3.5 text-[#006d36]" />
                <span className="font-mono">₹{user.walletBalance?.toLocaleString("en-IN") || 0}</span>
              </div>

              {/* User Identity Chip */}
              <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-200/70">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#0f172a] block truncate max-w-[120px]">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#006d36] block">
                    {user.memberId}
                  </span>
                </div>
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-9 h-9 rounded-2xl object-cover border border-emerald-400/60 shadow-xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#006d36] to-[#50c878] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.fullName?.charAt(0) || "A"}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
