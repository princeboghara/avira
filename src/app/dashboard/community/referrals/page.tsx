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
      header: "Joining Date",
      accessorKey: "joiningDate",
      sortable: true,
      cell: (row) => {
        const d = row.joiningDate ? new Date(row.joiningDate).toLocaleDateString("en-IN") : "Recent";
        return <span className="font-mono text-xs text-[#5f5e5e] font-semibold">{d}</span>;
      },
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
        <div>
          <div className="font-black text-sm text-[#1a1c1c]">{row.fullName}</div>
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
      <div className="space-y-5 max-w-6xl mx-auto pb-12">
        {/* Compact Page Header Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                My Community
              </span>
              <span className="text-[#5f5e5e] font-bold text-xs">
                • Direct Referrals
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1a1c1c] tracking-tight">
              Direct Referral Associates
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-0.5">
              All members directly sponsored by you in your Left and Right binary structures.
            </p>
          </div>

          <div className="px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center min-w-[130px] self-start sm:self-auto">
            <span className="text-[10px] font-bold text-[#006d36] uppercase block">
              Total Directs
            </span>
            <span className="text-xl font-black font-mono text-[#006d36]">
              {totalCount}
            </span>
          </div>
        </div>

        {/* DataTable without Checkbox and without Print */}
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
            selectable={false}
            showPrint={false}
            showIndex={true}
            title="Direct Referral Ledger"
            emptyMessage="No direct referrals registered yet. Share your Referral Link to sponsor members!"
          />
        )}
      </div>
    </MemberLayout>
  );
}
