"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Eye,
  Check,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

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

const REJECTION_PRESETS = [
  "Document image is blurry or unreadable",
  "Name on document does not match account profile",
  "Incorrect document uploaded",
  "Document number does not match record",
  "Account number or IFSC not legible on cheque/passbook",
  "Expired or invalid document",
];

export default function AdminKycMasterPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "VERIFIED" | "REJECTED" | "ALL">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  // Preview Document Image Modal
  const [previewModal, setPreviewModal] = useState<{
    memberId: string;
    fullName: string;
    docTitle: string;
    docUrl: string;
    section?: "aadhaar" | "pan" | "bank";
    currentStatus?: string;
  } | null>(null);

  // Reject Modal
  const [rejectModal, setRejectModal] = useState<{
    memberId: string;
    fullName: string;
    section?: "aadhaar" | "pan" | "bank";
    sectionLabel: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  const loadKyc = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/kyc");
      const data = await res.json();
      if (data.success && data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error("Error loading KYC:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchKyc = async () => {
      try {
        const res = await fetch("/api/admin/kyc");
        const data = await res.json();
        if (isMounted && data.success && data.submissions) {
          setSubmissions(data.submissions);
        }
      } catch (err) {
        console.error("Error loading KYC:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };
    fetchKyc();
    return () => {
      isMounted = false;
    };
  }, []);

  const pendingCount = useMemo(
    () => submissions.filter((k) => k.kycStatus === "PENDING").length,
    [submissions]
  );
  const verifiedCount = useMemo(
    () => submissions.filter((k) => k.kycStatus === "VERIFIED").length,
    [submissions]
  );
  const rejectedCount = useMemo(
    () => submissions.filter((k) => k.kycStatus === "REJECTED").length,
    [submissions]
  );

  const displayedSubmissions = useMemo(() => {
    return submissions.filter((k) => {
      const matchStatus = statusFilter === "ALL" || k.kycStatus === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        k.memberId.toLowerCase().includes(q) ||
        k.fullName.toLowerCase().includes(q) ||
        (k.panNumber && k.panNumber.toLowerCase().includes(q)) ||
        (k.aadhaarNumber && k.aadhaarNumber.includes(q)) ||
        (k.mobile && k.mobile.includes(q));
      return matchStatus && matchSearch;
    });
  }, [submissions, statusFilter, searchQuery]);

  const handleApproveDocument = async (
    memberId: string,
    fullName: string,
    section?: "aadhaar" | "pan" | "bank"
  ) => {
    const scopeMsg = section
      ? `${section === "aadhaar" ? "Aadhaar Card" : section === "pan" ? "PAN Card" : "Bank & Cheque"} document`
      : "all KYC documents";
    if (!confirm(`Are you sure you want to approve ${scopeMsg} for ${fullName} (${memberId})?`)) {
      return;
    }

    const key = `${memberId}_${section || "all"}`;
    setProcessingKey(key);

    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          status: "VERIFIED",
          section,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (previewModal) setPreviewModal(null);
        await loadKyc();
      } else {
        alert(data.message || "Failed to approve KYC");
      }
    } catch {
      alert("Error approving KYC");
    } finally {
      setProcessingKey(null);
    }
  };

  const openRejectModal = (
    memberId: string,
    fullName: string,
    section?: "aadhaar" | "pan" | "bank",
    sectionLabel?: string
  ) => {
    const label =
      sectionLabel ||
      (section === "aadhaar"
        ? "Aadhaar Card"
        : section === "pan"
        ? "PAN Card"
        : section === "bank"
        ? "Bank & Cheque"
        : "Entire KYC");
    setRejectModal({
      memberId,
      fullName,
      section,
      sectionLabel: label,
    });
    setRejectReason("");
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal) return;
    if (!rejectReason.trim()) {
      alert("Please provide or select a rejection reason.");
      return;
    }

    setSubmittingReject(true);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: rejectModal.memberId,
          status: "REJECTED",
          reason: rejectReason.trim(),
          section: rejectModal.section,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRejectModal(null);
        setRejectReason("");
        if (previewModal) setPreviewModal(null);
        await loadKyc();
      } else {
        alert(data.message || "Failed to reject document");
      }
    } catch {
      alert("Error rejecting KYC document");
    } finally {
      setSubmittingReject(false);
    }
  };

  const getVerifiedSectionsCount = (sub: KycSubmission) => {
    let count = 0;
    if (sub.aadhaarStatus === "VERIFIED") count++;
    if (sub.panStatus === "VERIFIED") count++;
    if (sub.bankStatus === "VERIFIED") count++;
    return count;
  };

  const renderSectionBadge = (status?: string, reason?: string) => {
    if (status === "VERIFIED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-100 text-[#006d36] border border-emerald-300">
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>VERIFIED</span>
        </span>
      );
    }
    if (status === "REJECTED") {
      return (
        <div className="inline-flex flex-col">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-red-100 text-red-700 border border-red-300 w-fit">
            <XCircle className="w-2.5 h-2.5" />
            <span>REJECTED</span>
          </span>
          {reason && (
            <span className="text-[9px] text-red-600 font-semibold mt-0.5 line-clamp-1" title={reason}>
              {reason}
            </span>
          )}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
        <Clock className="w-2.5 h-2.5" />
        <span>PENDING</span>
      </span>
    );
  };

  return (
    <AdminLayout onRefresh={loadKyc} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono text-[10px] font-black uppercase tracking-wider">
                Verification Desk
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Member Manager • 2. KYC Master
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Individual KYC Document Verification Desk
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Verify Aadhaar, PAN Card, and Bank Cheque individually or in bulk. Once all 3 documents are approved, the associate&apos;s KYC is automatically marked fully verified.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center min-w-[90px]">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Pending</span>
              <span className="text-xl font-black font-mono text-amber-900">{pendingCount}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[90px]">
              <span className="text-[10px] font-bold text-[#006d36] uppercase block">Verified</span>
              <span className="text-xl font-black font-mono text-[#006d36]">{verifiedCount}</span>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-center min-w-[90px]">
              <span className="text-[10px] font-bold text-red-800 uppercase block">Rejected</span>
              <span className="text-xl font-black font-mono text-red-900">{rejectedCount}</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e2e2]">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <button
                type="button"
                onClick={() => setStatusFilter("PENDING")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "PENDING"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                <span>Pending</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    statusFilter === "PENDING"
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {pendingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("VERIFIED")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "VERIFIED"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                <span>Verified</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    statusFilter === "VERIFIED"
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-[#5f5e5e]"
                  }`}
                >
                  {verifiedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("REJECTED")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "REJECTED"
                    ? "bg-red-700 text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-red-700"
                }`}
              >
                <span>Rejected</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    statusFilter === "REJECTED"
                      ? "bg-white/20 text-white"
                      : "bg-red-100 text-red-900"
                  }`}
                >
                  {rejectedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                All ({submissions.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Member ID, Name, PAN, Aadhaar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-2 pl-10 pr-4 text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f9f9f9] border-b border-[#e2e2e2] text-[#5f5e5e] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-3">Sr No</th>
                  <th className="py-3.5 px-3">Associate</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Aadhaar Verification</th>
                  <th className="py-3.5 px-4 min-w-[190px]">PAN Verification</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Bank / Cheque Verification</th>
                  <th className="py-3.5 px-3 min-w-[140px]">Overall Status</th>
                  <th className="py-3.5 px-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading KYC submissions...</span>
                    </td>
                  </tr>
                ) : displayedSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#5f5e5e]">
                      No KYC applications found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  displayedSubmissions.map((sub, idx) => {
                    const verifiedSections = getVerifiedSectionsCount(sub);
                    const isAllVerified = verifiedSections === 3;
                    const aadhaarBusy = processingKey === `${sub.memberId}_aadhaar`;
                    const panBusy = processingKey === `${sub.memberId}_pan`;
                    const bankBusy = processingKey === `${sub.memberId}_bank`;
                    const allBusy = processingKey === `${sub.memberId}_all`;

                    return (
                      <tr key={sub.id} className="hover:bg-emerald-50/30 transition-colors align-top">
                        <td className="py-4 px-3 font-mono font-bold text-[#5f5e5e]">{idx + 1}</td>

                        {/* Associate Info */}
                        <td className="py-4 px-3">
                          <span className="font-bold text-sm text-[#1a1c1c] block">
                            {sub.fullName}
                          </span>
                          <span className="font-mono text-[11px] text-[#006d36] font-bold block">
                            {sub.memberId}
                          </span>
                          <span className="font-mono text-[10px] text-[#5f5e5e] block">
                            📱 {sub.mobile}
                          </span>
                          {sub.kycSubmittedAt && (
                            <span className="text-[9px] text-[#888] block mt-1">
                              Submitted: {new Date(sub.kycSubmittedAt).toLocaleDateString()}
                            </span>
                          )}
                        </td>

                        {/* 1. Aadhaar Card Column with Individual Verification */}
                        <td className="py-4 px-4 bg-emerald-50/20">
                          <div className="space-y-1.5">
                            <div>
                              <span className="font-bold text-[#1a1c1c] block">
                                {sub.aadhaarName || sub.fullName}
                              </span>
                              <span className="font-mono text-[11px] text-[#5f5e5e] block">
                                {sub.aadhaarNumber ? `No: ${sub.aadhaarNumber}` : "No Number"}
                              </span>
                            </div>

                            {/* Images */}
                            <div className="flex flex-wrap items-center gap-1">
                              {sub.aadhaarFrontUrl && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewModal({
                                      memberId: sub.memberId,
                                      fullName: sub.fullName,
                                      docTitle: "Aadhaar Front Photo",
                                      docUrl: sub.aadhaarFrontUrl!,
                                      section: "aadhaar",
                                      currentStatus: sub.aadhaarStatus,
                                    })
                                  }
                                  className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-[#006d36] rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-2.5 h-2.5" />
                                  <span>Front</span>
                                </button>
                              )}
                              {sub.aadhaarBackUrl && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewModal({
                                      memberId: sub.memberId,
                                      fullName: sub.fullName,
                                      docTitle: "Aadhaar Back Photo",
                                      docUrl: sub.aadhaarBackUrl!,
                                      section: "aadhaar",
                                      currentStatus: sub.aadhaarStatus,
                                    })
                                  }
                                  className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-[#006d36] rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-2.5 h-2.5" />
                                  <span>Back</span>
                                </button>
                              )}
                              {!sub.aadhaarFrontUrl && !sub.aadhaarBackUrl && (
                                <span className="text-[10px] text-gray-400 italic">No image</span>
                              )}
                            </div>

                            {/* Status */}
                            <div>{renderSectionBadge(sub.aadhaarStatus, sub.aadhaarRejectionReason)}</div>

                            {/* Individual Action Buttons for Aadhaar */}
                            <div className="flex items-center gap-1 pt-1">
                              {sub.aadhaarStatus !== "VERIFIED" ? (
                                <button
                                  type="button"
                                  disabled={aadhaarBusy}
                                  onClick={() =>
                                    handleApproveDocument(sub.memberId, sub.fullName, "aadhaar")
                                  }
                                  className="px-2 py-1 bg-[#006d36] hover:bg-[#005025] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  {aadhaarBusy ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Check className="w-2.5 h-2.5" />
                                  )}
                                  <span>Verify</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-[#006d36] font-bold">✓ Approved</span>
                              )}

                              {sub.aadhaarStatus !== "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openRejectModal(
                                      sub.memberId,
                                      sub.fullName,
                                      "aadhaar",
                                      "Aadhaar Card"
                                    )
                                  }
                                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="w-2.5 h-2.5" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. PAN Card Column with Individual Verification */}
                        <td className="py-4 px-4 bg-blue-50/20">
                          <div className="space-y-1.5">
                            <div>
                              <span className="font-mono font-bold text-sm text-[#1a1c1c] block">
                                {sub.panNumber || "—"}
                              </span>
                            </div>

                            {/* Image */}
                            <div>
                              {sub.panCardUrl ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewModal({
                                      memberId: sub.memberId,
                                      fullName: sub.fullName,
                                      docTitle: "PAN Card Photo",
                                      docUrl: sub.panCardUrl!,
                                      section: "pan",
                                      currentStatus: sub.panStatus,
                                    })
                                  }
                                  className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-2.5 h-2.5" />
                                  <span>PAN Card</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">No image</span>
                              )}
                            </div>

                            {/* Status */}
                            <div>{renderSectionBadge(sub.panStatus, sub.panRejectionReason)}</div>

                            {/* Individual Action Buttons for PAN */}
                            <div className="flex items-center gap-1 pt-1">
                              {sub.panStatus !== "VERIFIED" ? (
                                <button
                                  type="button"
                                  disabled={panBusy}
                                  onClick={() =>
                                    handleApproveDocument(sub.memberId, sub.fullName, "pan")
                                  }
                                  className="px-2 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  {panBusy ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Check className="w-2.5 h-2.5" />
                                  )}
                                  <span>Verify</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-blue-700 font-bold">✓ Approved</span>
                              )}

                              {sub.panStatus !== "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openRejectModal(
                                      sub.memberId,
                                      sub.fullName,
                                      "pan",
                                      "PAN Card"
                                    )
                                  }
                                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="w-2.5 h-2.5" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. Bank / Cheque Column with Individual Verification */}
                        <td className="py-4 px-4 bg-purple-50/20">
                          <div className="space-y-1.5">
                            <div className="font-mono text-[11px]">
                              <span className="font-bold text-[#1a1c1c] block">
                                {sub.bankName || "—"}
                              </span>
                              <span className="text-[#5f5e5e] block">
                                A/C: {sub.bankAccountNumber || "—"}
                              </span>
                              <span className="text-[#5f5e5e] block">
                                IFSC: {sub.ifscCode || "—"}
                              </span>
                            </div>

                            {/* Image */}
                            <div>
                              {sub.bankProofUrl ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewModal({
                                      memberId: sub.memberId,
                                      fullName: sub.fullName,
                                      docTitle: "Cancelled Cheque / Passbook",
                                      docUrl: sub.bankProofUrl!,
                                      section: "bank",
                                      currentStatus: sub.bankStatus,
                                    })
                                  }
                                  className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-2.5 h-2.5" />
                                  <span>Cheque / Passbook</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">No image</span>
                              )}
                            </div>

                            {/* Status */}
                            <div>{renderSectionBadge(sub.bankStatus, sub.bankRejectionReason)}</div>

                            {/* Individual Action Buttons for Bank */}
                            <div className="flex items-center gap-1 pt-1">
                              {sub.bankStatus !== "VERIFIED" ? (
                                <button
                                  type="button"
                                  disabled={bankBusy}
                                  onClick={() =>
                                    handleApproveDocument(sub.memberId, sub.fullName, "bank")
                                  }
                                  className="px-2 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  {bankBusy ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Check className="w-2.5 h-2.5" />
                                  )}
                                  <span>Verify</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-purple-700 font-bold">✓ Approved</span>
                              )}

                              {sub.bankStatus !== "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openRejectModal(
                                      sub.memberId,
                                      sub.fullName,
                                      "bank",
                                      "Bank Cheque"
                                    )
                                  }
                                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="w-2.5 h-2.5" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Overall Status & Progress */}
                        <td className="py-4 px-3">
                          <div className="space-y-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                sub.kycStatus === "VERIFIED"
                                  ? "bg-emerald-100 text-[#006d36] border-emerald-300"
                                  : sub.kycStatus === "REJECTED"
                                  ? "bg-red-100 text-red-700 border-red-300"
                                  : "bg-amber-100 text-amber-800 border-amber-300"
                              }`}
                            >
                              {sub.kycStatus === "VERIFIED" ? (
                                <CheckCircle2 className="w-3 h-3 text-[#006d36]" />
                              ) : sub.kycStatus === "REJECTED" ? (
                                <XCircle className="w-3 h-3 text-red-600" />
                              ) : (
                                <Clock className="w-3 h-3 text-amber-700" />
                              )}
                              <span>{sub.kycStatus}</span>
                            </span>

                            {/* Progress bar */}
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-[10px] font-bold text-[#5f5e5e]">
                                <span>Docs:</span>
                                <span className="font-mono">{verifiedSections}/3 Verified</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    isAllVerified
                                      ? "bg-[#006d36]"
                                      : verifiedSections > 0
                                      ? "bg-amber-500"
                                      : "bg-gray-300"
                                  }`}
                                  style={{ width: `${(verifiedSections / 3) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Quick Actions */}
                        <td className="py-4 px-3 text-right whitespace-nowrap">
                          {!isAllVerified ? (
                            <div className="flex flex-col items-end gap-1.5">
                              <button
                                type="button"
                                disabled={allBusy}
                                onClick={() =>
                                  handleApproveDocument(sub.memberId, sub.fullName)
                                }
                                className="px-3 py-1.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-[11px] font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              >
                                {allBusy && <Loader2 className="w-3 h-3 animate-spin" />}
                                <span>Approve All</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  openRejectModal(
                                    sub.memberId,
                                    sub.fullName,
                                    undefined,
                                    "All KYC Documents"
                                  )
                                }
                                className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold cursor-pointer"
                              >
                                Reject All
                              </button>
                            </div>
                          ) : (
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006d36]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Completed</span>
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  openRejectModal(
                                    sub.memberId,
                                    sub.fullName,
                                    undefined,
                                    "All KYC Documents"
                                  )
                                }
                                className="block text-[10px] text-red-600 hover:underline mt-1 font-semibold cursor-pointer"
                              >
                                Revoke / Reject
                              </button>
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

      {/* Document Image Preview Modal with Direct Verification Actions */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-emerald-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div>
                <h3 className="font-black text-base text-[#1a1c1c]">{previewModal.docTitle}</h3>
                <span className="text-[11px] font-mono text-[#006d36] font-bold">
                  Associate: {previewModal.fullName} ({previewModal.memberId})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 border border-[#e2e2e2] rounded-2xl flex items-center justify-center bg-[#f9f9f9] max-h-[55vh] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewModal.docUrl}
                alt="Document Preview"
                className="max-h-[50vh] max-w-full rounded-xl object-contain shadow-xs"
              />
            </div>

            {/* Document Status in Modal */}
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="font-bold text-[#5f5e5e]">Document Status:</span>
              {renderSectionBadge(previewModal.currentStatus)}
            </div>

            {/* Modal Actions: Approve or Reject Right Here */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {previewModal.section && previewModal.currentStatus !== "VERIFIED" && (
                <button
                  type="button"
                  onClick={() =>
                    handleApproveDocument(
                      previewModal.memberId,
                      previewModal.fullName,
                      previewModal.section
                    )
                  }
                  className="py-2.5 px-3 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Verify This Document</span>
                </button>
              )}

              {previewModal.section && previewModal.currentStatus !== "REJECTED" && (
                <button
                  type="button"
                  onClick={() => {
                    const s = previewModal.section;
                    const mId = previewModal.memberId;
                    const fName = previewModal.fullName;
                    const title = previewModal.docTitle;
                    setPreviewModal(null);
                    openRejectModal(mId, fName, s, title);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject This Document</span>
                </button>
              )}

              <a
                href={previewModal.docUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl border border-[#e2e2e2] hover:bg-gray-100 text-center font-bold text-xs text-[#1a1c1c] flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Image</span>
              </a>

              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1a1c1c] font-bold text-xs cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Presets */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-red-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <h3 className="font-black text-base text-[#1a1c1c]">
                    Reject {rejectModal.sectionLabel}
                  </h3>
                  <span className="text-[11px] font-mono text-[#5f5e5e]">
                    Associate: {rejectModal.fullName} ({rejectModal.memberId})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Select common rejection reason:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {REJECTION_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectReason(preset)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer text-left ${
                        rejectReason === preset
                          ? "bg-red-600 text-white border-red-600 shadow-2xs"
                          : "bg-gray-50 hover:bg-red-50 text-[#1a1c1c] border-gray-200"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Or specify custom reason: *
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this document is rejected so the member can correct it..."
                  required
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 text-xs text-[#1a1c1c] font-medium outline-none focus:border-red-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal(null)}
                  className="w-full py-2.5 rounded-xl border border-[#e2e2e2] hover:bg-gray-100 text-center font-bold text-xs text-[#1a1c1c] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject || !rejectReason.trim()}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md shadow-red-600/20"
                >
                  {submittingReject ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
