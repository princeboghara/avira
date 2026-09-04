"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  FileText,
  Search,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  Eye,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import OrderItemsModal from "@/components/orders/OrderItemsModal";

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
    price: number;
    pv: number;
  }>;
  status: string;
  createdAt: string;
}

export default function AdminApproveOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter: PENDING (Default) vs REJECTED
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "REJECTED">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);

  // Approval Modal
  const [approveModalOrder, setApproveModalOrder] = useState<AdminOrder | null>(null);

  // Selected Payment Slip for Modal Preview
  const [selectedPaymentSlip, setSelectedPaymentSlip] = useState<{
    orderId: string;
    slipUrl: string;
    transactionId?: string;
    amount?: number;
    memberId?: string;
    fullName?: string;
  } | null>(null);
  const [slipZoom, setSlipZoom] = useState<number>(1);
  const [slipRotation, setSlipRotation] = useState<number>(0);

  // View Items Modal State
  const [viewingOrderItems, setViewingOrderItems] = useState<AdminOrder | null>(null);

  const loadOrders = async () => {
    try {
      const ordersRes = await fetch("/api/admin/orders");
      const data = await ordersRes.json();

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

  const pendingOrdersList = useMemo(() => {
    return orders.filter(
      (ord) => ord.status === "PENDING" || ord.status === "PENDING_APPROVAL"
    );
  }, [orders]);

  const rejectedOrdersList = useMemo(() => {
    return orders.filter((ord) => ord.status === "REJECTED");
  }, [orders]);

  const displayedOrders = useMemo(() => {
    let list = statusFilter === "PENDING" ? pendingOrdersList : rejectedOrdersList;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (ord) =>
          (ord.id || "").toLowerCase().includes(q) ||
          (ord.billedBy && ord.billedBy.toLowerCase().includes(q)) ||
          (ord.memberId || "").toLowerCase().includes(q) ||
          (ord.fullName || "").toLowerCase().includes(q) ||
          (ord.mobile && ord.mobile.includes(q)) ||
          (ord.transactionId && ord.transactionId.toLowerCase().includes(q))
      );
    }

    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [statusFilter, pendingOrdersList, rejectedOrdersList, searchQuery]);

  const openApproveModal = (ord: AdminOrder) => {
    setApproveModalOrder(ord);
  };

  const handleConfirmApproval = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!approveModalOrder) return;

    setApprovingOrderId(approveModalOrder.id);
    try {
      const res = await fetch(`/api/admin/orders/${approveModalOrder.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Order #${approveModalOrder.id} approved successfully!\nMoved to Transfer Queue.`);
        setApproveModalOrder(null);
        await loadOrders();
      } else {
        alert(data.message || "Failed to approve order.");
      }
    } catch {
      alert("Error approving order. Please check server logs.");
    } finally {
      setApprovingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt("Enter reason for rejecting this order (e.g. Invalid UTR or Payment Slip):");
    if (!reason || !reason.trim()) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Order #${orderId} marked as rejected.`);
        await loadOrders();
      } else {
        alert(data.message || "Failed to reject order.");
      }
    } catch {
      alert("Error rejecting order.");
    }
  };

  return (
    <AdminLayout onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono text-[10px] font-black uppercase tracking-wider">
                Stage 1
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Order Manager • 1. Approve Order
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Order Verification & Approvals
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Review new orders submitted by associates. Verify payment slip and transaction UTR before approving.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Pending</span>
              <span className="text-xl font-black font-mono text-amber-900">{pendingOrdersList.length}</span>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-red-700 uppercase block">Rejected</span>
              <span className="text-xl font-black font-mono text-red-800">{rejectedOrdersList.length}</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e2e2e2]">
            {/* Filter Toggle: Pending Orders vs Rejected Orders */}
            <div className="flex items-center gap-1.5 p-1 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter("PENDING")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  statusFilter === "PENDING"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                <span>Pending Orders</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    statusFilter === "PENDING"
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}
                >
                  {pendingOrdersList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("REJECTED")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  statusFilter === "REJECTED"
                    ? "bg-red-700 text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-red-700"
                }`}
              >
                <span>Rejected Orders</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    statusFilter === "REJECTED"
                      ? "bg-white/20 text-white"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {rejectedOrdersList.length}
                </span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Order ID, Billed By, Member, Mobile, UTR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#1a1c1c] placeholder-gray-400 focus:border-[#006d36] outline-none font-medium"
              />
            </div>
          </div>

          {/* Table: Exact requested columns */}
          <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f9f9f9] border-b border-[#e2e2e2] text-[#5f5e5e] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Sr No</th>
                  <th className="py-3.5 px-4">Date + Time</th>
                  <th className="py-3.5 px-4">BILLED BY</th>
                  <th className="py-3.5 px-4">MEMBER ID</th>
                  <th className="py-3.5 px-4">NAME</th>
                  <th className="py-3.5 px-4">AMOUNT (₹)</th>
                  <th className="py-3.5 px-4">PV</th>
                  <th className="py-3.5 px-4">PAYMENT METHOD</th>
                  <th className="py-3.5 px-4">PAYMENT SLIP</th>
                  <th className="py-3.5 px-4">TRANSACTION ID</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading orders...</span>
                    </td>
                  </tr>
                ) : displayedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-[#5f5e5e]">
                      {statusFilter === "PENDING"
                        ? "No pending orders waiting for approval. All caught up!"
                        : "No rejected orders found."}
                    </td>
                  </tr>
                ) : (
                  displayedOrders.map((ord, idx) => {
                    const formattedDateTime = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recent";

                    const isRazorpay =
                      ord.transactionId?.startsWith("pay_") ||
                      ord.transactionId?.toLowerCase().includes("rzp") ||
                      ord.transactionId?.toLowerCase().includes("razorpay");

                    return (
                      <tr key={ord.id} className="hover:bg-emerald-50/30 transition-colors">
                        {/* 1. Sr No */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#5f5e5e]">
                          {idx + 1}
                        </td>

                        {/* 2. Date + Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs text-[#1a1c1c] block">
                            {formattedDateTime}
                          </span>
                          <span className="text-[10px] text-[#5f5e5e] font-mono block">
                            #{ord.id}
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

                        {/* 3. BILLED BY */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#006d36]">
                          {ord.billedBy || ord.memberId}
                        </td>

                        {/* 4. MEMBER ID */}
                        <td className="py-3.5 px-4 font-mono font-black text-[#1a1c1c]">
                          {ord.memberId}
                        </td>

                        {/* 5. NAME */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-sm text-[#1a1c1c] block">
                            {ord.fullName}
                          </span>
                          {ord.mobile && (
                            <span className="text-[10px] text-[#5f5e5e] font-mono block">
                              {ord.mobile}
                            </span>
                          )}
                        </td>

                        {/* 6. AMOUNT */}
                        <td className="py-3.5 px-4 font-mono font-black text-sm text-[#1a1c1c] whitespace-nowrap">
                          ₹{Number(ord.amount || 0).toLocaleString("en-IN")}
                        </td>

                        {/* 7. PV */}
                        <td className="py-3.5 px-4 font-mono font-black text-[#006d36] whitespace-nowrap">
                          {ord.pv} PV
                        </td>

                        {/* PAYMENT METHOD */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isRazorpay ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Razorpay Online
                            </span>
                          ) : ord.paymentSlip ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#006d36] border border-emerald-200">
                              Bank Slip / QR
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              Fund Wallet
                            </span>
                          )}
                        </td>

                        {/* 8. PAYMENT SLIP (Clickable Modal Preview) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {ord.paymentSlip ? (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPaymentSlip({
                                  orderId: ord.id,
                                  slipUrl: ord.paymentSlip!,
                                  transactionId: ord.transactionId,
                                  amount: ord.amount,
                                  memberId: ord.memberId,
                                  fullName: ord.fullName,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006d36] border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                              title="Click to view full payment slip screenshot"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Slip</span>
                            </button>
                          ) : (
                            <span className="text-[#5f5e5e] text-xs font-mono">No slip</span>
                          )}
                        </td>

                        {/* 9. TRANSACTION ID */}
                        <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                          {ord.transactionId ? (
                            <span className="font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-[#1a1c1c]">
                              {ord.transactionId}
                            </span>
                          ) : (
                            <span className="text-[#5f5e5e]">—</span>
                          )}
                        </td>

                        {/* 10. ACTIONS (Approve / Reject) */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {statusFilter === "PENDING" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openApproveModal(ord)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectOrder(ord.id)}
                                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold cursor-pointer transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="text-right">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-300">
                                Reason: {ord.rejectionReason || "Declined by Admin"}
                              </span>
                            </div>
                          )}
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
          MODAL: PAYMENT SLIP VIEWER POPUP
         ======================================================== */}
      {selectedPaymentSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl border border-emerald-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div>
                <h3 className="font-black text-base text-[#1a1c1c]">Payment Transaction Slip</h3>
                <span className="text-[11px] font-mono text-[#006d36] font-bold">
                  Order #{selectedPaymentSlip.orderId} • Associate: {selectedPaymentSlip.memberId} ({selectedPaymentSlip.fullName})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSlipZoom((z) => Math.max(0.5, z - 0.25))}
                    className="p-1.5 rounded-lg hover:bg-white text-gray-700 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono font-bold px-1.5">{Math.round(slipZoom * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setSlipZoom((z) => Math.min(3, z + 0.25))}
                    className="p-1.5 rounded-lg hover:bg-white text-gray-700 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSlipRotation((r) => (r + 90) % 360)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                  title="Rotate Slip"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentSlip(null);
                    setSlipZoom(1);
                    setSlipRotation(0);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] flex items-center justify-between text-xs font-mono">
              <span>Transaction ID / UTR: <strong className="text-[#1a1c1c]">{selectedPaymentSlip.transactionId || "N/A"}</strong></span>
              <span>Amount: <strong className="text-[#006d36]">₹{selectedPaymentSlip.amount?.toLocaleString("en-IN")}</strong></span>
            </div>

            <div className="p-4 border border-[#e2e2e2] rounded-2xl flex items-center justify-center bg-gray-900/5 max-h-[60vh] overflow-auto select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPaymentSlip.slipUrl}
                alt="Payment Slip"
                style={{
                  transform: `scale(${slipZoom}) rotate(${slipRotation}deg)`,
                  transition: "transform 0.2s ease-out",
                }}
                className="max-h-[50vh] max-w-full rounded-xl object-contain shadow-md"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={selectedPaymentSlip.slipUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl border border-[#e2e2e2] hover:bg-gray-100 text-center font-bold text-xs text-[#1a1c1c] flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Full Window</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setSelectedPaymentSlip(null);
                  setSlipZoom(1);
                  setSlipRotation(0);
                }}
                className="w-full py-2.5 rounded-xl bg-[#006d36] text-white font-bold text-xs cursor-pointer hover:bg-[#005025]"
              >
                Close Slip Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: APPROVE ORDER CONFIRMATION
         ======================================================== */}
      {approveModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006d36] border border-emerald-200 flex items-center justify-center font-black">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1a1c1c]">
                    Approve Order #{approveModalOrder.id}
                  </h3>
                  <span className="text-xs text-[#5f5e5e] font-mono">
                    Verify order payment & send to Transfer Queue
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApproveModalOrder(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Summary Box */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-[#1a1c1c]">
                  {approveModalOrder.fullName} ({approveModalOrder.memberId})
                </span>
                <span className="font-black text-[#006d36]">
                  ₹{approveModalOrder.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 font-mono text-[11px]">
                <span>Billed By: <strong>{approveModalOrder.billedBy || approveModalOrder.memberId}</strong></span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#006d36] font-bold">
                  +{approveModalOrder.pv} PV Credit
                </span>
              </div>
              <p className="text-[#5f5e5e] text-[11px] truncate">
                Address: {approveModalOrder.shippingAddress || "Store Pickup"}
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                Package: {approveModalOrder.packageName || "Product Package"} ({approveModalOrder.items?.length || 1} items)
              </p>
            </div>

            {/* Approval Info Box */}
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                What happens on Approval:
              </p>
              <ul className="list-disc list-inside text-[11px] text-blue-800 space-y-0.5 pl-1">
                <li>Order status will be updated to <strong>APPROVED</strong>.</li>
                <li><strong>+{approveModalOrder.pv} PV</strong> will be credited to member tree.</li>
                <li>Order will move directly to the <strong>Transfer Orders</strong> page to assign a fulfillment shoppy.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2e2e2]">
              <button
                type="button"
                onClick={() => setApproveModalOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmApproval()}
                disabled={approvingOrderId === approveModalOrder.id}
                className="px-5 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold cursor-pointer shadow-md shadow-emerald-950/20 disabled:opacity-60 flex items-center gap-1.5 text-xs"
              >
                {approvingOrderId === approveModalOrder.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Approving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Approve Order</span>
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
