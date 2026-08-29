import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Leaf, Shield, Dna, Sparkles } from "lucide-react";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Avira Life Care Global - Associate Registration",
  description: "Join Avira Life Care Global elite network with your sponsor referral code.",
};

export default function RegisterPage() {
  return (
    <div className="bg-[#dce3ea] text-stone-900 min-h-screen flex flex-col justify-between relative overflow-hidden selection:bg-[#1b3b32] selection:text-white font-sans">
      
      {/* 3D Atmospheric Studio & Botanical Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#edf2f7] via-[#dce4ec] to-[#cbd5e1]" />
        
        {/* Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1000px] h-[800px] sm:h-[1000px] rounded-full bg-white/40 blur-[100px]" />

        {/* Decorative Aura Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] lg:w-[960px] h-[600px] sm:h-[800px] lg:h-[960px] rounded-full border border-white/50 animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] sm:w-[950px] lg:w-[1150px] h-[750px] sm:h-[950px] lg:h-[1150px] rounded-full border border-stone-300/40 pointer-events-none" />

        {/* Floating Atmospheric Badges */}
        <div className="hidden lg:flex items-center gap-2.5 absolute top-[15%] left-[6%] px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-sm text-stone-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          <Leaf className="w-3.5 h-3.5 text-[#1b3b32]" />
          <span>100% Wild Himalayan Botanicals</span>
        </div>

        <div className="hidden lg:flex items-center gap-2.5 absolute bottom-[18%] left-[6%] px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-sm text-stone-700 text-xs font-bold">
          <Shield className="w-3.5 h-3.5 text-[#1b3b32]" />
          <span>ISO 9001:2015 & GMP Cleanroom</span>
        </div>

        <div className="hidden lg:flex items-center gap-2.5 absolute top-[18%] right-[6%] px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-sm text-stone-700 text-xs font-bold">
          <Dna className="w-3.5 h-3.5 text-[#1b3b32]" />
          <span>HPLC Lab Verified</span>
        </div>

        <div className="hidden lg:flex items-center gap-2.5 absolute bottom-[15%] right-[6%] px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-sm text-stone-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Ethical Direct Commerce</span>
        </div>
      </div>

      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-6xl mx-auto w-full relative z-20">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/avira-logo.png"
            alt="Avira Life Care"
            className="h-9 sm:h-11 w-auto object-contain drop-shadow-sm"
          />
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#1b3b32] block leading-tight">
              AVIRA LIFE CARE
            </span>
            <span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-[0.2em] text-stone-600 block">
              Global Associate Network
            </span>
          </div>
        </Link>
        
        <Link
          href="/"
          className="text-xs font-bold text-stone-700 hover:text-[#1b3b32] flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white shadow-sm hover:shadow transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Registration Layout (Centered 3D Card) */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 py-4 w-full max-w-5xl mx-auto relative z-10">
        <Suspense fallback={<div className="text-center py-10 text-xs text-[#1b3b32] font-bold">Loading Registration Form...</div>}>
          <RegisterForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] sm:text-xs text-stone-600 relative z-20">
        © {new Date().getFullYear()} Avira Life Care Global Private Limited. All rights reserved.
      </footer>
    </div>
  );
}
