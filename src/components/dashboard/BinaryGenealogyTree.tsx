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
                            {/* L - L */}
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
                                  parentId={rootNode.leftChild.memberId}
                                  position="LEFT"
                                  isSmall
                                />
                              )}
                            </div>

                            {/* L - R */}
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
                    <VacantSlot parentId={rootNode.memberId} position="LEFT" />
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
                            {/* R - L */}
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
                                  parentId={rootNode.rightChild.memberId}
                                  position="LEFT"
                                  isSmall
                                />
                              )}
                            </div>

                            {/* R - R */}
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
                    <VacantSlot parentId={rootNode.memberId} position="RIGHT" />
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
  const isRed = node.personalPv < 100;

  const formattedActivation = node.activationDate
    ? new Date(node.activationDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recent";

  return (
    <div className="relative flex flex-col items-center">
      {/* Node Card - Clickable */}
      <div
        onClick={() => {
          if (canExpand && onToggleExpand) {
            onToggleExpand();
          } else if (onRootClick) {
            onRootClick();
          }
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`relative flex flex-col items-center pt-2.5 pb-4 px-2 rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all cursor-pointer select-none group ${
          isSmall ? "w-24" : "w-32 sm:w-34"
        } ${
          isRed
            ? "border-red-300 hover:border-red-500"
            : "border-emerald-300 hover:border-[#006d36]"
        }`}
      >
        {/* Compact User Head Avatar */}
        <div className="relative mb-1">
          {node.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={node.avatarUrl}
              alt={node.fullName}
              className={`rounded-full object-cover border-2 shadow-xs ${
                isSmall ? "w-8 h-8" : "w-9 h-9"
              } ${isRed ? "border-red-400" : "border-[#006d36]"}`}
            />
          ) : (
            <div
              className={`rounded-full flex items-center justify-center font-bold text-white shadow-xs ${
                isSmall ? "w-8 h-8 text-[10px]" : "w-9 h-9 text-xs"
              } ${
                isRed
                  ? "bg-gradient-to-tr from-red-600 to-rose-400"
                  : "bg-gradient-to-tr from-[#006d36] to-[#50c878]"
              }`}
            >
              <UserIcon className={isSmall ? "w-4 h-4" : "w-4.5 h-4.5"} />
            </div>
          )}

          {/* Status Dot */}
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
              isRed ? "bg-red-500" : "bg-[#50c878]"
            }`}
          />
        </div>

        {/* Member ID */}
        <span
          className={`font-mono font-black truncate max-w-full text-center text-[11px] leading-tight ${
            isRed ? "text-red-700" : "text-[#006d36]"
          }`}
        >
          {node.memberId}
        </span>

        {/* Full Name */}
        <span className="font-bold text-[10px] text-[#1a1c1c] truncate max-w-full text-center leading-tight mt-0.5">
          {node.fullName}
        </span>

        {/* Leg Tag */}
        <span
          className={`text-[8px] font-black uppercase px-2 py-0.2 rounded-full mt-1 ${
            leg === "LEFT"
              ? "bg-blue-50 text-blue-700"
              : leg === "RIGHT"
              ? "bg-purple-50 text-purple-700"
              : "bg-emerald-50 text-[#006d36]"
          }`}
        >
          {leg}
        </span>

        {/* Prominent '+' / '-' Toggle Button (Always on top with z-30) */}
        {canExpand && onToggleExpand && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition-transform active:scale-90 z-30 ${
              isExpanded
                ? "bg-gray-700 hover:bg-gray-800"
                : "bg-[#006d36] hover:bg-[#005025]"
            }`}
            title={isExpanded ? "Click to Collapse Branch" : "Click to Expand Branch (+)"}
            aria-label={isExpanded ? "Collapse Branch" : "Expand Branch"}
          >
            {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Hover Tooltip Card (Positioned ABOVE to NEVER block the '+' button below) */}
      {showTooltip && (
        <div className="absolute bottom-full mb-3 z-50 w-64 bg-white/98 backdrop-blur-md rounded-2xl p-4 border border-emerald-300 shadow-2xl space-y-2.5 text-xs text-[#1a1c1c] animate-fadeIn pointer-events-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#e2e2e2]">
            <div>
              <span className="font-black text-sm text-[#1a1c1c] block">
                {node.fullName}
              </span>
              <span className="font-mono text-xs font-bold text-[#006d36]">
                {node.memberId}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
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
              <span className="font-black text-[#006d36]">+{node.personalPv} PV</span>
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
  parentId,
  position,
  isSmall = false,
}: {
  parentId: string;
  position: "LEFT" | "RIGHT";
  isSmall?: boolean;
}) {
  return (
    <Link
      href={`/register?ref=${parentId}&pos=${position}`}
      className={`border-2 border-dashed border-[#bdcabc] rounded-2xl flex flex-col items-center justify-center p-2 text-[#5f5e5e] hover:border-[#006d36] hover:text-[#006d36] hover:bg-emerald-50/50 transition-all ${
        isSmall ? "w-24 h-16 text-[8px]" : "w-32 sm:w-34 h-22 text-[9px]"
      }`}
    >
      <Plus className="w-4 h-4 text-[#006d36] mb-0.5" />
      <span className="font-bold text-[10px]">+ Empty</span>
      <span className="text-[8px] font-mono text-[#5f5e5e]">{position} Leg</span>
    </Link>
  );
}
