"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { User } from "@/types";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: User | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function AdminLayout({
  children,
  user: initialUser,
  onRefresh,
  refreshing = false,
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [adminUser, setAdminUser] = useState<User | null>(() => {
    if (initialUser) return initialUser;
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("avira_admin");
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

  // Guaranteed Universal Menu Toggle
  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setDesktopSidebarOpen((prev) => !prev);
  };

  // Live Notification Counts for Badge
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [transferOrdersCount, setTransferOrdersCount] = useState(0);
  const [confirmedOrdersCount, setConfirmedOrdersCount] = useState(0);
  const [packedOrdersCount, setPackedOrdersCount] = useState(0);
  const [dispatchedOrdersCount, setDispatchedOrdersCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [kycPendingCount, setKycPendingCount] = useState(0);
  const [totalMembersCount, setTotalMembersCount] = useState(0);

  const fetchCounts = async () => {
    try {
      // 1. Verify admin session
      fetch("/api/admin/auth/me", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.admin) {
            setAdminUser(data.admin);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("avira_admin", JSON.stringify(data.admin));
            }
          } else {
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("avira_admin");
            }
            setAdminUser(null);
            router.push("/admin/login");
          }
        })
        .catch(() => {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("avira_admin");
          }
          setAdminUser(null);
          router.push("/admin/login");
        });

      // 2. Fetch all badge counters in a SINGLE fast query
      fetch("/api/admin/stats", { cache: "no-store" })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            setPendingOrdersCount(res.data.pendingOrders || 0);
            setTransferOrdersCount(res.data.transferOrders || 0);
            setKycPendingCount(res.data.pendingKyc || 0);
            setTotalOrdersCount(res.data.totalOrders || 0);
            setTotalMembersCount(res.data.totalMembers || 0);
          }
        })
        .catch(() => {});
    } catch {
      // Ignore background network error
    }
  };

  useEffect(() => {
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setAdminUser(null);
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.clear();
      }
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    router.push("/admin/login");
  };

  const handleManualRefresh = () => {
    fetchCounts();
    if (onRefresh) {
      onRefresh();
    }
  };

  // Close menu drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bio-canvas-bg text-[#0f172a] selection:bg-[#006d36] selection:text-white">
      {/* 1. TOP ADMIN HEADER */}
      <AdminHeader
        user={adminUser}
        pendingOrdersCount={pendingOrdersCount}
        onRefresh={handleManualRefresh}
        refreshing={refreshing}
        onToggleMenu={handleToggleMenu}
        desktopSidebarOpen={desktopSidebarOpen || isMenuOpen}
      />

      {/* 2. MAIN BODY (SIDEBAR + MAIN CANVAS) */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto relative">
        {/* Desktop Fixed Left Sidebar */}
        {desktopSidebarOpen && (
          <aside className="hidden xl:flex flex-col shrink-0 w-64 lg:w-72 border-r border-white/60 bg-transparent sticky top-16 sm:top-18 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] z-20 overflow-hidden">
            <AdminSidebar
              user={adminUser}
              pendingOrdersCount={pendingOrdersCount}
              transferOrdersCount={transferOrdersCount}
              confirmedOrdersCount={confirmedOrdersCount}
              packedOrdersCount={packedOrdersCount}
              dispatchedOrdersCount={dispatchedOrdersCount}
              totalOrdersCount={totalOrdersCount}
              kycPendingCount={kycPendingCount}
              totalMembersCount={totalMembersCount}
              onLogout={handleLogout}
            />
          </aside>
        )}

        {/* 3. UNIVERSAL SLIDE-OUT OVERLAY DRAWER */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex animate-fadeIn">
            {/* Dark Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close admin menu backdrop"
            />

            {/* Sliding Drawer Container */}
            <div className="relative w-80 max-w-[85vw] glass-panel h-full shadow-2xl z-10 flex flex-col animate-slideRight">
              <div className="p-4 flex items-center justify-between border-b border-gray-200/60 bg-white/40">
                <span className="text-xs font-black uppercase text-[#006d36] tracking-wider font-mono">
                  Admin Central Menu
                </span>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="neo-btn-icon p-2 rounded-xl text-[#64748b] hover:text-[#0f172a] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <AdminSidebar
                  user={adminUser}
                  pendingOrdersCount={pendingOrdersCount}
                  transferOrdersCount={transferOrdersCount}
                  confirmedOrdersCount={confirmedOrdersCount}
                  packedOrdersCount={packedOrdersCount}
                  dispatchedOrdersCount={dispatchedOrdersCount}
                  totalOrdersCount={totalOrdersCount}
                  kycPendingCount={kycPendingCount}
                  totalMembersCount={totalMembersCount}
                  onLogout={handleLogout}
                  onNavigate={() => setIsMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Page Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0 transition-all duration-200">
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
