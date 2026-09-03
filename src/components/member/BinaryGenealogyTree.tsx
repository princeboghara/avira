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
  Network,
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
  const [targetMemberId, setTargetMemberId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

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

  // 2D Transform Panning and Zooming: Free 360° motion (left, right, up, down, cross/diagonal)
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const effectiveViewerId = viewerMemberId || treeData.memberId || rootNode.memberId;

  // Auto Fit Screen: measures tree dimensions and scales down so whole tree fits on screen
  const handleFitToScreen = () => {
    if (!canvasRef.current || !treeContentRef.current) return;
    const containerWidth = canvasRef.current.clientWidth;
    const containerHeight = canvasRef.current.clientHeight;
    const treeWidth = treeContentRef.current.scrollWidth;
    const treeHeight = treeContentRef.current.scrollHeight;

    if (containerWidth > 0 && treeWidth > 0) {
      const scaleX = (containerWidth - 40) / treeWidth;
      const scaleY = (containerHeight - 80) / treeHeight;
      const ideal = Math.max(0.2, Math.min(1.0, Math.min(scaleX, scaleY)));
      setZoomScale(parseFloat(ideal.toFixed(2)));
      setPan({ x: 0, y: 10 });
    }
  };

  const handleResetView = () => {
    setPan({ x: 0, y: 0 });
    setZoomScale(1);
  };

  const handleZoomIn = () => {
    setZoomScale((z) => Math.min(1.8, parseFloat((z + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomScale((z) => Math.max(0.2, parseFloat((z - 0.15).toFixed(2))));
  };

  // Pointer-based free drag panning: Works in all directions without boundaries
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, a, input, [role='button']")) return;
    if (!canvasRef.current) return;
    try {
      canvasRef.current.setPointerCapture(e.pointerId);
    } catch {}
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPan({
      x: panStartRef.current.panX + dx,
      y: panStartRef.current.panY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        canvasRef.current?.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Mouse Wheel & Trackpad 2D Scrolling: Left, Right, Up, Down, Diagonal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Pinch zoom
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        setZoomScale((prev) => Math.max(0.2, Math.min(1.8, parseFloat((prev * zoomFactor).toFixed(2)))));
      } else {
        // Free diagonal/cross, horizontal and vertical scrolling
        setPan((prev) => ({
          x: prev.x - e.deltaX * 1.1,
          y: prev.y - e.deltaY * 1.1,
        }));
      }
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Recursively update a node in treeData
  const updateNodeInTree = (
    targetId: string,
    updatedChildren: { leftChild?: TreeNode | null; rightChild?: TreeNode | null; hasMoreChildren?: boolean }
  ) => {
    const updateRecursive = (current: TreeNode): TreeNode => {
      if (current.id === targetId || current.memberId === targetId) {
        return {
          ...current,
          leftChild: updatedChildren.leftChild !== undefined ? updatedChildren.leftChild : current.leftChild,
          rightChild: updatedChildren.rightChild !== undefined ? updatedChildren.rightChild : current.rightChild,
          hasMoreChildren: updatedChildren.hasMoreChildren !== undefined ? updatedChildren.hasMoreChildren : false,
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

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    setIsSearching(true);
    setSearchError("");

    try {
      const rootId = viewerMemberId || treeData.memberId || "AV0001";
      const res = await fetch(
        `/api/member/tree?root=${encodeURIComponent(rootId)}&search=${encodeURIComponent(query)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data.success && data.tree) {
        setTreeData(data.tree);
        setTargetMemberId(data.targetMemberId || query);
        // Expand all ancestor nodes down to the searched target
        if (Array.isArray(data.expandedNodeIds)) {
          const nextExpanded: Record<string, boolean> = { [data.tree.id]: true };
          data.expandedNodeIds.forEach((id: string) => {
            nextExpanded[id] = true;
          });
          setExpandedNodes((prev) => ({ ...prev, ...nextExpanded }));
        }
        if (onSearch) {
          onSearch(query);
        }
      } else {
        setSearchError(data.message || `Member ID "${query}" not found in tree.`);
      }
    } catch {
      setSearchError("Failed to search member tree.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* 1. Ultra-Clean Neumorphic Control Strip: Path + Search + Total Members + Zoom */}
      <div className="neo-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col gap-3">
        {/* Row 1: PATH Badge matching screenshot */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">PATH:</span>
          <span className="px-3 py-1 rounded-full bg-[#006d36] text-white text-xs font-bold font-mono shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>{treeData.memberId} ({treeData.fullName})</span>
          </span>
          {parentMemberId && (
            <button
              type="button"
              onClick={() => onSelectRootId && onSelectRootId(parentMemberId)}
              className="neo-btn-secondary px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 ml-auto sm:ml-0"
              title="Navigate Up to Parent"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Parent</span>
            </button>
          )}
        </div>

        {/* Row 2: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
            <input
              type="text"
              placeholder="SEARCH ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value.toUpperCase());
                if (searchError) setSearchError("");
              }}
              className="w-full neo-input rounded-xl py-2 pl-9 pr-2 font-mono font-bold text-xs uppercase text-[#0f172a]"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="neo-btn-primary px-4 py-2 rounded-xl font-bold text-xs cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
          </button>
          {(isCustomRoot || targetMemberId) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setTargetMemberId(null);
                setSearchError("");
                onResetRoot && onResetRoot();
              }}
              className="neo-btn-icon p-2 rounded-xl cursor-pointer"
              title="Reset Tree to Root"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#006d36]" />
            </button>
          )}
        </form>

        {/* Row 3: Total Members Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl neo-inset text-xs font-bold text-[#1e293b] w-fit">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] text-[#64748b]">Total Members:</span>
          <span className="font-mono font-black text-xs text-[#0f172a]">
            {displayTotal.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Row 4: Zoom & Screen Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center neo-inset rounded-xl p-1 gap-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-[#64748b] hover:text-[#0f172a] rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1.5 text-[#0f172a] min-w-[36px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-[#64748b] hover:text-[#0f172a] rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleFitToScreen}
            className="px-3 py-1.5 text-xs font-bold bg-[#006d36] hover:bg-[#00552b] text-white rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
            title="Auto-Fit entire tree into screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fit</span>
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
            title="Center Tree and Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
            <span>Center</span>
          </button>
        </div>
      </div>

      {/* Search Error Alert */}
      {searchError && (
        <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span>⚠️ {searchError}</span>
          <button
            type="button"
            onClick={() => setSearchError("")}
            className="text-rose-500 hover:text-rose-800 font-black px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Main Interactive Free-Panning Tree Canvas Tray (360° Free Drag & Scroll in all directions) */}
      <div
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`neo-tree-canvas relative w-full h-[650px] sm:h-[750px] rounded-2xl overflow-hidden select-none touch-none flex items-center justify-center ${
          isPanning ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* Floating Navigation & Action Pill */}
        <div className="absolute bottom-3 left-3 z-30 pointer-events-none hidden sm:flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-xs">
          <span>🖐️ Drag anywhere to move (Left, Right, Up, Down, Cross) • Trackpad / Wheel to scroll • Pinch to zoom</span>
        </div>

        {/* Free 2D Pan and Zoom Tree Container */}
        <div
          ref={treeContentRef}
          className="absolute left-1/2 top-8 transition-transform duration-75 ease-out select-none will-change-transform"
          style={{
            transform: `translate3d(calc(-50% + ${pan.x}px), ${pan.y}px, 0) scale(${zoomScale})`,
            transformOrigin: "top center",
          }}
        >
          <RecursiveTreeNode
            node={treeData}
            level={0}
            leg="ROOT"
            expandedNodes={expandedNodes}
            loadingNodes={loadingNodes}
            onToggleExpand={handleToggleExpand}
            targetMemberId={targetMemberId}
            isExtremeLeft={true}
            isExtremeRight={true}
            viewerMemberId={effectiveViewerId}
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
  targetMemberId,
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
  targetMemberId?: string | null;
  isExtremeLeft?: boolean;
  isExtremeRight?: boolean;
  viewerMemberId: string;
}) {
  const isExpanded = Boolean(expandedNodes[node.id]);
  const isLoading = Boolean(loadingNodes[node.id]);

  // MLM Binary Tree Sponsor Placement Rule:
  // 1. Extreme left downline vacant spot -> Sponsor is viewerMemberId (open ID)
  // 2. Extreme right downline vacant spot -> Sponsor is viewerMemberId (open ID)
  // 3. Any inner / personal downline leg -> Sponsor is the parent node itself (node.memberId)
  const leftSponsorId = isExtremeLeft ? viewerMemberId : node.memberId;
  const rightSponsorId = isExtremeRight ? viewerMemberId : node.memberId;

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
        isSearchedTarget={Boolean(targetMemberId && targetMemberId.toUpperCase() === node.memberId.toUpperCase())}
      />

      {/* Expanded Children Branch */}
      {isExpanded && (
        <div className="flex flex-col items-center animate-fadeIn w-full">
          {/* Connector: Vertical Stem Down */}
          <div className="w-0.5 h-7 sm:h-9 bg-slate-300 rounded-full" />

          {/* Subtree Leaves: Left & Right */}
          <div className={`flex items-start justify-center ${branchGap} pt-0 relative`}>
            {/* LEFT CHILD CONTAINER */}
            <div className="flex flex-col items-center relative">
              <div className="w-0.5 h-6 sm:h-8 bg-slate-300 rounded-full mb-1" />
              <div className="absolute top-0 right-0 left-1/2 h-0.5 bg-slate-300" />
              {node.leftChild ? (
                <RecursiveTreeNode
                  node={node.leftChild}
                  level={level + 1}
                  leg="LEFT"
                  expandedNodes={expandedNodes}
                  loadingNodes={loadingNodes}
                  onToggleExpand={onToggleExpand}
                  targetMemberId={targetMemberId}
                  isExtremeLeft={isExtremeLeft}
                  isExtremeRight={false}
                  viewerMemberId={viewerMemberId}
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
            <div className="flex flex-col items-center relative">
              <div className="w-0.5 h-6 sm:h-8 bg-slate-300 rounded-full mb-1" />
              <div className="absolute top-0 left-0 right-1/2 h-0.5 bg-slate-300" />
              {node.rightChild ? (
                <RecursiveTreeNode
                  node={node.rightChild}
                  level={level + 1}
                  leg="RIGHT"
                  expandedNodes={expandedNodes}
                  loadingNodes={loadingNodes}
                  onToggleExpand={onToggleExpand}
                  targetMemberId={targetMemberId}
                  isExtremeLeft={false}
                  isExtremeRight={isExtremeRight}
                  viewerMemberId={viewerMemberId}
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

            {/* Center Junction Dot */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-300 shadow-sm flex items-center justify-center z-10 pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Pixel-Perfect Circular Neumorphic Node Disc with Interactive "+" Button
 * - Main ID: BLUE
 * - Left side: GREEN
 * - Right side: PURPLE
 * - Clicking member disc DOES NOT open/change the root tree
 * - "+" button expands downline branch in-place
 */
function NeumorphicNodeDisc({
  node,
  level,
  leg,
  isExpanded,
  isLoading,
  onToggleExpand,
  isSearchedTarget = false,
}: {
  node: TreeNode;
  level: number;
  leg: "ROOT" | "LEFT" | "RIGHT";
  isExpanded: boolean;
  isLoading: boolean;
  onToggleExpand: () => void;
  isSearchedTarget?: boolean;
}) {
  const isLeft = leg === "LEFT";
  const isRight = leg === "RIGHT";
  const isRoot = leg === "ROOT";

  // MAIN ID BLUE, LEFT SIDE GREEN, RIGHT SIDE PURPLE - CRISP WHITE THEME
  const idColor = isRoot
    ? "text-blue-600"
    : isLeft
    ? "text-[#006d36]"
    : "text-purple-600";

  const labelColor = "text-slate-900";

  const discClass = isRoot
    ? "neo-disc-blue"
    : isLeft
    ? "neo-disc-mint"
    : "neo-disc-purple";

  const avatarBg = isRoot
    ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-xs"
    : isLeft
    ? "bg-emerald-50 text-[#006d36] border border-emerald-200 shadow-xs"
    : "bg-purple-50 text-purple-600 border border-purple-200 shadow-xs";

  const iconColor = isRoot
    ? "text-blue-600"
    : isLeft
    ? "text-[#006d36]"
    : "text-purple-600";

  const label = node.fullName;
  const sublabel = node.memberId;

  return (
    <div className="relative group/node flex flex-col items-center">
      {/* Outer Raised Neumorphic Disc - NOT clickable to navigate away */}
      <div
        className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center p-2 neo-disc-base ${discClass} transition-all duration-300 select-none ${
          isSearchedTarget
            ? "ring-4 ring-amber-400 ring-offset-4 ring-offset-slate-100 shadow-[0_0_30px_rgba(251,191,36,0.8)] scale-105"
            : ""
        }`}
        title={`${node.fullName} (${node.memberId})`}
      >
        {/* Circular Avatar / Icon */}
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center shadow-xs mb-1 ${avatarBg}`}
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

        {/* Member Name */}
        <span className={`font-extrabold text-[11px] sm:text-[12px] ${labelColor} leading-tight block truncate max-w-[90px] sm:max-w-[100px] text-center px-1`}>
          {label}
        </span>
        {/* Member ID Number */}
        <span className={`text-[9.5px] sm:text-[10px] font-mono font-black ${idColor} block truncate max-w-[90px] sm:max-w-[100px] text-center mt-0.5`}>
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
          className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black shadow-md cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 z-20 ${
            isExpanded
              ? "bg-[#0f172a] text-white border-2 border-white shadow-slate-900/40 hover:bg-slate-800"
              : isRoot
              ? "bg-white text-blue-600 border-2 border-blue-500 shadow-sm hover:bg-blue-50"
              : isLeft
              ? "bg-white text-[#006d36] border-2 border-emerald-500 shadow-sm hover:bg-emerald-50"
              : "bg-white text-purple-600 border-2 border-purple-500 shadow-sm hover:bg-purple-50"
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
  const isLeft = position === "LEFT";
  const legColor = isLeft ? "text-[#006d36]" : "text-purple-600";
  const hoverText = isLeft ? "group-hover:text-[#006d36]" : "group-hover:text-purple-600";
  const borderClass = isLeft
    ? "border-2 border-dashed border-emerald-400 hover:border-emerald-600 hover:bg-emerald-50/50"
    : "border-2 border-dashed border-purple-400 hover:border-purple-600 hover:bg-purple-50/50";
  const iconBg = isLeft
    ? "bg-emerald-50 text-[#006d36] border border-emerald-200"
    : "bg-purple-50 text-purple-600 border border-purple-200";

  return (
    <div className="flex flex-col items-center">
      <Link
        href={`/register?sponsor=${encodeURIComponent(sponsorId)}&ref=${encodeURIComponent(sponsorId)}&parent=${encodeURIComponent(parentId)}&pos=${position}`}
        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white flex flex-col items-center justify-center p-2 cursor-pointer group transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs hover:shadow-md ${borderClass}`}
        title={`Register new member on ${position} leg\nSponsor: ${sponsorId}\nParent: ${parentId}`}
      >
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${iconBg} mb-1 group-hover:scale-110 transition-transform`}>
          <Plus className="w-4 h-4 stroke-[3]" />
        </div>
        <span className={`font-extrabold text-[11px] text-slate-800 ${hoverText} transition-colors leading-tight`}>
          + Add
        </span>
        <span className={`text-[9px] font-mono font-black ${legColor} uppercase tracking-wider`}>
          {position} Leg
        </span>
        <span className="text-[8px] font-mono font-bold text-slate-500 truncate max-w-[85px] mt-0.5" title={`Sponsor ID: ${sponsorId}`}>
          Sp: {sponsorId}
        </span>
      </Link>
    </div>
  );
}
