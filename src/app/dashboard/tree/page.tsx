"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search, ArrowLeft } from "lucide-react";
import BinaryGenealogyTree from "@/components/dashboard/BinaryGenealogyTree";
import { BinaryTreeNode, User } from "@/types";
import MemberLayout from "@/components/dashboard/MemberLayout";

export default function TreeViewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tree, setTree] = useState<BinaryTreeNode | null>(null);
  const [searchId, setSearchId] = useState("");
  const [currentRootId, setCurrentRootId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.success && meData.user) {
          setUser(meData.user);
          setCurrentRootId(meData.user.memberId);
          await loadTree(meData.user.memberId);
        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const loadTree = async (memberId: string) => {
    setSearching(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/binary/tree/${memberId}`);
      const data = await res.json();
      if (data.success && data.tree) {
        setTree(data.tree);
        setCurrentRootId(memberId);
      } else {
        setErrorMsg(data.message || "Member tree not found.");
      }
    } catch {
      setErrorMsg("Network error fetching tree hierarchy.");
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      loadTree(searchId.trim().toUpperCase());
    }
  };

  const handleResetToSelf = () => {
    if (user) {
      setSearchId("");
      loadTree(user.memberId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#006d36] mb-3" />
        <span className="text-sm font-bold text-[#006d36]">Loading Binary Genealogy Tree...</span>
      </div>
    );
  }

  return (
    <MemberLayout user={user}>
      {/* Sub Header */}
      <div className="h-16 bg-white border-b border-[#e2e2e2] sticky top-0 z-30 px-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-[#e2e2e2] hover:bg-[#f9f9f9] text-[#5f5e5e] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[#1a1c1c]">Binary Genealogy Tree</h1>
            <span className="text-xs text-[#5f5e5e]">
              Viewing Downline of: <strong className="font-mono text-[#006d36]">{currentRootId}</strong>
            </span>
          </div>
        </div>

        {/* Tree Search Box */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5f5e5e]/50" />
            <input
              type="text"
              placeholder="Search Member ID (AVxxxxx)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl focus:ring-1 focus:ring-[#006d36] outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2 bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Explore"}
          </button>
          {user && currentRootId !== user.memberId && (
            <button
              type="button"
              onClick={handleResetToSelf}
              className="px-3 py-2 border border-[#006d36] text-[#006d36] text-xs font-bold rounded-xl hover:bg-emerald-50 transition-colors"
            >
              My Root
            </button>
          )}
        </form>
      </div>

      {/* Main Tree Canvas */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {tree ? (
          <BinaryGenealogyTree rootNode={tree} />
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#e2e2e2]">
            <p className="text-sm text-[#5f5e5e]">No tree found for this member ID.</p>
          </div>
        )}
      </main>
    </MemberLayout>
  );
}
