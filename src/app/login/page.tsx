import React from "react";
import Link from "next/link";
import LoginForm from "@/components/forms/LoginForm";

export const metadata = {
  title: "Avira Life Care Global - Associate Login",
  description: "Access your associate dashboard with your unique 5-digit Member ID.",
};

export default function LoginPage() {
  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen flex flex-col glow-bg relative overflow-hidden selection:bg-[#50c878] selection:text-[#005025]">
      {/* Decorative background glow elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#50c878]/10 blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#50c878]/15 blur-[100px]" />
      </div>

      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]">eco</span>
          </div>
          <div>
            <span className="font-black text-base sm:text-lg tracking-tight text-[#006d36] block leading-tight">
              AVIRA LIFE CARE
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
              Global Associate Portal
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-xl border border-[#e2e2e2] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content Area: Responsive Grid (Adapts to Mobile, Tablet, and Desktop) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Visual Branding & Feature Showcase (Fills Empty Space on Desktop) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#006d36] text-xs font-extrabold uppercase tracking-wider w-fit">
              <span className="w-2 h-2 rounded-full bg-[#006d36] animate-pulse" />
              <span>India&apos;s Next-Gen Wellness Network</span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1a1c1c] tracking-tight leading-tight">
                Empowering Health, Building Residual Wealth.
              </h2>
              <p className="text-sm text-[#5f5e5e] mt-3 max-w-xl leading-relaxed">
                Log in to monitor your 1:1 real-time binary matching payouts, inspect downlines across your Left & Right power legs, and activate your personal PV.
              </p>
            </div>

            {/* 4 Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#e2e2e2] shadow-xs space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </div>
                <h4 className="font-extrabold text-xs text-[#1a1c1c]">1:1 Instant Matching</h4>
                <p className="text-[11px] text-[#5f5e5e] leading-snug">
                  1 PV = ₹1. Instant automated wallet credit upon PV volume matching.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e2e2e2] shadow-xs space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">account_tree</span>
                </div>
                <h4 className="font-extrabold text-xs text-[#1a1c1c]">Family Genealogy Tree</h4>
                <p className="text-[11px] text-[#5f5e5e] leading-snug">
                  Live visual hierarchy with 1-click sponsor and leg locking.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e2e2e2] shadow-xs space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                </div>
                <h4 className="font-extrabold text-xs text-[#1a1c1c]">Daily Capping Limit</h4>
                <p className="text-[11px] text-[#5f5e5e] leading-snug">
                  Earn up to ₹5,000/day. High-capping protection with carry-forward.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e2e2e2] shadow-xs space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <h4 className="font-extrabold text-xs text-[#1a1c1c]">5-Digit Member ID</h4>
                <p className="text-[11px] text-[#5f5e5e] leading-snug">
                  Protected encrypted login via your permanent AV identifier.
                </p>
              </div>
            </div>

            {/* Quick Live Footprint */}
            <div className="flex items-center gap-6 pt-2 text-xs text-[#5f5e5e]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006d36]">verified</span>
                <span>Active 100+ PV Activation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006d36]">database</span>
                <span>Supabase PostgreSQL Cloud</span>
              </div>
            </div>
          </div>

          {/* Right Column: Responsive Login Card */}
          <div className="w-full lg:col-span-5 flex justify-center lg:justify-end">
            <LoginForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#5f5e5e]/80 border-t border-[#e2e2e2]/60">
        © 2026 Avira Life Care Global. Member Portal • Secure Authentication.
      </footer>
    </div>
  );
}
