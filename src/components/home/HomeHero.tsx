"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface HeroBanner {
  id: string;
  pillBadge: string;
  headline: string;
  subheadline: string;
  benefitBullets: string[];
  price: number;
  mrp: number;
  netQty: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  productLink: string;
  bgTone: string;
  accentBadgeColor: string;
}

const BANNERS: HeroBanner[] = [
  {
    id: "sea-buckthorn",
    pillBadge: "Direct from Spiti Valley • 12,000+ Ft",
    headline: "Wild Himalayan Sea Buckthorn Berry Juice",
    subheadline: "Cold-pressed without boiling. Loaded with rare Omega-7 and 190+ vital bio-nutrients.",
    benefitBullets: [
      "Natural source of rare Omega 3, 6, 7 & 9",
      "Zero added sugar, artificial color, or water dilution",
      "FSSAI Approved & Certified 100% Vegetarian",
    ],
    price: 1299,
    mrp: 1799,
    netQty: "500 ml Glass Bottle",
    rating: 4.9,
    reviews: 384,
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787916782/AVIRALIFECARE/products/avira-sea-buckthorn-juice.jpg",
    productLink: "/products?category=juices",
    bgTone: "from-[#fbf7ee] via-[#f7f3e8] to-[#f4eee0]",
    accentBadgeColor: "bg-amber-100 text-amber-900 border-amber-200",
  },
  {
    id: "shilajit",
    pillBadge: "Gold Standard Rasayana • 60% Fulvic Acid",
    headline: "Pure Himalayan Shilajit & Ashwagandha",
    subheadline: "Purified using traditional Triphala decoction for sustained natural physical & mental vitality.",
    benefitBullets: [
      "Rich in 84+ ionic minerals & Fulvic Acid",
      "Boosts cellular energy & stamina without crash",
      "HPLC Laboratory tested for heavy metal safety",
    ],
    price: 1599,
    mrp: 1999,
    netQty: "60 Veggie Capsules",
    rating: 4.9,
    reviews: 290,
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917337/AVIRALIFECARE/products/avira-maxx-power-capsule.jpg",
    productLink: "/products?category=wellness",
    bgTone: "from-[#f7f5f0] via-[#f3efe6] to-[#eee8dc]",
    accentBadgeColor: "bg-stone-200 text-stone-900 border-stone-300",
  },
  {
    id: "haircare",
    pillBadge: "Classical Kshirpak Vidhi • 24 Herbs",
    headline: "24 Herbs Ayurvedic Scalp & Hair Cleanser",
    subheadline: "Sulfate and paraben free daily wash that reduces root shedding and restores natural volume.",
    benefitBullets: [
      "Infused with Bhringraj, Shikakai, Reetha & Amla",
      "Strengthens hair roots and soothes dry scalp",
      "Gentle daily cleanse with zero harmful chemicals",
    ],
    price: 499,
    mrp: 699,
    netQty: "200 ml Bottle",
    rating: 4.85,
    reviews: 420,
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787917326/AVIRALIFECARE/products/avira-24-herbs-shampoo.jpg",
    productLink: "/products?category=haircare",
    bgTone: "from-[#eef7f2] via-[#e6f2ec] to-[#dceee4]",
    accentBadgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  {
    id: "faminor",
    pillBadge: "Women's Wellness • 100% Ayurvedic",
    headline: "Avira Faminor Restorative Health Tonic",
    subheadline: "Time-tested herbal decoction with Shatavari, Lodhra & Ashoka for natural female vitality.",
    benefitBullets: [
      "Supports monthly cycle balance & hormonal harmony",
      "Natural iron and calcium nourishing tonic",
      "Safe, gentle, and chemical-free botanical recipe",
    ],
    price: 699,
    mrp: 899,
    netQty: "500 ml Tonic",
    rating: 4.9,
    reviews: 310,
    imageUrl:
      "https://res.cloudinary.com/lj87jjg9/image/upload/v1787916771/AVIRALIFECARE/products/avira-faminor-juice.jpg",
    productLink: "/products?category=wellness",
    bgTone: "from-[#fdf2f4] via-[#faeaed] to-[#f7e0e4]",
    accentBadgeColor: "bg-rose-100 text-rose-900 border-rose-200",
  },
];

export default function HomeHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const banner = BANNERS[currentSlide];
  const discount = Math.round(((banner.mrp - banner.price) / banner.mrp) * 100);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#f7f5f0] border-b border-stone-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={`w-full bg-gradient-to-r ${banner.bgTone} transition-all duration-700 py-10 sm:py-16`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Authentic Brand Headline & Bullets */}
            <div className="lg:col-span-7 flex flex-col items-start gap-5 text-left">
              
              {/* Origin Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border ${banner.accentBadgeColor}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{banner.pillBadge}</span>
              </div>

              {/* Real Editorial Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1c1917] tracking-tight leading-[1.18]">
                {banner.headline}
              </h1>

              {/* Sub-headline */}
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl font-medium">
                {banner.subheadline}
              </p>

              {/* Benefit Bullets */}
              <div className="space-y-2 pt-1 w-full max-w-lg">
                {banner.benefitBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#1b3b32] shrink-0" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              {/* Price & Discount Bar */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-baseline gap-2.5 bg-white px-4 py-2 rounded-2xl border border-stone-300 shadow-xs">
                  <span className="text-2xl sm:text-3xl font-black text-[#1b3b32] font-mono">
                    ₹{banner.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-stone-400 line-through font-mono">
                    ₹{banner.mrp.toLocaleString()}
                  </span>
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {discount}% OFF
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-white/80 px-3 py-2 rounded-xl border border-stone-200">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <span className="font-bold text-stone-900">{banner.rating}</span>
                  <span>({banner.reviews} reviews)</span>
                </div>
              </div>

              {/* Main Action CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href={banner.productLink}
                  className="px-8 py-4 rounded-xl bg-[#1b3b32] hover:bg-[#234e40] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Shop This Formulation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/products"
                  className="px-7 py-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <span>View All 40+ Products</span>
                </Link>
              </div>

            </div>

            {/* Right Column: Studio Product Staging */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md h-80 sm:h-96 bg-white rounded-3xl p-6 sm:p-8 flex items-center justify-center border border-stone-200/90 shadow-xl shadow-stone-900/5 group">
                
                <Image
                  key={banner.id}
                  src={banner.imageUrl}
                  alt={banner.headline}
                  width={380}
                  height={380}
                  priority
                  className="max-h-full max-w-full object-contain drop-shadow-xl transition-all duration-700 animate-in fade-in zoom-in-95 group-hover:scale-105"
                />

                {/* Net Qty Tag */}
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-xl bg-[#1b3b32] text-white text-[11px] font-semibold">
                  {banner.netQty}
                </div>

                {/* Certified Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-[#f4f1ea] border border-stone-300 text-stone-800 text-[11px] font-bold">
                  100% Ayurvedic
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Carousel Navigation Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {BANNERS.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? "w-8 bg-[#1b3b32]"
                    : "w-2.5 bg-stone-300 hover:bg-stone-400"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentSlide((prev) =>
                  prev === 0 ? BANNERS.length - 1 : prev - 1
                )
              }
              className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % BANNERS.length)}
              className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
