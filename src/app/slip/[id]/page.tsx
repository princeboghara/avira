"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import ParcelSlip from "@/components/invoice/ParcelSlip";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SlipPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoPrint = searchParams.get("print") === "1";
  const orderId = resolvedParams?.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    let active = true;
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError(data.message || "Order not found");
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Error loading slip:", err);
          setError("Failed to load parcel slip");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#006d36] animate-spin mb-3" />
        <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">
          Loading Parcel Dispatch Slip...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-gray-900">Slip Unavailable</h2>
          <p className="text-xs text-gray-500">{error || "Could not find parcel slip for this order."}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 print:p-0 print:bg-white flex flex-col items-center">
      <ParcelSlip order={order} autoPrint={autoPrint} onBack={() => router.back()} />
    </div>
  );
}
