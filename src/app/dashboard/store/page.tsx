"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import MemberLayout from "@/components/dashboard/MemberLayout";
import { Product, User } from "@/types";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function MemberCreateOrderShowcasePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Load User & Cart from localStorage
  useEffect(() => {
    async function loadData() {
      try {
        const [userData, prodData] = await Promise.all([
          fetch("/api/auth/me").then((r) => r.json()).catch(() => null),
          fetch("/api/products", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        ]);

        if (userData?.success && userData.user) {
          setUser(userData.user);
        }

        if (prodData?.success && Array.isArray(prodData.products)) {
          setProducts(prodData.products);
        }
      } catch (err) {
        console.error("Error loading products:", err);
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

  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "ALL") return true;
    return p.category === selectedCategory;
  });

  const getItemQuantity = (productId: string) => {
    const found = cart.find((it) => it.product.id === productId);
    return found ? found.quantity : 0;
  };

  const handleAddToCart = (product: Product, qty: number = 1) => {
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

    setAddedToast(`Added ${product.name} to cart!`);
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

  const totalCartAmount = cart.reduce(
    (sum, it) => sum + (it.product.discountPrice || it.product.mrp) * it.quantity,
    0
  );
  const totalCartPv = cart.reduce((sum, it) => sum + it.product.pv * it.quantity, 0);
  const totalItemsCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
        {/* Toast Notification */}
        {addedToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#006d36] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-xs animate-slideUp">
            <CheckCircle2 className="w-4 h-4 text-[#50c878]" />
            <span>{addedToast}</span>
          </div>
        )}

        {/* Top Sticky Showcase Banner with View Cart Button */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-20 z-30 backdrop-blur-md bg-white/95">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Shopping Portal
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                1. Create New Order
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Product Showcase Catalog
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Select wellness products, adjust quantities, and click &quot;View Cart&quot; to checkout.
            </p>
          </div>

          {/* View Cart & Checkout Button */}
          <Link
            href="/dashboard/cart"
            className="px-6 py-3.5 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs flex items-center gap-2.5 shadow-md shadow-[#006d36]/20 transition-all cursor-pointer group self-start sm:self-auto"
          >
            <ShoppingBag className="w-4 h-4 text-[#50c878] group-hover:scale-110 transition-transform" />
            <span>View Cart & Checkout</span>
            {totalItemsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[11px] font-black">
                {totalItemsCount} • ₹{totalCartAmount.toLocaleString("en-IN")}
              </span>
            )}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#006d36] text-white shadow-xs"
                  : "bg-white border border-[#e2e2e2] text-[#5f5e5e] hover:text-[#1a1c1c] hover:border-emerald-300"
              }`}
            >
              {cat === "ALL" ? "All Products" : cat}
            </button>
          ))}
        </div>

        {/* Products Showcase Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-5 border border-[#e2e2e2] animate-pulse space-y-4"
              >
                <div className="w-full aspect-square bg-[#f0f0f0] rounded-2xl" />
                <div className="h-4 bg-[#f0f0f0] rounded w-3/4" />
                <div className="h-3 bg-[#f0f0f0] rounded w-1/2" />
                <div className="h-8 bg-[#f0f0f0] rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#e2e2e2] text-center space-y-3">
            <Package className="w-12 h-12 text-[#5f5e5e]/40 mx-auto" />
            <h3 className="text-lg font-bold text-[#1a1c1c]">No Products Available</h3>
            <p className="text-xs text-[#5f5e5e] max-w-sm mx-auto">
              There are currently no products available in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const inCartQty = getItemQuantity(p.id);
              const sellingPrice = p.discountPrice || p.mrp;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-5 border border-[#e2e2e2] hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Product Image & PV Badge */}
                    <div className="relative w-full aspect-square bg-[#f9f9f9] rounded-2xl p-4 flex items-center justify-center border border-[#e2e2e2]/60 overflow-hidden mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl || "/images/hero-products.webp"}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#006d36] text-white font-mono font-black text-[10px] shadow-xs flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#50c878]" />
                        <span>+{p.pv} PV</span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <span className="text-[10px] uppercase font-bold text-[#006d36] tracking-wider block">
                      {p.category}
                    </span>
                    <h3 className="font-bold text-base text-[#1a1c1c] leading-tight line-clamp-1 mt-0.5">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-[#5f5e5e] line-clamp-2 mt-1 min-h-[32px]">
                      {p.description || "Natural wellness supplement engineered for cellular purity."}
                    </p>
                  </div>

                  {/* Pricing and Cart Actions */}
                  <div className="pt-4 mt-2 border-t border-[#f0f0f0] flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-[#1a1c1c] font-mono">
                          ₹{sellingPrice}
                        </span>
                        {p.mrp > sellingPrice && (
                          <span className="text-xs text-[#5f5e5e] line-through font-mono">
                            ₹{p.mrp}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#50c878] font-bold block">
                        Net: {p.netQuantity || "1 Unit"}
                      </span>
                    </div>

                    {/* Cart Quantity Counter or Add Button */}
                    {inCartQty > 0 ? (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-2 py-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(p.id, inCartQty - 1)}
                          className="w-6 h-6 rounded-lg bg-white text-[#006d36] hover:bg-emerald-100 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-xs text-[#006d36] min-w-[16px] text-center">
                          {inCartQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(p.id, inCartQty + 1)}
                          className="w-6 h-6 rounded-lg bg-[#006d36] text-white hover:bg-[#005025] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p, 1)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-[#006d36] text-[#006d36] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group/btn"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#006d36] group-hover/btn:text-white" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Cart Floating Bar if Cart has items */}
        {totalItemsCount > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1a1c1c] text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-8 border border-white/10 animate-slideUp max-w-xl w-[90%]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#006d36] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs text-white/70 block">
                  {totalItemsCount} item{totalItemsCount > 1 ? "s" : ""} selected
                </span>
                <span className="text-sm font-black font-mono text-white">
                  ₹{totalCartAmount.toLocaleString("en-IN")}{" "}
                  <span className="text-[#50c878] font-normal text-xs">
                    (+{totalCartPv} PV)
                  </span>
                </span>
              </div>
            </div>

            <Link
              href="/dashboard/cart"
              className="ml-auto px-5 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#50c878] hover:text-[#005025] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>Review & Place Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
