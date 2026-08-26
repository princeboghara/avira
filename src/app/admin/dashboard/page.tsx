"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Users,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  LogOut,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { User } from "@/types";

interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  blockedMembers: number;
  totalWalletLiability: number;
  totalEarningsDistributed: number;
  totalTransactionsCount: number;
  totalVolume: number;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    status: string;
    date: string;
    member_id: string;
    full_name: string;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [runningCutoff, setRunningCutoff] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Load Admin Profile & Data
  const loadAdminData = async () => {
    try {
      setRefreshing(true);
      // 1. Verify Admin Session
      const meRes = await fetch("/api/admin/auth/me");
      const meData = await meRes.json();

      if (!meRes.ok || !meData.success || !meData.admin) {
        router.push("/admin/login");
        return;
      }
      setAdminUser(meData.admin);

      // 2. Fetch Live Stats
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // 3. Fetch Live Users
      const usersRes = await fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}`);
      const usersData = await usersRes.json();
      if (usersData.success) {
        setMembers(usersData.users);
      }
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    router.push("/admin/login");
  };

  // 1-Click Toggle Member Status (ACTIVE <-> BLOCKED)
  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    setStatusUpdatingId(user.id);

    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === user.id ? { ...m, status: nextStatus } : m))
        );
        // Refresh stats
        const statsRes = await fetch("/api/admin/stats");
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.data);
      } else {
        alert(data.message || "Failed to update member status.");
      }
    } catch {
      alert("Error contacting Supabase.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleRunCutoff = async () => {
    if (
      !confirm(
        "Are you sure you want to execute the 1:1 Daily Binary Matching Cutoff now? This will match Left PV vs Right PV, carry forward the stronger leg, and distribute bonuses to wallets."
      )
    )
      return;

    setRunningCutoff(true);
    try {
      const res = await fetch("/api/admin/binary/cutoff", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await loadAdminData();
      } else {
        alert(data.message || "Cutoff failed");
      }
    } catch {
      alert("Network error executing cutoff");
    } finally {
      setRunningCutoff(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07130c] text-white flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#50c878] mb-3" />
        <span className="text-sm font-mono tracking-wider text-[#50c878]">
          Authenticating Master Admin Session...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07130c] text-white flex flex-col font-sans selection:bg-[#50c878] selection:text-[#005025]">
      {/* Top Master Admin Bar */}
      <header className="h-20 bg-[#0e1d14]/90 backdrop-blur-xl border-b border-[#006d36]/30 sticky top-0 z-50 px-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-lg border border-[#50c878]/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-wider">
                AVIRA LIFE CARE GLOBAL
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#006d36] text-white rounded-md tracking-widest uppercase">
                Master Admin
              </span>
            </div>
            <span className="text-[11px] text-[#bdcabc]/70 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#50c878] animate-pulse" />
              <span>Supabase PostgreSQL Live</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={loadAdminData}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#bdcabc] hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right">
              <span className="text-xs font-bold text-white block">{adminUser?.fullName}</span>
              <span className="text-[10px] font-mono text-[#50c878]">ID: {adminUser?.memberId}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#006d36] border border-[#50c878] flex items-center justify-center font-bold text-xs">
              A
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 text-xs font-bold transition-colors cursor-pointer"
            title="Sign out of Admin Panel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Welcome & Overview Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">System Master Dashboard</h1>
            <p className="text-xs sm:text-sm text-[#bdcabc]">
              Real-time enterprise overview of all associates, wallet liabilities, and network ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRunCutoff}
              disabled={runningCutoff}
              className="px-4 py-2.5 bg-gradient-to-r from-[#006d36] to-[#50c878] hover:from-[#005025] hover:to-[#006d36] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#006d36]/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {runningCutoff ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculating Matching Payouts...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">account_tree</span>
                  <span>Run 1:1 Daily Binary Cutoff</span>
                </>
              )}
            </button>

            <Link
              href="/login"
              target="_blank"
              className="text-xs font-bold text-[#50c878] hover:underline flex items-center gap-1 bg-white/5 px-3 py-2 rounded-xl border border-white/10"
            >
              <span>Preview Public Member Portal</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </Link>
          </div>
        </div>

        {/* Master KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Members */}
          <div className="bg-[#0e1d14]/80 border border-[#006d36]/40 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#bdcabc] uppercase tracking-wider">
                Total Associates
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#50c878]/10 flex items-center justify-center text-[#50c878]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black font-mono text-white mb-1">
              {stats?.totalMembers || 0}
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-[#50c878] flex items-center gap-0.5">
                <CheckCircle className="w-3 h-3" /> {stats?.activeMembers || 0} Active
              </span>
              {stats && stats.blockedMembers > 0 && (
                <span className="text-red-400 flex items-center gap-0.5">
                  <XCircle className="w-3 h-3" /> {stats.blockedMembers} Blocked
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Wallet Liabilities */}
          <div className="bg-[#0e1d14]/80 border border-[#006d36]/40 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#bdcabc] uppercase tracking-wider">
                Net Wallet Liability
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#50c878]/10 flex items-center justify-center text-[#50c878]">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black font-mono text-[#50c878] mb-1">
              ₹{(stats?.totalWalletLiability || 0).toLocaleString("en-IN")}
            </h2>
            <span className="text-[11px] text-[#bdcabc]">Outstanding Member Balances</span>
          </div>

          {/* Card 3: Total Earnings Distributed */}
          <div className="bg-[#0e1d14]/80 border border-[#006d36]/40 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#bdcabc] uppercase tracking-wider">
                Total Payouts Distributed
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#50c878]/10 flex items-center justify-center text-[#50c878]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black font-mono text-white mb-1">
              ₹{(stats?.totalEarningsDistributed || 0).toLocaleString("en-IN")}
            </h2>
            <span className="text-[11px] text-[#bdcabc]">Cumulative MLM Commission</span>
          </div>

          {/* Card 4: Total Ledger Transactions */}
          <div className="bg-[#0e1d14]/80 border border-[#006d36]/40 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#bdcabc] uppercase tracking-wider">
                Audited Transactions
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#50c878]/10 flex items-center justify-center text-[#50c878]">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black font-mono text-white mb-1">
              {stats?.totalTransactionsCount || 0}
            </h2>
            <span className="text-[11px] text-[#bdcabc]">Supabase Ledger Entries</span>
          </div>
        </div>

        {/* Member Directory & Control Panel */}
        <div className="bg-[#0e1d14]/90 border border-[#006d36]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-white">Live Member Directory</h3>
              <p className="text-xs text-[#bdcabc]">
                Manage all registered associates, inspect sponsor hierarchies, and control account status.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bdcabc]/60" />
              <input
                type="text"
                placeholder="Search by AV ID, Name, City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#050b07] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/30 focus:border-[#50c878] outline-none font-medium"
              />
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[#bdcabc] uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Member ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Sponsor ID</th>
                  <th className="py-3.5 px-4">City / State</th>
                  <th className="py-3.5 px-4">Wallet Balance</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#bdcabc]/60">
                      No members match the search query.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#50c878]">
                        {member.memberId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">{member.fullName}</td>
                      <td className="py-3.5 px-4 font-mono text-[#bdcabc]">{member.mobile}</td>
                      <td className="py-3.5 px-4 font-mono text-white/80">
                        {member.sponsorId || "Root"}
                      </td>
                      <td className="py-3.5 px-4 text-[#bdcabc]">
                        {member.city}, {member.state}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        ₹{member.walletBalance.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            member.role === "ADMIN"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-white/10 text-[#bdcabc]"
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            member.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-[#50c878] border border-emerald-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {member.role === "ADMIN" ? (
                          <span className="text-[10px] text-amber-400 font-mono">Protected</span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(member)}
                            disabled={statusUpdatingId === member.id}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              member.status === "ACTIVE"
                                ? "bg-red-950 hover:bg-red-900 text-red-300 border border-red-800"
                                : "bg-emerald-950 hover:bg-emerald-900 text-[#50c878] border border-emerald-800"
                            }`}
                          >
                            {statusUpdatingId === member.id ? (
                              <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                            ) : member.status === "ACTIVE" ? (
                              "Block"
                            ) : (
                              "Activate"
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Financial Audit Ledger Table */}
        <div className="bg-[#0e1d14]/90 border border-[#006d36]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-white">Network Audit Ledger</h3>
              <p className="text-xs text-[#bdcabc]">
                Live feed of all commission credits, matching bonuses, and withdrawals in the system.
              </p>
            </div>
            <span className="text-xs font-mono text-[#50c878] bg-[#006d36]/20 px-3 py-1 rounded-full border border-[#006d36]/40">
              Double-Entry Ledger
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[#bdcabc] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {!stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#bdcabc]/60">
                      No system transactions recorded.
                    </td>
                  </tr>
                ) : (
                  stats.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-[#bdcabc]">{tx.date}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#50c878] block">
                          {tx.member_id}
                        </span>
                        <span className="text-[10px] text-[#bdcabc]">{tx.full_name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white font-mono">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/90">{tx.description}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#50c878]">
                        ₹{parseFloat(tx.amount.toString()).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-[#50c878] border border-emerald-500/30">
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
      </main>
    </div>
  );
}
