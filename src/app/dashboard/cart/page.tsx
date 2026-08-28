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
  AlertCircle,
  Loader2,
  MapPin,
  Phone,
  UserCheck,
  CheckCircle2,
  FileText,
  Percent,
} from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
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
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setTargetMemberId("");
          setTargetMemberName("");
          setTargetMemberMobile("");
          setShippingAddress("");
          setMemberVerified(false);
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
      setTargetMemberMobile("");
      setMemberError("Please enter an Associate Member ID");
      return;
    }

    setVerifyingMember(true);
    setMemberError("");
    try {
      const res = await fetch(`/api/sponsor/${cleanId}`);
      const data = await res.json();
      if ((data.success || data.exists) && (data.user || data.fullName)) {
        const usr = data.user || data;
        const name = usr.fullName || "";
        const mobile = usr.mobile || "";
        const addr =
          usr.address ||
          [usr.city, usr.state, usr.pincode ? `PIN: ${usr.pincode}` : ""]
            .filter(Boolean)
            .join(", ");

        setTargetMemberName(name);
        setTargetMemberMobile(mobile);
        if (addr) {
          setShippingAddress(addr);
        }
        setMemberVerified(true);
      } else {
        setMemberVerified(false);
        setTargetMemberName("");
        setTargetMemberMobile("");
        setMemberError(data.message || "Associate Member ID not found in Avira network");
      }
    } catch {
      setMemberVerified(false);
      setMemberError("Error verifying Member ID");
    } finally {
      setVerifyingMember(false);
    }
  };

  const handleMemberIdChange = (val: string) => {
    const uppercaseVal = val.toUpperCase().trimStart();
    setTargetMemberId(uppercaseVal);
    setMemberVerified(false);
    setTargetMemberName("");
    setTargetMemberMobile("");
    setShippingAddress("");
    setMemberError("");
  };

  useEffect(() => {
    const clean = targetMemberId.trim().toUpperCase();
    if (!clean || clean.length < 4) {
      return;
    }

    const timer = setTimeout(() => {
      verifyMemberId(clean);
    }, 350);
    return () => clearTimeout(timer);
  }, [targetMemberId]);

  // INVOICE SUMMARY CALCULATIONS
  // 1. Total MRP Amount
  const totalMrpAmount = cart.reduce((acc, it) => acc + it.product.mrp * it.quantity, 0);

  // 2. Selling / Payable Price
  const totalPayableAmount = cart.reduce(
    (acc, it) => acc + (it.product.discountPrice || it.product.mrp) * it.quantity,
    0
  );

  // 3. Discount
  const totalDiscount = totalMrpAmount - totalPayableAmount;

  // 4. Total PV (NO '+' prefix)
  const totalPv = cart.reduce((acc, it) => acc + it.product.pv * it.quantity, 0);

  // 5. Shipping (₹0)
  const shippingCharge = 0;

  // 6. Estimated GST Tax Breakdown based on HSN/GST Rate
  const totalGstEstimated = cart.reduce((acc, it) => {
    const price = (it.product.discountPrice || it.product.mrp) * it.quantity;
    const rate = (it.product as any).gstRate || 18; // standard GST rate
    const tax = price - price / (1 + rate / 100);
    return acc + tax;
  }, 0);

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
        totalMrpAmount: totalMrpAmount,
        totalDiscount: totalDiscount,
        totalAmount: totalPayableAmount,
        totalPv: totalPv,
        shippingCharge: shippingCharge,
        taxAmount: Math.round(totalGstEstimated),
        billedBy: user?.memberId || "",
        billedByName: user?.fullName || "",
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
            <span>Back to Products Store</span>
          </Link>
          <span className="text-xs text-[#5f5e5e] font-mono">
            Shopping Cart Invoice
          </span>
        </div>

        {/* Empty Cart Notice */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#006d36] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-[#1a1c1c]">Your Cart is Currently Empty</h2>
            <p className="text-xs text-[#5f5e5e] max-w-md mx-auto">
              You haven&apos;t added any products yet. Browse our store to select botanical formulations.
            </p>
            <Link
              href="/dashboard/store"
              className="inline-block px-6 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Browse Store Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-base font-black text-[#1a1c1c]">
                  Selected Cart Items ({cart.length})
                </h2>
                <button
                  type="button"
                  onClick={() => saveCart([])}
                  className="text-xs text-red-600 hover:text-red-700 font-bold"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-gray-100 space-y-3">
                {cart.map((item) => {
                  const p = item.product;
                  const unitPrice = p.discountPrice || p.mrp;
                  const itemTotal = unitPrice * item.quantity;
                  const itemPv = p.pv * item.quantity;

                  return (
                    <div key={p.id} className="pt-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-18 rounded-2xl bg-gray-50 border border-gray-200/60 flex items-center justify-center overflow-hidden shrink-0 p-1">
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain" />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#1a1c1c] line-clamp-1">{p.name}</h4>
                          <span className="font-mono text-[10px] text-purple-700 font-bold block">
                            {itemPv} PV • HSN: {p.hsnCode || "3004"}
                          </span>
                          <span className="font-mono text-xs font-black text-[#1a1c1c]">
                            ₹{unitPrice}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(p.id, -1)}
                            className="w-5 h-5 rounded-md bg-white hover:bg-gray-100 text-[#1a1c1c] flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs text-[#1a1c1c] min-w-[14px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(p.id, 1)}
                            className="w-5 h-5 rounded-md bg-[#006d36] hover:bg-[#005025] text-white flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(p.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Invoice Summary & Recipient Form */}
            <div className="lg:col-span-5 space-y-6">
              {/* Recipient Member ID Validation */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-xs uppercase text-[#1a1c1c] tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#006d36]" />
                  <span>Order Recipient Member ID</span>
                </h3>

                <div>
                  <label className="block text-[11px] font-bold text-[#5f5e5e] mb-1">
                    Enter Associate Member ID:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. AV0001..."
                      value={targetMemberId}
                      onChange={(e) => handleMemberIdChange(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-mono font-bold text-xs uppercase text-[#1a1c1c] outline-hidden focus:border-[#006d36]"
                    />
                    {verifyingMember && (
                      <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-[#006d36]" />
                    )}
                  </div>

                  {memberVerified && (
                    <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#006d36] font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <div>
                        <span>{targetMemberName}</span>
                        <span className="block font-mono text-[10px] text-gray-500 font-normal">{targetMemberMobile}</span>
                      </div>
                    </div>
                  )}

                  {memberError && (
                    <div className="mt-2 text-xs text-red-600 font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{memberError}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5f5e5e] mb-1">
                    Delivery Shipping Address:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Street Address, City, State, Pincode..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36]"
                  />
                </div>
              </div>

              {/* ITEMIZED INVOICE BILL BREAKDOWN */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-xs uppercase text-[#1a1c1c] tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#006d36]" />
                  <span>Invoice & Tax Summary</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  {/* 1. Total MRP */}
                  <div className="flex items-center justify-between text-[#5f5e5e]">
                    <span>Total Amount (MRP):</span>
                    <span className="font-mono font-bold text-[#1a1c1c]">₹{totalMrpAmount.toLocaleString("en-IN")}</span>
                  </div>

                  {/* 2. Discount */}
                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between text-[#006d36]">
                      <span>Associate Discount:</span>
                      <span className="font-mono font-bold">- ₹{totalDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {/* 3. Total PV (NO '+' prefix) */}
                  <div className="flex items-center justify-between text-purple-700 font-bold">
                    <span>Point Volume (PV):</span>
                    <span className="font-mono">{totalPv} PV</span>
                  </div>

                  {/* 4. Shipping Charges (₹0) */}
                  <div className="flex items-center justify-between text-[#5f5e5e]">
                    <span>Shipping Charges:</span>
                    <span className="font-mono font-bold text-[#006d36]">₹0 (Free Delivery)</span>
                  </div>

                  {/* 5. Tax (GST Included by HSN) */}
                  <div className="flex items-center justify-between text-[#5f5e5e] pt-1 border-t border-gray-100">
                    <span>Tax (GST by HSN):</span>
                    <span className="font-mono">Included (~₹{Math.round(totalGstEstimated).toLocaleString("en-IN")})</span>
                  </div>

                  {/* 6. Final Payable Amount */}
                  <div className="flex items-center justify-between text-sm font-black text-[#1a1c1c] pt-2 border-t border-gray-200">
                    <span>Final Payable Amount:</span>
                    <span className="font-mono text-base text-[#006d36]">₹{totalPayableAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  disabled={!memberVerified || !shippingAddress.trim()}
                  className="w-full mt-4 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>Proceed to Payment</span>
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
