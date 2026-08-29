"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapPin,
  Globe,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  Building2,
  Palette,
  Users,
  Network,
  Compass,
  CheckCircle2,
  Move,
} from "lucide-react";
import {
  INDIA_MAP_PATHS,
  INDIA_MAP_VIEWBOX,
  StatePathData,
  ALL_INDIAN_STATES_AND_UTS,
  SMALL_STATES_AND_UTS,
} from "@/lib/indiaMapData";

interface StateStat {
  code: string;
  name: string;
  total: number;
  active: number;
  inactive: number;
  totalPv: number;
  percentage: number;
  activePercentage: number;
  rank: number;
  topCities: Array<{ city: string; count: number }>;
}

interface StateSummary {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalPv: number;
  totalStatesCount: number;
  topState: StateStat | null;
}

interface IndiaStateMapProps {
  scope?: "member" | "admin";
}

// Professional, Elegant Light/Pastel Harmonious Color Palette for all 28 States & 8 UTs
const STATE_PALETTE: Record<string, string> = {
  JK: "#c7dcfc", // Soft Sky Blue (Jammu & Kashmir)
  LA: "#fed7aa", // Pale Warm Peach (Ladakh)
  HP: "#bbf7d0", // Soft Mint Green (Himachal Pradesh)
  PB: "#fef08a", // Light Chamomile Yellow (Punjab)
  UT: "#ddd6fe", // Soft Wisteria Lavender (Uttarakhand)
  HR: "#cffafe", // Pale Ice Cyan (Haryana)
  DL: "#fecdd3", // Soft Rosewater (Delhi)
  RJ: "#fed7aa", // Warm Desert Sand (Rajasthan)
  UP: "#bbf7d0", // Gentle Herbal Mint (Uttar Pradesh)
  BR: "#fbcfe8", // Soft Pastel Blush (Bihar)
  GJ: "#fde68a", // Light Golden Honey (Gujarat)
  MP: "#e9d5ff", // Light Orchid (Madhya Pradesh)
  JH: "#ffedd5", // Pale Apricot (Jharkhand)
  WB: "#bae6fd", // Delicate Sky Blue (West Bengal)
  OR: "#fed7aa", // Light Terracotta (Odisha)
  CT: "#99f6e4", // Pale Turquoise (Chhattisgarh)
  MH: "#fecdd3", // Soft Coral Rose (Maharashtra)
  GA: "#fef08a", // Warm Sunlight (Goa)
  KA: "#ddd6fe", // Soft Lavender Mist (Karnataka)
  TG: "#d9f99d", // Light Olive Sprout (Telangana)
  AP: "#fbcfe8", // Delicate Blossom (Andhra Pradesh)
  KL: "#fde68a", // Pale Amber Gold (Kerala)
  TN: "#a7f3d0", // Soft Botanical Sage (Tamil Nadu)
  SK: "#fef08a", // Pale Primrose (Sikkim)
  AS: "#bbf7d0", // Light Green Tea (Assam)
  AR: "#fed7aa", // Soft Apricot (Arunachal Pradesh)
  NL: "#bae6fd", // Light Powder Blue (Nagaland)
  MN: "#e9d5ff", // Soft Lilac (Manipur)
  MZ: "#fef08a", // Pale Buttercup (Mizoram)
  TR: "#fecdd3", // Soft Petal (Tripura)
  ML: "#fed7aa", // Light Melon (Meghalaya)
  AN: "#bae6fd", // Pale Ocean (Andaman & Nicobar)
  LD: "#bae6fd", // Pale Lagoon (Lakshadweep)
  CH: "#c7d2fe", // Soft Periwinkle (Chandigarh)
  DN: "#99f6e4", // Pale Mineral Teal (Dadra & Nagar Haveli)
  DD: "#fecdd3", // Soft Rose (Daman & Diu)
  PY: "#ddd6fe", // Soft Iris (Puducherry)
};

