"use client";

import React from "react";
import Link from "next/link";
import {
  UserCheck,
  ShoppingBag,
  Users,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: UserCheck,
    title: "Instant Free Enrollment",
    desc: "Register in under 60 seconds with your sponsor’s ID. Get instant access to your binary business backoffice and tracking tools.",
    badge: "Step 1",
    color: "from-[#006d36] to-[#50c878]",
  },
  {
    step: "02",
    icon: ShoppingBag,
    title: "Activate Product Package",
    desc: "Select any high-demand Ayurvedic package (from 100 PV up to 1000 PV combo) to activate your binary earning positions.",
    badge: "Step 2",
    color: "from-[#4f378a] to-[#7959b8]",
  },
  {
    step: "03",
    icon: Users,
    title: "Build 1:1 Left & Right Teams",
    desc: "Introduce two direct leaders. Our duplicate leadership academy and tree visualizers make team scaling simple and effective.",
    badge: "Step 3",
    color: "from-[#008080] to-[#20b2aa]",
  },
  {
    step: "04",
    icon: Award,
    title: "Daily Automated Income & RP Growth",
    desc: "Enjoy daily matched binary cut-offs deposited to your wallet, while 5% RP wallet generates perpetual repeat orders across your tree.",
    badge: "Step 4",
    color: "from-amber-600 to-yellow-500",
  },
];

export default function HomeRoadmap() {
  return (
    <section id="roadmap" className="py-24 bg-white relative z-20 border-t border-gray-100 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-[#006d36] font-extrabold text-xs mb-3 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clear Pathway To Financial Independence</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#1d1b20] mb-4 tracking-tight">
            How It Works in 4 Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-[#5f5e5e] text-balance">
            A frictionless, transparent onboarding process designed so anyone can get started and achieve their daily income capping quickly.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#fdf7ff] to-white border border-gray-200/70 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Step Number Background Watermark */}
                <span className="absolute top-3 right-4 font-mono font-black text-4xl text-gray-100 group-hover:text-emerald-100/80 transition-colors pointer-events-none">
                  {step.step}
                </span>

                <div>
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shadow-md mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-widest text-[#006d36] block mb-1">
                    {step.badge}
                  </span>

                  <h3 className="text-lg font-black text-[#1d1b20] mb-2 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#5f5e5e] leading-relaxed mb-4">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 text-[11px] font-bold text-[#006d36] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Explore Process</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Banner */}
        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#006d36] via-[#008542] to-[#50c878] text-white font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-emerald-800/20 hover:shadow-emerald-800/30 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Start Your Journey Today</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
