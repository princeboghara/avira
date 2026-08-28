"use client";

import React from "react";
import Link from "next/link";

export default function HomeCTA() {
  return (
    <section className="py-20 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden bg-gradient-to-r from-[#006d36] via-[#005a2c] to-[#4f378a] text-white shadow-2xl shadow-[#006d36]/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Transform Your Future?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
              Join thousands of visionary leaders who are already leveraging Avira Life Care to build massive, sustainable financial organizations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href="/register"
                className="px-10 py-4 rounded-full bg-white text-[#006d36] font-bold text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Join Avira Now
              </Link>
              <Link
                href="/login"
                className="px-10 py-4 rounded-full bg-black/20 backdrop-blur-md border border-white/30 text-white font-bold text-xs uppercase tracking-widest hover:bg-black/30 active:scale-95 transition-all duration-300"
              >
                Member Portal Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
