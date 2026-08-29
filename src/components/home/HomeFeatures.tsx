"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  TrendingUp,
  Layers,
  Calculator,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Wallet,
  Coins,
} from "lucide-react";

export default function HomeFeatures() {
  const [pairsPerDay, setPairsPerDay] = useState(5);
  const [cappingLevel, setCappingLevel] = useState(5000);

  // Binary match math (assuming ₹100 or ₹200 per 100 PV pair match; standard is 1:1 matching with ₹1,000 to ₹5,000 daily capping)
  const pairValue = 1000; // standard package matching unit
  const grossDaily = Math.min(pairsPerDay * pairValue, cappingLevel);
  const tds = Math.round(grossDaily * 0.02);
  const admin = Math.round(grossDaily * 0.08);
  const rpWallet = Math.round(grossDaily * 0.05);
  const netDaily = Math.round(grossDaily - tds - admin - rpWallet);
  const projectedMonthly = netDaily * 30;

  return (
    <section id="compensation" className="py-24 bg-white relative z-20 border-t border-gray-100 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/90 text-[#006d36] font-extrabold text-xs mb-3 border border-emerald-200">
            <Zap className="w-3.5 h-3.5" />
            <span>High Velocity 1:1 Binary MLM Compensation</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#1d1b20] mb-4 tracking-tight">
            Engineered For Lifetime Wealth
          </h2>
          <p className="text-sm sm:text-base text-[#5f5e5e] text-balance">
            Avira’s 1:1 binary compensation plan is built on transparent automated ledger execution, zero carry leakage, and a perpetual 5% RP repeat order cycle.
          </p>
        </div>

        {/* 3 Core Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* Card 1: 1:1 Binary Match */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#fdf7ff] to-white border border-purple-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-lg shadow-emerald-700/20 mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#006d36] block mb-1">
              Primary Income
            </span>
            <h3 className="text-xl font-black text-[#1d1b20] mb-2">
              1:1 Instant Binary Matching
            </h3>
            <p className="text-xs sm:text-sm text-[#5f5e5e] leading-relaxed mb-4">
              Match Left and Right group volume automatically. Daily cut-offs calculate matching units and credit earnings straight to your withdrawable wallet.
            </p>
            <div className="mt-auto pt-3 border-t border-purple-50 flex items-center justify-between text-xs font-mono font-bold text-[#006d36]">
              <span>Capping: ₹1,000 - ₹5,000/Day</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: 5% RP Wallet Engine */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#fdf7ff] to-white border border-emerald-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4f378a] to-[#6750a4] flex items-center justify-center text-white shadow-lg shadow-purple-900/20 mb-6 group-hover:scale-110 transition-transform">
              <Layers className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-purple-700 block mb-1">
              Passive Growth
            </span>
            <h3 className="text-xl font-black text-[#1d1b20] mb-2">
              5% RP Wallet Compounder
            </h3>
            <p className="text-xs sm:text-sm text-[#5f5e5e] leading-relaxed mb-4">
              Every payout automatically allocates 5% to your dedicated RP (Repurchase) Wallet. This guarantees regular product reorders and recurring volume across your tree.
            </p>
            <div className="mt-auto pt-3 border-t border-emerald-50 flex items-center justify-between text-xs font-mono font-bold text-purple-700">
              <span>Automatic Repeat Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Transparent Ledger & Instant Payout */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#fdf7ff] to-white border border-teal-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#008080] to-[#00ced1] flex items-center justify-center text-white shadow-lg shadow-teal-700/20 mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-teal-700 block mb-1">
              100% Compliant
            </span>
            <h3 className="text-xl font-black text-[#1d1b20] mb-2">
              Automated Statutory Deductions
            </h3>
            <p className="text-xs sm:text-sm text-[#5f5e5e] leading-relaxed mb-4">
              Crystal-clear breakdown on every invoice: 2% TDS under Section 194H, 8% Admin Fee, and real-time bank account transfer via verified KYC.
            </p>
            <div className="mt-auto pt-3 border-t border-teal-50 flex items-center justify-between text-xs font-mono font-bold text-teal-700">
              <span>Direct Bank Settlement</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

        {/* Interactive Binary Matching Calculator */}
        <div className="rounded-3xl bg-gradient-to-br from-[#1d1b20] via-[#16221b] to-[#20182b] text-white p-8 sm:p-12 shadow-2xl shadow-emerald-950/20 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Calculator Controls (Left Column) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs w-fit border border-emerald-500/30">
                <Calculator className="w-3.5 h-3.5" />
                <span>Interactive Income Estimator</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Calculate Your Daily & Monthly Earning Potential
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Adjust the number of matched binary pairs generated daily in your organization to view gross income, statutory deductions, RP wallet reserve, and take-home net payout.
              </p>

              {/* Slider 1: Daily Matched Pairs */}
              <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-300">Daily Matched Pairs:</span>
                  <span className="text-emerald-400 font-mono text-base font-black">
                    {pairsPerDay} {pairsPerDay === 1 ? "Pair" : "Pairs"} / Day
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={pairsPerDay}
                  onChange={(e) => setPairsPerDay(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#50c878]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>1 Pair (Starter)</span>
                  <span>5 Pairs (Silver)</span>
                  <span>10 Pairs (Diamond Capping)</span>
                </div>
              </div>

              {/* Daily Capping Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300">Package Capping:</span>
                <button
                  onClick={() => setCappingLevel(1000)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    cappingLevel === 1000
                      ? "bg-emerald-500 text-black font-black"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  ₹1,000 / Day
                </button>
                <button
                  onClick={() => setCappingLevel(3000)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    cappingLevel === 3000
                      ? "bg-emerald-500 text-black font-black"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  ₹3,000 / Day
                </button>
                <button
                  onClick={() => setCappingLevel(5000)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    cappingLevel === 5000
                      ? "bg-emerald-500 text-black font-black"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  ₹5,000 / Day (Max)
                </button>
              </div>

            </div>

            {/* Live Projection Box (Right Column) */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/15 shadow-xl flex flex-col gap-4">
              
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs text-gray-300 font-bold block mb-1">
                  Projected Net Monthly Income
                </span>
                <span className="text-3xl sm:text-4xl font-black text-[#50c878] font-mono tracking-tight">
                  ₹{projectedMonthly.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Based on consistent 30-day binary team activity
                </span>
              </div>

              {/* Breakdown Ledger */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-gray-300">
                  <span>Gross Binary Credit:</span>
                  <span className="font-bold text-white">₹{grossDaily.toLocaleString()} / Day</span>
                </div>
                <div className="flex justify-between text-rose-300">
                  <span>TDS Deduction (2%):</span>
                  <span>- ₹{tds.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>Admin Charge (8%):</span>
                  <span>- ₹{admin.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>RP Wallet Reserve (5%):</span>
                  <span>+ ₹{rpWallet.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm text-[#50c878]">
                  <span>Net Daily Take-Home:</span>
                  <span>₹{netDaily.toLocaleString()} / Day</span>
                </div>
              </div>

              <Link
                href="/register"
                className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#006d36] to-[#50c878] text-white font-extrabold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 hover:scale-102 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Start Building Your Team</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
