"use client";

import React, { useEffect, useState, useMemo } from "react";
import ShoppyLayout from "@/components/shoppy/ShoppyLayout";
import {
  Loader2,
  Boxes,
  Truck,
  Search,
  Printer,
  FileText,
  CheckCircle2,
  X,
  Package,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { Order } from "@/types";
import OrderItemsModal from "@/components/orders/OrderItemsModal";

export default function ShoppyPackingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [processingStatus, setProcessingStatus] = useState(false);
  const [viewingOrderItems, setViewingOrderItems] = useState<Order | null>(null);

  // Dispatch Modal State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [targetOrderIds, setTargetOrderIds] = useState<string[]>([]);
  const [courierName, setCourierName] = useState("DTDC Courier");
  const [trackingNumber, setTrackingNumber] = useState("");

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/shoppy/orders?status=PACKED");
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Error loading packed orders:", err);
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

  const openDispatchModal = (ids: string[]) => {
    if (ids.length === 0) {
      alert("Please select at least one packed order to dispatch.");
      return;
    }
    setTargetOrderIds(ids);
    setCourierName("DTDC Courier");
    setTrackingNumber("");
    setDispatchModalOpen(true);
  };

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetOrderIds.length === 0) return;

    setProcessingStatus(true);
    try {
      const res = await fetch("/api/shoppy/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: targetOrderIds,
          status: "DISPATCHED",
          courierName: courierName.trim() || "DTDC Courier",
          trackingNumber: trackingNumber.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`🚚 ${targetOrderIds.length} parcel(s) successfully marked as DISPATCHED!`);
        setDispatchModalOpen(false);
        setSelectedOrderIds([]);
        await loadOrders();
      } else {
        alert(data.message || "Failed to update dispatch status.");
      }
    } catch {
      alert("Error contacting server.");
    } finally {
      setProcessingStatus(false);
    }
  };

  const handlePrintSlip = (orderId: string) => {
    window.open(`/slip/${orderId}?print=1`, "_blank");
  };

  const handlePrintBill = (orderId: string) => {
    window.open(`/invoice/${orderId}?print=1`, "_blank");
  };

  const handleBulkPrintSlips = () => {
    if (selectedOrderIds.length === 0) {
      alert("Please select at least one order to print slips.");
      return;
    }
    window.open(`/slip/bulk?ids=${selectedOrderIds.join(",")}`, "_blank");
  };

  const handleBulkPrintBills = () => {
    if (selectedOrderIds.length === 0) {
      alert("Please select at least one order to print bills.");
      return;
    }
    window.open(`/invoice/bulk?ids=${selectedOrderIds.join(",")}`, "_blank");
  };

  return (
    <ShoppyLayout onRefresh={loadOrders} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Header Neumorphic Card */}
        <div className="shoppy-surface rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full shoppy-inset-sm font-mono text-[10px] font-black uppercase tracking-wider text-indigo-700">
                Stage 2 • In Packaging
              </span>
              <span className="text-xs text-slate-500 font-mono">
                SURAT PARCEL HUB (AVS01)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Orders In Packaging (Labeling & Courier)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify packaged items, print dispatch slips or tax invoices, and assign courier AWB to dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Bulk Print and Dispatch Toolbar */}
            {selectedOrderIds.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={handleBulkPrintSlips}
                  className="px-3.5 py-2.5 rounded-2xl bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-black text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                  title="Print Dispatch Slips for Selected Orders"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Bulk Slips ({selectedOrderIds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkPrintBills}
                  className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 text-[#006d36] border border-emerald-200 hover:bg-emerald-100 font-black text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                  title="Print GST Tax Invoices for Selected Orders"
                >
                  <Printer className="w-4 h-4 text-[#006d36]" />
                  <span>Bulk Bills ({selectedOrderIds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => openDispatchModal(selectedOrderIds)}
                  className="shoppy-btn-primary px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Truck className="w-4 h-4" />
                  <span>Dispatch ({selectedOrderIds.length})</span>
                </button>
              </>
            ) : (
              <span className="text-xs font-mono text-slate-400 italic">
                Select orders below to enable bulk slip & bill printing
              </span>
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
              placeholder="Search by Order ID, Recipient, or Mobile..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl shoppy-inset text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d36]/30 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 self-end sm:self-auto">
            <span>In Packing:</span>
            <span className="px-2.5 py-1 rounded-xl shoppy-inset-sm font-black text-indigo-700">
              {filteredOrders.length}
            </span>
          </div>
        </div>

        {/* Clean Neumorphic Table Container */}
        <div className="shoppy-surface rounded-3xl p-5 sm:p-6 space-y-4 border border-white/80">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#006d36]" />
              <p className="text-xs font-mono font-bold">Loading packaging queue...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <div className="w-14 h-14 rounded-3xl shoppy-inset-sm flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-black text-slate-800 text-base">No Parcels in Packing</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All packed orders have been dispatched, or transfer new orders from Assigned Orders stage.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="rounded-2xl border border-slate-200/90 bg-white shadow-[3px_3px_10px_rgba(0,0,0,0.03),-3px_-3px_10px_rgba(255,255,255,0.9)] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/90 border-b border-slate-200/90">
                    <tr className="text-slate-500 font-mono text-[11px] font-black uppercase">
                      <th className="py-3 px-3.5 w-10 text-center">
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
                      <th className="py-3 px-3.5">Order ID & Date</th>
                      <th className="py-3 px-3.5">Recipient Details</th>
                      <th className="py-3 px-3.5 min-w-[220px]">Order Items & Package</th>
                      <th className="py-3 px-3.5">Amount & PV</th>
                      <th className="py-3 px-3.5">Delivery Destination</th>
                      <th className="py-3 px-3.5 text-right">Print & Dispatch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((ord) => {
                      const isSelected = selectedOrderIds.includes(ord.id);

                      // Parse items breakdown
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      let orderItems: any[] = [];
                      if (ord.items) {
                        try {
                          orderItems = typeof ord.items === "string" ? JSON.parse(ord.items) : ord.items;
                        } catch {
                          orderItems = [];
                        }
                      }
                      if (!Array.isArray(orderItems)) orderItems = [];

                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const totalUnits = orderItems.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0);

                      return (
                        <tr
                          key={ord.id}
                          className={`transition-colors ${
                            isSelected ? "bg-emerald-50/40" : "hover:bg-slate-50/60"
                          }`}
                        >
                          <td className="py-3 px-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOrder(ord.id)}
                              className="rounded text-[#006d36] focus:ring-0 cursor-pointer"
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
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setViewingOrderItems(ord)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006d36] border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Items ({orderItems.length || 1})</span>
                              </button>
                              <span className="text-[9px] font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                                Packed ✓
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="font-mono font-black text-slate-900 block">
                              ₹{Number(ord.amount || 0).toLocaleString("en-IN")}
                            </span>
                            <span className="font-mono text-[11px] font-black text-[#006d36] block">
                              {ord.pv} PV
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-slate-600 max-w-[200px]">
                            <p className="line-clamp-2 text-[11px]">
                              {ord.buyerAddress || ord.shippingAddress || "Store Pickup"}
                            </p>
                            {(ord.buyerCity || ord.buyerPincode) && (
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                {ord.buyerCity} {ord.buyerPincode}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Single Print Slip Button */}
                              <button
                                type="button"
                                onClick={() => handlePrintSlip(ord.id)}
                                className="p-1.5 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/90 text-blue-800 border border-blue-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all shadow-[1px_1px_3px_rgba(0,0,0,0.02)] active:scale-95"
                                title="Print Parcel Dispatch Slip"
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                                <span>Slip</span>
                              </button>

                              {/* Single Print Bill Button */}
                              <button
                                type="button"
                                onClick={() => handlePrintBill(ord.id)}
                                className="p-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 text-[#006d36] border border-emerald-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all shadow-[1px_1px_3px_rgba(0,0,0,0.02)] active:scale-95"
                                title="Print GST Tax Invoice"
                              >
                                <Printer className="w-3.5 h-3.5 text-[#006d36]" />
                                <span>Bill</span>
                              </button>

                              {/* Dispatch Action Button */}
                              <button
                                type="button"
                                onClick={() => openDispatchModal([ord.id])}
                                className="shoppy-btn-primary px-3 py-1.5 rounded-xl font-black text-xs inline-flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                                title="Attach Courier & Dispatch Parcel"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Dispatch</span>
                              </button>
                            </div>
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

        {/* Modal: Dispatch Parcel with Tracking Details */}
        {dispatchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            <div className="shoppy-surface-lg rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 border border-white/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl shoppy-inset-sm flex items-center justify-center text-[#006d36]">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">
                      Dispatch {targetOrderIds.length} Parcel(s)
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      SURAT PARCEL HUB Outbound
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDispatchModalOpen(false)}
                  className="shoppy-btn p-2 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmDispatch} className="space-y-4 text-xs">
                {/* Selected Order Summary */}
                <div className="shoppy-inset rounded-2xl p-3 space-y-1 font-mono text-[11px]">
                  <span className="text-slate-500 block">Orders to Dispatch:</span>
                  <p className="font-black text-slate-900 break-all">
                    {targetOrderIds.map((id) => `#${id}`).join(", ")}
                  </p>
                </div>

                {/* Courier Partner Selection */}
                <div className="space-y-1.5">
                  <label className="font-black font-mono text-slate-700 uppercase tracking-wider block">
                    Courier / Delivery Partner:
                  </label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full p-3 rounded-2xl shoppy-inset text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#006d36]/30 text-xs"
                  >
                    <option value="DTDC Courier">DTDC Courier</option>
                    <option value="Delhivery Logistics">Delhivery Logistics</option>
                    <option value="Blue Dart Express">Blue Dart Express</option>
                    <option value="Trackon Couriers">Trackon Couriers</option>
                    <option value="India Post Speed Post">India Post Speed Post</option>
                    <option value="Local / Store Pickup">Local Hub Handover / Direct Pickup</option>
                  </select>
                </div>

                {/* Tracking / AWB Number */}
                <div className="space-y-1.5">
                  <label className="font-black font-mono text-slate-700 uppercase tracking-wider block">
                    AWB / Consignment Tracking Number:
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DTDC89271891 or AWB987654"
                    className="w-full p-3 rounded-2xl shoppy-inset text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006d36]/30 font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Buyer will see this tracking number in their member portal.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-300">
                  <button
                    type="button"
                    onClick={() => setDispatchModalOpen(false)}
                    className="shoppy-btn px-4 py-2.5 rounded-2xl font-bold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingStatus}
                    className="shoppy-btn-primary px-5 py-2.5 rounded-2xl font-black text-white flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {processingStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                    <span>Confirm Dispatch</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Order Items Modal */}
        <OrderItemsModal
          order={viewingOrderItems}
          onClose={() => setViewingOrderItems(null)}
        />
      </div>
    </ShoppyLayout>
  );
}
