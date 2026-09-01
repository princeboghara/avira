"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Wallet,
  ShieldCheck,
  Calendar,
  Check,
  Copy,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  FileText,
  FileCheck,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  Zap,
  TrendingUp,
  Share2,
} from "lucide-react";
import { User, Transaction } from "@/types";
import MemberLayout from "@/components/member/MemberLayout";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Team counts & Volume from /api/member/team
  const [leftTeamCount, setLeftTeamCount] = useState(0);
  const [rightTeamCount, setRightTeamCount] = useState(0);
  const [totalTeamCount, setTotalTeamCount] = useState(0);

  // Today & Weekly PV
  const [todayLeftPv, setTodayLeftPv] = useState(0);
  const [todayRightPv, setTodayRightPv] = useState(0);
  const [weeklyLeftPv, setWeeklyLeftPv] = useState(0);
  const [weeklyRightPv, setWeeklyRightPv] = useState(0);

  // Payout Statement summaries
  const [totalPaidIncome, setTotalPaidIncome] = useState(0);
  const [pendingPayoutIncome, setPendingPayoutIncome] = useState(0);

  // Accordion state for Recent Statement
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  // Referral URL copy states
  const [mounted, setMounted] = useState(false);
  const [copiedLeft, setCopiedLeft] = useState(false);
  const [copiedRight, setCopiedRight] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function loadDashboardData() {
      try {
        // 1. Fetch authenticated user profile first for instant screen render
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.success && meData.user) {
            setUser(meData.user);
            setTransactions(meData.transactions || []);
            setTotalTeamCount(meData.user.totalTeamCount || 0);
          }
        }
        // Immediately reveal dashboard
        setLoading(false);

        // 2. Fetch secondary team & statement summaries in parallel in background
        Promise.allSettled([
          fetch("/api/member/team", { cache: "no-store" }),
          fetch("/api/member/statement", { cache: "no-store" }),
        ]).then(async ([teamRes, stateRes]) => {
          if (teamRes.status === "fulfilled" && teamRes.value.ok) {
            const teamData = await teamRes.value.json();
            if (teamData.success) {
              setLeftTeamCount(teamData.leftCount || 0);
              setRightTeamCount(teamData.rightCount || 0);
              setTotalTeamCount(teamData.totalTeam || 0);

              if (teamData.pvStats) {
                setTodayLeftPv(teamData.pvStats.todayLeftPv || 0);
                setTodayRightPv(teamData.pvStats.todayRightPv || 0);
                setWeeklyLeftPv(teamData.pvStats.weeklyLeftPv || 0);
                setWeeklyRightPv(teamData.pvStats.weeklyRightPv || 0);
              }
            }
          }

          if (stateRes.status === "fulfilled" && stateRes.value.ok) {
            const stateData = await stateRes.value.json();
            if (stateData.success && stateData.summary) {
              setTotalPaidIncome(stateData.summary.totalPaid || 0);
              setPendingPayoutIncome(stateData.summary.totalPending || 0);
            }
          }
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
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

  const handleCopyMemberId = () => {
    if (!user?.memberId) return;
    navigator.clipboard.writeText(user.memberId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Rank and Status Calculations
  const personalPv = user?.personalPv || 0;
  const isUserActive = personalPv >= 100;

  let rankName = "Non-Active";
  let rankBadgeColor = "from-rose-500 to-red-600 text-white shadow-rose-500/25";
  let rankGlowColor = "from-rose-500/25 to-pink-500/10";
  let rankIcon = AlertCircle;

  if (personalPv >= 1000) {
    rankName = "Diamond";
    rankBadgeColor = "from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-cyan-500/30";
    rankGlowColor = "from-cyan-500/30 via-blue-500/20 to-indigo-500/10";
    rankIcon = Sparkles;
  } else if (personalPv >= 500) {
    rankName = "Platinum";
    rankBadgeColor = "from-purple-600 to-indigo-600 text-white shadow-purple-500/30";
    rankGlowColor = "from-purple-500/30 to-indigo-500/10";
    rankIcon = Award;
  } else if (personalPv >= 250) {
    rankName = "Gold";
    rankBadgeColor = "from-amber-500 via-yellow-500 to-orange-600 text-white shadow-amber-500/30";
    rankGlowColor = "from-amber-500/30 to-yellow-500/10";
    rankIcon = Award;
  } else if (personalPv >= 100) {
    rankName = "Silver";
    rankBadgeColor = "from-emerald-500 to-teal-600 text-white shadow-emerald-500/30";
    rankGlowColor = "from-emerald-500/30 to-teal-500/10";
    rankIcon = CheckCircle2;
  }

  const RankIcon = rankIcon;

  // Carry Forward PV Calculations
  const carryLeftPv = user?.carryLeftPv ?? 0;
  const carryRightPv = user?.carryRightPv ?? 0;
  const todayTotalPv = todayLeftPv + todayRightPv;
  const weeklyTotalPv = weeklyLeftPv + weeklyRightPv;

  if (loading) {
    return (
      <MemberLayout user={user}>
        <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-pulse">
          <div className="rounded-3xl p-6 bg-slate-900/10 h-28 flex items-center justify-between" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 rounded-3xl bg-white border border-slate-200" />
            <div className="h-32 rounded-3xl bg-white border border-slate-200" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="h-44 rounded-3xl bg-white border border-slate-200" />
            <div className="h-44 rounded-3xl bg-white border border-slate-200" />
            <div className="h-44 rounded-3xl bg-white border border-slate-200" />
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-fadeIn font-[Arial,sans-serif]">
        {/* ========================================================
            1. VIBRANT FILLED PROFILE HEADER (Avatar, Name, ID, Rank, Status - ONLY Profile & Store)
           ======================================================== */}
        <div className="bg-gradient-to-br from-white via-emerald-50/70 to-teal-100/50 rounded-3xl p-5 sm:p-6 border-2 border-emerald-300 shadow-[0_12px_35px_rgba(16,185,129,0.18)] hover:shadow-[0_18px_45px_rgba(16,185,129,0.25)] transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          {/* Ambient Multi-Color Lights */}
          <div className={`absolute -top-12 -left-12 w-56 h-56 rounded-full bg-gradient-to-br ${rankGlowColor} blur-2xl pointer-events-none`} />
          <div className="absolute top-0 right-0 w-44 h-44 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 sm:gap-5 relative z-10">
            {/* Avatar / PFP */}
            <div className="relative shrink-0 group">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#006d36] via-[#005228] to-[#013317] text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-emerald-900/30 border-2 border-emerald-400/60 group-hover:scale-105 transition-transform duration-300">
                  {user?.fullName?.charAt(0) || "A"}
                </div>
              )}
              {/* Active Pulse Pill */}
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                {isUserActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-4 w-4 border-2 border-white shadow-md ${
                    isUserActive ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              </span>
            </div>

            <div className="space-y-1.5">
              {/* Badges Strip */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Member ID with Copy Action */}
                <button
                  type="button"
                  onClick={handleCopyMemberId}
                  title="Click to copy Member ID"
                  className="font-mono text-xs font-black px-3.5 py-1 rounded-xl bg-white hover:bg-emerald-50 text-[#006d36] border-2 border-emerald-300 shadow-xs active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer group"
                >
                  <span>{user?.memberId}</span>
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                  )}
                </button>

                {/* Radiant Rank Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r ${rankBadgeColor} shadow-md border border-white/30`}
                >
                  <RankIcon className="w-3.5 h-3.5" />
                  <span>{rankName} ({personalPv} PV)</span>
                </span>

                {/* Active / Inactive Status Pill */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shadow-xs ${
                    isUserActive
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isUserActive ? "bg-emerald-200 animate-pulse" : "bg-rose-200"
                    }`}
                  />
                  <span>{isUserActive ? "Active" : "Inactive (<100 PV)"}</span>
                </span>
              </div>

              {/* Full Name */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {user?.fullName}
              </h1>
            </div>
          </div>

          {/* Action Shortcuts (ONLY 2 BUTTONS: Profile & Store) */}
          <div className="flex items-center gap-3 w-full sm:w-auto relative z-10">
            <Link
              href="/dashboard/profile"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-black text-xs border-2 border-slate-200 shadow-sm hover:border-slate-300 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-slate-600" />
              <span>Profile</span>
            </Link>
            <Link
              href="/dashboard/store"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#006d36] via-[#005a2c] to-emerald-700 hover:brightness-110 text-white font-black text-xs shadow-md shadow-emerald-800/30 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Store</span>
            </Link>
          </div>
        </div>

        {/* ========================================================
            2. COLOR-FILLED DUAL-WING REFERRAL CARDS (PLACED DIRECTLY ABOVE INCOME)
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Left Wing Referral Card (Vibrant Mint & Emerald Filled) */}
          <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white border-2 border-emerald-400/60 shadow-xl shadow-emerald-700/25 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-700/35 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-xs shadow-md border border-white/30">
                  LEFT
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>Left Team Placement Link</span>
                    <Share2 className="w-3.5 h-3.5 text-emerald-200" />
                  </h3>
                  <span className="text-[11px] text-emerald-100 font-medium">Auto places new associate in Left Leg</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1 p-2 bg-white/15 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner relative z-10">
              <input
                type="text"
                readOnly
                value={leftReferralUrl}
                className="flex-1 bg-transparent text-xs font-mono font-bold text-white placeholder-white/60 px-2 outline-hidden truncate"
              />
              <button
                type="button"
                onClick={handleCopyLeft}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-[#006d36] text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedLeft ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#006d36]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Wing Referral Card (Vibrant Royal Indigo & Violet Filled) */}
          <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white border-2 border-indigo-400/60 shadow-xl shadow-indigo-700/25 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-700/35 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-xs shadow-md border border-white/30">
                  RIGHT
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>Right Team Placement Link</span>
                    <Share2 className="w-3.5 h-3.5 text-indigo-200" />
                  </h3>
                  <span className="text-[11px] text-indigo-100 font-medium">Auto places new associate in Right Leg</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1 p-2 bg-white/15 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner relative z-10">
              <input
                type="text"
                readOnly
                value={rightReferralUrl}
                className="flex-1 bg-transparent text-xs font-mono font-bold text-white placeholder-white/60 px-2 outline-hidden truncate"
              />
              <button
                type="button"
                onClick={handleCopyRight}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-800 text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedRight ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-800" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. THREE FULLY COLOR-FILLED HERO INCOME CARDS (Emerald, Sapphire, Rose/Pink)
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Lifetime Income (Deep Velvet Emerald Hero Card) */}
          <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#005a2c] via-[#004820] to-[#012d15] text-white border-2 border-emerald-400/50 shadow-xl shadow-[#006d36]/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#006d36]/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-md">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-xs">
                  Lifetime Earnings
                </span>
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-emerald-200 block mb-1">
                Total Income
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                ₹{user?.totalEarnings?.toLocaleString("en-IN") || 0}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100">
              <span>Withdrawable: <strong className="text-white font-mono">₹{user?.walletBalance?.toLocaleString("en-IN") || 0}</strong></span>
              <Link
                href="/dashboard/statement"
                className="hover:underline flex items-center gap-1 font-black text-white"
              >
                <span>Payouts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Total Paid Income (Filled Royal Sapphire & Ocean Blue Card) */}
          <Link
            href="/dashboard/statement"
            className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700 text-white border-2 border-sky-300/50 shadow-xl shadow-blue-600/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-600/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-44 h-44 bg-sky-300/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-md">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-xs">
                  Settled Payout
                </span>
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-sky-100 block mb-1">
                Total Paid Income
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                ₹{totalPaidIncome.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/20 flex items-center justify-between text-xs text-sky-100">
              <span className="text-[11px] font-medium">Disbursed to Bank Account</span>
              <span className="font-black text-white flex items-center gap-1 group-hover:underline">
                <span>Statement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Card 3: Pending Income (Filled Radiant Rose & Coral Pink Card) */}
          <Link
            href="/dashboard/statement"
            className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white border-2 border-rose-300/50 shadow-xl shadow-rose-500/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-rose-500/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-44 h-44 bg-pink-300/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-xs">
                  Scheduled Payout
                </span>
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-rose-100 block mb-1">
                Pending Income
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                ₹{pendingPayoutIncome.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/20 flex items-center justify-between text-xs text-rose-100">
              <span className="text-[11px] font-medium">Upcoming Weekly Cycle</span>
              <span className="font-black text-white flex items-center gap-1 group-hover:underline">
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </div>

        {/* ========================================================
            4. FOUR FULLY COLOR-FILLED VOLUME & ANALYTICS CARDS (Emerald, Rose, Purple, Sky Blue)
           ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Downline Associates (Filled Vibrant Emerald & Teal) */}
          <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-[#005a2c] text-white border-2 border-emerald-300/60 shadow-xl shadow-emerald-700/25 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-700/35 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-300/20 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
                  Downline Team
                </span>
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-xs border border-white/30">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-center my-1 shadow-inner">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white block tracking-tight drop-shadow-sm">
                  {totalTeamCount}
                </span>
                <span className="text-[10px] uppercase font-black text-emerald-100 tracking-wider block mt-0.5">
                  Total Associates in Network
                </span>
              </div>
            </div>

            <div className="mt-3.5 text-center text-xs text-emerald-100 font-black pt-2.5 border-t border-white/20 truncate">
              👥 Active Team Size
            </div>
          </div>

          {/* Card 2: Today's Total PV (Filled Vibrant Rose & Pink) */}
          <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 text-white border-2 border-pink-300/60 shadow-xl shadow-pink-600/25 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-pink-600/35 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-300/20 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-pink-100">
                  Today&apos;s Total PV
                </span>
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-xs border border-white/30">
                  <Zap className="w-4 h-4 animate-pulse" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-center my-1 shadow-inner">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white block tracking-tight drop-shadow-sm">
                  {todayTotalPv}
                </span>
                <span className="text-[10px] uppercase font-black text-pink-100 tracking-wider block mt-0.5">
                  Total PV Generated Today
                </span>
              </div>
            </div>

            <div className="mt-3.5 text-center text-xs text-pink-100 font-black pt-2.5 border-t border-white/20 truncate">
              ⚡ Today&apos;s Live Volume
            </div>
          </div>

          {/* Card 3: Weekly Total PV (Filled Royal Amethyst & Purple) */}
          <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white border-2 border-purple-300/60 shadow-xl shadow-purple-600/25 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-600/35 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-300/20 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-purple-100">
                  Weekly Total PV
                </span>
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-xs border border-white/30">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-center my-1 shadow-inner">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white block tracking-tight drop-shadow-sm">
                  {weeklyTotalPv}
                </span>
                <span className="text-[10px] uppercase font-black text-purple-100 tracking-wider block mt-0.5">
                  Total PV This Week
                </span>
              </div>
            </div>

            <div className="mt-3.5 text-center text-xs text-purple-100 font-black pt-2.5 border-t border-white/20 truncate">
              📅 Current Cycle Volume
            </div>
          </div>

          {/* Card 4: Carry Forward PV (Filled Deep Ocean Azure & Blue) */}
          <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-cyan-600 via-blue-600 to-teal-700 text-white border-2 border-cyan-300/60 shadow-xl shadow-cyan-600/25 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-600/35 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-300/20 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-100">
                  Carry Forward PV
                </span>
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-xs border border-white/30">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 my-1">
                <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-center shadow-inner">
                  <span className="text-[10px] font-black uppercase text-cyan-100 block">Left</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-white">{carryLeftPv}</span>
                  <span className="text-[9px] text-cyan-100 block font-bold">PV Available</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-center shadow-inner">
                  <span className="text-[10px] font-black uppercase text-cyan-100 block">Right</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-white">{carryRightPv}</span>
                  <span className="text-[9px] text-cyan-100 block font-bold">PV Available</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 text-center text-xs text-cyan-100 font-black pt-2.5 border-t border-white/20 truncate">
              Carry Balance Available
            </div>
          </div>
        </div>

        {/* ========================================================
            5. ACCOUNT CREDENTIALS & COMPLIANCE (4 Colorful Filled Pods)
           ======================================================== */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border-2 border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Account Credentials & Daily Boundaries
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Verification credentials, daily capping limits, and direct upline hierarchy
              </p>
            </div>
            <Link
              href="/dashboard/kyc"
              className="text-xs font-black text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>Manage KYC</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Activation Date (Emerald Filled) */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-100">Activation Date</span>
              </div>
              <div className="font-mono font-bold text-sm text-white mt-1">
                {user?.activationDate
                  ? new Date(user.activationDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : user?.joinedDate
                  ? new Date(user.joinedDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Verified"}
              </div>
              <span className="text-[10px] text-emerald-200 font-medium">Account Registration</span>
            </div>

            {/* KYC Status (Purple Filled) */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md shadow-purple-600/20 hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-purple-100">KYC Compliance</span>
              </div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase shadow-2xs ${
                    user?.kycStatus === "VERIFIED"
                      ? "bg-emerald-400 text-emerald-950"
                      : user?.kycStatus === "PENDING"
                      ? "bg-amber-300 text-amber-950"
                      : user?.kycStatus === "REJECTED"
                      ? "bg-rose-300 text-rose-950"
                      : "bg-white/20 text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {user?.kycStatus || "NOT SUBMITTED"}
                </span>
              </div>
              <span className="text-[10px] text-purple-200 font-medium block mt-1">Aadhaar, PAN, Bank</span>
            </div>

            {/* Daily Capping (Sky Blue Filled) */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 text-white shadow-md shadow-sky-600/20 hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-sky-100">Daily Capping Limit</span>
              </div>
              <div className="font-mono font-black text-sm text-white mt-1">
                ₹{(user?.dailyCapping || (isUserActive ? 1000 : 0)).toLocaleString("en-IN")} / Day
              </div>
              <span className="text-[10px] text-sky-200 font-medium">Based on Personal PV rank</span>
            </div>

            {/* Direct Sponsor (Rose Filled) */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-600/20 hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-rose-100">Direct Sponsor</span>
              </div>
              <div className="font-mono font-black text-sm text-white mt-1 truncate">
                {user?.sponsorId || "DIRECT"}
              </div>
              <span className="text-[10px] text-rose-200 font-medium truncate block">
                {user?.sponsorName || "Direct Upline Master"}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            6. RECENT FINANCIAL STATEMENT (Accordion / Click to Open)
           ======================================================== */}
        <div className="rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => setIsStatementOpen((prev) => !prev)}
            className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#006d36] text-white flex items-center justify-center font-bold shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Recent Financial Statement
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-500 text-white shadow-xs">
                    {transactions.length} entries
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Click to {isStatementOpen ? "hide" : "view"} recent binary pair match bonuses, payout settlements, and ledger entries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#006d36] hidden sm:inline">
                {isStatementOpen ? "Click to Collapse" : "Click to Open"}
              </span>
              <div
                className={`p-2.5 rounded-xl transition-all duration-300 shadow-xs ${
                  isStatementOpen
                    ? "rotate-180 bg-[#006d36] text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </button>

          {isStatementOpen && (
            <div className="p-6 sm:p-8 pt-0 border-t-2 border-slate-100 animate-fadeIn">
              <div className="flex items-center justify-between my-4">
                <span className="text-xs text-slate-500 font-bold">
                  Showing latest transactions
                </span>
                <Link
                  href="/dashboard/statement"
                  className="text-xs font-black text-[#006d36] hover:underline flex items-center gap-1"
                >
                  <span>View Full Statement Page</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {transactions.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500 flex flex-col items-center gap-3 bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-400" />
                  <span>No transactions recorded yet. Place orders or build your team to earn 1:1 pair bonuses.</span>
                  <Link
                    href="/dashboard/store"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#006d36] to-emerald-600 text-white font-black text-xs shadow-sm"
                  >
                    Browse Store Products
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider font-black text-[10px]">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.slice(0, 8).map((tx) => {
                        const isCredit = tx.type !== "WITHDRAWAL";
                        return (
                          <tr key={tx.id} className="hover:bg-emerald-50/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-slate-500 font-bold">
                              {tx.date
                                ? new Date(tx.date).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {tx.description}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase shadow-xs ${
                                  isCredit
                                    ? "bg-emerald-100 text-[#006d36] border border-emerald-300"
                                    : "bg-rose-100 text-rose-700 border border-rose-300"
                                }`}
                              >
                                {tx.type.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td
                              className={`py-3.5 px-4 text-right font-mono font-black text-sm ${
                                isCredit ? "text-[#006d36]" : "text-rose-600"
                              }`}
                            >
                              {isCredit ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
}
