import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Lock, Award, HeartHandshake } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#022c22] text-white border-t border-emerald-800/40 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-200 p-0.5 shadow-lg shadow-emerald-900/50 flex items-center justify-center">
                <div className="w-full h-full bg-[#022c22] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                AVIRA<span className="text-emerald-400">CARE</span>
              </span>
            </div>
            <p className="text-emerald-200/80 text-sm leading-relaxed max-w-sm">
              Empowering global leaders with the most secure, high-yield MLM network infrastructure.
              Built on transparent double-entry accounting, instant wallet disbursements, and
              unmatched binary matching rewards.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-700/40">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-700/40">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>PostgreSQL Cloud</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-700/40">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>ISO Certified</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-emerald-400 uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/70">
              <li>
                <Link href="/" className="hover:text-emerald-300 transition-colors">
                  Home Landing
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-300 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#compensation" className="hover:text-emerald-300 transition-colors">
                  Compensation Plan
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-300 transition-colors">
                  Leadership Ranks
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Member Portal */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-emerald-400 uppercase mb-4">
              Member Portal
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/70">
              <li>
                <Link href="/login" className="hover:text-emerald-300 transition-colors">
                  Member Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-300 transition-colors">
                  New Associate Registration
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-300 transition-colors">
                  Member Dashboard
                </Link>
              </li>
              <li>
                <span className="text-amber-300/90 text-xs font-mono">
                  Default Sponsor: AV10001
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Security & Support */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-emerald-400 uppercase mb-4">
              Security & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/70">
              <li>
                <span className="hover:text-emerald-300 cursor-pointer transition-colors">
                  Terms of Association
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-300 cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-300 cursor-pointer transition-colors">
                  Anti-Fraud Guidelines
                </span>
              </li>
              <li className="flex items-center gap-1 text-emerald-400 text-xs pt-1">
                <HeartHandshake className="w-4 h-4" />
                <span>24/7 Member Helpline</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/60 gap-4">
          <p>© 2026 AviraCare Network Global Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Powered by Next.js & Supabase PostgreSQL</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>
      </div>
    </footer>
  );
}
