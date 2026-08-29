"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, FlaskConical, Award } from "lucide-react";

interface CategoryMastery {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  itemCount: string;
  imageUrl: string;
  link: string;
}

const CATEGORIES: CategoryMastery[] = [
  {
    id: "juices",
    title: "Himalayan Bio-Juices",
    subtitle: "Cold Bio-Extraction Technology",
    description: "Wild Himalayan Sea Buckthorn, Organic Noni, Amla, and botanical vitality elixirs.",
    itemCount: "8 Formulations",
    imageUrl: "https://res.cloudinary.com/lj87jjg9/image/upload/v1787916782/AVIRALIFECARE/products/avira-sea-buckthorn-juice.jpg",
    link: "/products?category=juices",
  },
  {
    id: "wellness",
    title: "Immunity & Rasayanas",
    subtitle: "Gold-Grade Ayurvedic Science",
    description: "Pure Himalayan Shilajit, Ashwagandha, Maxx Power, and mitochondrial vitality complexes.",
    itemCount: "14 Formulations",
    imageUrl: "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917337/AVIRALIFECARE/products/avira-maxx-power-capsule.jpg",
    link: "/products?category=wellness",
  },
  {
    id: "haircare",
    title: "Hair & Scalp Therapy",
    subtitle: "Vedic Kshirpak Vidhi Decoctions",
    description: "24 Herbs Follicle Cleanser, 34 Herbs Root Regrowth Oil, and Red Onion Bio-Serum.",
    itemCount: "6 Formulations",
    imageUrl: "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917326/AVIRALIFECARE/products/avira-24-herbs-shampoo.jpg",
    link: "/products?category=haircare",
  },
  {
    id: "skincare",
    title: "Clinical Skincare",
    subtitle: "Pure Botanical Dermatological Care",
    description: "Kumkumadi Tailam, Saffron Haldi Glow Gel, Papaya D-Tan, and organic facial care.",
    itemCount: "7 Formulations",
    imageUrl: "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917333/AVIRALIFECARE/products/avira-kumkumadi-oil.jpg",
    link: "/products?category=skincare",
  },
  {
    id: "agriculture",
    title: "Organic Plant Science",
    subtitle: "Bio-Active Agricultural Conditioners",
    description: "Premium Humic-Fulvic extracts, organic root boosters, and chemical-free soil nutrition.",
    itemCount: "5 Formulations",
    imageUrl: "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917342/AVIRALIFECARE/products/avira-plant-growth-promoter.jpg",
    link: "/products?category=agriculture",
  },
  {
    id: "women-wellness",
    title: "Women's Health & Care",
    subtitle: "Synergistic Ayurvedic Tonics",
    description: "Avira Faminor Uterine Health Tonic, Shatavari, and specialized wellness remedies.",
    itemCount: "4 Formulations",
    imageUrl: "https://res.cloudinary.com/lj87jjg9/image/upload/v1787916771/AVIRALIFECARE/products/avira-faminor-juice.jpg",
    link: "/products?category=wellness",
  },
];

export default function OurMasteryCategories() {
  return (
    <section id="mastery" className="py-20 bg-white relative z-20 overflow-hidden border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-[#0b3d2e] font-bold text-xs mb-3 shadow-xs uppercase tracking-wider">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Botanical Discipline & Categories</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            Our Scientific Mastery
          </h2>

          <p className="text-sm sm:text-base text-slate-600 text-balance">
            Rooted in classical Ayurvedic pharmacology and backed by state-of-the-art sterile cleanroom manufacturing.
          </p>
        </div>

        {/* Categories Grid with Real Product Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              className="bg-[#f8fafc] rounded-3xl p-6 border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
            >
              <div>
                {/* Photo Stage */}
                <div className="w-full h-52 bg-white rounded-2xl mb-5 relative overflow-hidden flex items-center justify-center p-4 border border-slate-200/70 group-hover:border-emerald-200 transition-colors">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.title}
                    width={240}
                    height={240}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#0b3d2e] text-[10.5px] font-bold border border-emerald-200/60">
                    {cat.itemCount}
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0b3d2e] block mb-1">
                  {cat.subtitle}
                </span>

                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#0b3d2e] transition-colors">
                  {cat.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Bottom Action Arrow */}
              <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#0b3d2e] group-hover:translate-x-1 transition-transform">
                <span>Explore Formulations</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
