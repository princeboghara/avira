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
  ShieldCheck,
  CheckCircle,
  RotateCcw,
  X,
  Package,
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

interface NavGroup {
  title: string;
  items: NavItem[];
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

  const navGroups: NavGroup[] = [
    {
      title: "Main Menu",
      items: [
        {
          name: "Dashboard",
          href: "/shoppy/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Order Manager",
      items: [
        {
          name: "Assigned Orders",
          href: "/shoppy/orders/confirmed",
          icon: ShoppingCart,
          badge: stats.assignedOrders > 0 ? stats.assignedOrders : null,
          badgeColor: "bg-amber-100 text-amber-900 border border-amber-300",
        },
        {
          name: "Orders in Packing",
          href: "/shoppy/orders/packing",
          icon: Boxes,
          badge: stats.packingOrders > 0 ? stats.packingOrders : null,
          badgeColor: "bg-indigo-100 text-indigo-900 border border-indigo-300",
        },
        {
          name: "Dispatched Orders",
          href: "/shoppy/orders/dispatched",
          icon: Truck,
          badge: stats.dispatchedOrders > 0 ? stats.dispatchedOrders : null,
          badgeColor: "bg-blue-100 text-blue-900 border border-blue-300",
        },
        {
          name: "Delivered Orders",
          href: "/shoppy/orders/delivered",
          icon: CheckCircle,
          badge: stats.deliveredOrders > 0 ? stats.deliveredOrders : null,
          badgeColor: "bg-emerald-100 text-emerald-900 border border-emerald-300",
        },
        {
          name: "Returned Orders",
          href: "/shoppy/orders/returned",
          icon: RotateCcw,
          badge: stats.returnedOrders > 0 ? stats.returnedOrders : null,
          badgeColor: "bg-rose-100 text-rose-800 border border-rose-300",
        },
        {
          name: "All Orders Registry",
          href: "/shoppy/orders",
          icon: FileText,
          badge: stats.totalOrders > 0 ? stats.totalOrders : null,
          badgeColor: "bg-slate-100 text-slate-700 border border-slate-300",
        },
      ],
    },
    {
      title: "Hub Settings",
      items: [
        {
          name: "Store Profile",
          href: "/shoppy/profile",
          icon: Store,
        },
      ],
    },
  ];

  return (
    <aside className="w-68 bg-white text-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-200/90 shadow-sm z-40 select-none">
      {/* Top Header & Brand */}
      <div className="p-3.5 space-y-3">
        {/* Brand Header Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007a3d] to-[#004d25] flex items-center justify-center text-white font-black shadow-sm shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] font-black uppercase tracking-wider text-[#006d36] bg-emerald-100/80 px-1.5 py-0.2 rounded-full border border-emerald-300">
                  Shoppy Portal
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h2 className="text-xs font-black tracking-tight text-slate-900 truncate mt-0.5">
                {shoppy?.storeName || "SURAT PARCEL HUB"}
              </h2>
              <p className="text-[10px] font-mono font-bold text-[#006d36]">
                ID: {shoppy?.shoppyId || "AVS01"}
              </p>
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

        {/* Navigation Items (Categorized with Section Titles) */}
        <nav className="space-y-4 max-h-[calc(100vh-230px)] overflow-y-auto pr-0.5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">
                {group.title}
              </div>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#006d36] text-white shadow-xs font-black"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                            isActive ? "text-emerald-200" : "text-slate-400 group-hover:text-[#006d36]"
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge !== null && item.badge !== undefined && item.badge > 0 ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black shrink-0 ${
                            isActive
                              ? "bg-white/20 text-white"
                              : item.badgeColor || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                            isActive ? "text-emerald-200 opacity-100" : "text-slate-300 opacity-0 group-hover:opacity-70"
                          }`}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Hub Profile & Logout */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/60 space-y-2.5">
        <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#006d36]/10 text-[#006d36] flex items-center justify-center text-xs font-black shrink-0">
              S
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">
                {shoppy?.ownerName || "Hub Manager"}
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {shoppy?.city || "Surat"}, Gujarat
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#006d36] bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
            <ShieldCheck className="w-2.5 h-2.5" />
            LIVE
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Shoppy Portal</span>
        </button>
      </div>
    </aside>
  );
}
