"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Star,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowLeft,
  Eye,
  ShoppingBag,
  SlidersHorizontal,
  FlaskConical,
} from "lucide-react";
import HomeNavbar from "@/components/home/HomeNavbar";
import HomeFooter from "@/components/home/HomeFooter";
import { ALL_CATALOG_PRODUCTS, ProductItem } from "@/data/homeProducts";

const CATEGORIES = [
  { id: "all", label: "All Formulations" },
  { id: "juices", label: "Himalayan Bio-Juices" },
  { id: "wellness", label: "Immunity & Performance" },
  { id: "haircare", label: "Hair & Scalp Therapy" },
  { id: "skincare", label: "Clinical Skincare" },
  { id: "agriculture", label: "Organic Plant Science" },
];

export default function AllProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating">("featured");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const filteredProducts = useMemo(() => {
    let result = ALL_CATALOG_PRODUCTS.filter((prod) => {
      const matchCategory =
        activeCategory === "all" || prod.categorySlug === activeCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });

    const getCategoryPriority = (cat?: string) => {
      if (!cat) return 2;
      if (/health/i.test(cat)) return 1;
      if (/agri/i.test(cat)) return 3;
      return 2;
    };

    if (sortBy === "price-low") {
      result.sort((a, b) => a.discountPrice - b.discountPrice);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.discountPrice - a.discountPrice);
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Default: Health Care first, Agriculture last
      result.sort((a, b) => {
        const pA = getCategoryPriority(a.category);
        const pB = getCategoryPriority(b.category);
        return pA - pB;
      });
    }

    return result;
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen flex flex-col font-sans">
      <HomeNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb & Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0b3d2e] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-[#0b3d2e]">{filteredProducts.length}</strong> formulations
          </span>
        </div>

        {/* Page Title & Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0b3d2e] text-xs font-bold mb-3 border border-emerald-100">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Full Storefront & Laboratory Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              All Organic & Ayurvedic Formulations
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore our complete botanical collection of wild-harvested juices, clinical herbal supplements, scalp therapies, and pure organic agriculture conditioners.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-[#0b3d2e] text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search formulations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0b3d2e] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0b3d2e] cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Full Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
            <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No formulations found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or reset your category filters.
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-5 py-2 rounded-xl bg-[#0b3d2e] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const discountPercent =
                product.mrp > product.discountPrice
                  ? Math.round(((product.mrp - product.discountPrice) / product.mrp) * 100)
                  : 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-5 flex flex-col justify-between group border border-slate-200 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Top Tag Row */}
                  <div className="flex items-center justify-between mb-3 w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b3d2e] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
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
                    className="w-full h-52 bg-slate-50/70 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center p-3 cursor-pointer group-hover:bg-emerald-50/20 transition-colors border border-slate-100"
                  >
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={280}
                      height={280}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain transition-transform group-hover:scale-108 duration-500 drop-shadow-md"
                    />

                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3.5 py-1.5 rounded-xl bg-white text-[#0b3d2e] font-bold text-xs flex items-center gap-1.5 shadow-md border border-slate-200">
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
                            className="w-3 h-3 text-amber-400 fill-amber-400"
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        ({product.reviewCount || 100})
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-[#0b3d2e] transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Key Ingredients */}
                    {product.ingredients && product.ingredients.length > 0 && (
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md line-clamp-1">
                          <Sparkles className="w-3 h-3 text-[#0b3d2e] shrink-0" />
                          <span className="truncate">{product.ingredients.join(" • ")}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pricing & Actions */}
                  <div className="pt-3 border-t border-slate-100 mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-[#0b3d2e] font-mono block">
                        ₹{product.discountPrice.toLocaleString()}
                      </span>
                      {product.mrp > product.discountPrice && (
                        <span className="text-[10px] text-slate-400 line-through font-mono">
                          MRP ₹{product.mrp.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href="/register"
                        className="px-3.5 py-1.5 rounded-xl bg-[#0b3d2e] hover:bg-[#072b20] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
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
        )}

      </main>

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
                    {selectedProduct.rating || 4.9} ({selectedProduct.reviewCount || 100} customer reviews)
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

      <HomeFooter />
    </div>
  );
}
