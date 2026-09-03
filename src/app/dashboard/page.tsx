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

  // Today & Weekly PV and Matched PV
  const [todayLeftPv, setTodayLeftPv] = useState(0);
  const [todayRightPv, setTodayRightPv] = useState(0);
  const [weeklyLeftPv, setWeeklyLeftPv] = useState(0);
  const [weeklyRightPv, setWeeklyRightPv] = useState(0);
  const [todayMatchedPv, setTodayMatchedPv] = useState(0);
  const [weeklyMatchedPv, setWeeklyMatchedPv] = useState(0);

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
        setLoading(false);

        // 2. Fetch secondary team & statement summaries in parallel
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
                setTodayMatchedPv(teamData.pvStats.todayMatchedPv || 0);
                setWeeklyMatchedPv(teamData.pvStats.weeklyMatchedPv || 0);
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
  let rankBadgeColor = "from-rose-500 via-red-600 to-pink-600 text-white shadow-rose-500/30";
  let rankIcon = AlertCircle;

  if (personalPv >= 1000) {
    rankName = "Diamond";
    rankBadgeColor = "from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-cyan-500/40";
    rankIcon = Sparkles;
  } else if (personalPv >= 500) {
    rankName = "Platinum";
    rankBadgeColor = "from-purple-600 via-violet-600 to-indigo-600 text-white shadow-purple-500/40";
    rankIcon = Award;
  } else if (personalPv >= 250) {
    rankName = "Gold";
    rankBadgeColor = "from-amber-500 via-yellow-500 to-orange-600 text-white shadow-amber-500/40";
    rankIcon = Award;
  } else if (personalPv >= 100) {
    rankName = "Silver";
    rankBadgeColor = "from-emerald-500 via-teal-500 to-green-600 text-white shadow-emerald-500/40";
    rankIcon = CheckCircle2;
  }

  const RankIcon = rankIcon;
  const carryLeftPv = user?.carryLeftPv ?? 0;
  const carryRightPv = user?.carryRightPv ?? 0;

  if (loading) {
    return (
      <MemberLayout user={user}>
        <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-pulse">
          <div className="neo-card rounded-3xl p-6 h-32 flex items-center justify-between" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-36 neo-card rounded-3xl" />
            <div className="h-36 neo-card rounded-3xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="h-44 neo-card rounded-3xl" />
            <div className="h-44 neo-card rounded-3xl" />
            <div className="h-44 neo-card rounded-3xl" />
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout user={user}>
      <div className="space-y-7 max-w-7xl mx-auto pb-20 animate-fadeIn font-sans">
        {/* ========================================================
            1. RADIANT COLORFUL NEUMORPHIC PROFILE HEADER
           ======================================================== */}
        <div className="neo-card-emerald rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-1/4 w-52 h-52 bg-green-300/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 sm:gap-6 relative z-10">
            {/* Avatar with Neumorphic 3D Ring */}
            <div className="relative shrink-0 group">
              <div className="p-1 rounded-[26px] neo-card bg-gradient-to-tr from-emerald-100 to-white shadow-md">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] bg-gradient-to-br from-[#006d36] via-[#005228] to-[#013317] text-white font-heading font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform duration-300">
                    {user?.fullName?.charAt(0) || "A"}
                  </div>
                )}
              </div>
              {/* Active Pulse Pill */}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                {isUserActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-5 w-5 border-2 border-white shadow-md ${
                    isUserActive ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              </span>
            </div>

            <div className="space-y-2">
              {/* Badges Strip */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Member ID with Copy Action */}
                <button
                  type="button"
                  onClick={handleCopyMemberId}
                  title="Click to copy Member ID"
                  className="neo-btn-secondary font-mono text-xs font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer group bg-white/90"
                >
                  <span className="text-[#006d36]">{user?.memberId}</span>
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#006d36] group-hover:scale-110 transition-transform" />
                  )}
                </button>

                {/* Rank Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r ${rankBadgeColor} shadow-md`}
                >
                  <RankIcon className="w-3.5 h-3.5" />
                  <span>{rankName} ({personalPv} PV)</span>
                </span>

                {/* Active / Inactive Status Pill */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-xs ${
                    isUserActive
                      ? "bg-emerald-500 text-white shadow-emerald-500/25"
                      : "bg-rose-500 text-white shadow-rose-500/25"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{isUserActive ? "Active" : "Inactive (<100 PV)"}</span>
                </span>
              </div>

              {/* Full Name */}
              <h1 className="text-xl sm:text-2xl font-heading font-black text-[#0f172a] tracking-tight">
                {user?.fullName}
              </h1>
            </div>
          </div>

          {/* Action Shortcuts */}
          <div className="flex items-center gap-3 w-full sm:w-auto relative z-10">
            <Link
              href="/dashboard/profile"
              className="neo-btn-secondary flex-1 sm:flex-none px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer bg-white"
            >
              <UserIcon className="w-4 h-4 text-[#64748b]" />
              <span>Profile</span>
            </Link>
            <Link
              href="/dashboard/store"
              className="neo-btn-primary flex-1 sm:flex-none px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-700/25"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Store</span>
            </Link>
          </div>
        </div>

        {/* ========================================================
            2. VIBRANT DUAL-WING REFERRAL LINK CARDS
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Wing Referral Card (Vibrant Emerald / Mint) */}
          <div className="neo-card-emerald rounded-[32px] p-5 sm:p-6 flex flex-col justify-between group relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#006d36] to-[#10b981] text-white flex items-center justify-center font-heading font-black text-xs shadow-md shadow-emerald-600/30">
                  LEFT
                </div>
                <div>
                  <h3 className="text-sm font-heading font-extrabold text-[#065f46] flex items-center gap-1.5">
                    <span>Left Team Placement Link</span>
                    <Share2 className="w-3.5 h-3.5 text-[#006d36]" />
                  </h3>
                  <span className="text-[11px] text-[#047857] font-medium">Auto-assigns direct recruits to Left Wing</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 p-2 neo-inset-emerald rounded-2xl relative z-10">
              <input
                type="text"
                readOnly
                value={leftReferralUrl}
                className="flex-1 bg-transparent text-xs font-mono font-bold text-[#064e3b] px-2 outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopyLeft}
                className="neo-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-emerald-700/30"
              >
                {copiedLeft ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Wing Referral Card (Vibrant Royal Violet / Indigo) */}
          <div className="neo-card-violet rounded-[32px] p-5 sm:p-6 flex flex-col justify-between group relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#4f46e5] to-[#8b5cf6] text-white flex items-center justify-center font-heading font-black text-xs shadow-md shadow-indigo-600/30">
                  RIGHT
                </div>
                <div>
                  <h3 className="text-sm font-heading font-extrabold text-[#5b21b6] flex items-center gap-1.5">
                    <span>Right Team Placement Link</span>
                    <Share2 className="w-3.5 h-3.5 text-[#6d28d9]" />
                  </h3>
                  <span className="text-[11px] text-[#6d28d9] font-medium">Auto-assigns direct recruits to Right Wing</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 p-2 neo-inset-purple rounded-2xl relative z-10">
              <input
                type="text"
                readOnly
                value={rightReferralUrl}
                className="flex-1 bg-transparent text-xs font-mono font-bold text-[#4c1d95] px-2 outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopyRight}
                className="neo-btn-indigo px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-indigo-600/30"
              >
                {copiedRight ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. THREE HERO INCOME STAT CARDS (JEWEL TONES)
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Lifetime Earnings (Emerald / Jade) */}
          <div className="neo-card-emerald rounded-[32px] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group neo-card-hover">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#006d36] to-[#10b981] text-white flex items-center justify-center shadow-lg shadow-emerald-700/30">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-[#006d36] border border-emerald-500/30 shadow-xs">
                  Lifetime Earnings
                </span>
              </div>

              <span className="text-[11px] font-black uppercase tracking-widest text-[#065f46] block mb-1">
                Total Income
              </span>
              <div className="text-3xl sm:text-4xl font-heading font-black text-[#006d36] tracking-tight">
                ₹{user?.totalEarnings?.toLocaleString("en-IN") || 0}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-emerald-500/20 flex items-center justify-between text-xs text-[#065f46]">
              <span>Withdrawable: <strong className="text-[#006d36] font-mono font-black">₹{user?.walletBalance?.toLocaleString("en-IN") || 0}</strong></span>
              <Link
                href="/dashboard/statement"
                className="hover:underline flex items-center gap-1 font-bold text-[#006d36]"
              >
                <span>Payouts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Total Paid Income (Electric Cyan / Glacial Ice) */}
          <Link
            href="/dashboard/statement"
            className="neo-card-cyan rounded-[32px] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group neo-card-hover"
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0891b2] to-[#06b6d4] text-white flex items-center justify-center shadow-lg shadow-cyan-700/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-800 border border-cyan-500/30 shadow-xs">
                  Settled Payout
                </span>
              </div>

              <span className="text-[11px] font-black uppercase tracking-widest text-[#0e7490] block mb-1">
                Total Paid Income
              </span>
              <div className="text-3xl sm:text-4xl font-heading font-black text-[#0e7490] tracking-tight">
                ₹{totalPaidIncome.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-cyan-500/20 flex items-center justify-between text-xs text-[#0e7490]">
              <span className="text-[11px]">Disbursed to Bank</span>
              <span className="font-bold text-[#0e7490] flex items-center gap-1 group-hover:underline">
                <span>Statement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Card 3: Pending Income (Sunset Coral / Tangerine) */}
          <Link
            href="/dashboard/statement"
            className="neo-card-coral rounded-[32px] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group neo-card-hover"
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-orange-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#fb923c] text-white flex items-center justify-center shadow-lg shadow-orange-600/30">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-800 border border-orange-500/30 shadow-xs">
                  Scheduled Payout
                </span>
              </div>

              <span className="text-[11px] font-black uppercase tracking-widest text-[#c2410c] block mb-1">
                Pending Income
              </span>
              <div className="text-3xl sm:text-4xl font-heading font-black text-[#c2410c] tracking-tight">
                ₹{pendingPayoutIncome.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-orange-500/20 flex items-center justify-between text-xs text-[#c2410c]">
              <span className="text-[11px]">Upcoming Cycle</span>
              <span className="font-bold text-[#ea580c] flex items-center gap-1 group-hover:underline">
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </div>

        {/* ========================================================
            4. FOUR DISTINCT COLORFUL VOLUME & ANALYTICS PODS
           ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Downline Associates (Royal Fuchsia / Magenta Orchid) */}
          <div className="neo-card-fuchsia rounded-[30px] p-5 sm:p-6 flex flex-col justify-between group neo-card-hover">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#86198f]">
                  Downline Team
                </span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#c026d3] to-[#e879f9] text-white flex items-center justify-center shadow-md shadow-fuchsia-600/25">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="p-4 rounded-2xl neo-inset-fuchsia text-center my-1">
                <span className="text-3xl font-heading font-black text-[#a21caf] block">
                  {totalTeamCount}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#86198f] tracking-wider block mt-0.5">
                  Total Associates in Network
                </span>
              </div>
            </div>

            <div className="mt-3 text-center text-xs text-[#86198f] font-bold pt-2 border-t border-fuchsia-500/20">
              👥 Active Team Size
            </div>
          </div>

          {/* Card 2: Today's Matched PV (Solar Amber Topaz) */}
          <div className="neo-card-amber rounded-[30px] p-5 sm:p-6 flex flex-col justify-between group neo-card-hover">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#92400e]">
                  Today&apos;s Matched PV
                </span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#d97706] to-[#f59e0b] text-white flex items-center justify-center shadow-md shadow-amber-600/25">
                  <Zap className="w-4 h-4" />
                </div>
              </div>

              <div className="p-4 rounded-2xl neo-inset-amber text-center my-1">
                <span className="text-3xl font-heading font-black text-amber-700 block">
                  {todayMatchedPv}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#92400e] tracking-wider block mt-0.5">
                  Matched PV Today
                </span>
              </div>
            </div>

            <div className="mt-3 text-center text-xs text-[#92400e] font-bold pt-2 border-t border-amber-500/20">
              ⚡ Today&apos;s 1:1 Matched Pairs
            </div>
          </div>

          {/* Card 3: Weekly Matched PV (Caribbean Teal / Aquamarine) */}
          <div className="neo-card-teal rounded-[30px] p-5 sm:p-6 flex flex-col justify-between group neo-card-hover">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#115e59]">
                  Weekly Matched PV
                </span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0d9488] to-[#14b8a6] text-white flex items-center justify-center shadow-md shadow-teal-600/25">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="p-4 rounded-2xl neo-inset-teal text-center my-1">
                <span className="text-3xl font-heading font-black text-[#0f766e] block">
                  {weeklyMatchedPv}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#115e59] tracking-wider block mt-0.5">
                  Matched PV This Week
                </span>
              </div>
            </div>

            <div className="mt-3 text-center text-xs text-[#115e59] font-bold pt-2 border-t border-teal-500/20">
              📅 Current Week Matched Pairs
            </div>
          </div>

          {/* Card 4: Carry Forward PV (Twilight Cobalt / Deep Indigo) */}
          <div className="neo-card-indigo rounded-[30px] p-5 sm:p-6 flex flex-col justify-between group neo-card-hover">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#3730a3]">
                  Carry Forward PV
                </span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4338ca] to-[#6366f1] text-white flex items-center justify-center shadow-md shadow-indigo-600/25">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 my-1">
                <div className="p-3 rounded-2xl neo-inset-teal text-center">
                  <span className="text-[10px] font-black uppercase text-[#115e59] block">Left</span>
                  <span className="text-xl font-heading font-black text-[#0f766e]">{carryLeftPv}</span>
                  <span className="text-[9px] text-[#0d9488] block font-bold">PV</span>
                </div>
                <div className="p-3 rounded-2xl neo-inset-purple text-center">
                  <span className="text-[10px] font-black uppercase text-[#5b21b6] block">Right</span>
                  <span className="text-xl font-heading font-black text-[#6d28d9]">{carryRightPv}</span>
                  <span className="text-[9px] text-[#7c3aed] block font-bold">PV</span>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center text-xs text-[#3730a3] font-bold pt-2 border-t border-indigo-500/20">
              ⚖️ Carry Balance Available
            </div>
          </div>
        </div>

        {/* ========================================================
            5. ACCOUNT CREDENTIALS & COMPLIANCE (COLORFUL PODS)
           ======================================================== */}
        <div className="neo-card rounded-[32px] p-6 sm:p-8 border border-white">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/80">
            <div>
              <h2 className="text-base sm:text-lg font-heading font-black text-[#0f172a]">
                Account Credentials & Daily Boundaries
              </h2>
              <p className="text-xs text-[#64748b] font-medium">
                Verification credentials, daily capping limits, and direct upline hierarchy
              </p>
            </div>
            <Link
              href="/dashboard/kyc"
              className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>Manage KYC</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Activation Date */}
            <div className="p-4 rounded-2xl neo-inset-emerald">
              <div className="flex items-center gap-2 mb-1.5">
                <Calendar className="w-4 h-4 text-[#006d36]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#065f46]">Activation Date</span>
              </div>
              <div className="font-mono font-black text-sm text-[#006d36] mt-1">
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
              <span className="text-[10px] text-[#047857] font-medium">Account Registration</span>
            </div>

            {/* KYC Status (Glacial Cyan) */}
            <div className="p-4 rounded-2xl neo-inset-cyan">
              <div className="flex items-center gap-2 mb-1.5">
                <FileCheck className="w-4 h-4 text-[#0891b2]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0e7490]">KYC Compliance</span>
              </div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase shadow-xs ${
                    user?.kycStatus === "VERIFIED"
                      ? "bg-emerald-500 text-white"
                      : user?.kycStatus === "PENDING"
                      ? "bg-amber-500 text-white"
                      : user?.kycStatus === "REJECTED"
                      ? "bg-rose-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {user?.kycStatus || "NOT SUBMITTED"}
                </span>
              </div>
              <span className="text-[10px] text-[#0e7490] font-medium block mt-1">Aadhaar, PAN, Bank</span>
            </div>

            {/* Daily Capping (Ruby Rose / Shield) */}
            <div className="p-4 rounded-2xl neo-inset-rose">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Daily Capping</span>
              </div>
              <div className="font-mono font-black text-sm text-rose-900 mt-1">
                ₹{(user?.dailyCapping || (isUserActive ? 1000 : 0)).toLocaleString("en-IN")} / Day
              </div>
              <span className="text-[10px] text-rose-700 font-medium">Based on PV rank</span>
            </div>

            {/* Direct Sponsor (Royal Violet / Purple) */}
            <div className="p-4 rounded-2xl neo-inset-purple">
              <div className="flex items-center gap-2 mb-1.5">
                <Users className="w-4 h-4 text-[#7c3aed]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#6d28d9]">Direct Sponsor</span>
              </div>
              <div className="font-mono font-black text-sm text-[#4c1d95] mt-1 truncate">
                {user?.sponsorId || "DIRECT"}
              </div>
              <span className="text-[10px] text-[#6d28d9] font-medium truncate block">
                {user?.sponsorName || "Direct Upline Master"}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            6. RECENT FINANCIAL STATEMENT ACCORDION
           ======================================================== */}
        <div className="neo-card rounded-[32px] overflow-hidden transition-all duration-300 border border-white">
          <button
            type="button"
            onClick={() => setIsStatementOpen((prev) => !prev)}
            className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-white/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1e3a8a] via-[#4338ca] to-[#06b6d4] text-white flex items-center justify-center font-bold shadow-md shadow-indigo-700/25">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-heading font-black text-[#0f172a]">
                    Recent Financial Statement
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-800 border border-blue-500/25">
                    {transactions.length} entries
                  </span>
                </div>
                <p className="text-xs text-[#64748b] font-medium mt-0.5">
                  Click to {isStatementOpen ? "hide" : "view"} recent binary pair bonuses and ledger entries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 hidden sm:inline">
                {isStatementOpen ? "Collapse" : "Open"}
              </span>
              <div
                className={`neo-btn-icon p-2.5 rounded-xl transition-all duration-300 ${
                  isStatementOpen ? "rotate-180 text-blue-700" : "text-[#64748b]"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </button>

          {isStatementOpen && (
            <div className="p-6 sm:p-8 pt-0 border-t border-gray-200/80 animate-fadeIn">
              <div className="flex items-center justify-between my-4">
                <span className="text-xs text-[#64748b] font-medium">
                  Showing latest transactions
                </span>
                <Link
                  href="/dashboard/statement"
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <span>View Full Statement Page</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {transactions.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#64748b] flex flex-col items-center gap-3 neo-inset rounded-2xl">
                  <Clock className="w-8 h-8 text-[#94a3b8]" />
                  <span>No transactions recorded yet. Place orders or build your team to earn 1:1 pair bonuses.</span>
                  <Link
                    href="/dashboard/store"
                    className="neo-btn-primary px-5 py-2.5 rounded-2xl font-bold text-xs"
                  >
                    Browse Store Products
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200/80 text-[#64748b] uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.slice(0, 8).map((tx) => {
                        const isCredit = tx.type !== "WITHDRAWAL";
                        return (
                          <tr key={tx.id} className="hover:bg-white/60 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-[#64748b]">
                              {tx.date
                                ? new Date(tx.date).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[#0f172a]">
                              {tx.description}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-xs ${
                                  isCredit
                                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                    : "bg-rose-500 text-white shadow-rose-500/20"
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
