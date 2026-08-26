"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import MemberNavbar from "@/components/dashboard/MemberNavbar";
import BinaryGenealogyTree from "@/components/dashboard/BinaryGenealogyTree";
import { User, BinaryTreeNode } from "@/types";
import {
  Loader2,
  Users,
  Copy,
  CheckCircle2,
  Share2,
  GitBranch,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [treeData, setTreeData] = useState<BinaryTreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();

        if (userData.success && userData.user) {
          setUser(userData.user);

          const treeRes = await fetch(`/api/binary/tree/${userData.user.memberId}`);
          const treeJson = await treeRes.json();
          if (treeJson.success) {
            setTreeData(treeJson.data);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const referralUrl = user ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${user.memberId}` : "";

  const handleCopyLink = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#006d36] mb-3" />
        <span className="text-sm font-bold text-[#006d36]">Loading Community & Team Tree...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-[#1a1c1c] mb-2">Session Expired</h2>
        <p className="text-xs text-[#5f5e5e] mb-4">Please log in to view your team community.</p>
        <Link href="/login" className="px-6 py-2.5 bg-[#006d36] text-white rounded-xl text-xs font-bold shadow-md">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans selection:bg-[#50c878] selection:text-[#005025]">
      {/* Universal Member Navigation Menu Bar */}
      <MemberNavbar user={user} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header & Referral Link Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c]">My Community</h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Your network team, direct referrals, and interactive 1:1 binary genealogy tree.
            </p>
          </div>

          {/* Referral Link Box */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#e2e2e2] shadow-xs">
            <span className="text-[11px] font-mono font-bold text-[#006d36] px-2 truncate max-w-[220px]">
              {user.memberId} Referral Link
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-2 bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
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

        {/* Community KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e2e2e2] shadow-xs">
            <span className="text-[10px] text-[#5f5e5e] uppercase tracking-wider font-bold block mb-1">
              Direct Referrals
            </span>
            <span className="text-2xl font-mono font-black text-[#006d36]">
              {user.directReferralsCount}
            </span>
            <span className="text-[10px] text-[#5f5e5e] block mt-1">Directly sponsored by you</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e2e2e2] shadow-xs">
            <span className="text-[10px] text-[#5f5e5e] uppercase tracking-wider font-bold block mb-1">
              Total Community Size
            </span>
            <span className="text-2xl font-mono font-black text-[#1a1c1c]">
              {user.totalTeamCount}
            </span>
            <span className="text-[10px] text-[#5f5e5e] block mt-1">All downlines in tree</span>
          </div>

          <div className="bg-[#f0f3ff] p-5 rounded-2xl border border-blue-200 shadow-xs">
            <span className="text-[10px] text-blue-700 uppercase tracking-wider font-bold block mb-1">
              Left Leg Volume
            </span>
            <span className="text-2xl font-mono font-black text-blue-900">
              {user.leftPv.toLocaleString()} PV
            </span>
            <span className="text-[10px] text-blue-600 block mt-1 font-semibold">
              {user.leftPv >= user.rightPv ? "Power Leg (Carry Forward)" : "Volume Active"}
            </span>
          </div>

          <div className="bg-[#f5f0ff] p-5 rounded-2xl border border-purple-200 shadow-xs">
            <span className="text-[10px] text-purple-700 uppercase tracking-wider font-bold block mb-1">
              Right Leg Volume
            </span>
            <span className="text-2xl font-mono font-black text-purple-900">
              {user.rightPv.toLocaleString()} PV
            </span>
            <span className="text-[10px] text-purple-600 block mt-1 font-semibold">
              {user.rightPv >= user.leftPv ? "Power Leg (Carry Forward)" : "Volume Active"}
            </span>
          </div>
        </div>

        {/* Interactive Binary Genealogy Tree */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006d36] flex items-center justify-center">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#1a1c1c]">Interactive Binary Family Tree</h2>
                <p className="text-xs text-[#5f5e5e]">
                  Click any node to inspect PV. Click vacant slots to place new downlines directly (Sponsor & Position are locked automatically).
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/tree"
              className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
            >
              <span>Full View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {treeData ? (
            <BinaryGenealogyTree rootNode={treeData} />
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#e2e2e2]">
              <p className="text-xs text-[#5f5e5e]">No binary tree data found for this account.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
