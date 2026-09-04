"use client";

import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Loader2,
  Search,
  ArrowRightLeft,
  CheckCircle2,
  Store,
  MapPin,
  Clock,
  X,
  Layers,
  Truck,
  CheckSquare,
  Square,
  AlertCircle,
  Copy,
  Eye,
} from "lucide-react";
import { Order, Shoppy } from "@/types";
import OrderItemsModal from "@/components/orders/OrderItemsModal";

export default function AdminTransferOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shoppies, setShoppies] = useState<Shoppy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter Tabs: WAITING (default), TRANSFERRED, ALL
  const [activeTab, setActiveTab] = useState<"WAITING" | "TRANSFERRED" | "ALL">("WAITING");
  const [searchQuery, setSearchQuery] = useState("");

  // Bulk Selection State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkShoppyId, setBulkShoppyId] = useState<string>("AVS01");
  const [bulkTransferModalOpen, setBulkTransferModalOpen] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Single Transfer Modal State
  const [singleTransferOrder, setSingleTransferOrder] = useState<Order | null>(null);
  const [singleShoppyId, setSingleShoppyId] = useState<string>("AVS01");
  const [singleProcessing, setSingleProcessing] = useState(false);

  // View Items Modal State
  const [viewingOrderItems, setViewingOrderItems] = useState<Order | null>(null);

  // Copy notification state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [ordersRes, shoppiesRes] = await Promise.all([
        fetch("/api/admin/orders", { cache: "no-store" }),
        fetch("/api/admin/shoppies", { cache: "no-store" }),
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
      console.error("Error loading transfer orders data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  // Approved orders eligible for transfer management
  // (Either status is 'APPROVED' or order is confirmed/in fulfillment flow)
  const approvedOrders = useMemo(() => {
    return orders.filter((o) => {
      const status = (o.status || "").toUpperCase();
      // Exclude unapproved pending and rejected orders
      return status !== "PENDING" && status !== "PENDING_APPROVAL" && status !== "REJECTED";
    });
  }, [orders]);

  // Orders waiting to be transferred to a Shoppy hub
  const waitingOrders = useMemo(() => {
    return approvedOrders.filter((o) => {
      const status = (o.status || "").toUpperCase();
      const hasShoppy = !!(o.shoppyId && o.shoppyId.trim() !== "");
      return status === "APPROVED" || !hasShoppy;
    });
  }, [approvedOrders]);

  // Orders that have already been transferred to a Shoppy hub
  const transferredOrders = useMemo(() => {
    return approvedOrders.filter((o) => {
      const hasShoppy = !!(o.shoppyId && o.shoppyId.trim() !== "");
      return hasShoppy && o.status !== "APPROVED";
    });
  }, [approvedOrders]);

  // Displayed orders based on active tab and search query
  const displayedOrders = useMemo(() => {
    let list: Order[] = [];
    if (activeTab === "WAITING") {
      list = waitingOrders;
    } else if (activeTab === "TRANSFERRED") {
      list = transferredOrders;
    } else {
      list = approvedOrders;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((o) => {
        const id = (o.id || "").toLowerCase();
        const memberId = (o.memberId || "").toLowerCase();
        const billedBy = (o.billedBy || "").toLowerCase();
        const name = (o.customerName || o.buyerName || "").toLowerCase();
        const mobile = (o.customerMobile || o.buyerMobile || "").toLowerCase();
        const address = (o.shippingAddress || o.buyerAddress || "").toLowerCase();
        const shoppy = (o.shoppyId || o.shoppyName || "").toLowerCase();
        return (
          id.includes(q) ||
          memberId.includes(q) ||
          billedBy.includes(q) ||
          name.includes(q) ||
          mobile.includes(q) ||
          address.includes(q) ||
          shoppy.includes(q)
        );
      });
    }

    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeTab, waitingOrders, transferredOrders, approvedOrders, searchQuery]);

  // Checkbox Selection Helpers
  const isAllSelected =
    displayedOrders.length > 0 &&
    displayedOrders.every((o) => selectedOrderIds.includes(o.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all in current view
      const displayedIds = new Set(displayedOrders.map((o) => o.id));
      setSelectedOrderIds((prev) => prev.filter((id) => !displayedIds.has(id)));
    } else {
      // Select all currently displayed orders
      const newIds = new Set([...selectedOrderIds, ...displayedOrders.map((o) => o.id)]);
      setSelectedOrderIds(Array.from(newIds));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Copy Order ID helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Single Transfer Handlers
  const openSingleTransfer = (order: Order) => {
    setSingleTransferOrder(order);
    setSingleShoppyId(order.shoppyId || "AVS01");
  };

  const handleExecuteSingleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleTransferOrder) return;

    setSingleProcessing(true);
    try {
      const res = await fetch(`/api/admin/orders/${singleTransferOrder.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shoppyId: singleShoppyId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Order #${singleTransferOrder.id} transferred successfully to ${data.shoppyName || singleShoppyId}!`);
        setSingleTransferOrder(null);
        // Remove from selection if was selected
        setSelectedOrderIds((prev) => prev.filter((id) => id !== singleTransferOrder.id));
        await loadData();
      } else {
        alert(data.message || "Failed to transfer order");
      }
    } catch {
      alert("Error transferring order. Please check network logs.");
    } finally {
      setSingleProcessing(false);
    }
  };

  // Bulk Transfer Handlers
  const handleOpenBulkModal = () => {
    if (selectedOrderIds.length === 0) {
      alert("Please select at least one order to transfer.");
      return;
    }
    setBulkTransferModalOpen(true);
  };

  const handleExecuteBulkTransfer = async () => {
    if (selectedOrderIds.length === 0) return;

    setBulkProcessing(true);
    try {
      const res = await fetch("/api/admin/orders/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: selectedOrderIds,
          shoppyId: bulkShoppyId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Successfully transferred ${data.transferredCount || selectedOrderIds.length} orders to ${data.shoppyName || bulkShoppyId}!`);
        setBulkTransferModalOpen(false);
        setSelectedOrderIds([]);
        await loadData();
      } else {
        alert(data.message || "Failed to complete bulk transfer.");
      }
    } catch {
      alert("Error executing bulk transfer.");
    } finally {
      setBulkProcessing(false);
    }
  };

  return (
    <AdminLayout onRefresh={loadData} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-mono text-[10px] font-black uppercase tracking-wider">
                Stage 2
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Order Manager • 2. Transfer Orders
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight flex items-center gap-2.5">
              <ArrowRightLeft className="w-7 h-7 text-[#006d36]" />
              <span>Transfer Orders to Fulfillment Hub</span>
            </h1>
            <p className="text-xs text-[#5f5e5e] max-w-2xl">
              Orders approved from pending verification appear here. Assign individual orders or transfer in bulk to <strong>SURAT PARCEL HUB (AVS01)</strong> or regional franchise points for packing and shipping.
            </p>
          </div>

          {/* Quick Metrics Counters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-center min-w-[125px]">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">
                Waiting Transfer
              </span>
              <span className="text-2xl font-black font-mono text-amber-900">
                {waitingOrders.length}
              </span>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[125px]">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                Transferred Hub
              </span>
              <span className="text-2xl font-black font-mono text-[#006d36]">
                {transferredOrders.length}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center min-w-[125px]">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">
                Total Approved
              </span>
              <span className="text-2xl font-black font-mono text-slate-800">
                {approvedOrders.length}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Logistics Center Card */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#004d26] text-white rounded-2xl shadow-sm border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-emerald-300">
                  SURAT PARCEL HUB (AVS01)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Primary Logistics Hub
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                Ring Road Logistics Center, Surat, Gujarat • Primary central hub for packaging, slip generation & courier dispatch
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-200 shrink-0">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Ready for Bulk Ingestion</span>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e2e2e2]">
            {/* Tab Controls */}
            <div className="flex items-center gap-1.5 p-1 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("WAITING");
                  setSelectedOrderIds([]);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "WAITING"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                <span>Waiting for Transfer</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeTab === "WAITING"
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}
                >
                  {waitingOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("TRANSFERRED");
                  setSelectedOrderIds([]);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "TRANSFERRED"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                <span>Transferred to Shoppy</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeTab === "TRANSFERRED"
                      ? "bg-white/20 text-white"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}
                >
                  {transferredOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("ALL");
                  setSelectedOrderIds([]);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "ALL"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                <span>All Approved Orders</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeTab === "ALL"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-800 border border-slate-300"
                  }`}
                >
                  {approvedOrders.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[300px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Order ID, Billed By, Member, City, Hub..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#1a1c1c] placeholder-gray-400 focus:border-[#006d36] outline-none font-medium"
              />
            </div>
          </div>

          {/* ========================================================
              BULK ACTION TOOLBAR (Appears when 1+ rows selected)
             ======================================================== */}
          {selectedOrderIds.length > 0 && (
            <div className="p-4 bg-emerald-50 border-2 border-[#006d36] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-scaleUp shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#006d36] text-white flex items-center justify-center font-bold font-mono text-xs">
                  {selectedOrderIds.length}
                </div>
                <div>
                  <span className="font-black text-sm text-[#1a1c1c] block">
                    {selectedOrderIds.length} Order{selectedOrderIds.length > 1 ? "s" : ""} Selected
                  </span>
                  <span className="text-[11px] text-[#5f5e5e]">
                    Ready to transfer together to fulfillment hub
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Shoppy Selector for Bulk */}
                <select
                  value={bulkShoppyId}
                  onChange={(e) => setBulkShoppyId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-emerald-300 font-bold text-xs text-[#1a1c1c] focus:outline-none focus:border-[#006d36]"
                >
                  <option value="AVS01">AVS01 — SURAT PARCEL HUB (Primary Hub)</option>
                  {shoppies
                    .filter((s) => s.shoppyId !== "AVS01")
                    .map((s) => (
                      <option key={s.id} value={s.shoppyId}>
                        {s.shoppyId} — {s.storeName} ({s.city}, {s.state})
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  onClick={handleOpenBulkModal}
                  className="px-4 py-2 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Bulk Transfer ({selectedOrderIds.length}) Orders</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrderIds([])}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-gray-100 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              ORDERS TABLE
             ======================================================== */}
          <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f9f9f9] border-b border-[#e2e2e2] text-[#5f5e5e] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="p-1 rounded hover:bg-gray-200 text-[#006d36] cursor-pointer"
                      title={isAllSelected ? "Deselect All" : "Select All"}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#006d36]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-3">Sr No</th>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">BILLED BY</th>
                  <th className="py-3.5 px-4">RECIPIENT ASSOCIATE</th>
                  <th className="py-3.5 px-4">DELIVERY ADDRESS</th>
                  <th className="py-3.5 px-4">AMOUNT (₹)</th>
                  <th className="py-3.5 px-4">PV</th>
                  <th className="py-3.5 px-4">CURRENT HUB</th>
                  <th className="py-3.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-14 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading orders for transfer...</span>
                    </td>
                  </tr>
                ) : displayedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#5f5e5e]">
                      <div className="max-w-md mx-auto space-y-2">
                        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                        <p className="font-bold text-sm text-[#1a1c1c]">
                          {activeTab === "WAITING"
                            ? "No approved orders waiting for hub transfer."
                            : "No orders found for the selected view."}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activeTab === "WAITING"
                            ? "When you approve orders from Pending For Approval, they will appear here to be transferred."
                            : "Try clearing search filter or switching tabs."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedOrders.map((ord, idx) => {
                    const isSelected = selectedOrderIds.includes(ord.id);
                    const formattedDate = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recent";

                    const isTransferred = !!(ord.shoppyId && ord.shoppyId.trim() !== "");

                    return (
                      <tr
                        key={ord.id}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-emerald-50/70 border-l-4 border-l-[#006d36]"
                            : "hover:bg-emerald-50/20"
                        }`}
                      >
                        {/* 1. Checkbox */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSelectOrder(ord.id)}
                            className="p-1 rounded hover:bg-gray-200 text-[#006d36] cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#006d36]" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </td>

                        {/* 2. Sr No */}
                        <td className="py-3.5 px-3 font-mono font-bold text-[#5f5e5e]">
                          {idx + 1}
                        </td>

                        {/* 3. Order ID & Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-[#006d36]">
                              #{ord.id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(ord.id)}
                              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                              title="Copy Order ID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedId === ord.id && (
                              <span className="text-[10px] text-[#006d36] font-bold">Copied</span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#5f5e5e] font-mono block">
                            {formattedDate}
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

                        {/* 4. BILLED BY */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-xs text-[#1a1c1c] block">
                            {ord.billedBy || ord.memberId}
                          </span>
                          <span className="text-[10px] text-[#5f5e5e] block">
                            {ord.buyerName || "Associate"}
                          </span>
                        </td>

                        {/* 5. RECIPIENT ASSOCIATE */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-sm text-[#1a1c1c] block">
                            {ord.customerName || ord.buyerName || "Customer"}
                          </span>
                          <span className="text-[11px] font-mono text-[#006d36] font-bold">
                            {ord.memberId}
                          </span>
                          {(ord.customerMobile || ord.buyerMobile) && (
                            <span className="text-[10px] text-[#5f5e5e] font-mono block">
                              {ord.customerMobile || ord.buyerMobile}
                            </span>
                          )}
                        </td>

                        {/* 6. DELIVERY ADDRESS */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span className="text-[11px] text-gray-700 line-clamp-2" title={ord.shippingAddress || ord.buyerAddress}>
                              {ord.shippingAddress || ord.buyerAddress || "Self Pickup"}
                            </span>
                          </div>
                        </td>

                        {/* 7. AMOUNT */}
                        <td className="py-3.5 px-4 font-mono font-black text-sm text-[#1a1c1c] whitespace-nowrap">
                          ₹{Number(ord.amount || 0).toLocaleString("en-IN")}
                        </td>

                        {/* 8. PV */}
                        <td className="py-3.5 px-4 font-mono font-bold text-xs whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold">
                            {ord.pv} PV
                          </span>
                        </td>

                        {/* 9. CURRENT HUB */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isTransferred ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#006d36] border border-emerald-200">
                                <Store className="w-3 h-3" />
                                <span>{ord.shoppyName || ord.shoppyId}</span>
                              </span>
                              {ord.shoppyTransferredAt && (
                                <span className="text-[9px] text-[#5f5e5e] font-mono block">
                                  {new Date(ord.shoppyTransferredAt).toLocaleDateString("en-IN")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3 h-3" />
                              <span>Waiting Transfer</span>
                            </span>
                          )}
                        </td>

                        {/* 10. ACTION */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openSingleTransfer(ord)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5 ml-auto ${
                              isTransferred
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
                                : "bg-[#006d36] hover:bg-[#005025] text-white"
                            }`}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>{isTransferred ? "Reassign Hub" : "Transfer Order"}</span>
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

      {/* ========================================================
          MODAL: SINGLE ORDER TRANSFER
         ======================================================== */}
      {singleTransferOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006d36] border border-emerald-200 flex items-center justify-center font-black">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1a1c1c]">
                    Transfer Order #{singleTransferOrder.id}
                  </h3>
                  <span className="text-xs text-[#5f5e5e] font-mono">
                    Select the fulfillment hub center
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSingleTransferOrder(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Details Preview */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-[#1a1c1c]">
                  Associate: {singleTransferOrder.customerName || singleTransferOrder.buyerName} ({singleTransferOrder.memberId})
                </span>
                <span className="font-black text-[#006d36]">
                  ₹{Number(singleTransferOrder.amount || 0).toLocaleString("en-IN")} • {singleTransferOrder.pv} PV
                </span>
              </div>
              <p className="text-[#5f5e5e] text-[11px]">
                Delivery: {singleTransferOrder.shippingAddress || singleTransferOrder.buyerAddress || "Self Pickup"}
              </p>
            </div>

            <form onSubmit={handleExecuteSingleTransfer} className="space-y-4 text-xs">
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#006d36]" />
                  <span>Select Destination Shoppy Hub:</span>
                </label>

                <select
                  value={singleShoppyId}
                  onChange={(e) => setSingleShoppyId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#006d36] text-xs"
                >
                  <option value="AVS01">AVS01 — SURAT PARCEL HUB (Primary Hub - Ring Road, Surat)</option>
                  {shoppies
                    .filter((s) => s.shoppyId !== "AVS01")
                    .map((s) => (
                      <option key={s.id} value={s.shoppyId}>
                        {s.shoppyId} — {s.storeName} ({s.city}, {s.state})
                      </option>
                    ))}
                </select>

                <span className="text-[11px] text-slate-500 block">
                  Once transferred, this order will appear in the chosen Shoppy center&apos;s fulfillment dashboard ready for packaging and delivery.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2e2e2]">
                <button
                  type="button"
                  onClick={() => setSingleTransferOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={singleProcessing}
                  className="px-5 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold cursor-pointer shadow-md shadow-emerald-950/20 disabled:opacity-60 flex items-center gap-1.5"
                >
                  {singleProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transferring...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Transfer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: BULK ORDERS TRANSFER
         ======================================================== */}
      {bulkTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006d36] border border-emerald-200 flex items-center justify-center font-black">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1a1c1c]">
                    Bulk Transfer {selectedOrderIds.length} Orders
                  </h3>
                  <span className="text-xs text-[#5f5e5e] font-mono">
                    Batch assignment to fulfillment center
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBulkTransferModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-2">
              <span className="font-bold text-[#1a1c1c] block">
                Destination Hub:
              </span>
              <div className="p-2.5 bg-white rounded-xl border border-emerald-300 font-mono font-bold text-xs text-[#006d36]">
                {bulkShoppyId === "AVS01"
                  ? "SURAT PARCEL HUB (AVS01) — Primary Logistics Hub"
                  : shoppies.find((s) => s.shoppyId === bulkShoppyId)?.storeName || bulkShoppyId}
              </div>
              <p className="text-[11px] text-[#5f5e5e]">
                All <strong>{selectedOrderIds.length}</strong> selected orders will be updated to <em>CONFIRMED</em> status and assigned to this Shoppy hub in a single batch.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2e2e2]">
              <button
                type="button"
                onClick={() => setBulkTransferModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkTransfer}
                disabled={bulkProcessing}
                className="px-5 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold cursor-pointer shadow-md shadow-emerald-950/20 disabled:opacity-60 flex items-center gap-1.5 text-xs"
              >
                {bulkProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Bulk Transfer...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Confirm & Transfer ({selectedOrderIds.length}) Orders</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Order Items Modal */}
      <OrderItemsModal
        order={viewingOrderItems}
        onClose={() => setViewingOrderItems(null)}
      />
    </AdminLayout>
  );
}
