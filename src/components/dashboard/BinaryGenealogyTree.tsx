"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  Plus,
  Minus,
  Info,
} from "lucide-react";

export interface TreeNode {
  id: string;
  memberId: string;
  fullName: string;
  avatarUrl?: string;
  status: string;
  personalPv: number;
  leftPv: number;
  rightPv: number;
  carryLeftPv?: number;
  carryRightPv?: number;
  sponsorId?: string;
  activationDate?: string;
  position?: "LEFT" | "RIGHT" | "ROOT";
  leftChild?: TreeNode | null;
  rightChild?: TreeNode | null;
}

interface BinaryGenealogyTreeProps {
  rootNode: TreeNode;
  onSelectRootId?: (id: string) => void;
}

export default function BinaryGenealogyTree({
  rootNode,
  onSelectRootId,
}: BinaryGenealogyTreeProps) {
  // Start with only the root node visible.
  // Clicking '+' on root opens its immediate Left & Right children.
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const isRootExpanded = Boolean(expandedNodes[rootNode.id]);

  return (
    <div className="w-full space-y-6">
      {/* Interactive Visual Binary Tree Canvas */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-sm overflow-x-auto">
        <div className="min-w-[650px] flex flex-col items-center">
          {/* LEVEL 1: ROOT NODE */}
          <div className="flex flex-col items-center mb-6 relative">
            <TreeNodeCard
              node={rootNode}
              leg="ROOT"
              onRootClick={() => onSelectRootId && onSelectRootId(rootNode.memberId)}
              canExpand={true}
              isExpanded={isRootExpanded}
              onToggleExpand={() => toggleExpand(rootNode.id)}
            />
          </div>

          {/* LEVEL 2: LEFT & RIGHT SUB-BRANCHES (Shown ONLY if root is expanded via '+') */}
          {isRootExpanded && (
            <div className="w-full flex flex-col items-center animate-fadeIn">
              {/* Level 1 Connecting Branch Line */}
              <div className="w-1/2 h-8 border-t-2 border-l-2 border-r-2 border-[#006d36] mb-4 relative">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#006d36]" />
              </div>

              <div className="grid grid-cols-2 gap-8 w-full max-w-3xl">
                {/* LEFT LEG */}
                <div className="flex flex-col items-center">
                  {rootNode.leftChild ? (
                    <>
                      <TreeNodeCard
                        node={rootNode.leftChild}
                        leg="LEFT"
                        onRootClick={() =>
                          onSelectRootId && onSelectRootId(rootNode.leftChild!.memberId)
                        }
                        canExpand={true}
                        isExpanded={Boolean(expandedNodes[rootNode.leftChild.id])}
                        onToggleExpand={() => toggleExpand(rootNode.leftChild!.id)}
                      />

                      {/* Level 3 Children (Shown if Left Node is expanded via '+') */}
                      {expandedNodes[rootNode.leftChild.id] && (
                        <div className="w-full flex flex-col items-center animate-fadeIn mt-4">
                          <div className="w-1/2 h-6 border-t-2 border-l-2 border-r-2 border-blue-500 mb-4 relative">
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-500" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 w-full">
                            {/* L - L (Extreme Left Spillover Leg -> Sponsor: Root/YOU, Parent: LeftChild A) */}
                            <div className="flex justify-center">
                              {rootNode.leftChild.leftChild ? (
                                <TreeNodeCard
                                  node={rootNode.leftChild.leftChild}
                                  leg="LEFT"
                                  isSmall
                                  onRootClick={() =>
                                    onSelectRootId &&
                                    onSelectRootId(rootNode.leftChild!.leftChild!.memberId)
                                  }
                                />
                              ) : (
                                <VacantSlot
                                  sponsorId={rootNode.memberId}
                                  parentId={rootNode.leftChild.memberId}
                                  position="LEFT"
                                  isSmall
                                />
                              )}
                            </div>

                            {/* L - R (Inner Right Leg of LeftChild A -> Sponsor: LeftChild A, Parent: LeftChild A) */}
                            <div className="flex justify-center">
                              {rootNode.leftChild.rightChild ? (
                                <TreeNodeCard
                                  node={rootNode.leftChild.rightChild}
                                  leg="RIGHT"
                                  isSmall
                                  onRootClick={() =>
                                    onSelectRootId &&
                                    onSelectRootId(rootNode.leftChild!.rightChild!.memberId)
                                  }
                                />
                              ) : (
                                <VacantSlot
                                  sponsorId={rootNode.leftChild.memberId}
                                  parentId={rootNode.leftChild.memberId}
                                  position="RIGHT"
                                  isSmall
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <VacantSlot
                      sponsorId={rootNode.memberId}
                      parentId={rootNode.memberId}
                      position="LEFT"
                    />
                  )}
                </div>

                {/* RIGHT LEG */}
                <div className="flex flex-col items-center">
                  {rootNode.rightChild ? (
                    <>
                      <TreeNodeCard
                        node={rootNode.rightChild}
                        leg="RIGHT"
                        onRootClick={() =>
                          onSelectRootId && onSelectRootId(rootNode.rightChild!.memberId)
                        }
                        canExpand={true}
                        isExpanded={Boolean(expandedNodes[rootNode.rightChild.id])}
                        onToggleExpand={() => toggleExpand(rootNode.rightChild!.id)}
                      />

                      {/* Level 3 Children (Shown if Right Node is expanded via '+') */}
                      {expandedNodes[rootNode.rightChild.id] && (
                        <div className="w-full flex flex-col items-center animate-fadeIn mt-4">
                          <div className="w-1/2 h-6 border-t-2 border-l-2 border-r-2 border-purple-500 mb-4 relative">
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-purple-500" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 w-full">
                            {/* R - L (Inner Left Leg of RightChild B -> Sponsor: RightChild B, Parent: RightChild B) */}
                            <div className="flex justify-center">
                              {rootNode.rightChild.leftChild ? (
                                <TreeNodeCard
                                  node={rootNode.rightChild.leftChild}
                                  leg="LEFT"
                                  isSmall
                                  onRootClick={() =>
                                    onSelectRootId &&
                                    onSelectRootId(rootNode.rightChild!.leftChild!.memberId)
                                  }
                                />
                              ) : (
                                <VacantSlot
                                  sponsorId={rootNode.rightChild.memberId}
                                  parentId={rootNode.rightChild.memberId}
                                  position="LEFT"
                                  isSmall
                                />
                              )}
                            </div>

                            {/* R - R (Extreme Right Spillover Leg -> Sponsor: Root/YOU, Parent: RightChild B) */}
                            <div className="flex justify-center">
                              {rootNode.rightChild.rightChild ? (
                                <TreeNodeCard
                                  node={rootNode.rightChild.rightChild}
                                  leg="RIGHT"
                                  isSmall
                                  onRootClick={() =>
                                    onSelectRootId &&
                                    onSelectRootId(rootNode.rightChild!.rightChild!.memberId)
                                  }
                                />
                              ) : (
                                <VacantSlot
                                  sponsorId={rootNode.memberId}
                                  parentId={rootNode.rightChild.memberId}
                                  position="RIGHT"
                                  isSmall
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <VacantSlot
                      sponsorId={rootNode.memberId}
                      parentId={rootNode.memberId}
                      position="RIGHT"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Node card with distinct, prominent '+' / '-' toggle button and non-overlapping tooltip
 */
function TreeNodeCard({
  node,
  leg,
  isSmall = false,
  canExpand = false,
  isExpanded = false,
  onToggleExpand,
  onRootClick,
}: {
  node: TreeNode;
  leg: string;
  isSmall?: boolean;
  canExpand?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onRootClick?: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isRed = (node.personalPv || 0) < 100;
  const cardBorder =
    leg === "ROOT"
      ? "border-[#006d36] bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20"
      : isRed
      ? "border-red-400 bg-red-50/30"
      : leg === "LEFT"
      ? "border-blue-400 bg-blue-50/30"
      : "border-purple-400 bg-purple-50/30";

  const formattedActivation = node.activationDate
    ? new Date(node.activationDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not Activated";

  return (
    <div className="relative group/node">
      <div
        className={`rounded-2xl border p-2 sm:p-2.5 transition-all flex flex-col items-center relative ${cardBorder} ${
          isSmall ? "w-28 sm:w-32" : "w-36 sm:w-40"
        }`}
      >
        {/* Top Leg Tag */}
        <div className="flex items-center justify-between w-full mb-1">
          <span
            className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.2 rounded ${
              leg === "ROOT"
                ? "bg-[#006d36] text-white"
                : leg === "LEFT"
                ? "bg-blue-600 text-white"
                : "bg-purple-600 text-white"
            }`}
          >
            {leg}
          </span>

          {/* Quick Info Tooltip Toggle on Mobile / Hover */}
          <button
            type="button"
            onClick={() => setShowTooltip((p) => !p)}
            className="text-gray-400 hover:text-[#006d36] p-0.5"
            title="View PV Ledger"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>

        {/* Avatar / Initials */}
        <button
          type="button"
          onClick={onRootClick}
          className="relative mb-1 cursor-pointer group-hover/node:scale-105 transition-transform"
          title={`Focus on ${node.fullName} (${node.memberId})`}
        >
          {node.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={node.avatarUrl}
              alt={node.fullName}
              className={`rounded-full object-cover border-2 ${
                isRed ? "border-red-400" : "border-emerald-500"
              } ${isSmall ? "w-8 h-8" : "w-10 h-10"}`}
            />
          ) : (
            <div
              className={`rounded-full flex items-center justify-center font-black text-white ${
                leg === "ROOT"
                  ? "bg-[#006d36]"
                  : isRed
                  ? "bg-red-500"
                  : leg === "LEFT"
                  ? "bg-blue-600"
                  : "bg-purple-600"
              } ${isSmall ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"}`}
            >
              {node.fullName ? node.fullName.charAt(0).toUpperCase() : "A"}
            </div>
          )}
        </button>

        {/* Member ID & Name */}
        <button
          type="button"
          onClick={onRootClick}
          className="text-center w-full overflow-hidden cursor-pointer"
        >
          <span className="font-mono font-black text-[10px] sm:text-[11px] text-[#006d36] block truncate">
            {node.memberId}
          </span>
          <span className="font-bold text-[9px] sm:text-[10px] text-[#1a1c1c] block truncate leading-tight">
            {node.fullName}
          </span>
        </button>

        {/* PV Snapshot Badge */}
        <div className="mt-1 flex items-center gap-1 text-[8px] font-mono font-bold">
          <span
            className={`px-1 rounded ${
              isRed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-[#006d36]"
            }`}
          >
            {node.personalPv} PV
          </span>
        </div>

        {/* Prominent Expand '+' / Collapse '-' Button (Never blocks details) */}
        {canExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95 z-10 ${
              isExpanded ? "bg-gray-700 hover:bg-gray-800" : "bg-[#006d36] hover:bg-[#005025]"
            }`}
            title={isExpanded ? "Collapse Children" : "Expand Children (+)"}
            aria-label={isExpanded ? "Collapse Children" : "Expand Children"}
          >
            {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Floating Detailed Tooltip (Fixed position above node so it never overlaps or covers the card) */}
      {(showTooltip || false) && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-white rounded-2xl shadow-2xl border border-emerald-200 text-xs z-50 animate-scaleUp pointer-events-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#e2e2e2] mb-1.5">
            <span className="font-black font-mono text-[#006d36] text-[11px]">{node.memberId}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                isRed
                  ? "bg-red-50 text-red-700 border-red-300"
                  : "bg-emerald-50 text-[#006d36] border-emerald-300"
              }`}
            >
              {isRed ? "RED (<100 PV)" : "ACTIVE"}
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#5f5e5e]">Activation Date:</span>
              <span className="font-bold text-[#1a1c1c]">{formattedActivation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5f5e5e]">Current Self PV:</span>
              <span className="font-black text-[#006d36]">{node.personalPv} PV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5f5e5e]">Sponsor ID:</span>
              <span className="font-bold text-[#1a1c1c]">{node.sponsorId || "Root"}</span>
            </div>
          </div>

          {/* Left & Right Total PV Matching Breakdown */}
          <div className="pt-2 border-t border-[#e2e2e2] grid grid-cols-2 gap-2 text-center font-mono">
            <div className="p-2 bg-blue-50/80 rounded-xl border border-blue-200">
              <span className="text-[9px] uppercase font-bold text-blue-700 block">
                Left Total PV
              </span>
              <span className="font-black text-xs text-blue-800">
                {node.leftPv} PV
              </span>
              {node.carryLeftPv !== undefined && (
                <span className="text-[8px] text-blue-600 block mt-0.5">
                  Carry: {node.carryLeftPv}
                </span>
              )}
            </div>

            <div className="p-2 bg-purple-50/80 rounded-xl border border-purple-200">
              <span className="text-[9px] uppercase font-bold text-purple-700 block">
                Right Total PV
              </span>
              <span className="font-black text-xs text-purple-800">
                {node.rightPv} PV
              </span>
              {node.carryRightPv !== undefined && (
                <span className="text-[8px] text-purple-600 block mt-0.5">
                  Carry: {node.carryRightPv}
                </span>
              )}
            </div>
          </div>

          {/* Mini arrow pointing down to node */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-emerald-300 rotate-45 -mt-1.5" />
        </div>
      )}
    </div>
  );
}

function VacantSlot({
  sponsorId,
  parentId,
  position,
  isSmall = false,
}: {
  sponsorId: string;
  parentId: string;
  position: "LEFT" | "RIGHT";
  isSmall?: boolean;
}) {
  return (
    <Link
      href={`/register?sponsor=${sponsorId}&ref=${sponsorId}&parent=${parentId}&pos=${position}`}
      className={`border-2 border-dashed border-[#bdcabc] rounded-2xl flex flex-col items-center justify-center p-2 text-[#5f5e5e] hover:border-[#006d36] hover:text-[#006d36] hover:bg-emerald-50/50 transition-all ${
        isSmall ? "w-24 h-16 text-[8px]" : "w-32 sm:w-34 h-22 text-[9px]"
      }`}
    >
      <Plus className="w-4 h-4 text-[#006d36] mb-0.5" />
      <span className="font-bold text-[10px]">+ Add Member</span>
      <span className="text-[8px] font-mono text-[#5f5e5e]">{position} Leg</span>
    </Link>
  );
}
