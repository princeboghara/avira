"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Package,
  Network,
  Users,
  TrendingUp,
  User as UserIcon,
  FileCheck,
  FileText,
  KeyRound,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Wallet,
  History,
  Award,
  Crown,
  MapPin,
} from "lucide-react";
import { User } from "@/types";

interface MemberSidebarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate?: () => void;
}

export default function MemberSidebar({ user, onLogout, onNavigate }: MemberSidebarProps) {
  const pathname = usePathname();
  const isUserActive = user ? user.personalPv >= 100 : false;

  const menuGroups = [
    {
      category: "2. Shopping Portal",
      icon: ShoppingBag,
      links: [
        { name: "Shopping Store", href: "/dashboard/store", icon: PlusCircle },
        { name: "Shopping Cart", href: "/dashboard/cart", icon: ShoppingCart },
        { name: "Past Orders", href: "/dashboard/orders", icon: Package },
      ],
    },
    {
      category: "3. Fund Manager",
      icon: Wallet,
      links: [
        { name: "Add Fund", href: "/dashboard/fund", icon: PlusCircle },
        { name: "Fund History", href: "/dashboard/fund?tab=history", icon: History },
      ],
    },
    {
      category: "4. Network",
      icon: Network,
      links: [
        { name: "Binary Tree", href: "/dashboard/tree", icon: Network },
        { name: "Direct Referral", href: "/dashboard/community/referrals", icon: Users },
        { name: "Total Team", href: "/dashboard/community/team", icon: Network },
        { name: "Network Map", href: "/dashboard/community/map", icon: MapPin },
      ],
    },
    {
      category: "5. Income Report",
      icon: TrendingUp,
      links: [
        { name: "Binary Income", href: "/dashboard/earnings/binary", icon: TrendingUp },
        { name: "Leadership Bonus", href: "/dashboard/earnings/leadership", icon: Award },
        { name: "Royalty Income", href: "/dashboard/earnings/royalty", icon: Crown },
        { name: "Payout Statement", href: "/dashboard/statement", icon: FileText },
      ],
    },
    {
      category: "6. Account & Support",
      icon: UserIcon,
      links: [
        { name: "My Profile", href: "/dashboard/profile", icon: UserIcon },
        { name: "KYC Verification", href: "/dashboard/kyc", icon: FileCheck },
        { name: "Change Password", href: "/dashboard/password", icon: KeyRound },
        { name: "Help Desk", href: "/dashboard/support", icon: HelpCircle },
      ],
    },
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const active = menuGroups.find((g) => g.links.some((l) => l.href === pathname));
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenGroups((prev) => ({ ...prev, [active.category]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (cat: string) => {
    setOpenGroups((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="flex flex-col h-full justify-between glass-panel select-none">
      {/* 1. TOP LOGO & BRAND NAME */}
      <div className="p-4 border-b border-gray-200/60 bg-gradient-to-b from-white/80 via-white/50 to-transparent flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/avira-logo.png"
          alt="Avira Lifecare Global Private Limited"
          className="h-11 w-auto object-contain shrink-0 drop-shadow-2xs"
        />
        <div className="overflow-hidden">
          <h2 className="font-heading font-extrabold text-xs text-[#0f172a] tracking-tight leading-tight truncate">
            AVIRA LIFECARE
          </h2>
          <span className="text-[8px] font-medium text-[#64748b] truncate block">
            Global Pvt. Ltd.
          </span>
          <span className="text-[9px] font-mono font-bold text-[#006d36] tracking-wider uppercase block">
            Associate Portal
          </span>
        </div>
      </div>

      {/* 2. USER MINI SUMMARY STRIP */}
      {user && (
        <div className="px-4 py-3 neo-inset border-b border-white/60 flex items-center justify-between text-xs">
          <div className="overflow-hidden">
            <span className="font-extrabold text-[#0f172a] block truncate text-xs">{user.fullName}</span>
            <span className="font-mono text-[10px] text-[#006d36] font-bold block">{user.memberId}</span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase shadow-2xs ${
              isUserActive
                ? "bg-emerald-500/15 text-[#006d36] border border-emerald-500/30"
                : "bg-rose-500/15 text-rose-700 border border-rose-500/30"
            }`}
          >
            {isUserActive ? "Active" : "Red"}
          </span>
        </div>
      )}

      {/* 3. SCROLLABLE MENU LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {/* 1. DASHBOARD DIRECT LINK */}
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            pathname === "/dashboard"
              ? "neo-btn-primary font-black"
              : "text-[#64748b] hover:text-[#0f172a] hover:bg-white/60"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>1. Dashboard</span>
        </Link>

        {/* 2 to 6 ACCORDION CATEGORIES */}
        {menuGroups.map((group) => {
          const isOpen = Boolean(openGroups[group.category]);
          const isCategoryActive = group.links.some((l) => l.href === pathname);
          const GroupIcon = group.icon;

          return (
            <div key={group.category} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.category)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isCategoryActive
                    ? "text-[#006d36] bg-emerald-500/10 font-black"
                    : "text-[#0f172a] hover:bg-white/60"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <GroupIcon className="w-4 h-4 text-[#006d36] shrink-0" />
                  <span className="truncate">{group.category}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                )}
              </button>

              {isOpen && (
                <div className="pl-5 pr-1 space-y-1 animate-fadeIn">
                  {group.links.map((link) => {
                    const LinkIcon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={onNavigate}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? "neo-btn-primary font-black"
                            : "text-[#64748b] hover:text-[#0f172a] hover:bg-white/70"
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. PINNED LOGOUT BUTTON */}
      <div className="p-3 border-t border-gray-200/60 bg-white/40">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Associate</span>
        </button>
      </div>
    </div>
  );
}
