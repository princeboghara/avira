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

  type NavItem =
    | {
        type: "link";
        category: string;
        name: string;
        href: string;
        icon: React.ElementType;
      }
    | {
        type: "group";
        category: string;
        icon: React.ElementType;
        links: Array<{ name: string; href: string; icon: React.ElementType }>;
      };

  const navItems: NavItem[] = [
    {
      type: "link",
      category: "1. Dashboard",
      name: "1. Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      type: "group",
      category: "2. Shopping Portal",
      icon: ShoppingBag,
      links: [
        { name: "Shopping Store", href: "/dashboard/store", icon: PlusCircle },
        { name: "Shopping Cart", href: "/dashboard/cart", icon: ShoppingCart },
        { name: "Past Orders", href: "/dashboard/orders", icon: Package },
      ],
    },
    {
      type: "group",
      category: "3. Fund Manager",
      icon: Wallet,
      links: [
        { name: "Add Fund", href: "/dashboard/fund", icon: PlusCircle },
        { name: "Fund History", href: "/dashboard/fund?tab=history", icon: History },
      ],
    },
    {
      type: "group",
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
      type: "group",
      category: "5. Income Report",
      icon: TrendingUp,
      links: [
        { name: "Binary Income", href: "/dashboard/earnings/binary", icon: TrendingUp },
        { name: "Leadership Bonus", href: "/dashboard/earnings/leadership", icon: Award },
        { name: "Royalty Income", href: "/dashboard/earnings/royalty", icon: Crown },
      ],
    },
    {
      type: "link",
      category: "6. Payout Statement",
      name: "6. Payout Statement",
      href: "/dashboard/statement",
      icon: FileText,
    },
    {
      type: "group",
      category: "7. Account & Support",
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
    const active = navItems.find(
      (item) => item.type === "group" && item.links.some((l) => l.href === pathname)
    );
    if (active && active.type === "group") {
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
        {navItems.map((item) => {
          if (item.type === "link") {
            const isLinkActive = pathname === item.href;
            const ItemIcon = item.icon;

            return (
              <Link
                key={item.category}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isLinkActive
                    ? "neo-btn-primary font-black"
                    : "text-[#0f172a] hover:text-[#006d36] hover:bg-white/60"
                }`}
              >
                <ItemIcon className="w-4 h-4 text-[#006d36] shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          }

          const isOpen = Boolean(openGroups[item.category]);
          const isCategoryActive = item.links.some((l) => l.href === pathname);
          const GroupIcon = item.icon;

          return (
            <div key={item.category} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(item.category)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isCategoryActive
                    ? "text-[#006d36] bg-emerald-500/10 font-black"
                    : "text-[#0f172a] hover:bg-white/60"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <GroupIcon className="w-4 h-4 text-[#006d36] shrink-0" />
                  <span className="truncate">{item.category}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                )}
              </button>

              {isOpen && (
                <div className="pl-5 pr-1 space-y-1 animate-fadeIn">
                  {item.links.map((link) => {
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
