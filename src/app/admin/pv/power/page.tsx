"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Award,
  ArrowRight,
  Zap,
  Network,
  Users,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface PowerMemberLookupData {
  id: string;
  memberId: string;
  fullName: string;
  mobile: string;
  status: string;
  personalPv: number;
  leftPv: number;
  rightPv: number;
  carryLeftPv: number;
  carryRightPv: number;
}

export default function PowerPvManagerPage() {
  const [memberIdInput, setMemberIdInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [member, setMember] = useState<PowerMemberLookupData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [selectedLeg, setSelectedLeg] = useState<"LEFT" | "RIGHT">("LEFT");
  const [pvAmount, setPvAmount] = useState<number | "">("");
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
      const res = await fetch(`/api/admin/pv/power?memberId=${encodeURIComponent(memberIdInput.trim())}`);
      const data = await res.json();
      if (data.success && data.member) {
        setMember(data.member);
      } else {
        setErrorMsg(data.message || "Associate member not found.");
      }
    } catch {
      setErrorMsg("Network error looking up member.");
    } finally {
      setSearching(false);
    }
  };

  const handleCreditPowerPv = async (e: React.FormEvent) => {
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
      const res = await fetch("/api/admin/pv/power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.memberId,
          leg: selectedLeg,
          pv: pvNum,
          note: note || `Admin Power PV Credit (${pvNum} PV into ${selectedLeg} Leg)`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Power PV credited and propagated successfully!");
        // Update local member state
        setMember((prev) =>
          prev
            ? {
                ...prev,
                leftPv: selectedLeg === "LEFT" ? prev.leftPv + pvNum : prev.leftPv,
                rightPv: selectedLeg === "RIGHT" ? prev.rightPv + pvNum : prev.rightPv,
                carryLeftPv: selectedLeg === "LEFT" ? prev.carryLeftPv + pvNum : prev.carryLeftPv,
                carryRightPv: selectedLeg === "RIGHT" ? prev.carryRightPv + pvNum : prev.carryRightPv,
              }
            : null
        );
        setPvAmount("");
        setNote("");
      } else {
        setErrorMsg(data.message || "Failed to credit Power PV.");
      }
    } catch {
      setErrorMsg("Network error submitting Power PV credit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#4f378a] to-[#6750a4] text-white shadow-xl shadow-[#4f378a]/15">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Network className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-200">
              Binary Tree Power Injection
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Power PV Leg Injection & Upline Propagation
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-2xl">
            Inject Power PV directly into an associate&apos;s Left or Right leg. The volume automatically passes up through all upline binary ancestors for 1:1 matching!
          </p>
        </div>

        {/* Step 1: Lookup Member Form */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-[#1a1c1c] flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-700" />
            <span>Step 1: Search Associate Member</span>
          </h2>

          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Associate Member ID (e.g. AV0001)..."
                value={memberIdInput}
                onChange={(e) => setMemberIdInput(e.target.value.toUpperCase())}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 font-mono font-bold text-sm text-[#1a1c1c] uppercase outline-hidden focus:border-purple-600 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !memberIdInput.trim()}
              className="px-6 py-3.5 rounded-2xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 shrink-0"
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

        {/* Step 2: Member Details & Power PV Injection Form */}
        {member && (
          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-sm space-y-6 animate-fadeIn">
            <h2 className="text-base font-bold text-[#1a1c1c] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-700" />
              <span>Step 2: Choose Leg & Enter Power PV</span>
            </h2>

            {/* Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-gray-50/80 border border-gray-200/80">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#5f5e5e] block">Associate Member</span>
                <span className="text-sm font-black text-[#1a1c1c]">{member.fullName}</span>
                <span className="text-[11px] font-mono font-bold text-[#006d36] block">{member.memberId}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-[#006d36] block">Current Left Leg PV</span>
                <span className="text-lg font-black font-mono text-[#006d36]">{member.leftPv} PV</span>
                <span className="text-[10px] text-[#5f5e5e] block">Carry: {member.carryLeftPv} PV</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-purple-700 block">Current Right Leg PV</span>
                <span className="text-lg font-black font-mono text-purple-700">{member.rightPv} PV</span>
                <span className="text-[10px] text-[#5f5e5e] block">Carry: {member.carryRightPv} PV</span>
              </div>
            </div>

            {/* Injection Form */}
            <form onSubmit={handleCreditPowerPv} className="space-y-6 pt-2">
              {/* Leg Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-2">
                  Select Target Placement Leg:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedLeg("LEFT")}
                    className={`p-4 rounded-2xl border-2 text-center font-bold transition-all cursor-pointer ${
                      selectedLeg === "LEFT"
                        ? "border-[#006d36] bg-emerald-50 text-[#006d36] shadow-xs"
                        : "border-gray-200 bg-white text-[#5f5e5e] hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-base font-black">LEFT LEG</div>
                    <div className="text-[11px] font-mono font-normal mt-0.5">Current: {member.leftPv} PV</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLeg("RIGHT")}
                    className={`p-4 rounded-2xl border-2 text-center font-bold transition-all cursor-pointer ${
                      selectedLeg === "RIGHT"
                        ? "border-purple-600 bg-purple-50 text-purple-700 shadow-xs"
                        : "border-gray-200 bg-white text-[#5f5e5e] hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-base font-black">RIGHT LEG</div>
                    <div className="text-[11px] font-mono font-normal mt-0.5">Current: {member.rightPv} PV</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                    Power PV Amount to Inject:
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 500, 1000, 2500 PV..."
                    value={pvAmount}
                    onChange={(e) => setPvAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-mono font-bold text-sm text-[#1a1c1c] outline-hidden focus:border-purple-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5">
                    Internal Note / Reason (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Team growth leg support, Leader campaign..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs text-[#1a1c1c] outline-hidden focus:border-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting || !pvAmount}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 to-[#4f378a] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>
                    {submitting
                      ? "Injecting & Propagating..."
                      : `Inject ${pvAmount || 0} PV into ${selectedLeg} Leg`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
