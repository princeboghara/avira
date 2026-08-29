"use client";

import React from "react";
import { ShieldCheck, Truck, Sparkles, RefreshCw } from "lucide-react";

const TRUST_METRICS = [
  {
    icon: Sparkles,
    title: "100% Wild Himalayan Sourcing",
    desc: "Ethically harvested from Spiti & Ladakh with zero chemical adulteration.",
  },
  {
    icon: ShieldCheck,
    title: "AYUSH & FSSAI Certified",
    desc: "Manufactured in sterile GMP cleanrooms under expert Ayurvedic supervision.",
  },
  {
    icon: RefreshCw,
    title: "30-Day Money-Back Guarantee",
    desc: "100% refund policy if you are not fully satisfied with your formulation.",
  },
  {
    icon: Truck,
    title: "Free Express Dispatch",
    desc: "Same-day order dispatch with real-time tracking to 19,000+ pin codes.",
  },
];

export default function HomeTrustBar() {
  return (
    <section className="py-8 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_METRICS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#faf9f6] border border-stone-200/80 hover:border-stone-400 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-[#1b3b32] flex items-center justify-center shrink-0 border border-stone-200 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-tight mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
