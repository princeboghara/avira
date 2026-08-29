"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Leaf,
  FlaskConical,
  Recycle,
  Microscope,
  Building2,
} from "lucide-react";

export default function HomeAdvantage() {
  return (
    <section id="standards" className="py-24 bg-[#f8fafc] relative z-20 overflow-hidden border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-[#0b3d2e] font-bold text-xs mb-3 shadow-xs uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Manufacturing & Clinical Governance</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            The Avira Quality Benchmark
          </h2>
          <p className="text-sm sm:text-base text-slate-600 text-balance">
            Engineered in sterile, ISO 9001:2015 and GMP-certified cleanrooms with strict HPLC bioactive assay validation for unmatched therapeutic consistency.
          </p>
        </div>

        {/* 4 Corporate Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0b3d2e] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              100% Wild Himalayan
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ethically harvested from pristine Himalayan valleys and certified organic partner farms across India.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0b3d2e] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              GMP & ISO 9001 Labs
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Formulated in sterile cleanroom facilities ensuring absolute zero microbial or heavy metal contamination.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0b3d2e] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Microscope className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              HPLC Marker Verified
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every production batch undergoes high-performance liquid chromatography testing to guarantee active bioactive levels.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0b3d2e] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              100% Toxin-Free
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Completely free from parabens, phthalates, synthetic hormones, artificial dyes, and toxic petroleum derivatives.
            </p>
          </div>

        </div>

        {/* Executive Traceability Card */}
        <div className="rounded-3xl bg-white text-slate-900 p-8 sm:p-12 relative overflow-hidden shadow-xl border border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0b3d2e] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Corporate Governance
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug text-slate-900">
                End-to-End Batch Traceability & Scientific Rigor
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Every bottle of Avira Himalayan Sea Buckthorn Juice, 24 Herbs Shampoo, and Shilajit Elixir features batch-level lot verification to ensure 100% bioactive efficacy.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  <span>AYUSH & FSSAI Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  <span>100% Cruelty-Free & Vegetarian</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  <span>Eco-Friendly Glass & Recyclable Packaging</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 max-w-sm w-full">
                <span className="text-4xl font-black text-[#0b3d2e] font-mono block">
                  99.8%
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  Bioactive Retention Rate
                </span>
                <p className="text-[11px] text-slate-500">
                  Achieved via proprietary cold bio-extraction technology.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
