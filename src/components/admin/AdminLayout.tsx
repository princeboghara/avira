"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { User } from "@/types";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";

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

  const [adminUser, setAdminUser] = useState<User | null>(initialUser || null);

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

  // Live Notification Counts for Badge
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [confirmedOrdersCount, setConfirmedOrdersCount] = useState(0);
  const [packedOrdersCount, setPackedOrdersCount] = useState(0);
  const [dispatchedOrdersCount, setDispatchedOrdersCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [kycPendingCount, setKycPendingCount] = useState(0);
  const [totalMembersCount, setTotalMembersCount] = useState(0);

  const fetchCounts = async () => {
    try {
      fetch("/api/admin/auth/me", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.admin) {
            setAdminUser(data.admin);
          } else {
            router.push("/admin/login");
          }
        })
        .catch(() => {
          router.push("/admin/login");
        });

      fetch("/api/admin/orders", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.orders) {
            const pending = data.orders.filter((o: { status: string }) => o.status === "PENDING").length;
            const confirmed = data.orders.filter((o: { status: string }) => o.status === "CONFIRMED").length;
            const packed = data.orders.filter((o: { status: string }) => o.status === "PACKED").length;
            const dispatched = data.orders.filter((o: { status: string }) => o.status === "DISPATCHED").length;
            const total = data.orders.length;

            setPendingOrdersCount(pending);
            setConfirmedOrdersCount(confirmed);
            setPackedOrdersCount(packed);
            setDispatchedOrdersCount(dispatched);
            setTotalOrdersCount(total);
          }
        })
        .catch(() => {});

      fetch("/api/admin/kyc", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.submissions) {
            const pending = data.submissions.filter(
              (k: { kycStatus: string }) => k.kycStatus === "PENDING"
            ).length;
            setKycPendingCount(pending);
          }
        })
        .catch(() => {});

      fetch("/api/admin/members", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.members) {
            setTotalMembersCount(data.members.length);
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
  }, []);

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
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9] text-[#1a1c1c] font-sans selection:bg-[#50c878] selection:text-[#005025]">
      {/* ========================================================
          1. TOP ADMIN HEADER WITH UNIVERSAL 3-LINE MENU TOGGLE
         ======================================================== */}
      <AdminHeader
        user={adminUser}
        pendingOrdersCount={pendingOrdersCount}
        onRefresh={handleManualRefresh}
        refreshing={refreshing}
        onToggleMenu={handleToggleMenu}
        desktopSidebarOpen={desktopSidebarOpen || isMenuOpen}
      />

      {/* ========================================================
          2. MAIN BODY (SIDEBAR + MAIN CANVAS)
         ======================================================== */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto relative">
        {/* Desktop Fixed Left Sidebar (Visible on wide screens when enabled) */}
        {desktopSidebarOpen && (
          <aside className="hidden xl:flex flex-col shrink-0 w-64 lg:w-72 border-r border-gray-200 bg-white sticky top-16 sm:top-18 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] z-20 overflow-hidden">
            <AdminSidebar
              user={adminUser}
              pendingOrdersCount={pendingOrdersCount}
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
              aria-label="Close admin menu backdrop"
            />

            {/* Sliding Drawer Container */}
            <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col animate-slideRight">
              <div className="p-3.5 flex items-center justify-between border-b border-gray-100 bg-gray-50/80">
                <span className="text-xs font-black uppercase text-[#006d36] tracking-wider font-mono">
                  Admin Central Menu
                </span>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-200 hover:text-[#1a1c1c] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <AdminSidebar
                  user={adminUser}
                  pendingOrdersCount={pendingOrdersCount}
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

      {/* ========================================================
          4. ENTERPRISE FOOTER
         ======================================================== */}
      <footer className="mt-auto bg-white border-t border-gray-200 py-6 text-xs text-[#5f5e5e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1a1c1c]">Avira Lifecare Global Private Limited Operations</span>
            <span>•</span>
            <span>Enterprise MLM Engine v2.0</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="hover:text-[#006d36]">Dashboard</Link>
            <Link href="/admin/orders" className="hover:text-[#006d36]">Orders</Link>
            <Link href="/admin/members" className="hover:text-[#006d36]">Members</Link>
            <Link href="/admin/reports" className="hover:text-[#006d36]">Reports</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
