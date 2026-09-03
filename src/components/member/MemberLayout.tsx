"use client";

import React, { useState, useEffect } from "react";
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

  // Instant user state from props or sessionStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (initialUser) return initialUser;
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("avira_user");
        if (cached) return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return null;
  });

  // Universal Menu Drawer & Sidebar States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  // Universal Menu Toggle
  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setDesktopSidebarOpen((prev) => !prev);
  };

  // Sync initialUser if updated from parent
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser);
  if (prevInitialUser !== initialUser) {
    setPrevInitialUser(initialUser);
    setCurrentUser(initialUser || null);
    if (initialUser && typeof window !== "undefined") {
      sessionStorage.setItem("avira_user", JSON.stringify(initialUser));
    }
  }

  // Validate User freshly from /api/auth/me in background once per route change
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("avira_user", JSON.stringify(data.user));
          }
        } else {
          router.push("/login");
        }
      })
      .catch((err) => {
        console.error("Error verifying user in layout:", err);
      });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  // Close menu drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="min-h-screen bio-canvas-bg text-[#0f172a] flex flex-col selection:bg-[#006d36] selection:text-white">
      {/* 1. TOP HEADER WITH FROSTED GLASS */}
      <MemberHeader
        user={currentUser}
        onToggleMenu={handleToggleMenu}
        desktopSidebarOpen={desktopSidebarOpen || isMenuOpen}
      />

      {/* 2. MAIN BODY (SIDEBAR + MAIN CANVAS) */}
      <div className="flex flex-1 relative w-full max-w-7xl mx-auto">
        {/* Desktop Fixed Left Sidebar */}
        {desktopSidebarOpen && (
          <aside className="hidden xl:flex flex-col shrink-0 w-64 lg:w-72 border-r border-white/60 bg-transparent sticky top-16 sm:top-18 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] z-20 overflow-hidden">
            <MemberSidebar user={currentUser} onLogout={handleLogout} />
          </aside>
        )}

        {/* 3. UNIVERSAL SLIDE-OUT OVERLAY DRAWER */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex animate-fadeIn">
            {/* Dark Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close navigation menu backdrop"
            />

            {/* Sliding Drawer Container */}
            <div className="relative w-80 max-w-[85vw] glass-panel h-full shadow-2xl z-10 flex flex-col animate-slideRight">
              <div className="p-4 flex items-center justify-between border-b border-gray-200/60 bg-white/40">
                <span className="text-xs font-black uppercase text-[#006d36] tracking-wider font-mono">
                  Navigation Menu
                </span>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="neo-btn-icon p-2 rounded-xl text-[#64748b] hover:text-[#0f172a] cursor-pointer"
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

      {/* 4. MINIMALIST FROSTED FOOTER */}
      <footer className="mt-auto py-5 px-4 sm:px-6 lg:px-8 glass-header border-t border-white/80 text-center text-xs text-[#64748b] flex flex-col sm:flex-row items-center justify-center gap-3">
        <p>© 2026 Avira Lifecare Global Private Limited. All rights reserved.</p>
      </footer>
    </div>
  );
}
