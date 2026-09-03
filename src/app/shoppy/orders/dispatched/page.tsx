"use client";

import React, { useEffect, useState, useMemo } from "react";
import ShoppyLayout from "@/components/shoppy/ShoppyLayout";
import {
  Loader2,
  Truck,
  CheckCircle,
  CheckCircle2,
  Search,
  MapPin,
  FileText,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Order } from "@/types";

export default function ShoppyDispatchedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DISPATCHED" | "DELIVERED">("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/shoppy/orders");
      const data = await res.json();
      if (data.success && data.orders) {
        const dispatchedAndDelivered = data.orders.filter(
          (o: Order) =>
            o.status === "DISPATCHED" ||
            o.status === "IN_TRANSIT" ||
            o.status === "DELIVERED"
        );
        setOrders(dispatchedAndDelivered);
      }
    } catch (err) {
      console.error("Error loading dispatched orders:", err);
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
      const matchCourier = (ord.courierName || "").toLowerCase().includes(q);
      return matchId || matchMember || matchName || matchMobile || matchTracking || matchCourier;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleMarkDelivered = async (orderId: string) => {
    if (!confirm(`Mark Order #${orderId} as successfully DELIVERED to customer?`)) {
      return;
    }

    setProcessingId(orderId);
    try {
      const res = await fetch("/api/shoppy/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: [orderId],
          status: "DELIVERED",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`🎉 Order #${orderId} marked as DELIVERED!`);
        await loadOrders();
      } else {
        alert(data.message || "Failed to update status.");
      }
    } catch {
      alert("Error contacting server.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ShoppyLayout onRefresh={loadOrders} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Header Neumorphic Card */}
        <div className="shoppy-surface rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full shoppy-inset-sm font-mono text-[10px] font-black uppercase tracking-wider text-[#006d36]">
                Stage 3 • Dispatched & In-Transit
              </span>
              <span className="text-xs text-slate-500 font-mono">
                SURAT PARCEL HUB (AVS01)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dispatched & Delivered Parcels
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track parcels in transit and record final delivery handovers to associates.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="shoppy-surface rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/80">
          <div className="flex items-center gap-2">
            {(["ALL", "DISPATCHED", "DELIVERED"] as const).map((st) => {
              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    active
                      ? "shoppy-inset text-[#006d36] font-black"
                      : "shoppy-btn text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st === "ALL" ? "All Parcels" : st}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order, Recipient, Courier or AWB Tracking..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl shoppy-inset text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d36]/30 transition-all font-mono"
            />
          </div>
        </div>

        {/* Table Neumorphic Container */}
        <div className="shoppy-surface rounded-3xl p-6 space-y-4 border border-white/80">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#006d36]" />
              <p className="text-xs font-mono font-bold">Loading transit logs...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <div className="w-14 h-14 rounded-3xl shoppy-inset-sm flex items-center justify-center text-[#006d36] mx-auto">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="font-black text-slate-800 text-base">No Dispatched Parcels Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No orders currently in dispatched or delivered state matching your query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="shoppy-inset rounded-2xl p-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-500 font-mono text-[11px] font-black uppercase border-b border-slate-300/60">
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Courier Partner</th>
                      <th className="py-3 px-4">AWB Tracking #</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Delivery Address</th>
                      <th className="py-3 px-4 text-right">Action</th>
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
                          <span className="font-mono text-[10px] text-slate-500 block">
                            {ord.buyerMobile || ord.customerMobile || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#006d36]" />
                            <span>{ord.courierName || "Local / Store Pickup"}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {ord.trackingNumber ? (
                            <span className="font-mono font-black text-slate-900 bg-white/80 px-2 py-1 rounded-lg border border-slate-300/60 block w-fit">
                              {ord.trackingNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">Direct Handover</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {ord.status === "DELIVERED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black border border-emerald-300">
                              <CheckCircle className="w-3 h-3" />
                              <span>DELIVERED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 font-mono text-[10px] font-black border border-blue-300">
                              <Clock className="w-3 h-3" />
                              <span>IN TRANSIT</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-[200px]">
                          <p className="line-clamp-2 text-[11px]">
                            {ord.buyerAddress || ord.shippingAddress || "Store Pickup"}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {ord.status !== "DELIVERED" && (
                            <button
                              type="button"
                              onClick={() => handleMarkDelivered(ord.id)}
                              disabled={processingId === ord.id}
                              className="shoppy-btn-primary px-3 py-1.5 rounded-xl font-black text-xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-60 shadow-sm"
                            >
                              {processingId === ord.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>Mark Delivered</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ShoppyLayout>
  );
}
