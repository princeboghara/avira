"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Minus,
  Info,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  ArrowUp,
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
  sponsorName?: string;
  activationDate?: string;
  position?: "LEFT" | "RIGHT" | "TOP" | "ROOT";
  leftChild?: TreeNode | null;
  rightChild?: TreeNode | null;
  hasLeftChild?: boolean;
  hasRightChild?: boolean;
  hasMoreChildren?: boolean;
  parentMemberId?: string | null;
}

interface BinaryGenealogyTreeProps {
  rootNode: TreeNode;
  onSelectRootId?: (id: string) => void;
  breadcrumbs?: Array<{ memberId: string; fullName: string; position?: string }>;
  parentMemberId?: string | null;
  viewerMemberId?: string;
}

export default function BinaryGenealogyTree({
  rootNode,
  onSelectRootId,
  breadcrumbs = [],
  parentMemberId,
  viewerMemberId,
}: BinaryGenealogyTreeProps) {
  // Tree state holding the full tree hierarchy
  const [treeData, setTreeData] = useState<TreeNode>(rootNode);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [rootNode.id]: true,
  });
  const [loadingNodes, setLoadingNodes] = useState<Record<string, boolean>>({});
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Sync rootNode when parent changes it
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTreeData(rootNode);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedNodes((prev) => ({
      ...prev,
      [rootNode.id]: true,
      ...(rootNode.leftChild ? { [rootNode.leftChild.id]: true } : {}),
      ...(rootNode.rightChild ? { [rootNode.rightChild.id]: true } : {}),
    }));
  }, [rootNode]);

  // Recursively update a node in treeData
  const updateNodeInTree = (targetId: string, updatedChildren: { leftChild?: TreeNode | null; rightChild?: TreeNode | null }) => {
    const updateRecursive = (current: TreeNode): TreeNode => {
      if (current.id === targetId || current.memberId === targetId) {
        return {
          ...current,
          leftChild: updatedChildren.leftChild !== undefined ? updatedChildren.leftChild : current.leftChild,
          rightChild: updatedChildren.rightChild !== undefined ? updatedChildren.rightChild : current.rightChild,
          hasMoreChildren: false,
        };
      }
      return {
        ...current,
        leftChild: current.leftChild ? updateRecursive(current.leftChild) : null,
        rightChild: current.rightChild ? updateRecursive(current.rightChild) : null,
      };
    };

    setTreeData((prev) => updateRecursive(prev));
  };

  // Toggle or load children dynamically
  const handleToggleExpand = async (node: TreeNode) => {
    const isCurrentlyExpanded = Boolean(expandedNodes[node.id]);

    if (isCurrentlyExpanded) {
      setExpandedNodes((prev) => ({ ...prev, [node.id]: false }));
      return;
    }

    if (node.leftChild !== undefined && node.rightChild !== undefined) {
      setExpandedNodes((prev) => ({ ...prev, [node.id]: true }));
      return;
    }

    setLoadingNodes((prev) => ({ ...prev, [node.id]: true }));
    try {
      const res = await fetch(`/api/member/tree?rootId=${node.memberId}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.tree) {
        updateNodeInTree(node.id, {
          leftChild: data.tree.leftChild || null,
          rightChild: data.tree.rightChild || null,
        });
        setExpandedNodes((prev) => ({
          ...prev,
          [node.id]: true,
          ...(data.tree.leftChild ? { [data.tree.leftChild.id]: true } : {}),
          ...(data.tree.rightChild ? { [data.tree.rightChild.id]: true } : {}),
        }));
      } else {
        setExpandedNodes((prev) => ({ ...prev, [node.id]: true }));
      }
    } catch {
      setExpandedNodes((prev) => ({ ...prev, [node.id]: true }));
    } finally {
      setLoadingNodes((prev) => ({ ...prev, [node.id]: false }));
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Controls Strip: Breadcrumb Trail + Zoom Buttons */}
      <div className="glass-panel p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[#64748b] font-bold mr-1">Hierarchy Path:</span>
          {breadcrumbs.map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={b.memberId}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />}
                <button
                  type="button"
                  onClick={() => onSelectRootId && onSelectRootId(b.memberId)}
                  className={`px-3 py-1 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                    isLast
                      ? "neo-btn-primary font-black"
                      : "neo-btn-secondary"
                  }`}
                  title={`Jump to ${b.fullName} (${b.memberId})`}
                >
                  <span>{b.memberId}</span>
                  <span className="text-[10px] opacity-80 font-normal ml-1">({b.fullName})</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Controls: Up, Reset, Zoom */}
        <div className="flex items-center gap-2">
          {parentMemberId && (
            <button
              type="button"
              onClick={() => onSelectRootId && onSelectRootId(parentMemberId)}
              className="neo-btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Navigate Up to Parent"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Up to Parent</span>
            </button>
          )}

          <div className="flex items-center neo-inset rounded-2xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 text-[#64748b] hover:text-[#0f172a] rounded-xl hover:bg-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1.5 text-[#0f172a] min-w-[36px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 text-[#64748b] hover:text-[#0f172a] rounded-xl hover:bg-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(1)}
              className="p-1.5 text-[#64748b] hover:text-[#0f172a] rounded-xl hover:bg-white transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="glass-card rounded-[32px] p-6 sm:p-10 overflow-x-auto min-h-[500px]">
        <div
          className="flex justify-center transition-transform duration-200 origin-top min-w-max pb-12"
          style={{ transform: `scale(${zoomScale})` }}
        >
          <RecursiveTreeNode
            node={treeData}
            level={1}
            leg="ROOT"
            expandedNodes={expandedNodes}
            loadingNodes={loadingNodes}
            onToggleExpand={handleToggleExpand}
            onSelectRootId={onSelectRootId}
            isExtremeLeft={true}
            isExtremeRight={true}
            viewerMemberId={viewerMemberId || rootNode.memberId}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Truly recursive binary tree node renderer
 */
function RecursiveTreeNode({
  node,
  level,
  leg,
  expandedNodes,
  loadingNodes,
  onToggleExpand,
  onSelectRootId,
  isExtremeLeft = false,
  isExtremeRight = false,
  viewerMemberId,
}: {
  node: TreeNode;
  level: number;
  leg: "ROOT" | "LEFT" | "RIGHT";
  expandedNodes: Record<string, boolean>;
  loadingNodes: Record<string, boolean>;
  onToggleExpand: (node: TreeNode) => void;
  onSelectRootId?: (id: string) => void;
  isExtremeLeft?: boolean;
  isExtremeRight?: boolean;
  viewerMemberId?: string;
}) {
  const isExpanded = Boolean(expandedNodes[node.id]);
  const isLoading = Boolean(loadingNodes[node.id]);

  const canExpand = Boolean(
    node.leftChild ||
    node.rightChild ||
    node.hasLeftChild ||
    node.hasRightChild ||
    node.hasMoreChildren
  );

  const effectiveViewerId = viewerMemberId || node.memberId;
  const leftSponsorId = isExtremeLeft ? effectiveViewerId : node.memberId;
  const rightSponsorId = isExtremeRight ? effectiveViewerId : node.memberId;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <TreeNodeCard
        node={node}
        leg={leg}
        level={level}
        canExpand={canExpand}
        isExpanded={isExpanded}
        isLoading={isLoading}
        onToggleExpand={() => onToggleExpand(node)}
        onRootClick={() => onSelectRootId && onSelectRootId(node.memberId)}
      />

      {/* Children Sub-branch */}
      {isExpanded && (
        <div className="flex flex-col items-center mt-3 animate-fadeIn w-full">
          {/* Connector Line from Parent */}
          <div className="w-0.5 h-6 bg-[#006d36] relative" />

          {/* Horizontal Split Line */}
          <div className="w-full flex items-center justify-center relative">
            <div className="w-1/2 h-0.5 bg-[#006d36]" />
            <div className="w-1/2 h-0.5 bg-indigo-500" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#006d36] border-2 border-white shadow-xs" />
          </div>

          <div className="flex items-start justify-center gap-8 sm:gap-14 pt-2">
            {/* LEFT LEG CONTAINER */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-3 bg-[#006d36] mb-1" />
              {node.leftChild ? (
                <RecursiveTreeNode
                  node={node.leftChild}
                  level={level + 1}
                  leg="LEFT"
                  expandedNodes={expandedNodes}
                  loadingNodes={loadingNodes}
                  onToggleExpand={onToggleExpand}
                  onSelectRootId={onSelectRootId}
                  isExtremeLeft={isExtremeLeft}
                  isExtremeRight={false}
                  viewerMemberId={effectiveViewerId}
                />
              ) : (
                <VacantSlot
                  sponsorId={leftSponsorId}
                  parentId={node.memberId}
                  position="LEFT"
                />
              )}
            </div>

            {/* RIGHT LEG CONTAINER */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-3 bg-indigo-500 mb-1" />
              {node.rightChild ? (
                <RecursiveTreeNode
                  node={node.rightChild}
                  level={level + 1}
                  leg="RIGHT"
                  expandedNodes={expandedNodes}
                  loadingNodes={loadingNodes}
                  onToggleExpand={onToggleExpand}
                  onSelectRootId={onSelectRootId}
                  isExtremeLeft={false}
                  isExtremeRight={isExtremeRight}
                  viewerMemberId={effectiveViewerId}
                />
              ) : (
                <VacantSlot
                  sponsorId={rightSponsorId}
                  parentId={node.memberId}
                  position="RIGHT"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Node card with live PV, tactile elevation, and dynamic expand button
 */
function TreeNodeCard({
  node,
  leg,
  level,
  canExpand = false,
  isExpanded = false,
  isLoading = false,
  onToggleExpand,
  onRootClick,
}: {
  node: TreeNode;
  leg: "ROOT" | "LEFT" | "RIGHT";
  level: number;
  canExpand?: boolean;
  isExpanded?: boolean;
  isLoading?: boolean;
  onToggleExpand?: () => void;
  onRootClick?: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isRed = (node.personalPv || 0) < 100;
  const isSmall = level > 3;

  const cardBorder =
    leg === "ROOT"
      ? "border-[#006d36] bg-emerald-500/10 shadow-[0_8px_20px_rgba(0,109,54,0.12)]"
      : isRed
      ? "border-rose-400/80 bg-rose-500/10 shadow-xs"
      : leg === "LEFT"
      ? "border-emerald-400/80 bg-emerald-500/10 shadow-xs"
      : "border-indigo-400/80 bg-indigo-500/10 shadow-xs";

  const formattedActivation = node.activationDate
    ? new Date(node.activationDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Verified";

  return (
    <div className="relative group/node">
      <div
        className={`glass-card rounded-2xl border p-2.5 sm:p-3 transition-all flex flex-col items-center relative ${cardBorder} ${
          isSmall ? "w-32 sm:w-36" : "w-36 sm:w-44"
        }`}
      >
        {/* Top Leg & Info Bar */}
        <div className="flex items-center justify-between w-full mb-1">
          <span
            className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-md ${
              leg === "ROOT"
                ? "bg-[#006d36] text-white"
                : leg === "LEFT"
                ? "bg-[#006d36] text-white"
                : "bg-indigo-600 text-white"
            }`}
          >
            {leg}
          </span>

          <button
            type="button"
            onClick={() => setShowTooltip((p) => !p)}
            className="text-[#94a3b8] hover:text-[#006d36] p-0.5 transition-colors cursor-pointer"
            title="View PV and Sponsor Details"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Avatar / Initials */}
        <button
          type="button"
          onClick={onRootClick}
          className="relative mb-1 cursor-pointer group-hover/node:scale-105 transition-transform"
          title={`Focus tree on ${node.fullName} (${node.memberId})`}
        >
          {node.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={node.avatarUrl}
              alt={node.fullName}
              className={`rounded-2xl object-cover border ${
                isRed ? "border-rose-400" : "border-emerald-500"
              } ${isSmall ? "w-8 h-8" : "w-10 h-10"}`}
            />
          ) : (
            <div
              className={`rounded-2xl flex items-center justify-center font-black text-white shadow-xs ${
                leg === "ROOT"
                  ? "bg-[#006d36]"
                  : isRed
                  ? "bg-rose-500"
                  : leg === "LEFT"
                  ? "bg-[#006d36]"
                  : "bg-indigo-600"
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
          title="Click to Center Tree"
        >
          <span className="font-mono font-black text-[11px] sm:text-xs text-[#006d36] block truncate hover:underline">
            {node.memberId}
          </span>
          <span className="font-bold text-[10px] sm:text-[11px] text-[#0f172a] block truncate leading-tight mt-0.5">
            {node.fullName}
          </span>
        </button>

        {/* Sponsor Name */}
        <div className="mt-1 w-full text-center">
          <span className="text-[8px] text-[#64748b] block truncate font-medium">
            Sp: <strong className="text-[#0f172a]">{node.sponsorName || node.sponsorId || "Root"}</strong>
          </span>
        </div>

        {/* PV Badge */}
        <div className="mt-1 flex items-center gap-1 text-[8px] font-mono font-bold">
          <span
            className={`px-2 py-0.5 rounded-md ${
              isRed ? "bg-rose-500/15 text-rose-700" : "bg-emerald-500/15 text-[#006d36]"
            }`}
          >
            {node.personalPv} PV
          </span>
        </div>

        {/* Expand / Collapse Button */}
        {canExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            disabled={isLoading}
            className={`neo-btn-icon absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[#0f172a] shadow-md cursor-pointer transition-all hover:scale-110 active:scale-95 z-20 ${
              isExpanded ? "bg-slate-800 text-white" : "bg-white text-[#006d36]"
            }`}
            title={isExpanded ? "Collapse Children" : "Expand Children (+)"}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isExpanded ? (
              <Minus className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Floating Detailed Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-4 glass-card rounded-2xl shadow-2xl border border-white text-xs z-50 animate-slideRight">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
            <span className="font-black font-mono text-[#006d36] text-xs">{node.memberId}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                isRed
                  ? "bg-rose-500/15 text-rose-700 border border-rose-500/30"
                  : "bg-emerald-500/15 text-[#006d36] border border-emerald-500/30"
              }`}
            >
              {isRed ? "INACTIVE" : "ACTIVE"}
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[10px] text-[#0f172a]">
            <div className="flex justify-between">
              <span className="text-[#64748b]">Associate:</span>
              <span className="font-bold truncate max-w-[120px]">{node.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Sponsor:</span>
              <span className="font-bold text-[#006d36] truncate max-w-[120px]">
                {node.sponsorName} ({node.sponsorId})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Package:</span>
              <span className="font-bold">{node.personalPv} PV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Activation:</span>
              <span className="font-bold">{formattedActivation}</span>
            </div>
          </div>

          {/* Left & Right PV Ledger */}
          <div className="pt-2 mt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-center font-mono">
            <div className="p-2 neo-inset rounded-xl">
              <span className="text-[9px] uppercase font-bold text-[#006d36] block">Left PV</span>
              <span className="font-black text-xs text-[#006d36]">{node.leftPv} PV</span>
              <span className="text-[8px] text-[#64748b] block mt-0.5">
                Carry: {node.carryLeftPv || 0}
              </span>
            </div>
            <div className="p-2 neo-inset rounded-xl">
              <span className="text-[9px] uppercase font-bold text-indigo-600 block">Right PV</span>
              <span className="font-black text-xs text-indigo-700">{node.rightPv} PV</span>
              <span className="text-[8px] text-[#64748b] block mt-0.5">
                Carry: {node.carryRightPv || 0}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRootClick}
            className="neo-btn-primary w-full mt-2.5 py-1.5 rounded-xl text-[10px] font-bold text-center block cursor-pointer"
          >
            Center This Tree
          </button>
        </div>
      )}
    </div>
  );
}

function VacantSlot({
  sponsorId,
  parentId,
  position,
}: {
  sponsorId: string;
  parentId: string;
  position: "LEFT" | "RIGHT";
}) {
  return (
    <Link
      href={`/register?sponsor=${sponsorId}&ref=${sponsorId}&parent=${parentId}&pos=${position}`}
      className="border-2 border-dashed border-gray-300/80 rounded-2xl flex flex-col items-center justify-center p-2 text-[#64748b] hover:border-[#006d36] hover:text-[#006d36] hover:bg-white/80 transition-all w-28 sm:w-32 h-20 text-[9px] shadow-2xs"
    >
      <Plus className="w-4 h-4 text-[#006d36] mb-0.5" />
      <span className="font-bold text-[10px]">+ Add Member</span>
      <span className="text-[8px] font-mono text-[#94a3b8]">{position} Leg</span>
    </Link>
  );
}
