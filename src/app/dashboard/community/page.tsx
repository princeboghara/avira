"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import MemberLayout from "@/components/member/MemberLayout";
import BinaryGenealogyTree from "@/components/member/BinaryGenealogyTree";
import { User, BinaryTreeNode } from "@/types";
import {
  Loader2,
  GitBranch,
  Users,
  ArrowLeftRight,
  Copy,
  CheckCircle2,
  Share2,
  ExternalLink,
} from "lucide-react";

interface MemberItem {
  id: string;
  memberId: string;
  fullName: string;
  mobile: string;
  status: string;
  personalPv: number;
  dailyCapping: number;
  position: string;
  joinedDate: string;
}

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [treeData, setTreeData] = useState<BinaryTreeNode | null>(null);
  const [directList, setDirectList] = useState<MemberItem[]>([]);
  const [leftTeamList, setLeftTeamList] = useState<MemberItem[]>([]);
  const [rightTeamList, setRightTeamList] = useState<MemberItem[]>([]);
  const [stats, setStats] = useState<{
    totalDirect: number;
    totalLeft: number;
    totalRight: number;
    leftPv: number;
    rightPv: number;
  }>({
    totalDirect: 0,
    totalLeft: 0,
    totalRight: 0,
    leftPv: 0,
    rightPv: 0,
  });

  const [activeTab, setActiveTab] = useState<"TREE" | "DIRECT" | "LEFT" | "RIGHT">("TREE");
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();

        if (userData.success && userData.user) {
          setUser(userData.user);

          // 1. Fetch Tree
          const treeRes = await fetch(`/api/binary/tree/${userData.user.memberId}`);
          const treeJson = await treeRes.json();
          if (treeJson.success) {
            setTreeData(treeJson.data || treeJson.tree);
          }

          // 2. Fetch Community Members Data
          const commRes = await fetch("/api/community/members");
          const commJson = await commRes.json();
          if (commJson.success && commJson.data) {
            setDirectList(commJson.data.directReferrals || []);
            setLeftTeamList(commJson.data.leftTeam || []);
            setRightTeamList(commJson.data.rightTeam || []);
            setStats(commJson.data.stats || {});
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const referralUrl = user
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${user.memberId}`
    : "";

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
        <span className="text-sm font-bold text-[#006d36]">Loading My Community...</span>
      </div>
    );
  }

  return (
    <MemberLayout user={user}>
      <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header & Referral Link Box */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c]">My Community</h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Explore your tree genealogy, direct referrals, and Left/Right power teams.
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#e2e2e2] shadow-xs">
              <span className="text-xs font-mono font-bold text-[#006d36] px-2 truncate max-w-[200px]">
                {user.memberId} Referral Link
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
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
          )}
        </div>

        {/* Community KPI Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("DIRECT")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === "DIRECT"
                ? "bg-emerald-50 border-[#006d36] shadow-sm"
                : "bg-white border-[#e2e2e2] hover:border-gray-300"
            }`}
          >
            <span className="text-[10px] text-[#5f5e5e] uppercase tracking-wider font-bold block mb-1">
              My Direct Referrals
            </span>
            <span className="text-2xl font-mono font-black text-[#006d36]">
              {stats.totalDirect}
            </span>
            <span className="text-[10px] text-[#5f5e5e] block mt-0.5">Sponsor direct line</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("TREE")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === "TREE"
                ? "bg-emerald-50 border-[#006d36] shadow-sm"
                : "bg-white border-[#e2e2e2] hover:border-gray-300"
            }`}
          >
            <span className="text-[10px] text-[#5f5e5e] uppercase tracking-wider font-bold block mb-1">
              My Binary Tree
            </span>
            <span className="text-2xl font-mono font-black text-[#1a1c1c]">
              {stats.totalLeft + stats.totalRight}
            </span>
            <span className="text-[10px] text-[#5f5e5e] block mt-0.5">Total network size</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("LEFT")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === "LEFT"
                ? "bg-blue-50 border-blue-500 shadow-sm"
                : "bg-white border-[#e2e2e2] hover:border-gray-300"
            }`}
          >
            <span className="text-[10px] text-blue-700 uppercase tracking-wider font-bold block mb-1">
              My Left Team
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-black text-blue-900">
                {stats.leftPv.toLocaleString()} PV
              </span>
              <span className="text-xs text-blue-700 font-bold">({stats.totalLeft} Members)</span>
            </div>
            <span className="text-[10px] text-blue-600 block mt-0.5">Left Leg Power Line</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RIGHT")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === "RIGHT"
                ? "bg-purple-50 border-purple-500 shadow-sm"
                : "bg-white border-[#e2e2e2] hover:border-gray-300"
            }`}
          >
            <span className="text-[10px] text-purple-700 uppercase tracking-wider font-bold block mb-1">
              My Right Team
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-black text-purple-900">
                {stats.rightPv.toLocaleString()} PV
              </span>
              <span className="text-xs text-purple-700 font-bold">({stats.totalRight} Members)</span>
            </div>
            <span className="text-[10px] text-purple-600 block mt-0.5">Right Leg Power Line</span>
          </button>
        </div>

        {/* 4 Community Sub-section Tabs */}
        <div className="flex items-center gap-2 border-b border-[#e2e2e2] pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("TREE")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "TREE"
                ? "bg-[#006d36] text-white shadow-sm"
                : "bg-white text-[#5f5e5e] hover:text-[#1a1c1c] border border-[#e2e2e2]"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>My Tree (Family Genealogy)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("DIRECT")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "DIRECT"
                ? "bg-[#006d36] text-white shadow-sm"
                : "bg-white text-[#5f5e5e] hover:text-[#1a1c1c] border border-[#e2e2e2]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>My Direct Referrals ({stats.totalDirect})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("LEFT")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "LEFT"
                ? "bg-blue-700 text-white shadow-sm"
                : "bg-white text-[#5f5e5e] hover:text-[#1a1c1c] border border-[#e2e2e2]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>My Left Team ({stats.totalLeft})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RIGHT")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "RIGHT"
                ? "bg-purple-700 text-white shadow-sm"
                : "bg-white text-[#5f5e5e] hover:text-[#1a1c1c] border border-[#e2e2e2]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>My Right Team ({stats.totalRight})</span>
          </button>
        </div>

        {/* Tab 1: MY TREE */}
        {activeTab === "TREE" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#1a1c1c]">Binary Family Tree</h3>
                <p className="text-xs text-[#5f5e5e]">
                  Vacant spots allow 1-click downline placement with Sponsor and Position locked automatically.
                </p>
              </div>
              <Link
                href="/dashboard/tree"
                className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
              >
                <span>Full Screen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {treeData ? (
              <BinaryGenealogyTree rootNode={treeData} viewerMemberId={user?.memberId} />
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#e2e2e2]">
                <p className="text-xs text-[#5f5e5e]">No tree data found for this account.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: MY DIRECT REFERRALS */}
        {activeTab === "DIRECT" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-[#1a1c1c]">Directly Sponsored Associates</h3>
              <p className="text-xs text-[#5f5e5e]">
                Members registered using your referral sponsor code ({user?.memberId}).
              </p>
            </div>

            <MemberTable members={directList} emptyMessage="No direct referrals registered yet. Share your sponsor link above to grow your team!" />
          </div>
        )}

        {/* Tab 3: MY LEFT TEAM */}
        {activeTab === "LEFT" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-blue-900">Left Power Leg Team</h3>
                <p className="text-xs text-[#5f5e5e]">
                  All associates placed in your left binary subtree ({stats.leftPv} Total Left PV).
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200">
                Left Leg Volume: {stats.leftPv} PV
              </span>
            </div>

            <MemberTable members={leftTeamList} emptyMessage="No downlines on Left Leg yet. Place members on Left Leg to build volume!" />
          </div>
        )}

        {/* Tab 4: MY RIGHT TEAM */}
        {activeTab === "RIGHT" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-purple-900">Right Power Leg Team</h3>
                <p className="text-xs text-[#5f5e5e]">
                  All associates placed in your right binary subtree ({stats.rightPv} Total Right PV).
                </p>
              </div>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl border border-purple-200">
                Right Leg Volume: {stats.rightPv} PV
              </span>
            </div>

            <MemberTable members={rightTeamList} emptyMessage="No downlines on Right Leg yet. Place members on Right Leg to build volume!" />
          </div>
        )}
      </main>
    </MemberLayout>
  );
}

function MemberTable({ members, emptyMessage }: { members: MemberItem[]; emptyMessage: string }) {
  if (members.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-[#e2e2e2]">
        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-xs text-[#5f5e5e]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#e2e2e2] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f9f9f9] border-b border-[#e2e2e2] text-[#5f5e5e] uppercase text-[10px] tracking-wider font-bold">
            <tr>
              <th className="py-3.5 px-4">Member ID</th>
              <th className="py-3.5 px-4">Associate Name</th>
              <th className="py-3.5 px-4">Mobile</th>
              <th className="py-3.5 px-4">Personal PV</th>
              <th className="py-3.5 px-4">Daily Cap</th>
              <th className="py-3.5 px-4">Position</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e2e2]">
            {members.map((m) => {
              const isGreen = m.personalPv >= 100;
              return (
                <tr key={m.id} className="hover:bg-[#f9f9f9]/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#006d36]">
                    {m.memberId}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-[#1a1c1c]">
                    {m.fullName}
                  </td>
                  <td className="py-3.5 px-4 text-[#5f5e5e] font-mono">
                    {m.mobile}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-[#1a1c1c]">
                    {m.personalPv} PV
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#006d36]">
                    ₹{m.dailyCapping.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.position === "LEFT"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {m.position}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isGreen
                          ? "bg-emerald-50 text-[#006d36] border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {isGreen ? "Active" : "Red"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#5f5e5e]">
                    {m.joinedDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
