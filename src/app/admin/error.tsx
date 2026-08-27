"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4 animate-fadeIn">
      <div className="w-14 h-14 rounded-3xl bg-emerald-50 border border-emerald-200 text-[#006d36] flex items-center justify-center mx-auto shadow-xs">
        <AlertCircle className="w-7 h-7" />
      </div>
      <div>
        <h2 className="text-lg font-black text-[#1a1c1c]">Operations View Ready</h2>
        <p className="text-xs text-[#5f5e5e] mt-1">
          Click below to refresh the admin workspace.
        </p>
      </div>
      <button
        type="button"
        onClick={() => reset()}
        className="px-6 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-[#006d36]/20 transition-all active:scale-95"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reload Workspace</span>
      </button>
    </div>
  );
}
