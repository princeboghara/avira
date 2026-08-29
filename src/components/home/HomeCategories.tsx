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
    <section id="categories" className="py-16 bg-[#faf9f6] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1b3b32] block mb-1">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Shop by Ayurvedic Category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-[#1b3b32] hover:text-[#234e40] flex items-center gap-1 uppercase tracking-wider transition-colors"
          >
            <span>View All 40+ Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Category Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-stone-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo Stage with Soft Studio Background */}
                <div className="w-full h-48 bg-[#f7f5f0] rounded-xl mb-4 relative overflow-hidden flex items-center justify-center p-4 border border-stone-100 group-hover:bg-[#f1ede3] transition-colors">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    width={220}
                    height={220}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-white text-stone-700 text-[10px] font-bold border border-stone-200 shadow-2xs">
                    {cat.count}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c827a] block mb-1">
                  {cat.badge}
                </span>

                <h3 className="text-lg font-bold text-stone-900 group-hover:text-[#1b3b32] transition-colors">
                  {cat.name}
                </h3>

                <p className="text-xs text-stone-500 mt-1">
                  {cat.subtitle}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#1b3b32] group-hover:translate-x-1 transition-transform">
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
