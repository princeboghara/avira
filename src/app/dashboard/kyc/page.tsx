"use client";

import React, { useEffect, useState } from "react";
import {
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Loader2,
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
      const res = await fetch("/api/member/kyc");
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
        const res = await fetch("/api/member/kyc");
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
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    folder: string = "kyc"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Document image must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      setter(base64Data); // Show immediate local preview

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64Data, folder }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setter(data.url);
        }
      } catch (err) {
        console.error("KYC Cloudinary upload failed:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/member/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaarName: aadhaarName.trim(),
          aadhaarNumber: aadhaarNumber.trim(),
          aadhaarFrontUrl,
          aadhaarBackUrl,
          panNumber: panNumber.trim().toUpperCase(),
          panCardUrl,
          bankName: bankName.trim(),
          bankAccountNumber: bankAccountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          bankProofUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("KYC documents submitted successfully for administrative review!");
        setTimeout(() => setSuccessMessage(""), 5000);
        await reloadKyc();
      } else {
        alert(data.message || "Failed to submit KYC.");
      }
    } catch {
      alert("Error submitting KYC documents.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (
    status?: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED",
    reason?: string
  ) => {
    if (status === "VERIFIED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-[#006d36] border border-emerald-300">
          <CheckCircle2 className="w-3 h-3" />
          <span>VERIFIED</span>
        </span>
      );
    }
    if (status === "REJECTED") {
      return (
        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-300">
            <XCircle className="w-3 h-3" />
            <span>REJECTED</span>
          </span>
          {reason && (
            <span className="text-[10px] text-red-600 font-bold block mt-0.5">
              Reason: {reason}
            </span>
          )}
        </div>
      );
    }
    if (status === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3 h-3" />
          <span>PENDING REVIEW</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-[#5f5e5e] border border-gray-300">
        <span>NOT SUBMITTED</span>
      </span>
    );
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#006d36]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-bold">Loading KYC Verification Desk...</span>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Regulatory Compliance
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Profile • 2. KYC Verification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Aadhaar, PAN & Bank KYC Verification
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Upload statutory identity documents and cancelled cheque/passbook to activate bank commission withdrawals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-[#5f5e5e] uppercase block">
                Overall KYC
              </span>
              <span className="text-xs font-black font-mono mt-0.5 block">
                {renderStatusBadge(
                  kyc?.kycStatus as "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED" | undefined
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#006d36] text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#006d36]" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitKyc} className="space-y-6">
          {/* ========================================================
              1. AADHAAR CARD SECTION
             ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-base font-black text-[#1a1c1c]">
                    Aadhaar Card Verification
                  </h2>
                  <span className="text-[11px] text-[#5f5e5e]">
                    Front & Back image proofs with full legal name.
                  </span>
                </div>
              </div>
              {renderStatusBadge(kyc?.aadhaarStatus, kyc?.aadhaarRejectionReason)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  Name as per Aadhaar *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar Patel"
                  value={aadhaarName}
                  onChange={(e) => setAadhaarName(e.target.value)}
                  required
                  disabled={kyc?.aadhaarStatus === "VERIFIED"}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  12-Digit Aadhaar Number *
                </label>
                <input
                  type="text"
                  maxLength={14}
                  placeholder="e.g. 1234 5678 9012"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  required
                  disabled={kyc?.aadhaarStatus === "VERIFIED"}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-mono font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36] disabled:opacity-60"
                />
              </div>
            </div>

            {/* Aadhaar Upload Buttons (Front & Back) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Front */}
              <div className="p-4 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] space-y-2 text-xs">
                <span className="font-bold text-[#1a1c1c] block">
                  Aadhaar Card Front Photo *
                </span>
                <label className="px-4 py-2 bg-white hover:bg-emerald-50 text-[#006d36] border border-[#e2e2e2] rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-2xs w-fit">
                  <Upload className="w-4 h-4" />
                  <span>Upload Front Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setAadhaarFrontUrl, "kyc/aadhar")}
                    disabled={kyc?.aadhaarStatus === "VERIFIED"}
                    className="hidden"
                  />
                </label>
                {aadhaarFrontUrl && (
                  <div className="pt-1 flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aadhaarFrontUrl}
                      alt="Aadhaar Front"
                      className="w-16 h-12 object-cover rounded-lg border border-[#e2e2e2]"
                    />
                    <span className="text-[11px] text-[#006d36] font-bold">
                      ✓ Front photo attached
                    </span>
                  </div>
                )}
              </div>

              {/* Back */}
              <div className="p-4 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] space-y-2 text-xs">
                <span className="font-bold text-[#1a1c1c] block">
                  Aadhaar Card Back Photo *
                </span>
                <label className="px-4 py-2 bg-white hover:bg-emerald-50 text-[#006d36] border border-[#e2e2e2] rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-2xs w-fit">
                  <Upload className="w-4 h-4" />
                  <span>Upload Back Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setAadhaarBackUrl, "kyc/aadhar")}
                    disabled={kyc?.aadhaarStatus === "VERIFIED"}
                    className="hidden"
                  />
                </label>
                {aadhaarBackUrl && (
                  <div className="pt-1 flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aadhaarBackUrl}
                      alt="Aadhaar Back"
                      className="w-16 h-12 object-cover rounded-lg border border-[#e2e2e2]"
                    />
                    <span className="text-[11px] text-[#006d36] font-bold">
                      ✓ Back photo attached
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================
              2. PAN CARD SECTION
             ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-base font-black text-[#1a1c1c]">
                    PAN Card Verification
                  </h2>
                  <span className="text-[11px] text-[#5f5e5e]">
                    Mandatory for statutory TDS tax reporting and payouts.
                  </span>
                </div>
              </div>
              {renderStatusBadge(kyc?.panStatus, kyc?.panRejectionReason)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  10-Digit PAN Number *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. ABCDE1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  required
                  disabled={kyc?.panStatus === "VERIFIED"}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-mono font-bold text-xs text-[#1a1c1c] uppercase outline-none focus:border-[#006d36] disabled:opacity-60"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] space-y-2">
                <span className="font-bold text-[#1a1c1c] block">
                  PAN Card Photo *
                </span>
                <label className="px-4 py-2 bg-white hover:bg-emerald-50 text-[#006d36] border border-[#e2e2e2] rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-2xs w-fit">
                  <Upload className="w-4 h-4" />
                  <span>Upload PAN Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setPanCardUrl, "kyc/pan")}
                    disabled={kyc?.panStatus === "VERIFIED"}
                    className="hidden"
                  />
                </label>
                {panCardUrl && (
                  <div className="pt-1 flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={panCardUrl}
                      alt="PAN Preview"
                      className="w-16 h-12 object-cover rounded-lg border border-[#e2e2e2]"
                    />
                    <span className="text-[11px] text-[#006d36] font-bold">
                      ✓ PAN card attached
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================
              3. BANK DETAILS SECTION
             ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h2 className="text-base font-black text-[#1a1c1c]">
                    Bank Account & Payout Verification
                  </h2>
                  <span className="text-[11px] text-[#5f5e5e]">
                    Direct credit destination for matching binary commissions.
                  </span>
                </div>
              </div>
              {renderStatusBadge(kyc?.bankStatus, kyc?.bankRejectionReason)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  Bank Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India or HDFC"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  disabled={kyc?.bankStatus === "VERIFIED"}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  Account Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 000123456789"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  required
                  disabled={kyc?.bankStatus === "VERIFIED"}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-mono font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  maxLength={11}
                  placeholder="e.g. SBIN0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  required
                  disabled={kyc?.bankStatus === "VERIFIED"}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-mono font-bold text-xs text-[#1a1c1c] uppercase outline-none focus:border-[#006d36] disabled:opacity-60"
                />
              </div>
            </div>

            {/* Cancelled Cheque / Passbook Upload */}
            <div className="p-4 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] space-y-2 text-xs">
              <span className="font-bold text-[#1a1c1c] block">
                Cancelled Cheque or Bank Passbook First Page Photo *
              </span>
              <label className="px-4 py-2 bg-white hover:bg-emerald-50 text-[#006d36] border border-[#e2e2e2] rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-2xs w-fit">
                <Upload className="w-4 h-4" />
                <span>Upload Cheque / Passbook</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setBankProofUrl, "kyc/cheque")}
                  disabled={kyc?.bankStatus === "VERIFIED"}
                  className="hidden"
                />
              </label>
              {bankProofUrl && (
                <div className="pt-1 flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bankProofUrl}
                    alt="Bank Proof Preview"
                    className="w-16 h-12 object-cover rounded-lg border border-[#e2e2e2]"
                  />
                  <span className="text-[11px] text-[#006d36] font-bold">
                    ✓ Bank proof attached
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-4 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#006d36]/20 cursor-pointer disabled:opacity-60 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting KYC for Verification...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#50c878]" />
                  <span>Submit KYC Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MemberLayout>
  );
}
