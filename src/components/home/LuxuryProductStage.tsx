"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Plus,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  LogIn,
} from "lucide-react";

interface LuxuryProduct {
  id: string;
  categoryTag: string;
  brand: string;
  title: string;
  subtitle: string;
  sizes: { label: string; price: number; mrp: number }[];
  rating: number;
  reviews: number;
  imageUrl: string;
  accentBg: string;
  floatingBadge: string;
}

const LUXURY_PRODUCTS: LuxuryProduct[] = [
  {
    id: "sea-buckthorn",
    categoryTag: "Wild Himalayan Harvest",
    brand: "AVIRA LIFE CARE",
    title: "Sea Buckthorn Bio-Elixir",
    subtitle: "Cold-extracted wild Omega 3, 6, 7 & 9 berry juice",
    sizes: [
      { label: "250 ml", price: 699, mrp: 899 },
      { label: "500 ml", price: 1299, mrp: 1799 },
    ],
    rating: 4.95,
    reviews: 384,
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787916782/AVIRALIFECARE/products/avira-sea-buckthorn-juice.jpg",
    accentBg: "from-amber-100/50 via-emerald-50/40 to-slate-100/60",
    floatingBadge: "190+ Bioactive Nutrients",
  },
  {
    id: "shilajit-rasayana",
    categoryTag: "Cellular Vitality & Rasayana",
    brand: "AVIRA LIFE CARE",
    title: "Pure Shilajit Rasayana",
    subtitle: "Grade-A Himalayan Gold ATP energy complex",
    sizes: [
      { label: "30 Caps", price: 899, mrp: 1199 },
      { label: "60 Caps", price: 1599, mrp: 1999 },
    ],
    rating: 4.9,
    reviews: 290,
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917337/AVIRALIFECARE/products/avira-maxx-power-capsule.jpg",
    accentBg: "from-amber-100/40 via-stone-100/50 to-emerald-50/40",
    floatingBadge: "84+ Trace Minerals",
  },
  {
    id: "24-herbs-shampoo",
    categoryTag: "Vedic Hair Therapy",
    brand: "AVIRA LIFE CARE",
    title: "24 Herbs Follicle Cleanser",
    subtitle: "Kshirpak Vidhi root strengthening decoction",
    sizes: [
      { label: "100 ml", price: 299, mrp: 399 },
      { label: "200 ml", price: 499, mrp: 699 },
    ],
    rating: 4.88,
    reviews: 420,
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917326/AVIRALIFECARE/products/avira-24-herbs-shampoo.jpg",
    accentBg: "from-emerald-100/40 via-teal-50/40 to-slate-100/60",
    floatingBadge: "80% Shedding Control",
  },
  {
    id: "faminor-tonic",
    categoryTag: "Targeted Women's Wellness",
    brand: "AVIRA LIFE CARE",
    title: "Faminor Herbal Tonic",
    subtitle: "Shatavari & Ashoka classical hormonal harmony",
    sizes: [
      { label: "250 ml", price: 449, mrp: 599 },
      { label: "500 ml", price: 699, mrp: 899 },
    ],
    rating: 4.92,
    reviews: 310,
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787916771/AVIRALIFECARE/products/avira-faminor-juice.jpg",
    accentBg: "from-rose-100/40 via-emerald-50/40 to-slate-100/60",
    floatingBadge: "100% Ayurvedic Synergistic",
  },
];

