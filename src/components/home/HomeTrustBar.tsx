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
    title: "30-Day Satisfaction Promise",
    desc: "Dedicated clinical wellness support and verified product authenticity.",
  },
  {
    icon: Truck,
    title: "Free Express Dispatch",
    desc: "Same-day order dispatch with real-time tracking to 19,000+ pin codes.",
  },
];

export default function HomeTrustBar() {
  return (
    <section className="py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRUST_METRICS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-[28px] p-5 neo-card-hover flex items-start gap-4"
              >
                <div className="neo-btn-icon w-11 h-11 rounded-2xl text-[#006d36] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-heading font-extrabold text-[#0f172a] leading-tight mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#64748b] leading-relaxed font-medium">
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
