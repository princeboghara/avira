"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] font-sans antialiased selection:bg-[#50c878] selection:text-[#005025] min-h-screen flex flex-col">
      {/* TopNavBar */}
      <nav className="bg-[#f9f9f9]/80 backdrop-blur-xl border-b border-[#e2e2e2]/40 shadow-sm top-0 sticky z-50 transition-all">
        <div className="flex justify-between items-center w-full px-6 max-w-7xl mx-auto h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[24px]">diamond</span>
            </div>
            <span className="font-extrabold text-xl tracking-tighter text-[#006d36]">
              AVIRA LIFE CARE GLOBAL
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 h-full">
            <Link
              href="/"
              className="h-full flex items-center text-[#006d36] font-bold border-b-2 border-[#006d36] transition-colors"
            >
              Home
            </Link>
            <a
              href="#products"
              className="h-full flex items-center text-[#5f5e5e] font-medium hover:text-[#006d36] transition-colors"
            >
              Elite Products
            </a>
            <a
              href="#advantage"
              className="h-full flex items-center text-[#5f5e5e] font-medium hover:text-[#006d36] transition-colors"
            >
              Advantage
            </a>
            <Link
              href="/dashboard"
              className="h-full flex items-center text-[#5f5e5e] font-medium hover:text-[#006d36] transition-colors"
            >
              Member Portal
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:block text-[#5f5e5e] font-semibold hover:text-[#006d36] transition-colors active:scale-95"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="neomorphic-btn-primary px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-95"
            >
              <span>Join Now</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center pt-12 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="md:col-span-6 flex flex-col gap-6 items-start">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card">
                <span className="material-symbols-outlined text-[#006d36] text-[18px]">
                  verified
                </span>
                <span className="text-xs text-[#3e4a3f] uppercase tracking-widest font-bold">
                  Premium Wellness Network
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-[#1a1c1c] tracking-tight leading-[1.1] text-balance">
                Elevate Your Life with{" "}
                <span className="text-[#006d36]">Avira Life Care Global</span>
              </h1>

              <p className="text-lg text-[#3e4a3f] max-w-lg leading-relaxed text-balance">
                Experience the pinnacle of high-end wellness and entrepreneurial success.
                Precision-engineered products designed to optimize your lifestyle and drive
                unparalleled network growth.
              </p>

              <div className="flex flex-wrap gap-4 mt-2">
                <Link
                  href="/register"
                  className="neomorphic-btn-primary px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  <span>Get Started</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <a
                  href="#products"
                  className="neomorphic-btn-secondary px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  Explore Products
                </a>
              </div>

              {/* Trust counters */}
              <div className="pt-6 border-t border-[#e2e2e2] grid grid-cols-3 gap-6 w-full mt-2">
                <div>
                  <span className="block text-2xl sm:text-3xl font-extrabold text-[#006d36]">
                    ₹14.8 Cr+
                  </span>
                  <span className="text-xs text-[#5f5e5e] font-medium">Commissions Paid</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-extrabold text-[#006d36]">
                    48,500+
                  </span>
                  <span className="text-xs text-[#5f5e5e] font-medium">Active Leaders</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-extrabold text-[#006d36]">
                    100%
                  </span>
                  <span className="text-xs text-[#5f5e5e] font-medium">Automated Ledger</span>
                </div>
              </div>
            </div>

            {/* Right Image: Uploaded Luxury Products Banner */}
            <div className="md:col-span-6 relative mt-6 md:mt-0">
              <div className="absolute inset-0 bg-[#50c878]/15 blur-[90px] rounded-full translate-y-8 pointer-events-none" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/80 group hover:shadow-3xl transition-all duration-700">
                <Image
                  src="/images/hero-products.png"
                  alt="Emerald Elite Luxury Products"
                  width={900}
                  height={500}
                  priority
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/85 backdrop-blur-md border border-white/60 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#006d36]">eco</span>
                    <div>
                      <span className="text-xs font-bold text-[#1a1c1c] block">
                        Signature Organic Range
                      </span>
                      <span className="text-[10px] text-[#5f5e5e]">
                        Certified Pure Botanical Formula
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/register"
                    className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
                  >
                    <span>Become Associate</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Products Section (Glassmorphism) */}
        <section id="products" className="py-20 bg-[#f9f9f9] relative">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1c1c] mb-3">
                Our Elite Collection
              </h2>
              <p className="text-sm text-[#5f5e5e] max-w-md mb-4">
                Clinical precision meets organic purity. High-demand lifestyle products designed
                for sustainable repeat network volume.
              </p>
              <div className="h-1 w-24 bg-[#006d36] rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Product Card 1 */}
              <div className="glass-card rounded-2xl p-6 flex flex-col items-center group cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl duration-300">
                <div className="w-full h-64 bg-[#eeeeee] rounded-xl mb-6 relative overflow-hidden flex items-center justify-center shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-3/4 h-3/4 object-contain transition-transform group-hover:scale-105 duration-500"
                    alt="Core Supplement"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlOsMH1-t5hFxaAZMQ2wfp6Vi35EKtHq4uMJCoxEgD_CPgf8brKzSGx0R8YXyx8gemPcS_7hqo-Ke3XgPc1YT8jRmWJNqIVCchzb0bPImhUrdZXlpWX_4WcbTxa8F5dGcPCFsfwUCi7DTbwIt-KYIEQetGTNNY-FRCcuzFem3eFe-FZE8k3lM9CwF2GuFU66ev2KJzSb0NBScMNMp7R2DNELL0R8xj7dl7sgkaoHipXKytf1spx1XcUQ"
                  />
                </div>
                <h3 className="text-xl font-bold text-[#1a1c1c] text-center mb-1">
                  Core Supplement
                </h3>
                <p className="text-sm text-[#5f5e5e] text-center mb-6">
                  Foundational cellular nutrition & immunity.
                </p>
                <Link
                  href="/register"
                  className="mt-auto text-[#006d36] font-bold text-xs uppercase tracking-widest border-b border-[#006d36] pb-1 group-hover:text-[#50c878] transition-colors"
                >
                  Enroll With Package
                </Link>
              </div>

              {/* Product Card 2 */}
              <div className="glass-card rounded-2xl p-6 flex flex-col items-center group cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl duration-300">
                <div className="w-full h-64 bg-[#eeeeee] rounded-xl mb-6 relative overflow-hidden flex items-center justify-center shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-3/4 h-3/4 object-contain transition-transform group-hover:scale-105 duration-500"
                    alt="Botanical Serum"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVL71o-ntv0XiIT1UwKraxg1lZYOJDrTgCe8U_qObCbE90UZ7MHpF6SkLt4Ga5evvzHYMWx8tjHx6KUZ0ZeBkIIfY9NSwGuZluQkZc9lgKIke7fIlklH5TF2N0NN8_SuGHUIxpqvzqpueBOhoF6rLstwDYFBYXhIEJrD-YJXJGj2TdZK74r0ns_o90AimG0qYUd5QCmh9zXgi8nq0mCOO7p0RHZiL0Rsd1svAQJb7OAmVHK0ImOQCiFQ"
                  />
                </div>
                <h3 className="text-xl font-bold text-[#1a1c1c] text-center mb-1">
                  Botanical Serum
                </h3>
                <p className="text-sm text-[#5f5e5e] text-center mb-6">
                  Advanced skin vitality and cellular renewal.
                </p>
                <Link
                  href="/register"
                  className="mt-auto text-[#006d36] font-bold text-xs uppercase tracking-widest border-b border-[#006d36] pb-1 group-hover:text-[#50c878] transition-colors"
                >
                  Enroll With Package
                </Link>
              </div>

              {/* Product Card 3 */}
              <div className="glass-card rounded-2xl p-6 flex flex-col items-center group cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl duration-300">
                <div className="w-full h-64 bg-[#eeeeee] rounded-xl mb-6 relative overflow-hidden flex items-center justify-center shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-3/4 h-3/4 object-contain transition-transform group-hover:scale-105 duration-500"
                    alt="Aura Diffuser"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYXrrXWPcivvqZZXEmKGhdOfXRgWDZeOLl9dyBQJaAYedxb1qm0B6-yHHUZUlNCA_PYTppiqGySpn6KPt3nQyokqXGGp7yUmSC1mDRCAsxhYxiAl63LI1W2SM6t3F-KBsxHvYRza8-Lc9i6jsof-RvM_kic1eFM4b0gID6yfgVYlKtdF7TX8YQ0sCl6OrhCwMpel4VufAeWNBRA59FKxm3qnIeDEwYsWscLO-Twujn14tRrfRq46Xguw"
                  />
                </div>
                <h3 className="text-xl font-bold text-[#1a1c1c] text-center mb-1">
                  Aura Diffuser
                </h3>
                <p className="text-sm text-[#5f5e5e] text-center mb-6">
                  Ultrasonic atmospheric harmonization.
                </p>
                <Link
                  href="/register"
                  className="mt-auto text-[#006d36] font-bold text-xs uppercase tracking-widest border-b border-[#006d36] pb-1 group-hover:text-[#50c878] transition-colors"
                >
                  Enroll With Package
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us / The Emerald Advantage */}
        <section id="advantage" className="py-20 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1c1c] mb-6">
                  The Emerald Advantage
                </h2>
                <p className="text-base sm:text-lg text-[#3e4a3f] mb-10 leading-relaxed">
                  We merge cutting-edge nutritional science with a lucrative entrepreneurial
                  ecosystem, providing you the ultimate platform to scale your health and wealth
                  simultaneously.
                </p>

                <div className="space-y-8">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-[#eeeeee] flex items-center justify-center shadow-inner shrink-0">
                      <span className="material-symbols-outlined text-[#006d36]">science</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#1a1c1c] mb-1">Clinical Precision</h4>
                      <p className="text-sm text-[#5f5e5e]">
                        Every formula is meticulously engineered using premium, bio-available
                        ingredients.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-[#eeeeee] flex items-center justify-center shadow-inner shrink-0">
                      <span className="material-symbols-outlined text-[#006d36]">trending_up</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#1a1c1c] mb-1">
                        Uncapped Binary Potential
                      </h4>
                      <p className="text-sm text-[#5f5e5e]">
                        Our 12% daily binary cutoff plan is designed for maximum leverage and
                        exponential downline growth.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-[#eeeeee] flex items-center justify-center shadow-inner shrink-0">
                      <span className="material-symbols-outlined text-[#006d36]">diversity_3</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#1a1c1c] mb-1">Global Leader Network</h4>
                      <p className="text-sm text-[#5f5e5e]">
                        Join an exclusive, high-caliber community of driven network entrepreneurs
                        worldwide.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advantage Feature Box */}
              <div className="relative h-full min-h-[420px] rounded-3xl overflow-hidden glass-card p-8 flex flex-col justify-center text-center shadow-xl border border-[#e2e2e2]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#006d36]/10 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <span className="material-symbols-outlined text-[64px] text-[#006d36] drop-shadow-md">
                    diamond
                  </span>
                  <h3 className="text-3xl font-extrabold text-[#1a1c1c] tracking-tight leading-tight">
                    Tangible Digital Wealth
                  </h3>
                  <p className="text-sm text-[#5f5e5e] max-w-sm mx-auto leading-relaxed">
                    Experience the intersection of luxury lifestyle and profound personal
                    optimization with automated Supabase payouts.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/register"
                      className="neomorphic-btn-primary px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2"
                    >
                      <span>Join Network Now</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-[#e2e2e2]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <span className="font-extrabold text-xl text-[#006d36]">EMERALD ELITE</span>
            <p className="text-sm text-[#3e4a3f]/80 max-w-sm leading-relaxed">
              © 2026 Emerald Elite Global. All rights reserved. Precision Engineering for the
              Modern Network Entrepreneur.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="font-bold text-xs uppercase tracking-wider text-[#1a1c1c] mb-1">
              Platform
            </span>
            <Link href="/" className="text-[#3e4a3f] hover:text-[#006d36] transition-colors">
              Home
            </Link>
            <Link href="/register" className="text-[#3e4a3f] hover:text-[#006d36] transition-colors">
              Join Associate
            </Link>
            <Link href="/login" className="text-[#3e4a3f] hover:text-[#006d36] transition-colors">
              Associate Login
            </Link>
            <Link href="/dashboard" className="text-[#3e4a3f] hover:text-[#006d36] transition-colors">
              Member Dashboard
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 text-sm">
            <span className="font-bold text-xs uppercase tracking-wider text-[#1a1c1c] mb-1">
              Compliance & Legal
            </span>
            <a href="#" className="text-[#3e4a3f] hover:text-[#006d36] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-[#3e4a3f] hover:text-[#006d36] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-[#3e4a3f] hover:text-[#006d36] transition-colors">
              Income Disclosure
            </a>
            <a href="#" className="text-[#3e4a3f] hover:text-[#006d36] transition-colors">
              Member Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
