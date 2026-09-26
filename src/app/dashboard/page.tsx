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
import IndiaStateMap from "@/components/dashboard/IndiaStateMap";

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
  const [todayIncome, setTodayIncome] = useState(0);
  const [thisWeekIncome, setThisWeekIncome] = useState(0);

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
        const meRes = await fetch("/api/auth/me?tx=true", { cache: "no-store" });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.success && meData.user) {
            setUser(meData.user);
            const txList: Transaction[] = meData.transactions || [];
            setTransactions(txList);
            setTotalTeamCount(meData.user.totalTeamCount || 0);

            // Compute Today's & This Week's Income from transactions
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const dayOfWeek = now.getDay();
            const diffToMonday = (dayOfWeek + 6) % 7;
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday).getTime();

            const tIncome = txList
              .filter((tx: any) => {
                if (tx.type === "WITHDRAWAL") return false;
                const time = new Date(tx.date || tx.created_at).getTime();
                return time >= startOfToday;
              })
              .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);

            const wIncome = txList
              .filter((tx: any) => {
                if (tx.type === "WITHDRAWAL") return false;
                const time = new Date(tx.date || tx.created_at).getTime();
                return time >= startOfWeek;
              })
              .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);

            setTodayIncome(tIncome);
            setThisWeekIncome(wIncome);
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

  // Profile completion percentage
  const profileFields = [
    user?.avatarUrl,
    user?.fullName,
    user?.mobile,
    user?.email,
    user?.address,
    user?.pincode,
    user?.city,
    user?.state,
    user?.nomineeName,
    user?.nomineeRelation,
  ];
  const filledProfileFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((filledProfileFields / 10) * 100);

  if (loading) {
    return (
      <MemberLayout user={user}>
        <div className="space-y-4 max-w-7xl mx-auto pb-16 animate-pulse font-sans">
          <div className="bg-white/80 rounded-2xl p-4 h-20 border border-slate-200/60" />
          <div className="bg-white/80 rounded-2xl p-4 h-16 border border-slate-200/60" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="h-28 bg-white/80 rounded-2xl border border-slate-200/60" />
            <div className="h-28 bg-white/80 rounded-2xl border border-slate-200/60" />
            <div className="h-28 bg-white/80 rounded-2xl border border-slate-200/60" />
            <div className="h-28 bg-white/80 rounded-2xl border border-slate-200/60" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="h-28 bg-white/80 rounded-2xl border border-slate-200/60" />
            <div className="h-28 bg-white/80 rounded-2xl border border-slate-200/60" />
            <div className="h-28 bg-white/80 rounded-2xl border border-slate-200/60" />
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 sm:space-y-7 max-w-7xl mx-auto pb-20 animate-fadeIn font-sans">
        {/* ========================================================
            1. COMPACT PROFESSIONAL NEUMORPHIC PROFILE HEADER
           ======================================================== */}
        <div className="bg-white/95 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md">
          {/* Subtle Ambient Light Orb */}
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-emerald-100/40 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
            {/* Avatar with Compact 3D Ring */}
            <div className="relative shrink-0 group">
              <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-emerald-100 to-white shadow-xs">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#006d36] via-[#005228] to-[#013317] text-white font-heading font-black text-xl sm:text-2xl flex items-center justify-center shadow-sm shadow-emerald-900/30 group-hover:scale-105 transition-transform duration-300">
                    {user?.fullName?.charAt(0) || "A"}
                  </div>
                )}
              </div>
              {/* Active Pulse Pill */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                {isUserActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white shadow-xs ${
                    isUserActive ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              </span>
            </div>

            <div className="space-y-1">
              {/* Full Name */}
              <h1 className="text-lg sm:text-xl font-heading font-black text-[#0f172a] tracking-tight">
                {user?.fullName}
              </h1>

              {/* Badges Strip */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Member ID with Copy Action */}
                <button
                  type="button"
                  onClick={handleCopyMemberId}
                  title="Click to copy Member ID"
                  className="bg-slate-100 hover:bg-slate-200 font-mono text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="text-[#006d36]">{user?.memberId}</span>
                  {copiedId ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-[#006d36]" />
                  )}
                </button>

                {/* Rank Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${rankBadgeColor} shadow-xs`}
                >
                  <RankIcon className="w-3 h-3" />
                  <span>{rankName} ({personalPv} PV)</span>
                </span>

                {/* Active / Inactive Status Pill */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase shadow-2xs ${
                    isUserActive
                      ? "bg-emerald-50 text-[#006d36] border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{isUserActive ? "Active" : "Inactive (<100 PV)"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Shortcuts */}
          <div className="flex items-center gap-2 w-full sm:w-auto relative z-10">
            <Link
              href="/dashboard/profile"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Profile</span>
            </Link>
            <Link
              href="/dashboard/store"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer bg-[#006d36] hover:bg-[#005025] text-white shadow-xs transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Store</span>
            </Link>
          </div>
        </div>

        {/* ========================================================
            2. COMPACT UNIFIED DUAL-WING REFERRAL BAR
           ======================================================== */}
        <div className="bg-white/95 rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Left Placement Wing */}
            <div className="flex-1 flex items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#006d36] text-white shrink-0">
                  LEFT
                </span>
                <span className="text-xs font-mono font-bold text-emerald-950 truncate">
                  {leftReferralUrl || "https://..."}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyLeft}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#006d36] hover:bg-[#005025] text-white flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                {copiedLeft ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLeft ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Right Placement Wing */}
            <div className="flex-1 flex items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/60">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shrink-0">
                  RIGHT
                </span>
                <span className="text-xs font-mono font-bold text-indigo-950 truncate">
                  {rightReferralUrl || "https://..."}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyRight}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                {copiedRight ? <Check className="w-3.5 h-3.5 text-indigo-200" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRight ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. AESTHETIC COMPACT FINANCIAL KPI GRID (4 CARDS)
           ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Earnings & Wallet */}
          <div className="bg-white/95 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800">
                Total Earnings
              </span>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#10b981] text-white flex items-center justify-center shadow-sm shadow-emerald-700/25">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-heading font-black text-[#0f172a] tracking-tight">
                ₹{user?.totalEarnings?.toLocaleString("en-IN") || 0}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
                <span className="text-slate-500">Wallet:</span>
                <span className="text-[#006d36] font-mono">₹{user?.walletBalance?.toLocaleString("en-IN") || 0}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Paid Income */}
          <Link
            href="/dashboard/statement"
            className="bg-white/95 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-cyan-800">
                Total Paid
              </span>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0891b2] to-[#06b6d4] text-white flex items-center justify-center shadow-sm shadow-cyan-700/25">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-heading font-black text-[#0f172a] tracking-tight">
                ₹{totalPaidIncome.toLocaleString("en-IN")}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
                <span className="text-slate-500">Pending:</span>
                <span className="text-rose-600 font-mono">₹{pendingPayoutIncome.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </Link>

          {/* Card 3: Today's Income */}
          <div className="bg-white/95 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-800">
                Today&apos;s Income
              </span>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#d97706] to-[#f59e0b] text-white flex items-center justify-center shadow-sm shadow-amber-600/25">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-heading font-black text-[#0f172a] tracking-tight">
                ₹{todayIncome.toLocaleString("en-IN")}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-amber-700">
                <span>⚡ Live Daily Cycle</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Card 4: This Week's Income */}
          <div className="bg-white/95 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-purple-800">
                This Week
              </span>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] text-white flex items-center justify-center shadow-sm shadow-purple-600/25">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-heading font-black text-[#0f172a] tracking-tight">
                ₹{thisWeekIncome.toLocaleString("en-IN")}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-purple-700">
                <span>📅 Current Cycle</span>
                <span>Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. COMPACT NETWORK & PV PERFORMANCE HUB (3 CARDS)
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Pod 1: Downline Associates */}
          <Link
            href="/dashboard/community/team"
            className="bg-white/95 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-blue-800">
                Network Team
              </span>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1d4ed8] to-[#60a5fa] text-white flex items-center justify-center shadow-sm shadow-blue-600/25">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-heading font-black text-[#0f172a]">
                  {totalTeamCount}
                </span>
                <span className="text-[11px] text-slate-500 font-bold">Associates</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] sm:text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  Left: {leftTeamCount}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200/60">
                  Right: {rightTeamCount}
                </span>
              </div>
            </div>
          </Link>

          {/* Pod 2: Carry Forward PV */}
          <div className="bg-white/95 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-indigo-800">
                Carry Forward PV
              </span>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4338ca] to-[#6366f1] text-white flex items-center justify-center shadow-sm shadow-indigo-600/25">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-heading font-black text-[#0f172a]">
                  {carryLeftPv + carryRightPv}
                </span>
                <span className="text-[11px] text-slate-500 font-bold">PV Available</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] sm:text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200/60">
                  Left: {carryLeftPv} PV
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200/60">
                  Right: {carryRightPv} PV
                </span>
              </div>
            </div>
          </div>

          {/* Pod 3: PV Volume & Matching */}
          <div className="bg-white/95 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-teal-800">
                PV Matched
              </span>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0f766e] to-[#14b8a6] text-white flex items-center justify-center shadow-sm shadow-teal-700/25">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-heading font-black text-[#0f172a]">
                  {todayMatchedPv}
                </span>
                <span className="text-[11px] text-slate-500 font-bold">PV Today</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-600">
                <span>Weekly Matched:</span>
                <span className="text-[#0f766e] font-mono font-black">{weeklyMatchedPv} PV</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. ACCOUNT CREDENTIALS & BOUNDARIES (COMPACT 4 CARDS)
           ======================================================== */}
        <div className="bg-white/95 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs">
          <div className="mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-heading font-black text-[#0f172a]">
                Account Status & Limits
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Compliance & Limits
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Joining Date */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-1 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-[#006d36]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Joining Date</span>
              </div>
              <div className="font-mono font-black text-xs sm:text-sm text-[#0f172a]">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-IN", {
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
                  : "—"}
              </div>
            </div>

            {/* KYC Status */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-1 text-slate-600">
                <FileCheck className="w-3.5 h-3.5 text-[#0891b2]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">KYC Status</span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-2xs ${
                    user?.kycStatus === "VERIFIED"
                      ? "bg-emerald-500 text-white"
                      : user?.kycStatus === "PENDING"
                      ? "bg-amber-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{user?.kycStatus || "PENDING"}</span>
                </span>
              </div>
            </div>

            {/* Daily Capping */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-1 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Daily Capping</span>
              </div>
              <div className="font-mono font-black text-xs sm:text-sm text-[#0f172a]">
                ₹{(user?.dailyCapping || (isUserActive ? 1000 : 0)).toLocaleString("en-IN")} / Day
              </div>
            </div>

            {/* Profile Completion */}
            <Link
              href="/dashboard/profile"
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex flex-col justify-between group cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1 text-slate-600">
                  <Sparkles className="w-3.5 h-3.5 text-[#7c3aed]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Profile</span>
                </div>
                <span className="text-[10px] font-mono font-black text-[#7c3aed]">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </Link>
          </div>
        </div>

        {/* ========================================================
            6. PAN-INDIA ASSOCIATES GEOGRAPHIC DISTRIBUTION MAP
           ======================================================== */}
        <IndiaStateMap scope="member" />

        {/* ========================================================
            7. RECENT FINANCIAL STATEMENT ACCORDION
           ======================================================== */}
        <div className="bg-white/95 rounded-2xl overflow-hidden transition-all duration-300 border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setIsStatementOpen((prev) => !prev)}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1e3a8a] via-[#4338ca] to-[#06b6d4] text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-700/20">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-heading font-black text-[#0f172a]">
                    Recent Financial Statement
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-800 border border-blue-500/25">
                    {transactions.length} entries
                  </span>
                </div>
                <p className="text-[11px] text-[#64748b] font-medium mt-0.5">
                  Click to {isStatementOpen ? "hide" : "view"} recent binary pair bonuses and ledger entries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 hidden sm:inline">
                {isStatementOpen ? "Collapse" : "Open"}
              </span>
              <div
                className={`p-2 rounded-lg bg-slate-100 transition-all duration-300 ${
                  isStatementOpen ? "rotate-180 text-blue-700" : "text-[#64748b]"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </button>

          {isStatementOpen && (
            <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 animate-fadeIn">
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
