"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowRight, UserPlus, LogIn } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/85 border-b border-emerald-500/15 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 p-0.5 shadow-md shadow-emerald-900/20 group-hover:shadow-emerald-700/40 transition-all duration-300">
            <div className="w-full h-full bg-[#022c22] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#022c22]">
              AVIRA<span className="text-emerald-600">CARE</span>
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.25em] text-emerald-700 uppercase">
              Decentralized MLM
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-emerald-950/80">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">
            How It Works
          </a>
          <a href="#compensation" className="hover:text-emerald-600 transition-colors">
            Compensation Plan
          </a>
          <a href="#features" className="hover:text-emerald-600 transition-colors">
            Platform Benefits
          </a>
          <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
            Dashboard Demo
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3.5">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-bold text-emerald-900 hover:text-emerald-700 px-4 py-2.5 rounded-xl transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Member Login</span>
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-700/25 hover:shadow-emerald-700/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <UserPlus className="w-4 h-4" />
            <span>Join Network</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            href="/login"
            className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-2 rounded-lg"
          >
            Login
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-emerald-950 hover:bg-emerald-50 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-500/15 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-emerald-950 hover:bg-emerald-50 rounded-lg"
          >
            Home
          </Link>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-emerald-950 hover:bg-emerald-50 rounded-lg"
          >
            How It Works
          </a>
          <a
            href="#compensation"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-emerald-950 hover:bg-emerald-50 rounded-lg"
          >
            Compensation Plan
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-emerald-950 hover:bg-emerald-50 rounded-lg"
          >
            Platform Benefits
          </a>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-emerald-950 hover:bg-emerald-50 rounded-lg"
          >
            Dashboard Demo
          </Link>
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 border border-emerald-600 text-emerald-800 font-bold rounded-xl"
            >
              Member Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-900/20"
            >
              Register New Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
