import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import HomeNavbar from "@/components/home/HomeNavbar";
import HomeFooter from "@/components/home/HomeFooter";

export default function TermsPolicyPage() {
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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Direct Seller Agreement & Terms of Business
              </h1>
              <p className="text-xs text-slate-500">
                Code of Conduct & Ethics under Direct Selling Guidelines
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-6 text-sm text-slate-700 leading-relaxed">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">1. Direct Seller Authorization</h2>
              <p className="text-slate-600">
                An individual becomes an authorized independent Direct Seller of Avira Life Care Global Private Limited upon free registration and verification of valid KYC documents (PAN card, Aadhaar card, and Bank account details).
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">2. Code of Ethics & Misrepresentation Prohibition</h2>
              <p className="text-slate-600">
                Direct Sellers shall not make false or exaggerated claims regarding product efficacy or earnings potential. All representations must strictly align with official company literature and certifications.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">3. Statutory Deductions & Payouts</h2>
              <p className="text-slate-600">
                All commissions and incentives are disbursed subject to a standard 2% TDS deduction under Section 194H of the Income Tax Act, 1961, and administrative maintenance fees as specified in official company schedules.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">4. Jurisdiction</h2>
              <p className="text-slate-600">
                Any legal disputes or proceedings arising out of this agreement shall be subject to the exclusive jurisdiction of the competent courts in Surat, Gujarat, India.
              </p>
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
