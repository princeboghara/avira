"use client";

import React from "react";
import Link from "next/link";
import { Menu, Wallet, ShoppingCart } from "lucide-react";
import { User } from "@/types";

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xs h-16 sm:h-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Universal 3-line Menu Button + Official Company Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleMenu}
            className="flex items-center justify-center p-2.5 rounded-xl border border-gray-200 bg-white text-[#1a1c1c] hover:bg-emerald-50 hover:text-[#006d36] hover:border-emerald-300 transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0"
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
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <div className="hidden min-[420px]:block">
              <span className="font-black text-xs sm:text-sm tracking-tight text-[#006d36] block leading-tight">
                AVIRA LIFECARE
              </span>
              <span className="text-[7.5px] sm:text-[8.5px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
                Associate Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Quick Cart + Wallet Pills + User Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <>
              {/* Quick View Cart Button */}
              <Link
                href="/dashboard/cart"
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-[#006d36] hover:bg-emerald-100 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                title="View Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
              </Link>

              {/* RP Wallet */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold shadow-xs">
                <span className="text-[10px] font-extrabold uppercase">RP:</span>
                <span className="font-mono">₹{user.rpWallet?.toLocaleString("en-IN") || 0}</span>
              </div>

              {/* Main Wallet */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#006d36] text-xs font-bold shadow-xs">
                <Wallet className="w-3.5 h-3.5" />
                <span className="font-mono">₹{user.walletBalance?.toLocaleString("en-IN") || 0}</span>
              </div>

              {/* User Identity Chip */}
              <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#1a1c1c] block truncate max-w-[120px]">
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
                    className="w-9 h-9 rounded-xl object-cover border border-emerald-300 shadow-xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] text-white flex items-center justify-center font-bold text-xs shadow-xs">
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
