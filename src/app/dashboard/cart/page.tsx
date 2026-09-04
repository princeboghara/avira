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
  Calculator,
  Lock,
  Unlock,
  Building,
  Hash,
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
  const [targetPincode, setTargetPincode] = useState("");
  const [targetCity, setTargetCity] = useState("");
  const [targetState, setTargetState] = useState("");
  const [targetGstin, setTargetGstin] = useState("");
  const [isAddressLocked, setIsAddressLocked] = useState(true);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [shippingCharge, setShippingCharge] = useState(0);

  useEffect(() => {
    async function loadUserAndCart() {
      try {
        const [res, shipRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/settings/shipping", { cache: "no-store" }).catch(() => null),
        ]);
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setTargetMemberId("");
          setTargetMemberName("");
          setTargetMemberMobile("");
          setShippingAddress("");
          setTargetPincode("");
          setTargetCity("");
          setTargetState("");
          setTargetGstin("");
          setIsAddressLocked(true);
          setMemberVerified(false);
        }
        if (shipRes) {
          const shipData = await shipRes.json();
          if (shipData?.success && typeof shipData.shippingCharge === "number") {
            setShippingCharge(shipData.shippingCharge);
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
      setTargetMemberMobile("");
      setShippingAddress("");
      setTargetPincode("");
      setTargetCity("");
      setTargetState("");
      setTargetGstin("");
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
        const addr = usr.address || "";
        const pin = usr.pincode || "";
        const city = usr.city || "";
        const state = usr.state || "";
        const gstin = usr.gstin || usr.gstNumber || "";

        setTargetMemberName(name);
        setTargetMemberMobile(mobile);
        setShippingAddress(addr);
        setTargetPincode(pin);
        setTargetCity(city);
        setTargetState(state);
        setTargetGstin(gstin);
        setIsAddressLocked(true); // Address starts locked by default for safety
        setMemberVerified(true);
      } else {
        setMemberVerified(false);
        setTargetMemberName("");
        setTargetMemberMobile("");
        setShippingAddress("");
        setTargetPincode("");
        setTargetCity("");
        setTargetState("");
        setTargetGstin("");
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
    setTargetPincode("");
    setTargetCity("");
    setTargetState("");
    setTargetGstin("");
    setIsAddressLocked(true);
    setMemberError("");
  };

  const handlePincodeChange = async (val: string) => {
    const cleanPin = val.replace(/\D/g, "").slice(0, 6);
    setTargetPincode(cleanPin);

    // If even a single digit is erased, clear city and state immediately!
    if (cleanPin.length < 6) {
      setTargetCity("");
      setTargetState("");
      return;
    }

    if (cleanPin.length === 6) {
      setFetchingPincode(true);
      try {
        const res = await fetch(`/api/pincode/${cleanPin}`);
        const data = await res.json();
        if (data.success) {
          if (data.city) setTargetCity(data.city);
          if (data.state) setTargetState(data.state);
        }
      } catch (err) {
        console.error("Error auto-fetching pincode:", err);
      } finally {
        setFetchingPincode(false);
      }
    }
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

  // 5. Accurate GST Tax Breakdown based on HSN/GST Rate of each product
  let totalTaxableAmount = 0;
  let totalGstEstimated = 0;
  const gstBreakdownByRate: Record<number, { taxable: number; gst: number }> = {};

  cart.forEach((it) => {
    const p = it.product;
    const unitPrice = p.discountPrice || p.mrp;
    const rate =
      p.gstRate !== undefined && p.gstRate > 0
        ? p.gstRate
        : p.hsnGst !== undefined && p.hsnGst > 0
        ? p.hsnGst
        : p.hsnCode?.startsWith("3401") ||
          p.hsnCode?.startsWith("3305") ||
          p.hsnCode?.startsWith("3304") ||
          p.hsnCode?.startsWith("3307") ||
          p.hsnCode?.startsWith("3306")
        ? 18
        : 5;

    const basePerUnit = Number((unitPrice / (1 + rate / 100)).toFixed(2));
    const taxableTotal = Number((basePerUnit * it.quantity).toFixed(2));
    const gstTotal = Number(((unitPrice - basePerUnit) * it.quantity).toFixed(2));

    totalTaxableAmount += taxableTotal;
    totalGstEstimated += gstTotal;

    if (!gstBreakdownByRate[rate]) {
      gstBreakdownByRate[rate] = { taxable: 0, gst: 0 };
    }
    gstBreakdownByRate[rate].taxable += taxableTotal;
    gstBreakdownByRate[rate].gst += gstTotal;
  });

  // Effective shipping charge
  const effectiveShipping =
    shippingCharge > 0
      ? shippingCharge
      : Math.max(75, ...cart.map((it) => Number((it.product as any)?.shippingCharge) || 0));

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Please add items to proceed.");
      return;
    }

    if (!memberVerified || !targetMemberId.trim()) {
      alert("Please verify a valid Associate Member ID before proceeding.");
      return;
    }

    const cleanAddress = shippingAddress.trim();
    const cleanPin = targetPincode.trim();
    const cleanCity = targetCity.trim();
    const cleanState = targetState.trim();

    if (!cleanAddress && !cleanCity) {
      alert("Please provide the delivery shipping address.");
      return;
    }

    const fullShippingAddress = [
      cleanAddress,
      cleanCity,
      cleanState,
      cleanPin ? `PIN: ${cleanPin}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    const isIntraState = cleanState.toLowerCase() === "gujarat";

    // Store checkout session in localStorage
    localStorage.setItem(
      "aviracare_checkout_target",
      JSON.stringify({
        memberId: targetMemberId.trim().toUpperCase(),
        fullName: targetMemberName,
        mobile: targetMemberMobile,
        address: fullShippingAddress,
        shippingAddress: fullShippingAddress,
        rawAddress: cleanAddress,
        pincode: cleanPin,
        city: cleanCity,
        state: cleanState,
        consigneeGstin: targetGstin.trim(),
        buyerGstin: user?.gstNumber || "",
        buyerMobile: user?.mobile || "",
        totalMrpAmount: totalMrpAmount,
        totalDiscount: totalDiscount,
        totalTaxableAmount: Number(totalTaxableAmount.toFixed(2)),
        totalAmount: totalPayableAmount + effectiveShipping,
        totalPv: totalPv,
        shippingCharge: effectiveShipping,
        taxAmount: Number(totalGstEstimated.toFixed(2)),
        billedBy: user?.memberId || "",
        billedByName: user?.fullName || "",
        isIntraState: isIntraState,
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
                  const gstRate =
                    p.gstRate !== undefined && p.gstRate > 0
                      ? p.gstRate
                      : p.hsnGst !== undefined && p.hsnGst > 0
                      ? p.hsnGst
                      : p.hsnCode?.startsWith("3401") ||
                        p.hsnCode?.startsWith("3305") ||
                        p.hsnCode?.startsWith("3304") ||
                        p.hsnCode?.startsWith("3307") ||
                        p.hsnCode?.startsWith("3306")
                      ? 18
                      : 5;
                  const basePrice = Number((unitPrice / (1 + gstRate / 100)).toFixed(2));
                  const itemGstAmt = Number(((unitPrice - basePrice) * item.quantity).toFixed(2));

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
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-purple-700 font-bold">
                              {itemPv} PV
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="font-mono text-[10px] text-gray-600 font-medium">
                              HSN: {p.hsnCode || "3004"}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {gstRate}% GST (₹{itemGstAmt.toFixed(2)})
                            </span>
                          </div>
                          <div className="font-mono text-xs font-black text-[#1a1c1c] mt-1 flex items-center gap-2">
                            <span>₹{unitPrice}</span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              (Base: ₹{basePrice.toFixed(2)})
                            </span>
                          </div>
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
              {/* Recipient Member ID Validation & Consignee Address */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-xs uppercase text-[#1a1c1c] tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#006d36]" />
                  <span>Order Recipient (Consignee) Details</span>
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
                    <div className="mt-2.5 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-[#006d36] font-bold space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#006d36]" />
                          <span>{targetMemberName}</span>
                        </span>
                        <span className="font-mono text-[10px] text-gray-500 font-normal">ID: {targetMemberId}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 text-[10px] text-gray-600 font-normal pt-1 border-t border-emerald-200/60 font-mono">
                        <span>📱 {targetMemberMobile || "No Mobile"}</span>
                        <span>•</span>
                        <span>GSTIN: {targetGstin || "URP (Unregistered)"}</span>
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

                {/* Delivery Shipping Address with Unlock for Edit */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#1a1c1c] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#006d36]" />
                      <span>Delivery Shipping Address:</span>
                    </label>
                    {memberVerified && (
                      <button
                        type="button"
                        onClick={() => setIsAddressLocked(!isAddressLocked)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isAddressLocked
                            ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs"
                            : "bg-emerald-50 hover:bg-emerald-100 text-[#006d36] border border-emerald-300 shadow-2xs"
                        }`}
                        title={isAddressLocked ? "Click to unlock address editing" : "Click to lock address"}
                      >
                        {isAddressLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Unlock for Edit</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-[#006d36]" />
                            <span>Lock Address</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {memberVerified && (
                    <div className={`text-[11px] rounded-xl p-2.5 flex items-center gap-2 border ${
                      isAddressLocked
                        ? "bg-amber-50/70 border-amber-200 text-amber-800"
                        : "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                    }`}>
                      {isAddressLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          <span>Address is locked to protect member details. Click <strong>&quot;Unlock for Edit&quot;</strong> to modify.</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5 shrink-0 text-[#006d36]" />
                          <span>Address editing unlocked. You can modify street address, enter a 6-digit Pincode to auto-fetch State/City.</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Street Address */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">
                      Street / Flat / Area Address:
                    </label>
                    <textarea
                      rows={2}
                      disabled={isAddressLocked && memberVerified}
                      placeholder="e.g. 102, Shanti Complex, Station Road..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className={`w-full rounded-xl p-2.5 text-xs text-[#1a1c1c] outline-hidden border transition-all ${
                        isAddressLocked && memberVerified
                          ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-600"
                          : "bg-gray-50 border-gray-200 focus:border-[#006d36] focus:bg-white"
                      }`}
                    />
                  </div>

                  {/* Pincode & City & State Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">
                        Pincode:
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={6}
                          disabled={isAddressLocked && memberVerified}
                          placeholder="e.g. 380001"
                          value={targetPincode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          className={`w-full rounded-xl py-2 px-2.5 font-mono font-bold text-xs text-[#1a1c1c] outline-hidden border transition-all ${
                            isAddressLocked && memberVerified
                              ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-600"
                              : "bg-gray-50 border-gray-200 focus:border-[#006d36] focus:bg-white"
                          }`}
                        />
                        {fetchingPincode && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2 text-[#006d36]" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">
                        City:
                      </label>
                      <input
                        type="text"
                        disabled={isAddressLocked && memberVerified}
                        placeholder="e.g. Ahmedabad"
                        value={targetCity}
                        onChange={(e) => setTargetCity(e.target.value)}
                        className={`w-full rounded-xl py-2 px-2.5 text-xs font-semibold text-[#1a1c1c] outline-hidden border transition-all ${
                          isAddressLocked && memberVerified
                            ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-600"
                            : "bg-gray-50 border-gray-200 focus:border-[#006d36] focus:bg-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">
                        State:
                      </label>
                      <input
                        type="text"
                        disabled={isAddressLocked && memberVerified}
                        placeholder="e.g. Gujarat"
                        value={targetState}
                        onChange={(e) => setTargetState(e.target.value)}
                        className={`w-full rounded-xl py-2 px-2.5 text-xs font-semibold text-[#1a1c1c] outline-hidden border transition-all ${
                          isAddressLocked && memberVerified
                            ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-600"
                            : "bg-gray-50 border-gray-200 focus:border-[#006d36] focus:bg-white"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Consignee Mobile & GSTIN Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">
                        Recipient Mobile:
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        disabled={isAddressLocked && memberVerified}
                        placeholder="10-digit mobile"
                        value={targetMemberMobile}
                        onChange={(e) => setTargetMemberMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className={`w-full rounded-xl py-2 px-2.5 font-mono text-xs text-[#1a1c1c] outline-hidden border transition-all ${
                          isAddressLocked && memberVerified
                            ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-600"
                            : "bg-gray-50 border-gray-200 focus:border-[#006d36] focus:bg-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">
                        Consignee GSTIN (Optional):
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        disabled={isAddressLocked && memberVerified}
                        placeholder="e.g. 24AAAAA0000A1Z5"
                        value={targetGstin}
                        onChange={(e) => setTargetGstin(e.target.value.toUpperCase())}
                        className={`w-full rounded-xl py-2 px-2.5 font-mono text-xs uppercase text-[#1a1c1c] outline-hidden border transition-all ${
                          isAddressLocked && memberVerified
                            ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-600"
                            : "bg-gray-50 border-gray-200 focus:border-[#006d36] focus:bg-white"
                        }`}
                      />
                    </div>
                  </div>
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

                  {/* 4. Taxable Value */}
                  <div className="flex items-center justify-between text-[#5f5e5e] pt-1 border-t border-gray-100">
                    <span>Taxable Value (Excl. Tax):</span>
                    <span className="font-mono font-bold text-gray-800">₹{totalTaxableAmount.toFixed(2)}</span>
                  </div>

                  {/* 5. Detailed GST Breakdown Strip */}
                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-emerald-950 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-[#006d36]" />
                        <span>Total GST Amount (Included):</span>
                      </span>
                      <span className="font-mono text-[#006d36]">₹{totalGstEstimated.toFixed(2)}</span>
                    </div>
                    {Object.entries(gstBreakdownByRate).map(([rateStr, val]) => (
                      <div key={rateStr} className="flex items-center justify-between text-gray-600 text-[10px] pl-5">
                        <span>GST @ {rateStr}%:</span>
                        <span className="font-mono font-medium">₹{val.gst.toFixed(2)} (Taxable: ₹{val.taxable.toFixed(2)})</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-emerald-200/60 pl-5 font-mono">
                      {(targetState || "").trim().toLowerCase() === "gujarat" ? (
                        <>
                          <span className="text-[#006d36] font-semibold">CGST: ₹{(totalGstEstimated / 2).toFixed(2)}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-[#006d36] font-semibold">SGST: ₹{(totalGstEstimated / 2).toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-blue-700 font-semibold">
                          IGST: ₹{totalGstEstimated.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 6. Shipping Charges */}
                  <div className="flex items-center justify-between text-[#5f5e5e]">
                    <span>Shipping Charges:</span>
                    <span className="font-mono font-bold text-[#006d36]">
                      ₹{effectiveShipping}
                    </span>
                  </div>

                  {/* 7. Final Payable Amount */}
                  <div className="flex items-center justify-between text-sm font-black text-[#1a1c1c] pt-2 border-t border-gray-200">
                    <span>Final Payable Amount:</span>
                    <span className="font-mono text-base text-[#006d36]">₹{(totalPayableAmount + effectiveShipping).toLocaleString("en-IN")}</span>
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
