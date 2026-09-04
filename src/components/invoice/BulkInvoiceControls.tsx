"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

interface BulkInvoiceControlsProps {
  ordersCount: number;
  autoPrint?: boolean;
}

export default function BulkInvoiceControls({
  ordersCount,
  autoPrint,
}: BulkInvoiceControlsProps) {
  const router = useRouter();

  useEffect(() => {
    if (autoPrint && ordersCount > 0) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, ordersCount]);

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-xs print:hidden mb-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                if (window.history.length > 1) window.history.back();
                else window.close();
              }
            }}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-black text-gray-900 font-mono">
              Bulk Tax Invoices / Bills ({ordersCount} Orders)
            </h1>
            <span className="text-[10px] text-gray-500 font-mono">
              GST Compliant Batch Invoicing
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print All {ordersCount} Invoices</span>
        </button>
      </div>
    </div>
  );
}
