"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  Wallet,
  Calendar,
  CheckCircle2,
  Clock,
  Building,
  CreditCard,
  Check,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Filter,
  DollarSign,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import DataTable, { Column } from "@/components/ui/DataTable";

interface WeekPeriod {
  identifier: string;
  startDate: string;
  endDate: string;
  label: string;
  isCurrent: boolean;
}

interface PayoutRecord {
  id: string;
  srNo: number;
  weekIdentifier: string;
  weekStartDate: string;
  weekEndDate: string;
  weekLabel: string;
  userId: string;
  memberId: string;
  fullName: string;
  mobile: string;
  grossAmount: number;
  tdsAmount: number;
  adminCharge: number;
  rpWalletDeduction: number;
  netAmount: number;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  upiId: string;
  kycStatus: string;
  status: "PENDING" | "PAID";
  paidAt?: string;
  transactionReference?: string;
  notes?: string;
}

interface PayoutSummary {
  totalGross: number;
  totalTds: number;
  totalAdmin: number;
  totalNet: number;
  totalPaid: number;
  totalPending: number;
  totalMembers: number;
  paidCount: number;
  pendingCount: number;
}

export default function AdminWithdrawMasterPage() {
  const [weeks, setWeeks] = useState<WeekPeriod[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<WeekPeriod | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [summary, setSummary] = useState<PayoutSummary>({
    totalGross: 0,
    totalTds: 0,
    totalAdmin: 0,
    totalNet: 0,
    totalPaid: 0,
    totalPending: 0,
    totalMembers: 0,
    paidCount: 0,
    pendingCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Single Pay Confirm Modal
  const [payTarget, setPayTarget] = useState<PayoutRecord | null>(null);
  const [payRefNo, setPayRefNo] = useState("");

  // Bulk Pay Confirm Modal
  const [showBulkPayModal, setShowBulkPayModal] = useState(false);
  const [bulkRefNo, setBulkRefNo] = useState("");

  const loadPayoutData = async (weekId?: string) => {
    try {
      setRefreshing(true);
      const url = weekId ? `/api/admin/payouts?week=${weekId}` : `/api/admin/payouts`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setWeeks(data.weeks || []);
        setSelectedWeek(data.selectedWeek || null);
        setSelectedWeekId(data.selectedWeek?.identifier || "");
        setPayouts(data.payouts || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error("Error loading payouts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayoutData();
  }, []);

  const handleSelectWeek = (wId: string) => {
    setSelectedWeekId(wId);
    setLoading(true);
    loadPayoutData(wId);
  };

  // Process Single Payout
  const handleConfirmSinglePay = async () => {
    if (!payTarget) return;
    setProcessingId(payTarget.id);

    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: payTarget.id,
          reference: payRefNo.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await loadPayoutData(selectedWeekId);
        setPayTarget(null);
        setPayRefNo("");
      } else {
        alert(data.message || "Failed to process payout.");
      }
    } catch {
      alert("Network error processing payout settlement.");
    } finally {
      setProcessingId(null);
    }
  };

  // Process Bulk Payout for all pending members in selected week
  const handleConfirmBulkPay = async () => {
    const pendingIds = payouts.filter((p) => p.status === "PENDING").map((p) => p.id);
    if (pendingIds.length === 0) return;

    setProcessingId("BULK");
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutIds: pendingIds,
          reference: bulkRefNo.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await loadPayoutData(selectedWeekId);
        setShowBulkPayModal(false);
        setBulkRefNo("");
      } else {
        alert(data.message || "Failed to process bulk payouts.");
      }
    } catch {
      alert("Network error processing bulk payouts.");
    } finally {
      setProcessingId(null);
    }
  };

  const columns: Column<PayoutRecord>[] = [
    {
      header: "Member Details",
      accessorKey: "memberId",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006d36] font-black text-xs flex items-center justify-center border border-emerald-200 shrink-0">
            {row.fullName?.charAt(0) || "M"}
          </div>
          <div className="overflow-hidden">
            <span className="font-bold text-xs text-[#1a1c1c] block truncate">{row.fullName}</span>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#5f5e5e]">
              <span className="font-bold text-[#006d36]">{row.memberId}</span>
              <span>•</span>
              <span>{row.mobile}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "KYC & Bank Account",
      accessorKey: "bankAccountNumber",
      cell: (row) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                row.kycStatus === "VERIFIED"
                  ? "bg-emerald-100 text-[#006d36]"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              KYC {row.kycStatus || "PENDING"}
            </span>
            {row.bankName && <span className="font-semibold text-gray-700">{row.bankName}</span>}
          </div>
          <div className="font-mono text-[11px] text-gray-800">
            {row.bankAccountNumber ? (
              <span>A/C: <strong>{row.bankAccountNumber}</strong></span>
            ) : (
              <span className="text-amber-600 text-[10px]">No Account Linked</span>
            )}
            {row.ifscCode && (
              <span className="text-gray-500 ml-1.5">({row.ifscCode})</span>
            )}
          </div>
          {row.upiId && (
            <div className="text-[10px] font-mono text-purple-700">UPI: {row.upiId}</div>
          )}
        </div>
      ),
    },
    {
      header: "Gross Earning",
      accessorKey: "grossAmount",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#1a1c1c]">
          ₹{row.grossAmount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "15% Deductions",
      accessorKey: "tdsAmount",
      cell: (row) => (
        <div className="text-xs font-mono">
          <div className="text-red-600 font-bold">
            -₹{(row.tdsAmount + row.adminCharge).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-[#5f5e5e]">
            TDS 5%: ₹{row.tdsAmount} • Admin 10%: ₹{row.adminCharge}
          </div>
        </div>
      ),
    },
    {
      header: "Net Payable (85%)",
      accessorKey: "netAmount",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-black text-sm text-[#006d36]">
          ₹{row.netAmount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => {
        const isPaid = row.status === "PAID";
        return (
          <div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                isPaid
                  ? "bg-emerald-100 text-[#006d36] border border-emerald-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              <span>{isPaid ? "PAID" : "PENDING"}</span>
            </span>
            {isPaid && row.paidAt && (
              <span className="text-[9px] text-gray-500 block font-mono mt-0.5">
                {new Date(row.paidAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Action",
      cell: (row) => {
        const isPaid = row.status === "PAID";
        if (isPaid) {
          return (
            <div className="text-[10px] font-mono text-[#006d36] font-bold">
              ✓ Settled
            </div>
          );
        }

        return (
          <button
            type="button"
            onClick={() => {
              setPayTarget(row);
              setPayRefNo(`TXN_${Date.now().toString().slice(-6)}`);
            }}
            disabled={processingId === row.id}
            className="px-3.5 py-1.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold shadow-2xs hover:shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
          >
            {processingId === row.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>Pay Now</span>
          </button>
        );
      },
    },
  ];

  return (
    <AdminLayout onRefresh={() => loadPayoutData(selectedWeekId)} refreshing={refreshing}>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* 1. Header Banner */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#006d36] via-[#005a2c] to-[#4f378a] text-white shadow-xl shadow-[#006d36]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-bold font-mono">
              <Wallet className="w-4 h-4" />
              <span>Weekly Payout Engine & Bank Settlement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Withdraw Master (Weekly Settlement)
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Inspect weekly accumulated earnings with 15% automatic statutory deductions (5% TDS + 10% Admin) and release bank payments.
            </p>
          </div>

          {/* Bulk Pay Trigger */}
          {summary.pendingCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowBulkPayModal(true);
                setBulkRefNo(`BULK_${Date.now().toString().slice(-6)}`);
              }}
              className="px-5 py-3 rounded-2xl bg-white text-[#006d36] hover:bg-emerald-50 font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Pay All Pending ({summary.pendingCount} Members)</span>
            </button>
          )}
        </div>

        {/* 2. WEEK SELECTOR TABS (Horizontal Scroll with Clean Date Range Badges) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5f5e5e] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#006d36]" />
              <span>Select Settlement Week Period:</span>
            </h2>
            {selectedWeek && (
              <span className="text-xs font-mono font-bold text-[#006d36] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                Active Week: {selectedWeek.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
            {weeks.map((w) => {
              const isSelected = selectedWeekId === w.identifier;
              return (
                <button
                  key={w.identifier}
                  type="button"
                  onClick={() => handleSelectWeek(w.identifier)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                    isSelected
                      ? "bg-[#006d36] text-white border-[#006d36] shadow-md shadow-[#006d36]/20 font-black"
                      : "bg-white text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-emerald-50/60 border-gray-200 shadow-2xs"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{w.label}</span>
                  {w.isCurrent && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] uppercase font-mono ${
                        isSelected ? "bg-white text-[#006d36]" : "bg-emerald-100 text-[#006d36]"
                      }`}
                    >
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. FINANCIAL SUMMARY METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e] block">
              Total Gross Income
            </span>
            <span className="text-lg sm:text-xl font-mono font-black text-[#1a1c1c] block mt-1">
              ₹{summary.totalGross.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-[#5f5e5e] block mt-0.5">
              {summary.totalMembers} total earners
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 block">
              15% Total Deductions
            </span>
            <span className="text-lg sm:text-xl font-mono font-black text-red-600 block mt-1">
              ₹{(summary.totalTds + summary.totalAdmin).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-[#5f5e5e] block mt-0.5">
              TDS: ₹{summary.totalTds} • Admin: ₹{summary.totalAdmin}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-200 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#006d36] block">
              Net Payable (85%)
            </span>
            <span className="text-lg sm:text-xl font-mono font-black text-[#006d36] block mt-1">
              ₹{summary.totalNet.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-[#5f5e5e] block mt-0.5">
              Total bank disbursal
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
              Total Paid
            </span>
            <span className="text-lg sm:text-xl font-mono font-black text-emerald-700 block mt-1">
              ₹{summary.totalPaid.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-emerald-800 font-medium block mt-0.5">
              {summary.paidCount} members paid
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
              Pending Payout
            </span>
            <span className="text-lg sm:text-xl font-mono font-black text-amber-700 block mt-1">
              ₹{summary.totalPending.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-amber-800 font-medium block mt-0.5">
              {summary.pendingCount} pending release
            </span>
          </div>
        </div>

        {/* 4. WEEKLY PAYOUT TABLE */}
        {loading ? (
          <div className="py-20 text-center text-[#006d36] flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">Loading weekly payouts...</span>
          </div>
        ) : (
          <DataTable
            data={payouts}
            columns={columns}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search by Associate Name, ID, Mobile, Bank Account, IFSC..."
            searchableKeys={["memberId", "fullName", "mobile", "bankAccountNumber", "ifscCode", "bankName"]}
            initialPageSize={10}
            title={`Withdraw Master — ${selectedWeek?.label || "Weekly Settlement"}`}
            emptyMessage="No earnings found for this week period."
          />
        )}

        {/* 5. CONFIRM SINGLE PAYOUT MODAL */}
        {payTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-gray-100">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#006d36] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1a1c1c]">Confirm Payout Release</h3>
                  <span className="text-xs text-[#5f5e5e]">{payTarget.weekLabel}</span>
                </div>
              </div>

              {/* Member & Bank Details */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">Associate:</span>
                  <strong className="text-[#1a1c1c]">{payTarget.fullName} ({payTarget.memberId})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">Bank Name:</span>
                  <span className="font-semibold text-gray-800">{payTarget.bankName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">Account No:</span>
                  <span className="font-mono font-bold text-gray-900">{payTarget.bankAccountNumber || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">IFSC Code:</span>
                  <span className="font-mono text-gray-700">{payTarget.ifscCode || "—"}</span>
                </div>
                {payTarget.upiId && (
                  <div className="flex justify-between">
                    <span className="text-[#5f5e5e]">UPI ID:</span>
                    <span className="font-mono text-purple-700">{payTarget.upiId}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-[#1a1c1c]">Net Disbursal Amount:</span>
                  <strong className="font-mono text-base font-black text-[#006d36]">
                    ₹{payTarget.netAmount.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              {/* Reference / UTR input */}
              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1">
                  Bank Reference No / UTR / Remarks:
                </label>
                <input
                  type="text"
                  value={payRefNo}
                  onChange={(e) => setPayRefNo(e.target.value)}
                  placeholder="e.g. UTR123456789 or IMPS reference"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-[#1a1c1c] font-mono outline-hidden focus:border-[#006d36]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayTarget(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#5f5e5e] hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSinglePay}
                  disabled={processingId === payTarget.id}
                  className="px-5 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all disabled:opacity-50"
                >
                  {processingId === payTarget.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Confirm & Mark as Paid</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. CONFIRM BULK PAYOUT MODAL */}
        {showBulkPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-gray-100">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#006d36] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1a1c1c]">Bulk Payout Settlement</h3>
                  <span className="text-xs text-[#5f5e5e]">{selectedWeek?.label}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">Total Pending Members:</span>
                  <strong className="text-[#1a1c1c]">{summary.pendingCount} Associates</strong>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                  <span className="text-xs font-bold text-[#1a1c1c]">Total Net Disbursal:</span>
                  <strong className="font-mono text-lg font-black text-[#006d36]">
                    ₹{summary.totalPending.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1">
                  Bulk Batch Reference No / Remarks:
                </label>
                <input
                  type="text"
                  value={bulkRefNo}
                  onChange={(e) => setBulkRefNo(e.target.value)}
                  placeholder="e.g. BATCH_2026_W35_SETTLEMENT"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-[#1a1c1c] font-mono outline-hidden focus:border-[#006d36]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkPayModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#5f5e5e] hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBulkPay}
                  disabled={processingId === "BULK"}
                  className="px-5 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all disabled:opacity-50"
                >
                  {processingId === "BULK" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Approve & Settle All</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
