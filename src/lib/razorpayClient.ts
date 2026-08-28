"use client";

/**
 * Dynamically loads the Razorpay Standard Checkout script (https://checkout.razorpay.com/v1/checkout.js)
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById("razorpay-checkout-script");
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayOptions {
  amount: number; // in Rupees (e.g. 500) or Paise
  amountInPaise?: number; // optional exact paise (e.g. 50000)
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  receipt?: string;
  notes?: Record<string, string>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  onSuccess: (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    verified: boolean;
  }) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

/**
 * Initiates complete Razorpay Standard Web Checkout:
 * 1. Loads checkout.js script
 * 2. Calls POST /api/create-order
 * 3. Opens Razorpay Standard modal
 * 4. Verifies signature via POST /api/verify-payment on success
 */
export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    alert("Failed to load Razorpay Payment Gateway. Please check your internet connection.");
    if (options.onFailure) {
      options.onFailure(new Error("Razorpay SDK load failed"));
    }
    return;
  }

  try {
    // 1. Create order on backend
    const createRes = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: options.amount,
        amountInPaise: options.amountInPaise,
        currency: options.currency || "INR",
        receipt: options.receipt,
        notes: options.notes,
      }),
    });

    const orderData = await createRes.json();
    if (!createRes.ok || !orderData.success || !orderData.order_id) {
      throw new Error(orderData.message || "Failed to initiate payment order");
    }

    const key = orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TVDtnzMXyvMMER";

    // 2. Open Razorpay Checkout modal
    const rzpOptions = {
      key,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: options.name || "AVIRA LIFE CARE",
      description: options.description || "Botanical Healthcare & Repurchase Order",
      image: options.image || "/images/avira-logo.png",
      order_id: orderData.order_id,
      prefill: options.prefill || {
        name: "",
        email: "",
        contact: "",
      },
      theme: options.theme || {
        color: "#006d36",
      },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        try {
          // 3. Verify signature on backend
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            options.onSuccess({
              ...response,
              verified: true,
            });
          } else {
            const err = new Error(verifyData.message || "Payment verification failed");
            if (options.onFailure) options.onFailure(err);
            else alert("Payment verification failed: " + err.message);
          }
        } catch (verErr: any) {
          if (options.onFailure) options.onFailure(verErr);
          else alert("Verification network error: " + verErr.message);
        }
      },
      modal: {
        ondismiss: function () {
          if (options.onDismiss) {
            options.onDismiss();
          }
        },
      },
    };

    const rzpInstance = new (window as any).Razorpay(rzpOptions);
    
    rzpInstance.on("payment.failed", function (response: any) {
      console.error("Razorpay payment failed:", response.error);
      const errMsg = response.error?.description || response.error?.reason || "Payment process was interrupted or failed.";
      if (options.onFailure) {
        options.onFailure(new Error(errMsg));
      } else {
        alert("Payment Failed: " + errMsg);
      }
    });

    rzpInstance.open();
  } catch (err: any) {
    console.error("Open Razorpay error:", err);
    if (options.onFailure) {
      options.onFailure(err);
    } else {
      alert("Error initiating Razorpay checkout: " + err.message);
    }
  }
}
