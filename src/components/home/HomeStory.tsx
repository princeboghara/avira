"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, HeartHandshake } from "lucide-react";

export default function HomeStory() {
  return (
    <section className="py-16 bg-[#faf9f6] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left: Brand Heritage & Story */}
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1b3b32] block">
              The Avira Sourcing Heritage
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Wild-Harvested in the Himalayas. <br />
              Delivered Fresh to Your Home.
            </h2>

            <p className="text-sm text-stone-600 leading-relaxed">
              At Avira Life Care, we bypass industrial greenhouse shortcuts. Our flagship Sea Buckthorn berries, Shilajit, and rare Rasayanas are handpicked directly from high-altitude wild terrains of Spiti Valley, Ladakh, and certified partner organic growers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-[#1b3b32] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Zero Added Sugar or Water</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Pure unadulterated botanical extract in every single batch.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-[#1b3b32] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">GMP Sterile Cleanrooms</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Manufactured under qualified Ayurvedic biochemists.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1b3b32] hover:text-[#234e40] uppercase tracking-wider"
              >
                <span>Read Our Full Quality Standard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right: Key Brand Numbers */}
          <div className="lg:col-span-5">
            <div className="bg-[#1b3b32] text-[#f4f1ea] rounded-3xl p-8 sm:p-10 shadow-lg space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 block">
                Impact & Reach
              </span>

              <div className="grid grid-cols-2 gap-6 border-b border-[#2d5c4e] pb-6">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono block">
                    12,000+
                  </span>
                  <span className="text-xs text-stone-300 font-medium mt-1 block">
                    Feet Harvesting Altitude
                  </span>
                </div>
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono block">
                    19,000+
                  </span>
                  <span className="text-xs text-stone-300 font-medium mt-1 block">
                    Pin Codes Served in India
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono block">
                    100%
                  </span>
                  <span className="text-xs text-stone-300 font-medium mt-1 block">
                    AYUSH & FSSAI Compliant
                  </span>
                </div>
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono block">
                    4.9★
                  </span>
                  <span className="text-xs text-stone-300 font-medium mt-1 block">
                    Customer Satisfaction Score
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
