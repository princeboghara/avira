"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Leaf, ChevronRight } from "lucide-react";

export default function HomeProducts() {
  return (
    <section id="products" className="py-20 bg-[#f9f9f9] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#006d36] font-bold text-xs mb-3">
            <Leaf className="w-3.5 h-3.5" />
            <span>Certified Pure Organic Formulation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1d1b20] mb-3">
            Our Elite Wellness Collection
          </h2>
          <p className="text-sm sm:text-base text-[#5f5e5e] max-w-xl text-balance">
            Clinical precision meets organic purity. High-demand lifestyle products designed for sustainable repeat network volume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Product 1 */}
          <div className="bg-white rounded-3xl p-6 flex flex-col items-center group cursor-pointer border border-gray-200/70 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300">
            <div className="w-full h-64 bg-gray-50 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center p-4">
              <Image
                className="w-4/5 h-4/5 object-contain transition-transform group-hover:scale-108 duration-500"
                alt="Core Supplement"
                width={320}
                height={260}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlOsMH1-t5hFxaAZMQ2wfp6Vi35EKtHq4uMJCoxEgD_CPgf8brKzSGx0R8YXyx8gemPcS_7hqo-Ke3XgPc1YT8jRmWJNqIVCchzb0bPImhUrdZXlpWX_4WcbTxa8F5dGcPCFsfwUCi7DTbwIt-KYIEQetGTNNY-FRCcuzFem3eFe-FZE8k3lM9CwF2GuFU66ev2KJzSb0NBScMNMp7R2DNELL0R8xj7dl7sgkaoHipXKytf1spx1XcUQ"
              />
            </div>
            <h3 className="text-lg font-extrabold text-[#1d1b20] text-center mb-1">
              Core Supplement
            </h3>
            <p className="text-xs text-[#5f5e5e] text-center mb-4 leading-relaxed">
              Foundational cellular nutrition & immunity with bio-active botanicals.
            </p>
            <div className="mt-auto w-full pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#006d36]">100 PV Package</span>
              <Link
                href="/register"
                className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
              >
                <span>Enroll Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Product 2 */}
          <div className="bg-white rounded-3xl p-6 flex flex-col items-center group cursor-pointer border border-gray-200/70 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300">
            <div className="w-full h-64 bg-gray-50 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center p-4">
              <Image
                className="w-4/5 h-4/5 object-contain transition-transform group-hover:scale-108 duration-500"
                alt="Botanical Serum"
                width={320}
                height={260}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVL71o-ntv0XiIT1UwKraxg1lZYOJDrTgCe8U_qObCbE90UZ7MHpF6SkLt4Ga5evvzHYMWx8tjHx6KUZ0ZeBkIIfY9NSwGuZluQkZc9lgKIke7fIlklH5TF2N0NN8_SuGHUIxpqvzqpueBOhoF6rLstwDYFBYXhIEJrD-YJXJGj2TdZK74r0ns_o90AimG0qYUd5QCmh9zXgi8nq0mCOO7p0RHZiL0Rsd1svAQJb7OAmVHK0ImOQCiFQ"
              />
            </div>
            <h3 className="text-lg font-extrabold text-[#1d1b20] text-center mb-1">
              Botanical Serum
            </h3>
            <p className="text-xs text-[#5f5e5e] text-center mb-4 leading-relaxed">
              Advanced skin vitality, barrier rejuvenation, and anti-aging compounds.
            </p>
            <div className="mt-auto w-full pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#006d36]">100 PV Package</span>
              <Link
                href="/register"
                className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
              >
                <span>Enroll Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Product 3 */}
          <div className="bg-white rounded-3xl p-6 flex flex-col items-center group cursor-pointer border border-gray-200/70 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300">
            <div className="w-full h-64 bg-gray-50 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center p-4">
              <Image
                className="w-4/5 h-4/5 object-contain transition-transform group-hover:scale-108 duration-500"
                alt="Aura Diffuser"
                width={320}
                height={260}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYXrrXWPcivvqZZXEmKGhdOfXRgWDZeOLl9dyBQJaAYedxb1qm0B6-yHHUZUlNCA_PYTppiqGySpn6KPt3nQyokqXGGp7yUmSC1mDRCAsxhYxiAl63LI1W2SM6t3F-KBsxHvYRza8-Lc9i6jsof-RvM_kic1eFM4b0gID6yfgVYlKtdF7TX8YQ0sCl6OrhCwMpel4VufAeWNBRA59FKxm3qnIeDEwYsWscLO-Twujn14tRrfRq46Xguw"
              />
            </div>
            <h3 className="text-lg font-extrabold text-[#1d1b20] text-center mb-1">
              Aura Diffuser
            </h3>
            <p className="text-xs text-[#5f5e5e] text-center mb-4 leading-relaxed">
              Ultrasonic atmospheric harmonization and essential oil aromatherapy.
            </p>
            <div className="mt-auto w-full pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#006d36]">100 PV Package</span>
              <Link
                href="/register"
                className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
              >
                <span>Enroll Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
