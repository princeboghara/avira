"use client";

import React, { useState } from "react";
import {
  Zap,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Award,
  ArrowRight,
  TrendingUp,
  User as UserIcon,
  Layers,
  Network,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface MemberLookupData {
  id: string;
  memberId: string;
  fullName: string;
  mobile: string;
  status: string;
  personalPv: number;
  dailyCapping: number;
  walletBalance: number;
  rank: string;
  joinedDate: string;
}

export default function SelfPvManagerPage() {
  const [memberIdInput, setMemberIdInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [member, setMember] = useState<MemberLookupData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [pvAmount, setPvAmount] = useState<number | "">("");
  const [propagateUpline, setPropagateUpline] = useState<boolean>(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberIdInput.trim()) return;

    setSearching(true);
    setErrorMsg("");
    setSuccessMsg("");
    setMember(null);

    try {
      const res = await fetch(`/api/admin/pv/self?memberId=${encodeURIComponent(memberIdInput.trim())}`);
      const data = await res.json();
      if (data.success && data.member) {
        setMember(data.member);
      } else {
        setErrorMsg(data.message || "Member not found.");
      }
    } catch {
      setErrorMsg("Network error looking up member.");
    } finally {
      setSearching(false);
    }
  };

  const handleCreditSelfPv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    const pvNum = Number(pvAmount);
    if (!pvNum || pvNum <= 0) {
      setErrorMsg("Please enter a valid PV amount greater than 0.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/pv/self", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.memberId,
          pv: pvNum,
          propagateUpline,
          note: note || `Admin Self PV Credit (${pvNum} PV - ${propagateUpline ? "With Upline Flow" : "Member Only"})`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Self PV credited successfully!");
        // Update local member state
        setMember((prev) =>
          prev
            ? {
                ...prev,
                personalPv: data.data.newPersonalPv,
                dailyCapping: data.data.newCapping,
                status: data.data.newPersonalPv >= 100 ? "ACTIVE" : "INACTIVE",
              }
            : null
        );
        setPvAmount("");
        setNote("");
      } else {
        setErrorMsg(data.message || "Failed to credit Self PV.");
      }
    } catch {
      setErrorMsg("Network error submitting Self PV credit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-12 font-[Arial,sans-serif]">
        {/* Header */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#006d36] to-[#50c878] text-white shadow-xl shadow-[#006d36]/15">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-100">
              PV Manager Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Self PV Credit & Activation Manager
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl">
            Search any associate by ID, view their current Personal Volume & Rank, and credit Self PV directly to their personal account with optional Upline tree propagation.
          </p>
        </div>

        {/* Step 1: Lookup Member Form */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-[#1a1c1c] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#006d36]" />
            <span>Step 1: Search Associate Member</span>
          </h2>

          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Associate Member ID (e.g. AV0001)..."
                value={memberIdInput}
                onChange={(e) => setMemberIdInput(e.target.value.toUpperCase())}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-mono font-bold text-sm text-[#1a1c1c] uppercase outline-hidden focus:border-[#006d36] focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !memberIdInput.trim()}
              className="px-6 py-3.5 rounded-2xl bg-[#006d36] text-white font-bold text-xs hover:bg-[#005025] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 shrink-0"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{searching ? "Searching..." : "Lookup Associate"}</span>
            </button>
          </form>

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
        </div>

        {/* Step 2: Member Details & Credit PV Form */}
        {member && (
          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-sm space-y-6 animate-fadeIn">
            <h2 className="text-base font-bold text-[#1a1c1c] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#006d36]" />
              <span>Step 2: Associate Details & Credit PV</span>
            </h2>

            {/* Member Snapshot Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-gray-50/80 border border-gray-200/80">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#5f5e5e] block">Associate Name</span>
                <span className="text-sm font-black text-[#1a1c1c]">{member.fullName}</span>
                <span className="text-[11px] font-mono font-bold text-[#006d36] block">{member.memberId}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-[#5f5e5e] block">Current Personal PV</span>
                <span className="text-lg font-black font-mono text-[#006d36]">{member.personalPv} PV</span>
                <span className="text-[10px] text-[#5f5e5e] block">Status: {member.status}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-[#5f5e5e] block">Rank Tier</span>
                <span className="text-sm font-black text-purple-700">{member.rank}</span>
                <span className="text-[10px] text-[#5f5e5e] block">Cap: ₹{member.dailyCapping}/day</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-[#5f5e5e] block">Wallet Balance</span>
                <span className="text-lg font-black font-mono text-[#1a1c1c]">₹{member.walletBalance.toLocaleString("en-IN")}</span>
                <span className="text-[10px] text-[#5f5e5e] block">Active Account</span>
              </div>
            </div>

            {/* PV Form */}
            <form onSubmit={handleCreditSelfPv} className="space-y-5 pt-2">
              {/* 2-Option Distribution Mode Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  PV Distribution Mode / અપલાઇન કેલ્ક્યુલેશન ઓપ્શન:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Option 1: Member Only */}
                  <div
                    onClick={() => setPropagateUpline(false)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      !propagateUpline
                        ? "bg-emerald-50/70 border-[#006d36] shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 opacity-75"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border-2 shrink-0 ${
                        !propagateUpline ? "border-[#006d36] bg-[#006d36] text-white" : "border-slate-300 bg-white"
                      }`}
                    >
                      {!propagateUpline && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block flex items-center gap-1.5">
                        <span>1. માત્ર આ મેમ્બરમાં જ જમા થાય (Member Only)</span>
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5 leading-snug">
                        ખાસ આ ID નું Personal PV અને Capping વધશે. <strong>અપલાઇનમાં કોઈપણ PV કે મેચિંગ કેલ્ક્યુલેશન જશે નહીં.</strong>
                      </span>
                    </div>
                  </div>

                  {/* Option 2: With Upline Propagation */}
                  <div
                    onClick={() => setPropagateUpline(true)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      propagateUpline
                        ? "bg-emerald-50/70 border-[#006d36] shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 opacity-75"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border-2 shrink-0 ${
                        propagateUpline ? "border-[#006d36] bg-[#006d36] text-white" : "border-slate-300 bg-white"
                      }`}
                    >
                      {propagateUpline && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block flex items-center gap-1.5">
                        <span>2. અપલાઇન સાથે (Full Tree Propagation)</span>
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5 leading-snug">
                        મેમ્બરનું Personal PV પણ વધશે + <strong>તમામ ઉપરના Upline લીડર્સના Binary લેગમાં પણ PV કાઉન્ટ થઈને 1:1 મેચિંગ થશે.</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                    Enter PV Amount to Credit:
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 100, 250, 500, 1000 PV..."
                    value={pvAmount}
                    onChange={(e) => setPvAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-mono font-bold text-sm text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                  />
                  <span className="text-[11px] text-[#5f5e5e] mt-1 block">
                    100 PV = Silver • 250 PV = Gold • 500 PV = Platinum • 1000 PV = Diamond
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                    Internal Note / Reason (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special activation credit, Promotional bonus..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting || !pvAmount}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#006d36] to-[#50c878] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>{submitting ? "Processing Credit..." : `Credit ${pvAmount || 0} PV to ${member.fullName}`}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
