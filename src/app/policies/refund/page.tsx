import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import HomeNavbar from "@/components/home/HomeNavbar";
import HomeFooter from "@/components/home/HomeFooter";

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen flex flex-col font-sans">
      <HomeNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0b3d2e] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0b3d2e] flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                30-Day Buyback & Product Refund Policy
              </h1>
              <p className="text-xs text-slate-500">
                Consumer Protection (Direct Selling) Rules, 2021 Compliant
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-6 text-sm text-slate-700 leading-relaxed">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">1. 30-Day Cooling-Off Period</h2>
              <p className="text-slate-600">
                In compliance with the Direct Selling Guidelines and Consumer Protection Rules, Avira Life Care Global Private Limited provides a mandatory <strong>30-day cooling-off period</strong> starting from the date of product delivery or associate enrollment. Within this period, customers and direct sellers may return unopened and merchantable products for a 100% refund.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">2. Buyback Policy for Direct Sellers</h2>
              <p className="text-slate-600">
                Direct Sellers wishing to cancel their participation or return unsold inventory in marketable condition within 30 days are entitled to a full buyback refund minus actual return shipping costs.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">3. Damaged or Defective Products</h2>
              <p className="text-slate-600">
                If you receive a product damaged in transit, with broken tamper seals or quality defects, notify us within 48 hours of delivery at <strong>info@aviralifecare.com</strong> or call <strong>+91 97123 26273</strong>. An instant doorstep replacement or full refund will be initiated.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">4. Refund Settlement Timeline</h2>
              <p className="text-slate-600">
                Approved refunds are credited directly to the original bank account or source payment method within 5 to 7 business days following inspection of returned goods at our logistics hub.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs text-[#0b3d2e]">
              <strong>Return Logistics Address:</strong><br />
              Avira Life Care Global Private Limited<br />
              103, The Galleria Business Hub 2, Mahavir Chowk, Surat, Gujarat - 395006<br />
              Customer Desk: +91 97123 26273 | Email: info@aviralifecare.com
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
