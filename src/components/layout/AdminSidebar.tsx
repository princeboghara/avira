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
  Zap,
  TrendingUp,
  BarChart3,
  Calendar,
  LogOut,
  Leaf,
  ChevronDown,
  ChevronRight,
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
  user: User | null;
  pendingOrdersCount?: number;
  confirmedOrdersCount?: number;
  packedOrdersCount?: number;
  dispatchedOrdersCount?: number;
  totalOrdersCount?: number;
  kycPendingCount?: number;
  totalMembersCount?: number;
  onLogout: () => void;
  onNavigate?: () => void;
}

export default function AdminSidebar({
  user,
  pendingOrdersCount = 0,
  confirmedOrdersCount = 0,
  packedOrdersCount = 0,
  dispatchedOrdersCount = 0,
  totalOrdersCount = 0,
  kycPendingCount = 0,
  totalMembersCount = 0,
  onLogout,
  onNavigate,
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
      ],
    },
    {
      category: "3. Order Manager",
      icon: ShoppingCart,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: "bg-amber-100 text-amber-800",
      links: [
        { name: "Pending For Approval", href: "/admin/orders/approve", icon: CheckCircle, badge: pendingOrdersCount, badgeColor: "bg-amber-100 text-amber-800" },
        { name: "Confirmed Orders", href: "/admin/orders/confirmed", icon: CheckCircle2, badge: confirmedOrdersCount, badgeColor: "bg-teal-100 text-teal-800" },
        { name: "Orders in Packing", href: "/admin/orders/packing", icon: Boxes, badge: packedOrdersCount, badgeColor: "bg-indigo-100 text-indigo-800" },
        { name: "Dispatched Orders", href: "/admin/orders/dispatched", icon: Truck, badge: dispatchedOrdersCount, badgeColor: "bg-blue-100 text-blue-800" },
        { name: "All Orders Registry", href: "/admin/orders", icon: FileText, badge: totalOrdersCount, badgeColor: "bg-gray-100 text-gray-700" },
      ],
    },
    {
      category: "4. Member Manager",
      icon: Users,
      badge: kycPendingCount > 0 ? kycPendingCount : null,
      badgeColor: "bg-amber-100 text-amber-800",
      links: [
        { name: "Member Master", href: "/admin/members", icon: Users, badge: totalMembersCount, badgeColor: "bg-gray-100 text-gray-700" },
        { name: "KYC Master", href: "/admin/kyc", icon: FileCheck, badge: kycPendingCount, badgeColor: "bg-amber-100 text-amber-800" },
      ],
    },
    {
      category: "5. PV Manager",
      icon: Zap,
      links: [
        { name: "Self PV Transfer", href: "/admin/pv/self", icon: Zap },
        { name: "Power PV Injection", href: "/admin/pv/power", icon: TrendingUp },
      ],
    },
    {
      category: "6. Business Reports",
      icon: BarChart3,
      links: [
        { name: "Today's Report", href: "/admin/reports?range=today", icon: Calendar },
        { name: "Week Report", href: "/admin/reports?range=week", icon: BarChart3 },
        { name: "Month Report", href: "/admin/reports?range=month", icon: BarChart3 },
        { name: "Custom Report", href: "/admin/reports?range=custom", icon: BarChart3 },
      ],
    },
  ];

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    "2. Product Manager": true,
    "3. Order Manager": true,
    "4. Member Manager": true,
    "5. PV Manager": true,
    "6. Business Reports": true,
  });

  useEffect(() => {
    const active = adminNavGroups.find((g) =>
      g.links.some((l) => l.href.split("?")[0] === pathname)
    );
    if (active) {
      setOpenCategories((prev) => ({ ...prev, [active.category]: true }));
    }
  }, [pathname]);

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="flex flex-col h-full justify-between bg-white select-none">
      {/* 1. TOP LOGO & BRAND */}
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
            Central Admin Suite
          </span>
        </div>
      </div>

      {/* 2. NAVIGATION LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {/* 1. DASHBOARD */}
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            pathname === "/admin/dashboard"
              ? "bg-[#006d36] text-white shadow-xs font-black"
              : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-emerald-50/60"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>1. Dashboard</span>
        </Link>

        {/* 2 to 6 GROUPS */}
        {adminNavGroups.map((group) => {
          const isOpen = Boolean(openCategories[group.category]);
          const isCategoryActive = group.links.some((l) => l.href.split("?")[0] === pathname);
          const GroupIcon = group.icon;

          return (
            <div key={group.category} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleCategory(group.category)}
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

                <div className="flex items-center gap-1.5 shrink-0">
                  {group.badge !== undefined && group.badge !== null && group.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-black font-mono ${
                        group.badgeColor || "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {group.badge}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="pl-6 pr-1 space-y-1 animate-fadeIn">
                  {group.links.map((link) => {
                    const LinkIcon = link.icon;
                    const isActive = pathname === link.href.split("?")[0];

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={onNavigate}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-[#006d36] text-white shadow-xs font-black"
                            : "text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-emerald-50/50"
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
                                : link.badgeColor || "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. PINNED LOGOUT BUTTON */}
      <div className="p-3 border-t border-gray-200">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Admin</span>
        </button>
      </div>
    </div>
  );
}
