"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  ShieldCheck,
  Truck,
  Sparkles,
  Package,
  Award,
  CheckCircle2,
  Share2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import { Product, User } from "@/types";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addedToast, setAddedToast] = useState(false);

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
          const found = prodData.products.find((p: Product) => String(p.id) === String(productId));
          setProduct(found || null);
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }

      try {
        const saved = localStorage.getItem("aviracare_cart");
        if (saved) {
          setCart(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    }
    loadData();
  }, [productId]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("aviracare_cart", JSON.stringify(newCart));
    } catch {
      // ignore
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const existing = cart.find((it) => it.product.id === product.id);
    let updated: CartItem[];
    if (existing) {
      updated = cart.map((it) =>
        it.product.id === product.id ? { ...it, quantity: it.quantity + quantity } : it
      );
    } else {
      updated = [...cart, { product, quantity }];
    }
    saveCart(updated);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    router.push("/dashboard/cart");
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#006d36]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-bold font-mono">Loading Product Details...</span>
        </div>
      </MemberLayout>
    );
  }

  if (!product) {
    return (
      <MemberLayout>
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500">The product you requested could not be located in our catalog.</p>
          <Link
            href="/dashboard/store"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006d36] text-white font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Botanical Store</span>
          </Link>
        </div>
      </MemberLayout>
    );
  }

  const sellingPrice = product.discountPrice || product.mrp;
  const hasDiscount = product.discountPrice && product.discountPrice < product.mrp;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp - product.discountPrice!) / product.mrp) * 100)
    : 0;

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fadeIn">
        {/* Amazon-style Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <Link href="/dashboard/store" className="hover:text-[#006d36] font-bold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Store</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-600 uppercase text-[11px]">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Added Toast Notification */}
        {addedToast && (
          <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-purple-700 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-slideDown">
            <CheckCircle2 className="w-4 h-4" />
            <span>Added {quantity} x &ldquo;{product.name}&rdquo; to Cart!</span>
          </div>
        )}

        {/* Main Amazon-Style Product Canvas */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Big Product Image Canvas (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-w-[380px] rounded-3xl bg-slate-50 border border-slate-200/80 p-4 sm:p-6 flex items-center justify-center shadow-inner overflow-hidden group">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-300 gap-2">
                  <Package className="w-16 h-16" />
                  <span className="text-xs font-bold">No Image Available</span>
                </div>
              )}

              {/* Category & PV Floating Tags */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-[#006d36] font-black text-xs uppercase shadow-sm border border-emerald-200">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Micro Highlights */}
            <div className="mt-4 grid grid-cols-3 gap-2 w-full max-w-[380px] text-center text-[10px] font-bold text-slate-600">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <ShieldCheck className="w-4 h-4 mx-auto text-[#006d36] mb-0.5" />
                <span>100% Genuine</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <Award className="w-4 h-4 mx-auto text-purple-600 mb-0.5" />
                <span>GMP Certified</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <Truck className="w-4 h-4 mx-auto text-blue-600 mb-0.5" />
                <span>Fast Dispatch</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title & Ratings */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006d36] font-mono text-[10px] font-bold">
                  HSN: {product.hsnCode || "3004"}
                </span>
                <span className="text-xs text-slate-400 font-mono">•</span>
                <span className="text-xs text-slate-500 font-bold">{product.netQuantity || "Standard Formulation"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 text-amber-700 text-xs font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.9</span>
                </div>
                <span className="text-xs text-slate-400 font-bold">• 100% Verified Associate Purchase</span>
              </div>
            </div>

            {/* MRP & PV Section - SIDE BY SIDE */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 flex items-center justify-between gap-4">
              {/* Left Side: MRP and Discount */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Price (MRP)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                    ₹{sellingPrice.toLocaleString("en-IN")}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-slate-400 line-through font-mono">
                      ₹{product.mrp}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Inclusive of all applicable GST taxes</span>
              </div>

              {/* Right Side: PV Beside MRP */}
              <div className="text-right border-l border-slate-200 pl-4 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Point Volume
                </span>
                <span className="inline-block mt-0.5 px-3.5 py-1.5 rounded-xl bg-purple-700 text-white font-mono font-black text-base sm:text-lg shadow-xs">
                  {product.pv} PV
                </span>
              </div>
            </div>

            {/* Formulation Description */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#006d36]" />
                <span>Botanical Formulation Overview</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
                {product.description ||
                  "Formulated using pure organic botanical extracts adhering to strict Direct Selling Standards and Good Manufacturing Practices. Enhances vitality and wellness naturally."}
              </p>
            </div>

            {/* Quantity Selector & Dual Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-black text-sm px-2 text-slate-900 min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-6 h-6 rounded-lg bg-[#006d36] text-white hover:bg-[#005025] flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs font-mono font-bold text-purple-700">
                  = {quantity * product.pv} PV
                </span>
              </div>

              {/* ACTION BUTTONS: Add to Cart (PURPLE) & Buy Now (GREEN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3.5 px-6 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
