import React from "react";
import Link from "next/link";
import { Leaf, ArrowLeft, ShieldCheck, Zap, BadgeCheck } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Avira Life Care Global - Associate Login",
  description: "Access your associate dashboard with your unique 5-digit Member ID.",
};

export default function LoginPage() {
  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen flex flex-col justify-between relative overflow-hidden selection:bg-[#50c878] selection:text-[#005025]">
      {/* Decorative ambient background meshes (centered ambiance for all devices) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#50c878]/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#006d36]/10 blur-[150px]" />
      </div>

      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/avira-logo.png"
            alt="Avira Lifecare Global Private Limited"
            className="h-10 sm:h-12 w-auto object-contain"
          />
          <div>
            <span className="font-black text-sm sm:text-base tracking-tight text-[#006d36] block leading-tight">
              AVIRA LIFECARE
            </span>
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
              Global Associate Portal
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#e2e2e2] shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content: 100% IN THE EXACT MIDDLE ON ALL DEVICES (Mobile, Laptop, Desktop) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full max-w-5xl mx-auto">
        <div className="w-full flex flex-col items-center justify-center">
          <LoginForm />

          {/* Centered Trust Badges underneath the card */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#5f5e5e]">
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-[#e2e2e2] shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#006d36]" />
              <span className="font-semibold text-[11px]">100% Encrypted Login</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-[#e2e2e2] shadow-xs">
              <Zap className="w-4 h-4 text-[#006d36]" />
              <span className="font-semibold text-[11px]">1:1 Instant Matching</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-[#e2e2e2] shadow-xs">
              <BadgeCheck className="w-4 h-4 text-[#006d36]" />
              <span className="font-semibold text-[11px]">5-Digit Member ID</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#5f5e5e]/80 border-t border-[#e2e2e2]/60">
        © 2026 Avira Life Care Global. All rights reserved. Secure Member Access.
      </footer>
    </div>
  );
}
