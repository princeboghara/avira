"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ShoppyLayout from "@/components/shoppy/ShoppyLayout";
import {
  ShoppingCart,
  Boxes,
  Truck,
  CheckCircle,
  TrendingUp,
  Store,
  MapPin,
  Phone,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Order } from "@/types";

interface ShoppyProfile {
  shoppyId: string;
  storeName: string;
  ownerName: string;
  mobile: string;
  city: string;
  state: string;
  address: string;
  status: string;
}

export default function ShoppyDashboardPage() {
  const [profile, setProfile] = useState<ShoppyProfile | null>({
    shoppyId: "AVS01",
    storeName: "SURAT PARCEL HUB",
    ownerName: "Hub Manager",
    mobile: "9876543210",
    city: "Surat",
    state: "Gujarat",
    address: "Ring Road Logistics Center",
    status: "ACTIVE",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    assignedOrders: 0,
    packingOrders: 0,
    dispatchedOrders: 0,
    deliveredOrders: 0,
    totalOrders: 0,
    totalVolume: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      setRefreshing(true);
      const [meRes, ordersRes] = await Promise.all([
        fetch("/api/shoppy/auth/me"),
        fetch("/api/shoppy/orders"),
      ]);

      const meData = await meRes.json();
      const ordersData = await ordersRes.json();

      if (meData.success && meData.shoppy) {
        setProfile(meData.shoppy);
        if (meData.stats) {
          setStats(meData.stats);
        }
      }

      if (ordersData.success && ordersData.orders) {
        setOrders(ordersData.orders);
        if (ordersData.summary) {
          setStats((prev) => ({
            ...prev,
            assignedOrders: ordersData.summary.confirmedOrders,
            packingOrders: ordersData.summary.packedOrders,
            dispatchedOrders: ordersData.summary.dispatchedOrders,
            deliveredOrders: ordersData.summary.deliveredOrders,
            totalOrders: ordersData.summary.totalOrders,
            totalVolume: ordersData.summary.totalRevenue,
          }));
        }
      }
    } catch (err) {
      console.error("Error loading shoppy dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <ShoppyLayout onRefresh={loadDashboard} refreshing={refreshing}>
      <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden min-w-0 animate-fadeIn">
        {/* Top Professional Hub Hero Banner */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs w-full max-w-full overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 font-mono text-[10px] sm:text-xs font-bold text-[#006d36] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {profile?.shoppyId || "AVS01"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] sm:text-xs font-bold text-slate-700">
                  Primary Logistics Hub
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 truncate">
                {profile?.storeName || "SURAT PARCEL HUB"}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg truncate">
                  <Store className="w-3.5 h-3.5 text-[#006d36] shrink-0" />
                  <span className="truncate">{profile?.ownerName || "Dispatch Manager"}</span>
                </span>
                <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                  <Phone className="w-3.5 h-3.5 text-[#006d36] shrink-0" />
                  <span>{profile?.mobile || "9876543210"}</span>
                </span>
                <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#006d36] shrink-0" />
                  <span className="truncate">{profile?.city || "Surat"}, Gujarat</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0">
              <Link
                href="/shoppy/orders/confirmed"
                className="px-4 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005228] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors w-full sm:w-auto justify-center"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Process Stage 1 ({stats.assignedOrders})</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================
            1. SAUTHI UPER: TOTAL ORDER & TOTAL REGISTRY (SIDE BY SIDE)
           ======================================================== */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-5 w-full max-w-full">
          {/* Top Card 1: TOTAL ORDERS */}
          <Link
            href="/shoppy/orders"
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between overflow-hidden min-w-0"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider font-mono truncate">
                TOTAL ORDERS
              </span>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#006d36] group-hover:scale-105 transition-transform shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-mono text-2xl sm:text-4xl font-black text-slate-900">
                {stats.totalOrders}
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium truncate">
                <span>All-time hub orders</span>
                <ArrowRight className="w-3 h-3 text-[#006d36] group-hover:translate-x-1 transition-transform shrink-0" />
              </p>
            </div>
          </Link>

          {/* Top Card 2: TOTAL REGISTRY (VOLUME) */}
          <Link
            href="/shoppy/orders"
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between overflow-hidden min-w-0"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider font-mono truncate">
                TOTAL REGISTRY
              </span>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-mono text-lg sm:text-3xl font-black text-[#006d36] truncate">
                ₹{Number(stats.totalVolume || 0).toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium truncate">
                <span>Total dispatch value</span>
                <ArrowRight className="w-3 h-3 text-teal-600 group-hover:translate-x-1 transition-transform shrink-0" />
              </p>
            </div>
          </Link>
        </div>

        {/* ========================================================
            2. 4 FULFILLMENT STAGES (NO HORIZONTAL SCROLL):
               Mobile: Stage 1 & Stage 2 side-by-side (Row 1)
                       Stage 3 & Stage 4 side-by-side (Row 2)
               Desktop: All 4 in 1 row!
           ======================================================== */}
        <div className="space-y-2 w-full max-w-full">
          <div className="px-1 flex items-center justify-between text-[11px] sm:text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            <span>Fulfillment Pipeline</span>
            <span className="text-[#006d36]">4 Hub Stages</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-full">
            {/* STAGE 1: Assigned Orders */}
            <Link
              href="/shoppy/orders/confirmed"
              className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-amber-200/80 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between overflow-hidden min-w-0"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-black text-amber-800 uppercase tracking-wider font-mono">
                  STAGE 1
                </span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform shrink-0">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="font-mono text-xl sm:text-3xl font-black text-amber-800">
                  {stats.assignedOrders}
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1 truncate">
                  Assigned Orders
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium truncate">
                  <span>Ready to pack</span>
                  <ArrowRight className="w-2.5 h-2.5 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                </p>
              </div>
            </Link>

            {/* STAGE 2: Orders in Packing */}
            <Link
              href="/shoppy/orders/packing"
              className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-indigo-200/80 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between overflow-hidden min-w-0"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-black text-indigo-800 uppercase tracking-wider font-mono">
                  STAGE 2
                </span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 group-hover:scale-105 transition-transform shrink-0">
                  <Boxes className="w-4 h-4" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="font-mono text-xl sm:text-3xl font-black text-indigo-800">
                  {stats.packingOrders}
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1 truncate">
                  In Packaging
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium truncate">
                  <span>Attach AWB & label</span>
                  <ArrowRight className="w-2.5 h-2.5 text-indigo-600 group-hover:translate-x-1 transition-transform shrink-0" />
                </p>
              </div>
            </Link>

            {/* STAGE 3: Dispatched Orders */}
            <Link
              href="/shoppy/orders/dispatched"
              className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-blue-200/80 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between overflow-hidden min-w-0"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-black text-blue-800 uppercase tracking-wider font-mono">
                  STAGE 3
                </span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="font-mono text-xl sm:text-3xl font-black text-blue-800">
                  {stats.dispatchedOrders}
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1 truncate">
                  Dispatched
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium truncate">
                  <span>In transit to buyer</span>
                  <ArrowRight className="w-2.5 h-2.5 text-blue-600 group-hover:translate-x-1 transition-transform shrink-0" />
                </p>
              </div>
            </Link>

            {/* STAGE 4: Delivered Orders */}
            <Link
              href="/shoppy/orders/delivered"
              className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-emerald-200/80 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between overflow-hidden min-w-0"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-black text-emerald-800 uppercase tracking-wider font-mono">
                  STAGE 4
                </span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006d36] group-hover:scale-105 transition-transform shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="font-mono text-xl sm:text-3xl font-black text-[#006d36]">
                  {stats.deliveredOrders}
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1 truncate">
                  Delivered
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium truncate">
                  <span>Delivered to customer</span>
                  <ArrowRight className="w-2.5 h-2.5 text-[#006d36] group-hover:translate-x-1 transition-transform shrink-0" />
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </ShoppyLayout>
  );
}
