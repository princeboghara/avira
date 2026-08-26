"use client";

import React, { useState } from "react";
import {
  Wallet,
  TrendingUp,
  Users,
  Network,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { User } from "@/types";

export default function StatsCards({ user }: { user: User }) {
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("5000");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setWithdrawModalOpen(false);
    }, 2000);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {/* CARD 1: Wallet Balance */}
        <div className="glass-white rounded-3xl p-6 border border-emerald-500/25 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-900/70">
              Available Wallet
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#022c22] font-mono">
            ₹{user.walletBalance.toLocaleString("en-IN")}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all"
            >
              <span>Instant Payout</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-emerald-600 font-semibold">T+0 Bank Disburse</span>
          </div>
        </div>

        {/* CARD 2: Total Earnings */}
        <div className="glass-white rounded-3xl p-6 border border-emerald-500/25 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-900/70">
              Lifetime Earnings
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#022c22] font-mono">
            ₹{user.totalEarnings.toLocaleString("en-IN")}
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Top 5% Performer</span>
          </div>
        </div>

        {/* CARD 3: Direct Referrals */}
        <div className="glass-white rounded-3xl p-6 border border-emerald-500/25 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-900/70">
              Direct Referrals
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#022c22] font-mono">
            {user.directReferralsCount} <span className="text-sm font-sans font-medium text-emerald-800">Members</span>
          </div>
          <div className="mt-4 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Direct Line</span>
          </div>
        </div>

        {/* CARD 4: Total Team Downline */}
        <div className="glass-white rounded-3xl p-6 border border-emerald-500/25 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-900/70">
              Total Team
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 shadow-sm">
              <Network className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#022c22] font-mono">
            {user.totalTeamCount} <span className="text-sm font-sans font-medium text-teal-800">Nodes</span>
          </div>
          <div className="mt-4 text-[11px] text-teal-700 font-semibold">
            Across 7 Levels Deep
          </div>
        </div>

        {/* CARD 5: Today's Income */}
        <div className="glass-emerald rounded-3xl p-6 border border-emerald-400/40 shadow-xl relative overflow-hidden text-white group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
              Today's Income
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono drop-shadow-md">
            +₹{user.todayEarnings.toLocaleString("en-IN")}
          </div>
          <div className="mt-4 text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Cycle Closes at 23:59 IST</span>
          </div>
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-white max-w-md w-full rounded-3xl p-6 sm:p-8 border border-emerald-400 shadow-2xl relative">
            <h3 className="text-2xl font-black text-[#022c22] mb-1">Request Wallet Payout</h3>
            <p className="text-xs text-emerald-800 mb-5">
              Available Balance: <strong className="font-mono">₹{user.walletBalance.toLocaleString("en-IN")}</strong>
            </p>

            {withdrawSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-300">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-[#022c22]">Withdrawal Queued!</h4>
                <p className="text-xs text-emerald-800">
                  ₹{withdrawAmount} will be transferred to your registered bank account via IMPS/NEFT within minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label htmlFor="withdrawAmount" className="text-xs font-bold uppercase text-emerald-950 block mb-1">
                    Withdrawal Amount (₹)
                  </label>
                  <input
                    id="withdrawAmount"
                    type="number"
                    min="500"
                    max={user.walletBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-emerald-300 font-mono font-bold text-lg text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                  <span className="text-[11px] text-emerald-700 mt-1 block">Minimum withdrawal: ₹500</span>
                </div>

                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-emerald-700 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-950 block">Bank Account on File</span>
                    <span className="text-emerald-700 font-mono">HDFC Bank •••• 4892 (IFSC: HDFC0000123)</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(false)}
                    className="flex-1 py-3 border border-emerald-300 text-emerald-800 font-bold rounded-xl text-sm hover:bg-emerald-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md"
                  >
                    Confirm Payout
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
