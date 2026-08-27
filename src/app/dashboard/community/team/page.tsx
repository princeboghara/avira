"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Layers,
} from "lucide-react";
import MemberLayout from "@/components/dashboard/MemberLayout";

interface TeamMember {
  srNo: number;
  level: number;
  levelLabel: string;
  id: string;
  memberId: string;
  fullName: string;
  mobile: string;
  position: "LEFT" | "RIGHT";
  currentPv: number;
  status: string;
  joiningDate: string;
}

export default function AllTeamDirectoryPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [totalTeam, setTotalTeam] = useState(0);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  const loadTeam = async () => {
    try {
      const res = await fetch("/api/member/team");
      const data = await res.json();
      if (data.success && data.team) {
        setTeam(data.team);
        setTotalTeam(data.totalTeam || data.team.length);
        setLeftCount(data.leftCount || 0);
        setRightCount(data.rightCount || 0);
      }
    } catch (err) {
      console.error("Error loading team:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const distinctLevels = useMemo(() => {
    const set = new Set<number>();
    team.forEach((m) => set.add(m.level));
    return ["ALL", ...Array.from(set).sort((a, b) => a - b).map((l) => String(l))];
  }, [team]);

  const filteredTeam = useMemo(() => {
    return team.filter((m) => {
      const matchLevel = selectedLevel === "ALL" || String(m.level) === selectedLevel;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        m.memberId.toLowerCase().includes(q) ||
        m.fullName.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        m.position.toLowerCase().includes(q) ||
        m.levelLabel.toLowerCase().includes(q);
      return matchLevel && matchQuery;
    });
  }, [team, selectedLevel, searchQuery]);

  return (
    <MemberLayout>
      <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                My Community
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                2. All Team (Downline Hierarchy)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Downline Team Network
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Comprehensive list of all network associates placed across your binary tree with exact downline level depth.
            </p>
          </div>

          {/* Counts Badges */}
          <div className="flex items-center gap-2">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[95px]">
              <span className="text-[10px] font-bold text-[#006d36] uppercase block">Total Team</span>
              <span className="text-xl font-black font-mono text-[#006d36]">{totalTeam}</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-center min-w-[95px]">
              <span className="text-[10px] font-bold text-blue-700 uppercase block">Left Leg</span>
              <span className="text-xl font-black font-mono text-blue-800">{leftCount}</span>
            </div>
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-center min-w-[95px]">
              <span className="text-[10px] font-bold text-purple-700 uppercase block">Right Leg</span>
              <span className="text-xl font-black font-mono text-purple-800">{rightCount}</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e2e2e2]">
            {/* Level Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <span className="text-[11px] font-bold text-[#5f5e5e] uppercase mr-1">Depth:</span>
              {distinctLevels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedLevel === lvl
                      ? "bg-[#006d36] text-white shadow-xs"
                      : "bg-[#f9f9f9] text-[#5f5e5e] hover:text-[#1a1c1c] border border-[#e2e2e2]"
                  }`}
                >
                  {lvl === "ALL" ? "All Levels" : `Level ${lvl}`}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Member ID, Name, Level, Mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-2 pl-10 pr-4 text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f9f9f9] border-b border-[#e2e2e2] text-[#5f5e5e] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Sr No</th>
                  <th className="py-3.5 px-4">Down Level</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Member ID</th>
                  <th className="py-3.5 px-4">Associate Name</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Mobile No</th>
                  <th className="py-3.5 px-4">Current PV</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading team hierarchy...</span>
                    </td>
                  </tr>
                ) : filteredTeam.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#5f5e5e]">
                      No downline members found for the current search filter.
                    </td>
                  </tr>
                ) : (
                  filteredTeam.map((m, idx) => {
                    const formattedDate = m.joiningDate
                      ? new Date(m.joiningDate).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Recent";

                    return (
                      <tr key={m.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#5f5e5e]">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span className="bg-emerald-50 text-[#006d36] px-2.5 py-0.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            <span>{m.levelLabel}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#5f5e5e] whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-[#006d36]">
                          {m.memberId}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-sm text-[#1a1c1c]">
                          {m.fullName}
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              m.position === "LEFT"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                            }`}
                          >
                            {m.position} LEG
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#5f5e5e]">
                          {m.mobile}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-[#006d36] whitespace-nowrap">
                          +{m.currentPv} PV
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              m.status === "ACTIVE"
                                ? "bg-emerald-100 text-[#006d36] border-emerald-300"
                                : "bg-red-100 text-red-700 border-red-300"
                            }`}
                          >
                            {m.status === "ACTIVE" ? (
                              <CheckCircle2 className="w-3 h-3 text-[#006d36]" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-600" />
                            )}
                            <span>{m.status}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
