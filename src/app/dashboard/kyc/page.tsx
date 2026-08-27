"use client";

import React, { useEffect, useState } from "react";
import {
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Loader2,
  FileCheck,
  AlertCircle,
  Check,
  Sparkles,
} from "lucide-react";
import MemberLayout from "@/components/dashboard/MemberLayout";

interface KycData {
  memberId: string;
  fullName: string;
  mobile: string;
  aadhaarName: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  aadhaarStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
  aadhaarRejectionReason: string;
  panNumber: string;
  panCardUrl: string;
  panStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
  panRejectionReason: string;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankProofUrl: string;
  bankStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
  bankRejectionReason: string;
  kycStatus: string;
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;
}

export default function MemberKycVerificationPage() {
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form State
  const [aadhaarName, setAadhaarName] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState("");
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState("");

  const [panNumber, setPanNumber] = useState("");
  const [panCardUrl, setPanCardUrl] = useState("");

  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankProofUrl, setBankProofUrl] = useState("");

  const reloadKyc = async () => {
    try {
      const res = await fetch("/api/member/kyc", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.kyc) {
        setKyc(data.kyc);
      }
    } catch (err) {
      console.error("Error reloading KYC data:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchKyc = async () => {
      try {
        const res = await fetch("/api/member/kyc", { cache: "no-store" });
        const data = await res.json();
        if (isMounted && data.success && data.kyc) {
          setKyc(data.kyc);
          setAadhaarName(data.kyc.aadhaarName || data.kyc.fullName || "");
          setAadhaarNumber(data.kyc.aadhaarNumber || "");
          setAadhaarFrontUrl(data.kyc.aadhaarFrontUrl || "");
          setAadhaarBackUrl(data.kyc.aadhaarBackUrl || "");

          setPanNumber(data.kyc.panNumber || "");
          setPanCardUrl(data.kyc.panCardUrl || "");

          setBankName(data.kyc.bankName || "");
          setBankAccountNumber(data.kyc.bankAccountNumber || "");
          setIfscCode(data.kyc.ifscCode || "");
          setBankProofUrl(data.kyc.bankProofUrl || "");
        }
      } catch (err) {
        console.error("Error loading KYC data:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchKyc();
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64Data, folder: "kyc" }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setter(data.url);
        } else {
          setter(base64Data);
        }
      } catch {
        setter(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSection = async (section: "aadhaar" | "pan" | "bank") => {
    setSubmitting(true);
    setSuccessMessage("");

    const payload: any = { section };
    if (section === "aadhaar") {
      payload.aadhaarName = aadhaarName;
      payload.aadhaarNumber = aadhaarNumber;
      payload.aadhaarFrontUrl = aadhaarFrontUrl;
      payload.aadhaarBackUrl = aadhaarBackUrl;
    } else if (section === "pan") {
      payload.panNumber = panNumber;
      payload.panCardUrl = panCardUrl;
    } else if (section === "bank") {
      payload.bankName = bankName;
      payload.bankAccountNumber = bankAccountNumber;
      payload.ifscCode = ifscCode;
      payload.bankProofUrl = bankProofUrl;
    }

    try {
      const res = await fetch("/api/member/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Successfully submitted ${section.toUpperCase()} details for approval.`);
        await reloadKyc();
      } else {
        alert(data.message || "Failed to save KYC section.");
      }
    } catch {
      alert("Network error submitting KYC.");
    } finally {
      setSubmitting(false);
    }
  };

  // Progress Calculation
  const isAadhaarVerified = kyc?.aadhaarStatus === "VERIFIED";
  const isPanVerified = kyc?.panStatus === "VERIFIED";
  const isBankVerified = kyc?.bankStatus === "VERIFIED";

  const verifiedCount = (isAadhaarVerified ? 1 : 0) + (isPanVerified ? 1 : 0) + (isBankVerified ? 1 : 0);
  const progressPercent = Math.round((verifiedCount / 3) * 100);
  const isFullyVerified = verifiedCount === 3;

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#006d36]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-bold font-mono">Loading KYC Verification Credentials...</span>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* ========================================================
            1. TOP HEADER & ROUND PROGRESS BAR GAUGE
           ======================================================== */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#006d36] via-[#005a2c] to-[#4f378a] text-white shadow-xl shadow-[#006d36]/15 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-bold font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Government Compliance & Payout Gate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              KYC Identity Verification
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Complete your government identity verification to unlock direct bank withdrawals and full commission payouts.
            </p>
          </div>

          {/* CIRCULAR / ROUND PROGRESS BAR */}
          <div className="flex flex-col items-center gap-2 shrink-0 bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20">
            {isFullyVerified ? (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-[#50c878] text-white flex flex-col items-center justify-center shadow-lg border-4 border-white animate-bounce">
                <CheckCircle2 className="w-9 h-9 text-white" />
                <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">100% Verified</span>
              </div>
            ) : (
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* SVG Circular Ring */}
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-white/20"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-[#50c878] transition-all duration-700"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={2 * Math.PI * 38 - (2 * Math.PI * 38 * progressPercent) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-mono font-black text-lg text-white">{progressPercent}%</span>
                  <span className="text-[9px] font-bold uppercase text-emerald-200">{verifiedCount}/3 Done</span>
                </div>
              </div>
            )}
            <span className="text-[11px] font-bold text-emerald-100">
              {isFullyVerified ? "All Documents Approved" : "Verification in Progress"}
            </span>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#006d36] text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ========================================================
            2. THREE GRANULAR KYC SECTIONS
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SECTION 1: AADHAAR CARD */}
          <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="font-bold text-sm text-[#1a1c1c]">Aadhaar Card</h2>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    kyc?.aadhaarStatus === "VERIFIED"
                      ? "bg-emerald-100 text-[#006d36]"
                      : kyc?.aadhaarStatus === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {kyc?.aadhaarStatus || "PENDING"}
                </span>
              </div>

              {kyc?.aadhaarRejectionReason && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-[11px] font-medium border border-red-200">
                  <strong>Reason:</strong> {kyc.aadhaarRejectionReason}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#5f5e5e] mb-1">
                    Name on Aadhaar:
                  </label>
                  <input
                    type="text"
                    disabled={isAadhaarVerified}
                    value={aadhaarName}
                    onChange={(e) => setAadhaarName(e.target.value)}
                    placeholder="Full name as on Aadhaar"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-medium text-[#1a1c1c] outline-hidden focus:border-[#006d36] disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5f5e5e] mb-1">
                    12-digit Aadhaar Number:
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    disabled={isAadhaarVerified}
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 font-mono font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] disabled:bg-gray-100"
                  />
                </div>

                {/* Front & Back Images */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-[#5f5e5e] mb-1">Front Image:</label>
                    {aadhaarFrontUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 h-20 bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={aadhaarFrontUrl} alt="Aadhaar Front" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <label className="h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#006d36] flex flex-col items-center justify-center cursor-pointer bg-gray-50/50">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-[9px] text-[#5f5e5e] mt-1 font-bold">Upload Front</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setAadhaarFrontUrl)} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#5f5e5e] mb-1">Back Image:</label>
                    {aadhaarBackUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 h-20 bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={aadhaarBackUrl} alt="Aadhaar Back" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <label className="h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#006d36] flex flex-col items-center justify-center cursor-pointer bg-gray-50/50">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-[9px] text-[#5f5e5e] mt-1 font-bold">Upload Back</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setAadhaarBackUrl)} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {!isAadhaarVerified && (
              <button
                type="button"
                onClick={() => handleSaveSection("aadhaar")}
                disabled={submitting || !aadhaarNumber || !aadhaarFrontUrl}
                className="w-full py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs cursor-pointer disabled:opacity-50 transition-all"
              >
                {submitting ? "Saving..." : "Submit Aadhaar"}
              </button>
            )}
          </div>

          {/* SECTION 2: PAN CARD */}
          <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h2 className="font-bold text-sm text-[#1a1c1c]">PAN Card</h2>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    kyc?.panStatus === "VERIFIED"
                      ? "bg-emerald-100 text-[#006d36]"
                      : kyc?.panStatus === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {kyc?.panStatus || "PENDING"}
                </span>
              </div>

              {kyc?.panRejectionReason && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-[11px] font-medium border border-red-200">
                  <strong>Reason:</strong> {kyc.panRejectionReason}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#5f5e5e] mb-1">
                    10-digit PAN Number:
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    disabled={isPanVerified}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 font-mono font-bold text-xs uppercase text-[#1a1c1c] outline-hidden focus:border-[#006d36] disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#5f5e5e] mb-1">PAN Photo Proof:</label>
                  {panCardUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 h-28 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={panCardUrl} alt="PAN Card" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <label className="h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-600 flex flex-col items-center justify-center cursor-pointer bg-gray-50/50">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-[10px] text-[#5f5e5e] mt-1 font-bold">Upload PAN Photo</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setPanCardUrl)} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {!isPanVerified && (
              <button
                type="button"
                onClick={() => handleSaveSection("pan")}
                disabled={submitting || !panNumber || !panCardUrl}
                className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer disabled:opacity-50 transition-all"
              >
                {submitting ? "Saving..." : "Submit PAN"}
              </button>
            )}
          </div>

          {/* SECTION 3: BANK DETAILS & CHEQUE */}
          <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h2 className="font-bold text-sm text-[#1a1c1c]">Bank Account</h2>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    kyc?.bankStatus === "VERIFIED"
                      ? "bg-emerald-100 text-[#006d36]"
                      : kyc?.bankStatus === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {kyc?.bankStatus || "PENDING"}
                </span>
              </div>

              {kyc?.bankRejectionReason && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-[11px] font-medium border border-red-200">
                  <strong>Reason:</strong> {kyc.bankRejectionReason}
                </div>
              )}

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#5f5e5e] mb-0.5">Bank Name:</label>
                  <input
                    type="text"
                    disabled={isBankVerified}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank, SBI"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-1.5 px-3 text-xs font-medium text-[#1a1c1c] outline-hidden focus:border-[#006d36] disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5f5e5e] mb-0.5">Account Number:</label>
                  <input
                    type="text"
                    disabled={isBankVerified}
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Bank Account Number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-1.5 px-3 font-mono font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5f5e5e] mb-0.5">IFSC Code:</label>
                  <input
                    type="text"
                    disabled={isBankVerified}
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0001234"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-1.5 px-3 font-mono font-bold text-xs uppercase text-[#1a1c1c] outline-hidden focus:border-[#006d36] disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#5f5e5e] mb-1">Cheque / Passbook Image:</label>
                  {bankProofUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 h-20 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bankProofUrl} alt="Bank Proof" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <label className="h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-600 flex flex-col items-center justify-center cursor-pointer bg-gray-50/50">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-[9px] text-[#5f5e5e] mt-0.5 font-bold">Upload Passbook / Cheque</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setBankProofUrl)} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {!isBankVerified && (
              <button
                type="button"
                onClick={() => handleSaveSection("bank")}
                disabled={submitting || !bankAccountNumber || !ifscCode || !bankProofUrl}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50 transition-all"
              >
                {submitting ? "Saving..." : "Submit Bank"}
              </button>
            )}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
