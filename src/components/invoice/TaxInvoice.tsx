"use client";

import React, { useRef } from "react";
import { Printer, X, AlertCircle, Building2, ShieldCheck } from "lucide-react";
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
    pv: number;
    items?: InvoiceItem[];
    packageName?: string;
    status?: string;
    transactionId?: string;
  };
  onClose?: () => void;
}

export default function TaxInvoice({ order, onClose }: TaxInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const isPending = order.status === "PENDING" || order.status === "PENDING_APPROVAL";

  const formatOrderId = (rawId: string) => {
    if (!rawId) return "AV-526";
    if (rawId.startsWith("AV-ORD-")) {
      const parts = rawId.split("-");
      return parts.length >= 3 ? parts.slice(2).join("-") : rawId;
    }
    return rawId.length > 8 ? rawId.slice(-6).toUpperCase() : rawId;
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

  // 1. Buyer Details (Billing Associate who billed the order)
  const buyerName = order.buyerName || order.billedBy || "Avira Associate";
  const buyerMemberId = order.billedBy || order.memberId || "AV00001";
  const buyerPhone = order.buyerMobile || "9712326273";
  const buyerAddressText =
    order.buyerAddress ||
    [order.buyerCity, order.buyerState, order.buyerPincode ? `PIN: ${order.buyerPincode}` : ""]
      .filter(Boolean)
      .join(", ") ||
    "103, The Galleria 2 Mahavir Chowk, Near Yogichok, Surat 395010, Gujarat";
  const buyerState = order.buyerState || "Gujarat";
  const buyerStateCode = getStateGstCode(buyerState);
  let buyerPincode = order.buyerPincode || "395010";
  const buyerPinMatch = buyerAddressText.match(/\b\d{6}\b/);
  if (buyerPinMatch) buyerPincode = buyerPinMatch[0];

  // 2. Consignee Details (Recipient associate / customer who receives the shipment)
  const consigneeName = order.customerName || order.fullName || "Valued Associate";
  const consigneeMemberId = order.memberId || order.billedBy || "AV00001";
  const consigneePhone = order.customerMobile || order.mobile || "—";
  const consigneeAddressText =
    order.shippingAddress ||
    buyerAddressText ||
    "103, Near Yogichok, Surat, Gujarat - 395010";

  let consigneeState = order.recipientState || "Gujarat";
  let consigneePincode = order.recipientPincode || "395010";
  const pinMatch = consigneeAddressText.match(/\b\d{6}\b/);
  if (pinMatch) consigneePincode = pinMatch[0];

  for (const st of commonStates) {
    if (new RegExp(`\\b${st}\\b`, "i").test(consigneeAddressText)) {
      consigneeState = st;
      break;
    }
  }

  const consigneeStateCode = getStateGstCode(consigneeState);
  const isIntraState = consigneeStateCode === "24"; // Gujarat is 24

  // Prepare product items with GST, Taxable, and Discount calculations
  const rawItems: InvoiceItem[] =
    order.items && order.items.length > 0
      ? order.items
      : [
          {
            name: order.packageName || "AVIRA DE ADDICTION",
            hsnCode: "30045090",
            quantity: 1,
            mrp: order.amount,
            discountPrice: order.amount,
            pv: order.pv,
            gst: 5.0,
          },
        ];

  // Process rows mathematically matching the sample Tax Invoice
  const processedItems = rawItems.map((it) => {
    const qty = it.quantity || 1;
    const gstRate = it.gst !== undefined ? it.gst : 5.0;
    const hsn = it.hsnCode || "30045090";

    const mrp = Number(it.mrp || 0);
    const dp = it.discountPrice !== undefined ? Number(it.discountPrice) : mrp;

    const rate = mrp;
    const amount = mrp * qty;
    let discount = (mrp - dp) * qty;
    if (discount < 0) discount = 0;

    let taxableValue = amount - discount;
    if (taxableValue <= 0) taxableValue = amount;

    const gstAmt = parseFloat(((taxableValue * gstRate) / 100).toFixed(2));
    const netAmount = parseFloat((taxableValue + gstAmt).toFixed(2));

    return {
      name: it.name,
      hsnCode: hsn,
      quantity: qty,
      rate: parseFloat(rate.toFixed(2)),
      amount: parseFloat(amount.toFixed(2)),
      pv: it.pv * qty,
      offerPv: 0,
      discount: parseFloat(discount.toFixed(2)),
      offerDiscount: 0,
      taxableValue: parseFloat(taxableValue.toFixed(2)),
      gstRate: parseFloat(gstRate.toFixed(2)),
      gstAmt: gstAmt,
      netAmount: netAmount,
    };
  });

  // Aggregated Totals
  const totalQty = processedItems.reduce((acc, it) => acc + it.quantity, 0);
  const totalAmount = processedItems.reduce((acc, it) => acc + it.amount, 0);
  const totalPv = processedItems.reduce((acc, it) => acc + it.pv, 0);
  const totalDiscount = processedItems.reduce((acc, it) => acc + it.discount, 0);
  const totalTaxable = processedItems.reduce((acc, it) => acc + it.taxableValue, 0);
  const totalGst = processedItems.reduce((acc, it) => acc + it.gstAmt, 0);
  const totalNet = processedItems.reduce((acc, it) => acc + it.netAmount, 0);

  // Split CGST, SGST, IGST
  const cgst = isIntraState ? parseFloat((totalGst / 2).toFixed(2)) : 0.0;
  const sgst = isIntraState ? parseFloat((totalGst / 2).toFixed(2)) : 0.0;
  const igst = !isIntraState ? parseFloat(totalGst.toFixed(2)) : 0.0;

  const amountInWords = numberToIndianWords(totalNet);

  // If order is PENDING, invoice cannot be generated
  if (isPending) {
    return (
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-4 my-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          Invoice Not Generated Yet
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed">
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
            className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-800 transition-all cursor-pointer"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full my-2">
      {/* Top Action Bar (Hidden during print) */}
      <div className="w-full max-w-5xl flex items-center justify-between bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm mb-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-xs text-gray-900 uppercase tracking-wider">
              GST Tax Invoice • #{formatOrderId(order.id)}
            </div>
            <div className="text-[10px] text-gray-500 font-medium">
              Avira Lifecare Global Private Limited
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#006d36] to-[#005025] hover:brightness-110 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Printable Modern Tax Invoice Canvas (A4 Standard Format) */}
      <div
        ref={printRef}
        id="invoice-document"
        className="w-full max-w-5xl bg-white text-gray-900 font-sans text-[11px] leading-tight border border-slate-300 p-6 sm:p-8 rounded-xl shadow-xl print:shadow-none print:border-black print:p-3 print:max-w-none print:w-full print:m-0 print:rounded-none"
        style={{ color: "#000" }}
      >
        {/* Top Header: Copy Marker */}
        <div className="flex items-center justify-between pb-1 text-[10px] text-gray-500 font-medium border-b border-gray-200 mb-3">
          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-800 font-bold">
            GST Compliant Tax Invoice
          </span>
          <span className="font-mono tracking-widest text-[9px] font-bold text-gray-600 uppercase">
            Original / Duplicate / Triplicate
          </span>
        </div>

        {/* Company Header Block */}
        <div className="flex items-center justify-between gap-4 pb-4 mb-3 border-b-2 border-slate-800">
          {/* Official Logo */}
          <div className="w-44 shrink-0 flex items-center justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avira-logo.png"
              alt="Avira Lifecare"
              className="h-20 w-auto object-contain drop-shadow-xs"
            />
          </div>

          {/* Center Address Details */}
          <div className="flex-1 text-center px-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#006d36] uppercase font-sans">
              Avira Lifecare Global Private Limited
            </h1>
            <p className="text-[10px] leading-relaxed text-gray-700 mt-1 font-medium">
              103, The Galleria 2 Mahavir Chowk, Near by Yogichok, Surat 395010, Gujarat
              <br />
              Surat • Ph.: <strong className="text-black">+91 9712326273</strong> • Email: <strong className="text-black">info@aviralifecare.com</strong>
              <br />
              <span className="font-semibold text-gray-800">State:</span> Gujarat &nbsp;|&nbsp; <span className="font-semibold text-gray-800">StateCode:</span> GJ
            </p>
          </div>

          {/* Right GSTIN Box */}
          <div className="w-48 shrink-0 text-right">
            <div className="inline-block bg-emerald-50/80 border border-emerald-300 rounded-lg p-2 text-right">
              <div className="text-[9px] uppercase tracking-wider font-bold text-emerald-800">
                Goods & Services Tax
              </div>
              <div className="text-xs font-mono font-black text-gray-900 tracking-wider">
                GSTIN: 24ABFCA6751M1ZE
              </div>
            </div>
          </div>
        </div>

        {/* Banner: TAX INVOICE & Meta Row */}
        <div className="grid grid-cols-12 items-center bg-slate-900 text-white rounded-lg px-3 py-1.5 mb-3 print:bg-gray-200 print:text-black">
          <div className="col-span-4 text-left font-mono text-[11px] font-bold">
            Inv. No. : <span className="text-emerald-300 print:text-black font-black">{formatOrderId(order.id)}</span>
          </div>
          <div className="col-span-4 text-center font-black text-xs sm:text-sm tracking-widest uppercase">
            TAX INVOICE
          </div>
          <div className="col-span-4 text-right font-mono text-[11px] font-bold">
            Date : <span className="text-emerald-300 print:text-black font-black">{formatDate(order.createdAt || order.date)}</span>
          </div>
        </div>

        {/* Two Modern Side-By-Side Boxes: Buyer (Billing To) & Consignee (Shipped To) */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-[10px]">
          {/* Left Box: Buyer (Billing To) */}
          <div className="border border-slate-300 rounded-lg overflow-hidden flex flex-col justify-between bg-white print:border-black">
            <div className="bg-slate-100 border-b border-slate-300 px-3 py-1 font-bold text-[10px] uppercase text-slate-800 flex items-center justify-between print:bg-gray-100 print:border-black">
              <span>Details Of Buyer (Billing To)</span>
              <span className="font-mono text-[9px] text-gray-500">ID: {buyerMemberId}</span>
            </div>
            <div className="p-3 space-y-1.5 flex-1">
              <div className="flex">
                <span className="font-bold text-gray-600 w-16 shrink-0">Name :</span>
                <span className="font-bold text-black text-[11px]">{buyerName}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-gray-600 w-16 shrink-0">Address:</span>
                <span className="text-gray-800 leading-snug">{buyerAddressText}</span>
              </div>
              <div className="flex">
                <span className="font-bold text-gray-600 w-16 shrink-0">Phone :</span>
                <span className="font-mono font-bold text-gray-900">{buyerPhone}</span>
              </div>
              <div className="pt-1.5 border-t border-dashed border-gray-200 flex flex-wrap gap-x-4 gap-y-1">
                <div><span className="font-bold text-gray-600">STATE :</span> {buyerState}</div>
                <div><span className="font-bold text-gray-600">STATE-CODE :</span> {buyerStateCode}</div>
                <div><span className="font-bold text-gray-600">PINCODE :</span> {buyerPincode}</div>
              </div>
              <div><span className="font-bold text-gray-600">GSTIN :</span> <span className="font-mono text-gray-500">—</span></div>
            </div>
          </div>

          {/* Right Box: Consignee (Shipped To) */}
          <div className="border border-slate-300 rounded-lg overflow-hidden flex flex-col justify-between bg-white print:border-black">
            <div className="bg-emerald-50/80 border-b border-emerald-200 px-3 py-1 font-bold text-[10px] uppercase text-[#006d36] flex items-center justify-between print:bg-gray-100 print:border-black print:text-black">
              <span>Details Of Consignee (Shipped To)</span>
              {consigneeMemberId && <span className="font-mono text-[9px] text-[#006d36]">ID: {consigneeMemberId}</span>}
            </div>
            <div className="p-3 space-y-1.5 flex-1">
              <div className="flex">
                <span className="font-bold text-gray-600 w-16 shrink-0">Name :</span>
                <span className="font-bold text-black text-[11px]">{consigneeName}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-gray-600 w-16 shrink-0">Address:</span>
                <span className="text-gray-800 leading-snug">{consigneeAddressText}</span>
              </div>
              <div className="flex">
                <span className="font-bold text-gray-600 w-16 shrink-0">Phone :</span>
                <span className="font-mono font-bold text-gray-900">{consigneePhone}</span>
              </div>
              <div className="pt-1.5 border-t border-dashed border-gray-200 flex flex-wrap gap-x-4 gap-y-1">
                <div><span className="font-bold text-gray-600">STATE :</span> {consigneeState}</div>
                <div><span className="font-bold text-gray-600">STATE-CODE :</span> {consigneeStateCode}</div>
                <div><span className="font-bold text-gray-600">PINCODE :</span> {consigneePincode}</div>
              </div>
              <div><span className="font-bold text-gray-600">GSTIN :</span> <span className="font-mono text-gray-500">—</span></div>
            </div>
          </div>
        </div>

        {/* Transport By Line */}
        <div className="text-[10px] font-bold mb-2 px-1 flex items-center gap-2 text-gray-700">
          <span className="text-gray-500 uppercase tracking-wide text-[9px]">Transport Mode:</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-medium text-black">
            By Road / Courier Delivery
          </span>
        </div>

        {/* 14-Column Product Items Table */}
        <div className="border border-slate-300 rounded-lg overflow-hidden mb-3 print:border-black">
          <table className="w-full text-left text-[9px] border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-center font-bold text-slate-800 print:bg-gray-200 print:border-black">
                <th className="border-r border-slate-300 p-1.5 w-6 print:border-black">Sr.</th>
                <th className="border-r border-slate-300 p-1.5 text-left min-w-[120px] print:border-black">Product</th>
                <th className="border-r border-slate-300 p-1.5 print:border-black">HSN Code</th>
                <th className="border-r border-slate-300 p-1.5 print:border-black">Qty.</th>
                <th className="border-r border-slate-300 p-1.5 print:border-black">Rate</th>
                <th className="border-r border-slate-300 p-1.5 print:border-black">Amount</th>
                <th className="border-r border-slate-300 p-1.5 print:border-black">PV</th>
                <th className="border-r border-slate-300 p-1.5 print:border-black">Offer PV</th>
                <th className="border-r border-slate-300 p-1.5 print:border-black">Discount</th>
                <th className="border-r border-slate-300 p-1.5 print:border-black">Offer Discount</th>
                <th className="border-r border-slate-300 p-1.5 print:border-black">Taxable Value</th>
                <th className="border-r border-slate-300 p-1.5 print:border-black">GST%</th>
                <th className="border-r border-slate-300 p-1.5 print:border-black">GST Amt.</th>
                <th className="p-1.5">Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {processedItems.map((item, index) => (
                <tr key={index} className="border-b border-slate-200 text-center font-mono hover:bg-slate-50/50 print:border-gray-400">
                  <td className="border-r border-slate-300 p-1.5 text-gray-500 font-sans print:border-black">{index + 1}</td>
                  <td className="border-r border-slate-300 p-1.5 text-left font-sans font-bold text-gray-900 print:border-black">
                    {item.name}
                  </td>
                  <td className="border-r border-slate-300 p-1.5 text-gray-700 print:border-black">{item.hsnCode}</td>
                  <td className="border-r border-slate-300 p-1.5 font-bold text-gray-900 print:border-black">{item.quantity}</td>
                  <td className="border-r border-slate-300 p-1.5 print:border-black">
                    {item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border-r border-slate-300 p-1.5 font-bold print:border-black">
                    {item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border-r border-slate-300 p-1.5 text-emerald-700 font-bold print:border-black print:text-black">{item.pv}</td>
                  <td className="border-r border-slate-300 p-1.5 text-gray-500 print:border-black">{item.offerPv}</td>
                  <td className="border-r border-slate-300 p-1.5 text-gray-600 print:border-black">
                    {item.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border-r border-slate-300 p-1.5 text-gray-500 print:border-black">0.00</td>
                  <td className="border-r border-slate-300 p-1.5 font-bold print:border-black">
                    {item.taxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border-r border-slate-300 p-1.5 text-gray-700 print:border-black">{item.gstRate.toFixed(2)}%</td>
                  <td className="border-r border-slate-300 p-1.5 font-bold text-gray-800 print:border-black">
                    {item.gstAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 font-black text-gray-900">
                    {item.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-slate-100/90 font-bold font-mono text-center border-t-2 border-slate-400 print:bg-gray-200 print:border-black">
                <td className="border-r border-slate-300 p-1.5 print:border-black" colSpan={3}>
                  <span className="font-sans font-black uppercase text-gray-900 tracking-wider">Total</span>
                </td>
                <td className="border-r border-slate-300 p-1.5 font-black text-gray-900 print:border-black">{totalQty}</td>
                <td className="border-r border-slate-300 p-1.5 text-gray-400 print:border-black">—</td>
                <td className="border-r border-slate-300 p-1.5 font-black text-gray-900 print:border-black">
                  {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="border-r border-slate-300 p-1.5 font-black text-emerald-800 print:border-black print:text-black">{totalPv}</td>
                <td className="border-r border-slate-300 p-1.5 text-gray-400 print:border-black">0</td>
                <td className="border-r border-slate-300 p-1.5 font-bold print:border-black">
                  {totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="border-r border-slate-300 p-1.5 text-gray-400 print:border-black">0.00</td>
                <td className="border-r border-slate-300 p-1.5 font-black text-gray-900 print:border-black">
                  {totalTaxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="border-r border-slate-300 p-1.5 text-gray-400 print:border-black">—</td>
                <td className="border-r border-slate-300 p-1.5 font-black text-gray-900 print:border-black">
                  {totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1.5 font-black text-gray-900 text-[10px]">
                  {totalNet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Section: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-2">
          {/* Left Column (Tax Table, Bank Details, Terms) - Span 7 */}
          <div className="md:col-span-7 space-y-2">
            {/* Tax Breakdown Table */}
            <div className="border border-slate-300 rounded-lg overflow-hidden print:border-black">
              <table className="w-full text-center text-[9px] border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-sans font-bold text-slate-800 print:bg-gray-200 print:border-black">
                    <th className="border-r border-slate-300 p-1 print:border-black">Tax Type</th>
                    <th className="border-r border-slate-300 p-1 print:border-black">Amount</th>
                    <th className="border-r border-slate-300 p-1 print:border-black">CGST</th>
                    <th className="border-r border-slate-300 p-1 print:border-black">SGST</th>
                    <th className="border-r border-slate-300 p-1 print:border-black">IGST</th>
                    <th className="border-r border-slate-300 p-1 print:border-black">Discount</th>
                    <th className="p-1">Net Amt.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-r border-slate-300 p-1 font-sans font-bold text-gray-800 print:border-black">GST 5.0000%</td>
                    <td className="border-r border-slate-300 p-1 print:border-black">
                      {totalTaxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border-r border-slate-300 p-1 print:border-black">
                      {cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border-r border-slate-300 p-1 print:border-black">
                      {sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border-r border-slate-300 p-1 print:border-black">
                      {igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border-r border-slate-300 p-1 print:border-black">
                      {totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-1 font-black text-gray-900">
                      {totalNet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rs. In Words Box */}
            <div className="border border-slate-300 rounded-lg p-2 text-[10px] bg-slate-50/50 print:border-black print:bg-white">
              <span className="font-bold text-slate-800">Rs. In Word:</span> &nbsp;
              <span className="italic font-bold text-gray-900">{amountInWords}</span>
            </div>

            {/* Bank Details Card */}
            <div className="border border-slate-300 rounded-lg p-2.5 text-[10px] space-y-1 bg-white print:border-black">
              <div className="font-black text-emerald-800 border-b border-slate-200 pb-1 uppercase tracking-wide flex items-center justify-between print:text-black">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 print:hidden" />
                  <span>Our Bank Detail</span>
                </span>
                <span className="font-mono text-[9px] text-gray-500 font-normal">Direct RTGS / NEFT</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase">Bank Name</div>
                  <div className="font-mono font-bold text-gray-900">INDUSLND BANK</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase">Account Number</div>
                  <div className="font-mono font-bold text-gray-900">259998826273</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase">IFSC Code</div>
                  <div className="font-mono font-bold text-gray-900">INDB0001409</div>
                </div>
              </div>
            </div>

            {/* Terms & Jurisdiction */}
            <div className="border border-slate-300 rounded-lg p-2 text-[9px] space-y-0.5 bg-slate-50/40 text-gray-700 print:border-black print:bg-white">
              <div className="font-bold text-slate-900 uppercase text-[9px]">
                Terms & Conditions:
              </div>
              <p className="leading-snug">
                1. Goods once sold will not be taken back or exchanged.
                <br />
                2. All disputes are subject to SURAT Jurisdiction.
              </p>
              <div className="font-bold text-slate-800 pt-0.5">
                Subject To SURAT Jurisdiction.
              </div>
            </div>
          </div>

          {/* Right Column (Financial Summary & Signatory) - Span 5 */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-3">
            {/* Financial Summary Table */}
            <div className="border border-slate-300 rounded-lg overflow-hidden font-mono text-[10px] bg-white print:border-black">
              <div className="flex justify-between border-b border-slate-200 px-3 py-1.5 bg-slate-50 print:bg-white">
                <span className="font-sans font-bold text-gray-700">Gross Amount</span>
                <span className="font-bold text-gray-900">
                  {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 px-3 py-1 text-gray-700">
                <span className="font-sans">Discount</span>
                <span>{totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 px-3 py-1 text-gray-700">
                <span className="font-sans">CGST</span>
                <span>{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 px-3 py-1 text-gray-700">
                <span className="font-sans">SGST</span>
                <span>{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 px-3 py-1 text-gray-700">
                <span className="font-sans">IGST</span>
                <span>{igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 px-3 py-0.5 text-gray-400 text-[9px]">
                <span className="font-sans">Scheme / Offer</span>
                <span>0.00</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 px-3 py-0.5 text-gray-400 text-[9px]">
                <span className="font-sans">Freight Charges</span>
                <span>0.00</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 px-3 py-0.5 text-gray-400 text-[9px]">
                <span className="font-sans">Others</span>
                <span>0.00</span>
              </div>
              <div className="flex justify-between border-b border-slate-300 px-3 py-0.5 text-gray-400 text-[9px] print:border-black">
                <span className="font-sans">Round Off</span>
                <span>0.00</span>
              </div>
              <div className="flex justify-between bg-slate-900 text-white px-3 py-2 font-bold text-xs print:bg-gray-200 print:text-black">
                <span className="font-sans tracking-wide">Net Payable</span>
                <span className="font-black text-sm text-emerald-300 print:text-black">
                  ₹{totalNet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Authorised Signatory Box */}
            <div className="border border-dashed border-slate-300 rounded-lg p-3 text-right bg-slate-50/50 print:border-black print:bg-white">
              <div className="font-black text-[11px] text-gray-900 uppercase">
                For Avira Lifecare
              </div>
              <div className="h-10 sm:h-12 flex items-center justify-end">
                {/* Signature visual placeholder */}
                <span className="text-[10px] text-gray-400 italic">Digitally Verified</span>
              </div>
              <div className="border-t border-slate-400 pt-1 text-[10px] font-bold text-gray-800 inline-block min-w-[140px] text-center">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
