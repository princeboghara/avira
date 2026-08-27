"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Wallet,
  ShieldCheck,
  Calendar,
  Check,
  Copy,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  ArrowUpRight,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { User, Transaction } from "@/types";
import MemberLayout from "@/components/dashboard/MemberLayout";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Team counts from /api/member/team
  const [leftTeamCount, setLeftTeamCount] = useState(0);
  const [rightTeamCount, setRightTeamCount] = useState(0);
  const [totalTeamCount, setTotalTeamCount] = useState(0);

  // Binary earnings summary from /api/member/earnings/binary
  const [netBinaryIncome, setNetBinaryIncome] = useState(0);
  const [rpWalletAmount, setRpWalletAmount] = useState(0);

  // Referral URL state
  const [mounted, setMounted] = useState(false);
  const [copiedLeft, setCopiedLeft] = useState(false);
  const [copiedRight, setCopiedRight] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function loadDashboardData() {
      try {
        const [meRes, teamRes, earnRes] = await Promise.allSettled([
          fetch("/api/auth/me"),
          fetch("/api/member/team"),
          fetch("/api/member/earnings/binary"),
        ]);

        if (meRes.status === "fulfilled") {
          const meData = await meRes.value.json();
          if (meData.success && meData.user) {
            setUser(meData.user);
            setTransactions(meData.transactions || []);
            setTotalTeamCount(meData.user.totalTeamCount || 0);
          }
        }

        if (teamRes.status === "fulfilled") {
          const teamData = await teamRes.value.json();
          if (teamData.success) {
            setLeftTeamCount(teamData.leftCount || 0);
            setRightTeamCount(teamData.rightCount || 0);
            setTotalTeamCount(teamData.totalTeam || 0);
          }
        }

        if (earnRes.status === "fulfilled") {
          const earnData = await earnRes.value.json();
          if (earnData.success && earnData.summary) {
            setNetBinaryIncome(earnData.summary.totalNet || 0);
            setRpWalletAmount(earnData.summary.rpWalletBalance || 0);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const baseUrl = mounted && typeof window !== "undefined" ? window.location.origin : "https://aviracare.com";
  const leftReferralUrl = user ? `${baseUrl}/register?ref=${user.memberId}&pos=LEFT` : "";
  const rightReferralUrl = user ? `${baseUrl}/register?ref=${user.memberId}&pos=RIGHT` : "";

  const handleCopyLeft = () => {
    if (!leftReferralUrl) return;
    navigator.clipboard.writeText(leftReferralUrl);
    setCopiedLeft(true);
    setTimeout(() => setCopiedLeft(false), 2000);
  };

  const handleCopyRight = () => {
    if (!rightReferralUrl) return;
    navigator.clipboard.writeText(rightReferralUrl);
    setCopiedRight(true);
    setTimeout(() => setCopiedRight(false), 2000);
  };

  const isUserActive = user ? user.personalPv >= 100 : false;

  // Unmatched / Pending Carry PV to be matched
  const pendingMatchPv = user
    ? Math.max(user.carryLeftPv || 0, user.carryRightPv || 0)
    : 0;

  const formattedJoiningDate = user?.joinedDate
    ? new Date(user.joinedDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recent";

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
        {/* ========================================================
            ITEM 1: WELCOME BANNER
           ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black px-3 py-1 bg-emerald-50 text-[#006d36] rounded-full border border-emerald-200">
                ID: {user?.memberId || "AV00001"}
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  isUserActive
                    ? "bg-emerald-100 text-[#006d36] border-emerald-300"
                    : "bg-red-100 text-red-700 border-red-300"
                }`}
              >
                {isUserActive ? "Active Account" : "Red (<100 PV)"}
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium hidden sm:inline">
                Sponsor: <strong className="text-[#1a1c1c] font-mono">{user?.sponsorId || "Root"}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a1c1c] tracking-tight">
              Welcome back, {user?.fullName || "Associate"}!
            </h1>
            <p className="text-xs sm:text-sm text-[#5f5e5e] max-w-2xl leading-relaxed">
              Real-time performance summary. 1:1 Instant binary matching with live RP wallet & network tree analytics.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10 self-start md:self-auto">
            <Link
              href="/dashboard/store"
              className="px-5 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#006d36]/20 transition-all cursor-pointer"
            >
              <span>Shopping Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Soft background watermark */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-6 translate-y-6">
            <span className="material-symbols-outlined text-9xl text-[#006d36]">eco</span>
          </div>
        </section>

        {/* ========================================================
            ITEM 2: LEFT & RIGHT REFERRAL LINK BOXES
           ======================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Referral Link */}
          <div className="bg-gradient-to-br from-blue-50/80 to-white rounded-3xl p-5 sm:p-6 border border-blue-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                  Left Leg Referral Link
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                Placement: LEFT
              </span>
            </div>

            <p className="text-[11px] text-[#5f5e5e]">
              Share this link to automatically place new registrants into your Left Leg downline.
            </p>

            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-blue-200">
              <input
                type="text"
                readOnly
                value={leftReferralUrl}
                className="w-full bg-transparent px-3 py-1.5 text-xs font-mono text-[#1a1c1c] outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopyLeft}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-all active:scale-95"
              >
                {copiedLeft ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLeft ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Right Referral Link */}
          <div className="bg-gradient-to-br from-purple-50/80 to-white rounded-3xl p-5 sm:p-6 border border-purple-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-purple-900">
                  Right Leg Referral Link
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                Placement: RIGHT
              </span>
            </div>

            <p className="text-[11px] text-[#5f5e5e]">
              Share this link to automatically place new registrants into your Right Leg downline.
            </p>

            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-purple-200">
              <input
                type="text"
                readOnly
                value={rightReferralUrl}
                className="w-full bg-transparent px-3 py-1.5 text-xs font-mono text-[#1a1c1c] outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopyRight}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-all active:scale-95"
              >
                {copiedRight ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRight ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================
            ITEMS 3, 4, 5: FINANCIAL METRICS (Diverse Styling)
           ======================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* ITEM 3: Total Earning (Emerald Gold Gradient Card) */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-xs relative overflow-hidden group hover:border-[#006d36] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5f5e5e]">
                3. Total Earning
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-mono text-[#1a1c1c] tracking-tight">
              ₹{(user?.totalEarnings || 0).toLocaleString("en-IN")}
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#006d36] mt-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lifetime Cumulative Income</span>
            </div>
          </div>

          {/* ITEM 4: Binary Income (Net after 3% TDS + 8% Admin + 2% RP) */}
          <div className="bg-white rounded-3xl p-6 border border-teal-200 bg-gradient-to-br from-teal-50/40 to-white shadow-xs relative overflow-hidden group hover:border-teal-500 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-800">
                4. Binary Income (Net)
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-mono text-teal-900 tracking-tight">
              ₹{netBinaryIncome.toLocaleString("en-IN")}
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-teal-700 font-medium mt-2">
              <span>85% Net Payout (TDS 2%, Admin 8%, RP 5%)</span>
            </div>
          </div>

          {/* ITEM 5: RP Wallet (Repurchase Wallet) */}
          <div className="bg-white rounded-3xl p-6 border border-purple-200 bg-gradient-to-br from-purple-50/40 to-white shadow-xs relative overflow-hidden group hover:border-purple-500 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-800">
                5. RP Wallet (Repurchase)
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-mono text-purple-900 tracking-tight">
              ₹{(user?.rpWallet || rpWalletAmount).toLocaleString("en-IN")}
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-purple-700 font-medium mt-2">
              <span>5% Auto-accumulated for Shopping</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            ITEMS 6, 7: TEAM STRENGTH (Total Team, Left Team, Right Team)
           ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e2e2e2]">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#006d36]" />
              <h3 className="text-base font-black text-[#1a1c1c]">
                Team Community Network
              </h3>
            </div>
            <Link
              href="/dashboard/community/team"
              className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>View All Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            {/* ITEM 6: Total Team */}
            <div className="p-5 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                6. Total Team
              </span>
              <span className="text-3xl font-black text-[#1a1c1c] block my-2">
                {totalTeamCount} Nodes
              </span>
              <span className="text-[10px] text-[#5f5e5e]">Overall Downline Associates</span>
            </div>

            {/* ITEM 7A: Total Left Team */}
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-800 block">
                7. Left Team Count
              </span>
              <span className="text-3xl font-black text-blue-900 block my-2">
                {leftTeamCount} Associates
              </span>
              <span className="text-[10px] text-blue-700">Active Left Leg Subtree</span>
            </div>

            {/* ITEM 7B: Total Right Team */}
            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-purple-800 block">
                7. Right Team Count
              </span>
              <span className="text-3xl font-black text-purple-900 block my-2">
                {rightTeamCount} Associates
              </span>
              <span className="text-[10px] text-purple-700">Active Right Leg Subtree</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            ITEMS 8, 9: BINARY PV VOLUME & PENDING MATCH PV
           ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e2e2e2]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#006d36]" />
              <h3 className="text-base font-black text-[#1a1c1c]">
                1:1 Binary PV Matching Engine
              </h3>
            </div>
            <Link
              href="/dashboard/tree"
              className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>Explore Binary Tree</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            {/* ITEM 8A: Total Left PV */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-800 block">
                8. Total Left PV
              </span>
              <span className="text-3xl font-black text-blue-900 block">
                {(user?.leftPv || 0).toLocaleString()} PV
              </span>
              <span className="text-[10px] text-blue-700 block">
                Carry: {(user?.carryLeftPv || 0).toLocaleString()} PV
              </span>
            </div>

            {/* ITEM 8B: Total Right PV */}
            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-800 block">
                8. Total Right PV
              </span>
              <span className="text-3xl font-black text-purple-900 block">
                {(user?.rightPv || 0).toLocaleString()} PV
              </span>
              <span className="text-[10px] text-purple-700 block">
                Carry: {(user?.carryRightPv || 0).toLocaleString()} PV
              </span>
            </div>

            {/* ITEM 9: Match Thva Pending Padela PV (Carry Unmatched PV) */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">
                9. Pending Match PV
              </span>
              <span className="text-3xl font-black text-amber-900 block">
                {pendingMatchPv.toLocaleString()} PV
              </span>
              <span className="text-[10px] text-amber-700 block">
                Carry Forward for 1:1 Instant Match
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================
            ITEM 10: BOTTOM CREDENTIALS (Joining Date, Capping, KYC Status)
           ======================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Joining Date Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#e2e2e2] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                Joining Date
              </span>
              <span className="font-mono text-sm font-black text-[#1a1c1c] block mt-0.5">
                {formattedJoiningDate}
              </span>
            </div>
          </div>

          {/* Daily Capping Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#e2e2e2] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                Daily Binary Capping
              </span>
              <span className="font-mono text-sm font-black text-[#1a1c1c] block mt-0.5">
                ₹{(user?.dailyCapping || 1000).toLocaleString("en-IN")} / Day
              </span>
            </div>
          </div>

          {/* KYC Status Card */}
          <Link
            href="/dashboard/kyc"
            className="bg-white rounded-3xl p-5 border border-[#e2e2e2] shadow-xs flex items-center justify-between gap-4 hover:border-emerald-300 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  user?.kycStatus === "VERIFIED"
                    ? "bg-emerald-50 text-[#006d36]"
                    : user?.kycStatus === "REJECTED"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-800"
                }`}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                  KYC Verification
                </span>
                <span className="font-mono text-sm font-black text-[#1a1c1c] block mt-0.5 uppercase">
                  {user?.kycStatus || "NOT SUBMITTED"}
                </span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#006d36] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </section>
      </div>
    </MemberLayout>
  );
}
