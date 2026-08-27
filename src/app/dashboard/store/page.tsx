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
  ShoppingCart,
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

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#006d36]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-bold font-mono">Loading Product Catalog...</span>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
        {/* Toast Alert */}
        {addedToast && (
          <div className="fixed top-20 right-6 z-50 bg-[#006d36] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-slideIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{addedToast}</span>
          </div>
        )}

        {/* Top Header with Single View Cart Action */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Shopping Store
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Product Showcase
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Order Botanical Formulations & Packages
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Add products to your cart and accumulate Point Volume (PV) for activation and daily binary matching.
            </p>
          </div>

          {/* SINGLE VIEW CART ACTION BUTTON IN TOP HEADER */}
          <Link
            href="/dashboard/cart"
            className="px-5 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>View Shopping Cart ({totalItemsCount} items • {totalCartPv} PV)</span>
          </Link>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? "bg-[#006d36] text-white shadow-xs"
                  : "bg-white border border-gray-200 text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-emerald-50/50"
              }`}
            >
              {cat === "ALL" ? "All Products" : cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200 space-y-2">
            <Package className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="font-bold text-sm text-[#1a1c1c]">No Products Available in this Category</h3>
            <p className="text-xs text-[#5f5e5e]">Please check other categories or contact support.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const inCartQty = getItemQuantity(p.id);
              const sellingPrice = p.discountPrice || p.mrp;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Product Image & PV Badge */}
                  <div>
                    <div className="relative w-full h-44 rounded-2xl bg-gray-50 overflow-hidden mb-4 border border-gray-100 flex items-center justify-center">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-gray-300" />
                      )}

                      {/* PV Badge - NO '+' PREFIX */}
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-purple-700/90 backdrop-blur-xs text-white font-mono font-black text-xs shadow-xs">
                        {p.pv} PV
                      </span>

                      {/* Category Pill */}
                      <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-xs text-[#006d36] font-bold text-[10px] uppercase">
                        {p.category}
                      </span>
                    </div>

                    {/* Title & Short Description */}
                    <h3 className="font-black text-sm text-[#1a1c1c] group-hover:text-[#006d36] transition-colors line-clamp-1 mb-1">
                      {p.name}
                    </h3>
                    <p className="text-xs text-[#5f5e5e] line-clamp-2 leading-relaxed mb-4">
                      {p.description}
                    </p>
                  </div>

                  {/* Pricing & Add Button */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
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
                      <span className="text-[10px] text-[#006d36] font-bold block">
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
      </div>
    </MemberLayout>
  );
}
