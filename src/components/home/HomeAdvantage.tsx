"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export default function HomeAdvantage() {
  return (
    <section id="advantage" className="py-20 bg-white relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#006d36] font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Compliance & Automated Ledger</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1d1b20] leading-tight">
              The Avira Life Care Advantage
            </h2>
            <p className="text-sm sm:text-base text-[#494551] leading-relaxed">
              We merge high-demand botanical formulations with an ultra-lucrative 1:1 binary compensation plan, providing you the ultimate vehicle to scale your financial freedom sustainably.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50 border border-gray-200/60">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006d36] flex items-center justify-center shrink-0 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1d1b20]">100% Automated Calculations</h4>
                  <p className="text-xs text-[#5f5e5e]">Automated daily cut-offs, 2% TDS, 8% Admin, and 5% RP Wallet deductions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50 border border-gray-200/60">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1d1b20]">Enterprise Security & Audit Trail</h4>
                  <p className="text-xs text-[#5f5e5e]">Encrypted sessions, instant invoice generation, and real-time bank KYC verification.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
              <Image
                src="/images/hero-products.webp"
                alt="Avira Luxury Wellness Products"
                width={900}
                height={520}
                className="w-full h-auto object-cover hover:scale-103 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
