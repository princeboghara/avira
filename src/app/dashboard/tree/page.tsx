"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Search,
  ArrowLeft,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import BinaryGenealogyTree, { TreeNode } from "@/components/member/BinaryGenealogyTree";
import MemberLayout from "@/components/member/MemberLayout";

export default function TreeViewPage() {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [searchId, setSearchId] = useState("");
  const [currentRootId, setCurrentRootId] = useState<string>("");
  const [myMemberId, setMyMemberId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ memberId: string; fullName: string; position?: string }>>([]);
  const [parentMemberId, setParentMemberId] = useState<string | null>(null);

  const loadTree = async (memberId?: string) => {
    setSearching(true);
    setErrorMsg("");
    try {
      const url = memberId
        ? `/api/member/tree?root=${encodeURIComponent(memberId)}`
        : "/api/member/tree";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.tree) {
        setTree(data.tree);
        setCurrentRootId(data.tree.memberId);
        setBreadcrumbs(data.breadcrumbs || []);
        setParentMemberId(data.parentMemberId || null);
        if (!myMemberId && !memberId) {
          setMyMemberId(data.tree.memberId);
        }
      } else {
        setErrorMsg(data.message || "Associate tree not found.");
      }
    } catch {
      setErrorMsg("Network error fetching binary tree.");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      loadTree(searchId.trim().toUpperCase());
    }
  };

  const handleResetToSelf = () => {
    setSearchId("");
    if (myMemberId) {
      loadTree(myMemberId);
    } else {
      loadTree();
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#006d36]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-bold">Loading Binary Tree...</span>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
        {/* Top Header & Search Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                My Community
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                3. My Tree (Binary Hierarchy)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Interactive Binary Genealogy Tree
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Rooted at Associate: <strong className="font-mono text-[#006d36]">{currentRootId}</strong>. Hover any node to view PV matching and credentials.
            </p>
          </div>

          {/* Search Downline ID Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Downline ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                className="w-48 sm:w-56 bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-2.5 pl-10 pr-3 font-mono font-bold text-xs text-[#1a1c1c] uppercase outline-none focus:border-[#006d36]"
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-60"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "View"}
            </button>

            {currentRootId !== myMemberId && (
              <button
                type="button"
                onClick={handleResetToSelf}
                className="p-2.5 rounded-xl border border-[#e2e2e2] text-[#5f5e5e] hover:bg-emerald-50 hover:text-[#006d36] cursor-pointer transition-colors"
                title="Reset Tree to My Root"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Visual Binary Tree Canvas */}
        {tree && (
          <BinaryGenealogyTree
            rootNode={tree}
            onSelectRootId={(id) => loadTree(id)}
            breadcrumbs={breadcrumbs}
            parentMemberId={parentMemberId}
            viewerMemberId={myMemberId || tree.memberId}
          />
        )}
      </div>
    </MemberLayout>
  );
}
