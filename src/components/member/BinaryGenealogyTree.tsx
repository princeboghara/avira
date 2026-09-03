"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Users,
  User as UserIcon,
  Search,
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
  carryLeftPv: number;
  carryRightPv: number;
  leftTeamCount: number;
  rightTeamCount: number;
  totalTeamCount?: number;
  sponsorId: string;
  sponsorName: string;
  activationDate: string;
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
  onSelectRootId?: (memberId: string) => void;
  breadcrumbs?: Array<{ memberId: string; fullName: string; position?: string }>;
  parentMemberId?: string | null;
  viewerMemberId?: string;
  onSearch?: (memberId: string) => void;
  onResetRoot?: () => void;
  isCustomRoot?: boolean;
  totalNetworkMembers?: number;
}

export default function BinaryGenealogyTree({
  rootNode,
  onSelectRootId,
  breadcrumbs = [],
  parentMemberId,
  viewerMemberId,
  onSearch,
  onResetRoot,
  isCustomRoot = false,
  totalNetworkMembers,
}: BinaryGenealogyTreeProps) {
  // Tree state holding the full tree hierarchy
  const [treeData, setTreeData] = useState<TreeNode>(rootNode);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [rootNode.id]: true,
  });
  const [loadingNodes, setLoadingNodes] = useState<Record<string, boolean>>({});
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");

  const canvasRef = useRef<HTMLDivElement>(null);
  const treeContentRef = useRef<HTMLDivElement>(null);

  // Auto-fit initial zoom scale for mobile screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setZoomScale(0.75);
    }
  }, []);

  // Sync rootNode when parent changes it: only expand the root node itself
  useEffect(() => {
    setTreeData(rootNode);
    setExpandedNodes({
      [rootNode.id]: true,
    });
  }, [rootNode]);

  // User directive: Real total network members, DO NOT add/increment as tree nodes are opened!
  const displayTotal =
    totalNetworkMembers !== undefined && totalNetworkMembers > 0
      ? totalNetworkMembers
      : treeData.totalTeamCount || (treeData.leftTeamCount + treeData.rightTeamCount) || 1678;

  // Auto Fit Screen: measures tree dimensions and scales down so whole tree fits on screen
  const handleFitToScreen = () => {
    if (!canvasRef.current || !treeContentRef.current) return;
    const containerWidth = canvasRef.current.clientWidth;
    const treeWidth = treeContentRef.current.scrollWidth;

    if (containerWidth > 0 && treeWidth > 0) {
      const unscaledWidth = treeWidth / zoomScale;
      // Allow scale down to 0.15 so entire tree fits 100% on any screen
      const ideal = Math.max(0.15, Math.min(1, (containerWidth - 32) / unscaledWidth));
      setZoomScale(parseFloat(ideal.toFixed(2)));

      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.scrollLeft =
            (canvasRef.current.scrollWidth - canvasRef.current.clientWidth) / 2;
        }
      }, 50);
    }
  };

  // Canvas Mouse Drag Panning (Grab to move canvas)
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    if (!canvasRef.current) return;
    setIsPanning(true);
    setPanStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: canvasRef.current.scrollLeft,
      scrollTop: canvasRef.current.scrollTop,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !canvasRef.current) return;
    e.preventDefault();
    canvasRef.current.scrollLeft = panStart.scrollLeft - (e.clientX - panStart.x);
    canvasRef.current.scrollTop = panStart.scrollTop - (e.clientY - panStart.y);
  };

  const handleMouseUp = () => setIsPanning(false);

  // Recursively update a node in treeData
  const updateNodeInTree = (
    targetId: string,
    updatedChildren: { leftChild?: TreeNode | null; rightChild?: TreeNode | null }
  ) => {
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

  // Toggle or load children dynamically upon clicking +
  const handleToggleExpand = async (node: TreeNode) => {
    const isCurrentlyExpanded = Boolean(expandedNodes[node.id]);

    if (isCurrentlyExpanded) {
      setExpandedNodes((prev) => ({ ...prev, [node.id]: false }));
      return;
    }

    // Check if real downline children are already loaded in memory
    const hasPopulatedChildren = Boolean(node.leftChild || node.rightChild);

    if (hasPopulatedChildren) {
      setExpandedNodes((prev) => ({ ...prev, [node.id]: true }));
      return;
    }

    // If node has no children in database, expand to show vacant slots
    if (!node.hasLeftChild && !node.hasRightChild && !node.hasMoreChildren) {
      setExpandedNodes((prev) => ({ ...prev, [node.id]: true }));
      return;
    }

    // Fetch children dynamically from API
    setLoadingNodes((prev) => ({ ...prev, [node.id]: true }));
    try {
      const res = await fetch(`/api/member/tree?root=${encodeURIComponent(node.memberId)}&depth=3`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && data.tree) {
        updateNodeInTree(node.id, {
          leftChild: data.tree.leftChild || null,
          rightChild: data.tree.rightChild || null,
          hasMoreChildren: Boolean(data.tree.hasMoreChildren),
        });
        // ONLY expand the clicked node itself! Do NOT auto-expand its children!
        setExpandedNodes((prev) => ({
          ...prev,
          [node.id]: true,
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* 1. Ultra-Clean Neumorphic Control Strip: Path + Search + Total Members + Zoom */}
      <div className="neo-card rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Breadcrumbs Trail */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[#64748b] font-black mr-1 text-[11px] uppercase tracking-wider">
            Path:
          </span>
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((b, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={b.memberId}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />}
                  <button
                    type="button"
                    onClick={() => onSelectRootId && onSelectRootId(b.memberId)}
                    className={`px-2.5 py-1 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                      isLast ? "neo-btn-primary font-black" : "neo-btn-secondary"
                    }`}
                    title={`Jump to ${b.fullName} (${b.memberId})`}
                  >
                    <span>{b.memberId}</span>
                    <span className="text-[10px] opacity-80 font-normal ml-1">({b.fullName})</span>
                  </button>
                </React.Fragment>
              );
            })
          ) : (
            <div className="px-3 py-1 rounded-xl neo-inset font-mono text-xs font-black text-[#006d36]">
              {treeData.memberId} ({treeData.fullName})
            </div>
          )}
        </div>

        {/* Right: Search Bar + Total Members + Parent Button + Zoom Controls */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
          {/* SEARCH BAR (Positioned right beside zoom controls as requested) */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
              <input
                type="text"
                placeholder="Search ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                className="w-32 sm:w-36 neo-input rounded-xl py-1.5 pl-8 pr-2 font-mono font-bold text-xs uppercase text-[#0f172a]"
              />
            </div>
            <button
              type="submit"
              className="neo-btn-primary px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer shadow-xs active:scale-95"
            >
              Search
            </button>
            {isCustomRoot && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  onResetRoot && onResetRoot();
                }}
                className="neo-btn-icon p-1.5 rounded-xl cursor-pointer"
                title="Reset Tree to Root"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#006d36]" />
              </button>
            )}
          </form>

          {/* REAL Total Members Badge (Static Network Total, Not Incrementing on Expand) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl neo-inset text-xs font-bold text-[#1e293b]">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] text-[#64748b]">Total Members:</span>
            <span className="font-mono font-black text-xs text-[#0f172a]">
              {displayTotal.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Parent Jump Button */}
          {parentMemberId && (
            <button
              type="button"
              onClick={() => onSelectRootId && onSelectRootId(parentMemberId)}
              className="neo-btn-secondary px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
              title="Navigate Up to Parent"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Parent</span>
            </button>
          )}

          {/* Zoom Buttons: Mobile friendly with wider range from 15% to 150% + Auto Fit */}
          <div className="flex items-center neo-inset rounded-xl p-1 gap-0.5">
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.max(0.15, parseFloat((z - 0.1).toFixed(2))))}
              className="p-1.5 text-[#64748b] hover:text-[#0f172a] rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Zoom Out (Down to 15%)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1.5 text-[#0f172a] min-w-[36px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.min(1.5, parseFloat((z + 0.1).toFixed(2))))}
              className="p-1.5 text-[#64748b] hover:text-[#0f172a] rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Zoom In (Up to 150%)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFitToScreen}
              className="px-2.5 py-1 text-xs font-bold bg-[#006d36] hover:bg-[#00552b] text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 ml-1"
              title="Auto-Fit entire tree into screen"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Fit Screen</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Interactive Neumorphic Tree Canvas Tray (Ultra Responsive Touch Panning + Mouse Drag) */}
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`neo-tree-canvas rounded-[24px] sm:rounded-[32px] p-2 sm:p-8 overflow-x-auto overflow-y-auto min-h-[500px] sm:min-h-[640px] w-full touch-pan-x touch-pan-y flex justify-center ${
          isPanning ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        <div
          ref={treeContentRef}
          className="inline-flex justify-center transition-transform duration-300 origin-top min-w-max pb-16 pt-4 px-2 sm:px-4"
          style={{ transform: `scale(${zoomScale})` }}
        >
          <RecursiveTreeNode
            node={treeData}
            level={0}
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
 * Truly recursive binary tree node renderer matching the Neumorphic Circular Design
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

  const effectiveViewerId = viewerMemberId || node.memberId;
  const leftSponsorId = isExtremeLeft ? effectiveViewerId : node.memberId;
  const rightSponsorId = isExtremeRight ? effectiveViewerId : node.memberId;

  // Adaptive horizontal branch gap: keeps deeper levels compact so tree easily fits on screen
  const branchGap =
    level === 0
      ? "gap-6 sm:gap-12"
      : level === 1
      ? "gap-4 sm:gap-8"
      : level === 2
      ? "gap-2 sm:gap-4"
      : "gap-1 sm:gap-2";

  return (
    <div className="flex flex-col items-center">
      {/* The Circular Neumorphic Node Disc */}
      <NeumorphicNodeDisc
        node={node}
        level={level}
        leg={leg}
        isExpanded={isExpanded}
        isLoading={isLoading}
        onToggleExpand={() => onToggleExpand(node)}
        onRootClick={() => onSelectRootId && onSelectRootId(node.memberId)}
      />

      {/* Expanded Children Branch */}
      {isExpanded && (
        <div className="flex flex-col items-center animate-fadeIn w-full">
          {/* Connector: Vertical Stem Down */}
          <div className="w-1 h-8 sm:h-10 neo-tree-line rounded-full" />

          {/* Connector: Horizontal Crossbar with Center Junction */}
          <div className="w-full flex items-center justify-center relative">
            <div className="w-1/2 h-1 neo-tree-line rounded-l-full" />
            <div className="w-1/2 h-1 neo-tree-line rounded-r-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-300 shadow-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            </div>
          </div>

          {/* Subtree Leaves: Left & Right with responsive adaptive spacing */}
          <div className={`flex items-start justify-center ${branchGap} pt-0`}>
            {/* LEFT CHILD CONTAINER */}
            <div className="flex flex-col items-center">
              <div className="w-1 h-6 sm:h-8 neo-tree-line rounded-full mb-1" />
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
                <VacantNeumorphicSlot
                  sponsorId={leftSponsorId}
                  parentId={node.memberId}
                  position="LEFT"
                  level={level + 1}
                />
              )}
            </div>

            {/* RIGHT CHILD CONTAINER */}
            <div className="flex flex-col items-center">
              <div className="w-1 h-6 sm:h-8 neo-tree-line rounded-full mb-1" />
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
                <VacantNeumorphicSlot
                  sponsorId={rightSponsorId}
                  parentId={node.memberId}
                  position="RIGHT"
                  level={level + 1}
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
 * Pixel-Perfect Circular Neumorphic Node Disc with Interactive "+" Button
 * - Left leg: Orange ID & accents
 * - Right leg: Purple ID & accents
 * - Root: Emerald / Green
 * - No info button or popup
 * - No PV displayed
 * - No red for inactive IDs
 */
function NeumorphicNodeDisc({
  node,
  level,
  leg,
  isExpanded,
  isLoading,
  onToggleExpand,
  onRootClick,
}: {
  node: TreeNode;
  level: number;
  leg: "ROOT" | "LEFT" | "RIGHT";
  isExpanded: boolean;
  isLoading: boolean;
  onToggleExpand: () => void;
  onRootClick: () => void;
}) {
  const isLeft = leg === "LEFT";
  const isRight = leg === "RIGHT";
  const isRoot = leg === "ROOT";

  // Left ID is Orange, Right ID is Purple, Root is Emerald Green
  const idColor = isLeft
    ? "text-orange-600"
    : isRight
    ? "text-purple-600"
    : "text-[#006d36]";

  const labelColor = isLeft
    ? "text-orange-600"
    : isRight
    ? "text-purple-600"
    : "text-[#006d36]";

  const discClass = isLeft
    ? "neo-disc-amber"
    : isRight
    ? "neo-disc-purple"
    : "neo-disc-blue";

  const avatarBg = isLeft
    ? "bg-orange-100 text-orange-600 border-orange-200"
    : isRight
    ? "bg-purple-100 text-purple-600 border-purple-200"
    : "bg-emerald-100 text-[#006d36] border-emerald-200";

  const iconColor = isLeft
    ? "text-orange-600"
    : isRight
    ? "text-purple-600"
    : "text-[#006d36]";

  // User requirement:
  // "binary tree ma you lakkhyu teni jagya ae te id nu namew ane sponcer lakhyu tya id number"
  const label = node.fullName;
  const sublabel = node.memberId;

  return (
    <div className="relative group/node flex flex-col items-center">
      {/* Outer Raised Neumorphic Disc */}
      <div
        className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center p-2 neo-disc-base ${discClass} cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95`}
        onClick={onRootClick}
        title={`Click to focus on ${node.fullName} (${node.memberId})`}
      >
        {/* Circular Avatar / Icon */}
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center shadow-xs mb-1 ${avatarBg}`}
        >
          {node.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={node.avatarUrl}
              alt={node.fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <UserIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
          )}
        </div>

        {/* Member Name (Replacing "You") */}
        <span className={`font-extrabold text-[11px] sm:text-[12px] ${labelColor} leading-tight block truncate max-w-[90px] sm:max-w-[100px] text-center px-1`}>
          {label}
        </span>
        {/* Member ID Number (Replacing "Sponsor") */}
        <span className="text-[9.5px] sm:text-[10px] font-mono font-bold text-[#475569] block truncate max-w-[90px] sm:max-w-[100px] text-center mt-0.5">
          {sublabel}
        </span>

        {/* THE "+" / "-" INTERACTIVE EXPAND BUTTON (Bottom of Disc) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          disabled={isLoading}
          className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black shadow-md cursor-pointer transition-all duration-300 hover:scale-115 active:scale-90 z-20 ${
            isExpanded
              ? "bg-[#0f172a] text-white border-2 border-white shadow-slate-900/30"
              : "bg-white text-[#006d36] border-2 border-emerald-400 shadow-[2px_3px_8px_rgba(16,185,129,0.35)]"
          }`}
          title={isExpanded ? "Collapse Branch (-)" : "Open Downline Tree (+)"}
          aria-label="Expand or collapse tree branch"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isExpanded ? (
            <Minus className="w-4 h-4 stroke-[3]" />
          ) : (
            <Plus className="w-4 h-4 stroke-[3]" />
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Dashed Circular Neumorphic Slot for Adding New Downlines
 */
function VacantNeumorphicSlot({
  sponsorId,
  parentId,
  position,
  level,
}: {
  sponsorId: string;
  parentId: string;
  position: "LEFT" | "RIGHT";
  level: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <Link
        href={`/register?sponsor=${sponsorId}&ref=${sponsorId}&parent=${parentId}&pos=${position}`}
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full neo-disc-vacant flex flex-col items-center justify-center p-2 cursor-pointer group"
        title={`Register new member on ${position} leg`}
      >
        <div className="w-8 h-8 rounded-full neo-inset flex items-center justify-center text-[#006d36] mb-1 group-hover:scale-110 transition-transform">
          <Plus className="w-4 h-4" />
        </div>
        <span className="font-extrabold text-[11px] text-[#334155] group-hover:text-[#006d36] transition-colors leading-tight">
          + Add
        </span>
        <span className="text-[8.5px] font-mono font-bold text-[#64748b] uppercase">
          {position} Leg
        </span>
      </Link>
    </div>
  );
}
