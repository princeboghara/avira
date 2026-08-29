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
    <section id="faq" className="py-24 bg-white relative z-20 border-t border-slate-200 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs mb-3 shadow-xs uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-[#0b3d2e]" />
            <span>Formulation FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Frequently Inquired
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl text-balance">
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
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-slate-50 border-emerald-300 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0b3d2e] shrink-0" />
                    <span>{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#0b3d2e]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white/60">
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
