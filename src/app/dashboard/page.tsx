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
  Award,
  Crown,
  CheckCircle2,
  AlertCircle,
  Network,
  ShoppingBag,
  Zap,
  FileText,
  FileCheck,
  CreditCard,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { User, Transaction } from "@/types";
import MemberLayout from "@/components/member/MemberLayout";
import IndiaStateMap from "@/components/dashboard/IndiaStateMap";

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
  const [leadershipBonusAmount, setLeadershipBonusAmount] = useState(0);
  const [royaltyIncomeAmount, setRoyaltyIncomeAmount] = useState(0);
  const [isRoyaltyQualified, setIsRoyaltyQualified] = useState(false);

  // Payout Statement summaries
  const [totalPaidIncome, setTotalPaidIncome] = useState(0);
  const [pendingPayoutIncome, setPendingPayoutIncome] = useState(0);

  // Referral URL state
  const [mounted, setMounted] = useState(false);
  const [copiedLeft, setCopiedLeft] = useState(false);
  const [copiedRight, setCopiedRight] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function loadDashboardData() {
      try {
        const [meRes, teamRes, earnRes, stateRes, leadRes, royRes] = await Promise.allSettled([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/member/team", { cache: "no-store" }),
          fetch("/api/member/earnings/binary", { cache: "no-store" }),
          fetch("/api/member/statement", { cache: "no-store" }),
          fetch("/api/member/earnings/leadership", { cache: "no-store" }),
          fetch("/api/member/earnings/royalty", { cache: "no-store" }),
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

        if (leadRes.status === "fulfilled") {
          const leadData = await leadRes.value.json();
          if (leadData.success && leadData.summary) {
            setLeadershipBonusAmount(leadData.summary.totalGross || 0);
          }
        }

        if (royRes.status === "fulfilled") {
          const royData = await royRes.value.json();
          if (royData.success) {
            setRoyaltyIncomeAmount(royData.summary?.totalGross || 0);
            setIsRoyaltyQualified(royData.qualification?.isQualified || false);
          }
        }

        if (stateRes.status === "fulfilled") {
          const stateData = await stateRes.value.json();
          if (stateData.success && stateData.summary) {
            setTotalPaidIncome(stateData.summary.totalPaid || 0);
            setPendingPayoutIncome(stateData.summary.totalPending || 0);
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

  // Rank and Status Calculations
  const personalPv = user?.personalPv || 0;
  const isUserActive = personalPv >= 100;

  let rankName = "Non-Active (<100 PV)";
  let rankBadgeColor = "bg-rose-50 text-rose-700 border-rose-200";
  let rankIcon = AlertCircle;

  if (personalPv >= 1000) {
    rankName = "Diamond Rank";
    rankBadgeColor = "bg-cyan-50 text-cyan-800 border-cyan-300";
    rankIcon = Sparkles;
  } else if (personalPv >= 500) {
    rankName = "Platinum Rank";
    rankBadgeColor = "bg-purple-50 text-purple-800 border-purple-300";
    rankIcon = Award;
  } else if (personalPv >= 250) {
    rankName = "Gold Rank";
    rankBadgeColor = "bg-amber-50 text-amber-900 border-amber-300";
    rankIcon = Award;
  } else if (personalPv >= 100) {
    rankName = "Silver Rank";
    rankBadgeColor = "bg-emerald-50 text-emerald-800 border-emerald-300";
    rankIcon = CheckCircle2;
  }

  const RankIcon = rankIcon;

  // PV Calculations
  const leftPendingPv = user?.carryLeftPv ?? (user?.leftPv || 0);
  const rightPendingPv = user?.carryRightPv ?? (user?.rightPv || 0);
  const carryLeftPv = user?.carryLeftPv ?? 0;
  const carryRightPv = user?.carryRightPv ?? 0;

  // Cumulative Total PV
  const totalLeftCumulativePv = user?.leftPv || 0;
  const totalRightCumulativePv = user?.rightPv || 0;

  if (loading) {
    return (
      <MemberLayout user={user}>
        <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-pulse">
          <div className="rounded-3xl p-8 bg-slate-900/10 h-52 flex items-center justify-between" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="h-36 rounded-3xl bg-white border border-slate-200" />
            <div className="h-36 rounded-3xl bg-white border border-slate-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-32 rounded-3xl bg-white border border-slate-200" />
            <div className="h-32 rounded-3xl bg-white border border-slate-200" />
            <div className="h-32 rounded-3xl bg-white border border-slate-200" />
            <div className="h-32 rounded-3xl bg-white border border-slate-200" />
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout user={user}>
      <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-fadeIn">
        {/* ========================================================
            1. EXECUTIVE WELCOME BANNER (Luxury Dark Obsidian & Emerald)
           ======================================================== */}
        <div className="relative rounded-3xl p-7 sm:p-9 bg-gradient-to-br from-[#022814] via-[#04331b] to-[#01170b] text-white shadow-xl shadow-[#022814]/15 border border-emerald-900/30 overflow-hidden">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#50c878]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Identity & Rank Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md text-white font-black text-2xl flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                  {user?.fullName?.charAt(0) || "A"}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Member ID Chip */}
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-black/40 text-emerald-300 border border-white/15 backdrop-blur-md">
                    ID: {user?.memberId}
                  </span>

                  {/* Active / Non-Active Status Pill */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border backdrop-blur-md ${
                      isUserActive
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isUserActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                      }`}
                    />
                    <span>{isUserActive ? "Active Member" : "Non-Active (<100 PV)"}</span>
                  </span>

                  {/* Rank Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${
                      personalPv >= 1000
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                        : personalPv >= 500
                        ? "bg-purple-500/20 text-purple-300 border-purple-400/40"
                        : personalPv >= 250
                        ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                        : personalPv >= 100
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                        : "bg-slate-500/20 text-slate-300 border-slate-400/40"
                    }`}
                  >
                    <RankIcon className="w-3.5 h-3.5" />
                    <span>{rankName} ({personalPv} PV)</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {user?.fullName}
                </h1>

                <p className="text-xs sm:text-sm text-emerald-200/80 font-medium">
                  1:1 Binary PV Pair Matching Engine • Daily Settlement & Auto Repurchase Portal
                </p>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
              <Link
                href="/dashboard/store"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white text-[#006d36] font-bold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Products</span>
              </Link>
              <Link
                href="/dashboard/tree"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Network className="w-4 h-4" />
                <span>Network Tree</span>
              </Link>
              <Link
                href="/dashboard/statement"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Statement</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. DUAL-WING REFERRAL CENTER (Left & Right Leg Placement)
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Referral Card */}
          <div className="rounded-3xl p-6 bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#006d36] flex items-center justify-center font-black text-xs shadow-2xs">
                  LEFT
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Left Team Placement Link</h3>
                  <span className="text-[11px] text-slate-500">Auto places new associate in your Left Leg</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#006d36] text-[10px] font-mono font-bold border border-emerald-200">
                POWER LEG
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={leftReferralUrl}
                className="flex-1 bg-transparent text-xs font-mono text-slate-600 px-2 outline-hidden truncate"
              />
              <button
                type="button"
                onClick={handleCopyLeft}
                className="px-4 py-2 rounded-xl bg-[#006d36] text-white text-xs font-bold hover:bg-[#005025] transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer shadow-xs"
              >
                {copiedLeft ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
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

          {/* Right Referral Card */}
          <div className="rounded-3xl p-6 bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shadow-2xs">
                  RIGHT
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Right Team Placement Link</h3>
                  <span className="text-[11px] text-slate-500">Auto places new associate in your Right Leg</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold border border-indigo-200">
                MATCHING LEG
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={rightReferralUrl}
                className="flex-1 bg-transparent text-xs font-mono text-slate-600 px-2 outline-hidden truncate"
              />
              <button
                type="button"
                onClick={handleCopyRight}
                className="px-4 py-2 rounded-xl bg-indigo-700 text-white text-xs font-bold hover:bg-indigo-800 transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer shadow-xs"
              >
                {copiedRight ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-indigo-300" />
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
            3. FINANCIAL INTELLIGENCE HUB (Total Earnings & Metrics)
           ======================================================== */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Main Total Income Hero Card */}
            <div className="lg:col-span-5 rounded-3xl p-7 sm:p-8 bg-gradient-to-br from-[#006d36] to-[#004d25] text-white shadow-xl shadow-[#006d36]/15 flex flex-col justify-between relative overflow-hidden border border-emerald-600/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md">
                    Lifetime Earnings
                  </span>
                </div>

                <span className="text-xs font-bold uppercase tracking-widest text-emerald-200 block mb-1">
                  Main Total Income
                </span>
                <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">
                  ₹{user?.totalEarnings?.toLocaleString("en-IN") || 0}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100">
                <span>Withdrawable Wallet: <strong>₹{user?.walletBalance?.toLocaleString("en-IN") || 0}</strong></span>
                <Link
                  href="/dashboard/statement"
                  className="hover:underline flex items-center gap-1 font-bold text-white"
                >
                  <span>Statement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Sub-income Cards Grid (Binary, Leadership Bonus, Royalty Income, RP Wallet, Fund Wallet) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
              {/* Binary Matching Income */}
              <div className="rounded-3xl p-4 sm:p-5 bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      1:1 Pairs
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    Binary Income
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-slate-900">
                    ₹{netBinaryIncome.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span>Matching payout</span>
                  <Link href="/dashboard/earnings/binary" className="hover:underline text-purple-700 font-bold flex items-center gap-0.5">
                    <span>View</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>

              {/* Leadership Supporting Bonus (15% / 5%) */}
              <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-amber-50/50 via-white to-white border border-amber-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shadow-2xs">
                      <Award className="w-4 h-4 text-amber-700" />
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      15% / 5%
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-0.5">
                    Leadership Bonus
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-amber-950">
                    ₹{leadershipBonusAmount.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-[9px] text-amber-800 font-semibold pt-2.5 mt-2.5 border-t border-amber-100 flex items-center justify-between">
                  <span>2-Level Sponsor</span>
                  <Link href="/dashboard/earnings/leadership" className="hover:underline text-amber-900 font-bold flex items-center gap-0.5">
                    <span>Ledger</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>

              {/* Royalty Club Income (5% Pool) */}
              <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-yellow-50/60 via-white to-white border border-yellow-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-2xl bg-yellow-100 text-yellow-900 flex items-center justify-center font-bold shadow-2xs">
                      <Crown className="w-4 h-4 text-yellow-700 fill-yellow-400" />
                    </div>
                    <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${isRoyaltyQualified ? "bg-emerald-100 text-[#006d36] border-emerald-300" : "bg-yellow-100 text-yellow-900 border-yellow-300"}`}>
                      {isRoyaltyQualified ? "👑 Qualified" : "5% Pool"}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-900 block mb-0.5">
                    Royalty Income
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-yellow-950">
                    ₹{royaltyIncomeAmount.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-[9px] text-yellow-800 font-semibold pt-2.5 mt-2.5 border-t border-yellow-100 flex items-center justify-between">
                  <span>Monthly Pool</span>
                  <Link href="/dashboard/earnings/royalty" className="hover:underline text-yellow-900 font-bold flex items-center gap-0.5">
                    <span>Tracker</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>

              {/* Repurchase Balance (RP Wallet) */}
              <div className="rounded-3xl p-4 sm:p-5 bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      5% RP
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    RP Wallet
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-slate-900">
                    ₹{(user?.rpWallet || rpWalletAmount).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 pt-2.5 mt-2.5 border-t border-slate-100">
                  Auto Repurchase
                </div>
              </div>

              {/* Fund Wallet Card */}
              <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-2xl bg-[#006d36] text-white flex items-center justify-center font-bold shadow-xs">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <Link
                      href="/dashboard/fund"
                      className="text-[9px] font-black font-mono px-2 py-0.5 rounded-full bg-[#006d36] text-white hover:bg-[#005025] cursor-pointer"
                    >
                      + Add
                    </Link>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#006d36] block mb-0.5">
                    Fund Wallet
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-[#006d36]">
                    ₹{(user?.fundWallet || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-[9px] text-emerald-700 font-semibold pt-2.5 mt-2.5 border-t border-emerald-100 flex items-center justify-between">
                  <span>Purchases</span>
                  <Link href="/dashboard/fund" className="hover:underline flex items-center gap-0.5">
                    <span>Deposit</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Payout Summary Boxes (Total Paid & Pending Income) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Paid Income */}
            <Link
              href="/dashboard/statement"
              className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-white border border-emerald-200 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#006d36] flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Total Paid Income (To Bank Account)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-[#006d36]">
                    ₹{totalPaidIncome.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block">
                    Successfully disbursed to registered bank
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#006d36] bg-emerald-100/70 px-3.5 py-1.5 rounded-xl flex items-center gap-1 group-hover:bg-emerald-200 transition-colors">
                <span>Statement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Pending Payout Income */}
            <Link
              href="/dashboard/statement"
              className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/70 via-white to-white border border-amber-200 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Pending Payout Income
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-800">
                    ₹{pendingPayoutIncome.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[10px] text-amber-800 font-medium block">
                    Scheduled for upcoming weekly settlement
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-3.5 py-1.5 rounded-xl flex items-center gap-1 group-hover:bg-amber-200 transition-colors">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* ========================================================
            4. BINARY VOLUME & TEAM ANALYTICS (Left / Right Cards)
           ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Network className="w-5 h-5 text-[#006d36]" />
              <span>Binary Team Analytics & PV Volume</span>
            </h2>
            <Link
              href="/dashboard/tree"
              className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>Genealogy Tree</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Downline Associates */}
            <div className="rounded-3xl p-6 bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Downline Associates
                </span>
                <Users className="w-4 h-4 text-[#006d36]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#006d36] block">Left Team</span>
                  <span className="text-2xl font-black font-mono text-[#006d36]">{leftTeamCount}</span>
                  <span className="text-[9px] text-slate-500 block font-medium">Members</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/70 text-center">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 block">Right Team</span>
                  <span className="text-2xl font-black font-mono text-indigo-700">{rightTeamCount}</span>
                  <span className="text-[9px] text-slate-500 block font-medium">Members</span>
                </div>
              </div>
              <div className="mt-4 text-center text-xs text-slate-500 font-semibold pt-3 border-t border-slate-100">
                Total Team: <strong className="text-slate-900">{totalTeamCount}</strong> Associates
              </div>
            </div>

            {/* 2. Cumulative Lifetime PV */}
            <div className="rounded-3xl p-6 bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cumulative Lifetime PV
                </span>
                <Award className="w-4 h-4 text-purple-700" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#006d36] block">Total Left PV</span>
                  <span className="text-2xl font-black font-mono text-[#006d36]">{totalLeftCumulativePv}</span>
                  <span className="text-[9px] text-slate-500 block font-medium">Lifetime PV</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/70 text-center">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 block">Total Right PV</span>
                  <span className="text-2xl font-black font-mono text-indigo-700">{totalRightCumulativePv}</span>
                  <span className="text-[9px] text-slate-500 block font-medium">Lifetime PV</span>
                </div>
              </div>
              <div className="mt-4 text-center text-xs text-slate-500 font-semibold pt-3 border-t border-slate-100">
                All Matched & Carry Volume
              </div>
            </div>

            {/* 3. Pending Match PV (Active Volume) */}
            <div className="rounded-3xl p-6 bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pending Match PV (Carry Forward)
                </span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#006d36] block">Pending Left</span>
                  <span className="text-2xl font-black font-mono text-[#006d36]">{carryLeftPv}</span>
                  <span className="text-[9px] text-slate-500 block font-medium">PV Available</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/70 text-center">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 block">Pending Right</span>
                  <span className="text-2xl font-black font-mono text-indigo-700">{carryRightPv}</span>
                  <span className="text-[9px] text-slate-500 block font-medium">PV Available</span>
                </div>
              </div>
              <div className="mt-4 text-center text-xs text-slate-500 font-semibold pt-3 border-t border-slate-100">
                1:1 Instant Matching on new volume
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. ACCOUNT BRIEF & COMPLIANCE DETAILS
           ======================================================== */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Account Credentials & Daily Boundaries
              </h2>
              <p className="text-xs text-slate-500">
                Verification credentials, daily capping boundaries, and upline hierarchy
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
            <div className="p-4 rounded-2xl bg-slate-50/75 border border-slate-200/70">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar className="w-4 h-4 text-[#006d36]" />
                <span className="text-xs font-bold uppercase tracking-wider">Activation Date</span>
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
              <span className="text-[10px] text-slate-400">Account Registration</span>
            </div>

            {/* KYC Status */}
            <div className="p-4 rounded-2xl bg-slate-50/75 border border-slate-200/70">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <FileCheck className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-bold uppercase tracking-wider">KYC Compliance</span>
              </div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    user?.kycStatus === "VERIFIED"
                      ? "bg-emerald-100 text-[#006d36]"
                      : user?.kycStatus === "PENDING"
                      ? "bg-amber-100 text-amber-800"
                      : user?.kycStatus === "REJECTED"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {user?.kycStatus || "NOT SUBMITTED"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Aadhaar, PAN, Bank</span>
            </div>

            {/* Daily Capping */}
            <div className="p-4 rounded-2xl bg-slate-50/75 border border-slate-200/70">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Daily Capping Limit</span>
              </div>
              <div className="font-mono font-black text-sm text-[#006d36] mt-1">
                ₹{(user?.dailyCapping || (isUserActive ? 1000 : 0)).toLocaleString("en-IN")} / Day
              </div>
              <span className="text-[10px] text-slate-400">Based on Personal PV rank</span>
            </div>

            {/* Direct Sponsor */}
            <div className="p-4 rounded-2xl bg-slate-50/75 border border-slate-200/70">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Direct Sponsor</span>
              </div>
              <div className="font-mono font-bold text-sm text-slate-900 mt-1 truncate">
                {user?.sponsorId || "DIRECT"}
              </div>
              <span className="text-[10px] text-slate-400 truncate block">
                {user?.sponsorName || "Direct Upline Master"}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            6. RECENT FINANCIAL ACTIVITY STATEMENT
           ======================================================== */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Recent Financial Statement
              </h2>
              <p className="text-xs text-slate-500">
                Real-time binary pair match bonuses, payout settlements, and wallet entries
              </p>
            </div>
            <Link
              href="/dashboard/earnings/binary"
              className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 flex flex-col items-center gap-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-400" />
              <span>No transactions recorded yet. Place orders or build your team to earn 1:1 pair bonuses.</span>
              <Link
                href="/dashboard/store"
                className="px-4 py-2 rounded-xl bg-[#006d36] text-white font-bold text-xs shadow-xs"
              >
                Browse Store Products
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
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
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500">
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
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isCredit
                                ? "bg-emerald-100 text-[#006d36]"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {tx.type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${
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

        {/* 6. MEMBER DOWNLINE GEOGRAPHIC DISTRIBUTION MAP */}
        <IndiaStateMap scope="member" />
      </div>
    </MemberLayout>
  );
}
