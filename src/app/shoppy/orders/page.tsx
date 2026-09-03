"use client";

import React, { useEffect, useState, useMemo } from "react";
import ShoppyLayout from "@/components/shoppy/ShoppyLayout";
import {
  Loader2,
  FileText,
  Search,
  Eye,
  X,
  Boxes,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Order } from "@/types";

export default function ShoppyAllOrdersRegistryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/shoppy/orders");
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Error loading shoppy orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (statusFilter !== "ALL") {
      list = list.filter((o) => o.status === statusFilter);
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter((ord) => {
      const matchId = (ord.id || "").toLowerCase().includes(q);
      const matchMember = (ord.memberId || ord.billedBy || "").toLowerCase().includes(q);
      const matchName = (ord.buyerName || ord.customerName || "").toLowerCase().includes(q);
      const matchMobile = (ord.buyerMobile || ord.customerMobile || "").includes(q);
      const matchTracking = (ord.trackingNumber || "").toLowerCase().includes(q);
      return matchId || matchMember || matchName || matchMobile || matchTracking;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <ShoppyLayout onRefresh={loadOrders} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Header Neumorphic Card */}
        <div className="shoppy-surface rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full shoppy-inset-sm font-mono text-[10px] font-black uppercase tracking-wider text-slate-700">
                Hub Master Registry
              </span>
              <span className="text-xs text-slate-500 font-mono">
                SURAT PARCEL HUB (AVS01)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              All Orders Master Registry
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete dispatch history, tracking codes, and fulfillment audit records for SURAT PARCEL HUB.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="shoppy-surface rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-white/80">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, Customer, Mobile, Tracking..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl shoppy-inset focus:outline-none focus:ring-2 focus:ring-[#006d36]/30 font-mono text-slate-900 font-bold placeholder-slate-400"
              />
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl">
              {["ALL", "CONFIRMED", "PACKED", "DISPATCHED", "DELIVERED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "shoppy-inset text-[#006d36] font-black"
                      : "shoppy-btn text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st === "ALL" ? `All (${orders.length})` : st}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs font-mono text-slate-500 self-end lg:self-auto font-bold">
            Matching: <strong className="text-slate-900">{filteredOrders.length}</strong>
          </span>
        </div>

        {/* Table Neumorphic Container */}
        <div className="shoppy-surface rounded-3xl p-6 space-y-4 border border-white/80">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#006d36]" />
              <p className="text-xs font-mono font-bold">Loading master registry...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <div className="w-14 h-14 rounded-3xl shoppy-inset-sm flex items-center justify-center text-slate-400 mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-black text-slate-800 text-base">No Matching Records</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No orders found for the selected status filter or search parameters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="shoppy-inset rounded-2xl p-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-500 font-mono text-[11px] font-black uppercase border-b border-slate-300/60">
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Buyer / Customer</th>
                      <th className="py-3 px-4">Package</th>
                      <th className="py-3 px-4">Amount & PV</th>
                      <th className="py-3 px-4">Courier & Tracking</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300/40">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-black text-slate-900 block">
                            #{ord.id}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 block">
                            {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-black text-slate-900 block">
                            {ord.buyerName || ord.customerName}
                          </span>
                          <span className="font-mono text-[10px] text-[#006d36] font-bold block">
                            ID: {ord.memberId || ord.billedBy || "—"}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {ord.buyerMobile || ord.customerMobile || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">
                            {ord.packageName || "Product Package"}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {ord.items?.length || 1} Item(s)
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-black text-slate-900 block">
                            ₹{Number(ord.amount || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="font-mono text-[11px] font-black text-[#006d36] block">
                            {ord.pv} PV
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">
                            {ord.courierName || "—"}
                          </span>
                          {ord.trackingNumber ? (
                            <span className="font-mono text-[10px] text-slate-600 bg-white/70 px-1.5 py-0.5 rounded block w-fit mt-0.5 border border-slate-300">
                              {ord.trackingNumber}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {ord.status === "DELIVERED" && (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black border border-emerald-300 inline-block">
                              DELIVERED
                            </span>
                          )}
                          {ord.status === "DISPATCHED" && (
                            <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 font-mono text-[10px] font-black border border-blue-300 inline-block">
                              DISPATCHED
                            </span>
                          )}
                          {ord.status === "PACKED" && (
                            <span className="px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-800 font-mono text-[10px] font-black border border-indigo-300 inline-block">
                              PACKED
                            </span>
                          )}
                          {(ord.status === "CONFIRMED" || ord.status === "APPROVED") && (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-mono text-[10px] font-black border border-amber-300 inline-block">
                              ASSIGNED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setViewOrder(ord)}
                            className="shoppy-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#006d36] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Packing Slip & Invoice Breakdown */}
        {viewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            <div className="shoppy-surface-lg rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 border border-white/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl shoppy-inset-sm flex items-center justify-center text-[#006d36]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">
                      Packing Slip #{viewOrder.id}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      SURAT PARCEL HUB Dispatch Document
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewOrder(null)}
                  className="shoppy-btn p-2 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Details in Inset Box */}
              <div className="shoppy-inset rounded-2xl p-3.5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-black text-slate-900">
                    {viewOrder.buyerName} ({viewOrder.memberId})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-bold text-slate-800">{viewOrder.buyerMobile || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Courier Partner:</span>
                  <span className="font-bold text-slate-800">{viewOrder.courierName || "Local Pickup"}</span>
                </div>
                {viewOrder.trackingNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">AWB Tracking:</span>
                    <span className="font-black text-[#006d36] bg-white px-2 py-0.5 rounded border border-slate-300">
                      {viewOrder.trackingNumber}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-300/70">
                  <span className="text-slate-500 block text-[11px]">Shipping Destination:</span>
                  <p className="text-slate-800 font-bold text-[11px] mt-0.5">
                    {viewOrder.buyerAddress || viewOrder.shippingAddress || "Store Pickup"}
                  </p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="shoppy-surface-sm rounded-2xl p-3 space-y-1.5 max-h-40 overflow-y-auto">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                  Package Contents:
                </span>
                {viewOrder.items && viewOrder.items.length > 0 ? (
                  viewOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-mono">
                      <span className="text-slate-800 font-bold">{it.name} x {it.quantity}</span>
                      <span className="text-slate-900 font-black">₹{(it.price || it.mrp || 0) * it.quantity}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-600 font-mono">
                    {viewOrder.packageName || "Standard Product Package"}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-300">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="shoppy-btn px-4 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewOrder(null)}
                  className="shoppy-btn-primary px-5 py-2 rounded-xl text-xs font-black cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ShoppyLayout>
  );
}
