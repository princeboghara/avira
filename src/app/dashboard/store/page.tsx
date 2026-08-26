"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Zap,
  ShoppingBag,
  UserCheck,
} from "lucide-react";
import { User } from "@/types";

const PACKAGES = [
  {
    id: "pkg_100",
    name: "100 PV Starter Kit",
    amount: 1000,
    pv: 100,
    capping: 1000,
    description: "Foundational Cellular Wellness Pack. Unlocks ₹1,000 daily matching limit.",
    tag: "100 PV • ₹1,000 / day Cap",
  },
  {
    id: "pkg_250",
    name: "250 PV Executive Kit",
    amount: 2500,
    pv: 250,
    capping: 2000,
    description: "Complete Nutritional & Skin Vitality Pack. Elevates daily cap to ₹2,000 / day.",
    tag: "250 PV • ₹2,000 / day Cap",
  },
  {
    id: "pkg_500",
    name: "500 PV Premium Leader Kit",
    amount: 5000,
    pv: 500,
    capping: 3000,
    description: "Comprehensive Wellness & Aromatherapy Collection. Upgrades cap to ₹3,000 / day.",
    tag: "500 PV • ₹3,000 / day Cap",
  },
  {
    id: "pkg_1000",
    name: "1000 PV Royal Elite Kit",
    amount: 10000,
    pv: 1000,
    capping: 5000,
    description: "Full Avira Lifestyle & Luxury Diffuser Suite. Maximum ₹5,000 / day capping.",
    tag: "1000 PV • ₹5,000 / day Cap",
  },
];

