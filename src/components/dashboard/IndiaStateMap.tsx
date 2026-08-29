"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { INDIA_MAP_PATHS, INDIA_MAP_VIEWBOX, StatePathData } from "@/lib/indiaMapData";

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

// Distinct, vibrant & harmonious color palette for all Indian states and Union Territories
const STATE_PALETTE: Record<string, string> = {
  JK: "#ef4444", // Coral Red (Jammu & Kashmir)
  LA: "#f97316", // Vibrant Orange (Ladakh)
  HP: "#84cc16", // Lime Green (Himachal Pradesh)
  PB: "#f59e0b", // Amber/Gold (Punjab)
  UT: "#a855f7", // Violet (Uttarakhand)
  HR: "#06b6d4", // Cyan (Haryana)
  DL: "#e11d48", // Crimson Red (Delhi)
  RJ: "#8b5cf6", // Royal Purple (Rajasthan)
  UP: "#10b981", // Emerald Green (Uttar Pradesh)
  BR: "#ec4899", // Magenta/Pink (Bihar)
  GJ: "#f59e0b", // Warm Amber Gold (Gujarat)
  MP: "#c084fc", // Lavender (Madhya Pradesh)
  JH: "#fb923c", // Orange (Jharkhand)
  WB: "#38bdf8", // Sky Blue (West Bengal)
  OR: "#f97316", // Coral Orange (Odisha)
  CT: "#14b8a6", // Teal (Chhattisgarh)
  MH: "#f43f5e", // Rose Red (Maharashtra)
  GA: "#eab308", // Yellow (Goa)
  KA: "#7c3aed", // Deep Purple (Karnataka)
  TG: "#65a30d", // Olive Green (Telangana)
  AP: "#ec4899", // Bright Rose (Andhra Pradesh)
  KL: "#f59e0b", // Golden Amber (Kerala)
  TN: "#10b981", // Forest Green (Tamil Nadu)
  SK: "#f59e0b", // Amber (Sikkim)
  AS: "#84cc16", // Lime Green (Assam)
  AR: "#ef4444", // Red (Arunachal Pradesh)
  NL: "#0ea5e9", // Blue (Nagaland)
  MN: "#9333ea", // Purple (Manipur)
  MZ: "#facc15", // Sunny Yellow (Mizoram)
  TR: "#f43f5e", // Rose (Tripura)
  ML: "#fb923c", // Orange (Meghalaya)
  AN: "#0284c7", // Ocean Blue (Andaman)
  LD: "#0284c7", // Ocean Blue (Lakshadweep)
  CH: "#6366f1", // Indigo (Chandigarh)
  DN: "#14b8a6", // Teal (Dadra & Nagar Haveli)
  DD: "#f43f5e", // Rose (Daman & Diu)
  PY: "#8b5cf6", // Violet (Puducherry)
};

