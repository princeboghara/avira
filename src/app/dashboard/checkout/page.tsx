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
  CreditCard,
  Zap,
  MapPin,
  UserCheck,
} from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import { Product, User } from "@/types";
import { openRazorpayCheckout } from "@/lib/razorpayClient";

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
  const [targetPincode, setTargetPincode] = useState("");
  const [targetCity, setTargetCity] = useState("");
  const [targetState, setTargetState] = useState("");
  const [consigneeGstin, setConsigneeGstin] = useState("");
  const [buyerGstin, setBuyerGstin] = useState("");
  const [isIntraState, setIsIntraState] = useState(true);
  const [totalMrpAmount, setTotalMrpAmount] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(75);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPv, setTotalPv] = useState(0);

  // Payment Method Selection: 'razorpay' | 'manual'
  const [paymentMode, setPaymentMode] = useState<"razorpay" | "manual">("razorpay");

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
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);

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
      let parsedShipping = 75;
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
          setShippingAddress(parsed.shippingAddress || parsed.address || "");
          setTargetPincode(parsed.pincode || "");
          setTargetCity(parsed.city || "");
          setTargetState(parsed.state || "");
          setConsigneeGstin(parsed.consigneeGstin || "");
          setBuyerGstin(parsed.buyerGstin || "");
          if (parsed.isIntraState !== undefined) {
            setIsIntraState(parsed.isIntraState);
          } else if (parsed.state) {
            setIsIntraState(parsed.state.toLowerCase() === "gujarat");
          }
          if (typeof parsed.shippingCharge === "number") {
            parsedShipping = parsed.shippingCharge;
          }
        } else {
          router.replace("/dashboard/cart");
          return;
        }
      } catch {
        router.replace("/dashboard/cart");
        return;
      }

      setShippingCharge(parsedShipping);

      // Calculate totals
      let mrpSum = 0;
      let finalSum = 0;
      let pvSum = 0;

      loadedCart.forEach((item) => {
        const qty = item.quantity || 1;
        const mrp = item.product.mrp || item.product.discountPrice || 0;
        const price = item.product.discountPrice || item.product.mrp || 0;
        const pv = item.product.pv || 0;

        mrpSum += mrp * qty;
        finalSum += price * qty;
        pvSum += pv * qty;
      });

      setTotalMrpAmount(mrpSum);
      setTotalDiscount(mrpSum - finalSum);
      setTotalAmount(finalSum + parsedShipping);
      setTotalPv(pvSum);
    }

    loadData();
  }, [router]);

  // Fund Wallet Calculations
  const fundWalletBalance = Number(user?.fundWallet || 0);
  const walletDeduction = useFundWallet
    ? Math.min(fundWalletBalance, totalAmount)
    : 0;
  const remainingPayable = Math.max(0, totalAmount - walletDeduction);
  const isFullWalletPayment = useFundWallet && remainingPayable === 0;

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
      alert("File size exceeds 5MB limit.");
      return;
    }

    setUploadingSlip(true);
    const reader = new FileReader();
    reader.onload = async () => {
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

  // Submit order helper function
  const executeOrderSubmission = async (txnId: string, slip: string) => {
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
            hsnCode: it.product.hsnCode || "3004",
            gst: Number(it.product.gstRate || it.product.hsnGst || 5),
            mrp: Number(it.product.mrp || it.product.discountPrice || 0),
            price: Number(it.product.discountPrice || it.product.mrp || 0),
            discountPrice: Number(it.product.discountPrice || it.product.mrp || 0),
            pv: Number(it.product.pv || 0),
            quantity: Number(it.quantity || 1),
          })),
          amount: totalAmount,
          pv: totalPv,
          shippingCharge: shippingCharge,
          fundWalletUsed: walletDeduction,
          transactionId: txnId,
          paymentSlip: slip,
          paymentSlipUrl: slip,
          shippingAddress: shippingAddress.trim(),
          customerName: targetMemberName,
          customerMobile: targetMemberMobile,
          recipientPincode: targetPincode,
          recipientCity: targetCity,
          recipientState: targetState,
          consigneeGstin: consigneeGstin,
          buyerGstin: buyerGstin || user?.gstNumber || "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Clear Cart and Checkout Session
        localStorage.removeItem("aviracare_cart");
        localStorage.removeItem("aviracare_checkout_target");

        setOrderPlacedSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/orders");
        }, 1800);
      } else {
        alert(data.message || "Failed to submit order.");
      }
    } catch {
      alert("Network error processing order submission.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Trigger Razorpay Standard Modal
  const handleRazorpayOnlinePay = async () => {
    if (remainingPayable <= 0) {
      await executeOrderSubmission("100% FUND WALLET", "");
      return;
    }

    try {
      setSubmittingOrder(true);
      await openRazorpayCheckout({
        amount: remainingPayable,
        name: "AVIRA LIFE CARE",
        description: `Order Checkout (${totalPv} PV)`,
        prefill: {
          name: targetMemberName || user?.fullName || "",
          contact: targetMemberMobile || user?.mobile || "",
          email: user?.email || "",
        },
        onSuccess: async (paymentData) => {
          // Razorpay payment verified via HMAC-SHA256
          await executeOrderSubmission(
            paymentData.razorpay_payment_id,
            `https://dashboard.razorpay.com/app/payments/${paymentData.razorpay_payment_id}`
          );
        },
        onFailure: (err) => {
          setSubmittingOrder(false);
          alert("Razorpay Payment Failed: " + (err?.message || "Payment cancelled"));
        },
        onDismiss: () => {
          setSubmittingOrder(false);
        },
      });
    } catch (err: any) {
      setSubmittingOrder(false);
      alert("Error initiating Razorpay: " + err.message);
    }
  };

  const handlePlaceOrderClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFullWalletPayment && paymentMode === "manual") {
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

    if (isFullWalletPayment) {
      await executeOrderSubmission("100% FUND WALLET", "");
    } else if (paymentMode === "razorpay") {
      await handleRazorpayOnlinePay();
    } else {
      await executeOrderSubmission(transactionId.trim(), paymentSlipUrl);
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
          <div className="flex items-center gap-2 text-xs font-mono text-[#5f5e5e]">
            <span>Cart</span>
            <span>&rarr;</span>
            <span className="text-[#006d36] font-bold">Secure Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Payment Credentials / Modes */}
          <div className="md:col-span-6 space-y-6">
            {/* Payment Method Selector */}
            {!isFullWalletPayment && (
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
                <h3 className="font-bold text-xs uppercase text-[#1a1c1c] tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#006d36]" />
                  <span>Choose Payment Method</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("razorpay")}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      paymentMode === "razorpay"
                        ? "border-[#006d36] bg-emerald-50/60 shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Zap className={`w-5 h-5 ${paymentMode === "razorpay" ? "text-[#006d36]" : "text-gray-400"}`} />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#006d36]">Instant</span>
                    </div>
                    <div>
                      <strong className="block text-xs text-[#1a1c1c]">Razorpay Online</strong>
                      <span className="text-[10px] text-gray-500">UPI, QR, Cards, NetBanking</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode("manual")}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      paymentMode === "manual"
                        ? "border-[#006d36] bg-emerald-50/60 shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Building className={`w-5 h-5 ${paymentMode === "manual" ? "text-[#006d36]" : "text-gray-400"}`} />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Manual</span>
                    </div>
                    <div>
                      <strong className="block text-xs text-[#1a1c1c]">Bank Transfer</strong>
                      <span className="text-[10px] text-gray-500">NEFT / IMPS & UTR Slip</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* If Manual Bank Transfer is selected, show Bank Details */}
            {paymentMode === "manual" && !isFullWalletPayment && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="font-bold text-xs uppercase text-[#1a1c1c] tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#006d36]" />
                    <span>Company Bank Account</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Verified Account
                  </span>
                </div>

                {/* Company UPI QR */}
                <div className="p-4 rounded-2xl bg-gray-50 flex flex-col items-center justify-center space-y-3 border border-gray-200/80">
                  <div className="w-40 h-40 bg-white p-2 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `upi://pay?pa=${COMPANY_BANK.upiId}&pn=${COMPANY_BANK.accountName}&am=${remainingPayable}&cu=INR`
                      )}`}
                      alt="Company UPI QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#1a1c1c]">
                    <span>{COMPANY_BANK.upiId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(COMPANY_BANK.upiId, "upi")}
                      className="p-1 rounded-md hover:bg-gray-200 text-gray-500 cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-400">Scan via GPay / PhonePe / Paytm</span>
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
            )}

            {/* If Razorpay is selected, show Instant Gateway Card with direct PAY button */}
            {/* If Razorpay is selected, show Neumorphic Instant Gateway Card */}
            {paymentMode === "razorpay" && !isFullWalletPayment && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006d36] flex items-center justify-center border border-emerald-200 shadow-2xs">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-slate-900">Razorpay Online Payment</h3>
                      <p className="text-xs text-slate-500">Standard 256-bit Secure Gateway</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-[#006d36] uppercase tracking-wider">
                    Fast & Live
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700 pb-2 border-b border-slate-200/60">
                    <span className="font-bold">Payable Amount:</span>
                    <strong className="font-mono text-base text-[#006d36]">₹{remainingPayable.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#006d36]" />
                    <span>Instant PV Credit & Order Confirmation</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#006d36]" />
                    <span>UPI (GPay, PhonePe, Paytm), Cards, NetBanking, QR</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#006d36]" />
                    <span>0 Waiting • Direct Associate Invoice Generation</span>
                  </div>
                </div>

                {/* Direct Pay Button Inside this Card */}
                <button
                  type="button"
                  onClick={handleRazorpayOnlinePay}
                  disabled={submittingOrder}
                  className="w-full py-4 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Opening Gateway...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pay ₹{remainingPayable.toLocaleString("en-IN")} via Razorpay</span>
                      <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200 ml-1" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary, Fund Wallet & Transaction Slip Form */}
          <div className="md:col-span-6 space-y-6">
            {/* Order Summary & Fund Wallet Selection Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase text-[#1a1c1c] tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#006d36]" />
                <span>Order Summary</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* Consignee Recipient Details */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#006d36]" />
                      <span>Consignee (Recipient):</span>
                    </span>
                    <span className="font-mono font-bold text-xs text-[#006d36]">
                      {targetMemberId}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-gray-900">
                    {targetMemberName || "Valued Associate"}
                  </div>
                  {targetMemberMobile && (
                    <div className="text-[10px] text-gray-600 font-mono">
                      📱 Mobile: {targetMemberMobile}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-600 font-mono">
                    GSTIN: {consigneeGstin || "URP (Unregistered)"}
                  </div>
                </div>

                {/* Delivery Shipping Address Box */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-gray-700 font-bold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#006d36]" />
                      <span>Shipping Delivery Address:</span>
                    </span>
                    {targetPincode && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-gray-200 font-bold">
                        PIN: {targetPincode}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-800 leading-relaxed font-medium">
                    {shippingAddress || [targetCity, targetState, targetPincode ? `PIN: ${targetPincode}` : ""].filter(Boolean).join(", ") || "Address not provided"}
                  </p>
                </div>

                {/* Buyer / Billed By Info */}
                <div className="flex justify-between items-center text-[11px] text-gray-600 px-1">
                  <span>Billed By (Buyer):</span>
                  <span className="font-semibold text-gray-800">
                    {user?.fullName || "Self"} ({user?.memberId || "Self"})
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-gray-600 px-1 font-mono">
                  <span>Buyer GSTIN:</span>
                  <span className="text-gray-700">
                    {buyerGstin || user?.gstNumber || "URP (Unregistered)"}
                  </span>
                </div>

                {/* PV & Amounts */}
                <div className="flex justify-between px-1 pt-1 border-t border-gray-100">
                  <span className="text-[#5f5e5e]">Point Volume:</span>
                  <strong className="font-mono text-purple-700 font-bold">{totalPv} PV</strong>
                </div>
                <div className="flex justify-between px-1">
                  <span className="text-[#5f5e5e]">Products Subtotal:</span>
                  <span className="font-mono">₹{(totalMrpAmount - totalDiscount).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between px-1 text-[#006d36]">
                  <span>Shipping Charges:</span>
                  <span className="font-mono font-bold">₹{shippingCharge}</span>
                </div>

                {/* Tax Status */}
                <div className="flex justify-between px-1 text-[11px] text-gray-500 font-mono">
                  <span>GST Application:</span>
                  <span className={isIntraState ? "text-[#006d36] font-bold" : "text-blue-700 font-bold"}>
                    {isIntraState ? "CGST + SGST" : "IGST"}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-bold text-[#1a1c1c] pt-2 border-t border-gray-100 px-1">
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
                </div>
              )}
            </div>

            {/* Payment Execution Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase text-[#1a1c1c] tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#006d36]" />
                <span>
                  {isFullWalletPayment
                    ? "Wallet Payment Confirmation"
                    : paymentMode === "razorpay"
                    ? "Online Razorpay Payment"
                    : "Submit Bank Transfer Reference"}
                </span>
              </h3>

              {isFullWalletPayment ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#006d36] mx-auto" />
                  <h4 className="font-black text-xs text-[#006d36]">100% Covered by Fund Wallet!</h4>
                  <p className="text-[11px] text-emerald-800">
                    No payment gateway or bank slip required. ₹{totalAmount.toLocaleString("en-IN")} will be deducted from your Fund Wallet instantly.
                  </p>
                  <button
                    type="button"
                    disabled={submittingOrder}
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full mt-2 py-3.5 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    {submittingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Confirm & Place Order with Wallet</span>
                  </button>
                </div>
              ) : paymentMode === "razorpay" ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 text-xs space-y-1.5">
                    <div className="flex justify-between text-gray-700">
                      <span>Payable Amount:</span>
                      <strong className="font-mono text-sm text-[#006d36]">₹{remainingPayable.toLocaleString("en-IN")}</strong>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Click the button below to open the Razorpay payment window.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRazorpayOnlinePay}
                    disabled={submittingOrder}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submittingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Razorpay Checkout...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 text-emerald-300" />
                        <span>Pay ₹{remainingPayable.toLocaleString("en-IN")} via Razorpay</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrderClick} className="space-y-4">
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

                  <button
                    type="submit"
                    disabled={submittingOrder || !transactionId.trim() || !paymentSlipUrl}
                    className="w-full mt-2 py-3.5 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submittingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Confirm & Place Order (₹{remainingPayable.toLocaleString("en-IN")})</span>
                  </button>
                </form>
              )}
            </div>
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
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-xs font-bold text-[#5f5e5e] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={submittingOrder}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-800 hover:brightness-110 text-white text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {submittingOrder ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : paymentMode === "razorpay" && !isFullWalletPayment ? (
                    <CreditCard className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>
                    {isFullWalletPayment
                      ? "Pay with Fund Wallet"
                      : paymentMode === "razorpay"
                      ? `Pay ₹${remainingPayable.toLocaleString("en-IN")} via Razorpay`
                      : "Confirm & Submit Order"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Placed Success Modal */}
        {orderPlacedSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-emerald-300 animate-scaleUp">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-[#006d36] shadow-md animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h2>
              <p className="text-xs text-slate-500 font-medium">
                Your order has been recorded. Redirecting directly to your Past Orders page...
              </p>
              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#006d36]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to Past Orders...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