export default function StorePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Target Member for Activation
  const [targetMemberId, setTargetMemberId] = useState("");
  const [targetMemberName, setTargetMemberName] = useState<string | null>(null);
  const [targetMemberPv, setTargetMemberPv] = useState<number>(0);
  const [targetMemberCapping, setTargetMemberCapping] = useState<number>(0);
  const [isVerifyingMember, setIsVerifyingMember] = useState(false);
  const [memberError, setMemberError] = useState("");

  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Load current user
  const loadUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        if (!targetMemberId) {
          setTargetMemberId(data.user.memberId);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Live Member ID Verification & Name Fetch
  useEffect(() => {
    const cleanId = targetMemberId.trim().toUpperCase();
    if (!cleanId || cleanId.length < 3) {
      setTargetMemberName(null);
      setMemberError("");
      return;
    }

    const timer = setTimeout(async () => {
      setIsVerifyingMember(true);
      setMemberError("");
      try {
        const res = await fetch(`/api/sponsor/${cleanId}`);
        const data = await res.json();

        if (data.exists) {
          setTargetMemberName(data.fullName);
          setTargetMemberPv(data.personalPv || 0);
          setTargetMemberCapping(data.dailyCapping || 0);
        } else {
          setTargetMemberName(null);
          setMemberError(`Member ID "${cleanId}" not found in Avira network.`);
        }
      } catch {
        setTargetMemberName(null);
        setMemberError("Error verifying Member ID.");
      } finally {
        setIsVerifyingMember(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [targetMemberId]);

  const handlePurchase = async (pkg: (typeof PACKAGES)[0]) => {
    const cleanId = targetMemberId.trim().toUpperCase();

    if (!cleanId || !targetMemberName) {
      alert("Please enter a valid Member ID before activating package.");
      return;
    }

    setBuyingId(pkg.id);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/products/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: cleanId,
          packageName: pkg.name,
          amount: pkg.amount,
          pv: pkg.pv,
          purchaseType: "ACTIVATION",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message);
        // Refresh target member stats
        setTargetMemberPv((prev) => prev + pkg.pv);
        const newCap =
          targetMemberPv + pkg.pv >= 1000
            ? 5000
            : targetMemberPv + pkg.pv >= 500
            ? 3000
            : targetMemberPv + pkg.pv >= 250
            ? 2000
            : 1000;
        setTargetMemberCapping(newCap);
        await loadUser(); // Reload logged-in stats
      } else {
        alert(data.message || "Activation failed.");
      }
    } catch {
      alert("Network error processing activation.");
    } finally {
      setBuyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#006d36] mb-3" />
        <span className="text-sm font-bold text-[#006d36]">Loading Activation Store...</span>
      </div>
    );
  }

  const isTargetActive = targetMemberPv >= 100;

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans selection:bg-[#50c878] selection:text-[#005025]">
      {/* Top Header */}
      <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-[#e2e2e2] sticky top-0 z-40 px-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-[#e2e2e2] hover:bg-[#f9f9f9] text-[#5f5e5e] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[#1a1c1c]">Member Package Activation</h1>
            <span className="text-xs text-[#5f5e5e]">
              Instant Real-Time 1:1 Binary Volume Distribution • 1 PV = ₹1
            </span>
          </div>
        </div>

        {/* Current Associate Details */}
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-[#1a1c1c] block">
                {currentUser.fullName} ({currentUser.memberId})
              </span>
              <span className="text-[10px] text-[#5f5e5e]">
                Wallet: <strong className="text-[#006d36]">₹{currentUser.walletBalance.toLocaleString()}</strong>
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#006d36] flex items-center justify-center font-bold text-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
        )}
      </header>

      {/* Main Activation Section */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Step 1: Member ID Input with Live Name Fetch */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006d36] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1a1c1c]">
                Select Member to Activate Package
              </h2>
              <p className="text-xs text-[#5f5e5e]">
                Type your own Member ID or any downline associate ID. The system automatically fetches their name and current status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label
                htmlFor="targetMemberInput"
                className="block text-xs font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5"
              >
                Member ID (AVxxxxx) *
              </label>
              <div className="relative">
                <input
                  id="targetMemberInput"
                  type="text"
                  placeholder="e.g. AV00001 or AV95608"
                  value={targetMemberId}
                  onChange={(e) => setTargetMemberId(e.target.value.toUpperCase())}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-3 pl-4 pr-10 text-sm font-mono font-black text-[#1a1c1c] focus:border-[#006d36] focus:ring-1 focus:ring-[#006d36] outline-none"
                />
                <div className="absolute right-3 top-3">
                  {isVerifyingMember && <Loader2 className="w-5 h-5 text-[#006d36] animate-spin" />}
                  {!isVerifyingMember && targetMemberName && (
                    <CheckCircle2 className="w-5 h-5 text-[#006d36]" />
                  )}
                  {!isVerifyingMember && memberError && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              {memberError && (
                <p className="text-xs text-red-600 font-semibold mt-1.5">{memberError}</p>
              )}
            </div>

            {/* Target Member Verified Status Card */}
            <div>
              <label className="block text-xs font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                Verified Associate Profile
              </label>
              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  targetMemberName
                    ? isTargetActive
                      ? "bg-emerald-50/70 border-emerald-300"
                      : "bg-red-50/70 border-red-200"
                    : "bg-[#f9f9f9] border-[#e2e2e2] text-[#5f5e5e]"
                }`}
              >
                {targetMemberName ? (
                  <>
                    <div>
                      <span className="font-extrabold text-sm text-[#1a1c1c] block">
                        {targetMemberName}
                      </span>
                      <span className="text-[11px] text-[#5f5e5e]">
                        Current PV: <strong className="text-[#006d36]">{targetMemberPv} PV</strong> •{" "}
                        Daily Cap:{" "}
                        <strong className={isTargetActive ? "text-[#006d36]" : "text-red-600"}>
                          ₹{targetMemberCapping.toLocaleString()} / day
                        </strong>
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        isTargetActive
                          ? "bg-emerald-100 text-[#006d36] border-emerald-300"
                          : "bg-red-100 text-red-700 border-red-300"
                      }`}
                    >
                      {isTargetActive ? "ACTIVE (Green)" : "INACTIVE (Red / <100 PV)"}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-[#5f5e5e] italic py-2">
                    Enter Member ID on the left to verify account...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-[#006d36] flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Step 2: Available Activation Packages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#1a1c1c]">Available Activation Packages</h2>
              <p className="text-xs text-[#5f5e5e]">
                Select package to add PV. Minimum 100 PV turns ID Active (Green) and unlocks ₹1,000 daily capping limit.
              </p>
            </div>
            <span className="text-xs font-bold text-[#006d36] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              1 PV = ₹1
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PACKAGES.map((pkg) => {
              const isBuying = buyingId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-3xl p-6 border border-[#e2e2e2] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group hover:border-[#006d36]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-[#006d36] px-2.5 py-1 rounded-full border border-emerald-200">
                        {pkg.tag}
                      </span>
                      <span className="text-xs font-mono font-black text-[#006d36]">
                        {pkg.pv} PV
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-[#1a1c1c]">{pkg.name}</h3>
                      <p className="text-xs text-[#5f5e5e] mt-1 leading-relaxed">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="p-3 bg-[#f9f9f9] rounded-xl border border-[#e2e2e2] space-y-1">
                      <div className="text-[10px] text-[#5f5e5e] uppercase tracking-wider font-bold">
                        Unlocks Daily Binary Limit
                      </div>
                      <div className="text-base font-mono font-black text-[#006d36]">
                        ₹{pkg.capping.toLocaleString()} / day
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#e2e2e2] space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#5f5e5e]">Amount</span>
                      <span className="text-2xl font-mono font-black text-[#1a1c1c]">
                        ₹{pkg.amount.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePurchase(pkg)}
                      disabled={isBuying || !targetMemberName}
                      className="w-full py-3 px-4 bg-[#006d36] hover:bg-[#005025] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBuying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Activating & Matching PV...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-white" />
                          <span>
                            Activate for {targetMemberName ? targetMemberId : "Selected Member"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-Time Binary Rules Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-[#1a1c1c]">
            Real-Time Automatic 1:1 Binary Matching Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#5f5e5e] leading-relaxed">
            <div className="p-4 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <strong className="text-[#1a1c1c] block text-sm mb-1">
                1. Below 100 PV = Red (0 Capping)
              </strong>
              Any associate ID with under 100 PV is displayed in RED with ₹0 daily capping. To earn binary bonuses, an ID must activate with at least 100 PV.
            </div>
            <div className="p-4 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <strong className="text-[#1a1c1c] block text-sm mb-1">
                2. Instant Automatic Matching
              </strong>
              No manual button click needed! As soon as PV is activated, it propagates up the binary tree and immediately pays 1:1 matching bonuses to every qualified ancestor.
            </div>
            <div className="p-4 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <strong className="text-[#1a1c1c] block text-sm mb-1">
                3. Stronger Leg Carry Forward
              </strong>
              Remaining volume in the stronger leg carries forward indefinitely for future matching cycles!
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
