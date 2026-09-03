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
            3. INCOME CARDS (MOBILE OPTIMIZED: PAID & PENDING SIDE-BY-SIDE)
           ======================================================== */}
        <div className="space-y-4 sm:space-y-5">
          {/* Top: Total Lifetime Earnings Card */}
          <div className="neo-card-emerald rounded-[32px] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group neo-card-hover">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#006d36] to-[#10b981] text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 shrink-0">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#065f46] block mb-0.5">
                  Total Lifetime Earnings
                </span>
                <div className="text-3xl sm:text-4xl font-heading font-black text-[#006d36] tracking-tight">
                  ₹{user?.totalEarnings?.toLocaleString("en-IN") || 0}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-emerald-500/20 text-xs text-[#065f46]">
              <span>Withdrawable: <strong className="text-[#006d36] font-mono font-black text-sm">₹{user?.walletBalance?.toLocaleString("en-IN") || 0}</strong></span>
              <Link
                href="/dashboard/statement"
                className="hover:underline flex items-center gap-1 font-bold text-[#006d36] neo-btn-secondary px-3.5 py-1.5 rounded-xl bg-white/80"
              >
                <span>Payouts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Row 1: Total Paid Income & Pending Income Side-by-Side (grid-cols-2 on Mobile!) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {/* Card: Total Paid Income (Glacial Ice Cyan) */}
            <Link
              href="/dashboard/statement"
              className="neo-card-cyan rounded-[26px] sm:rounded-[32px] p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden group neo-card-hover"
            >
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#0891b2] to-[#06b6d4] text-white flex items-center justify-center shadow-md shadow-cyan-700/25">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-800 border border-cyan-500/30">
                    Paid
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#0e7490] block mb-1">
                  Total Paid Income
                </span>
                <div className="text-xl sm:text-3xl font-heading font-black text-[#0e7490] tracking-tight">
                  ₹{totalPaidIncome.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-cyan-500/20 text-[10px] sm:text-xs text-[#0e7490] font-bold flex items-center justify-between">
                <span className="hidden sm:inline">Disbursed</span>
                <span className="flex items-center gap-1 group-hover:underline">
                  <span>Statement</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>

            {/* Card: Pending Income (Sunset Tangerine Coral) */}
            <Link
              href="/dashboard/statement"
              className="neo-card-coral rounded-[26px] sm:rounded-[32px] p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden group neo-card-hover"
            >
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-orange-400/20 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#fb923c] text-white flex items-center justify-center shadow-md shadow-orange-600/25">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-800 border border-orange-500/30">
                    Pending
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#c2410c] block mb-1">
                  Pending Income
                </span>
                <div className="text-xl sm:text-3xl font-heading font-black text-[#c2410c] tracking-tight">
                  ₹{pendingPayoutIncome.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-orange-500/20 text-[10px] sm:text-xs text-[#c2410c] font-bold flex items-center justify-between">
                <span className="hidden sm:inline">Scheduled</span>
                <span className="flex items-center gap-1 group-hover:underline">
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          </div>

          {/* Row 2: Today's & This Week's Income Side-by-Side (grid-cols-2 on Mobile & Desktop!) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {/* Today's Income Card */}
            <div className="neo-card-amber rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden group neo-card-hover">
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#d97706] to-[#f59e0b] text-white flex items-center justify-center shadow-md shadow-amber-600/30 shrink-0">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-900 border border-amber-500/30">
                    Today
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#92400e] block mb-0.5">
                  Today&apos;s Income
                </span>
                <div className="text-xl sm:text-3xl font-heading font-black text-amber-800 tracking-tight">
                  ₹{todayIncome.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-amber-500/20 text-[10px] sm:text-xs text-[#92400e] font-bold flex items-center justify-between">
                <span>⚡ Live Daily</span>
              </div>
            </div>

            {/* This Week's Income Card */}
            <div className="neo-card-violet rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden group neo-card-hover">
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] text-white flex items-center justify-center shadow-md shadow-purple-600/30 shrink-0">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-900 border border-purple-500/30">
                    Weekly
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#5b21b6] block mb-0.5">
                  This Week&apos;s Income
                </span>
                <div className="text-xl sm:text-3xl font-heading font-black text-[#5b21b6] tracking-tight">
                  ₹{thisWeekIncome.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-purple-500/20 text-[10px] sm:text-xs text-[#5b21b6] font-bold flex items-center justify-between">
                <span>📅 Current Cycle</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. VOLUME & TEAM PODS (MATCHED PV REMOVED)
           ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card 1: Downline Associates (Executive Royal Sapphire Blue) */}
          <div className="border border-blue-200/80 bg-gradient-to-br from-blue-50/90 via-white to-sky-50/50 rounded-[30px] p-5 sm:p-6 flex flex-col justify-between group shadow-xs hover:shadow-md transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#1e40af]">
                  Downline Team
                </span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1d4ed8] to-[#60a5fa] text-white flex items-center justify-center shadow-md shadow-blue-600/25">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/60 text-center my-1">
                <span className="text-3xl font-heading font-black text-[#1e40af] block">
                  {totalTeamCount}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#1e40af] tracking-wider block mt-0.5">
                  Total Associates in Network
                </span>
              </div>
            </div>

            <div className="mt-3 text-center text-xs text-[#1e40af] font-bold pt-2 border-t border-blue-500/20">
              👥 Active Team Size
            </div>
          </div>

          {/* Card 2: Carry Forward PV (Twilight Cobalt / Deep Indigo) */}
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
            5. ACCOUNT CREDENTIALS & COMPLIANCE (2x2 ON MOBILE)
           ======================================================== */}
        <div className="neo-card rounded-[32px] p-5 sm:p-7 border border-white">
          <div className="mb-4 sm:mb-5 pb-3 border-b border-gray-200/80">
            <h2 className="text-base sm:text-lg font-heading font-black text-[#0f172a]">
              Account Credentials & Boundaries
            </h2>
            <p className="text-xs text-[#64748b] font-medium">
              Registration info, compliance status, capping boundaries, and profile completion
            </p>
          </div>

          {/* 4 Cards: 2x2 Grid on Mobile (grid-cols-2), 4 on Desktop (lg:grid-cols-4) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Joining Date */}
            <div className="p-3.5 sm:p-4 rounded-2xl neo-inset-emerald flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#006d36]" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#065f46]">Joining Date</span>
                </div>
                <div className="font-mono font-black text-xs sm:text-sm text-[#006d36] mt-0.5">
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
                    : user?.activationDate
                    ? new Date(user.activationDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#047857] font-medium block mt-1">Official Joining Date</span>
            </div>

            {/* KYC Status (Glacial Cyan) */}
            <div className="p-3.5 sm:p-4 rounded-2xl neo-inset-cyan flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0891b2]" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0e7490]">KYC Status</span>
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase shadow-2xs ${
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
                    <span>{user?.kycStatus || "PENDING"}</span>
                  </span>
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#0e7490] font-medium block mt-1">Aadhaar, PAN, Bank</span>
            </div>

            {/* Daily Capping (Ruby Rose / Shield) */}
            <div className="p-3.5 sm:p-4 rounded-2xl neo-inset-rose flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-800">Daily Capping</span>
                </div>
                <div className="font-mono font-black text-xs sm:text-sm text-rose-900 mt-0.5">
                  ₹{(user?.dailyCapping || (isUserActive ? 1000 : 0)).toLocaleString("en-IN")} / Day
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] text-rose-700 font-medium block mt-1">Based on PV rank</span>
            </div>

            {/* Profile Completion (Royal Violet / Purple) */}
            <Link
              href="/dashboard/profile"
              className="p-3.5 sm:p-4 rounded-2xl neo-inset-purple flex flex-col justify-between group cursor-pointer hover:bg-purple-100/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7c3aed]" />
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#6d28d9]">
                      Profile
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-[#6d28d9] font-mono">
                    {profileCompletion}%
                  </span>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full bg-purple-200/80 rounded-full h-1.5 sm:h-2 my-1 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-[#6d28d9] font-bold mt-1">
                <span>{profileCompletion === 100 ? "100% Done" : "Complete Now"}</span>
                <span className="group-hover:underline flex items-center">
                  <span>Edit</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
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
