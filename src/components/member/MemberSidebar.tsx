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
    <div className="flex flex-col h-full justify-between bg-[#f4f7f6] border-r border-white/80 shadow-[6px_0_24px_rgba(166,180,200,0.18)] select-none">
      {/* 1. TOP LOGO & BRAND NAME */}
      <div className="p-4 border-b border-[#e2e8f0]/60 bg-gradient-to-b from-white/90 via-[#f8faf9] to-[#f4f7f6] flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/avira-logo.png"
          alt="Avira Lifecare Global Private Limited"
          className="h-11 w-auto object-contain shrink-0 drop-shadow-sm"
        />
        <div className="overflow-hidden">
          <h2 className="font-heading font-extrabold text-xs text-[#0f172a] tracking-tight leading-tight truncate">
            AVIRA LIFECARE
          </h2>
          <span className="text-[8px] font-semibold text-[#64748b] tracking-wide truncate block">
            Global Pvt. Ltd.
          </span>
          <span className="text-[9px] font-mono font-bold text-[#006d36] tracking-wider uppercase block">
            Associate Portal
          </span>
        </div>
      </div>

      {/* 2. USER MINI SUMMARY STRIP (NEUMORPHIC INSET) */}
      {user && (
        <div className="mx-3 my-2.5 px-3.5 py-2.5 rounded-2xl neo-inset border border-white/70 flex items-center justify-between text-xs">
          <div className="overflow-hidden pr-2">
            <span className="font-extrabold text-[#0f172a] block truncate text-xs">{user.fullName}</span>
            <span className="font-mono text-[10px] text-[#006d36] font-bold block">{user.memberId}</span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase shadow-xs shrink-0 ${
              isUserActive
                ? "bg-[#006d36] text-white"
                : "bg-rose-100 text-rose-700 border border-rose-200"
            }`}
          >
            {isUserActive ? "Active" : "Red"}
          </span>
        </div>
      )}

      {/* 3. SCROLLABLE MENU LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 custom-scrollbar">
        {navItems.map((item) => {
          if (item.type === "link") {
            const isLinkActive = pathname === item.href;
            const ItemIcon = item.icon;

            return (
              <Link
                key={item.category}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isLinkActive
                    ? "neo-btn-primary font-black shadow-[4px_4px_12px_rgba(0,109,54,0.3),-2px_-2px_8px_#ffffff]"
                    : "text-[#1e293b] hover:text-[#006d36] bg-[#f4f7f6] hover:shadow-[3px_3px_8px_rgba(166,180,200,0.3),-3px_-3px_8px_#ffffff] border border-transparent hover:border-white/60"
                }`}
              >
                <ItemIcon className={`w-4 h-4 shrink-0 ${isLinkActive ? "text-white" : "text-[#006d36]"}`} />
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isCategoryActive
                    ? "text-[#006d36] bg-[#edf3f0] shadow-[inset_2px_2px_5px_rgba(166,180,200,0.25),inset_-2px_-2px_5px_#ffffff] border border-emerald-200/60 font-black"
                    : "text-[#1e293b] hover:text-[#006d36] bg-[#f4f7f6] hover:shadow-[3px_3px_8px_rgba(166,180,200,0.25),-3px_-3px_8px_#ffffff] border border-transparent hover:border-white/60"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <GroupIcon className="w-4 h-4 text-[#006d36] shrink-0" />
                  <span className="truncate">{item.category}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                )}
              </button>

              {isOpen && (
                <div className="pl-3.5 pr-1 py-1 space-y-1 animate-fadeIn">
                  <div className="pl-2 border-l-2 border-emerald-500/30 space-y-1">
                    {item.links.map((link) => {
                      const LinkIcon = link.icon;
                      const isActive = pathname === link.href;

                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={onNavigate}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                            isActive
                              ? "neo-btn-primary font-black shadow-[3px_3px_10px_rgba(0,109,54,0.28),-2px_-2px_6px_#ffffff]"
                              : "text-[#64748b] hover:text-[#006d36] hover:bg-white/80 hover:shadow-[2px_2px_6px_rgba(166,180,200,0.2),-2px_-2px_6px_#ffffff]"
                          }`}
                        >
                          <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{link.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. PINNED LOGOUT BUTTON (NEUMORPHIC) */}
      <div className="p-3 border-t border-[#e2e8f0]/80 bg-[#f4f7f6]">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f4f7f6] border border-rose-200/70 text-rose-700 hover:text-rose-800 shadow-[3px_3px_8px_rgba(225,29,72,0.12),-3px_-3px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_rgba(225,29,72,0.15),inset_-2px_-2px_4px_#ffffff] text-xs font-bold transition-all cursor-pointer active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Associate</span>
        </button>
      </div>
    </div>
  );
}
