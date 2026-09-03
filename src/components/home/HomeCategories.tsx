"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    id: "juices",
    name: "Wild Himalayan Juices",
    subtitle: "Cold-Pressed Bioactive Juices",
    count: "8 Formulations",
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787916782/AVIRALIFECARE/products/avira-sea-buckthorn-juice.jpg",
    link: "/products?category=juices",
    badge: "Bestselling Category",
  },
  {
    id: "wellness",
    name: "Shilajit & Daily Immunity",
    subtitle: "Gold Standard Rasayanas",
    count: "14 Formulations",
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917337/AVIRALIFECARE/products/avira-maxx-power-capsule.jpg",
    link: "/products?category=wellness",
    badge: "High Potency",
  },
  {
    id: "haircare",
    name: "Hair & Scalp Therapy",
    subtitle: "24 Herbs Kshirpak Oils & Cleansers",
    count: "6 Formulations",
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917326/AVIRALIFECARE/products/avira-24-herbs-shampoo.jpg",
    link: "/products?category=haircare",
    badge: "Shedding Control",
  },
  {
    id: "skincare",
    name: "Pure Ayurvedic Skincare",
    subtitle: "Herbal Cleansers & Face Glow",
    count: "7 Formulations",
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787916812/AVIRALIFECARE/products/avira-night-cream.png",
    link: "/products?category=skincare",
    badge: "Toxin-Free",
  },
  {
    id: "agriculture",
    name: "Organic Plant Science",
    subtitle: "Bio-Fertilizers & Soil Boosters",
    count: "5 Formulations",
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917311/AVIRALIFECARE/products/avira-carbonx.jpg",
    link: "/products?category=agriculture",
    badge: "100% Eco Certified",
  },
  {
    id: "personal-care",
    name: "Daily Herbal Care",
    subtitle: "Chemical-Free Personal Essentials",
    count: "4 Formulations",
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917340/AVIRALIFECARE/products/avira-neem-soap.jpg",
    link: "/products",
    badge: "Daily Essential",
  },
];

export default function HomeCategories() {
  return (
    <section id="categories" className="py-20 relative overflow-hidden">
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#006d36] block mb-1">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0f172a] tracking-tight">
              Shop by Ayurvedic Category
            </h2>
          </div>
          <Link
            href="/products"
            className="neo-btn-secondary text-xs font-bold px-4 py-2 rounded-2xl flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>View All Formulations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6 Category Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              className="glass-card rounded-[32px] p-5 neo-card-hover flex flex-col justify-between group"
            >
              <div>
                {/* Photo Stage */}
                <div className="w-full h-48 neo-inset rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center p-4 group-hover:bg-white/90 transition-colors">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    width={220}
                    height={220}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="glass-pill absolute top-3 right-3 px-3 py-0.5 rounded-full text-[#0f172a] text-[10px] font-bold">
                    {cat.count}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] block mb-1">
                  {cat.badge}
                </span>

                <h3 className="text-lg font-heading font-extrabold text-[#0f172a] group-hover:text-[#006d36] transition-colors">
                  {cat.name}
                </h3>

                <p className="text-xs text-[#64748b] mt-1 font-medium">
                  {cat.subtitle}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#006d36] group-hover:translate-x-1 transition-transform">
                <span>Explore Formulations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
