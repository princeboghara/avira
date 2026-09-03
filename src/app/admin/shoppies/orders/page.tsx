"use client";

import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Truck,
  Store,
  Search,
  Filter,
  ArrowRightLeft,
  CheckCircle2,
  Boxes,
  Loader2,
  X,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Order, Shoppy } from "@/types";

export default function AdminShoppyOrdersTrackingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shoppies, setShoppies] = useState<Shoppy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedShoppyFilter, setSelectedShoppyFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Reassign Modal
  const [reassignOrder, setReassignOrder] = useState<Order | null>(null);
  const [targetShoppyId, setTargetShoppyId] = useState("");
  const [transferring, setTransferring] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [ordersRes, shoppiesRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/shoppies"),
      ]);
      const ordersData = await ordersRes.json();
      const shoppiesData = await shoppiesRes.json();

      if (ordersData.success && ordersData.orders) {
        setOrders(ordersData.orders);
      }
      if (shoppiesData.success && shoppiesData.shoppies) {
        setShoppies(shoppiesData.shoppies);
      }
    } catch (err) {
      console.error("Error loading shoppy orders tracking:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    let list = orders;

    // Shoppy filter
    if (selectedShoppyFilter === "CENTRAL") {
      list = list.filter((o) => !o.shoppyId || o.shoppyId === "");
    } else if (selectedShoppyFilter !== "ALL") {
      list = list.filter(
        (o) => (o.shoppyId || "").toUpperCase() === selectedShoppyFilter.toUpperCase()
      );
    }

    // Status filter
    if (selectedStatusFilter !== "ALL") {
      list = list.filter((o) => o.status === selectedStatusFilter);
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter((ord) => {
      const matchId = (ord.id || "").toLowerCase().includes(q);
      const matchMember = (ord.memberId || ord.billedBy || "").toLowerCase().includes(q);
      const matchCustomer = (ord.buyerName || ord.customerName || "").toLowerCase().includes(q);
      const matchMobile = (ord.buyerMobile || ord.customerMobile || "").includes(q);
      const matchShoppy = (ord.shoppyId || "").toLowerCase().includes(q) || (ord.shoppyName || "").toLowerCase().includes(q);
      const matchTracking = (ord.trackingNumber || "").toLowerCase().includes(q);
      return matchId || matchMember || matchCustomer || matchMobile || matchShoppy || matchTracking;
    });
  }, [orders, selectedShoppyFilter, selectedStatusFilter, searchQuery]);

  const openReassignModal = (ord: Order) => {
    setReassignOrder(ord);
    setTargetShoppyId(ord.shoppyId || "AVS01");
  };

  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignOrder) return;

    setTransferring(true);
    try {
      const res = await fetch(`/api/admin/orders/${reassignOrder.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shoppyId: targetShoppyId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Order transferred successfully!");
        setReassignOrder(null);
        await loadData();
      } else {
        alert(data.message || "Failed to transfer order.");
      }
    } catch {
      alert("Error processing transfer.");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <AdminLayout onRefresh={loadData} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-mono text-[10px] font-black uppercase tracking-wider">
                Fulfillment Radar
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Shoppy Manager • Multi-Center Tracking
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Shoppy Orders Tracking
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Live monitoring of order fulfillment across all regional Shoppy centers. Reassign or transfer parcels dynamically.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center min-w-[100px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Centers</span>
              <span className="text-xl font-black font-mono text-slate-900">{shoppies.length}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[100px]">
              <span className="text-[10px] font-bold text-[#006d36] uppercase block">Assigned</span>
              <span className="text-xl font-black font-mono text-[#006d36]">
                {orders.filter((o) => o.shoppyId).length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Orders Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e2e2e2]">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5f5e5e]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order, Shoppy, Buyer..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#f9f9f9] border border-[#e2e2e2] focus:outline-none focus:border-[#006d36] font-mono text-[#1a1c1c]"
                />
              </div>

              {/* Shoppy Dropdown Filter */}
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Store className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedShoppyFilter}
                  onChange={(e) => setSelectedShoppyFilter(e.target.value)}
                  className="p-2 rounded-xl bg-[#f9f9f9] border border-[#e2e2e2] font-mono text-xs text-slate-900 focus:outline-none focus:border-[#006d36]"
                >
                  <option value="ALL">All Centers ({orders.length} orders)</option>
                  {shoppies.map((s) => (
                    <option key={s.id} value={s.shoppyId}>
                      {s.shoppyId} - {s.storeName} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown Filter */}
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="p-2 rounded-xl bg-[#f9f9f9] border border-[#e2e2e2] font-mono text-xs text-slate-900 focus:outline-none focus:border-[#006d36]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PACKED">PACKED</option>
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
            </div>

            <span className="text-xs font-mono text-[#5f5e5e]">
              Total Matching: <strong className="text-[#1a1c1c]">{filteredOrders.length}</strong>
            </span>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#006d36]" />
              <p className="text-xs font-mono">Loading fulfillment tracking...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Truck className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-[#1a1c1c]">No orders found</p>
              <p className="text-xs text-[#5f5e5e]">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e2e2] bg-[#f9f9f9] text-[#5f5e5e] font-mono text-[11px] uppercase">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Assigned Shoppy</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Amount / PV</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Courier / Tracking</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e2e2]">
                  {filteredOrders.map((ord) => {
                    const formattedDate = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "Recent";

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1a1c1c] whitespace-nowrap">
                          #{ord.id}
                          <span className="text-[10px] text-slate-400 font-normal block font-mono">
                            {formattedDate}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {ord.shoppyId ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-[#006d36] font-mono text-xs font-bold border border-emerald-200">
                              <Store className="w-3.5 h-3.5" />
                              <span>{ord.shoppyName || ord.shoppyId}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 font-mono text-xs font-medium border border-slate-200">
                              <span>Central (Unassigned)</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[#1a1c1c] block">
                            {ord.buyerName || ord.customerName}
                          </span>
                          <span className="text-[10px] font-mono text-[#5f5e5e]">
                            {ord.buyerMobile || ord.customerMobile || ord.memberId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                          <span className="font-black text-[#1a1c1c] block">
                            ₹{Number(ord.amount || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] font-bold text-[#006d36]">
                            {ord.pv} PV
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                              ord.status === "DELIVERED"
                                ? "bg-emerald-100 text-[#006d36]"
                                : ord.status === "DISPATCHED"
                                ? "bg-teal-100 text-teal-800"
                                : ord.status === "PACKED"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono">
                          {ord.courierName ? (
                            <div>
                              <span className="font-bold text-slate-800 block">
                                {ord.courierName}
                              </span>
                              {ord.trackingNumber && (
                                <span className="text-[10px] text-slate-500 block">
                                  {ord.trackingNumber}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openReassignModal(ord)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-[#006d36] text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Transfer / Reassign</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Reassign Shoppy */}
        {reassignOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006d36] border border-emerald-200 flex items-center justify-center font-bold">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Transfer Order #{reassignOrder.id}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Current: {reassignOrder.shoppyName || reassignOrder.shoppyId || "Central Warehouse"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReassignOrder(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmTransfer} className="space-y-4 text-xs">
                {/* Order Details Brief */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">
                    {reassignOrder.buyerName || reassignOrder.customerName} (₹{Number(reassignOrder.amount || 0).toLocaleString("en-IN")})
                  </p>
                  <p className="text-slate-600 truncate">
                    {reassignOrder.buyerAddress || reassignOrder.shippingAddress || "Local Store Pickup"}
                  </p>
                </div>

                {/* Select New Shoppy */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Select Target Shoppy Center:
                  </label>
                  <select
                    value={targetShoppyId}
                    onChange={(e) => setTargetShoppyId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#006d36]"
                  >
                    {shoppies.map((s) => (
                      <option key={s.id} value={s.shoppyId}>
                        {s.shoppyId} — {s.storeName} ({s.city}, {s.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setReassignOrder(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={transferring}
                    className="px-5 py-2 rounded-xl bg-[#006d36] hover:bg-[#005228] text-white font-bold cursor-pointer shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {transferring ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Transferring...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Transfer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
