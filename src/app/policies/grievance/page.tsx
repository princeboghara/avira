import React from "react";
import Link from "next/link";
import { ArrowLeft, UserCheck, Phone, Mail, MapPin } from "lucide-react";
import HomeNavbar from "@/components/home/HomeNavbar";
import HomeFooter from "@/components/home/HomeFooter";

export default function GrievancePolicyPage() {
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
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Grievance Redressal Mechanism & Nodal Officer
              </h1>
              <p className="text-xs text-slate-500">
                Rule 5(6) of Consumer Protection (Direct Selling) Rules, 2021
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-6 text-sm text-slate-700 leading-relaxed">
            <p className="text-slate-600">
              Avira Life Care Global Private Limited has established a robust Grievance Redressal Mechanism to address any queries, consumer disputes, order delays, or service concerns within strict statutory turnaround times.
            </p>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="font-bold text-base text-slate-900">Designated Grievance & Nodal Officer:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 block">Officer Name:</span>
                  <span className="font-bold text-slate-900">Grievance Redressal Cell</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Direct Helpline:</span>
                  <span className="font-bold text-[#0b3d2e]">+91 97123 26273</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Email Address:</span>
                  <span className="font-bold text-[#0b3d2e]">info@aviralifecare.com</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Office Hours:</span>
                  <span className="font-bold text-slate-900">Mon - Sat: 9:30 AM to 6:30 PM IST</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs">
                <span className="font-semibold text-slate-500 block">Physical Corporate Address:</span>
                <span className="font-medium text-slate-900">
                  103, The Galleria Business Hub 2, Mahavir Chowk, Surat, Gujarat - 395006
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">Resolution Timeframe</h2>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Acknowledgement of grievance ticket within <strong>48 hours</strong>.</li>
                <li>Comprehensive redressal and written resolution within <strong>30 days</strong> of receipt.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
