"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Loader2,
  Package,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Receipt,
  X,
  Eye,
} from "lucide-react";
import { User, Order } from "@/types";
import MemberLayout from "@/components/dashboard/MemberLayout";

export default function PastOrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const [meRes, ordersRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/orders"),
        ]);

        const meData = await meRes.json();
        if (meData.success && meData.user) {
          setUser(meData.user);
        }

        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.orders) {
          setOrders(ordersData.orders);
        }
      } catch (err) {
        console.error("Error loading past orders:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  // Filtered orders by search query
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter((ord) => {
      const matchId = ord.id.toLowerCase().includes(q);
      const matchMember = (ord.memberId || ord.billedBy || "").toLowerCase().includes(q);
      const matchName = (ord.customerName || ord.packageName || "").toLowerCase().includes(q);
      return matchId || matchMember || matchName;
    });
  }, [orders, searchQuery]);

  const formatUniqueOrderId = (rawId: string) => {
    if (rawId.startsWith("AV-ORD-")) return rawId;
    if (rawId.startsWith("ord_")) {
      const parts = rawId.split("_");
      return `AV-ORD-${parts[1]?.slice(-6) || "000000"}-${(parts[2] || "0000").toUpperCase()}`;
    }
    return `AV-ORD-${rawId.slice(0, 8).toUpperCase()}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Shopping Portal
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                2. View Past Orders
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              My Past Purchase Orders
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Complete ledger of past product purchases, volume PV credits, and verification statuses.
            </p>
          </div>

          <Link
            href="/dashboard/store"
            className="px-5 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#006d36]/20 transition-all self-start md:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Order</span>
          </Link>
        </div>

        {/* Clean Search Bar & Table Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e2e2]">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#006d36]" />
              <h2 className="text-base font-black text-[#1a1c1c]">
                Order Records ({filteredOrders.length})
              </h2>
            </div>

            {/* Search Bar */}
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Member ID, Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#1a1c1c] outline-none focus:border-[#006d36]"
              />
            </div>
          </div>

          {/* Past Orders Table */}
          <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f9f9f9] border-b border-[#e2e2e2] text-[#5f5e5e] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Sr No</th>
                  <th className="py-3.5 px-4">Order Date</th>
                  <th className="py-3.5 px-4">Member ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">PV</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading orders...</span>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#5f5e5e]">
                      No orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord, idx) => {
                    const uniqueId = formatUniqueOrderId(ord.id);
                    const memberIdDisplay = ord.memberId || ord.billedBy || user?.memberId || "AV00001";
                    const customerNameDisplay = ord.customerName || user?.fullName || "Associate";

                    return (
                      <tr key={ord.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#5f5e5e]">{idx + 1}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-[#5f5e5e]">
                          {formatDate(ord.date || ord.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#006d36] whitespace-nowrap">
                          {memberIdDisplay}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#1a1c1c] whitespace-nowrap">
                          {customerNameDisplay}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1a1c1c] whitespace-nowrap">
                          {uniqueId}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-[#006d36] whitespace-nowrap">
                          +{ord.pv} PV
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-[#1a1c1c] whitespace-nowrap">
                          ₹{ord.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              ord.status === "APPROVED" || ord.status === "COMPLETED"
                                ? "bg-emerald-100 text-[#006d36] border-emerald-300"
                                : ord.status === "REJECTED"
                                ? "bg-red-100 text-red-700 border-red-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {ord.status === "APPROVED" || ord.status === "COMPLETED" ? (
                              <CheckCircle2 className="w-3 h-3 text-[#006d36]" />
                            ) : ord.status === "REJECTED" ? (
                              <XCircle className="w-3 h-3 text-red-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-700" />
                            )}
                            <span>{ord.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-[#006d36] hover:bg-emerald-100 border border-emerald-200 cursor-pointer text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
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

      {/* Invoice Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div>
                <h3 className="font-black text-base text-[#1a1c1c]">
                  Invoice Details: {formatUniqueOrderId(selectedOrder.id)}
                </h3>
                <span className="text-xs text-[#5f5e5e]">
                  Placed on {formatDate(selectedOrder.date || selectedOrder.createdAt)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#5f5e5e]">Member ID:</span>
                <span className="font-bold text-[#006d36]">
                  {selectedOrder.memberId || selectedOrder.billedBy || user?.memberId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f5e5e]">Customer Name:</span>
                <span className="font-bold text-[#1a1c1c]">
                  {selectedOrder.customerName || user?.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f5e5e]">Total Volume (PV):</span>
                <span className="font-black text-[#006d36]">+{selectedOrder.pv} PV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f5e5e]">Total Amount:</span>
                <span className="font-black text-[#1a1c1c]">
                  ₹{selectedOrder.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f5e5e]">Status:</span>
                <span className="font-bold uppercase text-[#006d36]">{selectedOrder.status}</span>
              </div>
              {selectedOrder.transactionId && (
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">Transaction Ref / UTR:</span>
                  <span className="font-bold text-[#1a1c1c]">{selectedOrder.transactionId}</span>
                </div>
              )}
            </div>

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wider block">
                  Purchased Products
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 rounded-xl border border-[#e2e2e2] p-2 bg-white text-xs">
                  {selectedOrder.items.map((it: any, i: number) => (
                    <div key={i} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-[#1a1c1c]">
                        {it.name} (x{it.quantity})
                      </span>
                      <span className="font-mono font-bold text-[#006d36]">
                        +{it.pv * it.quantity} PV • ₹{(it.mrp * it.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 rounded-xl bg-[#006d36] text-white font-bold text-xs cursor-pointer hover:bg-[#005025]"
            >
              Close Invoice
            </button>
          </div>
        </div>
      )}
    </MemberLayout>
  );
}
