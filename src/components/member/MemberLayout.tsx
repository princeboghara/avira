"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { User } from "@/types";
import MemberHeader from "./MemberHeader";
import MemberSidebar from "./MemberSidebar";

interface MemberLayoutProps {
  user?: User | null;
  children: React.ReactNode;
}

export default function MemberLayout({ user: initialUser, children }: MemberLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Fresh user state (no stale global caching)
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser || null);

  // Universal Menu Drawer & Sidebar States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  // Guaranteed Universal Menu Toggle for Mobile, Tablet, Laptop, and Desktop
  const handleToggleMenu = () => {
    // Toggles the slide-over drawer on any screen
    setIsMenuOpen((prev) => !prev);
    // Also toggles desktop persistent sidebar
    setDesktopSidebarOpen((prev) => !prev);
  };

  // Sync initialUser if updated from parent
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser);
  if (prevInitialUser !== initialUser) {
    setPrevInitialUser(initialUser);
    setCurrentUser(initialUser || null);
  }

  // Load User freshly from /api/auth/me if not provided
  useEffect(() => {
    if (initialUser) return;

    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success && data.user) {
          setCurrentUser(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch((err) => {
        console.error("Error fetching user in layout:", err);
        if (active) router.push("/login");
      });

    return () => {
      active = false;
    };
  }, [initialUser, router]);

  // Close menu drawer on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setCurrentUser(null);
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.clear();
      }
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col font-sans selection:bg-[#50c878] selection:text-[#005025]">
      {/* ========================================================
          1. TOP HEADER WITH UNIVERSAL 3-LINE MENU TOGGLE
         ======================================================== */}
      <MemberHeader
        user={currentUser}
        onToggleMenu={handleToggleMenu}
        desktopSidebarOpen={desktopSidebarOpen || isMenuOpen}
      />

      {/* ========================================================
          2. MAIN BODY (PERSISTENT SIDEBAR + MAIN CANVAS)
         ======================================================== */}
      <div className="flex flex-1 relative w-full max-w-7xl mx-auto">
        {/* Desktop Fixed Left Sidebar (Visible on wide screens when enabled) */}
        {desktopSidebarOpen && (
          <aside className="hidden xl:flex flex-col shrink-0 w-64 lg:w-72 border-r border-gray-200 bg-white sticky top-16 sm:top-18 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] z-20 overflow-hidden">
            <MemberSidebar user={currentUser} onLogout={handleLogout} />
          </aside>
        )}

        {/* ========================================================
            3. UNIVERSAL SLIDE-OUT OVERLAY DRAWER
            (Guaranteed 100% visible on ALL screen sizes: Mobile, Tablet, Laptop, Desktop)
           ======================================================== */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex animate-fadeIn">
            {/* Dark Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-2xs transition-opacity cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close navigation menu backdrop"
            />

            {/* Sliding Drawer Container */}
            <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col animate-slideRight">
              <div className="p-3.5 flex items-center justify-between border-b border-gray-100 bg-gray-50/80">
                <span className="text-xs font-black uppercase text-[#006d36] tracking-wider font-mono">
                  Navigation Menu
                </span>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-200 hover:text-[#1a1c1c] transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <MemberSidebar
                  user={currentUser}
                  onLogout={handleLogout}
                  onNavigate={() => setIsMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Page Main Canvas */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden transition-all duration-200">
          {children}
        </main>
      </div>

      {/* ========================================================
          4. CLEAN ENTERPRISE FOOTER
         ======================================================== */}
      <footer className="mt-auto py-5 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200 text-center text-xs text-[#5f5e5e] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 Avira Lifecare Global Private Limited. All rights reserved.</p>
        <div className="flex items-center gap-4 text-[11px] font-mono text-gray-400">
          <span>1:1 Pair Matching Engine</span>
          <span>•</span>
          <span>Repurchase Portal</span>
        </div>
      </footer>
    </div>
  );
}
