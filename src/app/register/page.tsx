import React, { Suspense } from "react";
import Link from "next/link";
import RegisterForm from "@/components/forms/RegisterForm";

export const metadata = {
  title: "Emerald Zenith - Registration",
  description: "Join the Emerald Zenith elite network with your sponsor code.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f9f9f9] to-[#e2e2e2] selection:bg-[#50c878] selection:text-[#005025]">
      {/* Top Bar */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]">diamond</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#006d36]">
            EMERALD ELITE
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Registration Layout */}
      <div className="flex-1 flex items-center justify-center py-4">
        <Suspense fallback={<div className="text-center py-10">Loading Registration...</div>}>
          <RegisterForm />
        </Suspense>
      </div>

      <footer className="pt-6 text-center text-xs text-[#5f5e5e]/80">
        © 2026 Emerald Elite Network Global. Real-time Supabase PostgreSQL.
      </footer>
    </div>
  );
}
