import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Avira Life Care Global — Enterprise Associate & MLM Portal",
  description:
    "An enterprise-grade direct selling, network wellness commerce, and 1:1 binary compensation platform engineered for Avira Life Care Global.",
  icons: {
    icon: "/favicon.ico",
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
      className={`${montserrat.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && !window.__avira_banner_shown) {
                window.__avira_banner_shown = true;
                console.log(
                  '%c🌿 AVIRA LIFE CARE GLOBAL %c| Enterprise Associate & Commerce Platform\\n%c[Status: Production Ready | Security: 256-Bit SSL | Engine: Binary 1:1 Matching]\\n%c⚠️ Security Notice: This browser console is an advanced developer interface. Do NOT paste any unknown scripts or tokens here.',
                  'color: #006d36; font-size: 16px; font-weight: 900; font-family: system-ui, sans-serif;',
                  'color: #5f5e5e; font-size: 12px; font-weight: 600;',
                  'color: #50c878; font-size: 11px; font-family: monospace; font-weight: bold;',
                  'color: #b91c1c; font-size: 11px; font-weight: bold; background-color: #fef2f2; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-top: 4px;'
                );
              }
            `,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-[#f9f9f9] text-[#1a1c1c] selection:bg-[#50c878] selection:text-[#005025]"
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
