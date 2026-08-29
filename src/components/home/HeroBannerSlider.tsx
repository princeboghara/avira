"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  FlaskConical,
  Star,
  CheckCircle2,
  Leaf,
  Activity,
  Dna,
} from "lucide-react";

interface BannerSlide {
  id: string;
  tag: string;
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  description: string;
  mrp: number;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  categoryLink: string;
  accentGlow: string;
  specs: { label: string; value: string }[];
}

const SLIDES: BannerSlide[] = [
  {
    id: "sea-buckthorn",
    tag: "Wild Himalayan Harvest • 12,000+ Ft",
    badge: "100% Cold Bio-Extracted",
    title: "Pure Himalayan",
    titleHighlight: "Sea Buckthorn Berry",
    subtitle: "Bioactive Omega 3, 6, 7 & 9 Cellular Elixir",
    description:
      "Cold-extracted from wild Himalayan berries harvested at 12,000+ feet. Standardized with 190+ bioactive nutrients and rare Omega-7 to accelerate cellular repair, restore gut microflora, and boost immune longevity.",
    mrp: 1799,
    price: 1299,
    rating: 4.95,
    reviewCount: 384,
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787916782/AVIRALIFECARE/products/avira-sea-buckthorn-juice.jpg",
    categoryLink: "/products?category=juices",
    accentGlow: "from-amber-400/20 via-emerald-500/15 to-transparent",
    specs: [
      { label: "Bioactive Nutrients", value: "190+ Compounds" },
      { label: "Extraction", value: "Zero Thermal Cold" },
      { label: "Purity Grade", value: "100% Himalayan" },
    ],
  },
  {
    id: "shilajit",
    tag: "Grade-A Gold Standard Rasayana",
    badge: "84+ Ionic Minerals & 60% Fulvic Acid",
    title: "Purified Himalayan",
    titleHighlight: "Shilajit & Ashwagandha",
    subtitle: "Mitochondrial ATP Energy & Peak Performance",
    description:
      "Purified through classical Triphala decoction. Enriched with 84+ ionic trace minerals to supercharge mitochondrial ATP energy production, combat executive burnout, and revitalize male vigor.",
    mrp: 1999,
    price: 1599,
    rating: 4.9,
    reviewCount: 290,
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917337/AVIRALIFECARE/products/avira-maxx-power-capsule.jpg",
    categoryLink: "/products?category=wellness",
    accentGlow: "from-amber-500/20 via-slate-900/10 to-transparent",
    specs: [
      { label: "Fulvic Acid", value: "60%+ Active" },
      { label: "Process", value: "Triphala Shodhana" },
      { label: "Form", value: "Gold Veggie Caps" },
    ],
  },
  {
    id: "haircare",
    tag: "Vedic Kshirpak Vidhi Decoction",
    badge: "24 Sacred Medicinal Botanicals",
    title: "24 Herbs Follicle",
    titleHighlight: "Cleanser & Root Therapy",
    subtitle: "Dermal Papilla Cell Restoration",
    description:
      "Infused with Bhringraj, Brahmi, Shikakai, and Amla processed using the ancient Kshirpak Vidhi technique. Strengthens root anchoring, prevents follicle miniaturization, and halts hair shedding by 80%.",
    mrp: 699,
    price: 499,
    rating: 4.88,
    reviewCount: 420,
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917326/AVIRALIFECARE/products/avira-24-herbs-shampoo.jpg",
    categoryLink: "/products?category=haircare",
    accentGlow: "from-emerald-500/20 via-teal-500/10 to-transparent",
    specs: [
      { label: "Herbal Blend", value: "24 Ayurvedic Herbs" },
      { label: "Shedding Control", value: "Up to 80%" },
      { label: "Safety", value: "Zero Sulfates/Parabens" },
    ],
  },
  {
    id: "faminor",
    tag: "Targeted Ayurvedic Health Tonic",
    badge: "100% Herbal Synergistic Tonic",
    title: "Avira Faminor",
    titleHighlight: "Women's Health Tonic",
    subtitle: "Natural Hormonal Rhythm & Vitality Balance",
    description:
      "Synergistic classical herbal tonic with Shatavari, Ashoka, Lodhra, and Dashmool. Designed for total reproductive harmony, stress regulation, and restored natural vitality.",
    mrp: 899,
    price: 699,
    rating: 4.92,
    reviewCount: 310,
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787916771/AVIRALIFECARE/products/avira-faminor-juice.jpg",
    categoryLink: "/products?category=wellness",
    accentGlow: "from-rose-500/15 via-emerald-500/10 to-transparent",
    specs: [
      { label: "Classical Herbs", value: "Shatavari & Ashoka" },
      { label: "Action", value: "Hormonal Balance" },
      { label: "Standard", value: "100% Vegetarian" },
    ],
  },
];

