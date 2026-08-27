"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import MemberLayout from "@/components/dashboard/MemberLayout";
import { Product, User } from "@/types";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function MemberCartPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Recipient Member ID & Delivery Address
  const [targetMemberId, setTargetMemberId] = useState("");
  const [targetMemberName, setTargetMemberName] = useState("");
  const [targetMemberMobile, setTargetMemberMobile] = useState("");
  const [verifyingMember, setVerifyingMember] = useState(false);
  const [memberVerified, setMemberVerified] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  useEffect(() => {
    async function loadUserAndCart() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);

          // Check if already saved in localStorage checkout info
          const savedTarget = localStorage.getItem("aviracare_checkout_target");
          if (savedTarget) {
            const parsed = JSON.parse(savedTarget);
            setTargetMemberId(parsed.memberId || data.user.memberId);
            setTargetMemberName(parsed.fullName || data.user.fullName);
            setTargetMemberMobile(parsed.mobile || data.user.mobile);
            setShippingAddress(parsed.address || data.user.address || "");
            setMemberVerified(true);
          } else {
            setTargetMemberId(data.user.memberId);
            setTargetMemberName(data.user.fullName);
            setTargetMemberMobile(data.user.mobile);
            setShippingAddress(
              data.user.address ||
                `${data.user.city || ""}, ${data.user.state || ""} - ${data.user.pincode || ""}`
            );
            setMemberVerified(true);
          }
        }
      } catch (err) {
        console.error("Error loading user:", err);
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
    loadUserAndCart();
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("aviracare_cart", JSON.stringify(newCart));
    } catch {
      // ignore
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const existing = cart.find((it) => it.product.id === productId);
    if (!existing) return;

    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      saveCart(cart.filter((it) => it.product.id !== productId));
    } else {
      saveCart(
        cart.map((it) =>
          it.product.id === productId ? { ...it, quantity: newQty } : it
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    saveCart(cart.filter((it) => it.product.id !== productId));
  };

  const verifyMemberId = async (idToVerify: string) => {
    const cleanId = idToVerify.trim().toUpperCase();
    if (!cleanId) {
      setMemberVerified(false);
      setTargetMemberName("");
      setMemberError("Please enter an Associate Member ID");
      return;
    }

    setVerifyingMember(true);
    setMemberError("");
    try {
      const res = await fetch(`/api/sponsor/${cleanId}`);
      const data = await res.json();
      if (data.success && data.user) {
        setTargetMemberName(data.user.fullName);
        setTargetMemberMobile(data.user.mobile || "");
        if (data.user.address) {
          setShippingAddress(data.user.address);
        } else if (data.user.city || data.user.state) {
          setShippingAddress(
            `${data.user.city || ""}, ${data.user.state || ""} - ${data.user.pincode || ""}`
          );
        }
        setMemberVerified(true);
      } else {
        setMemberVerified(false);
        setTargetMemberName("");
        setMemberError("Associate Member ID not found");
      }
    } catch {
      setMemberVerified(false);
      setMemberError("Error verifying Member ID");
    } finally {
      setVerifyingMember(false);
    }
  };

  const totalPayableAmount = cart.reduce(
    (acc, it) => acc + (it.product.discountPrice || it.product.mrp) * it.quantity,
    0
  );
  const totalPv = cart.reduce((acc, it) => acc + it.product.pv * it.quantity, 0);

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Please add items to proceed.");
      return;
    }

    if (!memberVerified || !targetMemberId.trim()) {
      alert("Please verify a valid Associate Member ID before proceeding.");
      return;
    }

    if (!shippingAddress.trim()) {
      alert("Please provide the delivery shipping address.");
      return;
    }

    // Store checkout session in localStorage
    localStorage.setItem(
      "aviracare_checkout_target",
      JSON.stringify({
        memberId: targetMemberId.trim().toUpperCase(),
        fullName: targetMemberName,
        mobile: targetMemberMobile,
        address: shippingAddress.trim(),
        totalAmount: totalPayableAmount,
        totalPv: totalPv,
      })
    );

    router.push("/dashboard/checkout");
  };

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-12">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between pb-2">
          <Link
            href="/dashboard/store"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products Showcase</span>
          </Link>
          <span className="text-xs text-[#5f5e5e] font-mono">
            Shopping Cart Invoice
          </span>
        </div>

        {/* Empty Cart Notice */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#e2e2e2] text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#006d36] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-[#1a1c1c]">Your Cart is Currently Empty</h2>
            <p className="text-xs text-[#5f5e5e] max-w-md mx-auto">
              You haven&apos;t added any products yet. Browse our showcase catalog to select wellness products.
            </p>
            <Link
              href="/dashboard/store"
              className="inline-block px-6 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Browse Products Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Itemized Cart Invoice */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
                <div>
                  <h2 className="text-lg font-black text-[#1a1c1c]">
                    Shopping Cart Invoice ({cart.length} Products)
                  </h2>
                  <span className="text-xs text-[#5f5e5e]">
                    Itemized product invoice, unit prices, PV credits, and quantity controls.
                  </span>
                </div>
                <span className="text-xs font-bold text-[#006d36] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  Total Volume: +{totalPv} PV
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f9f9f9] text-[#5f5e5e] font-bold uppercase border-b border-[#e2e2e2]">
                    <tr>
                      <th className="py-3 px-4">Product Details</th>
                      <th className="py-3 px-4">Unit Price</th>
                      <th className="py-3 px-4">PV / Unit</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Subtotal</th>
                      <th className="py-3 px-4 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                    {cart.map((it) => {
                      const sellingPrice = it.product.discountPrice || it.product.mrp;
                      const lineTotal = sellingPrice * it.quantity;
                      const linePv = it.product.pv * it.quantity;

                      return (
                        <tr key={it.product.id} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={it.product.imageUrl}
                                alt={it.product.name}
                                className="w-10 h-10 object-contain rounded-lg border border-[#e2e2e2] bg-[#f9f9f9] p-0.5"
                              />
                              <div>
                                <span className="font-bold text-[#1a1c1c] block text-xs">
                                  {it.product.name}
                                </span>
                                <span className="text-[10px] text-[#5f5e5e]">
                                  {it.product.category} • {it.product.netQuantity || "1 Unit"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-[#1a1c1c]">
                            ₹{sellingPrice.toLocaleString("en-IN")}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-[#006d36]">
                            +{it.product.pv} PV
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(it.product.id, -1)}
                                className="w-6 h-6 rounded-lg bg-gray-100 text-[#1a1c1c] flex items-center justify-center font-bold hover:bg-gray-200 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono font-black text-xs min-w-[20px] text-center">
                                {it.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(it.product.id, 1)}
                                className="w-6 h-6 rounded-lg bg-emerald-100 text-[#006d36] flex items-center justify-center font-bold hover:bg-emerald-200 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-bold text-sm text-[#1a1c1c] block">
                              ₹{lineTotal.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-[#006d36] font-bold">
                              +{linePv} PV
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(it.product.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Remove Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Order Totals Banner */}
              <div className="p-4 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                      Total PV Credit
                    </span>
                    <span className="font-mono text-xl font-black text-[#006d36]">
                      +{totalPv} PV
                    </span>
                  </div>
                  <div className="h-8 w-px bg-[#e2e2e2]" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                      Total Units
                    </span>
                    <span className="font-mono text-xl font-black text-[#1a1c1c]">
                      {cart.reduce((acc, it) => acc + it.quantity, 0)} Units
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                    Total Payable Amount
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-[#006d36]">
                    ₹{totalPayableAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Recipient Member ID & Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-[#1a1c1c] pb-2 border-b border-[#e2e2e2]">
                Recipient Associate & Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Recipient Member ID */}
                <div>
                  <label className="block font-bold text-xs text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                    Recipient Member ID (PV Credited To) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. AV00001"
                      value={targetMemberId}
                      onChange={(e) => {
                        setTargetMemberId(e.target.value.toUpperCase());
                        setMemberVerified(false);
                      }}
                      onBlur={() => verifyMemberId(targetMemberId)}
                      required
                      className="flex-1 bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-mono font-bold text-xs text-[#1a1c1c] uppercase outline-none focus:border-[#006d36]"
                    />
                    <button
                      type="button"
                      onClick={() => verifyMemberId(targetMemberId)}
                      disabled={verifyingMember}
                      className="px-4 py-3 bg-[#006d36] text-white rounded-xl text-xs font-bold hover:bg-[#005025] cursor-pointer disabled:opacity-60"
                    >
                      {verifyingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                    </button>
                  </div>

                  {memberVerified && targetMemberName && (
                    <div className="mt-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#006d36] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Associate: {targetMemberName}</span>
                      </span>
                      {targetMemberMobile && (
                        <span className="text-[#5f5e5e] font-mono text-[11px]">
                          📱 {targetMemberMobile}
                        </span>
                      )}
                    </div>
                  )}

                  {memberError && (
                    <span className="text-xs text-red-600 font-bold flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{memberError}</span>
                    </span>
                  )}
                </div>

                {/* Editable Delivery Address */}
                <div>
                  <label className="block font-bold text-xs text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                    Delivery Shipping Address *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Full street address, landmark, city, state, and pincode..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 text-xs text-[#1a1c1c] font-medium outline-none focus:border-[#006d36]"
                  />
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <div className="pt-4 border-t border-[#e2e2e2] flex justify-end">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="px-8 py-4 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#006d36]/20 cursor-pointer transition-all flex items-center gap-2"
                >
                  <span>Proceed to Payment Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
