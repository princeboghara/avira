"use client";

import React, { useEffect, useState, useMemo } from "react";
import ShoppyLayout from "@/components/shoppy/ShoppyLayout";
import {
  Loader2,
  RotateCcw,
  Search,
  Truck,
  Printer,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Order } from "@/types";

export default function ShoppyReturnedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/shoppy/orders?status=RETURNED");
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Error loading returned orders:", err);
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

  return (
    <ShoppyLayout onRefresh={loadOrders} refreshing={refreshing}>
      <div className="space-y-5 animate-fadeIn">
        {/* Header */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-mono text-[10px] font-black uppercase tracking-wider">
                Order Manager
              </span>
              <span className="text-xs text-slate-500 font-mono">
                SURAT PARCEL HUB (AVS01)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Returned & RTO Orders
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Parcels returned to hub due to delivery failure, incorrect address, or customer refusal.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Buyer, AWB #..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#006d36] focus:bg-white transition-all font-mono"
            />
          </div>

          <span className="text-xs font-mono font-bold text-slate-500 self-end sm:self-auto">
            Returned Count: <strong className="text-rose-600">{filteredOrders.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-[#006d36]" />
              <p className="text-xs font-mono">Loading returned orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No Returned Orders</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                No parcels have been flagged as returned or RTO for SURAT PARCEL HUB.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] font-bold uppercase">
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Courier Partner</th>
                    <th className="py-3 px-4">AWB Tracking #</th>
                    <th className="py-3 px-4">Amount & PV</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
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
                        <span className="font-bold text-slate-900 block">
                          {ord.buyerName || ord.customerName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 block">
                          {ord.buyerMobile || ord.customerMobile || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {ord.courierName || "—"}
                      </td>
                      <td className="py-3 px-4">
                        {ord.trackingNumber ? (
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block w-fit">
                            {ord.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          ₹{Number(ord.amount || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-[#006d36] block">
                          {ord.pv} PV
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-mono text-[10px] font-bold">
                          <AlertCircle className="w-3 h-3" />
                          <span>RETURNED</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ShoppyLayout>
  );
}
