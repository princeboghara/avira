import React from "react";
import HomeNavbar from "@/components/home/HomeNavbar";
import HomeHero from "@/components/home/HomeHero";
import HomeTrustBar from "@/components/home/HomeTrustBar";
import HomeCategories from "@/components/home/HomeCategories";
import TopSellingProducts from "@/components/home/TopSellingProducts";
import HomeStory from "@/components/home/HomeStory";
import HomeReviews from "@/components/home/HomeReviews";
import HomeFAQ from "@/components/home/HomeFAQ";
import HomeFooter from "@/components/home/HomeFooter";

export const metadata = {
  title: "Avira Life Care — Authentic Ayurvedic Formulations & Himalayan Wellness",
  description:
    "Explore pure wild-harvested Himalayan Sea Buckthorn juice, purified Shilajit Rasayana, herbal hair care, and certified organic Ayurvedic wellness.",
};

export default function HomePage() {
  return (
    <div className="bg-white text-[#1c1917] font-sans antialiased selection:bg-[#1b3b32] selection:text-white min-h-screen flex flex-col overflow-x-hidden">
      
      {/* 1. Official Header & Announcement */}
      <HomeNavbar />

      {/* 2. Main High-Converting E-Commerce Flow */}
      <main className="flex-1">
        {/* Authentic D2C Hero Banner Slider */}
        <HomeHero />

        {/* Real Trust Metrics Ribbon (FSSAI, 100% Wild, 30-Day Guarantee) */}
        <HomeTrustBar />

        {/* Shop by Ayurvedic Category */}
        <HomeCategories />

        {/* Best Selling Formulations (Real D2C Product Cards + Modal) */}
        <TopSellingProducts />

        {/* Sourcing Heritage & Farm Story ("From Himalayas to Your Home") */}
        <HomeStory />

        {/* Real Verified Customer & Doctor Testimonials */}
        <HomeReviews />

        {/* Customer FAQ */}
        <HomeFAQ />
      </main>

      {/* 3. Official Corporate Footer (Surat Office & Legal Policies) */}
      <HomeFooter />
    </div>
  );
}
