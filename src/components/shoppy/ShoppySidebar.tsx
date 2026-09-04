"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Truck,
  FileText,
  Store,
  LogOut,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  RotateCcw,
  X,
} from "lucide-react";

interface ShoppyInfo {
  shoppyId: string;
  storeName: string;
  ownerName: string;
  city: string;
}

interface ShoppySidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number | null;
  badgeColor?: string;
}

export default function ShoppySidebar({ onNavigate, onClose }: ShoppySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [shoppy, setShoppy] = useState<ShoppyInfo | null>({
    shoppyId: "AVS01",
    storeName: "SURAT PARCEL HUB",
    ownerName: "Hub Manager",
    city: "Surat",
  });
  const [stats, setStats] = useState<{
    assignedOrders: number;
    packingOrders: number;
    dispatchedOrders: number;
    deliveredOrders: number;
    returnedOrders: number;
    totalOrders: number;
  }>({
    assignedOrders: 0,
    packingOrders: 0,
    dispatchedOrders: 0,
    deliveredOrders: 0,
    returnedOrders: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    async function fetchShoppyInfo() {
      try {
        const res = await fetch("/api/shoppy/auth/me");
        const data = await res.json();
        if (data.success && data.shoppy) {
          setShoppy(data.shoppy);
          if (data.stats) {
            setStats({
              assignedOrders: data.stats.assignedOrders || 0,
              packingOrders: data.stats.packingOrders || 0,
              dispatchedOrders: data.stats.dispatchedOrders || 0,
              deliveredOrders: data.stats.deliveredOrders || 0,
              returnedOrders: data.stats.returnedOrders || 0,
              totalOrders: data.stats.totalOrders || 0,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load Shoppy info:", err);
      }
    }
    fetchShoppyInfo();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/shoppy/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    router.push("/shoppy/login");
  };

  const isOrderActive = pathname.startsWith("/shoppy/orders");
  const [orderManagerOpen, setOrderManagerOpen] = useState<boolean>(true);

  const activeOrdersCount = (stats.assignedOrders || 0) + (stats.packingOrders || 0);

  const orderSubItems: NavItem[] = [
    {
      name: "Assigned Orders",
      href: "/shoppy/orders/confirmed",
      icon: ShoppingCart,
      badge: stats.assignedOrders > 0 ? stats.assignedOrders : null,
      badgeColor: "bg-amber-500/15 text-amber-900",
    },
    {
      name: "Orders in Packing",
      href: "/shoppy/orders/packing",
      icon: Boxes,
      badge: stats.packingOrders > 0 ? stats.packingOrders : null,
      badgeColor: "bg-indigo-500/15 text-indigo-900",
    },
    {
      name: "Dispatched Orders",
      href: "/shoppy/orders/dispatched",
      icon: Truck,
      badge: stats.dispatchedOrders > 0 ? stats.dispatchedOrders : null,
      badgeColor: "bg-blue-500/15 text-blue-900",
    },
    {
      name: "Delivered Orders",
      href: "/shoppy/orders/delivered",
      icon: CheckCircle,
      badge: stats.deliveredOrders > 0 ? stats.deliveredOrders : null,
      badgeColor: "bg-emerald-500/15 text-emerald-900",
    },
    {
      name: "Returned Orders",
      href: "/shoppy/orders/returned",
      icon: RotateCcw,
      badge: stats.returnedOrders > 0 ? stats.returnedOrders : null,
      badgeColor: "bg-rose-500/15 text-rose-900",
    },
    {
      name: "All Orders Registry",
      href: "/shoppy/orders",
      icon: FileText,
      badge: stats.totalOrders > 0 ? stats.totalOrders : null,
      badgeColor: "bg-slate-500/15 text-slate-900",
    },
  ];

  return (
    <div className="flex flex-col h-full justify-between bg-[#f4f7f6] border-r border-white/80 shadow-[6px_0_24px_rgba(166,180,200,0.18)] select-none">
      {/* 1. TOP LOGO & BRAND NAME */}
      <div className="p-4 border-b border-[#e2e8f0]/60 bg-gradient-to-b from-white/90 via-[#f8faf9] to-[#f4f7f6] flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
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
              Shoppy Parcel Hub
            </span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 cursor-pointer shrink-0 transition-colors"
            title="Close Menu"
            aria-label="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. HUB MINI SUMMARY STRIP (NEUMORPHIC INSET) */}
      <div className="mx-3 my-2.5 px-3.5 py-2.5 rounded-2xl neo-inset border border-white/70 flex items-center justify-between text-xs">
        <div className="overflow-hidden pr-2">
          <span className="font-extrabold text-[#0f172a] block truncate text-xs">
            {shoppy?.storeName || "SURAT PARCEL HUB"}
          </span>
          <span className="font-mono text-[10px] text-[#006d36] font-bold block">
            ID: {shoppy?.shoppyId || "AVS01"} • {shoppy?.city || "Surat"}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase shadow-xs shrink-0 bg-[#006d36] text-white">
          LIVE HUB
        </span>
      </div>

      {/* 3. SCROLLABLE NAVIGATION LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 custom-scrollbar">
        {/* 1. DASHBOARD LINK */}
        <Link
          href="/shoppy/dashboard"
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
            pathname === "/shoppy/dashboard"
              ? "neo-btn-primary font-black shadow-[4px_4px_12px_rgba(0,109,54,0.3),-2px_-2px_8px_#ffffff]"
              : "text-[#1e293b] hover:text-[#006d36] bg-[#f4f7f6] hover:shadow-[3px_3px_8px_rgba(166,180,200,0.3),-3px_-3px_8px_#ffffff] border border-transparent hover:border-white/60"
          }`}
        >
          <LayoutDashboard
            className={`w-4 h-4 shrink-0 ${
              pathname === "/shoppy/dashboard" ? "text-white" : "text-[#006d36]"
            }`}
          />
          <span>1. Dashboard</span>
        </Link>

        {/* 2. ORDER MANAGER (ACCORDION GROUP) */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setOrderManagerOpen(!orderManagerOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              isOrderActive
                ? "text-[#006d36] bg-[#edf3f0] shadow-[inset_2px_2px_5px_rgba(166,180,200,0.25),inset_-2px_-2px_5px_#ffffff] border border-emerald-200/60 font-black"
                : "text-[#1e293b] hover:text-[#006d36] bg-[#f4f7f6] hover:shadow-[3px_3px_8px_rgba(166,180,200,0.25),-3px_-3px_8px_#ffffff] border border-transparent hover:border-white/60"
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <ShoppingCart className="w-4 h-4 text-[#006d36] shrink-0" />
              <span className="truncate">2. Order Manager</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {activeOrdersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 text-amber-900">
                  {activeOrdersCount}
                </span>
              )}
              {orderManagerOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
              )}
            </div>
          </button>

          {/* Collapsible Order Submenus */}
          {orderManagerOpen && (
            <div className="pl-3.5 pr-1 py-1 space-y-1 animate-fadeIn">
              <div className="pl-2 border-l-2 border-emerald-500/30 space-y-1">
                {orderSubItems.map((link) => {
                  const LinkIcon = link.icon;
                  const isActive = pathname === link.href;

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

        {/* 3. STORE PROFILE (DIRECT LINK) */}
        <Link
          href="/shoppy/profile"
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
            pathname === "/shoppy/profile"
              ? "neo-btn-primary font-black shadow-[4px_4px_12px_rgba(0,109,54,0.3),-2px_-2px_8px_#ffffff]"
              : "text-[#1e293b] hover:text-[#006d36] bg-[#f4f7f6] hover:shadow-[3px_3px_8px_rgba(166,180,200,0.3),-3px_-3px_8px_#ffffff] border border-transparent hover:border-white/60"
          }`}
        >
          <Store
            className={`w-4 h-4 shrink-0 ${
              pathname === "/shoppy/profile" ? "text-white" : "text-[#006d36]"
            }`}
          />
          <span>3. Store Profile</span>
        </Link>
      </div>

      {/* 4. PINNED BOTTOM LOGOUT BUTTON */}
      <div className="p-3 border-t border-[#e2e8f0]/80 bg-[#f4f7f6]">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f4f7f6] border border-rose-200/70 text-rose-700 hover:text-rose-800 shadow-[3px_3px_8px_rgba(225,29,72,0.12),-3px_-3px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_rgba(225,29,72,0.15),inset_-2px_-2px_4px_#ffffff] text-xs font-bold transition-all cursor-pointer active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Shoppy Hub</span>
        </button>
      </div>
    </div>
  );
}
