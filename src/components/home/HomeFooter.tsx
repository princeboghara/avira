"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function HomeFooter() {
  return (
    <footer id="contact" className="w-full bg-[#1b3b32] text-[#e8e4dc] pt-14 pb-10 border-t border-[#234e40] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2d5c4e]">
          
          {/* Column 1: Company Profile */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/avira-logo.png"
                alt="Avira Life Care"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
              <div>
                <span className="font-bold text-base text-white tracking-tight block">
                  AVIRA LIFE CARE
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300 block">
                  Global Private Limited
                </span>
              </div>
            </Link>

            <p className="text-xs text-stone-300 leading-relaxed pr-6">
              Avira Life Care Global is an authentic Indian botanical life sciences organization committed to pure Ayurvedic formulations, ethical Himalayan wild sourcing, and sterile GMP cleanroom manufacturing.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-emerald-200 text-[10.5px] font-bold border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5" />
                ISO 9001:2015 & GMP Certified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-amber-200 text-[10.5px] font-bold border border-white/15">
                AYUSH & FSSAI Approved
              </span>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Product Categories
            </h4>
            <ul className="space-y-2 text-stone-300 font-medium">
              <li>
                <Link href="/products?category=juices" className="hover:text-white transition-colors">
                  Himalayan Wild Juices
                </Link>
              </li>
              <li>
                <Link href="/products?category=wellness" className="hover:text-white transition-colors">
                  Shilajit & Stamina
                </Link>
              </li>
              <li>
                <Link href="/products?category=haircare" className="hover:text-white transition-colors">
                  Hair & Scalp Therapy
                </Link>
              </li>
              <li>
                <Link href="/products?category=skincare" className="hover:text-white transition-colors">
                  Ayurvedic Skincare
                </Link>
              </li>
              <li>
                <Link href="/products?category=agriculture" className="hover:text-white transition-colors">
                  Organic Plant Nutrition
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Direct Selling */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Policies & Governance
            </h4>
            <ul className="space-y-2 text-stone-300 font-medium">
              <li>
                <Link href="/policies/refund" className="hover:text-white transition-colors">
                  30-Day Buyback & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-white transition-colors">
                  Direct Seller Agreement & Terms
                </Link>
              </li>
              <li>
                <Link href="/policies/grievance" className="hover:text-white transition-colors">
                  Grievance & Nodal Officer
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Associate / Member Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  New Associate Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Registered Office
            </h4>
            <ul className="space-y-2.5 text-stone-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  103, The Galleria Business Hub 2, Mahavir Chowk, Surat, Gujarat - 395006
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="tel:+919712326273" className="font-semibold text-white hover:text-emerald-300">
                  +91 97123 26273
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="mailto:info@aviralifecare.com" className="font-semibold text-white hover:text-emerald-300">
                  info@aviralifecare.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-stone-400 text-[11px]">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Mon - Sat: 9:30 AM - 6:30 PM IST</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-stone-400 text-[11px]">
          <p>© {new Date().getFullYear()} Avira Life Care Global Private Limited. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/policies/refund" className="hover:text-white">Buyback & Refund</Link>
            <Link href="/policies/terms" className="hover:text-white">Terms of Business</Link>
            <Link href="/policies/grievance" className="hover:text-white">Grievance Redressal</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
