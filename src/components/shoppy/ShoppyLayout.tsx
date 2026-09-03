"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import ShoppySidebar from "./ShoppySidebar";
import { RotateCw, Menu, X, Store, ShieldCheck } from "lucide-react";

interface ShoppyLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function ShoppyLayout({
  children,
  onRefresh,
  refreshing = false,
}: ShoppyLayoutProps) {
  const pathname = usePathname();
  // Universal drawer state (works on Laptop, Tablet & Mobile)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Pinned desktop sidebar on wide screens (>= 1280px)
  const [isDesktopPinned, setIsDesktopPinned] = useState(true);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const handleToggleMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      // On laptops, tablets, and mobiles: always open/toggle the sliding drawer!
      setIsDrawerOpen((prev) => !prev);
    } else {
      // On wide desktop screens: toggle pinned sidebar
      setIsDesktopPinned((prev) => !prev);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased selection:bg-[#006d36] selection:text-white w-full max-w-full overflow-x-hidden relative">
      {/* 1. DOCKED SIDEBAR: Visible on large desktop screens (>= 1280px) if pinned */}
      {isDesktopPinned && (
        <div className="hidden xl:block shrink-0 transition-all duration-300">
          <ShoppySidebar />
        </div>
      )}

      {/* 2. UNIVERSAL SLIDE-OUT OVERLAY DRAWER: Opens on Laptop, Tablet & Mobile */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close sidebar backdrop"
          />

          {/* Drawer sidebar panel */}
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <ShoppySidebar
              onNavigate={() => setIsDrawerOpen(false)}
              onClose={() => setIsDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. MAIN CANVAS AREA */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        {/* Crisp Executive Top Navbar */}
        <header className="h-16 sm:h-18 bg-white border-b border-slate-200/90 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs w-full max-w-full overflow-hidden">
          {/* Left section: Hamburger + Hub Badge */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-[75%] sm:max-w-none">
            {/* 3-Lines Hamburger Menu Button */}
            <button
              type="button"
              onClick={handleToggleMenu}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 cursor-pointer text-xs font-bold shrink-0 transition-colors"
              title="Toggle Sidebar Menu"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[#006d36]" />
              <span className="font-mono text-[11px] sm:text-xs">Menu</span>
            </button>

            {/* Hub Banner Tag */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <Store className="w-3.5 h-3.5 text-[#006d36] shrink-0" />
              <span className="font-mono font-bold text-[11px] sm:text-xs text-slate-900 truncate">
                SURAT PARCEL HUB
              </span>
              <span className="hidden xs:inline-block px-1.5 py-0.2 rounded bg-[#006d36] text-white font-mono text-[9px] font-black shrink-0">
                AVS01
              </span>
            </div>
          </div>

          {/* Right section: Refresh & Verified Tag */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold cursor-pointer disabled:opacity-60 shrink-0 transition-colors"
                title="Refresh Hub Data"
              >
                <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#006d36]" : ""}`} />
                <span className="hidden md:inline">Refresh</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006d36]" />
              <span>Verified Hub</span>
            </div>
          </div>
        </header>

        {/* Page Content Canvas with strict zero horizontal scroll */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
