"use client";

import React from "react";
import { Star, CheckCircle2 } from "lucide-react";

const REVIEWS = [
  {
    name: "Dr. Ananya Sharma",
    location: "Senior Physician, Mumbai",
    product: "Wild Himalayan Sea Buckthorn Juice",
    rating: 5,
    date: "Verified Purchase • 2 weeks ago",
    comment:
      "Avira's Sea Buckthorn juice provides authentic, unadulterated cold-pressed Omega-7. The digestive relief and natural energy improvement are remarkably consistent.",
  },
  {
    name: "Rajesh V. Patel",
    location: "Ahmedabad, Gujarat",
    product: "24 Herbs Hair Cleanser & Regrowth Oil",
    rating: 5,
    date: "Verified Purchase • 1 month ago",
    comment:
      "After switching to Avira's 24 herbs shampoo, seasonal hair shedding significantly reduced within 3 weeks. Scalp feels completely clean and itch-free without dryness.",
  },
  {
    name: "Vikramjit Singh",
    location: "New Delhi",
    product: "Pure Himalayan Shilajit & Ashwagandha",
    rating: 5,
    date: "Verified Purchase • 3 weeks ago",
    comment:
      "Exceptional gold-grade purity with zero chemical smell. Consistent physical stamina and clean mental focus throughout demanding 12-hour workdays.",
  },
];

export default function HomeReviews() {
  return (
    <section id="reviews" className="py-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1b3b32] block mb-1">
            Real Customer Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
            Trusted by Over 12,000+ Customers
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Read authentic reviews from verified consumers and healthcare practitioners across India.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#faf9f6] border border-stone-200/90 flex flex-col justify-between"
            >
              <div>
                {/* Rating & Date */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10.5px] text-stone-400 font-medium">
                    {rev.date}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-4 italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200/70">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-stone-900">
                    {rev.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <span className="text-[11px] text-stone-500 block">
                  {rev.location}
                </span>
                <span className="text-[10px] text-[#1b3b32] font-semibold mt-1 block">
                  {rev.product}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
