import React from "react";
import HomeNavbar from "@/components/home/HomeNavbar";
import HomeHero from "@/components/home/HomeHero";
import HomeFeatures from "@/components/home/HomeFeatures";
import HomeProducts from "@/components/home/HomeProducts";
import HomeAdvantage from "@/components/home/HomeAdvantage";
import HomeCTA from "@/components/home/HomeCTA";
import HomeFooter from "@/components/home/HomeFooter";

export const metadata = {
  title: "Avira Life Care Global — Next-Gen 3D MLM & Wellness Platform",
  description:
    "Experience the pinnacle of high-end wellness and entrepreneurial success. 1:1 instant binary matching compensation, repurchase rewards, and precision-engineered organic products.",
};

export default function HomePage() {
  return (
    <div className="bg-[#fdf7ff] text-[#1d1b20] font-sans antialiased selection:bg-[#50c878] selection:text-[#005025] min-h-screen flex flex-col overflow-x-hidden">
      {/* 1. Glassmorphic Navigation */}
      <HomeNavbar />

      {/* 2. Main Sections */}
      <main className="flex-1 pt-18">
        <HomeHero />
        <HomeFeatures />
        <HomeProducts />
        <HomeAdvantage />
        <HomeCTA />
      </main>

      {/* 3. Footer */}
      <HomeFooter />
    </div>
  );
}
