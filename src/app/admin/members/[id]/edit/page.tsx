"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  ShieldCheck,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  MapPin,
  Building,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface EditMemberPageProps {
  params: Promise<{ id: string }>;
}

export default function EditMemberDetailPage({ params }: EditMemberPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const targetId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Pincode auto-lookup loading state
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    memberId: "",
    sponsorId: "",
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    pincode: "",
    city: "",
    state: "",
    address: "",
    gstNumber: "",
    aadhaarName: "",
    aadhaarNumber: "",
    panNumber: "",
    bankName: "",
    bankAccountNumber: "",
    ifscCode: "",
    upiId: "",
    status: "ACTIVE",
    nomineeName: "",
    nomineeRelation: "",
  });

  useEffect(() => {
    async function loadMember() {
      try {
        const res = await fetch(`/api/admin/members/${encodeURIComponent(targetId)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success && data.member) {
          const found = data.member;
          setForm({
            memberId: found.memberId || "",
            sponsorId: found.sponsorId || "",
            fullName: found.fullName || "",
            mobile: found.mobile || "",
            email: found.email || "",
            password: "",
            pincode: found.pincode || "",
            city: found.city || "",
            state: found.state || "",
            address: found.address || "",
            gstNumber: found.gstNumber || "",
            aadhaarName: found.aadhaarName || "",
            aadhaarNumber: found.aadhaarNumber || "",
            panNumber: found.panNumber || "",
            bankName: found.bankName || "",
            bankAccountNumber: found.bankAccountNumber || "",
            ifscCode: found.ifscCode || "",
            upiId: found.upiId || "",
            status: found.status || "ACTIVE",
            nomineeName: found.nomineeName || "",
            nomineeRelation: found.nomineeRelation || "",
          });
        } else {
          setErrorMsg(data.message || "Member profile not found in master records.");
        }
      } catch (err) {
        console.error("Error loading member:", err);
        setErrorMsg("Failed to load member profile.");
      } finally {
        setLoading(false);
      }
    }

    loadMember();
  }, [targetId]);

  // Handle Pincode Auto Lookup
  const handlePincodeChange = async (pin: string) => {
    setForm((prev) => ({ ...prev, pincode: pin }));

    if (pin.length === 6 && /^\d+$/.test(pin)) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`/api/pincode/${pin}`);
        const data = await res.json();
        if (data.success && data.city && data.state) {
          setForm((prev) => ({
            ...prev,
            city: data.city,
            state: data.state,
          }));
        }
      } catch (err) {
        console.error("Pincode lookup error:", err);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/members/${encodeURIComponent(targetId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Associate member profile updated successfully!");
        setTimeout(() => {
          router.push("/admin/members");
        }, 1200);
      } else {
        setErrorMsg(data.message || "Failed to update member profile.");
      }
    } catch {
      setErrorMsg("Network error saving member profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-pulse">
          <div className="h-14 rounded-2xl bg-gray-200" />
          <div className="h-44 rounded-3xl bg-gray-200" />
          <div className="h-64 rounded-3xl bg-gray-200" />
          <div className="h-64 rounded-3xl bg-gray-200" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/members"
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-[#5f5e5e] hover:text-[#1a1c1c] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-[#006d36]">
                  {form.memberId}
                </span>
                <span className="text-xs text-[#5f5e5e]">Member Master</span>
              </div>
              <h1 className="text-2xl font-black text-[#1a1c1c] tracking-tight">
                Edit Associate Member Profile
              </h1>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#006d36] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* SECTION 1: ACCOUNT & REFERRAL IDENTITY */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-[#1a1c1c] flex items-center gap-2 pb-3 border-b border-gray-100">
              <UserIcon className="w-4 h-4 text-[#006d36]" />
              <span>1. Account Identity & Direct Referral Sponsor</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Member ID (System Key):
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={form.memberId}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl py-2.5 px-3 font-mono font-bold text-xs text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Direct Referral Sponsor ID:
                </label>
                <input
                  type="text"
                  value={form.sponsorId}
                  onChange={(e) => setForm({ ...form, sponsorId: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-mono font-bold text-xs text-[#1a1c1c] uppercase outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Account Status:
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Full Legal Name:
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-bold text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Mobile Number:
                </label>
                <input
                  type="tel"
                  required
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-mono text-xs font-bold text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Email Address:
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>
            </div>

            {/* Reset Password */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                Reset Member Password (Leave blank to keep existing password):
              </label>
              <div className="relative max-w-sm">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter new password..."
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ADDRESS & PINCODE (AUTO CITY/STATE) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-[#1a1c1c] flex items-center gap-2 pb-3 border-b border-gray-100">
              <MapPin className="w-4 h-4 text-[#006d36]" />
              <span>2. Address & Pincode Auto Location</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Pincode (Auto City & State):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-mono font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                  />
                  {pincodeLoading && (
                    <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-[#006d36]" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">City:</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-bold text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">State:</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-bold text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                Full Street Address:
              </label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
              />
            </div>
          </div>

          {/* SECTION 3: KYC & TAX (GST, PAN, AADHAAR, BANK) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-[#1a1c1c] flex items-center gap-2 pb-3 border-b border-gray-100">
              <CreditCard className="w-4 h-4 text-[#006d36]" />
              <span>3. KYC & GST Tax Master Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  GST Number:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24AAAAA0000A1Z5"
                  value={form.gstNumber}
                  onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-mono font-bold text-xs uppercase text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  PAN Number:
                </label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={form.panNumber}
                  onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-mono font-bold text-xs uppercase text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Aadhaar Number:
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="12 digit Aadhaar"
                  value={form.aadhaarNumber}
                  onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-mono font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Aadhaar Registered Name:
                </label>
                <input
                  type="text"
                  value={form.aadhaarName}
                  onChange={(e) => setForm({ ...form, aadhaarName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-bold text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Bank Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, SBI..."
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-bold text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  Bank Account Number:
                </label>
                <input
                  type="text"
                  value={form.bankAccountNumber}
                  onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-mono font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  IFSC Code:
                </label>
                <input
                  type="text"
                  value={form.ifscCode}
                  onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-mono font-bold text-xs uppercase text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                  UPI ID (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. user@okaxis"
                  value={form.upiId}
                  onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/members"
              className="px-5 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-[#5f5e5e]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save & Update Member</span>
            </button>
          </div>
        </form>

        {/* CONFIRMATION ALERT MODAL */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-3xs animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-[#1a1c1c]">
                  Confirm Member Profile Updates
                </h3>
                <p className="text-xs text-[#5f5e5e] leading-relaxed">
                  Are you sure you want to update the profile details for Associate{" "}
                  <strong className="text-[#006d36]">{form.fullName} ({form.memberId})</strong>?
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#5f5e5e] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="flex-1 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Yes, Update Member
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
