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
  CreditCard,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import MemberLayout from "@/components/dashboard/MemberLayout";
import { Product, User } from "@/types";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function MemberCheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Mini invoice info from cart & checkout target
  const [targetMemberId, setTargetMemberId] = useState("");
  const [targetMemberName, setTargetMemberName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPv, setTotalPv] = useState(0);

  // Payment Verification State
  const [transactionId, setTransactionId] = useState("");
  const [paymentSlipUrl, setPaymentSlipUrl] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/auth/me");
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
          setTargetMemberId(parsed.memberId || "");
          setTargetMemberName(parsed.fullName || "");
          setShippingAddress(parsed.address || "");
          setTotalAmount(parsed.totalAmount || 0);
          setTotalPv(parsed.totalPv || 0);
        } else if (loadedCart.length > 0) {
          // fallback calculate from cart
          const amt = loadedCart.reduce(
            (acc, it) => acc + (it.product.discountPrice || it.product.mrp) * it.quantity,
            0
          );
          const pv = loadedCart.reduce((acc, it) => acc + it.product.pv * it.quantity, 0);
          setTotalAmount(amt);
          setTotalPv(pv);
        }
      } catch {
        // ignore
      }
    }
    loadData();
  }, []);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("aviracare@icici");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyBank = () => {
    navigator.clipboard.writeText("002105001234");
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Payment slip file size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      setPaymentSlipUrl(base64Data); // Instant local preview

      // Direct asynchronous upload to Cloudinary folder AVIRALIFECARE/slips
      try {
        setUploadingSlip(true);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64Data, folder: "slips" }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setPaymentSlipUrl(data.url);
        }
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      } finally {
        setUploadingSlip(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0 && totalAmount === 0) {
      alert("Your cart is empty. Please add products first.");
      router.push("/dashboard/store");
      return;
    }

    if (!targetMemberId.trim()) {
      alert("Recipient Member ID is missing. Please go back to cart to verify recipient.");
      router.push("/dashboard/cart");
      return;
    }

    if (!transactionId.trim()) {
      alert("Please enter the Bank Transaction ID / UPI Ref UTR Number.");
      return;
    }

    if (!paymentSlipUrl) {
      alert("Please upload your payment screenshot / transaction slip.");
      return;
    }

    setSubmittingOrder(true);
    try {
      const itemsPayload = cart.map((it) => ({
        productId: it.product.id,
        name: it.product.name,
        quantity: it.quantity,
        mrp: it.product.discountPrice || it.product.mrp,
        pv: it.product.pv,
        subtotalMrp: (it.product.discountPrice || it.product.mrp) * it.quantity,
        subtotalPv: it.product.pv * it.quantity,
      }));

      const res = await fetch("/api/products/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: targetMemberId.trim().toUpperCase(),
          targetMemberId: targetMemberId.trim().toUpperCase(),
          items: itemsPayload,
          amount: totalAmount,
          totalAmount,
          pv: totalPv,
          totalPv,
          transactionId: transactionId.trim(),
          paymentSlip: paymentSlipUrl,
          paymentSlipUrl: paymentSlipUrl,
          shippingAddress: shippingAddress.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Clear local storage cart & checkout target
        localStorage.removeItem("aviracare_cart");
        localStorage.removeItem("aviracare_checkout_target");
        alert("🎉 Order submitted successfully! Your order is placed for administrative approval.");
        router.push("/dashboard/orders");
      } else {
        alert(data.message || "Failed to submit order.");
      }
    } catch {
      alert("Error submitting order. Please check network connection.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between pb-2">
          <Link
            href="/dashboard/cart"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart Invoice</span>
          </Link>
          <span className="text-xs text-[#5f5e5e] font-mono">
            Step 2: Payment & Slip Upload
          </span>
        </div>

        {/* ========================================================
            1. MINI INVOICE CARD (Member ID, Name, PV, Amount)
           ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase">
                  Order Summary
                </span>
                <span className="text-xs text-[#5f5e5e] font-medium">
                  Mini Invoice
                </span>
              </div>
              <h2 className="text-xl font-black text-[#1a1c1c]">Order Payment Checkout</h2>
            </div>
            <span className="text-xs font-mono font-black text-[#006d36] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              +{totalPv} PV Credited
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                Recipient Member ID
              </span>
              <span className="font-black text-sm text-[#006d36] block mt-0.5">
                {targetMemberId || "AV00001"}
              </span>
            </div>

            <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                Associate Name
              </span>
              <span className="font-bold text-sm text-[#1a1c1c] block mt-0.5 truncate">
                {targetMemberName || "Avira Associate"}
              </span>
            </div>

            <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                Total Volume (PV)
              </span>
              <span className="font-black text-sm text-[#006d36] block mt-0.5">
                +{totalPv} PV
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300">
              <span className="text-[10px] uppercase font-bold text-[#006d36] block">
                Payable Amount
              </span>
              <span className="font-black text-base text-[#006d36] block mt-0.5">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {shippingAddress && (
            <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] text-xs">
              <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                Delivery Shipping Destination
              </span>
              <span className="font-medium text-[#1a1c1c] block mt-0.5">
                {shippingAddress}
              </span>
            </div>
          )}
        </div>

        {/* ========================================================
            2. COMPANY OFFICIAL BANK DETAILS
           ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#e2e2e2]">
            <Building className="w-5 h-5 text-[#006d36]" />
            <div>
              <h3 className="text-base font-black text-[#1a1c1c]">
                Official Company Bank Account Details
              </h3>
              <span className="text-xs text-[#5f5e5e]">
                Direct RTGS / NEFT / IMPS transfer details
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <span className="text-[10px] text-[#5f5e5e] uppercase font-bold block">
                Bank Name
              </span>
              <span className="font-bold text-sm text-[#1a1c1c] block mt-0.5">
                ICICI Bank
              </span>
            </div>

            <div className="p-3.5 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <span className="text-[10px] text-[#5f5e5e] uppercase font-bold block">
                Account Number
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-black text-sm text-[#006d36]">
                  002105001234
                </span>
                <button
                  type="button"
                  onClick={handleCopyBank}
                  className="text-xs text-[#006d36] hover:underline cursor-pointer"
                >
                  {copiedBank ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <span className="text-[10px] text-[#5f5e5e] uppercase font-bold block">
                IFSC Code
              </span>
              <span className="font-bold text-sm text-[#1a1c1c] block mt-0.5">
                ICIC0000021
              </span>
            </div>

            <div className="p-3.5 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <span className="text-[10px] text-[#5f5e5e] uppercase font-bold block">
                Account Holder
              </span>
              <span className="font-bold text-xs text-[#1a1c1c] block mt-0.5 truncate">
                Avira Life Care Pvt Ltd
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. UPI QR CODE & TRANSACTION SLIP UPLOAD FORM
           ======================================================== */}
        <form onSubmit={handleSubmitOrder} className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#e2e2e2]">
            <QrCode className="w-5 h-5 text-[#006d36]" />
            <div>
              <h3 className="text-base font-black text-[#1a1c1c]">
                UPI QR Payment & Verification
              </h3>
              <span className="text-xs text-[#5f5e5e]">
                Scan the dynamic QR code with GPay, PhonePe, or Paytm and attach receipt
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* QR Code */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#006d36] block">
                Scan Avira Life Care UPI QR
              </span>

              <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=aviracare@icici%26pn=Avira%20Life%20Care%26am=${totalAmount}%26cu=INR`}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xs font-bold text-[#1a1c1c]">
                  aviracare@icici
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-1.5 rounded-lg bg-white border border-[#e2e2e2] hover:bg-emerald-50 cursor-pointer text-xs font-bold text-[#006d36] flex items-center gap-1"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-[#006d36]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Form Inputs: Transaction ID & Slip */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  Bank Transaction ID / UTR Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 423984729103 or UPI Ref No"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-mono font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider">
                  Upload Payment Screenshot / Slip *
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2.5 rounded-xl border border-[#e2e2e2] bg-white hover:bg-emerald-50 text-[#006d36] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-2xs">
                    <Upload className="w-4 h-4" />
                    <span>Choose Slip Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSlipUpload}
                      className="hidden"
                      required={!paymentSlipUrl}
                    />
                  </label>
                  {uploadingSlip ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#006d36] font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Cloudinary...</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#5f5e5e]">
                      JPG, PNG (Max 5MB)
                    </span>
                  )}
                </div>

                {paymentSlipUrl && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-300 w-fit mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={paymentSlipUrl}
                      alt="Slip Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-[#e2e2e2]"
                    />
                    <div>
                      <span className="font-bold text-[#006d36] block text-xs">
                        {paymentSlipUrl.startsWith("http") ? "✓ Payment Slip Stored in Cloudinary" : "✓ Payment Slip Attached"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPaymentSlipUrl("")}
                        className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full py-4 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#006d36]/20 cursor-pointer disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Order for Approval...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Submit Order For Approval (₹{totalAmount.toLocaleString("en-IN")})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </MemberLayout>
  );
}
