"use client";

import React, { useState, useEffect } from "react";
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
  Layers,
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

interface PowerPvHistoryItem {
  id: number;
  memberId: string;
  fullName: string;
  pv: number;
  leg: string;
  mode: string;
  note: string;
  createdAt: string;
}

export default function PowerPvManagerPage() {
  const [memberIdInput, setMemberIdInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [member, setMember] = useState<PowerMemberLookupData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [selectedLeg, setSelectedLeg] = useState<"LEFT" | "RIGHT">("LEFT");
  const [propagateUpline, setPropagateUpline] = useState<boolean>(true);
  const [pvAmount, setPvAmount] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // History State
  const [history, setHistory] = useState<PowerPvHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/pv/power?history=true");
      const data = await res.json();
      if (data.success && data.history) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Load Power PV history error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

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
          propagateUpline,
          note: note || `Admin Power PV Credit (${pvNum} PV into ${selectedLeg} Leg - ${propagateUpline ? "With Upline Flow" : "Member Only"})`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Power PV credited successfully!");
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
        await loadHistory();
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
    <AdminLayout onRefresh={loadHistory} refreshing={loadingHistory}>
      <div className="space-y-6 max-w-5xl mx-auto pb-12 font-[Arial,sans-serif]">
        {/* Neumorphic Header Card */}
        <div className="neo-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neo-inset text-[#006d36] text-xs font-bold font-mono border border-emerald-200/50">
              <Network className="w-4 h-4" />
              <span>Binary Tree Power Injection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
              Power PV Leg Injection & Manager
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] max-w-xl font-medium">
              Inject Power PV directly into an associate&apos;s Left or Right leg with Member Only allocation or full tree upline binary propagation.
            </p>
          </div>
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
              {/* 2-Option Distribution Mode Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Power PV Distribution Mode:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Option 1: Member Only */}
                  <div
                    onClick={() => setPropagateUpline(false)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      !propagateUpline
                        ? "bg-purple-50/70 border-purple-700 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 opacity-75"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border-2 shrink-0 ${
                        !propagateUpline ? "border-purple-700 bg-purple-700 text-white" : "border-slate-300 bg-white"
                      }`}
                    >
                      {!propagateUpline && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block flex items-center gap-1.5">
                        <span>Member Only</span>
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5 leading-snug">
                        Injects Power PV directly into the selected leg of this associate only. No upline matching calculation.
                      </span>
                    </div>
                  </div>

                  {/* Option 2: Full Tree */}
                  <div
                    onClick={() => setPropagateUpline(true)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      propagateUpline
                        ? "bg-purple-50/70 border-purple-700 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 opacity-75"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border-2 shrink-0 ${
                        propagateUpline ? "border-purple-700 bg-purple-700 text-white" : "border-slate-300 bg-white"
                      }`}
                    >
                      {propagateUpline && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block flex items-center gap-1.5">
                        <span>Full Tree</span>
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5 leading-snug">
                        Injects Power PV into this associate leg and propagates volume upward through all upline binary placement parents.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
                      ? "Processing Injection..."
                      : `Inject ${pvAmount || 0} PV into ${selectedLeg} Leg`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transfer History Table */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1a1c1c] flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-700" />
              <span>Power PV Transfer History</span>
            </h2>
            <span className="text-xs text-gray-500 font-mono">
              Total Transfers: <strong>{history.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Associate Name</th>
                  <th className="py-3 px-4 text-center">Target Leg</th>
                  <th className="py-3 px-4 text-center">PV Injected</th>
                  <th className="py-3 px-4 text-center">Distribution Mode</th>
                  <th className="py-3 px-4">Note / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-[#1a1c1c]">
                {loadingHistory ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-purple-700">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1" />
                      <span>Loading transfer history...</span>
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No Power PV transfers recorded yet.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">
                        {item.memberId}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#1a1c1c]">
                        {item.fullName}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`font-black font-mono text-[10px] px-2 py-0.5 rounded-md ${
                            item.leg === "LEFT"
                              ? "bg-emerald-100 text-[#006d36]"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.leg} LEG
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          +{item.pv} PV
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                            item.mode === "FULL_TREE"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {item.mode === "FULL_TREE" ? "Full Tree" : "Member Only"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {item.note || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
