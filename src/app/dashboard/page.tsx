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
  Network,
  ShoppingBag,
  FileText,
  FileCheck,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  Zap,
  TrendingUp,
  Share2,
  Flame,
  Layers,
  ArrowUpRight,
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
  let rankGlowColor = "from-rose-500/25 to-orange-500/10";
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
            1. 3D GLOSS ASSOCIATE PROFILE HEADER (Avatar, Name, ID, Rank, Status)
           ======================================================== */}
        <div className="bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/60 rounded-3xl p-5 sm:p-6 border-2 border-emerald-300/80 shadow-[0_12px_35px_rgba(16,185,129,0.14)] hover:shadow-[0_18px_45px_rgba(16,185,129,0.22)] transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          {/* Ambient 3D Glowing Lights */}
          <div className={`absolute -top-12 -left-12 w-56 h-56 rounded-full bg-gradient-to-br ${rankGlowColor} blur-2xl pointer-events-none`} />
          <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-teal-400/15 to-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 sm:gap-5 relative z-10">
            {/* 3D Floating Avatar with Multi-layer Glow */}
            <div className="relative shrink-0 group">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-[0_8px_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#006d36] via-[#005228] to-[#013317] text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-[0_8px_22px_rgba(0,109,54,0.35)] border-2 border-emerald-400/50 group-hover:scale-105 transition-transform duration-300">
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
                {/* 3D Member ID with Copy Action */}
                <button
                  type="button"
                  onClick={handleCopyMemberId}
                  title="Click to copy Member ID"
                  className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-white hover:bg-emerald-50 text-[#006d36] border-2 border-emerald-300 shadow-[0_4px_0_#10b981] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer group"
                >
                  <span>{user?.memberId}</span>
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                  )}
                </button>

                {/* 3D Radiant Rank Badge */}
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
                      ? "bg-emerald-500 text-white"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isUserActive ? "bg-emerald-100 animate-pulse" : "bg-rose-100"
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

          {/* 3D Tactile Action Shortcuts */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto relative z-10">
            <Link
              href="/dashboard/profile"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border-2 border-slate-200 shadow-[0_4px_0_#cbd5e1] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Profile</span>
            </Link>
            <Link
              href="/dashboard/tree"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-100 hover:from-emerald-100 hover:to-teal-200 text-[#006d36] font-bold text-xs border-2 border-emerald-300 shadow-[0_4px_0_#6ee7b7] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Network className="w-3.5 h-3.5 text-[#006d36]" />
              <span>Tree</span>
            </Link>
            <Link
              href="/dashboard/store"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#006d36] via-[#005a2c] to-emerald-700 hover:brightness-110 text-white font-bold text-xs border border-emerald-400/40 shadow-[0_4px_0_#004d25] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Store</span>
            </Link>
          </div>
        </div>

        {/* ========================================================
            2. 3D DUAL-WING REFERRAL PODS (PLACED DIRECTLY ABOVE INCOME)
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Left Wing Referral 3D Card */}
          <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-teal-50 border-2 border-emerald-300/90 shadow-[0_10px_30px_rgba(16,185,129,0.15)] hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(16,185,129,0.25)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#006d36] to-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-emerald-700/30 border border-emerald-300">
                  LEFT
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>Left Team Placement Link</span>
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  </h3>
                  <span className="text-[11px] text-emerald-800/80 font-medium">Auto places new registered associate in Left Leg</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1 p-2 bg-white rounded-2xl border-2 border-emerald-200 shadow-sm">
              <input
                type="text"
                readOnly
                value={leftReferralUrl}
                className="flex-1 bg-transparent text-xs font-mono font-bold text-emerald-900 px-2 outline-hidden truncate"
              />
              <button
                type="button"
                onClick={handleCopyLeft}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#006d36] to-emerald-600 hover:from-[#005025] hover:to-emerald-700 text-white text-xs font-black shadow-[0_4px_0_#004d25] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedLeft ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Wing Referral 3D Card */}
          <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-indigo-500/10 via-indigo-50 to-purple-50 border-2 border-indigo-300/90 shadow-[0_10px_30px_rgba(99,102,241,0.15)] hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(99,102,241,0.25)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-700/30 border border-indigo-300">
                  RIGHT
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>Right Team Placement Link</span>
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  </h3>
                  <span className="text-[11px] text-indigo-800/80 font-medium">Auto places new registered associate in Right Leg</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1 p-2 bg-white rounded-2xl border-2 border-indigo-200 shadow-sm">
              <input
                type="text"
                readOnly
                value={rightReferralUrl}
                className="flex-1 bg-transparent text-xs font-mono font-bold text-indigo-900 px-2 outline-hidden truncate"
              />
              <button
                type="button"
                onClick={handleCopyRight}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-xs font-black shadow-[0_4px_0_#3730a3] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedRight ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. THREE 3D VIBRANT INCOME HERO CARDS (Emerald, Sapphire, Sunset Amber)
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Lifetime Income (3D Cyber-Emerald Prism Card) */}
          <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#005a2c] via-[#004820] to-[#022c13] text-white border-2 border-emerald-400/50 shadow-[0_14px_35px_rgba(0,109,54,0.35)] hover:-translate-y-2 hover:shadow-[0_22px_45px_rgba(0,109,54,0.45)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
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

          {/* Card 2: Total Paid Income (3D Royal Sapphire Ocean Card) */}
          <Link
            href="/dashboard/statement"
            className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700 text-white border-2 border-sky-300/50 shadow-[0_14px_35px_rgba(37,99,235,0.35)] hover:-translate-y-2 hover:shadow-[0_22px_45px_rgba(37,99,235,0.45)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
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

          {/* Card 3: Pending Income (3D Radiant Sunset Amber & Orange Card) */}
          <Link
            href="/dashboard/statement"
            className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white border-2 border-amber-300/50 shadow-[0_14px_35px_rgba(245,158,11,0.35)] hover:-translate-y-2 hover:shadow-[0_22px_45px_rgba(245,158,11,0.45)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-44 h-44 bg-yellow-300/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-xs">
                  Scheduled Payout
                </span>
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-amber-100 block mb-1">
                Pending Income
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                ₹{pendingPayoutIncome.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/20 flex items-center justify-between text-xs text-amber-100">
              <span className="text-[11px] font-medium">Upcoming Weekly Cycle</span>
              <span className="font-black text-white flex items-center gap-1 group-hover:underline">
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </div>

        {/* ========================================================
            4. BINARY VOLUME & TEAM ANALYTICS (4 Rich 3D Visual Cards)
           ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Network className="w-5 h-5 text-[#006d36]" />
              <span>Binary Team Analytics & PV Volume</span>
            </h2>
            <Link
              href="/dashboard/tree"
              className="text-xs font-black text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>Genealogy Tree</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Downline Associates (3D Emerald & Indigo Card) */}
            <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 border-2 border-emerald-200/90 shadow-[0_8px_25px_rgba(16,185,129,0.12)] hover:-translate-y-1.5 hover:shadow-[0_16px_35px_rgba(16,185,129,0.22)] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Downline Team
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006d36] flex items-center justify-center shadow-xs border border-emerald-300">
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 my-1">
                  <div className="p-3 rounded-2xl bg-white border-2 border-emerald-200 text-center shadow-sm">
                    <span className="text-[10px] font-black uppercase text-[#006d36] block">Left</span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-[#006d36]">{leftTeamCount}</span>
                    <span className="text-[9px] text-slate-500 block font-bold">Members</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border-2 border-indigo-200 text-center shadow-sm">
                    <span className="text-[10px] font-black uppercase text-indigo-700 block">Right</span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-indigo-700">{rightTeamCount}</span>
                    <span className="text-[9px] text-slate-500 block font-bold">Members</span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 text-center text-xs text-slate-600 font-bold pt-2.5 border-t border-slate-200 truncate">
                Total: <strong className="text-slate-900 font-black">{totalTeamCount}</strong> Associates
              </div>
            </div>

            {/* Card 2: Today's Total PV (3D Electric Sunburst Amber Card) */}
            <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white border-2 border-amber-300/60 shadow-[0_10px_30px_rgba(245,158,11,0.25)] hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(245,158,11,0.35)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-100">
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
                  <span className="text-[10px] uppercase font-black text-amber-100 tracking-wider block mt-0.5">
                    Total PV Generated Today
                  </span>
                </div>
              </div>

              <div className="mt-3.5 text-center text-xs text-amber-100 font-black pt-2.5 border-t border-white/20 truncate">
                ⚡ Today&apos;s Live Volume
              </div>
            </div>

            {/* Card 3: Weekly Total PV (3D Royal Amethyst Purple Card) */}
            <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white border-2 border-purple-300/60 shadow-[0_10px_30px_rgba(139,92,246,0.25)] hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(139,92,246,0.35)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
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

            {/* Card 4: Carry Forward PV (3D Deep Ocean Azure Card) */}
            <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-cyan-600 via-blue-600 to-teal-700 text-white border-2 border-cyan-300/60 shadow-[0_10px_30px_rgba(6,182,212,0.25)] hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(6,182,212,0.35)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
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
                  <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-center shadow-inner">
                    <span className="text-[10px] font-black uppercase text-cyan-100 block">Left</span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-white">{carryLeftPv}</span>
                    <span className="text-[9px] text-cyan-100 block font-bold">PV Available</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-center shadow-inner">
                    <span className="text-[10px] font-black uppercase text-cyan-100 block">Right</span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-white">{carryRightPv}</span>
                    <span className="text-[9px] text-cyan-100 block font-bold">PV Available</span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 text-center text-xs text-cyan-100 font-black pt-2.5 border-t border-white/20 truncate">
                ⏳ 1:1 Matching Ready
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. ACCOUNT CREDENTIALS & COMPLIANCE (4 Colorful 3D Pods)
           ======================================================== */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-slate-50 to-emerald-50/20 border-2 border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
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
            {/* Activation Date (Emerald Pod) */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/50 border-2 border-emerald-200/90 shadow-xs hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-2 text-slate-700 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#006d36] to-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-[#006d36]">Activation Date</span>
              </div>
              <div className="font-mono font-bold text-sm text-slate-900 mt-1">
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
              <span className="text-[10px] text-slate-500 font-medium">Account Registration</span>
            </div>

            {/* KYC Status (Amethyst Purple Pod) */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-100/50 border-2 border-purple-200/90 shadow-xs hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-2 text-slate-700 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-purple-800">KYC Compliance</span>
              </div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase shadow-2xs ${
                    user?.kycStatus === "VERIFIED"
                      ? "bg-emerald-500 text-white"
                      : user?.kycStatus === "PENDING"
                      ? "bg-amber-500 text-white"
                      : user?.kycStatus === "REJECTED"
                      ? "bg-rose-500 text-white"
                      : "bg-slate-300 text-slate-800"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {user?.kycStatus || "NOT SUBMITTED"}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">Aadhaar, PAN, Bank</span>
            </div>

            {/* Daily Capping (Sapphire Sky Pod) */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100/50 border-2 border-sky-200/90 shadow-xs hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-2 text-slate-700 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-sky-800">Daily Capping Limit</span>
              </div>
              <div className="font-mono font-black text-sm text-sky-800 mt-1">
                ₹{(user?.dailyCapping || (isUserActive ? 1000 : 0)).toLocaleString("en-IN")} / Day
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Based on Personal PV rank</span>
            </div>

            {/* Direct Sponsor (Warm Gold Pod) */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100/50 border-2 border-amber-200/90 shadow-xs hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-2 text-slate-700 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-800">Direct Sponsor</span>
              </div>
              <div className="font-mono font-black text-sm text-slate-900 mt-1 truncate">
                {user?.sponsorId || "DIRECT"}
              </div>
              <span className="text-[10px] text-slate-500 font-medium truncate block">
                {user?.sponsorName || "Direct Upline Master"}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            6. RECENT FINANCIAL STATEMENT (3D Accordion / Click to Open)
           ======================================================== */}
        <div className="rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => setIsStatementOpen((prev) => !prev)}
            className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#006d36] to-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-700/20 border border-emerald-300">
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
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#006d36] to-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-700/25"
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
