"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What makes Avira's cold bio-extraction process unique?",
    answer:
      "Unlike conventional extraction that uses high thermal processing, Avira utilizes cold bio-extraction. This preserves sensitive bioactive enzymes, natural antioxidant polyphenols, and delicate essential volatile oils for optimal cellular bioavailability.",
  },
  {
    question: "Are all formulations 100% vegetarian, non-GMO, and chemical-free?",
    answer:
      "Yes, completely. Every formulation is 100% vegetarian, free from synthetic parabens, artificial dyes, mineral oils, phthalates, and genetically modified crops. All capsules use plant-sourced cellulose veggie shells.",
  },
  {
    question: "How should I consume Wild Himalayan Sea Buckthorn Juice?",
    answer:
      "Dilute 20ml to 30ml of Sea Buckthorn juice in a glass of lukewarm or room-temperature water. Drink once or twice daily, preferably on an empty stomach in the morning for optimal gut and vitality benefits.",
  },
  {
    question: "How long does standard delivery take across India?",
    answer:
      "We dispatch all orders within 24 hours via express courier partners. Metros receive delivery in 2-3 business days, while other regions are delivered within 4-5 business days with full real-time tracking.",
  },
  {
    question: "Are Avira products certified by regulatory authorities?",
    answer:
      "Yes. Our products are formulated in ISO 9001:2015 and GMP certified sterile facilities under the supervision of qualified Ayurvedic vaidyas and biochemists, strictly adhering to Ministry of AYUSH and FSSAI standards.",
  },
];

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="glass-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[#006d36] font-bold text-xs mb-3 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Formulation FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#0f172a] mb-4 tracking-tight">
            Frequently Inquired
          </h2>
          <p className="text-sm sm:text-base text-[#64748b] max-w-xl font-medium text-balance">
            Answers to your queries regarding botanical sourcing, extraction purity, dosages, and certified standards.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`glass-card rounded-[28px] transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-emerald-500/40 shadow-md"
                    : "hover:border-gray-300"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-heading font-extrabold text-[#0f172a] text-sm sm:text-base focus:outline-none cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#006d36] shrink-0" />
                    <span>{faq.question}</span>
                  </div>
                  <div
                    className={`neo-btn-icon p-2 rounded-xl shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#006d36]" : "text-[#94a3b8]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#64748b] leading-relaxed border-t border-gray-100 bg-white/40 animate-fadeIn font-medium">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
