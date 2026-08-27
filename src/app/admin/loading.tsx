import React from "react";
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-[#006d36] animate-fadeIn">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 shadow-sm">
        <Loader2 className="w-6 h-6 animate-spin text-[#006d36]" />
      </div>
      <span className="text-xs font-bold text-[#1a1c1c] tracking-wider uppercase">
        Loading Admin Operations...
      </span>
    </div>
  );
}
