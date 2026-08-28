"use client";

import React, { useState } from "react";
import { openRazorpayCheckout, RazorpayOptions } from "@/lib/razorpayClient";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

interface RazorpayCheckoutButtonProps {
  amount: number; // in Rupees
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure?: (error: any) => void;
  className?: string;
  buttonText?: string;
  disabled?: boolean;
}

export function RazorpayCheckoutButton({
  amount,
  name = "AVIRA LIFE CARE",
  description = "Standard Online Checkout",
  prefill,
  onSuccess,
  onFailure,
  className,
  buttonText,
  disabled = false,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (disabled || loading) return;
    setLoading(true);

    try {
      await openRazorpayCheckout({
        amount,
        name,
        description,
        prefill,
        onSuccess: (data) => {
          setLoading(false);
          onSuccess(data);
        },
        onFailure: (err) => {
          setLoading(false);
          if (onFailure) onFailure(err);
        },
        onDismiss: () => {
          setLoading(false);
        },
      });
    } catch (err) {
      setLoading(false);
      if (onFailure) onFailure(err);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={disabled || loading || amount <= 0}
      className={
        className ||
        "w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-700/20 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      }
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Opening Razorpay Gateway...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5 text-emerald-300" />
          <span>
            {buttonText || `Pay ₹${amount.toLocaleString("en-IN")} via Razorpay`}
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-300/80 ml-auto hidden sm:inline" />
        </>
      )}
    </button>
  );
}
