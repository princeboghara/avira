"use client";

import React from "react";
import { Star, CheckCircle2, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Dr. Ananya Sharma",
    role: "Senior Integrative Physician, Mumbai",
    product: "Wild Himalayan Sea Buckthorn Juice",
    rating: 5,
    quote:
      "Avira's Sea Buckthorn juice provides authentic, unadulterated cold-extracted Omega-7. The clinical response in digestive barrier recovery and natural skin luminescence is remarkably consistent across my patients.",
  },
  {
    name: "Rajesh V. Patel",
    role: "Managing Director, Ahmedabad",
    product: "24 Herbs Follicle Cleanser & 34 Herb Regrowth Oil",
    rating: 5,
    quote:
      "After trying numerous clinical dermatological solutions, Avira's Kshirpak formulation completely halted seasonal hair shedding within four weeks. The root density and scalp health have noticeably improved.",
  },
  {
    name: "Vikramjit Singh",
    role: "Performance & Wellness Consultant, Delhi",
    product: "Pure Himalayan Shilajit & Ashwagandha Rasayana",
    rating: 5,
    quote:
      "Exceptional gold-grade purity with zero chemical fillers. Sustained executive stamina, improved physical recovery, and enhanced mental focus without any caffeine-style crashes.",
  },
];

export default function HomeTestimonials() {
  return (
    <section className="py-24 bg-[#f8fafc] relative z-20 overflow-hidden border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-[#0b3d2e] font-bold text-xs mb-3 shadow-xs uppercase tracking-wider">
            <Quote className="w-3.5 h-3.5" />
            <span>Verified Practitioner & Executive Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Trusted by Professionals & Conscious Consumers
          </h2>
          <p className="text-sm sm:text-base text-slate-600 text-balance">
            Real feedback from healthcare practitioners, wellness professionals, and discerning consumers across India.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm sm:text-base text-slate-800 leading-relaxed mb-6 italic">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 block">
                    {rev.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                </div>
                <span className="text-[11px] text-slate-500 block">
                  {rev.role}
                </span>
                <span className="text-[10px] text-[#0b3d2e] font-semibold mt-1 block">
                  Verified Formulation: {rev.product}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
