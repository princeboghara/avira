"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle, Network } from "lucide-react";
import HeroShader from "./HeroShader";
import NetworkSphere from "./NetworkSphere";

export default function HomeHero() {
  return (
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
  );
}
