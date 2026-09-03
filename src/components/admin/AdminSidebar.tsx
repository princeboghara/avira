"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Percent,
  ShoppingCart,
  CheckCircle,
  CheckCircle2,
  Boxes,
  Truck,
  FileText,
  Users,
  FileCheck,
  Wallet,
  Zap,
  TrendingUp,
  BarChart3,
  Calendar,
  LogOut,
  ChevronDown,
  ChevronRight,
  Award,
  Store,
} from "lucide-react";
import { User } from "@/types";

interface AdminNavLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
  badgeColor?: string;
}

interface AdminNavGroup {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
  badgeColor?: string;
  links: AdminNavLink[];
}

interface AdminSidebarProps {
  user?: User | null;
  adminUser?: User | null;
  onNavigate?: () => void;
  pendingOrdersCount?: number;
  confirmedOrdersCount?: number;
  packedOrdersCount?: number;
  dispatchedOrdersCount?: number;
  totalOrdersCount?: number;
  kycPendingCount?: number;
  totalMembersCount?: number;
  onLogout?: () => void;
}

export default function AdminSidebar({
  user,
  adminUser,
  onNavigate,
  pendingOrdersCount = 0,
  confirmedOrdersCount = 0,
  packedOrdersCount = 0,
  dispatchedOrdersCount = 0,
  totalOrdersCount = 0,
  kycPendingCount = 0,
  totalMembersCount = 0,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const adminNavGroups: AdminNavGroup[] = [
    {
      category: "2. Product Manager",
      icon: Package,
      links: [
        { name: "Product Master", href: "/admin/products", icon: Package },
        { name: "Categories Master", href: "/admin/products/categories", icon: Layers },
        { name: "HSN & GST Setup", href: "/admin/products/hsn", icon: Percent },
        { name: "Shipping Charge Master", href: "/admin/shipping", icon: Truck },
      ],
    },
    {
      category: "3. Order Manager",
      icon: ShoppingCart,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: "bg-amber-500/15 text-amber-900",
      links: [
        { name: "Pending For Approval", href: "/admin/orders/approve", icon: CheckCircle, badge: pendingOrdersCount, badgeColor: "bg-amber-500/15 text-amber-900" },
        { name: "All Orders Registry", href: "/admin/orders", icon: FileText, badge: totalOrdersCount, badgeColor: "bg-slate-500/15 text-slate-900" },
      ],
    },
    {
      category: "4. Shoppy Manager",
      icon: Store,
      links: [
        { name: "Shoppy Master", href: "/admin/shoppies", icon: Store },
        { name: "Shoppy Orders Tracking", href: "/admin/shoppies/orders", icon: Truck },
      ],
    },
    {
      category: "5. Member Manager",
      icon: Users,
      badge: kycPendingCount > 0 ? kycPendingCount : null,
      badgeColor: "bg-amber-500/15 text-amber-900",
      links: [
        { name: "Member Master", href: "/admin/members", icon: Users, badge: totalMembersCount, badgeColor: "bg-slate-500/15 text-slate-900" },
        { name: "KYC Master", href: "/admin/kyc", icon: FileCheck, badge: kycPendingCount, badgeColor: "bg-amber-500/15 text-amber-900" },
      ],
    },
    {
      category: "6. Fund & Finance Manager",
      icon: Wallet,
      links: [
        { name: "Fund Deposit Requests", href: "/admin/funds", icon: CheckCircle },
      ],
    },
    {
      category: "7. PV Manager",
      icon: Zap,
      links: [
        { name: "Self PV Transfer", href: "/admin/pv/self", icon: Zap },
        { name: "Power PV Injection", href: "/admin/pv/power", icon: TrendingUp },
      ],
    },
    {
      category: "8. Business Reports",
      icon: BarChart3,
      links: [
        { name: "Today's Report", href: "/admin/reports?range=today", icon: Calendar },
        { name: "Week Report", href: "/admin/reports?range=week", icon: BarChart3 },
        { name: "Month Report", href: "/admin/reports?range=month", icon: BarChart3 },
        { name: "Custom Report", href: "/admin/reports?range=custom", icon: BarChart3 },
      ],
    },
    {
      category: "9. Plan Settings",
      icon: Award,
      links: [
        { name: "Leadership Bonus Setup", href: "/admin/settings/leadership", icon: Award },
      ],
    },
  ];

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const active = adminNavGroups.find((g) =>
      g.links.some((l) => l.href.split("?")[0] === pathname)
    );
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenCategories((prev) => ({ ...prev, [active.category]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const isWithdrawActive = pathname.startsWith("/admin/withdraw");

  return (
    <div className="flex flex-col h-full justify-between bg-[#f4f7f6] border-r border-white/80 shadow-[6px_0_24px_rgba(166,180,200,0.18)] select-none">
      {/* 1. TOP LOGO & BRAND */}
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
            Central Admin Suite
          </span>
        </div>
      </div>

      {/* 2. NAVIGATION LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 custom-scrollbar">
        {/* 1. DASHBOARD */}
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
            pathname === "/admin/dashboard"
              ? "neo-btn-primary font-black shadow-[4px_4px_12px_rgba(0,109,54,0.3),-2px_-2px_8px_#ffffff]"
              : "text-[#1e293b] hover:text-[#006d36] bg-[#f4f7f6] hover:shadow-[3px_3px_8px_rgba(166,180,200,0.3),-3px_-3px_8px_#ffffff] border border-transparent hover:border-white/60"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>1. Dashboard</span>
        </Link>

        {/* 2 to 8 ACCORDION GROUPS */}
        {adminNavGroups.map((group) => {
          const isOpen = Boolean(openCategories[group.category]);
          const isCategoryActive = group.links.some((l) => l.href.split("?")[0] === pathname);
          const GroupIcon = group.icon;

          return (
            <div key={group.category} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleCategory(group.category)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isCategoryActive
                    ? "text-[#006d36] bg-[#edf3f0] shadow-[inset_2px_2px_5px_rgba(166,180,200,0.25),inset_-2px_-2px_5px_#ffffff] border border-emerald-200/60 font-black"
                    : "text-[#1e293b] hover:text-[#006d36] bg-[#f4f7f6] hover:shadow-[3px_3px_8px_rgba(166,180,200,0.25),-3px_-3px_8px_#ffffff] border border-transparent hover:border-white/60"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <GroupIcon className="w-4 h-4 text-[#006d36] shrink-0" />
                  <span className="truncate">{group.category}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {group.badge !== undefined && group.badge !== null && group.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                        group.badgeColor || "bg-amber-500/15 text-amber-900"
                      }`}
                    >
                      {group.badge}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="pl-3.5 pr-1 py-1 space-y-1 animate-fadeIn">
                  <div className="pl-2 border-l-2 border-emerald-500/30 space-y-1">
                    {group.links.map((link) => {
                      const LinkIcon = link.icon;
                      const isActive = pathname === link.href.split("?")[0];

                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={onNavigate}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                            isActive
                              ? "neo-btn-primary font-black shadow-[3px_3px_10px_rgba(0,109,54,0.28),-2px_-2px_6px_#ffffff]"
                              : "text-[#64748b] hover:text-[#006d36] hover:bg-white/80 hover:shadow-[2px_2px_6px_rgba(166,180,200,0.2),-2px_-2px_6px_#ffffff]"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{link.name}</span>
                          </div>
                          {link.badge !== undefined && link.badge !== null && link.badge > 0 && (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                                isActive
                                  ? "bg-white text-[#006d36]"
                                  : link.badgeColor || "bg-amber-500/15 text-amber-900"
                              }`}
                            >
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 9. WITHDRAW MASTER (DIRECT MAIN LINK) */}
        <Link
          href="/admin/withdraw"
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
            isWithdrawActive
              ? "neo-btn-primary font-black shadow-[4px_4px_12px_rgba(0,109,54,0.3),-2px_-2px_8px_#ffffff]"
              : "text-[#1e293b] hover:text-[#006d36] bg-[#f4f7f6] hover:shadow-[3px_3px_8px_rgba(166,180,200,0.3),-3px_-3px_8px_#ffffff] border border-transparent hover:border-white/60"
          }`}
        >
          <Wallet className="w-4 h-4 shrink-0 text-[#006d36]" />
          <span>9. Withdraw Master</span>
        </Link>
      </div>

      {/* 3. PINNED LOGOUT BUTTON */}
      <div className="p-3 border-t border-[#e2e8f0]/80 bg-[#f4f7f6]">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f4f7f6] border border-rose-200/70 text-rose-700 hover:text-rose-800 shadow-[3px_3px_8px_rgba(225,29,72,0.12),-3px_-3px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_rgba(225,29,72,0.15),inset_-2px_-2px_4px_#ffffff] text-xs font-bold transition-all cursor-pointer active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Admin</span>
        </button>
      </div>
    </div>
  );
}
