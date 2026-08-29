"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Mail, ShieldCheck } from "lucide-react";

export default function HomeCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-20 relative z-20 overflow-hidden bg-[#f0fdf4]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden bg-gradient-to-r from-[#065f46] via-[#059669] to-[#047857] text-white shadow-2xl shadow-emerald-900/15 border border-emerald-400/30">
          
          {/* Subtle Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-bold uppercase tracking-wider border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Avira Executive Wellness Concierge</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Elevate Your Daily Physical & Mental Vitality
            </h2>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed text-balance">
              Join thousands of conscious executives and health enthusiasts across India. Subscribe to receive private formulation releases and 10% off your initial order.
            </p>

            {/* Newsletter form */}
            {submitted ? (
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>Welcome to the Avira Concierge! Check your inbox for your 10% welcome privilege code.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-2"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-emerald-100/70 text-xs focus:outline-none focus:bg-white/25 focus:border-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-[#059669] font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 whitespace-nowrap"
                >
                  Join Concierge
                </button>
              </form>
            )}

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-100/80 pt-4 border-t border-white/10 mt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                100% Privacy Protected
              </span>
              <span>•</span>
              <span>Zero Promotional Spam</span>
              <span>•</span>
              <span>Express Delivery Nationwide</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
