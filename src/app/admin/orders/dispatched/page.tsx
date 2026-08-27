"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Loader2,
  Truck,
  CheckCircle,
  CheckCircle2,
  Search,
  MapPin,
  Printer,
  Tag,
  FileText,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface AdminOrder {
  id: string;
  userId: string;
  billedBy: string;
  memberId: string;
  fullName: string;
  mobile: string;
  transactionId?: string;
  paymentSlip?: string;
  shippingAddress?: string;
  rejectionReason?: string;
  purchaseType: string;
  packageName: string;
  amount: number;
  pv: number;
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    mrp: number;
    pv: number;
  }>;
  status: string;
  createdAt: string;
}

export default function AdminDispatchedOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"DISPATCHED" | "IN_TRANSIT" | "DELIVERED" | "ALL">("DISPATCHED");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [processingStatus, setProcessingStatus] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success && data.orders) {
        const normalized = data.orders.map((o: AdminOrder) => ({
          ...o,
          amount: Number(o.amount || 0),
          pv: Number(o.pv || 0),
        }));
        setOrders(normalized);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, []);

  const dispatchedGroupOrders = useMemo(() => {
    return orders.filter((ord) =>
      ["DISPATCHED", "IN_TRANSIT", "DELIVERED"].includes(ord.status)
    );
  }, [orders]);

  const displayedOrders = useMemo(() => {
    let list = dispatchedGroupOrders;
    if (statusFilter !== "ALL") {
      list = list.filter((ord) => ord.status === statusFilter);
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter((ord) => {
      const matchId = ord.id.toLowerCase().includes(q);
      const matchMember = (ord.memberId || ord.billedBy || "").toLowerCase().includes(q);
      const matchName = (ord.fullName || "").toLowerCase().includes(q);
      const matchMobile = (ord.mobile || "").includes(q);
      const matchDest = (ord.shippingAddress || "").toLowerCase().includes(q);
      return matchId || matchMember || matchName || matchMobile || matchDest;
    });
  }, [dispatchedGroupOrders, statusFilter, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === displayedOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(displayedOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter((item) => item !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  const handleUpdateOrderStatus = async (ids: string[], newStatus: "DELIVERED" | "IN_TRANSIT") => {
    if (ids.length === 0) {
      alert("Please select at least one order to update.");
      return;
    }

    const actionText = newStatus === "DELIVERED" ? "mark as DELIVERED" : "mark as IN TRANSIT";
    if (!confirm(`Are you sure you want to ${actionText} ${ids.length} order(s)?`)) {
      return;
    }

    setProcessingStatus(true);
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: ids,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`🎉 ${ids.length} order(s) successfully marked as ${newStatus}!`);
        setSelectedOrderIds([]);
        await loadOrders();
      } else {
        alert(data.message || "Failed to update order status.");
      }
    } catch {
      alert("Network error updating order status.");
    } finally {
      setProcessingStatus(false);
    }
  };

  const formatOrderId = (rawId: string) => {
    if (rawId.startsWith("AV-ORD-")) return rawId;
    return `AV-ORD-${rawId.slice(0, 8).toUpperCase()}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AdminLayout onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-[10px] font-black uppercase tracking-wider">
                Stage 4 & 5
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Order Manager • 4. Dispatched Order
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Dispatched & Transit Logistics
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Track dispatched packages and confirm deliveries. When an associate receives their parcel, click &apos;Mark Delivered&apos; to complete the order lifecycle.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleUpdateOrderStatus(selectedOrderIds, "DELIVERED")}
              disabled={selectedOrderIds.length === 0 || processingStatus}
              className="px-5 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#006d36]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {processingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Mark Delivered {selectedOrderIds.length > 0 ? `(${selectedOrderIds.length})` : ""}</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#e2e2e2] shadow-xs space-y-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#e2e2e2] pb-3">
            {[
              { id: "DISPATCHED", label: "Dispatched", count: dispatchedGroupOrders.filter((o) => o.status === "DISPATCHED").length },
              { id: "IN_TRANSIT", label: "In Transit", count: dispatchedGroupOrders.filter((o) => o.status === "IN_TRANSIT").length },
              { id: "DELIVERED", label: "Delivered", count: dispatchedGroupOrders.filter((o) => o.status === "DELIVERED").length },
              { id: "ALL", label: "All Logistics", count: dispatchedGroupOrders.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id as "DISPATCHED" | "IN_TRANSIT" | "DELIVERED" | "ALL");
                  setSelectedOrderIds([]);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "bg-[#f9f9f9] text-[#5f5e5e] hover:text-[#006d36] hover:bg-emerald-50"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  statusFilter === tab.id ? "bg-white/20 text-white" : "bg-gray-200/70 text-[#1a1c1c]"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dispatched orders by ID, member, destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#1a1c1c] placeholder-gray-400 focus:border-[#006d36] outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#5f5e5e]">
              <span>Selected:</span>
              <span className="font-bold text-[#006d36] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {selectedOrderIds.length} / {displayedOrders.length}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f9f9f9] border-b border-[#e2e2e2] text-[#5f5e5e] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={displayedOrders.length > 0 && selectedOrderIds.length === displayedOrders.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-[#006d36] focus:ring-[#006d36] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">Sr</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Volume (PV)</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading logistics orders...</span>
                    </td>
                  </tr>
                ) : displayedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-[#5f5e5e]">
                      No orders found under {statusFilter} status.
                    </td>
                  </tr>
                ) : (
                  displayedOrders.map((ord, idx) => {
                    const isSelected = selectedOrderIds.includes(ord.id);
                    return (
                      <tr
                        key={ord.id}
                        className={`hover:bg-emerald-50/30 transition-colors ${
                          isSelected ? "bg-emerald-50/50" : ""
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOrder(ord.id)}
                            className="rounded border-gray-300 text-[#006d36] focus:ring-[#006d36] cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono text-[#5f5e5e]">{idx + 1}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-[#5f5e5e]">
                          {formatDate(ord.createdAt)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-[#1a1c1c]">{ord.fullName}</div>
                          <div className="font-mono text-[10px] text-[#006d36]">{ord.memberId}</div>
                          {ord.mobile && (
                            <div className="font-mono text-[10px] text-[#5f5e5e]">📱 {ord.mobile}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[#5f5e5e]" title={ord.shippingAddress}>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#006d36] shrink-0" />
                            <span className="truncate">{ord.shippingAddress || "Main Address"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1a1c1c] whitespace-nowrap">
                          {formatOrderId(ord.id)}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-[#006d36] whitespace-nowrap">
                          {ord.pv} PV
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-[#1a1c1c] whitespace-nowrap">
                          ₹{ord.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              ord.status === "DELIVERED"
                                ? "bg-emerald-100 text-[#006d36] border-emerald-300"
                                : ord.status === "IN_TRANSIT"
                                ? "bg-cyan-100 text-cyan-800 border-cyan-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                            }`}
                          >
                            {ord.status === "DELIVERED" ? (
                              <CheckCircle2 className="w-3 h-3 text-[#006d36]" />
                            ) : (
                              <Truck className="w-3 h-3" />
                            )}
                            <span>{ord.status.replace("_", " ")}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.status !== "DELIVERED" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus([ord.id], "DELIVERED")}
                                className="px-2.5 py-1.5 rounded-lg bg-[#006d36] text-white hover:bg-[#005025] text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Mark order as delivered"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Delivered</span>
                              </button>
                            )}
                            {/* India Post / Courier Parcel Slip */}
                            <Link
                              href={`/slip/${ord.id}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                              title="Print India Post / Courier Parcel Slip"
                            >
                              <Tag className="w-3.5 h-3.5" />
                              <span>Slip</span>
                            </Link>

                            {/* Tax Invoice Link (New Tab) */}
                            <Link
                              href={`/invoice/${ord.id}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-emerald-200 text-[#006d36] hover:bg-emerald-50 cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                              title="Open Official Tax Invoice in New Tab"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Invoice</span>
                            </Link>

                            {/* Direct Print Link */}
                            <Link
                              href={`/invoice/${ord.id}?print=1`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer inline-flex items-center gap-1"
                              title="Instant Print / Save PDF"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}
