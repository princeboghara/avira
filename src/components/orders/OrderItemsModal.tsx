"use client";

import React from "react";
import { X, Package, ShoppingBag, Hash, Tag, Layers } from "lucide-react";

export interface OrderItemDetail {
  id?: string;
  productId?: string;
  name?: string;
  productName?: string;
  title?: string;
  hsnCode?: string;
  quantity?: number;
  qty?: number;
  mrp?: number;
  price?: number;
  discountPrice?: number;
  pv?: number;
  gst?: number;
  gstRate?: number;
  category?: string;
}

export interface OrderItemsModalProps {
  order: {
    id: string;
    invoiceNo?: number;
    packageName?: string;
    buyerName?: string;
    customerName?: string;
    fullName?: string;
    memberId?: string;
    billedBy?: string;
    customerMobile?: string;
    mobile?: string;
    amount?: number;
    pv?: number;
    status?: string;
    items?: OrderItemDetail[] | string;
  } | null;
  onClose: () => void;
}

export default function OrderItemsModal({ order, onClose }: OrderItemsModalProps) {
  if (!order) return null;

  let parsedItems: OrderItemDetail[] = [];
  if (Array.isArray(order.items)) {
    parsedItems = order.items;
  } else if (typeof order.items === "string") {
    try {
      parsedItems = JSON.parse(order.items);
    } catch {
      parsedItems = [];
    }
  }

  const customerName = order.customerName || order.buyerName || order.fullName || "Customer";
  const memberId = order.memberId || order.billedBy || "";
  const totalUnits = parsedItems.reduce((sum, it) => sum + (Number(it.quantity || it.qty || 1)), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#006d36] flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-900">
                  Order Items Breakdown
                </h3>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-[#006d36] border border-emerald-200">
                  #{order.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {customerName} {memberId && `(ID: ${memberId})`} • {order.packageName || "Product Package"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Products Table */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {parsedItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No individual items registered for this package.</p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 inline-block text-xs font-bold text-slate-700">
                Package: {order.packageName || "Custom Purchase"} (₹{order.amount?.toLocaleString("en-IN")})
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5">#</th>
                    <th className="py-3 px-3.5">Product Name</th>
                    <th className="py-3 px-3.5 text-center">HSN Code</th>
                    <th className="py-3 px-3.5 text-center">Quantity</th>
                    <th className="py-3 px-3.5 text-right">Price (₹)</th>
                    <th className="py-3 px-3.5 text-center">PV</th>
                    <th className="py-3 px-3.5 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {parsedItems.map((item, idx) => {
                    const name = item.name || item.productName || item.title || `Item ${idx + 1}`;
                    const qty = Number(item.quantity || item.qty || 1);
                    const price = Number(item.discountPrice || item.mrp || item.price || 0);
                    const itemTotal = price * qty;
                    const itemPv = Number(item.pv || 0) * qty;
                    const hsn = item.hsnCode || "—";

                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3.5 font-mono text-slate-400 text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-slate-900 block">
                            {name}
                          </span>
                          {item.gst !== undefined && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              GST: {item.gst}%
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono text-slate-600">
                          {hsn !== "—" ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold">
                              {hsn}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span className="inline-flex items-center justify-center font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006d36] border border-emerald-200">
                            {qty}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-800">
                          ₹{price.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {itemPv} PV
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-black text-slate-900">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-4 text-slate-600">
              <span>
                Total Products: <strong className="text-slate-900">{parsedItems.length}</strong>
              </span>
              <span>
                Total Units: <strong className="text-slate-900">{totalUnits}</strong>
              </span>
              {order.pv !== undefined && (
                <span>
                  Total PV: <strong className="text-purple-700">{order.pv} PV</strong>
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-slate-500 mr-2 text-[11px] font-sans font-bold uppercase">Grand Total:</span>
              <span className="font-black text-base text-[#006d36]">
                ₹{Number(order.amount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
