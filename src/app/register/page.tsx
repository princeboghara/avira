import React, { Suspense } from "react";
import Link from "next/link";
import RegisterForm from "@/components/forms/RegisterForm";

export const metadata = {
  title: "Avira Life Care Global - Associate Registration",
  description: "Join Avira Life Care Global elite network with your sponsor referral code.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f9f9f9] via-white to-[#edf3ee] relative overflow-hidden selection:bg-[#50c878] selection:text-[#005025]">
      {/* Decorative ambient background meshes (centered ambiance for all devices) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#50c878]/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#006d36]/10 blur-[150px]" />
      </div>

      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-4 sm:pb-6">
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

      {/* Main Registration Layout: 100% IN THE EXACT MIDDLE ON ALL DEVICES */}
      <main className="flex-1 flex flex-col items-center justify-center py-4 w-full max-w-5xl mx-auto">
        <div className="w-full flex flex-col items-center justify-center">
          <Suspense fallback={<div className="text-center py-10 text-xs text-[#006d36]">Loading Registration Form...</div>}>
            <RegisterForm />
          </Suspense>

          {/* Centered Trust Badges underneath registration card */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#5f5e5e]">
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-[#e2e2e2] shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-[#006d36]">badge</span>
              <span className="font-semibold text-[11px]">Instant 5-Digit AV ID</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-[#e2e2e2] shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-[#006d36]">bolt</span>
              <span className="font-semibold text-[11px]">1:1 Instant Matching</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-[#e2e2e2] shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-[#006d36]">local_shipping</span>
              <span className="font-semibold text-[11px]">Auto Pincode Verification</span>
            </div>
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
