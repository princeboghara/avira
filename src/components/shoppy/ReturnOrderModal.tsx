"use client";

import React, { useState } from "react";
import { RotateCcw, X, Loader2, AlertCircle } from "lucide-react";
import { Order } from "@/types";

interface ReturnOrderModalProps {
  order: Order | null;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

const COMMON_REASONS = [
  "Customer Refused Delivery",
  "Customer Not Reachable / Unreachable",
  "Incorrect / Incomplete Delivery Address",
  "Damaged Goods / Packaging Issue",
  "Customer Cancelled Order",
  "Return Requested by Customer",
  "Other Reason",
];

export default function ReturnOrderModal({
  order,
  onClose,
  onSuccess,
}: ReturnOrderModalProps) {
  const [selectedPreset, setSelectedPreset] = useState(COMMON_REASONS[0]);
  const [customNote, setCustomNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason =
      selectedPreset === "Other Reason"
        ? customNote.trim() || "Returned by Customer / Hub"
        : customNote.trim()
        ? `${selectedPreset} - ${customNote.trim()}`
        : selectedPreset;

    setSubmitting(true);
    try {
      const res = await fetch("/api/shoppy/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: [order.id],
          status: "RETURNED",
          returnReason: finalReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`📦 Order #${order.id} has been marked as RETURNED!`);
        onSuccess(order.id);
        onClose();
      } else {
        alert(data.message || "Failed to mark order as returned.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="shoppy-surface-lg rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 border border-white/80 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                Mark Order as Returned
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Order #{order.id} • {order.buyerName || order.customerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shoppy-btn p-2 rounded-xl text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Order info banner */}
          <div className="shoppy-inset rounded-2xl p-3 flex items-center justify-between font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block">Total Value:</span>
              <span className="font-black text-slate-900">
                ₹{Number(order.amount || 0).toLocaleString("en-IN")} ({order.pv} PV)
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Current Status:</span>
              <span className="font-bold text-indigo-700 uppercase">
                {order.status}
              </span>
            </div>
          </div>

          {/* Reason selection */}
          <div className="space-y-1.5">
            <label className="font-black font-mono text-slate-700 uppercase tracking-wider block">
              Select Return Reason:
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="w-full p-2.5 rounded-2xl shoppy-inset text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-xs"
            >
              {COMMON_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Additional note */}
          <div className="space-y-1.5">
            <label className="font-black font-mono text-slate-700 uppercase tracking-wider block">
              Additional Details / Comments (Optional):
            </label>
            <textarea
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Courier boy visited twice, buyer refused to accept parcel..."
              className="w-full p-2.5 rounded-2xl shoppy-inset text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-xs resize-none"
            />
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Marking as Returned will remove this order from active dispatch/delivery and move it to Returned & RTO logs.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="shoppy-btn px-4 py-2.5 rounded-2xl font-bold text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              <span>Confirm Return</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
