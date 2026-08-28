"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Users,
  ShieldCheck,
  TrendingUp,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Globe,
  Layers,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { INDIA_MAP_PATHS, StatePathData } from "@/lib/indiaMapData";

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

// Curated colorful palette for states matching the user's reference map
const STATE_PALETTE: Record<string, string> = {
  JK: "#ef4444", // Red (Jammu & Kashmir)
  LA: "#f97316", // Orange (Ladakh)
  HP: "#84cc16", // Light Green (Himachal)
  PB: "#f59e0b", // Amber/Yellow (Punjab)
  UT: "#c084fc", // Lavender/Purple (Uttarakhand)
  HR: "#06b6d4", // Cyan (Haryana)
  DL: "#e11d48", // Rose Red (Delhi)
  RJ: "#a855f7", // Purple/Violet (Rajasthan)
  UP: "#84cc16", // Green/Lime (Uttar Pradesh)
  BR: "#9333ea", // Deep Purple (Bihar)
  GJ: "#fbbf24", // Warm Yellow/Gold (Gujarat)
  MP: "#e9d5ff", // Light Purple/Pastel (Madhya Pradesh)
  JH: "#fed7aa", // Light Orange (Jharkhand)
  WB: "#38bdf8", // Sky Blue (West Bengal)
  OR: "#f59e0b", // Deep Amber (Odisha)
  CT: "#7dd3fc", // Light Cyan (Chhattisgarh)
  MH: "#f87171", // Coral Pink/Red (Maharashtra)
  GA: "#eab308", // Yellow (Goa)
  KA: "#7e22ce", // Royal Purple (Karnataka)
  TG: "#65a30d", // Olive Green (Telangana)
  AP: "#f43f5e", // Rose (Andhra Pradesh)
  KL: "#f59e0b", // Amber (Kerala)
  TN: "#84cc16", // Lime Green (Tamil Nadu)
  SK: "#f59e0b", // Amber (Sikkim)
  AS: "#a3e635", // Light Green (Assam)
  AR: "#ef4444", // Red (Arunachal Pradesh)
  NL: "#0ea5e9", // Blue (Nagaland)
  MN: "#9333ea", // Purple (Manipur)
  MZ: "#fde047", // Yellow (Mizoram)
  TR: "#ef4444", // Red (Tripura)
  ML: "#f59e0b", // Amber (Meghalaya)
  AN: "#0284c7", // Ocean Blue (Andaman)
  LD: "#0284c7", // Ocean Blue (Lakshadweep)
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
  const [colorMode, setColorMode] = useState<"vibrant" | "density">("vibrant");

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
            setSelectedState(data.states[0]); // default select top state (Gujarat)
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
    if (isSelected) return "#006d36"; // Deep emerald for selected
    if (isHovered) return "#10b981"; // Bright emerald for hovered

    if (colorMode === "vibrant") {
      return STATE_PALETTE[code] || "#cbd5e1";
    }

    // Density Mode
    const stat = statsByCode[code];
    if (!stat || stat.total === 0) {
      return "#f1f5f9";
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
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* 1. Header & Summary Metric Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#006d36] text-[11px] font-black uppercase tracking-wider mb-1.5 border border-emerald-200/60">
            <Globe className="w-3.5 h-3.5 text-[#006d36]" />
            <span>Pan-India Live Network</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <span>India State-Wise Associates Distribution</span>
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time live geographic data synced directly from the Associate Member database.
          </p>
        </div>

        {/* Metric Badges */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Associates
              </span>
              <strong className="text-base font-black text-slate-900 font-mono">
                {summary.totalMembers.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Active (100+ PV)
              </span>
              <strong className="text-base font-black text-[#006d36] font-mono">
                {summary.activeMembers.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/60 p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                States Reached
              </span>
              <strong className="text-base font-black text-blue-900 font-mono">
                {summary.totalStatesCount} States
              </strong>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Top State (#1)
              </span>
              <strong className="text-xs font-black text-amber-900 truncate block">
                {summary.topState?.name || "Gujarat"} ({summary.topState?.total})
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Visual Grid: SVG Interactive Map (Left) + States Leaderboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INTERACTIVE SVG MAP */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 rounded-3xl p-4 sm:p-6 border border-slate-200 relative overflow-hidden flex flex-col items-center shadow-inner">
          {/* Top Controls: Mode Switcher & Zoom */}
          <div className="w-full flex items-center justify-between gap-2 mb-2 z-20">
            {/* Color Mode Switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setColorMode("vibrant")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  colorMode === "vibrant"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Vibrant States
              </button>
              <button
                type="button"
                onClick={() => setColorMode("density")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  colorMode === "density"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Heatmap
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.12))}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.12))}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SVG Map Container */}
          <div
            className="map-svg-container relative w-full aspect-[1000/1150] max-w-[580px] flex items-center justify-center transition-transform duration-300 select-none py-2"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg
              viewBox="0 0 1000 1150"
              className="w-full h-full filter drop-shadow-xl"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="state-glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
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
                      stroke={isSelected ? "#ffffff" : "#334155"}
                      strokeWidth={isSelected ? "3" : isHovered ? "2.5" : "1"}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      filter={isSelected || isHovered ? "url(#state-glow)" : undefined}
                      className="transition-all duration-200 hover:brightness-110 active:scale-[0.99]"
                      onMouseEnter={(e) => handleMouseMove(e, stat)}
                      onMouseMove={(e) => handleMouseMove(e, stat)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => setSelectedState(stat)}
                    />

                    {/* State Text Label */}
                    {statePath.labelPos && (
                      <text
                        x={statePath.labelPos.x}
                        y={statePath.labelPos.y}
                        textAnchor="middle"
                        fontSize={statePath.labelPos.fontSize || "12"}
                        fontWeight="800"
                        fill={isSelected ? "#ffffff" : stat.total > 100 ? "#0f172a" : "#1e293b"}
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

            {/* Interactive Floating Tooltip */}
            {hoveredState && (
              <div
                className="absolute pointer-events-none z-30 bg-slate-950/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700 min-w-[220px] animate-fadeIn text-xs space-y-2 -translate-x-1/2 -translate-y-full mb-4"
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
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-xl space-y-5 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg sm:text-xl">{selectedState.name}</h3>
                    <span className="text-xs text-emerald-300 font-mono">
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
                    {selectedState.percentage}% of all 1,641 members
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
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
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
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
              Click on any state in the map to inspect live metrics.
            </div>
          )}

          {/* State Leaderboard with Search */}
          <div className="bg-slate-50/70 rounded-3xl p-5 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>State Rankings Leaderboard</span>
              </h4>
              <span className="text-[10px] font-bold text-slate-400">
                {filteredStates.length} States Active
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search State (e.g. Gujarat, UP, Maharashtra)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 outline-hidden focus:border-[#006d36] shadow-2xs"
              />
            </div>

            {/* Scrollable State List */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {filteredStates.map((st) => {
                const isSelected = selectedState?.code === st.code;
                return (
                  <div
                    key={st.code}
                    onClick={() => setSelectedState(st)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.01]"
                        : "bg-white text-slate-800 border-slate-200/70 hover:border-emerald-300 hover:bg-emerald-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
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
                            : "bg-slate-100 text-slate-600"
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
                          isSelected ? "text-emerald-200" : "text-emerald-700 font-bold"
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
