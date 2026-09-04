"use client";

import React, { useEffect } from "react";
import { Printer, ArrowLeft, PackageCheck } from "lucide-react";

export interface ParcelSlipProps {
  order: {
    id: string;
    invoiceNo?: number;
    createdAt?: string;
    date?: string;
    memberId?: string;
    billedBy?: string;
    fullName?: string;
    customerName?: string;
    mobile?: string;
    customerMobile?: string;
    shippingAddress?: string;
    recipientState?: string;
    recipientPincode?: string;
    amount?: number;
    pv?: number;
    status?: string;
    courierName?: string;
    trackingNumber?: string;
  };
  autoPrint?: boolean;
  onBack?: () => void;
}

export default function ParcelSlip({ order, autoPrint, onBack }: ParcelSlipProps) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const formatDate = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Consignee details (Recipient / Shipped To)
  const consigneeName = (order.customerName || order.fullName || "Consignee").toUpperCase();
  const consigneeMemberId = order.memberId || order.billedBy || "";
  const consigneeMobile = order.customerMobile || order.mobile || "";
  const shippingAddress =
    order.shippingAddress ||
    "103, The Galleria 2 Mahavir Chowk, Near Yogichok, Surat, Gujarat - 395010";

  let detectedPincode = order.recipientPincode || "";
  const pinMatch = shippingAddress.match(/\b\d{6}\b/);
  if (pinMatch && !detectedPincode) {
    detectedPincode = pinMatch[0];
  }

  const detectedState = order.recipientState || "Gujarat";

  return (
    <div className="flex flex-col items-center w-full my-4 print:my-0 print:p-0">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          html,
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .slip-outer-frame {
            margin: 0 auto !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden on Print) */}
      <div className="no-print w-full max-w-xl flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-xs mb-4 font-sans">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-black text-xs text-gray-900 leading-none">
              Parcel Dispatch Slip
            </div>
            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
              Order: #{order.id}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Slip</span>
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Outer Border Frame (Farte Andar Border System) */}
      <div
        id="parcel-slip-box"
        className="slip-outer-frame w-full max-w-xl bg-white text-black font-sans border-[3px] border-black p-1.5 sm:p-2 shadow-lg print:shadow-none box-border"
        style={{ color: "#000" }}
      >
        {/* Inner Border Box */}
        <div className="border-[2px] border-black flex flex-col divide-y-[2px] divide-black bg-white">
          {/* 1. Header Bar: PREPAID | INDIA POST PARCEL | DATE */}
          <div className="px-3 py-2 flex items-center justify-between bg-white">
            <span className="font-black text-xs tracking-wider text-[#006d36] uppercase font-sans">
              PREPAID
            </span>
            <h1 className="font-black text-sm sm:text-base tracking-widest uppercase text-black font-sans text-center">
              INDIA POST PARCEL
            </h1>
            <span className="font-mono text-xs font-bold text-gray-900">
              {formatDate(order.createdAt || order.date)}
            </span>
          </div>

          {/* 2. Order ID & Barcode / Tracking Space (No Invoice No, No CG45281UTSVIN) */}
          <div className="px-3 py-2.5 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs uppercase text-gray-700">Order ID :</span>
                <span className="font-mono font-black text-sm sm:text-base text-black tracking-wide">
                  {order.id}
                </span>
              </div>
              {order.courierName && (
                <span className="text-xs font-bold text-gray-700 font-mono">
                  {order.courierName}
                </span>
              )}
            </div>

            {/* Tracking Barcode Area */}
            <div className="w-full h-20 sm:h-24 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center bg-gray-50/50 text-center px-2">
              <span className="text-[11px] font-mono font-black text-gray-500 uppercase tracking-wider">
                [ AFFIX INDIA POST / COURIER TRACKING BARCODE HERE ]
              </span>
              <span className="text-[9px] text-gray-400 mt-1">
                Manual Barcode &amp; Tracking Number Sticker Area
              </span>
              {order.trackingNumber && (
                <span className="text-xs font-mono font-bold text-black mt-1 bg-white px-2 py-0.5 rounded border border-gray-300">
                  {order.trackingNumber}
                </span>
              )}
            </div>
          </div>

          {/* 3. Middle Section: DELIVER TO (Consignee) */}
          <div className="p-3.5 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-700">
                DELIVER TO (CONSIGNEE) :
              </span>
              {consigneeMemberId && (
                <span className="font-mono text-black font-black text-xs px-2 py-0.5 bg-gray-100 rounded border border-gray-300">
                  MEMBER ID : {consigneeMemberId}
                </span>
              )}
            </div>

            {/* Consignee Name */}
            <div className="text-base sm:text-lg font-black text-black leading-tight uppercase">
              {consigneeName}
            </div>

            {/* Consignee Address */}
            <div className="text-xs sm:text-sm leading-relaxed text-gray-900 font-medium whitespace-pre-line pt-0.5">
              {shippingAddress}
            </div>

            {/* PIN & Mobile */}
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-200">
              <div className="text-xs font-bold text-gray-900 font-mono">
                {detectedPincode && <span>PINCODE : <strong className="text-black">{detectedPincode}</strong></span>}
                {detectedState && <span className="ml-3">STATE : <strong className="text-black">{detectedState}</strong></span>}
              </div>

              {consigneeMobile && (
                <div className="font-mono font-black text-sm sm:text-base text-black">
                  MOB: {consigneeMobile}
                </div>
              )}
            </div>
          </div>

          {/* 4. Bottom Section: Return / Sender Address */}
          <div className="p-3 bg-gray-50/40 text-[10px] sm:text-[11px] leading-snug space-y-0.5">
            <div className="font-bold text-gray-700 uppercase text-[9px] tracking-wide">
              If undelivered, return to:
            </div>
            <div className="font-black text-xs text-black">
              Avira Lifecare Global Private Limited
            </div>
            <div className="text-gray-900">
              103, The Galleria 2 Mahavir Chowk, Near Yogichok, Surat 395010, Gujarat
            </div>
            <div className="font-mono font-bold text-black flex items-center justify-between pt-0.5">
              <span>Customer Helpline: +91 9712326273</span>
              <span>Surat, Gujarat - 395010</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
