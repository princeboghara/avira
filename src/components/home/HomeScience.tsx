"use client";

import React from "react";
import Link from "next/link";
import { Dna, CheckCircle2, ArrowRight } from "lucide-react";

export default function HomeScience() {
  return (
    <section id="science" className="py-20 bg-white relative z-20 overflow-hidden border-t border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-[#059669] font-bold text-xs mb-3 border border-emerald-200 uppercase tracking-wider">
            <Dna className="w-3.5 h-3.5" />
            <span>Botanical Pharmacology & R&D</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            The Science of Bioactive Extraction
          </h2>

          <p className="text-sm sm:text-base text-slate-600 text-balance">
            Conventional processing uses high temperatures that destroy delicate plant enzymes. Avira utilizes proprietary cold bio-extraction to retain 99.8% of nature&apos;s therapeutic potency.
          </p>
        </div>

        {/* 2-Column Science Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          
          {/* Left Column: 3 Pillars */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-2xl bg-[#f0fdf4]/50 border border-emerald-100 hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#059669] flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Wild High-Altitude Harvesting (12,000+ Ft)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11">
                Botanicals thriving in extreme Himalayan altitudes produce elevated concentrations of protective secondary metabolites, polyphenols, and antioxidant superoxide dismutase (SOD) enzymes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f0fdf4]/50 border border-emerald-100 hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#059669] flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Zero-Thermal Cold Bio-Extraction
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11">
                Processed strictly below 38°C in nitrogen-purged sterile chambers. Prevents oxidation and preserves natural volatile oils and rare fatty acids like Omega-7.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f0fdf4]/50 border border-emerald-100 hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#059669] flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  HPLC Chromatographic Purity Fingerprinting
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11">
                Every production lot is subjected to HPLC testing to confirm standardized percentages of active markers (such as 60% Fulvic Acid in Shilajit and 84+ ionic trace minerals).
              </p>
            </div>
          </div>

          {/* Right Column: Key Feature Card */}
          <div className="lg:col-span-6">
            <div className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#059669] text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px]">
              
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-200 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                  Analytical Assurance
                </span>

                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                  100% Traceability & Third-Party Lab Certified
                </h3>

                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
                  Our laboratory verification guarantees that every batch is free of toxic heavy metals, synthetic pesticides, micro-plastics, and microbial contaminants.
                </p>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-white/15">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
                    <span>AYUSH & FSSAI Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
                    <span>Heavy Metals & Microbiological Clear</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 relative z-10">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#059669] font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-50 transition-colors shadow-lg"
                >
                  <span>Explore Standardized Formulations</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