export default function HeroBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000); // 5s auto-swipe
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SLIDES[currentSlide];

  return (
    <section
      className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#f8fafc] via-white to-[#f8fafc] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3D Atmospheric Glowing Backdrops */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl bg-gradient-to-tr ${slide.accentGlow} transition-all duration-1000 opacity-60`}
        />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full blur-3xl bg-emerald-100/50" />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Bold Editorial Content */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            
            {/* Top Verified Chip */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs text-xs font-bold tracking-wide text-[#0b3d2e]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>{slide.tag}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0b3d2e]" />
                {slide.badge}
              </span>
            </div>

            {/* Massive Heading */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                {slide.title} <br />
                <span className="bg-gradient-to-r from-[#0b3d2e] via-[#10b981] to-[#047857] bg-clip-text text-transparent">
                  {slide.titleHighlight}
                </span>
              </h1>
              <p className="text-base sm:text-lg font-bold text-[#0b3d2e] mt-2 tracking-wide">
                {slide.subtitle}
              </p>
            </div>

            {/* Sub-text Description */}
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
              {slide.description}
            </p>

            {/* 3 Interactive Spec Chips */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
              {slide.specs.map((spec, i) => (
                <div
                  key={i}
                  className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {spec.label}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 mt-0.5">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Price & Rating Display */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-[#0b3d2e] font-mono">
                  ₹{slide.price.toLocaleString()}
                </span>
                {slide.mrp > slide.price && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    MRP ₹{slide.mrp.toLocaleString()}
                  </span>
                )}
                {slide.mrp > slide.price && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#0b3d2e] text-xs font-extrabold border border-emerald-200">
                    Save ₹{(slide.mrp - slide.price).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4 py-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {slide.rating} ({slide.reviewCount}+ reviews)
                </span>
              </div>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <Link
                href="/products"
                className="px-8 py-4 rounded-2xl bg-[#0b3d2e] hover:bg-[#072b20] text-white font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-[#0b3d2e]/25 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <span>Shop Formulation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/register"
                className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all"
              >
                <span>Join Associate Club</span>
              </Link>
            </div>

          </div>

          {/* Right Column: 3D Floating Frosted Pedestal Showcase */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            
            {/* Outer Glow Halo Ring */}
            <div className="absolute inset-0 w-80 h-80 sm:w-96 sm:h-96 mx-auto my-auto rounded-full border-2 border-dashed border-emerald-400/30 animate-spin-slow pointer-events-none" />

            <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-2xl shadow-slate-900/10 flex flex-col items-center justify-between group overflow-hidden">
              
              {/* Top Pill on Card */}
              <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0b3d2e] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Featured Formulation
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Slide {currentSlide + 1} of {SLIDES.length}
                </span>
              </div>

              {/* 3D Central Product Canvas */}
              <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-slate-50 to-white rounded-2xl p-6 flex items-center justify-center overflow-hidden border border-slate-100">
                <Image
                  key={slide.id}
                  src={slide.imageUrl}
                  alt={slide.title}
                  width={380}
                  height={380}
                  priority
                  className="max-h-full max-w-full object-contain drop-shadow-2xl transition-all duration-700 animate-in fade-in zoom-in-95 group-hover:scale-108"
                />

                {/* Floating Metric 1 */}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-900/85 text-white text-[11px] font-bold backdrop-blur-md shadow-lg flex items-center gap-1.5">
                  <Dna className="w-3.5 h-3.5 text-emerald-400" />
                  <span>99.8% Bioactive Retention</span>
                </div>

                {/* Floating Metric 2 */}
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white/95 text-[#0b3d2e] text-[11px] font-extrabold border border-slate-200 shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>HPLC Tested</span>
                </div>
              </div>

              {/* Slide Title on Card */}
              <div className="w-full mt-4 text-center">
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {slide.title} {slide.titleHighlight}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standardized Ayurvedic Extract • GMP Sterile Facility
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Slide Switcher Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Thumbnails / Slide Titles */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${
                  idx === currentSlide
                    ? "bg-[#0b3d2e] text-white shadow-md shadow-[#0b3d2e]/15"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    idx === currentSlide ? "bg-emerald-300" : "bg-slate-300"
                  }`}
                />
                <span>{s.title}</span>
              </button>
            ))}
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1))
              }
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-xs"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-xs"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      <style jsx>{`
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 25s linear infinite;
        }
      `}</style>
    </section>
  );
}
