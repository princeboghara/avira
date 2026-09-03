import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Outfit } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import AviraPageLoader from "@/components/common/AviraPageLoader";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Avira Life Care Global — Clinical Ayurvedic Science & Executive Wellness",
  description:
    "Explore certified organic botanical formulations, wild Himalayan cold-extracted juices, and therapeutic herbal remedies crafted for executive vitality and peak human performance.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakarta.variable} ${inter.variable} h-full antialiased font-sans`}
    >
      <body
        className="min-h-full flex flex-col bio-canvas-bg text-[#0f172a] selection:bg-[#006d36] selection:text-white"
      >
        {/* Animated Brand Preloader on Page Load / Reload */}
        <AviraPageLoader />

        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
