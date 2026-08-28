"use client";

import React, { useEffect, useState } from "react";
import { Users, Loader2, Award, Calendar } from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import DataTable, { Column } from "@/components/ui/DataTable";

interface ReferralMember {
  id: string;
  memberId: string;
  fullName: string;
  mobile: string;
  sponsorId: string;
  position: "LEFT" | "RIGHT";
  currentPv: number;
  status: string;
  joiningDate: string;
}

export default function MyDirectReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralMember[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadReferrals = async () => {
    try {
      const res = await fetch("/api/member/referrals", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.referrals) {
        setReferrals(data.referrals);
        setTotalCount(data.totalReferrals || data.referrals.length);
      }
    } catch (err) {
      console.error("Error loading direct referrals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const columns: Column<ReferralMember>[] = [
    {
      header: "Member ID",
      accessorKey: "memberId",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#006d36]">
          {row.memberId}
        </span>
      ),
    },
    {
      header: "Associate Name",
      accessorKey: "fullName",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-[#1a1c1c]">{row.fullName}</div>
          <div className="font-mono text-[10px] text-[#5f5e5e]">{row.mobile}</div>
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
          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
            row.position === "LEFT"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-purple-50 text-purple-700 border border-purple-200"
          }`}
        >
          {row.position} Leg
        </span>
      ),
    },
    {
      header: "Personal PV",
      accessorKey: "currentPv",
      sortable: true,
      align: "center",
      cell: (row) => {
        const pv = row.currentPv || 0;
        const isActive = pv >= 100;
        return (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
              isActive ? "bg-emerald-100 text-[#006d36]" : "bg-red-100 text-red-700"
            }`}
          >
            {pv} PV
          </span>
        );
      },
    },
    {
      header: "Joining Date",
      accessorKey: "joiningDate",
      sortable: true,
      cell: (row) => {
        const d = row.joiningDate ? new Date(row.joiningDate).toLocaleDateString("en-IN") : "Recent";
        return <span className="font-mono text-xs text-[#5f5e5e]">{d}</span>;
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      align: "center",
      cell: (row) => (
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            (row.currentPv || 0) >= 100
              ? "bg-emerald-100 text-[#006d36]"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {(row.currentPv || 0) >= 100 ? "Active" : "Red (0-99 PV)"}
        </span>
      ),
    },
  ];

  return (
    <MemberLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                My Community
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Direct Referral Team
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Direct Referral Associates
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              All members directly sponsored by you in your Left and Right binary structures.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[140px]">
            <span className="text-[10px] font-bold text-[#006d36] uppercase block">
              Total Direct Referrals
            </span>
            <span className="text-2xl font-black font-mono text-[#006d36]">
              {totalCount}
            </span>
          </div>
        </div>

        {/* DataTable */}
        {loading ? (
          <div className="py-16 text-center text-[#006d36] flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">Loading Direct Referrals...</span>
          </div>
        ) : (
          <DataTable
            data={referrals}
            columns={columns}
            keyExtractor={(item) => item.id || item.memberId}
            searchPlaceholder="Search direct referrals by ID, Name, Mobile..."
            searchableKeys={["memberId", "fullName", "mobile", "position"]}
            initialPageSize={10}
            title="Direct Referral Ledger"
            emptyMessage="No direct referrals registered yet. Share your Referral Link to sponsor members!"
          />
        )}
      </div>
    </MemberLayout>
  );
}
