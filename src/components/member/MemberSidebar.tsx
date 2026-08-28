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
      ],
    },
    {
      category: "5. Income Report",
      icon: TrendingUp,
      links: [
        { name: "Binary Income", href: "/dashboard/earnings/binary", icon: TrendingUp },
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
      setOpenGroups((prev) => ({ ...prev, [active.category]: true }));
    }
  }, [pathname]);

  const toggleGroup = (cat: string) => {
    setOpenGroups((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="flex flex-col h-full justify-between bg-white select-none">
      {/* 1. TOP LOGO & BRAND NAME */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-b from-emerald-50/50 via-white to-white flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/avira-logo.png"
          alt="Avira Lifecare Global Private Limited"
          className="h-11 w-auto object-contain shrink-0"
        />
        <div className="overflow-hidden">
          <h2 className="font-black text-xs text-[#1a1c1c] tracking-tight leading-tight truncate">
            AVIRA LIFECARE
          </h2>
          <span className="text-[8px] font-bold text-[#5f5e5e] truncate block">
            Global Pvt. Ltd.
          </span>
          <span className="text-[9px] font-mono font-bold text-[#006d36] tracking-wider uppercase block">
            Associate Portal
          </span>
        </div>
      </div>

      {/* 2. USER MINI SUMMARY STRIP */}
      {user && (
        <div className="px-4 py-3 bg-gray-50/75 border-b border-gray-100 flex items-center justify-between text-xs">
          <div className="overflow-hidden">
            <span className="font-black text-[#1a1c1c] block truncate text-xs">{user.fullName}</span>
            <span className="font-mono text-[10px] text-[#006d36] font-bold block">{user.memberId}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
              isUserActive ? "bg-emerald-100 text-[#006d36]" : "bg-red-100 text-red-700"
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
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            pathname === "/dashboard"
              ? "bg-[#006d36] text-white shadow-xs font-black"
              : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-emerald-50/60"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>1. Dashboard</span>
        </Link>

        {/* 2 to 5 ACCORDION CATEGORIES */}
        {menuGroups.map((group) => {
          const isOpen = Boolean(openGroups[group.category]);
          const isCategoryActive = group.links.some((l) => l.href === pathname);
          const GroupIcon = group.icon;

          return (
            <div key={group.category} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.category)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isCategoryActive
                    ? "text-[#006d36] bg-emerald-50/70"
                    : "text-[#1a1c1c] hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <GroupIcon className="w-4 h-4 text-[#006d36] shrink-0" />
                  <span className="truncate">{group.category}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              {isOpen && (
                <div className="pl-6 pr-1 space-y-1 animate-fadeIn">
                  {group.links.map((link) => {
                    const LinkIcon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={onNavigate}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-[#006d36] text-white shadow-xs font-black"
                            : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-emerald-50/50"
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
      <div className="p-3 border-t border-gray-200">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Associate</span>
        </button>
      </div>
    </div>
  );
}
