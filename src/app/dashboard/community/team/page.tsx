"use client";

import React, { useEffect, useState } from "react";
import { Users, Loader2, Layers } from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import DataTable, { Column } from "@/components/ui/DataTable";

interface TeamMember {
  id: string;
  memberId: string;
  fullName: string;
  mobile: string;
  position: "LEFT" | "RIGHT";
  level: number;
  levelLabel: string;
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

  const loadTeam = async () => {
    try {
      const res = await fetch("/api/member/team", { cache: "no-store" });
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

  const columns: Column<TeamMember>[] = [
    {
      header: "Joining Date",
      accessorKey: "joiningDate",
      sortable: true,
      cell: (row) => {
        const d = row.joiningDate ? new Date(row.joiningDate).toLocaleDateString("en-IN") : "Recent";
        return <span className="font-mono text-xs text-[#5f5e5e] font-semibold">{d}</span>;
      },
    },
    {
      header: "Depth Level",
      accessorKey: "level",
      sortable: true,
      align: "center",
      cell: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
          Level {row.level}
        </span>
      ),
    },
    {
      header: "Member ID",
      accessorKey: "memberId",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-black text-sm text-[#006d36]">
          {row.memberId}
        </span>
      ),
    },
    {
      header: "Associate Name",
      accessorKey: "fullName",
      sortable: true,
      cell: (row) => (
        <div className="font-black text-sm text-[#1a1c1c]">
          {row.fullName}
        </div>
      ),
    },
    {
      header: "Binary Leg",
      accessorKey: "position",
      sortable: true,
      align: "center",
      cell: (row) => (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
            row.position === "LEFT"
              ? "bg-emerald-50 text-[#006d36] border border-emerald-200"
              : "bg-purple-50 text-purple-700 border border-purple-200"
          }`}
        >
          {row.position} Leg
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      align: "center",
      cell: (row) => {
        const isActive = (row.currentPv || 0) >= 100 || row.status === "ACTIVE";
        return (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              isActive
                ? "bg-emerald-100 text-[#006d36]"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
  ];

  return (
    <MemberLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                My Community
              </span>
              <span className="text-[#5f5e5e] font-bold">
                • Downline Team
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1a1c1c] tracking-tight">
              Total Binary Team
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-0.5">
              Complete downline network hierarchy across Left and Right binary structures with level depth indicators.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2.5 sm:p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center min-w-[90px]">
              <span className="text-[9px] font-bold text-[#006d36] uppercase block">Left Team</span>
              <span className="text-lg sm:text-xl font-black font-mono text-[#006d36]">{leftCount}</span>
            </div>
            <div className="p-2.5 sm:p-3 bg-purple-50 rounded-xl border border-purple-200 text-center min-w-[90px]">
              <span className="text-[9px] font-bold text-purple-700 uppercase block">Right Team</span>
              <span className="text-lg sm:text-xl font-black font-mono text-purple-800">{rightCount}</span>
            </div>
            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[100px]">
              <span className="text-[9px] font-bold text-[#1a1c1c] uppercase block">Total Members</span>
              <span className="text-lg sm:text-xl font-black font-mono text-[#1a1c1c]">{totalTeam}</span>
            </div>
          </div>
        </div>

        {/* DataTable */}
        {loading ? (
          <div className="py-16 text-center text-[#006d36] flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">Loading Downline Hierarchy...</span>
          </div>
        ) : (
          <DataTable
            data={team}
            columns={columns}
            keyExtractor={(item) => item.id || item.memberId}
            searchPlaceholder="Search by ID, Name, Level..."
            searchableKeys={["memberId", "fullName", "position"]}
            initialPageSize={10}
            selectable={false}
            showPrint={false}
            showIndex={true}
            title="Binary Team Directory"
            emptyMessage="No team members registered yet."
          />
        )}
      </div>
    </MemberLayout>
  );
}
