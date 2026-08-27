"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Loader2,
  CheckCircle2,
  Boxes,
  Search,
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

export default function AdminConfirmedOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Filter confirmed orders (support CONFIRMED, APPROVED, COMPLETED)
  const confirmedOrders = useMemo(() => {
    return orders.filter(
      (ord) =>
        ord.status === "CONFIRMED" ||
        ord.status === "APPROVED" ||
        ord.status === "COMPLETED"
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return confirmedOrders;
    return confirmedOrders.filter((ord) => {
      const matchId = ord.id.toLowerCase().includes(q);
      const matchMember = (ord.memberId || ord.billedBy || "").toLowerCase().includes(q);
      const matchName = (ord.fullName || "").toLowerCase().includes(q);
      const matchMobile = (ord.mobile || "").includes(q);
      return matchId || matchMember || matchName || matchMobile;
    });
  }, [confirmedOrders, searchQuery]);

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
        `Are you sure you want to send ${idsToSend.length} selected parcel(s) to Order Packing? Status will be updated to PACKED.`
      )
    ) {
      return;
    }

    setProcessingStatus(true);
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: idsToSend,
          status: "PACKED",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`📦 ${idsToSend.length} order(s) successfully sent to Order Packing!`);
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
              <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-mono text-[10px] font-black uppercase tracking-wider">
                Stage 2
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Order Manager • 2. Confirmed Order
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Confirmed Orders Directory
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Verified customer orders ready for the packing department. Select orders and click &apos;Send for Packaging&apos; to dispatch to the packing floor.
            </p>
          </div>

          {/* Send for Packaging Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSendForPackaging(selectedOrderIds)}
              disabled={selectedOrderIds.length === 0 || processingStatus}
              className="px-5 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#006d36]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {processingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Boxes className="w-4 h-4" />
              )}
              <span>Send for Packaging {selectedOrderIds.length > 0 ? `(${selectedOrderIds.length})` : ""}</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#e2e2e2] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Order ID, Member ID, Customer Name, Mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#1a1c1c] placeholder-gray-400 focus:border-[#006d36] outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#5f5e5e]">
              <span>Selected:</span>
              <span className="font-bold text-[#006d36] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {selectedOrderIds.length} / {filteredOrders.length}
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
                      checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-[#006d36] focus:ring-[#006d36] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">Sr</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Recipient Member</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Billed By</th>
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
                    <td colSpan={11} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading confirmed orders...</span>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-[#5f5e5e]">
                      No confirmed orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord, idx) => {
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
                        <td className="py-3 px-4 font-mono font-bold text-[#006d36] whitespace-nowrap">
                          {ord.memberId}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#1a1c1c] whitespace-nowrap">
                          <div>
                            <span>{ord.fullName}</span>
                            {ord.mobile && (
                              <span className="block text-[10px] text-[#5f5e5e] font-mono">
                                📱 {ord.mobile}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                          <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold">
                            {ord.billedBy}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1a1c1c] whitespace-nowrap">
                          {formatOrderId(ord.id)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-[#006d36] whitespace-nowrap">
                          {ord.pv} PV
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-[#1a1c1c] whitespace-nowrap">
                          ₹{ord.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800 border border-teal-300">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            <span>CONFIRMED</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSendForPackaging([ord.id])}
                              className="px-2.5 py-1.5 rounded-lg bg-[#006d36] text-white hover:bg-[#005025] text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Send single order to packing"
                            >
                              <Boxes className="w-3 h-3" />
                              <span>To Packing</span>
                            </button>
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
