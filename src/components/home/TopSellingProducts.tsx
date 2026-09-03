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
} from "lucide-react";
import { ALL_CATALOG_PRODUCTS, FEATURED_HERO_PRODUCTS, ProductItem } from "@/data/homeProducts";

export default function TopSellingProducts() {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Take top 4 best sellers
  const top4 = (FEATURED_HERO_PRODUCTS || ALL_CATALOG_PRODUCTS || []).slice(0, 4);

  return (
    <section id="top-selling" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#006d36] block mb-1">
              Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0f172a] tracking-tight">
              Best Selling Ayurvedic Formulations
            </h2>
          </div>
          <Link
            href="/products"
            className="neo-btn-secondary text-xs font-bold px-4 py-2 rounded-2xl flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>View Catalog (40+ Formulations)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 E-Commerce Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {top4.map((product) => {
            const discountPercent =
              product.mrp > product.discountPrice
                ? Math.round(((product.mrp - product.discountPrice) / product.mrp) * 100)
                : 0;

            return (
              <div
                key={product.id}
                className="glass-card rounded-[32px] p-4 flex flex-col justify-between group neo-card-hover relative"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-2 w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#006d36] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {product.tag || "Best Seller"}
                  </span>

                  {discountPercent > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#006d36] text-white text-[10px] font-bold">
                      {discountPercent}% OFF
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#64748b] font-medium">
                      {product.netQuantity}
                    </span>
                  )}
                </div>

                {/* Cloudinary Image Stage */}
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="w-full h-52 neo-inset rounded-2xl mb-3 relative overflow-hidden flex items-center justify-center p-3 cursor-pointer group-hover:bg-white/90 transition-colors"
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
                  <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="glass-pill px-4 py-2 rounded-2xl text-[#0f172a] font-bold text-xs flex items-center gap-1.5 shadow-md">
                      <Eye className="w-3.5 h-3.5 text-[#006d36]" />
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
                    <span className="text-[11px] text-[#64748b] font-medium">
                      ({product.reviewCount || 120})
                    </span>
                  </div>

                  <h3 className="text-sm font-heading font-extrabold text-[#0f172a] line-clamp-1 mb-1 group-hover:text-[#006d36] transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-xs text-[#64748b] line-clamp-2 mb-3 leading-relaxed font-medium">
                    {product.description}
                  </p>
                </div>

                {/* Pricing & Actions */}
                <div className="pt-3 border-t border-gray-100 mt-auto flex items-center justify-between">
                  <div>
                    <span className="text-lg font-heading font-extrabold text-[#006d36] block">
                      ₹{product.discountPrice.toLocaleString()}
                    </span>
                    {product.mrp > product.discountPrice && (
                      <span className="text-[11px] text-[#94a3b8] line-through font-mono">
                        ₹{product.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="neo-btn-icon p-2 rounded-xl text-[#64748b] hover:text-[#0f172a] cursor-pointer"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Link
                      href="/register"
                      className="neo-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md animate-fadeIn"
            onClick={() => setSelectedProduct(null)}
          />

          <div className="relative w-full max-w-2xl glass-card rounded-[36px] shadow-2xl p-6 sm:p-8 z-10 overflow-hidden animate-slideRight max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProduct(null)}
              className="neo-btn-icon absolute top-5 right-5 p-2 rounded-2xl text-[#64748b] hover:text-[#0f172a] cursor-pointer z-20"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative h-64 sm:h-80 neo-inset rounded-2xl flex items-center justify-center p-6">
                <Image
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  width={340}
                  height={340}
                  className="max-h-full max-w-full object-contain drop-shadow-md"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#006d36] text-white text-[10px] font-bold">
                  {selectedProduct.netQuantity}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#006d36] mb-1">
                  {selectedProduct.category}
                </span>

                <h3 className="text-2xl font-heading font-extrabold text-[#0f172a] leading-tight mb-2">
                  {selectedProduct.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-xs text-[#64748b] font-medium">
                    {selectedProduct.rating || 4.9} ({selectedProduct.reviewCount || 100} reviews)
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed mb-4 font-medium">
                  {selectedProduct.description}
                </p>

                <div className="space-y-2 mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                    Key Ingredients
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.ingredients?.map((ing, i) => (
                      <span
                        key={i}
                        className="glass-pill px-3 py-1 rounded-full text-xs text-[#0f172a] font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-1">
                      Benefits
                    </h4>
                    {selectedProduct.benefits?.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#475569]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#006d36] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-heading font-extrabold text-[#006d36]">
                      ₹{selectedProduct.discountPrice.toLocaleString()}
                    </span>
                    {selectedProduct.mrp > selectedProduct.discountPrice && (
                      <span className="text-xs text-[#94a3b8] line-through font-mono ml-2">
                        MRP ₹{selectedProduct.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <Link
                    href="/register"
                    className="neo-btn-primary px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
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
