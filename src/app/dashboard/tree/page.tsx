"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import BinaryGenealogyTree, { TreeNode } from "@/components/member/BinaryGenealogyTree";
import MemberLayout from "@/components/member/MemberLayout";

export default function TreeViewPage() {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [currentRootId, setCurrentRootId] = useState<string>("");
  const [myMemberId, setMyMemberId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ memberId: string; fullName: string; position?: string }>>([]);
  const [parentMemberId, setParentMemberId] = useState<string | null>(null);
  const [totalNetworkMembers, setTotalNetworkMembers] = useState<number>(0);

  const loadTree = async (memberId?: string) => {
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
        setTotalNetworkMembers(Number(data.totalTeamCount ?? data.tree.totalTeamCount ?? 0));
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
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetToSelf = () => {
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
      <div className="space-y-4 animate-fadeIn w-full pb-12">
        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-rose-600 font-black">⚠️</span>
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg("")}
              className="text-rose-500 hover:text-rose-800 text-xs font-black cursor-pointer px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Visual Binary Tree Canvas with integrated Search & Zoom Controls */}
        {tree && (
          <BinaryGenealogyTree
            rootNode={tree}
            onSelectRootId={(id) => loadTree(id)}
            breadcrumbs={breadcrumbs}
            parentMemberId={parentMemberId}
            viewerMemberId={myMemberId || tree.memberId}
            onSearch={(id) => loadTree(id)}
            onResetRoot={handleResetToSelf}
            isCustomRoot={currentRootId !== myMemberId}
            totalNetworkMembers={totalNetworkMembers}
          />
        )}
      </div>
    </MemberLayout>
  );
}
