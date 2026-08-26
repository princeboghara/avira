"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle2, ShieldCheck, Zap, ShoppingBag } from "lucide-react";
import { User } from "@/types";

const PACKAGES = [
  {
    id: "pkg_100",
    name: "100 PV Starter Kit",
    amount: 1000,
    pv: 100,
    capping: 1000,
    description: "Foundational Cellular Wellness Pack. Unlocks ₹1,000 daily matching limit.",
    tag: "Essential",
  },
  {
    id: "pkg_250",
    name: "250 PV Executive Kit",
    amount: 2500,
    pv: 250,
    capping: 2000,
    description: "Complete Nutritional & Skin Vitality Pack. Elevates daily cap to ₹2,000 / day.",
    tag: "Popular",
  },
  {
    id: "pkg_500",
    name: "500 PV Premium Leader Kit",
    amount: 5000,
    pv: 500,
    capping: 3000,
    description: "Comprehensive Wellness & Aromatherapy Collection. Upgrades cap to ₹3,000 / day.",
    tag: "Leader Choice",
  },
  {
    id: "pkg_1000",
    name: "1000 PV Royal Elite Kit",
    amount: 10000,
    pv: 1000,
    capping: 5000,
    description: "Full Avira Lifestyle & Luxury Diffuser Suite. Maximum ₹5,000 / day capping.",
    tag: "Maximum Cap",
  },
];

export default function StorePage() {
  const [user, setUser] = useState<User | null>(null);
  const [purchaseType, setPurchaseType] = useState<"ACTIVATION" | "REPURCHASE">("ACTIVATION");
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.user.personalPv > 0) {
          setPurchaseType("REPURCHASE");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handlePurchase = async (pkg: typeof PACKAGES[0]) => {
    if (!user) return;
    setBuyingId(pkg.id);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/products/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: user.memberId,
          packageName: pkg.name,
          amount: pkg.amount,
          pv: pkg.pv,
          purchaseType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message);
        await loadUser(); // Reload user stats and PV
      } else {
        alert(data.message || "Purchase failed.");
      }
    } catch {
      alert("Network error processing order.");
    } finally {
      setBuyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#006d36] mb-3" />
        <span className="text-sm font-bold text-[#006d36]">Loading Avira Store...</span>
      </div>
    );
  }

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
            <h1 className="text-xl font-black text-[#1a1c1c]">Avira Package Store</h1>
            <span className="text-xs text-[#5f5e5e]">
              Activation & Repurchase • 1 PV = ₹1
            </span>
          </div>
        </div>

        {/* Member Status Card */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-[#1a1c1c] block">
                Self Volume: <strong className="text-[#006d36]">{user.personalPv} PV</strong>
              </span>
              <span className="text-[10px] text-[#5f5e5e]">
                Current Cap: <strong>₹{user.dailyCapping.toLocaleString()} / day</strong>
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#006d36] flex items-center justify-center font-bold text-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
        )}
      </header>

      {/* Main Store Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Toggle Mode: Activation vs Repurchase */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#e2e2e2] shadow-sm">
          <div>
            <h2 className="text-lg font-extrabold text-[#1a1c1c]">Choose Purchase Objective</h2>
            <p className="text-xs text-[#5f5e5e]">
              {purchaseType === "ACTIVATION"
                ? "First-time purchase to activate your binary ID & establish daily capping."
                : "Repeat purchase to accumulate repurchase volume and advance your network."}
            </p>
          </div>

          <div className="flex items-center p-1 bg-[#f9f9f9] rounded-xl border border-[#e2e2e2]">
            <button
              type="button"
              onClick={() => setPurchaseType("ACTIVATION")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                purchaseType === "ACTIVATION"
                  ? "bg-[#006d36] text-white shadow-sm"
                  : "text-[#5f5e5e] hover:text-[#1a1c1c]"
              }`}
            >
              1. Activation Purchase
            </button>
            <button
              type="button"
              onClick={() => setPurchaseType("REPURCHASE")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                purchaseType === "REPURCHASE"
                  ? "bg-[#006d36] text-white shadow-sm"
                  : "text-[#5f5e5e] hover:text-[#1a1c1c]"
              }`}
            >
              2. Repurchase
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-[#006d36] flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map((pkg) => {
            const isBuying = buyingId === pkg.id;
            return (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl p-6 border border-[#e2e2e2] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group hover:border-[#50c878]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-[#006d36] px-2.5 py-1 rounded-full border border-emerald-200">
                      {pkg.tag}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#006d36]">
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
                      Daily Binary Capping
                    </div>
                    <div className="text-base font-mono font-black text-[#006d36]">
                      ₹{pkg.capping.toLocaleString()} / day
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#e2e2e2] space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[#5f5e5e]">Package Price</span>
                    <span className="text-2xl font-mono font-black text-[#1a1c1c]">
                      ₹{pkg.amount.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePurchase(pkg)}
                    disabled={isBuying}
                    className="w-full py-3 px-4 bg-[#006d36] hover:bg-[#005025] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isBuying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing & Distributing PV...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Instant {purchaseType === "ACTIVATION" ? "Activate" : "Repurchase"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Binary Compensation Plan Explanation Card */}
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#006d36]" />
            <h3 className="text-xl font-extrabold text-[#1a1c1c]">
              How Binary Volume & Capping Works in Avira
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#5f5e5e] leading-relaxed">
            <div className="p-4 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <strong className="text-[#1a1c1c] block text-sm mb-1">1. 1:1 Matching Ratio</strong>
              Equal volume from Left and Right legs matches at 1 PV = ₹1. For example, 700 Left PV and 700 Right PV yields ₹700 matching income.
            </div>
            <div className="p-4 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <strong className="text-[#1a1c1c] block text-sm mb-1">2. Unlimited Carry Forward</strong>
              Unmatched volume on the stronger leg never flushes! If Left has 5,000 PV and Right has 700 PV, the remaining 4,300 PV carries forward forever.
            </div>
            <div className="p-4 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <strong className="text-[#1a1c1c] block text-sm mb-1">3. Personal PV Capping</strong>
              Your daily payout limit is determined by your self PV: 100 PV (₹1k/day), 250 PV (₹2k/day), 500 PV (₹3k/day), 1000 PV (₹5k/day).
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
