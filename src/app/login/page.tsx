import React from "react";
import Link from "next/link";
import LoginForm from "@/components/forms/LoginForm";

export const metadata = {
  title: "Emerald Elite - Member Login",
  description: "Access your elite associate dashboard with your Member ID.",
};

export default function LoginPage() {
  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen flex flex-col glow-bg relative overflow-hidden selection:bg-[#50c878] selection:text-[#005025]">
      {/* Decorative background elements from Stitch */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#50c878]/10 blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#50c878]/15 blur-[100px]" />
      </div>

      {/* Top minimal brand bar */}
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
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

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <LoginForm />
      </main>

      <footer className="py-6 text-center text-xs text-[#5f5e5e]/80 border-t border-[#e2e2e2]/60">
        © 2026 Emerald Elite Global. Secure Supabase PostgreSQL Session.
      </footer>
    </div>
  );
}
