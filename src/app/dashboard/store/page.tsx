"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Plus,
  Minus,
  Sparkles,
  CheckCircle2,
  Package,
  ArrowRight,
  Loader2,
  ShoppingCart,
  Search,
  Star,
  ShieldCheck,
  Truck,
  Zap,
  Tag,
  Eye,
  X,
  Check,
  ChevronDown,
  Filter,
  Flame,
  Award,
} from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import { Product, User } from "@/types";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CleanAmazonMemberStorePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedSort, setSelectedSort] = useState<"featured" | "price_asc" | "price_desc" | "pv_desc" | "discount">("featured");
  const [pvFilter, setPvFilter] = useState<"ALL" | "100PV" | "UNDER50">("ALL");

  // Cart, Toast & Button Micro-Animations
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [animatingAction, setAnimatingAction] = useState<"cart" | "buy" | null>(null);

  // Quick View Product Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);

  // Load User & Cart from localStorage
  useEffect(() => {
    async function loadData() {
      try {
        const [userData, prodData] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
          fetch("/api/products", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        ]);

        if (userData?.success && userData.user) {
          setUser(userData.user);
        }

        if (prodData?.success && Array.isArray(prodData.products)) {
          setProducts(prodData.products);
        }
      } catch (err) {
        console.error("Error loading store data:", err);
      } finally {
        setLoading(false);
      }

      try {
        const saved = localStorage.getItem("aviracare_cart");
        if (saved) {
          setCart(JSON.parse(saved));
        }
      } catch {
        // ignore parse error
      }
    }
    loadData();
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("aviracare_cart", JSON.stringify(newCart));
    } catch {
      // ignore
    }
  };

  const categories = useMemo(() => {
    const rawCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    const healthcare = rawCategories.filter((c) => /health/i.test(c));
    const agriculture = rawCategories.filter((c) => /agri/i.test(c));
    const others = rawCategories.filter((c) => !/health/i.test(c) && !/agri/i.test(c));
    return ["ALL", ...healthcare, ...others, ...agriculture];
  }, [products]);

  const getItemQuantity = (productId: string) => {
    const found = cart.find((it) => it.product.id === productId);
    return found ? found.quantity : 0;
  };

  const handleAddToCart = (product: Product, qty: number = 1) => {
    setAnimatingId(product.id);
    setAnimatingAction("cart");
    setTimeout(() => {
      setAnimatingId(null);
      setAnimatingAction(null);
    }, 600);

    const existing = cart.find((it) => it.product.id === product.id);
    let updated: CartItem[];
    if (existing) {
      updated = cart.map((it) =>
        it.product.id === product.id ? { ...it, quantity: it.quantity + qty } : it
      );
    } else {
      updated = [...cart, { product, quantity: qty }];
    }
    saveCart(updated);

    setAddedToast(`Added "${product.name}" to cart!`);
    setTimeout(() => setAddedToast(null), 2500);
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    let updated: CartItem[];
    if (newQty <= 0) {
      updated = cart.filter((it) => it.product.id !== productId);
    } else {
      updated = cart.map((it) =>
        it.product.id === productId ? { ...it, quantity: newQty } : it
      );
    }
    saveCart(updated);
  };

  // Buy Now adds to cart and redirects directly to CART with smooth feedback
  const handleBuyNow = (product: Product) => {
    setAnimatingId(product.id);
    setAnimatingAction("buy");
    handleAddToCart(product, 1);
    setTimeout(() => {
      router.push("/dashboard/cart");
    }, 300);
  };

  // Filter and Sort Logic (Health Care FIRST, Agriculture LAST in All Products)
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Category Filter
      if (selectedCategory !== "ALL" && p.category !== selectedCategory) {
        return false;
      }
      // PV Filter
      if (pvFilter === "100PV" && (p.pv || 0) < 100) return false;
      if (pvFilter === "UNDER50" && (p.pv || 0) >= 50) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (p.name || "").toLowerCase().includes(q);
        const matchesCat = (p.category || "").toLowerCase().includes(q);
        const matchesDesc = (p.description || "").toLowerCase().includes(q);
        const matchesHsn = (p.hsnCode || "").toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesDesc && !matchesHsn) {
          return false;
        }
      }
      return true;
    });

    // Priority Category Weight Helper:
    // Health Care = 1 (First), Others = 2 (Middle), Agriculture = 3 (Last)
    const getCategoryPriority = (cat?: string) => {
      if (!cat) return 2;
      if (/health/i.test(cat)) return 1;
      if (/agri/i.test(cat)) return 3;
      return 2;
    };

    // Sorting
    return [...result].sort((a, b) => {
      // When browsing All Products or default featured sort, guarantee Health Care is FIRST and Agriculture is LAST
      if (selectedCategory === "ALL" && selectedSort === "featured") {
        const prioA = getCategoryPriority(a.category);
        const prioB = getCategoryPriority(b.category);
        if (prioA !== prioB) {
          return prioA - prioB;
        }
      }

      const priceA = a.discountPrice || a.mrp || 0;
      const priceB = b.discountPrice || b.mrp || 0;
      if (selectedSort === "price_asc") return priceA - priceB;
      if (selectedSort === "price_desc") return priceB - priceA;
      if (selectedSort === "pv_desc") return (b.pv || 0) - (a.pv || 0);
      if (selectedSort === "discount") {
        const discA = a.mrp > priceA ? ((a.mrp - priceA) / a.mrp) * 100 : 0;
        const discB = b.mrp > priceB ? ((b.mrp - priceB) / b.mrp) * 100 : 0;
        return discB - discA;
      }
      return 0; // featured default
    });
  }, [products, selectedCategory, pvFilter, searchQuery, selectedSort]);

  const totalCartAmount = cart.reduce(
    (sum, it) => sum + (it.product.discountPrice || it.product.mrp) * it.quantity,
    0
  );
  const totalCartPv = cart.reduce((sum, it) => sum + it.product.pv * it.quantity, 0);
  const totalItemsCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#006d36]">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#006d36]" />
          <span className="text-xs font-bold font-mono text-[#1a1c1c]">Loading Botanical Store...</span>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout user={user}>
      <div className="space-y-4 animate-fadeIn max-w-7xl mx-auto pb-24 px-1 sm:px-2">
        {/* ========================================================
            1. TOAST NOTIFICATION
           ======================================================== */}
        {addedToast && (
          <div className="fixed top-16 right-4 sm:right-6 z-50 bg-[#131921] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-emerald-500/40 animate-slideIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-none">{addedToast}</span>
            <Link
              href="/dashboard/cart"
              className="ml-1 px-2 py-0.5 rounded-md bg-[#febd69] text-[#111] hover:bg-[#f3a847] text-[10px] font-black cursor-pointer uppercase tracking-wider shrink-0"
            >
              View Cart
            </Link>
          </div>
        )}

        {/* ========================================================
            2. CLEAN & STYLISH SEARCH & DEPARTMENT BAR
           ======================================================== */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            {/* Clean & Sleek Search Input */}
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1 flex items-center bg-gray-50 hover:bg-gray-100/80 focus-within:bg-white rounded-xl border border-gray-200 focus-within:border-[#006d36] focus-within:ring-2 focus-within:ring-[#006d36]/10 transition-all">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search botanical formulations, health packages, 100 PV, HSN..."
                  className="w-full text-xs font-medium text-[#1a1c1c] py-2.5 pl-9 pr-8 outline-none bg-transparent placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Department Dropdown inside Search Bar */}
              <div className="hidden sm:block shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-50 hover:bg-gray-100 text-[#1a1c1c] text-xs font-bold py-2.5 px-3 rounded-xl border border-gray-200 outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "ALL" ? "All Departments" : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cart Button with Volume */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right hidden sm:block">
                <span className="text-[9px] uppercase font-mono text-[#006d36] font-bold block">
                  Cart Volume
                </span>
                <span className="text-xs font-black font-mono text-[#1a1c1c]">
                  {totalCartPv} PV
                </span>
              </div>

              <Link
                href="/dashboard/cart"
                className="relative px-4 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>View Cart ({totalItemsCount})</span>
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {totalItemsCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Department Filter Pills Strip */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 overflow-hidden">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar flex-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-[#006d36] text-white shadow-xs"
                      : "bg-gray-100 text-[#5f5e5e] hover:bg-gray-200 hover:text-[#1a1c1c]"
                  }`}
                >
                  {cat === "ALL" ? "All Products" : cat}
                </button>
              ))}

              {/* 100 PV Activation Quick Filter */}
              <button
                type="button"
                onClick={() => {
                  setPvFilter(pvFilter === "100PV" ? "ALL" : "100PV");
                  setSelectedCategory("ALL");
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer shrink-0 flex items-center gap-1 whitespace-nowrap ${
                  pvFilter === "100PV"
                    ? "bg-purple-700 text-white shadow-xs"
                    : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>100 PV Fast Track</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 shrink-0">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="bg-gray-50 hover:bg-gray-100 text-[#1a1c1c] text-[11px] font-bold py-1 px-2 rounded-lg outline-none cursor-pointer border border-gray-200"
              >
                <option value="featured">Featured</option>
                <option value="pv_desc">PV: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Top Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. COMPACT PRODUCT CARDS GRID
               - Mobile: 2 Columns Side-by-Side (grid-cols-2)
               - Tablet / Laptop / Desktop: 3 to 6 Columns Compact!
           ======================================================== */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200 space-y-2">
            <Package className="w-8 h-8 text-gray-300 mx-auto" />
            <h3 className="font-bold text-sm text-[#1a1c1c]">No Products Found</h3>
            <p className="text-xs text-[#5f5e5e] max-w-xs mx-auto">
              Try adjusting your search keywords or switching categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setPvFilter("ALL");
              }}
              className="px-4 py-1.5 rounded-lg bg-[#006d36] text-white font-bold text-xs cursor-pointer hover:bg-[#005025]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
            {filteredProducts.map((p, idx) => {
              const inCartQty = getItemQuantity(p.id);
              const sellingPrice = p.discountPrice || p.mrp;
              const hasDiscount = p.mrp > sellingPrice;
              const discountPercent = hasDiscount
                ? Math.round(((p.mrp - sellingPrice) / p.mrp) * 100)
                : 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-[#006d36] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group relative"
                >
                  {/* Top Badges & Category Tag */}
                  <div className="flex items-center justify-between gap-1 mb-2 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#006d36] font-bold text-[10px] uppercase truncate max-w-[100px]">
                      {p.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono font-black text-[10px] shrink-0">
                      {p.pv} PV
                    </span>
                  </div>

                  {/* 3:4 Aspect Ratio Product Image - Click navigates to Amazon-like Product Page */}
                  <Link
                    href={`/dashboard/store/${p.id}`}
                    className="relative aspect-[3/4] w-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-2 p-2 flex items-center justify-center group-hover:bg-white transition-colors cursor-pointer"
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300 space-y-1">
                        <Package className="w-8 h-8" />
                        <span className="text-[9px] text-slate-400 font-medium">No Image</span>
                      </div>
                    )}
                  </Link>

                  {/* Title & Ratings - Click navigates to Product Details */}
                  <div className="space-y-1 mb-2">
                    <Link
                      href={`/dashboard/store/${p.id}`}
                      className="font-bold text-xs text-slate-900 hover:text-[#006d36] transition-colors line-clamp-2 cursor-pointer leading-tight min-h-[30px] block"
                      title={p.name}
                    >
                      {p.name}
                    </Link>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span className="truncate">{p.netQuantity || "1 Unit"}</span>
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>4.9</span>
                      </span>
                    </div>
                  </div>

                  {/* Pricing Section: MRP on one side, PV right beside it */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">MRP Price</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-black text-slate-900 font-mono tracking-tight">
                            ₹{sellingPrice.toLocaleString("en-IN")}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-slate-400 line-through font-mono">
                              ₹{p.mrp}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-purple-700 font-bold uppercase tracking-wider block">Volume</span>
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-mono font-black text-xs border border-purple-200">
                          {p.pv} PV
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Add to Cart (Purple) & Buy Now (Green) */}
                    <div>
                      {inCartQty > 0 ? (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(p.id, inCartQty - 1)}
                            className="w-7 h-7 rounded-lg bg-white text-[#006d36] hover:bg-emerald-100 flex items-center justify-center cursor-pointer shadow-2xs font-bold text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-black text-xs text-[#006d36] px-1">
                            {inCartQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(p.id, inCartQty + 1)}
                            className="w-7 h-7 rounded-lg bg-[#006d36] text-white hover:bg-[#005025] flex items-center justify-center cursor-pointer shadow-2xs font-bold text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(p, 1)}
                            className={`py-2 px-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] cursor-pointer shadow-xs transition-all duration-300 text-center truncate flex items-center justify-center gap-1 ${
                              animatingId === p.id && animatingAction === "cart"
                                ? "scale-95 ring-4 ring-purple-300 bg-purple-700 shadow-md animate-pulse"
                                : "active:scale-95 hover:scale-[1.02]"
                            }`}
                          >
                            {animatingId === p.id && animatingAction === "cart" ? (
                              <>
                                <Sparkles className="w-3 h-3 animate-spin" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <span>Add to Cart</span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBuyNow(p)}
                            className={`py-2 px-1 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-[11px] cursor-pointer shadow-xs transition-all duration-300 text-center truncate flex items-center justify-center gap-1 ${
                              animatingId === p.id && animatingAction === "buy"
                                ? "scale-95 ring-4 ring-emerald-300 bg-[#005025] shadow-md animate-pulse"
                                : "active:scale-95 hover:scale-[1.02]"
                            }`}
                          >
                            {animatingId === p.id && animatingAction === "buy" ? (
                              <>
                                <Zap className="w-3 h-3 animate-bounce" />
                                <span>Going to Cart...</span>
                              </>
                            ) : (
                              <span>Buy Now</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================
            4. QUICK VIEW MODAL (WITH STICKY CLOSE BUTTON)
           ======================================================== */}
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn overflow-hidden">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setQuickViewProduct(null)} />

            {/* Modal Dialog Card */}
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col border border-emerald-300 overflow-hidden z-10 animate-scaleUp">
              {/* Sticky Top Header with Guaranteed Visible Close Button */}
              <div className="sticky top-0 bg-white z-30 px-4 sm:px-6 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-bold text-[10px] uppercase">
                    {quickViewProduct.category}
                  </span>
                  <span className="text-xs font-bold text-[#1a1c1c] truncate">
                    {quickViewProduct.name}
                  </span>
                </div>

                {/* Always-visible Close Button */}
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(null)}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1 text-xs font-bold shadow-2xs shrink-0"
                  title="Close Modal"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  {/* 3:4 Aspect Image */}
                  <div className="aspect-[3/4] w-full max-w-[240px] mx-auto rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden p-3 flex items-center justify-center">
                    {quickViewProduct.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={quickViewProduct.imageUrl}
                        alt={quickViewProduct.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-300 space-y-1">
                        <Package className="w-16 h-16" />
                        <span className="text-xs text-gray-400 font-medium">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div>
                      <div className="inline-block px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono font-black text-[10px] mb-1">
                        +{quickViewProduct.pv} PV Point Volume
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-[#1a1c1c] leading-tight">
                        {quickViewProduct.name}
                      </h2>
                      <span className="text-xs text-gray-500 font-medium block mt-0.5">
                        Net Qty: {quickViewProduct.netQuantity || "1 Unit"} {quickViewProduct.hsnCode && `• HSN: ${quickViewProduct.hsnCode}`}
                      </span>
                    </div>

                    {/* Price Card */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-0.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-[#1a1c1c] font-mono">
                          ₹{(quickViewProduct.discountPrice || quickViewProduct.mrp).toLocaleString("en-IN")}
                        </span>
                        {quickViewProduct.mrp > (quickViewProduct.discountPrice || quickViewProduct.mrp) && (
                          <span className="text-xs text-gray-400 line-through font-mono">
                            ₹{quickViewProduct.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#006d36] font-bold block">
                        ✓ Associate PV Credited on Checkout
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-0.5">
                        Product Formulation
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed max-h-24 overflow-y-auto">
                        {quickViewProduct.description || "100% Organic certified botanical formulation prepared under highest GMP standards."}
                      </p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-gray-700">Quantity:</span>
                        <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                            className="w-5 h-5 rounded bg-white text-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs px-1">{quickViewQty}</span>
                          <button
                            type="button"
                            onClick={() => setQuickViewQty((q) => q + 1)}
                            className="w-5 h-5 rounded bg-[#006d36] text-white hover:bg-[#005025] flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-mono font-bold text-purple-700 text-xs">
                          = {quickViewQty * quickViewProduct.pv} PV
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleAddToCart(quickViewProduct, quickViewQty);
                            setQuickViewProduct(null);
                          }}
                          className="py-2.5 rounded-xl bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all text-center"
                        >
                          Add to Cart
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleAddToCart(quickViewProduct, quickViewQty);
                            setQuickViewProduct(null);
                            router.push("/dashboard/cart");
                          }}
                          className="py-2.5 rounded-xl bg-[#ffa41c] hover:bg-[#fa8900] text-[#0f1111] font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all text-center"
                        >
                          View Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            5. COMPACT FLOATING BOTTOM VIEW CART DRAWER
           ======================================================== */}
        {totalItemsCount > 0 && (
          <div className="fixed bottom-3 inset-x-3 sm:max-w-2xl sm:mx-auto z-40 bg-[#131921]/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-3 animate-slideUp">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#febd69] text-[#111] flex items-center justify-center font-black shrink-0">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-white">
                    Cart Total ({totalItemsCount}):
                  </span>
                  <span className="text-sm font-black text-[#febd69] font-mono">
                    ₹{totalCartAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold block">
                  Total PV: {totalCartPv} PV
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/dashboard/cart"
                className="px-4 py-2 rounded-xl bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Cart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
