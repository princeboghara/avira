"use client";

import React from "react";
import Link from "next/link";
import { Diamond } from "lucide-react";

export default function HomeFooter() {
  return (
    <footer className="w-full py-8 bg-white border-t border-gray-200 relative z-20 text-xs text-[#5f5e5e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Diamond className="w-4 h-4 text-[#006d36]" />
          <span>© 2026 Avira Life Care Global Private Limited. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 font-semibold">
          <Link href="/login" className="hover:text-[#006d36]">Member Login</Link>
          <Link href="/register" className="hover:text-[#006d36]">Register</Link>
          <Link href="/admin/login" className="hover:text-[#006d36]">Central Admin</Link>
        </div>
      </div>
    </footer>
  );
}
