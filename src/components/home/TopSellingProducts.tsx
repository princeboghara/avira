"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingBag,
  Eye,
  ArrowRight,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { ALL_CATALOG_PRODUCTS, FEATURED_HERO_PRODUCTS, ProductItem } from "@/data/homeProducts";

export default function TopSellingProducts() {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Take top 4 best sellers
  const top4 = (FEATURED_HERO_PRODUCTS || ALL_CATALOG_PRODUCTS || []).slice(0, 4);

  return (
    <section id="top-selling" className="py-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1b3b32] block mb-1">
              Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Best Selling Ayurvedic Formulations
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-[#1b3b32] hover:text-[#234e40] flex items-center gap-1 uppercase tracking-wider transition-colors"
          >
            <span>View Catalog (40+ Products)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Clean E-Commerce Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {top4.map((product) => {
            const discountPercent =
              product.mrp > product.discountPrice
                ? Math.round(((product.mrp - product.discountPrice) / product.mrp) * 100)
                : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 flex flex-col justify-between group border border-stone-200 hover:border-stone-400 hover:shadow-md transition-all duration-300 relative"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-2 w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b3b32] bg-[#f4f1ea] px-2 py-0.5 rounded-md">
                    {product.tag || "Best Seller"}
                  </span>

                  {discountPercent > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#1b3b32] text-white text-[10px] font-bold">
                      {discountPercent}% OFF
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-400 font-medium">
                      {product.netQuantity}
                    </span>
                  )}
                </div>

                {/* Cloudinary Image Stage */}
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="w-full h-52 bg-[#fbfaf8] rounded-xl mb-3 relative overflow-hidden flex items-center justify-center p-3 cursor-pointer group-hover:bg-[#f7f5f0] transition-colors border border-stone-100"
                >
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={260}
                    height={260}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105 duration-300 drop-shadow-sm"
                  />

                  {/* Quick View Button on Hover */}
                  <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 rounded-xl bg-white text-stone-900 font-bold text-xs flex items-center gap-1.5 shadow-md border border-stone-200">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <span className="text-[11px] text-stone-600 font-medium">
                      ({product.reviewCount || 120})
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 line-clamp-1 mb-1 group-hover:text-[#1b3b32] transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Pricing & Actions */}
                <div className="pt-3 border-t border-stone-100 mt-auto flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black text-[#1b3b32] font-mono block">
                      ₹{product.discountPrice.toLocaleString()}
                    </span>
                    {product.mrp > product.discountPrice && (
                      <span className="text-[11px] text-stone-400 line-through font-mono">
                        ₹{product.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Link
                      href="/register"
                      className="px-3.5 py-1.5 rounded-xl bg-[#1b3b32] hover:bg-[#234e40] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
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

      </div>

      {/* Quick-View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm animate-in fade-in"
            onClick={() => setSelectedProduct(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden animate-in zoom-in-95 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative h-64 sm:h-80 bg-[#f7f5f0] rounded-2xl flex items-center justify-center p-6 border border-stone-200">
                <Image
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  width={340}
                  height={340}
                  className="max-h-full max-w-full object-contain drop-shadow-md"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-[#1b3b32] text-white text-[11px] font-bold">
                  {selectedProduct.netQuantity}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1b3b32] mb-1">
                  {selectedProduct.category}
                </span>

                <h3 className="text-2xl font-extrabold text-stone-900 leading-tight mb-2">
                  {selectedProduct.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-xs text-stone-600 font-medium">
                    {selectedProduct.rating || 4.9} ({selectedProduct.reviewCount || 100} reviews)
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  {selectedProduct.description}
                </p>

                <div className="space-y-2 mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Key Ingredients
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.ingredients?.map((ing, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-stone-100 text-xs text-stone-800 font-medium border border-stone-200"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-1">
                      Benefits
                    </h4>
                    {selectedProduct.benefits?.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-stone-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-[#1b3b32] font-mono">
                      ₹{selectedProduct.discountPrice.toLocaleString()}
                    </span>
                    {selectedProduct.mrp > selectedProduct.discountPrice && (
                      <span className="text-xs text-stone-400 line-through font-mono ml-2">
                        MRP ₹{selectedProduct.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <Link
                    href="/register"
                    className="px-6 py-3 rounded-xl bg-[#1b3b32] hover:bg-[#234e40] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
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
