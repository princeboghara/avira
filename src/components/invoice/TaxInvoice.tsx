"use client";

import React, { useRef } from "react";
import { Printer, X, AlertCircle } from "lucide-react";
import { numberToIndianWords, getStateGstCode } from "@/lib/numberToWords";

export interface InvoiceItem {
  productId?: string;
  name: string;
  hsnCode?: string;
  quantity: number;
  mrp: number;
  discountPrice?: number;
  pv: number;
  gst?: number;
  subtotalMrp?: number;
  subtotalPv?: number;
}

export interface TaxInvoiceProps {
  order: {
    id: string;
    invoiceNo?: number;
    createdAt?: string;
    date?: string;
    memberId?: string;
    billedBy?: string;
    buyerName?: string;
    buyerMobile?: string;
    buyerAddress?: string;
    buyerCity?: string;
    buyerState?: string;
    buyerPincode?: string;
    fullName?: string;
    customerName?: string;
    mobile?: string;
    customerMobile?: string;
    shippingAddress?: string;
    recipientState?: string;
    recipientPincode?: string;
    amount: number;
    shippingCharge?: number;
    pv: number;
    items?: InvoiceItem[];
    packageName?: string;
    status?: string;
    transactionId?: string;
    courierName?: string;
    buyerGstin?: string;
    consigneeGstin?: string;
    consigneeMemberId?: string;
  };
  onClose?: () => void;
  autoPrint?: boolean;
}

