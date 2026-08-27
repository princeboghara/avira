"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Eye,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Check,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import DataTable, { Column } from "@/components/ui/DataTable";

interface KycSubmission {
  id: string;
  memberId: string;
  fullName: string;
  mobile: string;
  email?: string;
  // Aadhaar
  aadhaarName?: string;
  aadhaarNumber?: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  aadhaarStatus?: string;
  aadhaarRejectionReason?: string;
  // PAN
  panNumber?: string;
  panCardUrl?: string;
  panStatus?: string;
  panRejectionReason?: string;
  // Bank
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankProofUrl?: string;
  bankStatus?: string;
  bankRejectionReason?: string;
  // Overall
  kycDocumentUrl?: string;
  kycStatus: string;
  kycSubmittedAt: string;
  kycVerifiedAt?: string;
  kycRejectionReason?: string;
}

export default function AdminKycMasterPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  // Active Review Modal for single member
  const [reviewMember, setReviewMember] = useState<KycSubmission | null>(null);

  // Reject Dialog
  const [rejectDialog, setRejectDialog] = useState<{
    section?: "aadhaar" | "pan" | "bank" | "overall";
    sectionName: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadKyc = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/kyc");
      const data = await res.json();
      if (data.success && data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error("Error loading KYC submissions:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadKyc();
  }, []);

  const handleUpdateStatus = async (
    memberId: string,
    section: "aadhaar" | "pan" | "bank" | "overall",
    status: "VERIFIED" | "REJECTED",
    reason?: string
  ) => {
    const key = `${memberId}_${section}_${status}`;
    setProcessingKey(key);

    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          status,
          section: section === "overall" ? undefined : section,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Refresh local lists
        await loadKyc();
        if (reviewMember && reviewMember.memberId === memberId) {
          setReviewMember((prev) => {
            if (!prev) return null;
            if (section === "aadhaar") return { ...prev, aadhaarStatus: status };
            if (section === "pan") return { ...prev, panStatus: status };
            if (section === "bank") return { ...prev, bankStatus: status };
            return { ...prev, kycStatus: status, aadhaarStatus: status, panStatus: status, bankStatus: status };
          });
        }
      } else {
        alert(data.message || "Failed to update KYC status.");
      }
    } catch {
      alert("Network error updating KYC status.");
    } finally {
      setProcessingKey(null);
      setRejectDialog(null);
      setRejectReason("");
    }
  };

  const columns: Column<KycSubmission>[] = [
    {
      header: "Member ID",
      accessorKey: "memberId",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#006d36]">
          {row.memberId}
        </span>
      ),
    },
    {
      header: "Associate Name",
      accessorKey: "fullName",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-[#1a1c1c]">{row.fullName}</div>
          <div className="font-mono text-[10px] text-[#5f5e5e]">{row.mobile}</div>
        </div>
      ),
    },
    {
      header: "Aadhaar",
      accessorKey: "aadhaarStatus",
      sortable: true,
      align: "center",
      cell: (row) => {
        const s = row.aadhaarStatus || "PENDING";
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              s === "VERIFIED"
                ? "bg-emerald-100 text-[#006d36]"
                : s === "REJECTED"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {s}
          </span>
        );
      },
    },
    {
      header: "PAN Card",
      accessorKey: "panStatus",
      sortable: true,
      align: "center",
      cell: (row) => {
        const s = row.panStatus || "PENDING";
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              s === "VERIFIED"
                ? "bg-emerald-100 text-[#006d36]"
                : s === "REJECTED"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {s}
          </span>
        );
      },
    },
    {
      header: "Bank Proof",
      accessorKey: "bankStatus",
      sortable: true,
      align: "center",
      cell: (row) => {
        const s = row.bankStatus || "PENDING";
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              s === "VERIFIED"
                ? "bg-emerald-100 text-[#006d36]"
                : s === "REJECTED"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {s}
          </span>
        );
      },
    },
    {
      header: "Overall Status",
      accessorKey: "kycStatus",
      sortable: true,
      align: "center",
      cell: (row) => {
        const s = row.kycStatus || "PENDING";
        return (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
              s === "VERIFIED"
                ? "bg-emerald-100 text-[#006d36] border border-emerald-300"
                : s === "REJECTED"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-amber-100 text-amber-800 border border-amber-300"
            }`}
          >
            {s}
          </span>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      sortable: false,
      cell: (row) => (
        <button
          type="button"
          onClick={() => setReviewMember(row)}
          className="px-3.5 py-1.5 rounded-xl bg-[#006d36] text-white hover:bg-[#005025] text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Review Documents</span>
        </button>
      ),
    },
  ];

  return (
    <AdminLayout onRefresh={loadKyc} refreshing={refreshing}>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#006d36] via-[#005a2c] to-[#4f378a] text-white shadow-xl shadow-[#006d36]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-bold font-mono">
              <FileCheck className="w-4 h-4" />
              <span>Identity Verification & Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              KYC Master Verification
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Inspect government identity credentials (Aadhaar, PAN, Bank Passbook) and verify or reject submissions with granular feedback.
            </p>
          </div>
        </div>

        {/* DataTable */}
        {loading ? (
          <div className="py-16 text-center text-[#006d36] flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">Loading KYC Submissions...</span>
          </div>
        ) : (
          <DataTable
            data={submissions}
            columns={columns}
            keyExtractor={(item) => item.id || item.memberId}
            searchPlaceholder="Search by ID, Name, Mobile, PAN, Aadhaar..."
            searchableKeys={["memberId", "fullName", "mobile", "panNumber", "aadhaarNumber", "bankAccountNumber"]}
            initialPageSize={10}
            title="KYC Submissions Queue"
            emptyMessage="No KYC submissions found."
          />
        )}

        {/* COMPREHENSIVE KYC REVIEW MODAL */}
        {reviewMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-fadeIn overflow-hidden">
            {/* Click outside backdrop to close */}
            <div className="absolute inset-0" onClick={() => setReviewMember(null)} />

            {/* Modal Dialog Card */}
            <div className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden z-10">
              {/* Sticky Modal Header */}
              <div className="p-4 sm:p-5 bg-white border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-[#006d36]">
                      {reviewMember.memberId}
                    </span>
                    <span className="text-xs font-bold text-[#1a1c1c]">{reviewMember.fullName}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-[#1a1c1c]">
                    KYC Document Verification Review
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setReviewMember(null)}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 font-bold text-xs shadow-2xs"
                  title="Close KYC Review"
                >
                  <X className="w-5 h-5 text-current" />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">

              {/* 3 DOCUMENT CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. AADHAAR CARD */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs uppercase text-[#1a1c1c] tracking-wider">
                        1. Aadhaar Card
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          reviewMember.aadhaarStatus === "VERIFIED"
                            ? "bg-emerald-100 text-[#006d36]"
                            : reviewMember.aadhaarStatus === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {reviewMember.aadhaarStatus || "PENDING"}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-[#5f5e5e] text-[11px] block">Name on Aadhaar:</span>
                        <strong className="text-[#1a1c1c]">{reviewMember.aadhaarName || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[#5f5e5e] text-[11px] block">Aadhaar Number:</span>
                        <strong className="font-mono text-[#006d36]">{reviewMember.aadhaarNumber || "—"}</strong>
                      </div>
                    </div>

                    {/* Image Previews */}
                    <div className="space-y-2 pt-2">
                      {reviewMember.aadhaarFrontUrl ? (
                        <a
                          href={reviewMember.aadhaarFrontUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block group relative rounded-xl overflow-hidden border border-gray-300"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={reviewMember.aadhaarFrontUrl}
                            alt="Aadhaar Front"
                            className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Front</span>
                          </div>
                        </a>
                      ) : (
                        <div className="h-20 bg-gray-200/60 rounded-xl flex items-center justify-center text-[10px] text-gray-500">
                          No Front Uploaded
                        </div>
                      )}

                      {reviewMember.aadhaarBackUrl && (
                        <a
                          href={reviewMember.aadhaarBackUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block group relative rounded-xl overflow-hidden border border-gray-300"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={reviewMember.aadhaarBackUrl}
                            alt="Aadhaar Back"
                            className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Back</span>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Section Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(reviewMember.memberId, "aadhaar", "VERIFIED")}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectDialog({ section: "aadhaar", sectionName: "Aadhaar Card" })}
                      className="flex-1 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {/* 2. PAN CARD */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs uppercase text-[#1a1c1c] tracking-wider">
                        2. PAN Card
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          reviewMember.panStatus === "VERIFIED"
                            ? "bg-emerald-100 text-[#006d36]"
                            : reviewMember.panStatus === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {reviewMember.panStatus || "PENDING"}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-[#5f5e5e] text-[11px] block">PAN Number:</span>
                        <strong className="font-mono text-[#006d36] text-sm uppercase">{reviewMember.panNumber || "—"}</strong>
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="pt-2">
                      {reviewMember.panCardUrl ? (
                        <a
                          href={reviewMember.panCardUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block group relative rounded-xl overflow-hidden border border-gray-300"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={reviewMember.panCardUrl}
                            alt="PAN Card"
                            className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View PAN</span>
                          </div>
                        </a>
                      ) : (
                        <div className="h-36 bg-gray-200/60 rounded-xl flex items-center justify-center text-[10px] text-gray-500">
                          No PAN Uploaded
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(reviewMember.memberId, "pan", "VERIFIED")}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectDialog({ section: "pan", sectionName: "PAN Card" })}
                      className="flex-1 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {/* 3. BANK CHEQUE / PASSBOOK */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs uppercase text-[#1a1c1c] tracking-wider">
                        3. Bank Cheque / Passbook
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          reviewMember.bankStatus === "VERIFIED"
                            ? "bg-emerald-100 text-[#006d36]"
                            : reviewMember.bankStatus === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {reviewMember.bankStatus || "PENDING"}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-[#5f5e5e] text-[10px] block">Bank Name:</span>
                        <strong className="text-[#1a1c1c] text-xs">{reviewMember.bankName || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[#5f5e5e] text-[10px] block">Account No:</span>
                        <strong className="font-mono text-[#006d36] text-xs">{reviewMember.bankAccountNumber || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[#5f5e5e] text-[10px] block">IFSC Code:</span>
                        <strong className="font-mono text-xs uppercase text-[#1a1c1c]">{reviewMember.ifscCode || "—"}</strong>
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="pt-1">
                      {reviewMember.bankProofUrl ? (
                        <a
                          href={reviewMember.bankProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block group relative rounded-xl overflow-hidden border border-gray-300"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={reviewMember.bankProofUrl}
                            alt="Bank Proof"
                            className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Proof</span>
                          </div>
                        </a>
                      ) : (
                        <div className="h-28 bg-gray-200/60 rounded-xl flex items-center justify-center text-[10px] text-gray-500">
                          No Bank Proof Uploaded
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(reviewMember.memberId, "bank", "VERIFIED")}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectDialog({ section: "bank", sectionName: "Bank Account" })}
                      className="flex-1 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
              </div>
              {/* END OF SCROLLABLE BODY */}

              {/* OVERALL ACTIONS STICKY FOOTER */}
              <div className="p-4 sm:px-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <span className="text-xs text-[#5f5e5e]">
                  Updating all sections will automatically set overall KYC to <strong>VERIFIED</strong>.
                </span>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setReviewMember(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer transition-colors active:scale-95"
                  >
                    Close Window
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(reviewMember.memberId, "overall", "VERIFIED")}
                    className="px-5 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify All Documents</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REJECT REASON DIALOG */}
        {rejectDialog && reviewMember && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="font-bold text-sm text-[#1a1c1c]">
                  Reject {rejectDialog.sectionName}
                </h3>
                <button
                  type="button"
                  onClick={() => setRejectDialog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1">
                  Reason for Rejection:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Document is blurry / Name mismatch on passbook..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-[#1a1c1c] outline-hidden focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectDialog(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#5f5e5e]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateStatus(
                      reviewMember.memberId,
                      rejectDialog.section || "overall",
                      "REJECTED",
                      rejectReason
                    )
                  }
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
