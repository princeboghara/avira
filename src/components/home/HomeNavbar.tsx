"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Phone,
  Truck,
  LogIn,
  UserPlus,
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
      {/* Top Real-World Notification Strip */}
      <div className="bg-[#1b3b32] text-[#f4f1ea] py-2 px-4 text-xs font-medium border-b border-[#234e40]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] tracking-wide">
            <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <Truck className="w-3.5 h-3.5" />
              Free Express Delivery on orders above ₹999
            </span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="hidden md:inline text-white/80">
              100% Ayurvedic & FSSAI Approved
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="tel:+919712326273"
              className="hidden sm:flex items-center gap-1 text-white/80 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Help: +91 97123 26273</span>
            </a>
            <span className="hidden sm:inline text-white/30">•</span>
            <Link
              href="/login"
              className="text-amber-300 hover:text-amber-200 font-semibold transition-colors"
            >
              Associate Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Human-Crafted Brand Header */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
          scrolled
            ? "shadow-md shadow-slate-900/5 py-3 border-b border-stone-200"
            : "py-4 border-b border-stone-200/80"
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
                className="h-10 sm:h-11 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#1b3b32] leading-tight group-hover:text-[#234e40] transition-colors">
                  AVIRA LIFE CARE
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8c827a]">
                  Ayurvedic Life Sciences
                </span>
              </div>
            </Link>

            {/* Clean E-Commerce Category Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#374151]">
              <Link
                href="/products?category=juices"
                className="hover:text-[#1b3b32] transition-colors"
              >
                Himalayan Juices
              </Link>
              <Link
                href="/products?category=wellness"
                className="hover:text-[#1b3b32] transition-colors"
              >
                Shilajit & Immunity
              </Link>
              <Link
                href="/products?category=haircare"
                className="hover:text-[#1b3b32] transition-colors"
              >
                Hair Care
              </Link>
              <Link
                href="/products?category=skincare"
                className="hover:text-[#1b3b32] transition-colors"
              >
                Skin Care
              </Link>
              <Link
                href="/products?category=agriculture"
                className="hover:text-[#1b3b32] transition-colors"
              >
                Plant Care
              </Link>
              <Link
                href="/products"
                className="text-[#1b3b32] font-bold hover:text-emerald-700 transition-colors"
              >
                All Products
              </Link>
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#f7f5f0] hover:bg-[#eae6dc] text-stone-700 text-xs font-medium border border-stone-200 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-stone-500" />
                <span>Search products...</span>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#1b3b32] hover:bg-[#f7f5f0] border border-stone-300 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>

              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1b3b32] hover:bg-[#234e40] text-white font-bold text-xs shadow-sm hover:shadow transition-all"
              >
                <span>Join Avira</span>
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-stone-800 hover:bg-stone-100 transition-colors"
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
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#1b3b32]" />
                  <span className="font-bold text-base text-[#1b3b32]">
                    Avira Categories
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-stone-500 hover:text-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col space-y-2 text-sm font-semibold text-stone-800">
                <Link
                  href="/products?category=juices"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-stone-50"
                >
                  Himalayan Wild Juices
                </Link>
                <Link
                  href="/products?category=wellness"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-stone-50"
                >
                  Shilajit, Ashwagandha & Immunity
                </Link>
                <Link
                  href="/products?category=haircare"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-stone-50"
                >
                  Hair & Scalp Care
                </Link>
                <Link
                  href="/products?category=skincare"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-stone-50"
                >
                  Clinical Skin Care
                </Link>
                <Link
                  href="/products?category=agriculture"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-stone-50"
                >
                  Organic Plant & Soil Nutrition
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl text-[#1b3b32] font-bold bg-emerald-50"
                >
                  View All Formulations (40+)
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100 space-y-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl border border-stone-300 text-stone-800 font-bold text-xs text-center block"
              >
                Sign In to Account
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-[#1b3b32] text-white font-bold text-xs text-center block shadow-md shadow-[#1b3b32]/20"
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