export default function IndiaStateMap() {
  const [statesData, setStatesData] = useState<StateStat[]>([]);
  const [summary, setSummary] = useState<StateSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Interaction States
  const [hoveredState, setHoveredState] = useState<StateStat | null>(null);
  const [selectedState, setSelectedState] = useState<StateStat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<"multicolor" | "mint" | "density">("multicolor");

  // Fetch state statistics from backend
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/stats/states");
        const data = await res.json();
        if (data.success) {
          setStatesData(data.states || []);
          setSummary(data.summary || null);
          if (data.states?.length > 0) {
            setSelectedState(data.states[0]); // default select top state (e.g. Gujarat)
          }
        }
      } catch (err) {
        console.error("Failed to load state distribution stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

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

  // Color generator
  const getStateFillColor = (code: string, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return "#006d36"; // Deep Avira emerald for selected
    if (isHovered) return "#10b981"; // Bright glowing emerald on hover

    // 1. Multicolor mode (each state has its own distinct unique color)
    if (viewMode === "multicolor") {
      return STATE_PALETTE[code] || "#a3d9be";
    }

    // 2. Light Mint mode (soft sage green)
    if (viewMode === "mint") {
      const stat = statsByCode[code];
      if (stat && stat.total > 0) {
        return "#9dd6b7";
      }
      return "#aee0c7";
    }

    // 3. Heatmap Density Mode
    const stat = statsByCode[code];
    if (!stat || stat.total === 0) {
      return "#d1fae5";
    }

    const ratio = stat.total / maxMembers;
    if (ratio > 0.5) return "#047857";
    if (ratio > 0.25) return "#059669";
    if (ratio > 0.1) return "#10b981";
    if (ratio > 0.03) return "#34d399";
    if (ratio > 0.01) return "#6ee7b7";
    return "#a7f3d0";
  };

  // Filtered state list for search
  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return statesData;
    const q = searchQuery.toLowerCase().trim();
    return statesData.filter(
      (st) => st.name.toLowerCase().includes(q) || st.code.toLowerCase().includes(q)
    );
  }, [statesData, searchQuery]);

  const handleMouseMove = (e: React.MouseEvent, stateData: StateStat | null) => {
    const rect = e.currentTarget.closest(".map-svg-container")?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setHoveredState(stateData);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
      {/* 1. Header & Summary Metric Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-emerald-100/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#006d36] text-[11px] font-black uppercase tracking-wider mb-1.5 border border-emerald-200/60">
            <Globe className="w-3.5 h-3.5 text-[#006d36]" />
            <span>Pan-India Live Network</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <span>India Geographic Network Map</span>
            <Sparkles className="w-5 h-5 text-emerald-500 fill-emerald-400" />
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time live geographic state-wise associate distribution across all Indian States & UTs.
          </p>
        </div>

        {/* Metric Badges */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50/40 border border-emerald-100 p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Associates
              </span>
              <strong className="text-base font-black text-slate-900 font-mono">
                {summary.totalMembers.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200/70 p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Active (100+ PV)
              </span>
              <strong className="text-base font-black text-[#006d36] font-mono">
                {summary.activeMembers.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="bg-teal-50/60 border border-teal-200/60 p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                States Reached
              </span>
              <strong className="text-base font-black text-teal-900 font-mono">
                {summary.totalStatesCount} States
              </strong>
            </div>

            <div className="bg-emerald-100/60 border border-emerald-300/70 p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Top State (#1)
              </span>
              <strong className="text-xs font-black text-emerald-950 truncate block">
                {summary.topState?.name || "Gujarat"} ({summary.topState?.total})
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Visual Grid: SVG Interactive Map (Left) + States Leaderboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: AUTHENTIC SVG MAP */}
        <div className="lg:col-span-7 bg-gradient-to-b from-[#f9fcfb] via-[#ffffff] to-[#f4f9f6] rounded-3xl p-4 sm:p-6 border border-emerald-100/80 relative overflow-hidden flex flex-col items-center shadow-inner">
          {/* Top Controls: Mode Switcher & Zoom */}
          <div className="w-full flex items-center justify-between gap-2 mb-2 z-20">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-emerald-200/80 shadow-2xs text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode("multicolor")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "multicolor"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                <Palette className="w-3 h-3" />
                <span>State Colors</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("mint")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === "mint"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                Mint Theme
              </button>
              <button
                type="button"
                onClick={() => setViewMode("density")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === "density"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                Heatmap
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-emerald-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.12))}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 cursor-pointer transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.12))}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 cursor-pointer transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 cursor-pointer transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SVG Map Container */}
          <div
            className="map-svg-container relative w-full aspect-[612/696] max-w-[560px] flex items-center justify-center transition-transform duration-300 select-none py-2"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg
              viewBox={INDIA_MAP_VIEWBOX}
              className="w-full h-full filter drop-shadow-md"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="state-glow" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#006d36" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* State Paths */}
              {INDIA_MAP_PATHS.map((statePath: StatePathData) => {
                const stat = statsByCode[statePath.code] || {
                  code: statePath.code,
                  name: statePath.name,
                  total: 0,
                  active: 0,
                  inactive: 0,
                  totalPv: 0,
                  percentage: 0,
                  activePercentage: 0,
                  rank: 99,
                  topCities: [],
                };
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
                      strokeWidth={isSelected ? "2.2" : isHovered ? "1.8" : "1.2"}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      filter={isSelected || isHovered ? "url(#state-glow)" : undefined}
                      className="transition-all duration-200 hover:brightness-110 active:scale-[0.99]"
                      onMouseEnter={(e) => handleMouseMove(e, stat)}
                      onMouseMove={(e) => handleMouseMove(e, stat)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => setSelectedState(stat)}
                    />

                    {/* State Text Label Abbreviation */}
                    {statePath.labelPos && (
                      <text
                        x={statePath.labelPos.x}
                        y={statePath.labelPos.y}
                        textAnchor="middle"
                        fontSize={statePath.labelPos.fontSize || "11"}
                        fontWeight="900"
                        fill={isSelected ? "#ffffff" : "#ffffff"}
                        stroke="#000000"
                        strokeWidth="0.5"
                        paintOrder="stroke"
                        pointerEvents="none"
                        className="select-none font-sans drop-shadow-xs"
                      >
                        {statePath.code}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Watermark Typography */}
            <div className="absolute bottom-4 right-4 pointer-events-none text-right select-none space-y-0.5">
              <div className="font-serif text-base tracking-[0.35em] text-[#006d36]/40 font-bold uppercase">
                INDIA
              </div>
              <div className="text-[9px] font-sans tracking-widest text-[#006d36]/30 uppercase font-medium">
                ASSOCIATE NETWORK MAP
              </div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-[#006d36]/10 text-[8px] font-mono text-[#006d36]/50 uppercase font-bold tracking-wider mt-0.5">
                GIS VECTOR
              </div>
            </div>

            {/* Interactive Floating Tooltip */}
            {hoveredState && (
              <div
                className="absolute pointer-events-none z-30 bg-slate-950/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 min-w-[220px] animate-fadeIn text-xs space-y-2 -translate-x-1/2 -translate-y-full mb-4"
                style={{
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y}px`,
                }}
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 font-black text-sm text-emerald-400">
                    <MapPin className="w-4 h-4" />
                    <span>{hoveredState.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {hoveredState.code}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Associates:</span>
                    <strong className="font-mono text-white text-sm font-black">
                      {hoveredState.total.toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Active (100+ PV):</span>
                    <strong className="font-mono text-emerald-400 font-bold">
                      {hoveredState.active.toLocaleString("en-IN")} ({hoveredState.activePercentage}%)
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">National Share:</span>
                    <strong className="font-mono text-amber-300 font-bold">
                      {hoveredState.percentage}%
                    </strong>
                  </div>
                </div>

                {hoveredState.rank <= 5 && (
                  <div className="pt-1.5 border-t border-slate-800 text-[10px] text-amber-400 font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Rank #{hoveredState.rank} State in India</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STATE DETAILS & LEADERBOARD */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected State Card */}
          {selectedState ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#006d36] via-[#055c30] to-[#014723] text-white shadow-xl space-y-5 border border-emerald-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-md font-mono font-black text-base"
                    style={{
                      backgroundColor: STATE_PALETTE[selectedState.code] || "#059669",
                    }}
                  >
                    {selectedState.code}
                  </div>
                  <div>
                    <h3 className="font-black text-lg sm:text-xl">{selectedState.name}</h3>
                    <span className="text-xs text-emerald-200 font-mono">
                      State Code: {selectedState.code} • National Rank #{selectedState.rank}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-400 text-gray-950 font-black text-xs shadow-xs">
                  {selectedState.percentage}% Share
                </span>
              </div>

              {/* Stat Boxes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">
                    Total Associates
                  </span>
                  <strong className="text-2xl font-black font-mono text-white">
                    {selectedState.total.toLocaleString("en-IN")}
                  </strong>
                  <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                    {selectedState.percentage}% of all members
                  </span>
                </div>

                <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">
                    Active (100+ PV)
                  </span>
                  <strong className="text-2xl font-black font-mono text-emerald-300">
                    {selectedState.active.toLocaleString("en-IN")}
                  </strong>
                  <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                    {selectedState.activePercentage}% active ratio
                  </span>
                </div>
              </div>

              {/* Top Cities in this State */}
              {selectedState.topCities && selectedState.topCities.length > 0 && (
                <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Top Hubs / Districts in {selectedState.name}:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedState.topCities.map((ct) => (
                      <span
                        key={ct.city}
                        className="px-2.5 py-1 rounded-xl bg-white/15 text-[11px] font-bold font-mono text-white flex items-center gap-1"
                      >
                        <span>{ct.city}</span>
                        <span className="text-emerald-300 font-normal">({ct.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar for Active vs Inactive */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-emerald-200">
                  <span>Network Health</span>
                  <span>
                    {selectedState.active} Active • {selectedState.inactive} Inactive
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/20 overflow-hidden flex">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${selectedState.activePercentage || 0}%` }}
                  />
                  <div
                    className="bg-rose-400/80 h-full transition-all duration-500"
                    style={{ width: `${100 - (selectedState.activePercentage || 0)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 text-center text-emerald-800 text-xs">
              Click on any state in the map to inspect live metrics.
            </div>
          )}

          {/* State Leaderboard with Search */}
          <div className="bg-[#fcfdfd] rounded-3xl p-5 border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>State Rankings Leaderboard</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {filteredStates.length} Active States
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search State (e.g. Gujarat, Maharashtra, UP)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-emerald-100 text-xs text-slate-900 outline-hidden focus:border-[#006d36] focus:ring-1 focus:ring-[#006d36] shadow-2xs"
              />
            </div>

            {/* Scrollable State List */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {filteredStates.map((st) => {
                const isSelected = selectedState?.code === st.code;
                const stateColor = STATE_PALETTE[st.code] || "#059669";
                return (
                  <div
                    key={st.code}
                    onClick={() => setSelectedState(st)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[#006d36] text-white border-[#006d36] shadow-md scale-[1.01]"
                        : "bg-white text-slate-800 border-emerald-100/70 hover:border-emerald-300 hover:bg-emerald-50/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Color indicator pip */}
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-white shadow-xs"
                        style={{ backgroundColor: stateColor }}
                        title={st.name}
                      />

                      <span
                        className={`w-6 h-6 rounded-lg text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : st.rank === 1
                            ? "bg-amber-100 text-amber-800"
                            : st.rank === 2
                            ? "bg-slate-200 text-slate-800"
                            : st.rank === 3
                            ? "bg-orange-100 text-orange-800"
                            : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {st.rank}
                      </span>
                      <div className="truncate">
                        <strong className="block text-xs truncate">{st.name}</strong>
                        <span
                          className={`text-[10px] font-mono ${
                            isSelected ? "text-emerald-100" : "text-slate-400"
                          }`}
                        >
                          {st.active} Active (100+ PV)
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <strong className="font-mono text-xs block">
                        {st.total.toLocaleString("en-IN")}
                      </strong>
                      <span
                        className={`text-[10px] font-mono ${
                          isSelected ? "text-emerald-200" : "text-[#006d36] font-bold"
                        }`}
                      >
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
