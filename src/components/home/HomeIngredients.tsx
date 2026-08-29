"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, FlaskConical, ArrowRight, Dna } from "lucide-react";

const INGREDIENTS = [
  {
    name: "Wild Himalayan Sea Buckthorn",
    slogan: "Bioactive Omega 3, 6, 7 & 9 Complex",
    desc: "Wild-harvested from high-altitude Himalayan valleys at 12,000+ feet. Packed with 190+ bioactive nutrients, high SOD antioxidant enzymes, and rare Omega-7 for cellular barrier repair.",
    benefits: ["Cellular membrane longevity", "Cardiovascular & gut health", "High SOD antioxidant protection"],
    image: "https://res.cloudinary.com/lj87jjg9/image/upload/v1787916782/AVIRALIFECARE/products/avira-sea-buckthorn-juice.jpg",
  },
  {
    name: "Purified Himalayan Shilajit & Ashwagandha",
    slogan: "Grade-A Gold Standard Rasayana",
    desc: "Purified with classical Triphala water decoction. Contains 84+ trace ionic minerals and 60%+ fulvic acid to stimulate mitochondrial ATP bio-energy production and combat mental fatigue.",
    benefits: ["Mitochondrial ATP cellular energy", "Sustained physical stamina", "Natural cortisol & stress balance"],
    image: "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917337/AVIRALIFECARE/products/avira-maxx-power-capsule.jpg",
  },
  {
    name: "24 Classical Vedic Herbs",
    slogan: "Kshirpak Vidhi Follicle Therapy",
    desc: "A classical decoction of Bhringraj, Shikakai, Brahmi, and Amla processed using the traditional Kshirpak Vidhi method to nourish dermal papilla cells and reinforce root anchoring.",
    benefits: ["Controls root shedding by 80%", "Soothes dry micro-scalp flora", "Restores hair density & gloss"],
    image: "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917326/AVIRALIFECARE/products/avira-24-herbs-shampoo.jpg",
  },
];

export default function HomeIngredients() {
  return (
    <section id="science" className="py-24 bg-white relative z-20 overflow-hidden border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs mb-3 shadow-xs uppercase tracking-wider">
            <Dna className="w-3.5 h-3.5 text-[#0b3d2e]" />
            <span>Bioactive Molecular Research</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Key Botanical Spotlight
          </h2>
          <p className="text-sm sm:text-base text-slate-600 text-balance">
            Every botanical extract is standardized to therapeutic bioactive levels and tested via HPLC to ensure clinical efficacy.
          </p>
        </div>

        {/* 3 Large Botanical Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {INGREDIENTS.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#f8fafc] rounded-3xl p-7 border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="w-full h-48 bg-white rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center p-4 border border-slate-200/80">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={220}
                    height={220}
                    className="max-h-full max-w-full object-contain drop-shadow-md"
                  />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0b3d2e] block mb-1">
                  {item.slogan}
                </span>

                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                  {item.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              {/* Benefits List */}
              <div className="pt-4 border-t border-slate-200 space-y-1.5">
                {item.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-800 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
