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
  Eye,
  RotateCcw,
  Tag,
} from "lucide-react";
import { Order } from "@/types";
import OrderItemsModal from "@/components/orders/OrderItemsModal";
import ReturnOrderModal from "@/components/shoppy/ReturnOrderModal";

export default function ShoppyDispatchedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DISPATCHED" | "IN_TRANSIT">("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewingOrderItems, setViewingOrderItems] = useState<Order | null>(null);
  const [returningOrder, setReturningOrder] = useState<Order | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/shoppy/orders?status=DISPATCHED");
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
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
    if (!confirm(`Mark Order #${orderId} as successfully DELIVERED to customer?\n\nThis will move the parcel out of the Dispatched queue to Delivered Orders.`)) {
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
        // Immediately remove from list so it disappears from Dispatched
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        alert(data.message || "Failed to update status.");
      }
    } catch {
      alert("Error contacting server.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleOrderReturned = (orderId: string) => {
    // Immediately remove returned order from active dispatched list
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter((item) => item !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  const handleOpenBulkSlips = () => {
    const ids = selectedOrderIds.length > 0 ? selectedOrderIds : filteredOrders.map((o) => o.id);
    if (ids.length === 0) {
      alert("No orders available to print delivery slips.");
      return;
    }
    window.open(`/slip/bulk?ids=${ids.join(",")}`, "_blank");
  };

  const handleOpenBulkBills = () => {
    const ids = selectedOrderIds.length > 0 ? selectedOrderIds : filteredOrders.map((o) => o.id);
    if (ids.length === 0) {
      alert("No orders available to print tax invoices.");
      return;
    }
    window.open(`/invoice/bulk?ids=${ids.join(",")}`, "_blank");
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
              Dispatched Orders
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Active parcels in transit. Mark as Delivered once received, or Returned if delivery fails.
            </p>
          </div>

          {/* Bulk Slips and Bills Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleOpenBulkSlips}
              className="px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-95"
              title="Print Bulk Packaging/Delivery Slips"
            >
              <Tag className="w-4 h-4 text-blue-600" />
              <span>Bulk Slips {selectedOrderIds.length > 0 ? `(${selectedOrderIds.length})` : ""}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenBulkBills}
              className="px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#006d36] border border-emerald-200 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-95"
              title="Print Bulk Official Tax Invoices"
            >
              <FileText className="w-4 h-4 text-[#006d36]" />
              <span>Bulk Bills {selectedOrderIds.length > 0 ? `(${selectedOrderIds.length})` : ""}</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="shoppy-surface rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/80">
          <div className="flex items-center gap-2">
            {(["ALL", "DISPATCHED", "IN_TRANSIT"] as const).map((st) => {
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
                  {st === "ALL" ? "All In-Transit" : st}
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

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 self-end md:self-auto">
            <span>In Transit:</span>
            <span className="px-2.5 py-1 rounded-xl shoppy-inset-sm font-black text-[#006d36]">
              {filteredOrders.length}
            </span>
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
              <h3 className="font-black text-slate-800 text-base">No Dispatched Parcels In-Transit</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No orders currently in dispatched or in-transit state waiting for delivery.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="rounded-2xl border border-slate-200/90 bg-white shadow-[3px_3px_10px_rgba(0,0,0,0.03),-3px_-3px_10px_rgba(255,255,255,0.9)] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/90 border-b border-slate-200/90">
                    <tr className="text-slate-500 font-mono text-[11px] font-black uppercase">
                      <th className="py-3.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded text-[#006d36] focus:ring-[#006d36] cursor-pointer"
                          title="Select all matching orders"
                        />
                      </th>
                      <th className="py-3 px-3.5">Order ID & Date</th>
                      <th className="py-3 px-3.5">Recipient</th>
                      <th className="py-3 px-3.5">Courier Partner</th>
                      <th className="py-3 px-3.5">AWB Tracking #</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5">Delivery Address</th>
                      <th className="py-3 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.includes(ord.id)}
                            onChange={() => toggleSelectOrder(ord.id)}
                            className="w-4 h-4 rounded text-[#006d36] focus:ring-[#006d36] cursor-pointer"
                          />
                        </td>
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
                            <span>{ord.courierName || "Local / Store Pickup"}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          {ord.trackingNumber ? (
                            <span className="font-mono font-black text-slate-900 bg-slate-100/90 px-2 py-1 rounded-lg border border-slate-200 block w-fit">
                              {ord.trackingNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">Direct Handover</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 font-mono text-[10px] font-black border border-blue-300">
                            <Clock className="w-3 h-3" />
                            <span>{ord.status || "DISPATCHED"}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 max-w-[200px]">
                          <p className="line-clamp-2 text-[11px]">
                            {ord.buyerAddress || ord.shippingAddress || "Store Pickup"}
                          </p>
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

                            {/* Mark Delivered Button */}
                            <button
                              type="button"
                              onClick={() => handleMarkDelivered(ord.id)}
                              disabled={processingId === ord.id}
                              className="shoppy-btn-primary px-3 py-1.5 rounded-xl font-black text-xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-60 shadow-xs"
                              title="Mark as Successfully Delivered"
                            >
                              {processingId === ord.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>Deliver</span>
                            </button>

                            {/* Mark Returned Button */}
                            <button
                              type="button"
                              onClick={() => setReturningOrder(ord)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                              title="Mark Parcel as Returned / RTO"
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
