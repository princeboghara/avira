"use client";

import React, { useEffect, useState, useMemo } from "react";
import ShoppyLayout from "@/components/shoppy/ShoppyLayout";
import {
  Loader2,
  CheckCircle,
  Search,
  Truck,
  Printer,
  FileText,
  Calendar,
  ExternalLink,
  Eye,
  RotateCcw,
  Tag,
} from "lucide-react";
import { Order } from "@/types";
import OrderItemsModal from "@/components/orders/OrderItemsModal";
import ReturnOrderModal from "@/components/shoppy/ReturnOrderModal";

export default function ShoppyDeliveredOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingOrderItems, setViewingOrderItems] = useState<Order | null>(null);
  const [returningOrder, setReturningOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/shoppy/orders?status=DELIVERED");
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Error loading delivered orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter((ord) => {
      const matchId = (ord.id || "").toLowerCase().includes(q);
      const matchMember = (ord.memberId || ord.billedBy || "").toLowerCase().includes(q);
      const matchName = (ord.buyerName || ord.customerName || "").toLowerCase().includes(q);
      const matchMobile = (ord.buyerMobile || ord.customerMobile || "").includes(q);
      const matchTracking = (ord.trackingNumber || "").toLowerCase().includes(q);
      const matchCourier = (ord.courierName || "").toLowerCase().includes(q);
      return matchId || matchMember || matchName || matchMobile || matchTracking || matchCourier;
    });
  }, [orders, searchQuery]);

  const handleOrderReturned = (orderId: string) => {
    // Immediately remove from delivered orders state
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  return (
    <ShoppyLayout onRefresh={loadOrders} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="shoppy-surface rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full shoppy-inset-sm font-mono text-[10px] font-black uppercase tracking-wider text-[#006d36]">
                Stage 4 • Delivered Logs
              </span>
              <span className="text-xs text-slate-500 font-mono">
                SURAT PARCEL HUB (AVS01)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Delivered Orders
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Successfully delivered orders. You can also initiate return if customer returns goods after delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="shoppy-btn px-4 py-2.5 rounded-2xl text-xs font-black text-slate-700 flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="shoppy-surface rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/80">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Buyer, Mobile, Tracking #..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl shoppy-inset text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d36]/30 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 self-end sm:self-auto">
            <span>Delivered Count:</span>
            <span className="px-2.5 py-1 rounded-xl shoppy-inset-sm font-black text-[#006d36]">
              {filteredOrders.length}
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="shoppy-surface rounded-3xl p-6 space-y-4 border border-white/80">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#006d36]" />
              <p className="text-xs font-mono font-bold">Loading delivered parcels...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <div className="w-14 h-14 rounded-3xl shoppy-inset-sm flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="font-black text-slate-800 text-base">No Delivered Orders Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When parcels in transit are marked as delivered, they will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="rounded-2xl border border-slate-200/90 bg-white shadow-[3px_3px_10px_rgba(0,0,0,0.03),-3px_-3px_10px_rgba(255,255,255,0.9)] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/90 border-b border-slate-200/90">
                    <tr className="text-slate-500 font-mono text-[11px] font-black uppercase">
                      <th className="py-3 px-3.5">Order ID & Date</th>
                      <th className="py-3 px-3.5">Recipient</th>
                      <th className="py-3 px-3.5">Courier Partner</th>
                      <th className="py-3 px-3.5">AWB Tracking #</th>
                      <th className="py-3 px-3.5">Amount & PV</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3.5">
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
                          <button
                            type="button"
                            onClick={() => setViewingOrderItems(ord)}
                            className="text-[11px] font-bold text-[#006d36] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Items ({ord.items?.length || 1})</span>
                          </button>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-black text-slate-900 block">
                            {ord.buyerName || ord.customerName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 block">
                            {ord.buyerMobile || ord.customerMobile || "—"}
                          </span>
                          {ord.memberId && (
                            <span className="font-mono text-[9px] text-[#006d36] font-bold block">
                              ID: {ord.memberId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#006d36]" />
                            <span>{ord.courierName || "Local Pickup"}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          {ord.trackingNumber ? (
                            <span className="font-mono font-black text-slate-900 bg-slate-100/90 px-2 py-1 rounded-lg border border-slate-200 block w-fit">
                              {ord.trackingNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-mono font-black text-slate-900 block">
                            ₹{Number(ord.amount || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="font-mono text-[11px] font-black text-[#006d36] block">
                            {ord.pv} PV
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black border border-emerald-300">
                            <CheckCircle className="w-3 h-3" />
                            <span>DELIVERED</span>
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => window.open(`/slip/${ord.id}?print=1`, "_blank")}
                              className="p-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              title="Print Slip"
                            >
                              <span>Slip</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => window.open(`/invoice/${ord.id}?print=1`, "_blank")}
                              className="p-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006d36] border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              title="Print Invoice"
                            >
                              <span>Bill</span>
                            </button>

                            {/* Option to Return delivered order */}
                            <button
                              type="button"
                              onClick={() => setReturningOrder(ord)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                              title="Mark Delivered Order as Returned"
                            >
                              <RotateCcw className="w-3 h-3 text-rose-600" />
                              <span>Return</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Order Items Modal */}
        <OrderItemsModal
          order={viewingOrderItems}
          onClose={() => setViewingOrderItems(null)}
        />

        {/* Return Order Modal */}
        <ReturnOrderModal
          order={returningOrder}
          onClose={() => setReturningOrder(null)}
          onSuccess={handleOrderReturned}
        />
      </div>
    </ShoppyLayout>
  );
}
