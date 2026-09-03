"use client";

import React, { useEffect, useState, useMemo } from "react";
import ShoppyLayout from "@/components/shoppy/ShoppyLayout";
import {
  Loader2,
  CheckCircle2,
  Boxes,
  Search,
  Printer,
  FileText,
  ShoppingCart,
  Eye,
  X,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { Order } from "@/types";

export default function ShoppyConfirmedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [processingStatus, setProcessingStatus] = useState(false);

  // Selected Order for Items Breakdown Modal
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/shoppy/orders?status=CONFIRMED");
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
    const q = searchQuery.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter((ord) => {
      const matchId = (ord.id || "").toLowerCase().includes(q);
      const matchMember = (ord.memberId || ord.billedBy || "").toLowerCase().includes(q);
      const matchName = (ord.buyerName || ord.customerName || "").toLowerCase().includes(q);
      const matchMobile = (ord.buyerMobile || ord.customerMobile || "").includes(q);
      return matchId || matchMember || matchName || matchMobile;
    });
  }, [orders, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
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

  const handleSendForPackaging = async (idsToSend: string[]) => {
    if (idsToSend.length === 0) {
      alert("Please select at least one order to send for packaging.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to send ${idsToSend.length} selected parcel(s) to Packaging? Status will be set to PACKED.`
      )
    ) {
      return;
    }

    setProcessingStatus(true);
    try {
      const res = await fetch("/api/shoppy/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: idsToSend,
          status: "PACKED",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`📦 ${idsToSend.length} order(s) successfully sent to Packaging!`);
        setSelectedOrderIds([]);
        await loadOrders();
      } else {
        alert(data.message || "Failed to update order status.");
      }
    } catch {
      alert("Network error while sending orders to packaging.");
    } finally {
      setProcessingStatus(false);
    }
  };

  const handlePrintManifest = () => {
    window.print();
  };

  return (
    <ShoppyLayout onRefresh={loadOrders} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Header Neumorphic Card */}
        <div className="shoppy-surface rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full shoppy-inset-sm font-mono text-[10px] font-black uppercase tracking-wider text-amber-700">
                Stage 1 • Assigned Queue
              </span>
              <span className="text-xs text-slate-500 font-mono">
                SURAT PARCEL HUB (AVS01)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Assigned Orders (Pending Packing)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verified orders transferred from Admin waiting for Surat Hub dispatch preparation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrintManifest}
              className="shoppy-btn px-4 py-2.5 rounded-2xl text-xs font-black text-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Hub List</span>
            </button>

            {selectedOrderIds.length > 0 && (
              <button
                type="button"
                onClick={() => handleSendForPackaging(selectedOrderIds)}
                disabled={processingStatus}
                className="shoppy-btn-primary px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer"
              >
                {processingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Boxes className="w-4 h-4" />
                )}
                <span>Send {selectedOrderIds.length} to Packing</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="shoppy-surface rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/80">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Member ID, Name, or Mobile..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl shoppy-inset text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d36]/30 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 self-end sm:self-auto">
            <span>Total Assigned:</span>
            <span className="px-2.5 py-1 rounded-xl shoppy-inset-sm font-black text-amber-700">
              {filteredOrders.length}
            </span>
          </div>
        </div>

        {/* Orders Table Neumorphic Container */}
        <div className="shoppy-surface rounded-3xl p-6 space-y-4 border border-white/80">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#006d36]" />
              <p className="text-xs font-mono font-bold">Loading assigned queue...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <div className="w-14 h-14 rounded-3xl shoppy-inset-sm flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-black text-slate-800 text-base">No Assigned Orders</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No orders currently in CONFIRMED state waiting for packing at SURAT PARCEL HUB.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="shoppy-inset rounded-2xl p-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-500 font-mono text-[11px] font-black uppercase border-b border-slate-300/60">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={
                            filteredOrders.length > 0 &&
                            selectedOrderIds.length === filteredOrders.length
                          }
                          onChange={toggleSelectAll}
                          className="rounded text-[#006d36] focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Member / Recipient</th>
                      <th className="py-3 px-4">Package & Items</th>
                      <th className="py-3 px-4">Amount & PV</th>
                      <th className="py-3 px-4">Delivery Address</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300/40">
                    {filteredOrders.map((ord) => {
                      const isSelected = selectedOrderIds.includes(ord.id);
                      return (
                        <tr
                          key={ord.id}
                          className={`transition-colors ${
                            isSelected ? "bg-amber-100/40" : "hover:bg-white/40"
                          }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOrder(ord.id)}
                              className="rounded text-[#006d36] focus:ring-0 cursor-pointer"
                            />
                          </td>
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
                            <button
                              type="button"
                              onClick={() => setViewOrder(ord)}
                              className="text-[11px] font-bold text-[#006d36] hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View {ord.items?.length || 1} Item(s)</span>
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-black text-slate-900 block">
                              ₹{Number(ord.amount || 0).toLocaleString("en-IN")}
                            </span>
                            <span className="font-mono text-[11px] font-black text-[#006d36] block">
                              {ord.pv} PV
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-[220px]">
                            <p className="line-clamp-2 text-[11px]">
                              {ord.buyerAddress || ord.shippingAddress || "Store Pickup"}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleSendForPackaging([ord.id])}
                              className="shoppy-btn-primary px-3 py-1.5 rounded-xl font-black text-xs inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Boxes className="w-3.5 h-3.5" />
                              <span>Pack</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Order Items Breakdown */}
        {viewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            <div className="shoppy-surface-lg rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 border border-white/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl shoppy-inset-sm flex items-center justify-center text-[#006d36]">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">
                      Order #{viewOrder.id} Items
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {viewOrder.buyerName} ({viewOrder.memberId})
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

              {/* Items List in sunken well */}
              <div className="shoppy-inset rounded-2xl p-3 space-y-2 max-h-60 overflow-y-auto">
                {viewOrder.items && viewOrder.items.length > 0 ? (
                  viewOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="bg-white/70 p-2.5 rounded-xl flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <span className="font-black text-slate-900 block">{it.name}</span>
                        <span className="text-[10px] text-slate-500">Qty: {it.quantity}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 block">₹{it.price || it.mrp || 0}</span>
                        <span className="text-[10px] text-[#006d36] font-bold">{it.pv} PV</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 p-2 text-center">
                    Package: {viewOrder.packageName || "Standard Package"}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-300 text-xs">
                <span className="text-slate-500">Total Value:</span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  ₹{Number(viewOrder.amount || 0).toLocaleString("en-IN")} • {viewOrder.pv} PV
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewOrder(null)}
                  className="shoppy-btn px-5 py-2 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ShoppyLayout>
  );
}
