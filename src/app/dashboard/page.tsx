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
  CheckCircle2,
  AlertCircle,
  Network,
  ShoppingBag,
  GraduationCap,
  KeyRound,
  FileCheck,
  Zap,
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

  // Rank and Status Calculations
  const personalPv = user?.personalPv || 0;
  const isUserActive = personalPv >= 100;

  let rankName = "Non-Active (<100 PV)";
  let rankBadgeColor = "bg-red-100 text-red-700 border-red-300";
  let rankIcon = AlertCircle;

  if (personalPv >= 1000) {
    rankName = "Diamond Rank";
    rankBadgeColor = "bg-cyan-100 text-cyan-800 border-cyan-300";
    rankIcon = Sparkles;
  } else if (personalPv >= 500) {
    rankName = "Platinum Rank";
    rankBadgeColor = "bg-purple-100 text-purple-800 border-purple-300";
    rankIcon = Award;
  } else if (personalPv >= 250) {
    rankName = "Gold Rank";
    rankBadgeColor = "bg-amber-100 text-amber-800 border-amber-300";
    rankIcon = Award;
  } else if (personalPv >= 100) {
    rankName = "Silver Rank";
    rankBadgeColor = "bg-emerald-100 text-[#006d36] border-emerald-300";
    rankIcon = CheckCircle2;
  }

  const RankIcon = rankIcon;

  // PV Calculations
  const leftPendingPv = user?.leftPv || 0;
  const rightPendingPv = user?.rightPv || 0;
  const carryLeftPv = user?.carryLeftPv ?? leftPendingPv;
  const carryRightPv = user?.carryRightPv ?? rightPendingPv;

  // Cumulative Total PV (Calculated estimate based on lifetime matching + pending)
  const totalLeftCumulativePv = (user?.totalEarnings ? user.totalEarnings : 0) + carryLeftPv;
  const totalRightCumulativePv = (user?.totalEarnings ? user.totalEarnings : 0) + carryRightPv;

  return (
    <MemberLayout user={user}>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* ========================================================
            1. WELCOME BANNER (Member ID, Name, Status, Rank)
           ======================================================== */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#006d36] via-[#005a2c] to-[#4f378a] text-white shadow-xl shadow-[#006d36]/15 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Identity & Rank Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-18 h-18 rounded-2xl object-cover border-2 border-white shadow-lg"
                />
              ) : (
                <div className="w-18 h-18 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-2xl flex items-center justify-center shadow-lg border border-white/30">
                  {user?.fullName?.charAt(0) || "A"}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-black/25 text-emerald-200 border border-white/20">
                    ID: {user?.memberId || "..."}
                  </span>
                  
                  {/* Active / Non-Active Status Pill */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase border ${
                      isUserActive
                        ? "bg-emerald-400 text-emerald-950 border-emerald-300"
                        : "bg-red-500 text-white border-red-400"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isUserActive ? "bg-emerald-950 animate-pulse" : "bg-white"}`} />
                    {isUserActive ? "Active Member" : "Non-Active (Red)"}
                  </span>

                  {/* Rank Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase border ${rankBadgeColor}`}>
                    <RankIcon className="w-3.5 h-3.5" />
                    <span>{rankName} ({personalPv} PV)</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {user?.fullName || "Avira Associate"}
                </h1>
                
                <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                  1:1 Binary Matching Engine • Daily Payout Settlement & Repurchase System
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/dashboard/store"
                className="px-4 py-2.5 rounded-xl bg-white text-[#006d36] font-bold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Create Order</span>
              </Link>
              <Link
                href="/dashboard/tree"
                className="px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white font-bold text-xs hover:bg-white/25 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Network className="w-4 h-4" />
                <span>Binary Tree</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. LEFT & RIGHT REFERRAL LINKS
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Referral Link */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-50/80 via-white to-white border border-emerald-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#006d36] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  LEFT
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1a1c1c]">Left Leg Placement Link</h3>
                  <span className="text-[11px] text-[#5f5e5e]">New associates will join your Left Team</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006d36] text-[10px] font-bold font-mono">
                POSITION: LEFT
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4 p-2 bg-white rounded-2xl border border-gray-200">
              <input
                type="text"
                readOnly
                value={leftReferralUrl}
                className="flex-1 bg-transparent text-xs font-mono text-[#5f5e5e] px-2 outline-hidden truncate"
              />
              <button
                type="button"
                onClick={handleCopyLeft}
                className="px-4 py-2 rounded-xl bg-[#006d36] text-white text-xs font-bold hover:bg-[#005025] transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer shadow-xs"
              >
                {copiedLeft ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
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

          {/* Right Referral Link */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-purple-50/80 via-white to-white border border-purple-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  RIGHT
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1a1c1c]">Right Leg Placement Link</h3>
                  <span className="text-[11px] text-[#5f5e5e]">New associates will join your Right Team</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold font-mono">
                POSITION: RIGHT
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4 p-2 bg-white rounded-2xl border border-gray-200">
              <input
                type="text"
                readOnly
                value={rightReferralUrl}
                className="flex-1 bg-transparent text-xs font-mono text-[#5f5e5e] px-2 outline-hidden truncate"
              />
              <button
                type="button"
                onClick={handleCopyRight}
                className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer shadow-xs"
              >
                {copiedRight ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
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
            3. MAIN FINANCIAL SUMMARY BOX: TOTAL INCOME & SUB-INCOMES
           ======================================================== */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Main Highlighted Box: Total Income */}
            <div className="lg:col-span-5 rounded-3xl p-8 bg-gradient-to-br from-[#006d36] to-[#004723] text-white shadow-lg shadow-[#006d36]/20 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider">
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
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
            </div>

            {/* Sub-income Cards Grid (Today Income, Binary Income, Repurchase Balance) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Today's Income */}
              <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-[#006d36]">
                      Today
                    </span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e] block mb-1">
                    Today&apos;s Income
                  </span>
                  <div className="text-2xl font-black font-mono text-[#1a1c1c]">
                    ₹{user?.todayEarnings?.toLocaleString("en-IN") || 0}
                  </div>
                </div>
                <div className="text-[10px] text-[#5f5e5e] pt-3 mt-3 border-t border-gray-100">
                  Cut-off matching credit
                </div>
              </div>

              {/* Binary Income */}
              <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      1:1 Net
                    </span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e] block mb-1">
                    Binary Income
                  </span>
                  <div className="text-2xl font-black font-mono text-[#1a1c1c]">
                    ₹{netBinaryIncome.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-[10px] text-[#5f5e5e] pt-3 mt-3 border-t border-gray-100">
                  Post TDS & Admin Fees
                </div>
              </div>

              {/* Repurchase Balance (RP Wallet) */}
              <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      5% RP
                    </span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e] block mb-1">
                    Repurchase Balance
                  </span>
                  <div className="text-2xl font-black font-mono text-[#1a1c1c]">
                    ₹{(user?.rpWallet || rpWalletAmount).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-[10px] text-[#5f5e5e] pt-3 mt-3 border-t border-gray-100">
                  Available for store purchase
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. TEAM COUNTS, TOTAL CUMULATIVE PV, AND PENDING MATCH PV
           ======================================================== */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1a1c1c] flex items-center gap-2">
            <Network className="w-5 h-5 text-[#006d36]" />
            <span>Binary Network Volume & Team Analytics</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Team Members Count */}
            <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5f5e5e]">
                  Downline Associates
                </span>
                <Users className="w-4 h-4 text-[#006d36]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#006d36] block">Left Team</span>
                  <span className="text-xl font-black font-mono text-[#006d36]">{leftTeamCount}</span>
                  <span className="text-[9px] text-[#5f5e5e] block">Members</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/60 text-center">
                  <span className="text-[10px] font-bold uppercase text-purple-700 block">Right Team</span>
                  <span className="text-xl font-black font-mono text-purple-700">{rightTeamCount}</span>
                  <span className="text-[9px] text-[#5f5e5e] block">Members</span>
                </div>
              </div>
              <div className="mt-3 text-center text-xs text-[#5f5e5e] font-semibold">
                Total Team: <strong className="text-[#1a1c1c]">{totalTeamCount}</strong> Active Associates
              </div>
            </div>

            {/* 2. Total Cumulative PV (Matched + Non-Matched) */}
            <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5f5e5e]">
                  Total Cumulative PV (Lifetime)
                </span>
                <Award className="w-4 h-4 text-[#4f378a]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#006d36] block">Total Left PV</span>
                  <span className="text-xl font-black font-mono text-[#006d36]">{totalLeftCumulativePv}</span>
                  <span className="text-[9px] text-[#5f5e5e] block">PV</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/60 text-center">
                  <span className="text-[10px] font-bold uppercase text-purple-700 block">Total Right PV</span>
                  <span className="text-xl font-black font-mono text-purple-700">{totalRightCumulativePv}</span>
                  <span className="text-[9px] text-[#5f5e5e] block">PV</span>
                </div>
              </div>
              <div className="mt-3 text-center text-xs text-[#5f5e5e] font-semibold">
                All Matched & Carry Forward Volume
              </div>
            </div>

            {/* 3. Pending Match PV (Unmatched Carry Volume) */}
            <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5f5e5e]">
                  Pending Match PV (Next Cut-off)
                </span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-center">
                  <span className="text-[10px] font-bold uppercase text-[#006d36] block">Pending Left PV</span>
                  <span className="text-xl font-black font-mono text-[#006d36]">{carryLeftPv}</span>
                  <span className="text-[9px] text-[#5f5e5e] block">PV Ready</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/60 text-center">
                  <span className="text-[10px] font-bold uppercase text-purple-700 block">Pending Right PV</span>
                  <span className="text-xl font-black font-mono text-purple-700">{carryRightPv}</span>
                  <span className="text-[9px] text-[#5f5e5e] block">PV Ready</span>
                </div>
              </div>
              <div className="mt-3 text-center text-xs text-[#5f5e5e] font-semibold">
                Matched automatically 1:1 on next pair
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. BRIEF DETAILS CARD (Activation Date, KYC Status, Capping, Sponsor)
           ======================================================== */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-[#1a1c1c]">Account Brief & Compliance Details</h2>
              <p className="text-xs text-[#5f5e5e]">Associate verification credentials and daily capping boundaries</p>
            </div>
            <Link
              href="/dashboard/kyc"
              className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>Manage KYC</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Activation Date */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/60">
              <div className="flex items-center gap-2 text-[#5f5e5e] mb-1">
                <Calendar className="w-4 h-4 text-[#006d36]" />
                <span className="text-xs font-bold uppercase tracking-wider">Activation Date</span>
              </div>
              <div className="font-mono font-bold text-sm text-[#1a1c1c] mt-1">
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
              <span className="text-[10px] text-[#5f5e5e]">Account Registration</span>
            </div>

            {/* KYC Status */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/60">
              <div className="flex items-center gap-2 text-[#5f5e5e] mb-1">
                <FileCheck className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-bold uppercase tracking-wider">KYC Status</span>
              </div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    user?.kycStatus === "VERIFIED"
                      ? "bg-emerald-100 text-[#006d36]"
                      : user?.kycStatus === "PENDING"
                      ? "bg-amber-100 text-amber-800"
                      : user?.kycStatus === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {user?.kycStatus || "NOT SUBMITTED"}
                </span>
              </div>
              <span className="text-[10px] text-[#5f5e5e] block mt-1">Bank & Aadhaar ID</span>
            </div>

            {/* Daily Capping Limit */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/60">
              <div className="flex items-center gap-2 text-[#5f5e5e] mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Daily Capping Limit</span>
              </div>
              <div className="font-mono font-black text-sm text-[#006d36] mt-1">
                ₹{(user?.dailyCapping || (isUserActive ? 1000 : 0)).toLocaleString("en-IN")} / Day
              </div>
              <span className="text-[10px] text-[#5f5e5e]">Based on Personal PV rank</span>
            </div>

            {/* Sponsor Information */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/60">
              <div className="flex items-center gap-2 text-[#5f5e5e] mb-1">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Direct Sponsor</span>
              </div>
              <div className="font-mono font-bold text-sm text-[#1a1c1c] mt-1 truncate">
                {user?.sponsorId || "DIRECT"}
              </div>
              <span className="text-[10px] text-[#5f5e5e] truncate block">
                {user?.sponsorName || "Direct Company Upline"}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            6. RECENT TRANSACTIONS LEDGER
           ======================================================== */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#1a1c1c]">Recent Financial Statement</h2>
              <p className="text-xs text-[#5f5e5e]">Real-time payout settlements, binary matches, and repurchase deposits</p>
            </div>
            <Link
              href="/dashboard/earnings/binary"
              className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>View Full Statement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#5f5e5e] flex flex-col items-center gap-3 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
              <Clock className="w-8 h-8 text-gray-400" />
              <span>No transactions recorded yet. Complete 100 PV order or match pairs to earn commissions.</span>
              <Link
                href="/dashboard/store"
                className="px-4 py-2 rounded-xl bg-[#006d36] text-white font-bold text-xs"
              >
                Browse Store Products
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200/80 text-[#5f5e5e] uppercase tracking-wider font-extrabold">
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
                      <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-[#5f5e5e]">
                          {tx.date
                            ? new Date(tx.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Recent"}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#1a1c1c]">
                          {tx.description}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isCredit
                                ? "bg-emerald-100 text-[#006d36]"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {tx.type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                            isCredit ? "text-[#006d36]" : "text-red-600"
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
      </div>
    </MemberLayout>
  );
}
