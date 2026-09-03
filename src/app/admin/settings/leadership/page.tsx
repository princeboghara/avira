"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Percent,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calculator,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Zap,
  Lock,
  Unlock,
  KeyRound,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminLeadershipSettingsPage() {
  const [level1, setLevel1] = useState<number>(15);
  const [level2, setLevel2] = useState<number>(5);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Lock State & Password
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [adminPassword, setAdminPassword] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Live Simulator State
  const [simPayout, setSimPayout] = useState<number>(10000);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await fetch("/api/admin/settings/leadership");
      const data = await res.json();
      if (data.success && data.settings) {
        setLevel1(data.settings.level1);
        setLevel2(data.settings.level2);
        setUpdatedAt(data.settings.updatedAt || null);
      } else {
        setErrorMessage(data.message || "Failed to load current settings.");
      }
    } catch {
      setErrorMessage("Network error fetching leadership settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setErrorMessage("Please enter the Admin Password to unlock and save changes.");
      return;
    }

    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/settings/leadership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level1, level2, adminPassword: adminPassword.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message);
        setIsLocked(true); // Re-lock after successful update for security
        setAdminPassword("");
        if (data.settings) {
          setLevel1(data.settings.level1);
          setLevel2(data.settings.level2);
          setUpdatedAt(data.settings.updatedAt || new Date().toISOString());
        }
      } else {
        setErrorMessage(data.message || "Failed to save settings.");
      }
    } catch {
      setErrorMessage("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (l1: number, l2: number) => {
    if (isLocked) return;
    setLevel1(l1);
    setLevel2(l2);
    setSuccessMessage("");
  };

  // Simulator calculations
  const simL1Bonus = Math.round((simPayout * (level1 / 100)) * 100) / 100;
  const simL2Bonus = Math.round((simPayout * (level2 / 100)) * 100) / 100;
  const simTotalBonus = Math.round((simL1Bonus + simL2Bonus) * 100) / 100;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn font-[Arial,sans-serif]">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                System Configuration
              </span>
              <span className="text-xs text-slate-500 font-medium">
                8. Compensation Plan Settings
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Leadership Supporting Bonus Setup</span>
              <Award className="w-6 h-6 text-amber-500" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Configure the dynamic reward percentages distributed to Level 1 and Level 2 Direct Sponsors whenever their Diamond downline members earn binary 1:1 matching payouts.
            </p>
          </div>

          {updatedAt && (
            <div className="text-right text-xs text-slate-400 font-mono">
              <span className="block text-[10px] uppercase font-bold text-slate-500">Last Modified</span>
              <span>{new Date(updatedAt).toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#006d36] text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Percentage Editor Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Configure Bonus Percentages
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set the percentage of the downline associate's binary payout credited to upline sponsors.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchSettings}
                disabled={loading || saving}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Reload from database"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#006d36]" />
                <span>Loading current plan settings...</span>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Security Lock Banner */}
                {isLocked ? (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-900 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <div className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <span>Percentages Locked for Security</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                        LOCKED
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      To prevent accidental or unauthorized modifications to compensation payout percentages, enter the <strong>Admin Password</strong> to unlock and edit these values.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 max-w-md pt-1">
                      <div className="relative flex-1">
                        <input
                          type="password"
                          placeholder="Enter Admin Password..."
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!adminPassword.trim()) {
                            setErrorMessage("Please enter the Admin Password to unlock editing.");
                            return;
                          }
                          setIsLocked(false);
                          setErrorMessage("");
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock to Edit</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#006d36] flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Unlock className="w-4 h-4" />
                      <span>Editing Unlocked with Admin Password</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLocked(true);
                        setAdminPassword("");
                      }}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 underline cursor-pointer"
                    >
                      Re-lock
                    </button>
                  </div>
                )}

                {/* Level 1 Direct Sponsor Percentage */}
                <div className={`p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3 ${isLocked ? "opacity-75 pointer-events-none select-none" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center shadow-2xs">
                        L1
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Level 1 Direct Sponsor Percentage
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          Credited directly to the immediate Diamond sponsor
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-black text-lg text-amber-900 bg-white px-3 py-1 rounded-xl border border-amber-300">
                      <span>{level1}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="0.5"
                      disabled={isLocked}
                      value={level1}
                      onChange={(e) => setLevel1(parseFloat(e.target.value) || 0)}
                      className="flex-1 accent-amber-600 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="w-24 relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        disabled={isLocked}
                        value={level1}
                        onChange={(e) => setLevel1(parseFloat(e.target.value) || 0)}
                        className="w-full text-center font-mono font-bold text-sm bg-white border border-amber-300 rounded-xl py-1.5 px-2 pr-6 outline-hidden disabled:bg-slate-100 disabled:text-slate-500"
                      />
                      <Percent className="w-3.5 h-3.5 text-amber-700 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Level 2 Sponsor Percentage */}
                <div className={`p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3 ${isLocked ? "opacity-75 pointer-events-none select-none" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-900 font-black text-xs flex items-center justify-center shadow-2xs">
                        L2
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Level 2 Upline Sponsor Percentage
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          Credited to the 2nd generation Diamond upline sponsor
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-black text-lg text-blue-900 bg-white px-3 py-1 rounded-xl border border-blue-300">
                      <span>{level2}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="0.5"
                      disabled={isLocked}
                      value={level2}
                      onChange={(e) => setLevel2(parseFloat(e.target.value) || 0)}
                      className="flex-1 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="w-24 relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        disabled={isLocked}
                        value={level2}
                        onChange={(e) => setLevel2(parseFloat(e.target.value) || 0)}
                        className="w-full text-center font-mono font-bold text-sm bg-white border border-blue-300 rounded-xl py-1.5 px-2 pr-6 outline-hidden disabled:bg-slate-100 disabled:text-slate-500"
                      />
                      <Percent className="w-3.5 h-3.5 text-blue-700 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className={`space-y-2 pt-2 ${isLocked ? "opacity-60 pointer-events-none select-none" : ""}`}>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Quick Preset Configurations:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => applyPreset(15, 5)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      Default (15% / 5%)
                    </button>
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => applyPreset(10, 5)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      Conservative (10% / 5%)
                    </button>
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => applyPreset(20, 10)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      Aggressive (20% / 10%)
                    </button>
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => applyPreset(0, 0)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-mono text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      Disable (0% / 0%)
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <span className="text-[11px] text-slate-400 font-medium">
                    ⚡ Changes apply instantly to all subsequent binary payouts.
                  </span>
                  <button
                    type="submit"
                    disabled={saving || isLocked}
                    className="px-6 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating System...</span>
                      </>
                    ) : isLocked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Unlock to Save</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Percentages</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Live Simulator & Rule Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Distribution Simulator */}
            <div className="bg-gradient-to-br from-[#022814] via-[#04331b] to-[#01170b] rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-[#022814]/15 border border-emerald-900/40 space-y-5">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">
                    Live Calculation Preview
                  </h3>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-white/10 text-emerald-300">
                  Simulation
                </span>
              </div>

              {/* Slider for test binary payout */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-200/80 font-medium">Downline Binary Payout:</span>
                  <span className="font-mono font-black text-white text-sm">
                    ₹{simPayout.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="500"
                  value={simPayout}
                  onChange={(e) => setSimPayout(parseFloat(e.target.value) || 1000)}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Breakdown Cards */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between">
                  <div>
                    <span className="text-amber-300 font-bold block text-[11px]">Level 1 Direct Sponsor ({level1}%)</span>
                    <span className="text-[10px] text-white/70">1st generation sponsor</span>
                  </div>
                  <strong className="text-base text-amber-300 font-black">
                    ₹{simL1Bonus.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between">
                  <div>
                    <span className="text-blue-300 font-bold block text-[11px]">Level 2 Upline Sponsor ({level2}%)</span>
                    <span className="text-[10px] text-white/70">2nd generation sponsor</span>
                  </div>
                  <strong className="text-base text-blue-300 font-black">
                    ₹{simL2Bonus.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-between text-white">
                  <div>
                    <span className="font-black text-xs block text-emerald-200">Total Leadership Outflow</span>
                    <span className="text-[10px] text-emerald-300/80 font-sans">Combined ({level1 + level2}%)</span>
                  </div>
                  <strong className="text-lg text-emerald-300 font-black">
                    ₹{simTotalBonus.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>

            {/* Plan Rules Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#006d36]" />
                <span>Eligibility & Compliance Rules</span>
              </h4>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                <li>
                  <strong>Diamond Rank Requirement:</strong> Sponsoring associates must maintain <strong>1,000+ Personal PV (Diamond Rank)</strong> to qualify for Leadership Supporting Bonuses.
                </li>
                <li>
                  <strong>Direct Sponsorship:</strong> Level 1 is awarded only to the direct sponsor of the earner. Level 2 is awarded to the direct sponsor of the Level 1 sponsor.
                </li>
                <li>
                  <strong>Real-Time Credit:</strong> Bonus amounts are computed and credited to wallets in real-time immediately when matching volume triggers.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
