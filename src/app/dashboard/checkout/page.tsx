"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  QrCode,
  Upload,
  Copy,
  Check,
  Loader2,
  CheckCircle2,
  Building,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Wallet,
  Coins,
} from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import { Product, User } from "@/types";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function MemberCheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Recipient details
  const [targetMemberId, setTargetMemberId] = useState("");
  const [targetMemberName, setTargetMemberName] = useState("");
  const [targetMemberMobile, setTargetMemberMobile] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [totalMrpAmount, setTotalMrpAmount] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPv, setTotalPv] = useState(0);

  // Fund Wallet State
  const [useFundWallet, setUseFundWallet] = useState(false);

  // Payment Verification State
  const [transactionId, setTransactionId] = useState("");
  const [paymentSlipUrl, setPaymentSlipUrl] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Company Payment Credentials
  const COMPANY_BANK = {
    bankName: "HDFC BANK LTD",
    accountName: "AVIRA LIFE CARE",
    accountNumber: "50200098451230",
    ifsc: "HDFC0001234",
    upiId: "aviracare@hdfcbank",
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error loading user:", err);
      }

      // Load cart items
      let loadedCart: CartItem[] = [];
      try {
        const savedCart = localStorage.getItem("aviracare_cart");
        if (savedCart) {
          loadedCart = JSON.parse(savedCart);
          setCart(loadedCart);
        }
      } catch {
        // ignore
      }

      // Load checkout target info
      try {
        const savedTarget = localStorage.getItem("aviracare_checkout_target");
        if (savedTarget) {
          const parsed = JSON.parse(savedTarget);
          if (!parsed.memberId) {
            router.replace("/dashboard/cart");
            return;
          }
          setTargetMemberId(parsed.memberId || "");
          setTargetMemberName(parsed.fullName || "");
          setTargetMemberMobile(parsed.mobile || "");
          setShippingAddress(parsed.address || "");
          setTotalMrpAmount(parsed.totalMrpAmount || parsed.totalAmount || 0);
          setTotalDiscount(parsed.totalDiscount || 0);
          setTotalAmount(parsed.totalAmount || 0);
          setTotalPv(parsed.totalPv || 0);
        } else {
          router.replace("/dashboard/cart");
          return;
        }
      } catch {
        router.replace("/dashboard/cart");
        return;
      }
    }
    loadData();
  }, [router]);

  // Fund Wallet Calculations
  const fundWalletBalance = Number(user?.fundWallet || 0);
  const walletDeduction = useFundWallet ? Math.min(totalAmount, fundWalletBalance) : 0;
  const remainingPayable = Math.max(0, totalAmount - walletDeduction);
  const isFullWalletPayment = useFundWallet && walletDeduction >= totalAmount;

  const handleCopy = (text: string, type: "upi" | "bank") => {
    navigator.clipboard.writeText(text);
    if (type === "upi") {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Slip image must be under 5MB.");
      return;
    }

    setUploadingSlip(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, folder: "payment_slips" }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setPaymentSlipUrl(data.url);
        } else {
          setPaymentSlipUrl(base64);
        }
      } catch {
        setPaymentSlipUrl(base64);
      } finally {
        setUploadingSlip(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceOrderClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFullWalletPayment) {
      if (!transactionId.trim()) {
        alert("Please enter the Bank UTR or UPI Transaction Reference ID.");
        return;
      }

      if (!paymentSlipUrl) {
        alert("Please upload your payment screenshot / receipt for the remaining amount.");
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    setShowConfirmModal(false);
    setSubmittingOrder(true);

    try {
      const res = await fetch("/api/products/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: targetMemberId.trim().toUpperCase(),
          items: cart.map((it) => ({
            productId: it.product.id,
            name: it.product.name,
            hsnCode: it.product.hsnCode || "30049011",
            mrp: Number(it.product.mrp || it.product.discountPrice || 0),
            price: Number(it.product.discountPrice || it.product.mrp || 0),
            discountPrice: Number(it.product.discountPrice || it.product.mrp || 0),
            pv: Number(it.product.pv || 0),
            quantity: Number(it.quantity || 1),
          })),
          amount: totalAmount,
          pv: totalPv,
          fundWalletUsed: walletDeduction,
          transactionId: isFullWalletPayment ? "100% FUND WALLET" : transactionId.trim(),
          paymentSlip: isFullWalletPayment ? "" : paymentSlipUrl,
          paymentSlipUrl: isFullWalletPayment ? "" : paymentSlipUrl,
          shippingAddress: shippingAddress.trim(),
          customerName: targetMemberName,
          customerMobile: targetMemberMobile,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Clear Cart and Checkout Session
        localStorage.removeItem("aviracare_cart");
        localStorage.removeItem("aviracare_checkout_target");

        router.push(
          `/dashboard/orders?success=1&orderId=${encodeURIComponent(
            data.orderId || "new"
          )}`
        );
      } else {
        alert(data.message || "Failed to submit order.");
      }
    } catch {
      alert("Network error processing order submission.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between pb-2">
          <Link
            href="/dashboard/cart"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shopping Cart</span>
          </Link>
          <span className="text-xs text-[#5f5e5e] font-mono">
            Checkout & Payment Verification
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Bank QR & Company Account */}
          <div className="md:col-span-6 space-y-6">
            {/* Company Bank Account Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#1a1c1c]">Avira Life Care Account</h3>
                  <span className="text-[10px] text-[#5f5e5e]">Official Verified Company Bank</span>
                </div>
              </div>

              {/* Dynamic QR Code */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-2">
                <div className="w-36 h-36 bg-white rounded-xl mx-auto flex items-center justify-center p-2 border border-gray-200 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `upi://pay?pa=${COMPANY_BANK.upiId}&pn=${COMPANY_BANK.accountName}&am=${remainingPayable}&cu=INR`
                    )}`}
                    alt="Company UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-black font-mono text-[#006d36] block">
                    {remainingPayable > 0 ? `Pay ₹${remainingPayable.toLocaleString("en-IN")}` : "100% Covered by Wallet"}
                  </span>
                  <span className="text-[11px] font-mono text-gray-600 block">
                    {COMPANY_BANK.upiId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(COMPANY_BANK.upiId, "upi")}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-[#006d36] hover:bg-emerald-50 cursor-pointer"
                >
                  {copiedUpi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUpi ? "Copied UPI" : "Copy UPI ID"}</span>
                </button>
              </div>

              {/* Bank Account Details */}
              <div className="space-y-2 text-xs bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60">
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">Bank Name:</span>
                  <strong className="text-[#1a1c1c]">{COMPANY_BANK.bankName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">Account Name:</span>
                  <strong className="text-[#1a1c1c]">{COMPANY_BANK.accountName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">Account Number:</span>
                  <strong className="font-mono text-[#006d36]">{COMPANY_BANK.accountNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">IFSC Code:</span>
                  <strong className="font-mono text-[#1a1c1c]">{COMPANY_BANK.ifsc}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary, Fund Wallet & Transaction Slip Form */}
          <div className="md:col-span-6 space-y-6">
            {/* Order Summary & Fund Wallet Selection Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase text-[#1a1c1c] tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#006d36]" />
                <span>Order Summary</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">Recipient Associate:</span>
                  <strong className="text-[#1a1c1c]">{targetMemberName} ({targetMemberId})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">Point Volume:</span>
                  <strong className="font-mono text-purple-700">{totalPv} PV</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">Shipping Address:</span>
                  <span className="text-[#1a1c1c] truncate max-w-[200px]">{shippingAddress}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-[#1a1c1c] pt-2 border-t border-gray-100">
                  <span>Total Order Amount:</span>
                  <span className="font-mono">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* FUND WALLET CHECKBOX / TOGGLE */}
              {fundWalletBalance > 0 ? (
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-white rounded-2xl border border-emerald-300 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useFundWallet}
                      onChange={(e) => setUseFundWallet(e.target.checked)}
                      className="w-4 h-4 text-[#006d36] rounded border-gray-300 focus:ring-[#006d36] cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-xs text-[#006d36] block">
                        Use Fund Wallet Balance
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        Available: ₹{fundWalletBalance.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </label>

                  {useFundWallet && (
                    <div className="pt-2 border-t border-emerald-200/80 text-xs space-y-1">
                      <div className="flex justify-between text-emerald-800">
                        <span>Fund Wallet Applied:</span>
                        <strong className="font-mono">- ₹{walletDeduction.toLocaleString("en-IN")}</strong>
                      </div>
                      <div className="flex justify-between text-xs font-black text-[#1a1c1c] pt-1 border-t border-dashed border-emerald-200">
                        <span>Remaining to Pay:</span>
                        <span className="font-mono text-[#006d36]">
                          ₹{remainingPayable.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-gray-400" />
                    <span>Fund Wallet Balance: ₹0</span>
                  </div>
                  <Link href="/dashboard/fund" className="text-[10px] text-[#006d36] font-bold hover:underline">
                    + Deposit Funds
                  </Link>
                </div>
              )}
            </div>

            {/* Payment Proof Form */}
            <form onSubmit={handlePlaceOrderClick} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase text-[#1a1c1c] tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#006d36]" />
                <span>{isFullWalletPayment ? "Wallet Payment Confirmation" : "Submit Payment Reference"}</span>
              </h3>

              {isFullWalletPayment ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#006d36] mx-auto" />
                  <h4 className="font-black text-xs text-[#006d36]">100% Covered by Fund Wallet!</h4>
                  <p className="text-[11px] text-emerald-800">
                    No manual bank transfer or slip upload required. ₹{totalAmount.toLocaleString("en-IN")} will be deducted from your Fund Wallet instantly.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#1a1c1c] mb-1">
                      Bank UTR / UPI Transaction Reference ID (for ₹{remainingPayable.toLocaleString("en-IN")}):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 423588990012 or UPI Ref ID"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-mono font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1c1c] mb-1">
                      Payment Screenshot / Slip (for ₹{remainingPayable.toLocaleString("en-IN")}):
                    </label>
                    {paymentSlipUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-emerald-300 h-32 bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={paymentSlipUrl} alt="Payment Slip" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPaymentSlipUrl("")}
                          className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white rounded-lg text-[10px] font-bold"
                        >
                          Change Slip
                        </button>
                      </div>
                    ) : (
                      <label className="h-32 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#006d36] flex flex-col items-center justify-center cursor-pointer bg-gray-50/50">
                        {uploadingSlip ? (
                          <Loader2 className="w-6 h-6 animate-spin text-[#006d36]" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-[#5f5e5e] font-bold mt-1">Upload Payment Screenshot</span>
                            <span className="text-[10px] text-gray-400">JPG, PNG (Max 5MB)</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleSlipUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={submittingOrder || (!isFullWalletPayment && (!transactionId.trim() || !paymentSlipUrl))}
                className="w-full mt-2 py-3.5 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {submittingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>
                  {isFullWalletPayment
                    ? `Confirm & Pay ₹${totalAmount.toLocaleString("en-IN")} with Fund Wallet`
                    : `Confirm & Place Order (₹${remainingPayable.toLocaleString("en-IN")})`}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* ORDER CONFIRMATION ALERT MODAL */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#006d36] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1a1c1c]">Confirm Order Placement</h3>
                <p className="text-xs text-[#5f5e5e] leading-relaxed">
                  Are you sure you want to submit this order of{" "}
                  <strong className="text-[#006d36]">₹{totalAmount.toLocaleString("en-IN")} ({totalPv} PV)</strong> for Associate{" "}
                  <strong className="text-[#1a1c1c]">{targetMemberName} ({targetMemberId})</strong>?
                  {walletDeduction > 0 && (
                    <span className="block text-[11px] text-emerald-700 font-bold mt-1">
                      (₹{walletDeduction.toLocaleString("en-IN")} will be deducted from your Fund Wallet)
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#5f5e5e] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  className="flex-1 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Yes, Submit Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
