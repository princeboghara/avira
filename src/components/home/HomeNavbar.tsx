"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  User,
  Menu,
  X,
  ShieldCheck,
  Phone,
  Truck,
} from "lucide-react";

export default function HomeNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Notification Strip */}
      <div className="bg-[#005025] text-[#f4f7f6] py-2 px-4 text-xs font-medium border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] tracking-wide">
            <span className="flex items-center gap-1.5 text-[#50c878] font-bold">
              <Truck className="w-3.5 h-3.5" />
              Free Express Delivery on orders above ₹999
            </span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="hidden md:inline text-white/80">
              100% Ayurvedic & FSSAI Certified
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="tel:+919712326273"
              className="hidden sm:flex items-center gap-1 text-white/80 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-300" />
              <span>Help: +91 97123 26273</span>
            </a>
            <span className="hidden sm:inline text-white/30">•</span>
            <Link
              href="/login"
              className="text-[#50c878] hover:text-emerald-200 font-bold transition-colors"
            >
              Associate Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Frosted Glass Brand Header */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 glass-header ${
          scrolled
            ? "py-3 shadow-md shadow-slate-900/5"
            : "py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            
            {/* Brand Logo & Real Organization Identity */}
            <Link href="/" className="flex items-center gap-3.5 group shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/avira-logo.png"
                alt="Avira Life Care"
                className="h-10 sm:h-11 w-auto object-contain drop-shadow-2xs transition-transform group-hover:scale-105 duration-300"
              />
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-[#006d36] leading-tight transition-colors">
                  AVIRA LIFE CARE
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
                  Ayurvedic Life Sciences
                </span>
              </div>
            </Link>

            {/* Clean E-Commerce Category Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#475569]">
              <Link
                href="/products?category=juices"
                className="hover:text-[#006d36] transition-colors"
              >
                Himalayan Juices
              </Link>
              <Link
                href="/products?category=wellness"
                className="hover:text-[#006d36] transition-colors"
              >
                Shilajit & Immunity
              </Link>
              <Link
                href="/products?category=haircare"
                className="hover:text-[#006d36] transition-colors"
              >
                Hair Care
              </Link>
              <Link
                href="/products?category=skincare"
                className="hover:text-[#006d36] transition-colors"
              >
                Skin Care
              </Link>
              <Link
                href="/products?category=agriculture"
                className="hover:text-[#006d36] transition-colors"
              >
                Plant Care
              </Link>
              <Link
                href="/products"
                className="text-[#006d36] font-bold hover:text-emerald-700 transition-colors"
              >
                All Formulations
              </Link>
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl neo-inset text-[#64748b] text-xs font-medium transition-all"
              >
                <Search className="w-3.5 h-3.5 text-[#94a3b8]" />
                <span>Search products...</span>
              </Link>

              <Link
                href="/login"
                className="neo-btn-secondary inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-[#006d36]"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>

              <Link
                href="/register"
                className="neo-btn-primary hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-2xl font-bold text-xs"
              >
                <span>Join Avira</span>
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="neo-btn-icon lg:hidden p-2 rounded-2xl text-[#0f172a]"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm glass-panel shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slideRight">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#006d36]" />
                  <span className="font-heading font-extrabold text-base text-[#0f172a]">
                    Avira Categories
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="neo-btn-icon p-1.5 rounded-xl text-[#64748b] hover:text-[#0f172a]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col space-y-2 text-sm font-semibold text-[#0f172a]">
                <Link
                  href="/products?category=juices"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl hover:bg-white/80 transition-colors"
                >
                  Himalayan Wild Juices
                </Link>
                <Link
                  href="/products?category=wellness"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl hover:bg-white/80 transition-colors"
                >
                  Shilajit, Ashwagandha & Immunity
                </Link>
                <Link
                  href="/products?category=haircare"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl hover:bg-white/80 transition-colors"
                >
                  Hair & Scalp Care
                </Link>
                <Link
                  href="/products?category=skincare"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl hover:bg-white/80 transition-colors"
                >
                  Clinical Skin Care
                </Link>
                <Link
                  href="/products?category=agriculture"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl hover:bg-white/80 transition-colors"
                >
                  Organic Plant & Soil Nutrition
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl text-[#006d36] font-bold bg-emerald-500/10 border border-emerald-500/20"
                >
                  View All Formulations (40+)
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="neo-btn-secondary w-full py-3 rounded-2xl text-xs font-bold text-center block"
              >
                Sign In to Account
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="neo-btn-primary w-full py-3 rounded-2xl font-bold text-xs text-center block"
              >
                New Associate Registration
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
