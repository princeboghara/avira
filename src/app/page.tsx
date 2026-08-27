import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Diamond,
  ArrowRight,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Lock,
  Globe,
  Leaf,
  FlaskConical,
  PlayCircle,
  BarChart3,
  Network,
  GraduationCap,
  Layers,
} from "lucide-react";
import HeroShader from "@/components/3d/HeroShader";
import NetworkSphere from "@/components/3d/NetworkSphere";

export const metadata = {
  title: "Avira Life Care Global — Next-Gen 3D MLM & Wellness Platform",
  description:
    "Experience the pinnacle of high-end wellness and entrepreneurial success. 1:1 instant binary matching compensation, repurchase rewards, and precision-engineered organic products.",
};

export default function HomePage() {
  return (
    <div className="bg-[#fdf7ff] text-[#1d1b20] font-sans antialiased selection:bg-[#50c878] selection:text-[#005025] min-h-screen flex flex-col overflow-x-hidden">
      {/* ========================================================
          1. STYLISH GLASSMORPHIC TOP NAVBAR
         ======================================================== */}
      <nav className="fixed top-0 w-full z-50 bg-[#fdf7ff]/80 backdrop-blur-xl border-b border-white/40 shadow-xs shadow-emerald-950/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avira-logo.png"
              alt="Avira Lifecare Global Private Limited"
              className="h-11 w-auto object-contain"
            />
            <div>
              <span className="font-black text-sm sm:text-base tracking-tight text-[#006d36] block leading-tight">
                AVIRA LIFECARE
              </span>
              <span className="text-[7.5px] sm:text-[8.5px] font-extrabold uppercase tracking-widest text-[#5f5e5e] block">
                Global Private Limited
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            <Link
              href="/"
              className="text-[#006d36] font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Home
            </Link>
            <a
              href="#products"
              className="text-[#5f5e5e] hover:text-[#006d36] font-semibold text-xs uppercase tracking-wider transition-colors"
            >
              Elite Products
            </a>
            <a
              href="#compensation"
              className="text-[#5f5e5e] hover:text-[#006d36] font-semibold text-xs uppercase tracking-wider transition-colors"
            >
              1:1 Binary Engine
            </a>
            <a
              href="#advantage"
              className="text-[#5f5e5e] hover:text-[#006d36] font-semibold text-xs uppercase tracking-wider transition-colors"
            >
              Advantage
            </a>
            <Link
              href="/dashboard"
              className="text-[#5f5e5e] hover:text-[#006d36] font-semibold text-xs uppercase tracking-wider transition-colors"
            >
              Member Portal
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-xs font-bold text-[#1d1b20] hover:text-[#006d36] px-4 py-2 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#006d36] to-[#50c878] hover:from-[#005a2c] hover:to-[#40b068] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#006d36]/20 active:scale-95 transition-all"
            >
              <span>Join Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ========================================================
          2. 3D HERO SECTION (Interactive WebGL Shader + 3D Network)
         ======================================================== */}
      <main className="flex-1 pt-18">
        <section className="relative min-h-[90vh] flex items-center justify-center pt-12 pb-20 overflow-hidden">
          {/* WebGL Fluid Shader Background */}
          <div className="absolute inset-0 w-full h-full z-0">
            <HeroShader className="w-full h-full" opacity={0.6} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#fdf7ff]/40 via-[#fdf7ff]/75 to-[#fdf7ff]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-emerald-300/60 shadow-xs text-[#006d36] font-bold text-xs tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#50c878] animate-pulse" />
                <span>Next-Generation 1:1 Binary MLM Engine</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-[#1d1b20] tracking-tight leading-[1.1] text-balance">
                Empower Your Network, <br />
                <span className="bg-gradient-to-r from-[#006d36] via-[#50c878] to-[#4f378a] bg-clip-text text-transparent">
                  Accelerate Your Success
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#494551] max-w-xl leading-relaxed text-balance">
                Experience unparalleled transparency, instant 1:1 binary pair matching, real-time wallet settlement, and automated repurchase volume designed for visionary leaders.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-2 w-full sm:w-auto">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#006d36] to-[#50c878] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#006d36]/30 hover:shadow-[#006d36]/50 hover:-translate-y-0.5 active:scale-95 transition-all w-full sm:w-auto"
                >
                  <span>Become an Associate</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#compensation"
                  className="px-8 py-4 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 text-[#1d1b20] hover:text-[#006d36] hover:bg-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all w-full sm:w-auto"
                >
                  <PlayCircle className="w-4 h-4 text-[#006d36]" />
                  <span>How Plan Works</span>
                </a>
              </div>

              {/* Live Ticker Stats */}
              <div className="pt-6 border-t border-gray-200/80 grid grid-cols-3 gap-6 w-full mt-2">
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-[#006d36] font-mono">
                    ₹14.8 Cr+
                  </span>
                  <span className="text-xs text-[#5f5e5e] font-semibold">Commissions Paid</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-[#4f378a] font-mono">
                    48,500+
                  </span>
                  <span className="text-xs text-[#5f5e5e] font-semibold">Active Leaders</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-[#006d36] font-mono">
                    1:1 Ratio
                  </span>
                  <span className="text-xs text-[#5f5e5e] font-semibold">Instant Binary Match</span>
                </div>
              </div>
            </div>

            {/* Right 3D Visual Column: 3D Network Sphere & Hero Product Card */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
              {/* 3D Network Visualization Card */}
              <div className="w-full relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-6 shadow-2xl shadow-emerald-950/10 overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-400/20 to-purple-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006d36] flex items-center justify-center font-bold">
                      <Network className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#1d1b20] block">3D Binary Live Stream</span>
                      <span className="text-[10px] text-[#5f5e5e]">Real-time PV Volume Matching</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006d36] text-[10px] font-bold font-mono">
                    LIVE
                  </span>
                </div>

                {/* 3D Particle Network Canvas */}
                <div className="h-64 sm:h-72 w-full relative flex items-center justify-center">
                  <NetworkSphere className="w-full h-full" size={280} />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-center">
                    <span className="text-[10px] font-bold uppercase text-[#006d36] block">Left Team PV</span>
                    <span className="text-sm font-black font-mono text-[#006d36]">100% Matching</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/60 text-center">
                    <span className="text-[10px] font-bold uppercase text-purple-700 block">Right Team PV</span>
                    <span className="text-sm font-black font-mono text-purple-700">Instant Settlement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. CORE ECOSYSTEM ADVANTAGES (Stitch 3D Cards)
           ======================================================== */}
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

        {/* ========================================================
            4. OUR ELITE WELLNESS & BOTANICAL COLLECTION
           ======================================================== */}
        <section id="products" className="py-20 bg-[#f9f9f9] relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#006d36] font-bold text-xs mb-3">
                <Leaf className="w-3.5 h-3.5" />
                <span>Certified Pure Organic Formulation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1d1b20] mb-3">
                Our Elite Wellness Collection
              </h2>
              <p className="text-sm sm:text-base text-[#5f5e5e] max-w-xl text-balance">
                Clinical precision meets organic purity. High-demand lifestyle products designed for sustainable repeat network volume.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Product 1 */}
              <div className="bg-white rounded-3xl p-6 flex flex-col items-center group cursor-pointer border border-gray-200/70 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300">
                <div className="w-full h-64 bg-gray-50 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center p-4">
                  <Image
                    className="w-4/5 h-4/5 object-contain transition-transform group-hover:scale-108 duration-500"
                    alt="Core Supplement"
                    width={320}
                    height={260}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlOsMH1-t5hFxaAZMQ2wfp6Vi35EKtHq4uMJCoxEgD_CPgf8brKzSGx0R8YXyx8gemPcS_7hqo-Ke3XgPc1YT8jRmWJNqIVCchzb0bPImhUrdZXlpWX_4WcbTxa8F5dGcPCFsfwUCi7DTbwIt-KYIEQetGTNNY-FRCcuzFem3eFe-FZE8k3lM9CwF2GuFU66ev2KJzSb0NBScMNMp7R2DNELL0R8xj7dl7sgkaoHipXKytf1spx1XcUQ"
                  />
                </div>
                <h3 className="text-lg font-extrabold text-[#1d1b20] text-center mb-1">
                  Core Supplement
                </h3>
                <p className="text-xs text-[#5f5e5e] text-center mb-4 leading-relaxed">
                  Foundational cellular nutrition & immunity with bio-active botanicals.
                </p>
                <div className="mt-auto w-full pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#006d36]">100 PV Package</span>
                  <Link
                    href="/register"
                    className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
                  >
                    <span>Enroll Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Product 2 */}
              <div className="bg-white rounded-3xl p-6 flex flex-col items-center group cursor-pointer border border-gray-200/70 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300">
                <div className="w-full h-64 bg-gray-50 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center p-4">
                  <Image
                    className="w-4/5 h-4/5 object-contain transition-transform group-hover:scale-108 duration-500"
                    alt="Botanical Serum"
                    width={320}
                    height={260}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVL71o-ntv0XiIT1UwKraxg1lZYOJDrTgCe8U_qObCbE90UZ7MHpF6SkLt4Ga5evvzHYMWx8tjHx6KUZ0ZeBkIIfY9NSwGuZluQkZc9lgKIke7fIlklH5TF2N0NN8_SuGHUIxpqvzqpueBOhoF6rLstwDYFBYXhIEJrD-YJXJGj2TdZK74r0ns_o90AimG0qYUd5QCmh9zXgi8nq0mCOO7p0RHZiL0Rsd1svAQJb7OAmVHK0ImOQCiFQ"
                  />
                </div>
                <h3 className="text-lg font-extrabold text-[#1d1b20] text-center mb-1">
                  Botanical Serum
                </h3>
                <p className="text-xs text-[#5f5e5e] text-center mb-4 leading-relaxed">
                  Advanced skin vitality, barrier rejuvenation, and anti-aging compounds.
                </p>
                <div className="mt-auto w-full pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#006d36]">100 PV Package</span>
                  <Link
                    href="/register"
                    className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
                  >
                    <span>Enroll Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Product 3 */}
              <div className="bg-white rounded-3xl p-6 flex flex-col items-center group cursor-pointer border border-gray-200/70 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300">
                <div className="w-full h-64 bg-gray-50 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center p-4">
                  <Image
                    className="w-4/5 h-4/5 object-contain transition-transform group-hover:scale-108 duration-500"
                    alt="Aura Diffuser"
                    width={320}
                    height={260}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYXrrXWPcivvqZZXEmKGhdOfXRgWDZeOLl9dyBQJaAYedxb1qm0B6-yHHUZUlNCA_PYTppiqGySpn6KPt3nQyokqXGGp7yUmSC1mDRCAsxhYxiAl63LI1W2SM6t3F-KBsxHvYRza8-Lc9i6jsof-RvM_kic1eFM4b0gID6yfgVYlKtdF7TX8YQ0sCl6OrhCwMpel4VufAeWNBRA59FKxm3qnIeDEwYsWscLO-Twujn14tRrfRq46Xguw"
                  />
                </div>
                <h3 className="text-lg font-extrabold text-[#1d1b20] text-center mb-1">
                  Aura Diffuser
                </h3>
                <p className="text-xs text-[#5f5e5e] text-center mb-4 leading-relaxed">
                  Ultrasonic atmospheric harmonization and essential oil aromatherapy.
                </p>
                <div className="mt-auto w-full pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#006d36]">100 PV Package</span>
                  <Link
                    href="/register"
                    className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
                  >
                    <span>Enroll Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. THE AVIRA ADVANTAGE & TRUST LEDGER
           ======================================================== */}
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

        {/* ========================================================
            6. HIGH-CONVERTING CTA BANNER (Stitch Gradient)
           ======================================================== */}
        <section className="py-20 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden bg-gradient-to-r from-[#006d36] via-[#005a2c] to-[#4f378a] text-white shadow-2xl shadow-[#006d36]/20">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Ready to Transform Your Future?
                </h2>
                <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
                  Join thousands of visionary leaders who are already leveraging Avira Life Care to build massive, sustainable financial organizations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <Link
                    href="/register"
                    className="px-10 py-4 rounded-full bg-white text-[#006d36] font-bold text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Join Avira Now
                  </Link>
                  <Link
                    href="/login"
                    className="px-10 py-4 rounded-full bg-black/20 backdrop-blur-md border border-white/30 text-white font-bold text-xs uppercase tracking-widest hover:bg-black/30 active:scale-95 transition-all duration-300"
                  >
                    Member Portal Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================
          7. SLICK FOOTER
         ======================================================== */}
      <footer className="w-full py-8 bg-white border-t border-gray-200 relative z-20 text-xs text-[#5f5e5e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Diamond className="w-4 h-4 text-[#006d36]" />
            <span>© 2026 Avira Life Care Global Private Limited. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/login" className="hover:text-[#006d36]">Member Login</Link>
            <Link href="/register" className="hover:text-[#006d36]">Register</Link>
            <Link href="/admin/login" className="hover:text-[#006d36]">Central Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
