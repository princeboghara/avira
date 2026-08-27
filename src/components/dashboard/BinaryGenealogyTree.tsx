"use client";

import React, { useState } from "react";
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
  RotateCcw,
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
}

export default function BinaryGenealogyTree({
  rootNode,
  onSelectRootId,
  breadcrumbs = [],
  parentMemberId,
}: BinaryGenealogyTreeProps) {
  // Tree state holding the full tree hierarchy (supports dynamic node additions)
  const [treeData, setTreeData] = useState<TreeNode>(rootNode);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [rootNode.id]: true,
  });
  const [loadingNodes, setLoadingNodes] = useState<Record<string, boolean>>({});
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Sync rootNode when parent changes it
  React.useEffect(() => {
    setTreeData(rootNode);
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

    // If node has children already in memory, just expand
    if (node.leftChild || node.rightChild || (!node.hasLeftChild && !node.hasRightChild)) {
      setExpandedNodes((prev) => ({ ...prev, [node.id]: true }));
      return;
    }

    // Otherwise, fetch on demand from API
    setLoadingNodes((prev) => ({ ...prev, [node.id]: true }));
    try {
      const res = await fetch(`/api/member/tree?node=${encodeURIComponent(node.memberId)}&depth=2`);
      const data = await res.json();
      if (data.success && data.tree) {
        updateNodeInTree(node.id, {
          leftChild: data.tree.leftChild,
          rightChild: data.tree.rightChild,
        });
        setExpandedNodes((prev) => ({ ...prev, [node.id]: true }));
      }
    } catch (err) {
      console.error("Failed to load node children:", err);
    } finally {
      setLoadingNodes((prev) => ({ ...prev, [node.id]: false }));
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Navigation & Toolbar: Breadcrumbs + Zoom Controls */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Breadcrumb Hierarchy */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mr-1">
            Path:
          </span>
          {breadcrumbs.map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={b.memberId}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                <button
                  type="button"
                  onClick={() => onSelectRootId && onSelectRootId(b.memberId)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isLast
                      ? "bg-[#006d36] text-white shadow-xs"
                      : "bg-emerald-50 text-[#006d36] hover:bg-emerald-100"
                  }`}
                  title={`Jump to ${b.fullName} (${b.memberId})`}
                >
                  <span>{b.memberId}</span>
                  <span className="text-[10px] opacity-80 font-normal">({b.fullName})</span>
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
              className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[#006d36] text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              title="Navigate Up to Parent"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Up to Parent</span>
            </button>
          )}

          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 border border-gray-200">
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 text-gray-600 hover:text-black rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1 text-gray-600 min-w-[36px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 text-gray-600 hover:text-black rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(1)}
              className="p-1.5 text-gray-600 hover:text-black rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-sm overflow-x-auto min-h-[500px]">
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
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Truly recursive binary tree node renderer
 * Dynamically expands down 1, 2, 3, 4, 5, 10, 20+ levels!
 */
function RecursiveTreeNode({
  node,
  level,
  leg,
  expandedNodes,
  loadingNodes,
  onToggleExpand,
  onSelectRootId,
}: {
  node: TreeNode;
  level: number;
  leg: "ROOT" | "LEFT" | "RIGHT";
  expandedNodes: Record<string, boolean>;
  loadingNodes: Record<string, boolean>;
  onToggleExpand: (node: TreeNode) => void;
  onSelectRootId?: (id: string) => void;
}) {
  const isExpanded = Boolean(expandedNodes[node.id]);
  const isLoading = Boolean(loadingNodes[node.id]);

  // A node can expand if it has left/right children or hasMoreChildren flagged
  const canExpand = Boolean(
    node.leftChild ||
    node.rightChild ||
    node.hasLeftChild ||
    node.hasRightChild ||
    node.hasMoreChildren
  );

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

      {/* Children Sub-branch (Rendered if expanded) */}
      {isExpanded && (
        <div className="flex flex-col items-center mt-3 animate-fadeIn w-full">
          {/* Connector Line from Parent */}
          <div className="w-0.5 h-6 bg-emerald-500 relative" />

          {/* Horizontal Split Line between Left and Right Sub-branches */}
          <div className="w-full flex items-center justify-center relative">
            <div className="w-1/2 h-0.5 bg-emerald-500" />
            <div className="w-1/2 h-0.5 bg-purple-500" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#006d36] border-2 border-white shadow-xs" />
          </div>

          {/* Left and Right Child Containers */}
          <div className="grid grid-cols-2 gap-8 sm:gap-12 w-full pt-3">
            {/* LEFT LEG CONTAINER */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-3 bg-emerald-500 mb-1" />
              {node.leftChild ? (
                <RecursiveTreeNode
                  node={node.leftChild}
                  level={level + 1}
                  leg="LEFT"
                  expandedNodes={expandedNodes}
                  loadingNodes={loadingNodes}
                  onToggleExpand={onToggleExpand}
                  onSelectRootId={onSelectRootId}
                />
              ) : (
                <VacantSlot
                  sponsorId={node.memberId}
                  parentId={node.memberId}
                  position="LEFT"
                />
              )}
            </div>

            {/* RIGHT LEG CONTAINER */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-3 bg-purple-500 mb-1" />
              {node.rightChild ? (
                <RecursiveTreeNode
                  node={node.rightChild}
                  level={level + 1}
                  leg="RIGHT"
                  expandedNodes={expandedNodes}
                  loadingNodes={loadingNodes}
                  onToggleExpand={onToggleExpand}
                  onSelectRootId={onSelectRootId}
                />
              ) : (
                <VacantSlot
                  sponsorId={node.memberId}
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
 * Node card with real sponsor details, live PV, and dynamic expand button
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
      ? "border-[#006d36] bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20"
      : isRed
      ? "border-red-400 bg-red-50/40 shadow-xs"
      : leg === "LEFT"
      ? "border-blue-400 bg-blue-50/40 shadow-xs"
      : "border-purple-400 bg-purple-50/40 shadow-xs";

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
        className={`rounded-2xl border p-2 sm:p-2.5 transition-all flex flex-col items-center relative ${cardBorder} ${
          isSmall ? "w-32 sm:w-36" : "w-36 sm:w-44"
        }`}
      >
        {/* Top Leg & Info Bar */}
        <div className="flex items-center justify-between w-full mb-1">
          <span
            className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded shadow-2xs ${
              leg === "ROOT"
                ? "bg-[#006d36] text-white"
                : leg === "LEFT"
                ? "bg-blue-600 text-white"
                : "bg-purple-600 text-white"
            }`}
          >
            {leg}
          </span>

          <button
            type="button"
            onClick={() => setShowTooltip((p) => !p)}
            className="text-gray-400 hover:text-[#006d36] p-0.5 transition-colors cursor-pointer"
            title="View PV and Sponsor Details"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Avatar / Initials (Click to Focus Root) */}
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
              className={`rounded-full object-cover border-2 ${
                isRed ? "border-red-400" : "border-emerald-500"
              } ${isSmall ? "w-8 h-8" : "w-10 h-10"}`}
            />
          ) : (
            <div
              className={`rounded-full flex items-center justify-center font-black text-white shadow-xs ${
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
          title="Click to Center Tree"
        >
          <span className="font-mono font-black text-[11px] sm:text-xs text-[#006d36] block truncate hover:underline">
            {node.memberId}
          </span>
          <span className="font-bold text-[10px] sm:text-[11px] text-[#1a1c1c] block truncate leading-tight mt-0.5">
            {node.fullName}
          </span>
        </button>

        {/* Sponsor Name Badge */}
        <div className="mt-1 w-full text-center">
          <span className="text-[8px] text-gray-500 block truncate font-medium">
            Sp: <strong className="text-gray-700">{node.sponsorName || node.sponsorId || "Root"}</strong>
          </span>
        </div>

        {/* PV Badge */}
        <div className="mt-1 flex items-center gap-1 text-[8px] font-mono font-bold">
          <span
            className={`px-1.5 py-0.5 rounded shadow-2xs ${
              isRed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-[#006d36]"
            }`}
          >
            {node.personalPv} PV
          </span>
        </div>

        {/* Expand '+' / Collapse '-' Button (Loaded dynamically down any level!) */}
        {canExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            disabled={isLoading}
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer transition-all hover:scale-110 active:scale-95 z-20 ${
              isExpanded ? "bg-gray-700 hover:bg-gray-800" : "bg-[#006d36] hover:bg-[#005025]"
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
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3.5 bg-white rounded-2xl shadow-2xl border border-emerald-300 text-xs z-50 animate-scaleUp">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 mb-2">
            <span className="font-black font-mono text-[#006d36] text-xs">{node.memberId}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                isRed
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-[#006d36] border border-emerald-200"
              }`}
            >
              {isRed ? "INACTIVE (<100 PV)" : "ACTIVE"}
            </span>
          </div>

          <div className="space-y-1 font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Associate Name:</span>
              <span className="font-bold text-gray-900 truncate max-w-[120px]">{node.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Real Sponsor:</span>
              <span className="font-bold text-[#006d36] truncate max-w-[120px]">
                {node.sponsorName} ({node.sponsorId})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Package Amount:</span>
              <span className="font-bold text-gray-900">{node.personalPv} PV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Activation Date:</span>
              <span className="font-bold text-gray-900">{formattedActivation}</span>
            </div>
          </div>

          {/* Left & Right PV Ledger */}
          <div className="pt-2 mt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-center font-mono">
            <div className="p-2 bg-blue-50/80 rounded-xl border border-blue-200">
              <span className="text-[9px] uppercase font-bold text-blue-700 block">Left PV</span>
              <span className="font-black text-xs text-blue-800">{node.leftPv} PV</span>
              <span className="text-[8px] text-blue-600 block mt-0.5 font-bold">
                Balance: {node.carryLeftPv || 0} PV
              </span>
            </div>
            <div className="p-2 bg-purple-50/80 rounded-xl border border-purple-200">
              <span className="text-[9px] uppercase font-bold text-purple-700 block">Right PV</span>
              <span className="font-black text-xs text-purple-800">{node.rightPv} PV</span>
              <span className="text-[8px] text-purple-600 block mt-0.5 font-bold">
                Balance: {node.carryRightPv || 0} PV
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRootClick}
            className="w-full mt-2 py-1.5 rounded-xl bg-[#006d36] text-white text-[10px] font-bold hover:bg-[#005025] transition-all cursor-pointer text-center block"
          >
            Drill Down / Center This Tree
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
      className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-2 text-gray-500 hover:border-[#006d36] hover:text-[#006d36] hover:bg-emerald-50/50 transition-all w-28 sm:w-32 h-20 text-[9px] shadow-2xs"
    >
      <Plus className="w-4 h-4 text-[#006d36] mb-0.5" />
      <span className="font-bold text-[10px]">+ Add Member</span>
      <span className="text-[8px] font-mono text-gray-500">{position} Leg</span>
    </Link>
  );
}
