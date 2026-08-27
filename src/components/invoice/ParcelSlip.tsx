"use client";

import React, { useEffect } from "react";
import { Printer, ArrowLeft, PackageCheck } from "lucide-react";

export interface ParcelSlipProps {
  order: {
    id: string;
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
  };
  autoPrint?: boolean;
  onBack?: () => void;
}

export default function ParcelSlip({ order, autoPrint, onBack }: ParcelSlipProps) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const formatOrderId = (rawId: string) => {
    if (!rawId) return "AV-526";
    if (rawId.startsWith("AV-ORD-")) {
      const parts = rawId.split("-");
      return parts.length >= 3 ? parts.slice(2).join("-") : rawId;
    }
    return rawId.length > 8 ? rawId.slice(-8).toUpperCase() : rawId;
  };

  const formatDate = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Consignee details ONLY (Recipient / Shipped To)
  const consigneeName = (order.customerName || order.fullName || "Consignee").toUpperCase();
  const consigneeMemberId = order.memberId || order.billedBy || "";
  const consigneeMobile = order.customerMobile || order.mobile || "";
  const shippingAddress = order.shippingAddress || "103, The Galleria 2 Mahavir Chowk, Near Yogichok, Surat, Gujarat";

  // Extract Pincode and State if present
  let detectedPincode = order.recipientPincode || "";
  const pinMatch = shippingAddress.match(/\b\d{6}\b/);
  if (pinMatch && !detectedPincode) {
    detectedPincode = pinMatch[0];
  }

  return (
    <div className="flex flex-col items-center w-full my-4 print:my-0">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="w-full max-w-xl flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm mb-4 print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-black text-xs text-gray-900">PARCEL DISPATCH SLIP</div>
            <div className="text-[10px] text-gray-500 font-mono">Order #{formatOrderId(order.id)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
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

      {/* Parcel Slip Canvas (Standard 4x6 inch / Label format) */}
      <div
        id="parcel-slip-box"
        className="w-full max-w-xl bg-white text-black font-sans border-2 border-black p-0 shadow-lg print:shadow-none print:border-2 print:border-black print:max-w-none print:w-[100mm] print:mx-auto"
        style={{ color: "#000" }}
      >
        {/* 1. Header: INDIA POST PARCEL */}
        <div className="border-b-2 border-black py-2.5 px-4 text-center">
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#006d36] uppercase font-sans">
            INDIA POST PARCEL
          </h1>
        </div>

        {/* 2. Manual Barcode Sticker Area (Reserved Empty Space as requested) */}
        <div className="border-b-2 border-black p-4 flex flex-col items-center justify-center bg-gray-50/50">
          <div className="w-full h-24 sm:h-28 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-center p-2 bg-white">
            <span className="text-[11px] font-black text-gray-400 tracking-wider uppercase font-mono">
              [ AFFIX INDIA POST / COURIER BARCODE HERE ]
            </span>
            <span className="text-[9px] text-gray-400 mt-1">
              Manual Barcode / Tracking Number Sticker Space
            </span>
          </div>
          <div className="text-center font-mono font-black text-xs sm:text-sm tracking-widest mt-2 text-black">
            * CG{formatOrderId(order.id).replace(/[^a-zA-Z0-9]/g, "").slice(-9).padStart(9, "0")}IN *
          </div>
        </div>

        {/* 3. Middle Section: PREPAID & DELIVER TO */}
        <div className="grid grid-cols-12 border-b-2 border-black divide-x-2 divide-black text-xs">
          {/* Left Column (Prepaid & Sell By) - Span 4 */}
          <div className="col-span-4 p-3 flex flex-col justify-between space-y-3 bg-white">
            <div>
              <div className="text-base font-black text-[#006d36] uppercase tracking-wide">
                PREPAID
              </div>
              <div className="mt-2.5">
                <span className="font-bold text-[11px] block text-gray-800">Date :</span>
                <span className="font-mono text-xs font-black">{formatDate(order.createdAt || order.date)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="font-bold text-[10px] uppercase text-gray-700 leading-tight">
                FROM (SELL BY)
              </div>
              <div className="font-black text-[11px] text-black mt-0.5 leading-tight">
                Avira Lifecare Global Private Limited
              </div>
              <div className="font-mono text-[11px] text-gray-900 mt-0.5">Ph: 9712326273</div>
            </div>
          </div>

          {/* Right Column (Deliver to Consignee) - Span 8 */}
          <div className="col-span-8 p-3 space-y-2 bg-white">
            <div className="font-black text-xs uppercase tracking-wider text-black">
              DELIVER TO :
            </div>

            {/* Consignee Name */}
            <div className="text-sm sm:text-base font-black text-black leading-snug">
              {consigneeName}
            </div>

            {/* Member ID added per user instruction */}
            {consigneeMemberId && (
              <div className="inline-block bg-gray-100 text-black px-2 py-0.5 rounded border border-gray-300 text-[10px] font-mono font-black">
                MEMBER ID : {consigneeMemberId}
              </div>
            )}

            {/* Consignee Address */}
            <div className="text-xs leading-relaxed text-gray-900 whitespace-pre-line font-medium pt-1">
              {shippingAddress}
            </div>

            {/* Prominent Mobile Number */}
            {consigneeMobile && (
              <div className="pt-2 font-black text-xs sm:text-sm text-black font-mono">
                Mob: {consigneeMobile}
              </div>
            )}
          </div>
        </div>

        {/* 4. Bottom Return Address Section */}
        <div className="p-3 text-[10px] leading-relaxed bg-white">
          <div className="font-bold text-gray-700 uppercase tracking-tight">
            If undelivered, return to:
          </div>
          <div className="font-black text-xs text-black mt-0.5">
            Avira Lifecare
          </div>
          <div className="text-gray-900 leading-tight mt-0.5">
            103, The Galleria 2 Mahavir Chowk, Near by Yogichok, Surat 395010, Gujarat
          </div>
          <div className="font-bold text-black mt-0.5">
            Surat, Gujarat - 395010
          </div>
        </div>
      </div>
    </div>
  );
}
