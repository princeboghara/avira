"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeNavbar() {
  return (
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
  );
}
