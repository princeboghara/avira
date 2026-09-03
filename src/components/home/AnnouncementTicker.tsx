"use client";

import React from "react";

export default function AnnouncementTicker() {
  const items = [
    "🌿 100% Certified Pure Ayurvedic & Clinical Organic Formulations",
    "🚚 Free Express Delivery Across India on Orders Above ₹999",
    "🔬 ISO 9001:2015 & GMP Sterile Cleanroom Facility Certified",
    "🏔️ Ethically Sourced Wild Himalayan Sea Buckthorn Harvest",
    "📞 24/7 Concierge & Order Desk: +91 97123 26273",
    "🛡️ 30-Day Money-Back & Buyback Policy Guarantee",
    "✨ HPLC Bioactive Marker Assay Laboratory Verified",
  ];

  return (
    <div className="w-full bg-[#0b3d2e] text-[#f8fafc] py-2 overflow-hidden border-b border-[#0b3d2e]/30 relative z-50 select-none">
      <div className="flex w-max animate-marquee">
        {/* Repeating twice for endless seamless loop */}
        {[...items, ...items, ...items].map((text, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 mx-6 text-[11px] font-semibold tracking-wider uppercase text-emerald-100/90 whitespace-nowrap"
          >
            <span>{text}</span>
            <span className="text-emerald-400/50">•</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
