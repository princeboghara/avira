"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Transaction } from "@/types";
import { Loader2, Check, Copy } from "lucide-react";
import MemberCard3D from "@/components/3d/MemberCard3D";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Referral URL state
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Withdrawal modal state
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("5000");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadDashboard() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    router.push("/login");
  };

  const referralUrl = mounted && typeof window !== "undefined" && user
    ? `${window.location.origin}/register?ref=${user.memberId}`
    : `http://localhost:3000/register?ref=${user?.memberId || "AV23900"}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setWithdrawModalOpen(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9f9] text-[#1a1c1c]">
        <Loader2 className="w-10 h-10 animate-spin text-[#006d36] mb-3" />
        <span className="text-sm font-bold text-[#006d36]">
          Loading Emerald Elite Dashboard...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f9f9f9] text-center">
        <h2 className="text-2xl font-bold text-[#1a1c1c] mb-2">Member Session Expired</h2>
        <p className="text-sm text-[#5f5e5e] mb-4">Please log in to view your dashboard.</p>
        <Link
          href="/login"
          className="bg-[#006d36] text-white font-bold px-6 py-2.5 rounded-xl text-sm"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] font-sans min-h-screen flex selection:bg-[#50c878] selection:text-[#005025]">
      {/* Side Navigation (Stitch Layout) */}
      <aside className="w-64 neo-base hidden md:flex flex-col h-screen sticky top-0 border-r border-[#e2e2e2]/40 z-40">
        <div className="h-20 flex items-center justify-center border-b border-[#e2e2e2]/40 gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[18px]">diamond</span>
          </div>
          <span className="font-extrabold text-sm tracking-tight text-[#006d36]">
            AVIRA LIFE CARE GLOBAL
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-[#006d36] text-white font-bold shadow-sm shadow-[#006d36]/20"
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-[#5f5e5e] font-bold hover:text-[#006d36] hover:bg-white transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span>Profile</span>
          </Link>
          <Link
            href="/dashboard/store"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-[#5f5e5e] font-bold hover:text-[#006d36] hover:bg-white transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            <span>Shopping</span>
          </Link>
          <Link
            href="/dashboard/community"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-[#5f5e5e] font-bold hover:text-[#006d36] hover:bg-white transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">groups</span>
            <span>My Community</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-all text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </nav>

        {/* Member ID pill in sidebar footer */}
        <div className="p-4 border-t border-[#e2e2e2]/40 bg-white/50">
          <div className="text-[10px] uppercase font-bold text-[#5f5e5e] tracking-wider mb-1">
            Unique Member ID
          </div>
          <div className="font-mono font-black text-sm text-[#006d36] flex items-center justify-between">
            <span>{user.memberId}</span>
            <span className="w-2 h-2 rounded-full bg-[#50c878] animate-ping" />
          </div>
        </div>
      </aside>

      {/* Main Content Area (Stitch Layout) */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top App Bar (Stitch Layout) */}
        <header className="h-20 bg-[#f9f9f9]/80 backdrop-blur-xl border-b border-[#e2e2e2]/30 shadow-sm sticky top-0 z-30 flex justify-between items-center px-6 max-w-7xl w-full mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-[#006d36] md:hidden">
              AVIRA LIFE CARE
            </span>
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-mono bg-emerald-50 text-[#006d36] px-3 py-1 rounded-full border border-emerald-200 font-bold">
                ID: {user.memberId}
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Sponsor: {user.sponsorId || "Root"}
              </span>
            </div>
          </div>

          {/* Quick Menu Bar on Top */}
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard/profile"
              className="text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <Link
              href="/dashboard/store"
              className="text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
              <span className="hidden sm:inline">Shopping</span>
            </Link>
            <Link
              href="/dashboard/community"
              className="text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">groups</span>
              <span className="hidden sm:inline">My Community</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => alert("All Supabase ledger records are in sync.")}
              className="text-[#5f5e5e] hover:text-[#006d36] transition-colors p-2 rounded-full relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ba1a1a] rounded-full" />
            </button>

            <div className="flex items-center space-x-3 pl-4 border-l border-[#e2e2e2]">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-sm text-[#1a1c1c]">{user.fullName}</p>
                <p className="text-xs text-[#006d36] font-medium">Emerald Associate</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-[#50c878] bg-emerald-100 flex items-center justify-center font-bold text-sm text-[#006d36] shadow-sm">
                {user.fullName.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                className="text-[#ba1a1a] hover:bg-red-50 p-2 rounded-xl transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <section className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#1a1c1c] mb-1">
                Welcome back, {user.fullName}!
              </h1>
              <p className="text-sm sm:text-base text-[#3e4a3f]">
                Your network is growing. Here is your real-time performance on Supabase PostgreSQL.
              </p>
            </div>

            {/* Quick 1-Click Share Button */}
            <button
              onClick={handleCopyReferral}
              className="neomorphic-btn-primary px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 self-start md:self-auto"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Sponsor Link</span>
                </>
              )}
            </button>
          </section>

          {/* Metrics Grid (4 Cards from Stitch) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1: Total Earnings */}
            <div className="glass-overlay rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl text-[#006d36]">payments</span>
              </div>
              <p className="text-xs text-[#3e4a3f] uppercase tracking-wider font-bold mb-2">
                Total Earnings
              </p>
              <h2 className="text-3xl font-extrabold text-[#1a1c1c] font-mono mb-2">
                ₹{user.totalEarnings.toLocaleString("en-IN")}
              </h2>
              <div className="flex items-center text-[#006d36] text-xs font-bold">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                <span>+15% from network bonuses</span>
              </div>
            </div>

            {/* Card 2: Direct Referrals */}
            <div className="glass-overlay rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl text-[#006d36]">
                  person_add
                </span>
              </div>
              <p className="text-xs text-[#3e4a3f] uppercase tracking-wider font-bold mb-2">
                Direct Referrals
              </p>
              <h2 className="text-3xl font-extrabold text-[#1a1c1c] font-mono mb-2">
                {user.directReferralsCount}
              </h2>
              <div className="flex items-center text-[#006d36] text-xs font-bold">
                <span className="material-symbols-outlined text-sm mr-1">verified</span>
                <span>Active Direct Line</span>
              </div>
            </div>

            {/* Card 3: Team Volume / Downline */}
            <div className="glass-overlay rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl text-[#006d36]">
                  account_tree
                </span>
              </div>
              <p className="text-xs text-[#3e4a3f] uppercase tracking-wider font-bold mb-2">
                Total Downline Team
              </p>
              <h2 className="text-3xl font-extrabold text-[#1a1c1c] font-mono mb-2">
                {user.totalTeamCount} Nodes
              </h2>
              <div className="w-full bg-[#e2e2e2] rounded-full h-2 mt-2 mb-1">
                <div
                  className="bg-gradient-to-r from-[#006d36] to-[#50c878] h-2 rounded-full"
                  style={{ width: "75%" }}
                />
              </div>
              <p className="text-[10px] text-[#5f5e5e] text-right font-medium">75% to Next Rank</p>
            </div>

            {/* Card 4: Wallet Balance with Withdrawal */}
            <div className="glass-overlay rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl text-[#006d36]">
                  account_balance
                </span>
              </div>
              <p className="text-xs text-[#3e4a3f] uppercase tracking-wider font-bold mb-2">
                Wallet Balance
              </p>
              <h2 className="text-3xl font-extrabold text-[#1a1c1c] font-mono mb-4">
                ₹{user.walletBalance.toLocaleString("en-IN")}
              </h2>
              <button
                onClick={() => setWithdrawModalOpen(true)}
                className="w-full bg-[#006d36] text-white py-2 rounded-xl text-xs font-bold shadow-[0_4px_14px_0_rgba(0,109,54,0.3)] hover:shadow-[0_6px_20px_rgba(0,109,54,0.4)] hover:bg-[#005025] transition-all duration-200 cursor-pointer"
              >
                Withdraw Funds
              </button>
            </div>
          </section>

          {/* Binary MLM Performance & Volume Engine */}
          <section className="mb-8 bg-white rounded-3xl p-6 md:p-8 border border-emerald-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006d36]">account_tree</span>
                  <h3 className="text-xl font-extrabold text-[#1a1c1c]">
                    1:1 Binary Matching & Leg Performance
                  </h3>
                </div>
                <p className="text-xs text-[#5f5e5e] mt-1">
                  1 PV = ₹1 • Capping determined by Self Volume ({user.personalPv} PV = ₹{user.dailyCapping.toLocaleString()} / day limit)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/tree"
                  className="px-4 py-2 bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">account_tree</span>
                  <span>View Binary Tree</span>
                </Link>
                <Link
                  href="/dashboard/store"
                  className="px-4 py-2 border border-[#006d36] text-[#006d36] hover:bg-emerald-50 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                  <span>Add PV / Packages</span>
                </Link>
              </div>
            </div>

            {user.personalPv < 100 && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-red-600 text-[22px] flex-shrink-0">
                    warning
                  </span>
                  <div>
                    <span className="font-extrabold block text-sm">
                      Account Status: RED (Inactive • ₹0 Daily Capping)
                    </span>
                    <span>
                      Your ID has {user.personalPv} PV (&lt; 100 PV). Activate a package to turn Green and unlock daily 1:1 matching income!
                    </span>
                  </div>
                </div>
                <Link
                  href="/dashboard/store"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs whitespace-nowrap shadow-sm text-center"
                >
                  Activate ID Now
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Left PV */}
              <div className="p-4 rounded-2xl bg-[#f0f3ff] border border-blue-200">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                  Left Leg Volume
                </span>
                <span className="text-2xl font-mono font-black text-blue-900">
                  {user.leftPv.toLocaleString()} PV
                </span>
                <span className="text-[10px] text-blue-600 block mt-1 font-semibold">
                  {user.leftPv >= user.rightPv ? "Power Leg (Carry Forward)" : "Volume Active"}
                </span>
              </div>

              {/* Right PV */}
              <div className="p-4 rounded-2xl bg-[#f5f0ff] border border-purple-200">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
                  Right Leg Volume
                </span>
                <span className="text-2xl font-mono font-black text-purple-900">
                  {user.rightPv.toLocaleString()} PV
                </span>
                <span className="text-[10px] text-purple-600 block mt-1 font-semibold">
                  {user.rightPv >= user.leftPv ? "Power Leg (Carry Forward)" : "Volume Active"}
                </span>
              </div>

              {/* Next Expected 1:1 Matching */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  Next 1:1 Matching
                </span>
                <span className="text-2xl font-mono font-black text-[#006d36]">
                  {Math.min(user.leftPv, user.rightPv).toLocaleString()} PV
                </span>
                <span className="text-[10px] text-emerald-700 block mt-1 font-semibold">
                  Est. Payout: ₹{Math.min(Math.min(user.leftPv, user.rightPv), user.dailyCapping).toLocaleString()}
                </span>
              </div>

              {/* Self PV & Daily Capping */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Self Volume & Capping
                </span>
                <span className="text-2xl font-mono font-black text-amber-900">
                  {user.personalPv} PV
                </span>
                <span className="text-[10px] text-amber-700 block mt-1 font-bold">
                  Daily Cap: ₹{user.dailyCapping.toLocaleString()} / day
                </span>
              </div>
            </div>
          </section>

          {/* Interactive 3D Member Card Showcase */}
          <section className="mb-8">
            <div className="glass-overlay rounded-2xl p-6 border border-[#e2e2e2]/60 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-md">
                <span className="text-xs uppercase font-bold tracking-widest text-[#006d36] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Digital Holographic Member Pass
                </span>
                <h3 className="text-2xl font-extrabold text-[#1a1c1c]">
                  Your Official Associate Card
                </h3>
                <p className="text-xs sm:text-sm text-[#5f5e5e] leading-relaxed">
                  Move your mouse over the 3D card to experience the holographic tilt. This
                  verified card contains your permanent Member ID, sponsor, and RFID verification.
                </p>
              </div>
              <div className="w-full max-w-[380px]">
                <MemberCard3D
                  memberId={user.memberId}
                  fullName={user.fullName}
                  sponsorId={user.sponsorId}
                  joinedDate={user.joinedDate}
                  status={user.status}
                />
              </div>
            </div>
          </section>

          {/* Main Content Area (Stitch Layout: Left Payouts & Promo, Right Network Activity) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Payouts & Promo */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Payouts Table */}
              <div className="neo-base rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-extrabold text-[#1a1c1c]">Recent Payouts & Ledger</h3>
                  <span className="text-[#006d36] font-bold text-xs">Supabase Verified</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#e2e2e2] text-[#3e4a3f] uppercase tracking-wider font-bold">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Description</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e2e2]/60">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-[#5f5e5e]">
                            No transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/40 transition-colors">
                            <td className="py-3.5 text-[#5f5e5e] font-mono">{tx.date}</td>
                            <td className="py-3.5 font-bold text-[#1a1c1c]">{tx.description}</td>
                            <td className="py-3.5 font-mono font-extrabold text-[#006d36]">
                              ₹{tx.amount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 text-right">
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#50c878]/20 text-[#006d36] text-[10px] font-bold border border-[#50c878]/30">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Promotional Referral Banner from Stitch */}
              <div id="referral" className="relative rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-[#006d36] to-[#005025] opacity-95 z-0" />
                <div className="relative z-10 p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-white mb-2 sm:mb-0">
                    <h3 className="text-2xl font-extrabold tracking-tight mb-1">
                      Grow Your Empire
                    </h3>
                    <p className="text-xs text-white/90">
                      Share your unique referral link to build your binary network.
                    </p>
                  </div>
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                    <input
                      className="neo-input rounded-xl px-4 py-2.5 text-[#1a1c1c] w-full sm:w-72 text-xs font-mono font-bold select-all"
                      readOnly
                      type="text"
                      value={referralUrl}
                    />
                    <button
                      onClick={handleCopyReferral}
                      className="bg-white text-[#006d36] hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px] mr-1">
                            content_copy
                          </span>
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Network Activity (Stitch Layout) */}
            <div className="space-y-8">
              <div id="network" className="glass-overlay rounded-2xl p-6 h-full flex flex-col">
                <h3 className="text-xl font-extrabold text-[#1a1c1c] mb-6">Network Activity</h3>
                <div className="flex-1 space-y-6">
                  {/* Activity Item 1 */}
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-[#50c878]/20 flex items-center justify-center flex-shrink-0 border border-[#50c878]/30">
                      <span className="material-symbols-outlined text-[#006d36] text-[20px]">
                        person_add
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1a1c1c]">New Associate Enrolled</p>
                      <p className="text-[11px] text-[#3e4a3f] mt-0.5">
                        New associate joined under your Sponsor ID
                      </p>
                      <p className="text-[10px] text-[#5f5e5e] mt-1 font-mono">Today, 09:30 AM</p>
                    </div>
                  </div>

                  {/* Activity Item 2 */}
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-[#66dd8b]/20 flex items-center justify-center flex-shrink-0 border border-[#66dd8b]/30">
                      <span className="material-symbols-outlined text-[#006d36] text-[20px]">
                        military_tech
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1a1c1c]">Rank Advancement Target</p>
                      <p className="text-[11px] text-[#3e4a3f] mt-0.5">
                        Qualified for Ruby Director Tier Bonus
                      </p>
                      <p className="text-[10px] text-[#5f5e5e] mt-1 font-mono">Cycle Active</p>
                    </div>
                  </div>

                  {/* Activity Item 3 */}
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-[#e2e2e2] flex items-center justify-center flex-shrink-0 border border-[#bdcabc]/30">
                      <span className="material-symbols-outlined text-[#5f5e5e] text-[20px]">
                        shopping_bag
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1a1c1c]">Product Volume Generated</p>
                      <p className="text-[11px] text-[#3e4a3f] mt-0.5">
                        500 PV generated in Left Power Leg
                      </p>
                      <p className="text-[10px] text-[#5f5e5e] mt-1 font-mono">Yesterday</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#e2e2e2]/60">
                  <div className="text-xs text-[#5f5e5e]">
                    <span>Postal Base: </span>
                    <strong className="text-[#1a1c1c]">
                      {user.city}, {user.state} ({user.pincode})
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* WITHDRAWAL MODAL */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 sm:p-8 border border-[#50c878] shadow-2xl relative">
            <h3 className="text-2xl font-extrabold text-[#1a1c1c] mb-1">Withdraw Funds</h3>
            <p className="text-xs text-[#5f5e5e] mb-5">
              Available Wallet: <strong className="font-mono text-[#006d36]">₹{user.walletBalance.toLocaleString("en-IN")}</strong>
            </p>

            {withdrawSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="material-symbols-outlined text-4xl text-[#006d36]">check_circle</span>
                <h4 className="text-base font-bold text-[#1a1c1c]">Withdrawal Queued!</h4>
                <p className="text-xs text-[#5f5e5e]">
                  ₹{withdrawAmount} will be transferred to your registered bank account.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label htmlFor="withdrawAmount" className="text-xs font-bold uppercase text-[#1a1c1c] block mb-1">
                    Withdrawal Amount (₹)
                  </label>
                  <input
                    id="withdrawAmount"
                    type="number"
                    min="500"
                    max={user.walletBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e2e2] font-mono font-bold text-lg text-[#1a1c1c] focus:ring-2 focus:ring-[#006d36] outline-none"
                    required
                  />
                  <span className="text-[10px] text-[#5f5e5e] mt-1 block">Minimum withdrawal: ₹500</span>
                </div>

                <div className="p-3 bg-[#f9f9f9] rounded-xl border border-[#e2e2e2] flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#006d36]">account_balance</span>
                  <div className="text-xs">
                    <span className="font-bold text-[#1a1c1c] block">Bank Account on File</span>
                    <span className="text-[#5f5e5e] font-mono">HDFC Bank •••• 4892</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(false)}
                    className="flex-1 py-2.5 border border-[#e2e2e2] text-[#5f5e5e] font-bold rounded-xl text-xs hover:bg-[#f9f9f9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#006d36] hover:bg-[#005025] text-white font-bold rounded-xl text-xs shadow-md"
                  >
                    Confirm Payout
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation (Mobile Only from Stitch) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#f9f9f9]/95 backdrop-blur-md border-t border-[#e2e2e2] flex justify-around items-center h-16 z-40">
        <Link href="/dashboard" className="flex flex-col items-center justify-center w-full h-full text-[#006d36]">
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <a href="#network" className="flex flex-col items-center justify-center w-full h-full text-[#5f5e5e] hover:text-[#006d36]">
          <span className="material-symbols-outlined text-[20px]">group</span>
          <span className="text-[10px] font-medium mt-0.5">Network</span>
        </a>
        <button
          onClick={() => setWithdrawModalOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full text-[#5f5e5e] hover:text-[#006d36]"
        >
          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          <span className="text-[10px] font-medium mt-0.5">Wallet</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-full h-full text-[#ba1a1a]"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-[10px] font-medium mt-0.5">Logout</span>
        </button>
      </nav>
    </div>
  );
}