export default function TaxInvoice({ order, onClose, autoPrint }: TaxInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const isPending = order.status === "PENDING" || order.status === "PENDING_APPROVAL";

  React.useEffect(() => {
    if (autoPrint && !isPending) {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, isPending]);

  const formatOrderId = (rawId: string) => {
    return rawId || "AO-000000";
  };

  const formatDate = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const commonStates = [
    "Gujarat",
    "Haryana",
    "Maharashtra",
    "Rajasthan",
    "Delhi",
    "Uttar Pradesh",
    "Madhya Pradesh",
    "Punjab",
    "Karnataka",
    "Tamil Nadu",
    "Bihar",
    "West Bengal",
  ];

  // 1. Buyer Details
  const buyerName = order.buyerName || order.billedBy || "Radhika Panchal";
  const buyerMemberId = order.billedBy || order.memberId || "AV26324";
  const buyerPhone = order.buyerMobile || order.customerMobile || "7877232967";
  const buyerGstin = order.buyerGstin || "";
  const buyerAddressText =
    order.buyerAddress ||
    [order.buyerCity, order.buyerState, order.buyerPincode ? `Pin code ${order.buyerPincode}` : ""]
      .filter(Boolean)
      .join(", ") ||
    "District jhalawar rajsthan Pin code 326036";
  const buyerState = order.buyerState || "Rajasthan";
  const buyerStateCode = getStateGstCode(buyerState);
  let buyerPincode = order.buyerPincode || "326036";
  const buyerPinMatch = buyerAddressText.match(/\b\d{6}\b/);
  if (buyerPinMatch) buyerPincode = buyerPinMatch[0];

  // 2. Consignee Details
  const consigneeMemberId = order.consigneeMemberId || order.memberId || "";
  const consigneeName = order.customerName || order.fullName || buyerName;
  const consigneePhone = order.customerMobile || order.mobile || buyerPhone;
  const consigneeGstin = order.consigneeGstin || "";
  const consigneeAddressText =
    order.shippingAddress ||
    buyerAddressText ||
    "District jhalawar rajsthan Pin code 326036";

  let consigneeState = order.recipientState || "";
  if (!consigneeState) {
    for (const st of commonStates) {
      if (new RegExp(`\\b${st}\\b`, "i").test(consigneeAddressText)) {
        consigneeState = st;
        break;
      }
    }
  }
  if (!consigneeState) {
    consigneeState = buyerState || "Gujarat";
  }

  let consigneePincode = order.recipientPincode || buyerPincode || "326036";
  const pinMatch = consigneeAddressText.match(/\b\d{6}\b/);
  if (pinMatch) consigneePincode = pinMatch[0];

  const consigneeStateCode = getStateGstCode(consigneeState);
  const isIntraState = consigneeStateCode === "24"; // 24 is Gujarat

  // HSN Code to GST % lookup helper
  const getGstRateByHsn = (hsnCode?: string, explicitGst?: number): number => {
    if (explicitGst !== undefined && explicitGst !== null && explicitGst > 0) {
      return explicitGst;
    }
    const code = (hsnCode || "").trim().toUpperCase();
    if (code.startsWith("3401")) return 18.0; // Soaps/shampoo/detergent
    if (code.startsWith("3307")) return 18.0; // Cosmetics/body wax powder
    if (code.startsWith("3004")) return 12.0; // Medicaments/Ayurvedic formulations
    if (code.startsWith("2106")) return 18.0; // Nutraceuticals & health supplements
    if (code.startsWith("0802")) return 5.0;  // Dry fruits / agri products
    return 18.0; // Standard default GST rate
  };

  // 3. Prepare product items with exact user formulas:
  // - Rate: Selling price with GST cut (deducted): sellingPrice / (1 + gstRate/100)
  // - Amount: rate * quantity
  // - Taxable Value: exact same as amount
  // - GST%: GST % based on HSN code
  // - GST Amount: taxableValue * (gstRate / 100)
  // - Net Amount: amount + gstAmt
  const rawItems: InvoiceItem[] =
    order.items && order.items.length > 0
      ? order.items
      : [
          {
            name: order.packageName || "MILKY SHAMPOO",
            hsnCode: "3401",
            quantity: 1,
            mrp: order.amount || 499,
            discountPrice: order.amount || 499,
            pv: order.pv || 100,
            gst: 18.0,
          },
        ];

  const processedItems = rawItems.map((it) => {
    const qty = it.quantity || 1;
    const hsn = it.hsnCode || "3401";
    const gstRate = getGstRateByHsn(hsn, it.gst);

    const mrp = Number(it.mrp || 0);
    const sellingPricePerUnit = it.discountPrice !== undefined ? Number(it.discountPrice) : mrp;

    // 1. Rate: Selling price with GST portion cut/deducted
    const rate = Number((sellingPricePerUnit / (1 + gstRate / 100)).toFixed(2));

    // 2. Amount: rate * quantity
    const amount = Number((rate * qty).toFixed(2));

    // 3. Taxable Value: exact same as amount
    const taxableValue = amount;

    // 4. GST Amount: taxableValue * (gstRate / 100)
    const gstAmt = Number((taxableValue * (gstRate / 100)).toFixed(2));

    // 5. Net Amount: amount + gstAmt
    const netAmount = Number((amount + gstAmt).toFixed(2));

    const discount = Number(((mrp - sellingPricePerUnit) * qty).toFixed(2));

    return {
      name: it.name,
      hsnCode: hsn,
      quantity: qty,
      rate: rate,
      amount: amount,
      pv: (it.pv || 0) * qty,
      offerPv: 0,
      discount: discount > 0 ? discount : 0,
      offerDiscount: 0,
      taxableValue: taxableValue,
      gstRate: gstRate,
      gstAmt: gstAmt,
      netAmount: netAmount,
    };
  });

  // Aggregated Totals
  const totalQty = processedItems.reduce((acc, it) => acc + it.quantity, 0);
  const totalAmount = Number(processedItems.reduce((acc, it) => acc + it.amount, 0).toFixed(2));
  const totalPv = processedItems.reduce((acc, it) => acc + it.pv, 0);
  const totalDiscount = Number(processedItems.reduce((acc, it) => acc + it.discount, 0).toFixed(2));
  const totalTaxable = totalAmount; // Taxable value is same as amount
  const totalGst = Number(processedItems.reduce((acc, it) => acc + it.gstAmt, 0).toFixed(2));
  const totalNet = Number((totalAmount + totalGst).toFixed(2));

  // Group Tax by GST Rate for the bottom Tax Type table
  const taxGroupMap: Record<number, { taxable: number; gstAmt: number }> = {};
  processedItems.forEach((it) => {
    if (!taxGroupMap[it.gstRate]) {
      taxGroupMap[it.gstRate] = { taxable: 0, gstAmt: 0 };
    }
    taxGroupMap[it.gstRate].taxable += it.taxableValue;
    taxGroupMap[it.gstRate].gstAmt += it.gstAmt;
  });

  const taxRows = Object.entries(taxGroupMap).map(([rateStr, val]) => {
    const rate = parseFloat(rateStr);
    const rowCgst = isIntraState ? Number((val.gstAmt / 2).toFixed(2)) : 0.0;
    const rowSgst = isIntraState ? Number((val.gstAmt / 2).toFixed(2)) : 0.0;
    const rowIgst = !isIntraState ? Number(val.gstAmt.toFixed(2)) : 0.0;

    return {
      taxType: `GST ${rate.toFixed(4)}%`,
      amount: Number(val.taxable.toFixed(2)),
      cgst: rowCgst,
      sgst: rowSgst,
      igst: rowIgst,
      discount: 0.0,
      netAmt: Number((val.taxable + (isIntraState ? rowCgst + rowSgst : rowIgst)).toFixed(2)),
    };
  });

  // Split CGST, SGST, IGST totals
  const cgst = isIntraState ? Number((totalGst / 2).toFixed(2)) : 0.0;
  const sgst = isIntraState ? Number((totalGst / 2).toFixed(2)) : 0.0;
  const igst = !isIntraState ? Number(totalGst.toFixed(2)) : 0.0;

  // Shipping charges: read from order.shippingCharge, difference, or standard charge
  const orderTotal = Number(order.amount || totalNet);
  let shippingCharges = 0;
  if (order.shippingCharge !== undefined && order.shippingCharge !== null && Number(order.shippingCharge) > 0) {
    shippingCharges = Number(order.shippingCharge);
  } else if (orderTotal > totalNet) {
    shippingCharges = Number((orderTotal - totalNet).toFixed(2));
  } else {
    shippingCharges = 75.00;
  }
  const finalNetAmount = Number((totalNet + shippingCharges).toFixed(2));
  const amountInWords = numberToIndianWords(finalNetAmount);

  if (isPending) {
    return (
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-4 my-6 font-sans">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight font-sans">
          Invoice Not Generated Yet
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed font-sans">
          Order <strong>#{formatOrderId(order.id)}</strong> is currently{" "}
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
            Pending Admin Approval
          </span>
          . The official Tax Invoice will be generated automatically once your order is confirmed by Admin.
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-800 transition-all cursor-pointer font-sans"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full my-2">
      {/* Top Floating Control Bar (Hidden on Print) */}
      <div className="w-full max-w-4xl flex items-center justify-between bg-white px-6 py-3 rounded-2xl border border-gray-300 shadow-sm mb-4 print:hidden font-sans">
        <div className="font-bold text-xs text-gray-900">
          GST Tax Invoice • Inv #{order.invoiceNo || 1} • Order #{order.id}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              else if (typeof window !== "undefined") {
                if (window.history.length > 1) window.history.back();
                else window.close();
              }
            }}
            className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Official Tax Invoice Sheet (Matching User Format with Arial Rounded & Calibri Bold) */}
      <div
        ref={printRef}
        className="w-full max-w-[820px] bg-white text-black text-[11px] leading-tight border-[1.5px] border-black p-4 sm:p-6 print:border-[1.5px] print:border-black print:p-2 print:max-w-none print:w-full print:m-0"
        style={{
          fontFamily: "Calibri, 'Arial Rounded MT Bold', 'Segoe UI', Arial, sans-serif",
          color: "#000",
        }}
      >
        {/* Top Right Header Copy Marker */}
        <div className="text-right text-[10px] font-normal mb-1">
          Original/Duplicate/Triplicate
        </div>

        {/* Company Header with Colorful Logo */}
        <div className="flex items-start justify-between pb-2">
          {/* Logo (Strictly the only colorful element) */}
          <div className="w-[180px] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avira-logo.png"
              alt="Avira Lifecare"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Center Address Details */}
          <div className="flex-1 text-center px-2">
            <h1 className="text-xl font-bold tracking-wide">
              Avira Lifecare
            </h1>
            <p className="text-[10px] leading-tight mt-1">
              103, The Galleria 2 Mahavir Chowk, Near by Yogichok, Surat 395010, Gujarat
            </p>
            <p className="text-[10px] leading-tight">
              Surat
            </p>
            <p className="text-[10px] leading-tight mt-1">
              Ph.: +91 9712326273 &nbsp;&nbsp;&nbsp; Email Id: info@aviralifecare.com
            </p>
            <p className="text-[10px] leading-tight">
              State: Gujarat &nbsp;&nbsp;&nbsp; StateCode: GJ
            </p>
          </div>

          {/* Right GSTIN */}
          <div className="w-[200px] shrink-0 text-right pt-8">
            <div className="text-[11px] font-bold tracking-wide">
              GSTIN: 24ABFCA6751M1ZE
            </div>
          </div>
        </div>

        {/* TAX INVOICE Header Box */}
        <div className="border-[1.5px] border-black text-center py-0.5 my-1.5">
          <span className="font-bold text-xs uppercase tracking-wider">
            TAX INVOICE
          </span>
        </div>

        {/* Invoice Number, Order ID & Date Box */}
        <div className="border-[1.5px] border-black flex items-center justify-between px-3 py-1 text-[11px] my-1.5">
          <div className="flex items-center gap-1">
            <span className="font-bold">Inv. No. : </span>
            <span className="font-bold">{order.invoiceNo || 1}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold">Order ID : </span>
            <span className="font-bold">{order.id}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold">Date : </span>
            <span>{formatDate(order.createdAt || order.date)}</span>
          </div>
        </div>

        {/* Buyer & Consignee Box (2 Columns with border) */}
        <div className="border-[1.5px] border-black grid grid-cols-2 text-[10px] my-1.5">
          {/* Left Column: Details of Buyer (Billing To) */}
          <div className="border-r-[1.5px] border-black p-2 space-y-1">
            <div className="font-bold text-center border-b-[1.5px] border-black pb-1 mb-1 text-[11px]">
              Details Of Buyer (Billing To)
            </div>
            <div>
              <span className="font-bold">Name : </span>
              <span>{buyerName} ( ID : {buyerMemberId} )</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold shrink-0">Address:&nbsp;</span>
              <span>{buyerAddressText}</span>
            </div>
            <div>
              <span className="font-bold">Phone : </span>
              <span>{buyerPhone}</span>
            </div>
            <div className="flex flex-wrap gap-x-3 pt-0.5">
              <span><strong className="font-bold">STATE : </strong>{buyerState}</span>
              <span><strong className="font-bold">STATE-CODE : </strong>{buyerStateCode}</span>
              <span><strong className="font-bold">PINCODE : </strong>{buyerPincode}</span>
            </div>
            <div>
              <span className="font-bold">GSTIN : </span>
              <span>{buyerGstin || "URP (Unregistered)"}</span>
            </div>
          </div>

          {/* Right Column: Details of Consignee (Shipped To) */}
          <div className="p-2 space-y-1">
            <div className="font-bold text-center border-b-[1.5px] border-black pb-1 mb-1 text-[11px]">
              Details Of Consignee (Shipped To)
            </div>
            <div>
              <span className="font-bold">Name : </span>
              <span>{consigneeName} {consigneeMemberId ? `( ID : ${consigneeMemberId} )` : ""}</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold shrink-0">Address:&nbsp;</span>
              <span>{consigneeAddressText}</span>
            </div>
            <div>
              <span className="font-bold">Phone : </span>
              <span>{consigneePhone}</span>
            </div>
            <div className="flex flex-wrap gap-x-3 pt-0.5">
              <span><strong className="font-bold">STATE : </strong>{consigneeState}</span>
              <span><strong className="font-bold">STATE-CODE : </strong>{consigneeStateCode}</span>
              <span><strong className="font-bold">PINCODE : </strong>{consigneePincode}</span>
            </div>
            <div>
              <span className="font-bold">GSTIN : </span>
              <span>{consigneeGstin || "URP (Unregistered)"}</span>
            </div>
          </div>
        </div>

        {/* Transport By Box */}
        <div className="border-[1.5px] border-black px-2 py-0.5 text-[10px] my-1.5">
          <span className="font-bold">Transport By: </span>
          <span>{order.courierName || ""}</span>
        </div>

        {/* 14-Column Product Items Table */}
        <div className="my-1.5">
          <table className="w-full border-collapse border-[1.5px] border-black text-[9px] text-center">
            <thead>
              <tr className="border-b-[1.5px] border-black font-bold">
                <th className="border-r border-black p-1 w-6">Sr.</th>
                <th className="border-r border-black p-1 text-left">Product</th>
                <th className="border-r border-black p-1 w-16">HSN Code</th>
                <th className="border-r border-black p-1 w-8">Qty.</th>
                <th className="border-r border-black p-1 w-12">Rate</th>
                <th className="border-r border-black p-1 w-14">Amount</th>
                <th className="border-r border-black p-1 w-10">PV</th>
                <th className="border-r border-black p-1 w-12">Offer PV</th>
                <th className="border-r border-black p-1 w-12">Discount</th>
                <th className="border-r border-black p-1 w-16">Offer Discount</th>
                <th className="border-r border-black p-1 w-16">Taxable Value</th>
                <th className="border-r border-black p-1 w-10">GST%</th>
                <th className="border-r border-black p-1 w-14">GST Amt.</th>
                <th className="p-1 w-16">Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {processedItems.map((item, idx) => (
                <tr key={idx} className="border-b border-black">
                  <td className="border-r border-black p-1">{idx + 1}</td>
                  <td className="border-r border-black p-1 text-left font-bold">{item.name}</td>
                  <td className="border-r border-black p-1">{item.hsnCode}</td>
                  <td className="border-r border-black p-1">{item.quantity}</td>
                  <td className="border-r border-black p-1">{item.rate.toFixed(2)}</td>
                  <td className="border-r border-black p-1">{item.amount.toFixed(2)}</td>
                  <td className="border-r border-black p-1">{item.pv}</td>
                  <td className="border-r border-black p-1">0</td>
                  <td className="border-r border-black p-1">{item.discount.toFixed(2)}</td>
                  <td className="border-r border-black p-1">0.00</td>
                  <td className="border-r border-black p-1">{item.taxableValue.toFixed(2)}</td>
                  <td className="border-r border-black p-1">{item.gstRate.toFixed(2)}</td>
                  <td className="border-r border-black p-1">{item.gstAmt.toFixed(2)}</td>
                  <td className="p-1 font-bold">{item.netAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-[1.5px] border-black font-bold">
                <td className="border-r border-black p-1 text-left" colSpan={4}>Total</td>
                <td className="border-r border-black p-1">{totalQty}</td>
                <td className="border-r border-black p-1 text-right">{totalAmount.toFixed(2)}</td>
                <td className="border-r border-black p-1">{totalPv}</td>
                <td className="border-r border-black p-1">0</td>
                <td className="border-r border-black p-1 text-right">{totalDiscount.toFixed(2)}</td>
                <td className="border-r border-black p-1">0.00</td>
                <td className="border-r border-black p-1 text-right">{totalTaxable.toFixed(2)}</td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1 text-right">{totalGst.toFixed(2)}</td>
                <td className="p-1 text-right">{totalNet.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bottom Section: Tax Type Table, Rs In Words, Bank Details, Financial Summary */}
        <div className="grid grid-cols-12 gap-1 my-1.5">
          {/* Left Column (col-span-7): Tax Type Table, Words, Bank, Terms */}
          <div className="col-span-7 space-y-1">
            {/* 1. Tax Type Table */}
            <div>
              <table className="w-full border-collapse border-[1.5px] border-black text-[9px] text-center">
                <thead>
                  <tr className="border-b border-black font-bold">
                    <th className="border-r border-black p-0.5">Tax Type</th>
                    <th className="border-r border-black p-0.5">Amount</th>
                    <th className="border-r border-black p-0.5">CGST</th>
                    <th className="border-r border-black p-0.5">SGST</th>
                    <th className="border-r border-black p-0.5">IGST</th>
                    <th className="border-r border-black p-0.5">Discount</th>
                    <th className="p-0.5">Net Amt.</th>
                  </tr>
                </thead>
                <tbody>
                  {taxRows.map((tr, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border-r border-black p-0.5">{tr.taxType}</td>
                      <td className="border-r border-black p-0.5 text-right">{tr.amount.toFixed(2)}</td>
                      <td className="border-r border-black p-0.5 text-right">{tr.cgst.toFixed(2)}</td>
                      <td className="border-r border-black p-0.5 text-right">{tr.sgst.toFixed(2)}</td>
                      <td className="border-r border-black p-0.5 text-right">{tr.igst.toFixed(2)}</td>
                      <td className="border-r border-black p-0.5 text-right">{tr.discount.toFixed(2)}</td>
                      <td className="p-0.5 text-right">{tr.netAmt.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-[1.5px] border-black">
                    <td className="border-r border-black p-0.5 text-left">Total</td>
                    <td className="border-r border-black p-0.5 text-right">{totalTaxable.toFixed(2)}</td>
                    <td className="border-r border-black p-0.5 text-right">{cgst.toFixed(2)}</td>
                    <td className="border-r border-black p-0.5 text-right">{sgst.toFixed(2)}</td>
                    <td className="border-r border-black p-0.5 text-right">{igst.toFixed(2)}</td>
                    <td className="border-r border-black p-0.5 text-right">0.00</td>
                    <td className="p-0.5 text-right">{totalNet.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. Rs. In Word Box */}
            <div className="border-[1.5px] border-black flex text-[10px]">
              <div className="p-1 font-bold border-r-[1.5px] border-black w-24 shrink-0">
                Rs. In Word
              </div>
              <div className="p-1 font-bold">
                {amountInWords}
              </div>
            </div>

            {/* 3. Our Bank Detail Box */}
            <div className="border-[1.5px] border-black p-1.5 text-[9px] leading-tight space-y-0.5">
              <div className="font-bold underline">Our Bank Detail</div>
              <div>BANK NAME: INDUSLND BANK</div>
              <div>A/C NO: 259998826273</div>
              <div>IFSC: INDB0001409</div>
            </div>

            {/* 4. Terms & Condition Box */}
            <div className="border-[1.5px] border-black p-1.5 text-[9px] leading-tight space-y-0.5">
              <div className="font-bold underline">Terms & Condition</div>
              <div>30 days return policy.</div>
              <div className="font-bold pt-1">Subject To SURAT Jurisdiction.</div>
            </div>
          </div>

          {/* Right Column (col-span-5): Financial Summary & Signatory */}
          <div className="col-span-5 flex flex-col justify-between">
            {/* Financial Summary Table */}
            <div className="border-[1.5px] border-black">
              <table className="w-full border-collapse text-[10px]">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="p-1 font-bold">Amount</td>
                    <td className="p-1 text-right font-bold border-l border-black">
                      {totalTaxable.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1">Discount</td>
                    <td className="p-1 text-right border-l border-black">
                      {totalDiscount.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1">CGST</td>
                    <td className="p-1 text-right border-l border-black">{cgst.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1">SGST</td>
                    <td className="p-1 text-right border-l border-black">{sgst.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1">IGST</td>
                    <td className="p-1 text-right border-l border-black">{igst.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1">Scheme/offer</td>
                    <td className="p-1 text-right border-l border-black">0.00</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1">Shipping Charges</td>
                    <td className="p-1 text-right border-l border-black">
                      {shippingCharges.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1">Freight</td>
                    <td className="p-1 text-right border-l border-black">0.00</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1">Others</td>
                    <td className="p-1 text-right border-l border-black">0.00</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1">Round Off</td>
                    <td className="p-1 text-right border-l border-black">0.00</td>
                  </tr>
                  <tr className="font-bold bg-gray-200">
                    <td className="p-1.5 font-bold">Net Amount</td>
                    <td className="p-1.5 text-right font-bold border-l border-black text-xs">
                      {finalNetAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Authorised Signatory Area */}
            <div className="pt-8 pb-2 text-right pr-2">
              <div className="font-bold text-[10px]">Avira Lifecare</div>
              <div className="h-10"></div>
              <div className="text-[9px] font-bold">Authorised Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
