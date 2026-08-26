import React, { Suspense } from "react";
import Link from "next/link";
import RegisterForm from "@/components/forms/RegisterForm";

export const metadata = {
  title: "Avira Life Care Global - Associate Registration",
  description: "Join Avira Life Care Global elite network with your sponsor referral code.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f9f9f9] via-white to-[#edf3ee] selection:bg-[#50c878] selection:text-[#005025]">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between pb-4 sm:pb-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]">eco</span>
          </div>
          <div>
            <span className="font-black text-base sm:text-lg tracking-tight text-[#006d36] block leading-tight">
              AVIRA LIFE CARE
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
              Global Associate Network
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#e2e2e2] shadow-xs transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Registration Layout (Adapts to all screen sizes & fills left/right on desktop) */}
      <main className="flex-1 max-w-7xl mx-auto w-full py-4 sm:py-6 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Visual Showcase & Why Join (Fills Empty Space on Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pt-4 pr-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#006d36] text-xs font-extrabold uppercase tracking-wider w-fit">
              <span className="w-2 h-2 rounded-full bg-[#006d36] animate-pulse" />
              <span>Direct Network Association</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#1a1c1c] tracking-tight leading-tight">
                Start Your Journey With Avira Life Care.
              </h1>
              <p className="text-xs sm:text-sm text-[#5f5e5e] mt-3 leading-relaxed">
                Join thousands of wellness entrepreneurs building long-term residual income with 1:1 real-time binary matching and high-purity botanical products.
              </p>
            </div>

            {/* Benefit Highlights */}
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-white border border-[#e2e2e2] shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#1a1c1c]">Instant 5-Digit Member ID</h4>
                  <p className="text-[11px] text-[#5f5e5e] mt-0.5">
                    Your unique AV identifier is generated in real-time in Supabase cloud.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e2e2e2] shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">account_tree</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#1a1c1c]">Smart Binary Placement</h4>
                  <p className="text-[11px] text-[#5f5e5e] mt-0.5">
                    Lock placement into Left or Right power leg directly from the genealogy tree.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e2e2e2] shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#1a1c1c]">Automated Pincode Lookup</h4>
                  <p className="text-[11px] text-[#5f5e5e] mt-0.5">
                    Automatic verification of Indian postal pincodes, cities, and states.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e2e2e2] shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#1a1c1c]">1:1 Immediate Binary Payouts</h4>
                  <p className="text-[11px] text-[#5f5e5e] mt-0.5">
                    1 PV = ₹1, with unlimited carry-forward on the stronger power leg.
                  </p>
                </div>
              </div>
            </div>

            {/* Assurance Pill */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#006d36] block mb-1">
                Root System Status
              </span>
              <span className="text-xs font-bold text-[#1a1c1c] block">
                Direct Tree Activation under root associate: <strong className="font-mono text-[#006d36]">AV00001</strong>
              </span>
            </div>
          </div>

          {/* Right Column: Centered Responsive Registration Form */}
          <div className="w-full lg:col-span-7 flex justify-center">
            <Suspense fallback={<div className="text-center py-10 text-xs text-[#006d36]">Loading Registration Form...</div>}>
              <RegisterForm />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pt-4 text-center text-xs text-[#5f5e5e]/80 border-t border-[#e2e2e2]/60">
        © 2026 Avira Life Care Global. All rights reserved. Secure Cloud Architecture.
      </footer>
    </div>
  );
}
