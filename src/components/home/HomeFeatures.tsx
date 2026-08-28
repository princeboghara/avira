"use client";

import React from "react";
import { Zap, TrendingUp, Layers, GraduationCap, ChevronRight } from "lucide-react";

export default function HomeFeatures() {
  return (
    <section id="compensation" className="py-20 bg-white relative z-20 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#006d36] font-bold text-xs mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Engineered for Network Growth</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1d1b20] mb-4">
            Core Ecosystem Advantages
          </h2>
          <p className="text-sm sm:text-base text-[#5f5e5e]">
            Engineered with clinical precision and transparent automated ledger execution for network leaders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: 1:1 Instant Binary Income */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#fdf7ff] to-white border border-purple-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-md shadow-[#006d36]/20 mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#1d1b20] mb-2">
              1:1 Instant Binary Matching
            </h3>
            <p className="text-sm text-[#5f5e5e] leading-relaxed mb-4">
              Match Left and Right group volume automatically with zero carry-forward leakage. Automated cut-off settles earnings directly into your withdrawable wallet.
            </p>
            <div className="text-xs font-mono font-bold text-[#006d36] flex items-center gap-1">
              <span>Up to ₹5,000 / Day Capping</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 2: Repurchase Engine & RP Wallet */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#fdf7ff] to-white border border-emerald-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4f378a] to-[#6750a4] flex items-center justify-center text-white shadow-md shadow-[#4f378a]/20 mb-6 group-hover:scale-110 transition-transform">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#1d1b20] mb-2">
              Repurchase & RP Wallet
            </h3>
            <p className="text-sm text-[#5f5e5e] leading-relaxed mb-4">
              Every binary payout automatically accumulates 5% into your dedicated RP Wallet, generating perpetual repeat order volume across your entire downline.
            </p>
            <div className="text-xs font-mono font-bold text-purple-700 flex items-center gap-1">
              <span>5% RP Wallet Reinvestment</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 3: Academy & Transparent Ledger */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#fdf7ff] to-white border border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#008080] to-[#00ced1] flex items-center justify-center text-white shadow-md shadow-teal-500/20 mb-6 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#1d1b20] mb-2">
              Academy & Leader Portal
            </h3>
            <p className="text-sm text-[#5f5e5e] leading-relaxed mb-4">
              Access enterprise training modules, duplicate top-performer strategies, and track your associates with deep tree hierarchy visualizers and real-time KYC.
            </p>
            <div className="text-xs font-mono font-bold text-teal-700 flex items-center gap-1">
              <span>Integrated Video Academy</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