export default function IndiaStateMap({ scope = "member" }: IndiaStateMapProps) {
  const [statesData, setStatesData] = useState<StateStat[]>([]);
  const [summary, setSummary] = useState<StateSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Interaction States
  const [hoveredState, setHoveredState] = useState<StateStat | null>(null);
  const [selectedState, setSelectedState] = useState<StateStat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "STATES" | "UTS">("ALL");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<"multicolor" | "mint" | "density">("multicolor");

  // Free 2D Pan & Scroll States
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Fetch state statistics from backend based on scope
  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await fetch(`/api/stats/states?scope=${scope}`);
        const data = await res.json();
        if (data.success) {
          setStatesData(data.states || []);
          setSummary(data.summary || null);
          if (data.states?.length > 0) {
            setSelectedState(data.states[0]);
          } else {
            setSelectedState(null);
          }
        }
      } catch (err) {
        console.error("Failed to load state distribution stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [scope]);

  // Map state codes to stats dictionary
  const statsByCode = useMemo(() => {
    const map: Record<string, StateStat> = {};
    statesData.forEach((st) => {
      map[st.code] = st;
      map[st.name.toLowerCase()] = st;
    });
    return map;
  }, [statesData]);

  // Max members for heatmap scaling
  const maxMembers = useMemo(() => {
    if (statesData.length === 0) return 1;
    return Math.max(...statesData.map((s) => s.total));
  }, [statesData]);

  // Color generator for any region
  const getStateFillColor = (code: string, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return "#059669"; // Fresh botanical emerald for selected
    if (isHovered) return "#34d399"; // Bright glowing mint on hover

    // 1. Professional Pastel Multicolor mode
    if (viewMode === "multicolor") {
      const stat = statsByCode[code];
      if (scope === "member" && (!stat || stat.total === 0)) {
        return "#f1f5f9"; // Ultra-clean light slate for 0 member states
      }
      return STATE_PALETTE[code] || "#d1fae5";
    }

    // 2. Light Mint mode
    if (viewMode === "mint") {
      const stat = statsByCode[code];
      if (stat && stat.total > 0) {
        return "#a7f3d0";
      }
      return "#f1f5f9";
    }

    // 3. Heatmap Density Mode
    const stat = statsByCode[code];
    if (!stat || stat.total === 0) {
      return "#f8fafc";
    }

    const ratio = stat.total / maxMembers;
    if (ratio > 0.5) return "#059669";
    if (ratio > 0.25) return "#10b981";
    if (ratio > 0.1) return "#34d399";
    if (ratio > 0.03) return "#6ee7b7";
    if (ratio > 0.01) return "#a7f3d0";
    return "#d1fae5";
  };

  // Helper to retrieve or construct default stat for any region code
  const getRegionStat = (code: string, name: string): StateStat => {
    return (
      statsByCode[code] || {
        code,
        name,
        total: 0,
        active: 0,
        inactive: 0,
        totalPv: 0,
        percentage: 0,
        activePercentage: 0,
        rank: 99,
        topCities: [],
      }
    );
  };

  // Filtered state list for search & category tabs
  const filteredStates = useMemo(() => {
    let list = statesData;

    if (categoryFilter === "STATES") {
      const stateCodes = new Set(
        ALL_INDIAN_STATES_AND_UTS.filter((r) => r.type === "STATE").map((r) => r.code)
      );
      list = list.filter((st) => stateCodes.has(st.code));
    } else if (categoryFilter === "UTS") {
      const utCodes = new Set(
        ALL_INDIAN_STATES_AND_UTS.filter((r) => r.type === "UT").map((r) => r.code)
      );
      list = list.filter((st) => utCodes.has(st.code));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (st) => st.name.toLowerCase().includes(q) || st.code.toLowerCase().includes(q)
      );
    }

    return list;
  }, [statesData, categoryFilter, searchQuery]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    });
  };

  const handleMouseMovePan = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers for mobile/tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheelZoom = (e: React.WheelEvent) => {
    // Smooth mouse wheel zoom
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoomLevel((z) => Math.min(3.0, Math.max(0.7, Number((z + delta).toFixed(2)))));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent, stateData: StateStat) => {
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setHoveredState(stateData);
  };

  const isMember = scope === "member";

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6 font-[Arial,sans-serif]">
      {/* 1. Header & Quick Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#059669] border border-emerald-200">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <span>{isMember ? "Your National Network Territory" : "India Direct Selling Footprint"}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-[#059669] font-bold">
                  Live Geographic Sync
                </span>
              </h2>
              <p className="text-xs text-stone-500 font-bold mt-0.5">
                {isMember
                  ? "Interactive live geographic distribution of your binary associate team across 28 States & 8 Union Territories"
                  : "All-India associate density, pin-code registrations and statewide BV performance"}
              </p>
            </div>
          </div>
        </div>

        {/* Aggregate KPI Badges */}
        {summary && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-2xl bg-[#fafafc] border border-stone-200 flex items-center gap-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold text-xs">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
                  Total Associates
                </span>
                <span className="text-sm font-bold text-stone-900">
                  {summary.totalMembers.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-[#fafafc] border border-stone-200 flex items-center gap-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
                  Active States
                </span>
                <span className="text-sm font-bold text-stone-900">
                  {summary.totalStatesCount} / 36
                </span>
              </div>
            </div>

            {summary.topState && (
              <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold text-xs">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold block">
                    Top Region
                  </span>
                  <span className="text-sm font-bold text-[#059669]">
                    {summary.topState.name} ({summary.topState.total})
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Main Visual Canvas + Sidebar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: Interactive Vector Map with Free Pan & Scroll */}
        <div className="lg:col-span-7 xl:col-span-8 bg-[#fafafc] rounded-3xl p-4 sm:p-6 border border-stone-200 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[580px]">
          
          {/* Subtle Map Controls Strip */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 z-20">
            {/* View Style Switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode("multicolor")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === "multicolor"
                    ? "bg-[#059669] text-white shadow-xs"
                    : "text-stone-600 hover:bg-emerald-50 hover:text-[#059669]"
                }`}
              >
                Light Colors
              </button>
              <button
                type="button"
                onClick={() => setViewMode("mint")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === "mint"
                    ? "bg-[#059669] text-white shadow-xs"
                    : "text-stone-600 hover:bg-emerald-50 hover:text-[#059669]"
                }`}
              >
                Mint Theme
              </button>
              <button
                type="button"
                onClick={() => setViewMode("density")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === "density"
                    ? "bg-[#059669] text-white shadow-xs"
                    : "text-stone-600 hover:bg-emerald-50 hover:text-[#059669]"
                }`}
              >
                Heatmap
              </button>
            </div>

            {/* Free Pan Drag & Zoom Controls */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.25))}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-stone-600 hover:text-[#059669] cursor-pointer transition-colors"
                title="Zoom In (or use mouse wheel)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.25))}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-stone-600 hover:text-[#059669] cursor-pointer transition-colors"
                title="Zoom Out (or use mouse wheel)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-stone-600 hover:text-[#059669] cursor-pointer transition-colors text-xs font-bold px-2 flex items-center gap-1"
                title="Reset Zoom & Pan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ({Math.round(zoomLevel * 100)}%)</span>
              </button>
            </div>
          </div>

          {/* Quick Spotlight & Magnification for Small States & UTs */}
          <div className="w-full bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-2.5 mb-2 z-10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#059669]" />
                <span>Small States &amp; UTs Spotlight (1-Click Focus):</span>
              </span>
              <span className="text-[9px] font-bold text-emerald-700">
                Click any tag to focus territory
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[68px] overflow-y-auto pr-1">
              {SMALL_STATES_AND_UTS.map((sm) => {
                const stat = getRegionStat(sm.code, sm.fullName);
                const isSelected = selectedState?.code === sm.code;
                const stateColor = STATE_PALETTE[sm.code] || "#059669";
                return (
                  <button
                    key={sm.code}
                    type="button"
                    onClick={() => {
                      setSelectedState(stat);
                      if (zoomLevel < 1.3) setZoomLevel(1.35);
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#059669] text-white border-[#059669] shadow-xs scale-105"
                        : "bg-white text-stone-700 border-emerald-200/80 hover:bg-emerald-100/60"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 border border-stone-300"
                      style={{ backgroundColor: stateColor }}
                    />
                    <span>{sm.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1 rounded-sm ${
                        isSelected ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {stat.total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag & Pan Hint */}
          <div className="w-full flex items-center justify-between text-[10px] text-stone-400 font-bold px-2 py-0.5 z-10 pointer-events-none">
            <span className="flex items-center gap-1">
              <Move className="w-3 h-3 text-[#059669]" />
              <span>Drag / Scroll anywhere to pan map freely in all directions</span>
            </span>
            <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
          </div>

          {/* SVG Map Container with Smooth Free 2D Drag & Pan */}
          <div
            ref={mapContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMovePan}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheelZoom}
            className={`map-svg-container relative w-full aspect-[612/696] max-w-[560px] flex items-center justify-center select-none py-2 overflow-hidden ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: "center center",
              }}
            >
              <svg
                viewBox={INDIA_MAP_VIEWBOX}
                className="w-full h-full filter drop-shadow-sm"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <filter id="state-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#059669" floodOpacity="0.35" />
                  </filter>
                  <filter id="pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.2" />
                  </filter>
                </defs>

                {/* 1. Base State Vector Polygons */}
                {INDIA_MAP_PATHS.map((statePath: StatePathData) => {
                  const stat = getRegionStat(statePath.code, statePath.name);
                  const isHovered = hoveredState?.code === statePath.code;
                  const isSelected = selectedState?.code === statePath.code;
                  const fillColor = getStateFillColor(statePath.code, isHovered, isSelected);

                  return (
                    <g key={statePath.code} className="cursor-pointer group">
                      <path
                        d={statePath.d}
                        id={`state-${statePath.code}`}
                        fill={fillColor}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? "2.4" : isHovered ? "2.0" : "1.2"}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        filter={isSelected || isHovered ? "url(#state-glow)" : undefined}
                        className="transition-colors duration-150 hover:brightness-105"
                        onMouseEnter={(e) => handleMouseMove(e, stat)}
                        onMouseMove={(e) => handleMouseMove(e, stat)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => setSelectedState(stat)}
                      />

                      {/* Standard Region Label Text */}
                      {statePath.labelPos && !statePath.isSmallState && (
                        <text
                          x={statePath.labelPos.x}
                          y={statePath.labelPos.y}
                          textAnchor="middle"
                          fontSize={statePath.labelPos.fontSize || "11"}
                          fontWeight="bold"
                          fill="#1e293b"
                          stroke="#ffffff"
                          strokeWidth="0.8"
                          paintOrder="stroke"
                          pointerEvents="none"
                          className="select-none font-sans"
                        >
                          {statePath.code}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 2. Interactive Hotspot Markers for Small States & UTs */}
                {INDIA_MAP_PATHS.filter((p) => p.isSmallState && p.hotspotPos).map((statePath) => {
                  const stat = getRegionStat(statePath.code, statePath.name);
                  const isHovered = hoveredState?.code === statePath.code;
                  const isSelected = selectedState?.code === statePath.code;
                  const stateColor = STATE_PALETTE[statePath.code] || "#059669";
                  const hx = statePath.hotspotPos!.x;
                  const hy = statePath.hotspotPos!.y;

                  return (
                    <g
                      key={`hotspot-${statePath.code}`}
                      className="cursor-pointer group select-none"
                      onMouseEnter={(e) => handleMouseMove(e, stat)}
                      onMouseMove={(e) => handleMouseMove(e, stat)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => setSelectedState(stat)}
                    >
                      {/* Outer Beacon Ring */}
                      <circle
                        cx={hx}
                        cy={hy}
                        r={isSelected ? "14" : isHovered ? "12" : "9"}
                        fill={isSelected ? "#059669" : stateColor}
                        fillOpacity={isSelected ? "0.35" : "0.25"}
                        className="animate-pulse"
                      />

                      {/* Core Pin Disc */}
                      <circle
                        cx={hx}
                        cy={hy}
                        r={isSelected ? "7" : "5.5"}
                        fill={isSelected ? "#059669" : stateColor}
                        stroke="#ffffff"
                        strokeWidth="1.8"
                        filter="url(#pin-shadow)"
                      />

                      {/* Code Tag Label Pill */}
                      <rect
                        x={hx + 8}
                        y={hy - 8}
                        width="24"
                        height="15"
                        rx="4"
                        fill={isSelected ? "#059669" : "#ffffff"}
                        stroke={isSelected ? "#059669" : "#cbd5e1"}
                        strokeWidth="1"
                        filter="url(#pin-shadow)"
                      />
                      <text
                        x={hx + 20}
                        y={hy + 2.5}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="bold"
                        fill={isSelected ? "#ffffff" : "#1e293b"}
                        pointerEvents="none"
                      >
                        {statePath.code}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredState && (
              <div
                className="absolute pointer-events-none z-30 bg-stone-900/90 text-white text-xs rounded-xl p-3 shadow-xl backdrop-blur-xs border border-white/20 space-y-1 animate-in fade-in zoom-in-95"
                style={{
                  left: Math.min(Math.max(tooltipPos.x + 15, 10), 380),
                  top: Math.min(Math.max(tooltipPos.y - 45, 10), 480),
                }}
              >
                <div className="font-bold flex items-center gap-1.5 text-sm border-b border-white/15 pb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-white"
                    style={{ backgroundColor: STATE_PALETTE[hoveredState.code] || "#10b981" }}
                  />
                  <span>{hoveredState.name} ({hoveredState.code})</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[11px] font-bold">
                  <span className="text-stone-300">Total Associates:</span>
                  <span className="font-mono text-emerald-400 font-bold">{hoveredState.total}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[11px] font-bold">
                  <span className="text-stone-300">Active (PV &gt; 0):</span>
                  <span className="font-mono text-emerald-300">{hoveredState.active} ({hoveredState.activePercentage}%)</span>
                </div>
                {hoveredState.totalPv > 0 && (
                  <div className="flex items-center justify-between gap-4 text-[11px] font-bold">
                    <span className="text-stone-300">Volume (PV):</span>
                    <span className="font-mono text-amber-300">{hoveredState.totalPv.toLocaleString()} PV</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Detailed State Inspector & Territorial Breakdown */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          
          {/* Selected State Spotlight Card */}
          {selectedState ? (
            <div className="bg-gradient-to-br from-emerald-50 via-white to-[#fafafc] rounded-3xl p-5 border-2 border-emerald-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider block">
                    Selected Region Inspector
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2 mt-0.5">
                    <span>{selectedState.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-[#059669] text-white rounded-md font-bold">
                      {selectedState.code}
                    </span>
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                    Territory Rank
                  </span>
                  <span className="text-base font-bold text-[#059669]">
                    #{selectedState.rank || "--"}
                  </span>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">
                    Team Members
                  </span>
                  <span className="text-xl font-bold text-stone-900 block mt-0.5">
                    {selectedState.total.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold">
                    {selectedState.percentage}% of national base
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">
                    Active (PV &gt; 0)
                  </span>
                  <span className="text-xl font-bold text-emerald-700 block mt-0.5">
                    {selectedState.active.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    {selectedState.activePercentage}% active ratio
                  </span>
                </div>
              </div>

              {/* Top Cities in Selected State */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Top Hubs &amp; Cities</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold">Pin-code Distribution</span>
                </div>
                {selectedState.topCities && selectedState.topCities.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedState.topCities.map((ct, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-bold border border-emerald-200/80"
                      >
                        <span>{ct.city}</span>
                        <span className="text-[10px] font-bold text-[#059669] bg-white px-1.5 py-0.2 rounded-sm border border-emerald-200">
                          {ct.count}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic py-1 font-bold">
                    No city distribution recorded yet for this state.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#fafafc] rounded-3xl p-6 border border-stone-200 text-center space-y-2">
              <Compass className="w-8 h-8 mx-auto text-stone-400 animate-spin" />
              <h4 className="text-sm font-bold text-stone-800">Select any state on the map</h4>
              <p className="text-xs text-stone-500 font-bold">
                Click any region or hotspot on the India map to inspect city clusters and member counts.
              </p>
            </div>
          )}

          {/* Statewide Search & Leaderboard */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#059669]" />
                <span>State Rankings ({filteredStates.length})</span>
              </h4>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#fafafc] p-0.5 rounded-lg border border-stone-200 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("ALL")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    categoryFilter === "ALL"
                      ? "bg-[#059669] text-white shadow-2xs"
                      : "text-stone-600 hover:text-[#059669]"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("STATES")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    categoryFilter === "STATES"
                      ? "bg-[#059669] text-white shadow-2xs"
                      : "text-stone-600 hover:text-[#059669]"
                  }`}
                >
                  28 States
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("UTS")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    categoryFilter === "UTS"
                      ? "bg-[#059669] text-white shadow-2xs"
                      : "text-stone-600 hover:text-[#059669]"
                  }`}
                >
                  8 UTs
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search state name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#fafafc] border border-stone-200 rounded-xl text-xs font-bold text-stone-900 placeholder-stone-400 outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            {/* Scrollable State List */}
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
              {filteredStates.map((st, idx) => {
                const isSelected = selectedState?.code === st.code;
                const stateColor = STATE_PALETTE[st.code] || "#059669";
                return (
                  <div
                    key={st.code}
                    onClick={() => setSelectedState(st)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/90 border-[#059669] shadow-2xs"
                        : "bg-[#fafafc] border-stone-100 hover:bg-stone-100/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-stone-300"
                        style={{ backgroundColor: stateColor }}
                      />
                      <span className="text-xs font-bold text-stone-900 truncate">
                        {st.name}
                      </span>
                      <span className="text-[10px] font-bold text-stone-400">
                        {st.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-stone-900">
                        {st.total}
                      </span>
                      <span className="text-[10px] text-stone-400 font-bold w-10 text-right">
                        {st.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
