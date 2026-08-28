"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Loader2,
  FileText,
  Copy,
  Check,
  AlertCircle,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  User,
  Phone,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface AdminFundRequest {
  id: string;
  userId: string;
  memberId: string;
  fullName: string;
  mobile: string;
  amount: number;
  transactionId: string;
  slipUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  currentFundWallet?: number;
  city?: string;
  state?: string;
}

export default function AdminFundsPage() {
  const [requests, setRequests] = useState<AdminFundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  // Action States
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalItem, setRejectModalItem] = useState<AdminFundRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Lightbox Slip Viewer
  const [lightboxSlip, setLightboxSlip] = useState<{
    url: string;
    memberId: string;
    fullName: string;
    amount: number;
    transactionId: string;
  } | null>(null);
  const [slipZoom, setSlipZoom] = useState(1);
  const [slipRotation, setSlipRotation] = useState(0);

  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  const loadFundRequests = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/funds", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error("Error loading admin funds:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFundRequests();
  }, []);

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const handleApprove = async (fundReq: AdminFundRequest) => {
    if (!confirm(`Are you sure you want to approve deposit of ₹${fundReq.amount.toLocaleString("en-IN")} for ${fundReq.memberId} (${fundReq.fullName})?`)) {
      return;
    }

    setProcessingId(fundReq.id);
    try {
      const res = await fetch(`/api/admin/funds/${fundReq.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.success) {
        setToastMessage({ type: "success", text: data.message });
        await loadFundRequests();
      } else {
        setToastMessage({ type: "error", text: data.message || "Failed to approve fund request." });
      }
    } catch {
      setToastMessage({ type: "error", text: "Network error approving fund request." });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalItem) return;

    setProcessingId(rejectModalItem.id);
    try {
      const res = await fetch(`/api/admin/funds/${rejectModalItem.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setToastMessage({ type: "success", text: "Fund request rejected." });
        setRejectModalItem(null);
        setRejectReason("");
        await loadFundRequests();
      } else {
        setToastMessage({ type: "error", text: data.message || "Failed to reject fund request." });
      }
    } catch {
      setToastMessage({ type: "error", text: "Network error rejecting fund request." });
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered List
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesMember = r.memberId?.toLowerCase().includes(q);
        const matchesName = r.fullName?.toLowerCase().includes(q);
        const matchesMobile = r.mobile?.toLowerCase().includes(q);
        const matchesTxn = r.transactionId?.toLowerCase().includes(q);
        const matchesId = r.id?.toLowerCase().includes(q);
        if (!matchesMember && !matchesName && !matchesMobile && !matchesTxn && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  // Counts
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  const totalPendingAmount = requests
    .filter((r) => r.status === "PENDING")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalApprovedAmount = requests
    .filter((r) => r.status === "APPROVED")
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-16">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold animate-slideIn ${
              toastMessage.type === "success"
                ? "bg-emerald-50 text-[#006d36] border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header & Metrics */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1a1c1c] tracking-tight flex items-center gap-2">
              <Wallet className="w-6 h-6 text-[#006d36]" />
              <span>Fund Deposit Requests & Approval</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Verify associate payment slips, match UTR numbers, and credit associate Fund Wallets.
            </p>
          </div>

          <button
            type="button"
            onClick={loadFundRequests}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#1a1c1c] font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#006d36] ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-amber-700">Pending Requests</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {pendingCount} Pending
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-900">
              ₹{totalPendingAmount.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-gray-400 block">Requires UTR verification</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-emerald-700">Approved Deposits</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#006d36] text-[10px] font-bold">
                {approvedCount} Approved
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-[#006d36]">
              ₹{totalApprovedAmount.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-gray-400 block">Credited to Fund Wallets</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-gray-600">Total Processed</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                {requests.length} Total
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-[#1a1c1c]">
              {rejectedCount} Rejected
            </div>
            <span className="text-[10px] text-gray-400 block">All-time request volume</span>
          </div>
        </div>

        {/* Search & Tabs Filter Bar */}
        <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1">
              {[
                { id: "PENDING", label: `Pending (${pendingCount})`, color: "amber" },
                { id: "APPROVED", label: `Approved (${approvedCount})`, color: "emerald" },
                { id: "REJECTED", label: `Rejected (${rejectedCount})`, color: "red" },
                { id: "ALL", label: `All (${requests.length})`, color: "gray" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    statusFilter === tab.id
                      ? "bg-[#006d36] text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Member ID, UTR, Name..."
                className="w-full text-xs font-medium text-[#1a1c1c] pl-8 pr-7 py-2 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:border-[#006d36]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#006d36]" />
              <span className="text-xs font-bold font-mono">Loading Fund Requests...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <Wallet className="w-8 h-8 mx-auto text-gray-300" />
              <h4 className="font-bold text-xs text-[#1a1c1c]">No Fund Requests Found</h4>
              <p className="text-[11px] text-gray-400">There are no requests matching your filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Date & ID</th>
                    <th className="py-3 px-4">Associate Details</th>
                    <th className="py-3 px-4">Deposit Amount</th>
                    <th className="py-3 px-4">Transaction UTR</th>
                    <th className="py-3 px-4">Payment Slip</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-[#1a1c1c]">
                  {filteredRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Date & ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[11px] text-gray-700 block">
                          #{r.id.replace("freq_", "").slice(0, 8)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono block">
                          {new Date(r.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Associate Details */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold font-mono text-[#006d36] text-xs">
                              {r.memberId}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="font-bold text-xs text-[#1a1c1c]">{r.fullName}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-2">
                            <span>Ph: {r.mobile}</span>
                            {r.currentFundWallet !== undefined && (
                              <span>Wallet: ₹{r.currentFundWallet.toLocaleString("en-IN")}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Deposit Amount */}
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-black font-mono text-[#006d36] block">
                          ₹{r.amount.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Transaction UTR */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-xs uppercase text-[#1a1c1c]">
                            {r.transactionId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyUtr(r.transactionId)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                            title="Copy UTR"
                          >
                            {copiedUtr === r.transactionId ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Payment Slip */}
                      <td className="py-3.5 px-4">
                        {r.slipUrl ? (
                          <button
                            type="button"
                            onClick={() => {
                              setLightboxSlip({
                                url: r.slipUrl!,
                                memberId: r.memberId,
                                fullName: r.fullName,
                                amount: r.amount,
                                transactionId: r.transactionId,
                              });
                              setSlipZoom(1);
                              setSlipRotation(0);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006d36] font-bold text-[10px] cursor-pointer flex items-center gap-1 border border-emerald-200"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Slip</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[10px]">No Slip</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {r.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006d36] text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        )}
                        {r.status === "REJECTED" && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                              <XCircle className="w-3 h-3" />
                              <span>Rejected</span>
                            </span>
                            {r.rejectionReason && (
                              <span className="text-[9px] text-red-600 block truncate max-w-[120px]" title={r.rejectionReason}>
                                {r.rejectionReason}
                              </span>
                            )}
                          </div>
                        )}
                        {r.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {r.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={processingId === r.id}
                              onClick={() => handleApprove(r)}
                              className="px-3 py-1.5 rounded-xl bg-[#006d36] hover:bg-[#005025] disabled:bg-gray-300 text-white font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                            >
                              {processingId === r.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>Accept</span>
                            </button>

                            <button
                              type="button"
                              disabled={processingId === r.id}
                              onClick={() => {
                                setRejectModalItem(r);
                                setRejectReason("");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs active:scale-95 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[10px]">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================
            REJECT MODAL POPUP
           ======================================================== */}
        {rejectModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-red-200 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-black text-sm text-red-700 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  <span>Reject Fund Request</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setRejectModalItem(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-red-50 rounded-2xl border border-red-100 text-xs space-y-1 text-red-900">
                <div>Member: <strong>{rejectModalItem.memberId} ({rejectModalItem.fullName})</strong></div>
                <div>Amount: <strong>₹{rejectModalItem.amount.toLocaleString("en-IN")}</strong></div>
                <div>UTR: <strong className="font-mono">{rejectModalItem.transactionId}</strong></div>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Reason for Rejection
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. UTR number mismatch / Payment slip unreadable / Amount not received"
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1a1c1c] outline-none focus:bg-white focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalItem(null)}
                    className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 font-bold text-xs text-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingId === rejectModalItem.id}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    {processingId === rejectModalItem.id ? "Rejecting..." : "Confirm Rejection"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            LIGHTBOX SLIP VIEWER
           ======================================================== */}
        {lightboxSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl border border-emerald-300 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <h3 className="font-black text-base text-[#1a1c1c]">Payment Transaction Slip</h3>
                  <span className="text-[11px] font-mono text-[#006d36] font-bold">
                    Associate: {lightboxSlip.memberId} ({lightboxSlip.fullName}) • Amount: ₹{lightboxSlip.amount.toLocaleString("en-IN")} • UTR: {lightboxSlip.transactionId}
                  </span>
                </div>

                <div className="flex items-center gap-2">
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
                    title="Rotate"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightboxSlip(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-2xl flex items-center justify-center bg-gray-900/5 max-h-[60vh] overflow-auto select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightboxSlip.url}
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
                  href={lightboxSlip.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-center font-bold text-xs text-[#1a1c1c] flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Full Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxSlip(null)}
                  className="w-full py-2.5 rounded-xl bg-[#006d36] text-white font-bold text-xs cursor-pointer hover:bg-[#005025]"
                >
                  Close Slip Viewer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
