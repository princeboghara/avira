"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  Eye,
  ShoppingBag,
  FlaskConical,
  Grid,
} from "lucide-react";
import { ALL_CATALOG_PRODUCTS, ProductItem } from "@/data/homeProducts";

export default function HomeProducts() {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Take top 6 flagship/popular products for clean homepage display
  const featuredProducts = ALL_CATALOG_PRODUCTS.slice(0, 6);

  return (
    <section id="products" className="py-24 bg-white relative z-20 overflow-hidden border-t border-slate-200/60">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-14 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-[#0b3d2e] font-bold text-xs mb-3 shadow-xs uppercase tracking-wider">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Featured Formulations</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Flagship Organic Formulations
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl text-balance">
            Manufactured to sterile GMP standards with standardized bioactive botanical extracts. 100% vegetarian, chemical-free, and third-party laboratory verified.
          </p>
        </div>

        {/* 6 Featured Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {featuredProducts.map((product) => {
            const discountPercent =
              product.mrp > product.discountPrice
                ? Math.round(((product.mrp - product.discountPrice) / product.mrp) * 100)
                : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-6 flex flex-col justify-between group border border-slate-200 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                {/* Top Tag Row */}
                <div className="flex items-center justify-between mb-3 w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b3d2e] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    {product.category}
                  </span>

                  {discountPercent > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#0b3d2e] text-white text-[10px] font-bold">
                      {discountPercent}% OFF
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {product.netQuantity}
                    </span>
                  )}
                </div>

                {/* Cloudinary Image Stage */}
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="w-full h-60 bg-slate-50/70 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center p-4 cursor-pointer group-hover:bg-emerald-50/20 transition-colors border border-slate-100"
                >
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={280}
                    height={280}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain transition-transform group-hover:scale-108 duration-500 drop-shadow-md"
                  />

                  {/* Quick View Button on Hover */}
                  <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 rounded-xl bg-white text-[#0b3d2e] font-bold text-xs flex items-center gap-1.5 shadow-md border border-slate-200">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-1.5">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({product.reviewCount})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-[#0b3d2e] transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Key Ingredients Pill */}
                  {product.ingredients && product.ingredients.length > 0 && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md line-clamp-1">
                        <Sparkles className="w-3 h-3 text-[#0b3d2e] shrink-0" />
                        <span className="truncate">{product.ingredients.join(" • ")}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Pricing & Actions */}
                <div className="pt-3 border-t border-slate-100 mt-auto flex items-center justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-[#0b3d2e] font-mono block">
                      ₹{product.discountPrice.toLocaleString()}
                    </span>
                    {product.mrp > product.discountPrice && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        MRP ₹{product.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Link
                      href="/register"
                      className="px-4 py-2 rounded-xl bg-[#0b3d2e] hover:bg-[#072b20] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Order</span>
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* View All Products CTA Button */}
        <div className="text-center pt-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#0b3d2e] hover:bg-[#072b20] text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#0b3d2e]/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            <Grid className="w-4 h-4 text-emerald-300" />
            <span>View All Formulations (40+ Products)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Quick-View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
            onClick={() => setSelectedProduct(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden animate-in zoom-in-95 border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Product Image Stage */}
              <div className="relative h-64 sm:h-80 bg-slate-50 rounded-2xl flex items-center justify-center p-6 border border-slate-100">
                <Image
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  width={340}
                  height={340}
                  className="max-h-full max-w-full object-contain drop-shadow-xl"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-[#0b3d2e] text-white text-[11px] font-bold shadow-xs">
                  {selectedProduct.netQuantity}
                </div>
              </div>

              {/* Product Details */}
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0b3d2e] mb-1">
                  {selectedProduct.category}
                </span>

                <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">
                  {selectedProduct.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-600 font-medium">
                    {selectedProduct.rating} ({selectedProduct.reviewCount} customer reviews)
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {selectedProduct.description}
                </p>

                {/* Key Ingredients */}
                <div className="space-y-2 mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Active Bioactive Botanicals
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.ingredients?.map((ing, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-slate-100 text-xs text-slate-800 font-medium border border-slate-200"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                      Clinical Benefits
                    </h4>
                    {selectedProduct.benefits?.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-[#0b3d2e] font-mono">
                      ₹{selectedProduct.discountPrice.toLocaleString()}
                    </span>
                    {selectedProduct.mrp > selectedProduct.discountPrice && (
                      <span className="text-xs text-slate-400 line-through font-mono ml-2">
                        MRP ₹{selectedProduct.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <Link
                    href="/register"
                    className="px-6 py-3 rounded-xl bg-[#0b3d2e] hover:bg-[#072b20] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#0b3d2e]/20 transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Order Online</span>
                  </Link>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
}
