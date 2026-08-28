"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Zap,
  Lock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import { RazorpayCheckoutButton } from "@/components/payment/RazorpayCheckoutButton";

export default function TestPaymentPage() {
  const [amount, setAmount] = useState<number>(100);
  const [customerName, setCustomerName] = useState("Avira Associate");
  const [customerEmail, setCustomerEmail] = useState("support@aviracare.in");
  const [customerPhone, setCustomerPhone] = useState("9712326273");

  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    paymentId?: string;
    orderId?: string;
    signature?: string;
    message?: string;
    timestamp?: string;
  } | null>(null);

  const presetAmounts = [1, 10, 100, 500, 1000, 2500, 5000];

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#006d36] hover:underline mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl font-black text-[#1a1c1c] flex items-center gap-2.5">
              <CreditCard className="w-7 h-7 text-[#006d36]" />
              <span>Razorpay Standard Web Checkout</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Test live payment orders, standard modal checkout, and HMAC-SHA256 signature verification.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-bold self-start">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Test Mode Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Payment Configuration */}
          <div className="md:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Payment Details</span>
              </h2>

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Amount (in INR ₹):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-8 pr-4 text-base font-black text-gray-900 focus:outline-hidden focus:border-emerald-600"
                    placeholder="Enter amount"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        amount === amt
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      ₹{amt.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Customer Name:
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Email:
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-900 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mobile Number:
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-900 focus:outline-hidden focus:border-emerald-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Razorpay Standard Checkout Button */}
              <div className="pt-2">
                <RazorpayCheckoutButton
                  amount={amount}
                  name="AVIRA LIFE CARE"
                  description={`Test Checkout of ₹${amount}`}
                  prefill={{
                    name: customerName,
                    email: customerEmail,
                    contact: customerPhone,
                  }}
                  onSuccess={(data) => {
                    setPaymentResult({
                      success: true,
                      paymentId: data.razorpay_payment_id,
                      orderId: data.razorpay_order_id,
                      signature: data.razorpay_signature,
                      message: "Payment successfully verified on backend via HMAC-SHA256!",
                      timestamp: new Date().toLocaleTimeString(),
                    });
                  }}
                  onFailure={(err) => {
                    setPaymentResult({
                      success: false,
                      message: err?.message || "Payment was rejected or cancelled.",
                      timestamp: new Date().toLocaleTimeString(),
                    });
                  }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted Standard Razorpay Checkout</span>
              </div>
            </div>
          </div>

          {/* Right Column: Verification & Response Log */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verification Result</span>
                </div>
                {paymentResult && (
                  <button
                    onClick={() => setPaymentResult(null)}
                    className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </h2>

              {paymentResult ? (
                paymentResult.success ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Payment Verified Successfully!</span>
                    </div>
                    <p className="text-xs text-emerald-900">{paymentResult.message}</p>
                    <div className="space-y-1.5 text-[11px] font-mono text-gray-700 bg-white/80 p-3 rounded-xl border border-emerald-100">
                      <div>
                        <span className="text-gray-400">Order ID: </span>
                        <strong className="text-emerald-700">{paymentResult.orderId}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Payment ID: </span>
                        <strong className="text-emerald-700">{paymentResult.paymentId}</strong>
                      </div>
                      <div className="truncate">
                        <span className="text-gray-400">Signature: </span>
                        <span className="text-gray-600">{paymentResult.signature}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 pt-1">
                        Timestamp: {paymentResult.timestamp}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <span>Payment Error</span>
                    </div>
                    <p className="text-xs text-red-700">{paymentResult.message}</p>
                    <div className="text-[10px] text-gray-400">
                      Timestamp: {paymentResult.timestamp}
                    </div>
                  </div>
                )
              ) : (
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center space-y-2 text-gray-400">
                  <Sparkles className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="text-xs">
                    Click the payment button on the left to trigger the Razorpay modal. The live verification response will appear here.
                  </p>
                </div>
              )}

              {/* Endpoints & Technical Info */}
              <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                <h3 className="font-bold text-gray-700 text-[11px] uppercase tracking-wide">
                  Active Integration Endpoints:
                </h3>
                <div className="space-y-1 text-[11px] font-mono text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span>POST /api/create-order</span>
                    <span className="text-emerald-600 font-bold">200 OK</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span>POST /api/verify-payment</span>
                    <span className="text-emerald-600 font-bold">HMAC-SHA256</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