export default function LuxuryProductStage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  const product = LUXURY_PRODUCTS[currentIndex];
  const currentSize = product.sizes[selectedSizeIndex] || product.sizes[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % LUXURY_PRODUCTS.length);
    setSelectedSizeIndex(1);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? LUXURY_PRODUCTS.length - 1 : prev - 1
    );
    setSelectedSizeIndex(1);
  };

  const handleAddToCart = () => {
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center py-10 px-4 sm:px-6 bg-gradient-to-br from-[#d6c7b9]/40 via-[#e8e1da]/60 to-[#c8bdb3]/40 overflow-hidden font-sans">
      
      {/* Background Soft Organic Silhouettes (Blurry Hands / Botanical Shadows) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-[#d4af37]/15 to-[#0b3d2e]/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
        <div className="absolute w-[700px] h-[700px] bg-gradient-to-bl from-[#edd5be]/40 to-[#c0a98f]/20 rounded-full blur-3xl -bottom-20 -right-20" />
      </div>

      {/* The Central Luxury Card (Matching the Reference UI) */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-white/95 backdrop-blur-2xl rounded-[40px] shadow-2xl shadow-stone-900/15 border border-white/80 p-8 sm:p-10 flex flex-col justify-between overflow-hidden transition-all duration-500">
        
        {/* Top Floating Navigation Header */}
        <div className="flex items-center justify-between w-full mb-6 relative z-20">
          <Link
            href="/products"
            className="text-xs font-bold text-stone-700 hover:text-stone-900 tracking-wide uppercase flex items-center gap-1 transition-colors"
          >
            <span>All</span>
          </Link>

          {/* Floating Center Menu Button */}
          <button
            onClick={() => setNavMenuOpen(!navMenuOpen)}
            className="w-11 h-11 rounded-full bg-white shadow-md shadow-stone-900/10 border border-stone-200 flex items-center justify-center text-stone-800 hover:scale-105 active:scale-95 transition-all"
            aria-label="Toggle navigation"
          >
            {navMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Right Login / Cart */}
          <Link
            href="/login"
            className="text-xs font-extrabold text-stone-800 hover:text-[#0b3d2e] tracking-wide flex items-center gap-1.5 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </Link>
        </div>

        {/* Dropdown Menu Modal */}
        {navMenuOpen && (
          <div className="absolute top-20 left-6 right-6 z-30 bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-[#0b3d2e] border-b pb-2">
              Avira Collections
            </div>
            <Link
              href="/products?category=juices"
              onClick={() => setNavMenuOpen(false)}
              className="block text-sm font-semibold text-stone-800 hover:text-[#0b3d2e] py-1"
            >
              Himalayan Bio-Juices
            </Link>
            <Link
              href="/products?category=wellness"
              onClick={() => setNavMenuOpen(false)}
              className="block text-sm font-semibold text-stone-800 hover:text-[#0b3d2e] py-1"
            >
              Immunity & Rasayanas
            </Link>
            <Link
              href="/products?category=haircare"
              onClick={() => setNavMenuOpen(false)}
              className="block text-sm font-semibold text-stone-800 hover:text-[#0b3d2e] py-1"
            >
              Hair & Scalp Therapy
            </Link>
            <Link
              href="/products?category=skincare"
              onClick={() => setNavMenuOpen(false)}
              className="block text-sm font-semibold text-stone-800 hover:text-[#0b3d2e] py-1"
            >
              Clinical Skincare
            </Link>
            <div className="pt-3 border-t flex items-center justify-between text-xs font-bold">
              <Link href="/register" className="text-[#0b3d2e]">Register Account</Link>
              <Link href="/dashboard" className="text-stone-600">Member Portal</Link>
            </div>
          </div>
        )}

        {/* Category & Brand Title */}
        <div className="text-center space-y-1 mb-3 relative z-10">
          <span className="text-[11px] font-medium tracking-wide text-stone-500 uppercase block">
            {product.categoryTag}
          </span>
          <h2 className="text-sm sm:text-base font-extrabold tracking-widest text-stone-900 uppercase">
            {product.brand}
          </h2>
        </div>

        {/* Center 3D Floating Product Stage with Slide Numbers */}
        <div className="relative w-full h-72 sm:h-80 flex items-center justify-between my-2">
          
          {/* Left Slide Indicator (e.g. 01) & Prev Trigger */}
          <button
            onClick={handlePrev}
            className="text-xs font-extrabold text-stone-400 hover:text-stone-900 transition-colors p-2 z-20 flex flex-col items-center group"
            title="Previous Formulation"
          >
            <span className="font-mono tracking-wider">
              {String(currentIndex === 0 ? LUXURY_PRODUCTS.length : currentIndex).padStart(2, "0")}
            </span>
            <ChevronLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Central 3D Floating Bottle */}
          <div className="relative w-56 sm:w-64 h-full flex items-center justify-center group cursor-pointer">
            
            {/* Subtle Pedestal Reflection */}
            <div className="absolute bottom-2 w-32 h-6 bg-stone-900/10 rounded-full blur-md" />

            <Image
              key={product.id}
              src={product.imageUrl}
              alt={product.title}
              width={320}
              height={320}
              priority
              className="max-h-full max-w-full object-contain drop-shadow-2xl transition-all duration-700 animate-in fade-in zoom-in-95 group-hover:scale-110 group-hover:-translate-y-2"
            />
          </div>

          {/* Right Slide Indicator (e.g. 02) & Next Trigger */}
          <button
            onClick={handleNext}
            className="text-xs font-extrabold text-stone-400 hover:text-stone-900 transition-colors p-2 z-20 flex flex-col items-center group"
            title="Next Formulation"
          >
            <span className="font-mono tracking-wider">
              {String(((currentIndex + 1) % LUXURY_PRODUCTS.length) + 1).padStart(2, "0")}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 my-3">
          {LUXURY_PRODUCTS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setSelectedSizeIndex(1);
              }}
              className={`rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-2 h-2 bg-stone-900"
                  : "w-1.5 h-1.5 bg-stone-300 hover:bg-stone-400"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Big Product Name & Description */}
        <div className="text-center space-y-1.5 my-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
            {product.title}
          </h1>
          <p className="text-xs text-stone-500 font-medium max-w-xs mx-auto">
            {product.subtitle}
          </p>
        </div>

        {/* Size / Volume Pill Switchers (Like 1.7 oz / 2.5 oz in reference) */}
        <div className="flex items-center justify-center gap-2.5 my-4">
          {product.sizes.map((sz, sIdx) => {
            const isSelected = selectedSizeIndex === sIdx;
            return (
              <button
                key={sz.label}
                onClick={() => setSelectedSizeIndex(sIdx)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider transition-all duration-200 ${
                  isSelected
                    ? "bg-stone-900 text-white shadow-md"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {sz.label}
              </button>
            );
          })}
        </div>

        {/* Bottom Bar: Price | Floating (+) Button | Rating */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-2 relative">
          
          {/* Left: Price */}
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-stone-900 font-mono tracking-tight">
              ₹{currentSize.price.toLocaleString()}
            </span>
            {currentSize.mrp > currentSize.price && (
              <span className="text-[10px] text-stone-400 line-through font-mono">
                MRP ₹{currentSize.mrp.toLocaleString()}
              </span>
            )}
          </div>

          {/* Center: Floating White (+) Button */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-3">
            <button
              onClick={handleAddToCart}
              className={`w-13 h-13 rounded-full bg-white shadow-xl shadow-stone-900/20 border border-stone-200 flex items-center justify-center text-stone-900 hover:scale-110 active:scale-95 transition-all ${
                addedAnimation ? "bg-emerald-600 text-white border-emerald-600" : ""
              }`}
              title="Add Formulation to Bag"
            >
              {addedAnimation ? (
                <Check className="w-6 h-6 text-emerald-600 animate-in zoom-in" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Right: Rating */}
          <div className="flex items-center gap-1 text-stone-800">
            <span className="text-xs font-black font-mono">{product.rating}</span>
            <Star className="w-3.5 h-3.5 text-stone-900 fill-stone-900" />
          </div>

        </div>

      </div>

    </section>
  );
}
