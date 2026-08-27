"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Loader2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import MemberLayout from "@/components/dashboard/MemberLayout";

interface ReferralMember {
  srNo: number;
  id: string;
  memberId: string;
  fullName: string;
  mobile: string;
  position: "LEFT" | "RIGHT";
  currentPv: number;
  status: string;
  joiningDate: string;
}

export default function MyDirectReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralMember[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadReferrals = async () => {
    try {
      const res = await fetch("/api/member/referrals");
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

  const filteredReferrals = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return referrals;
    return referrals.filter(
      (m) =>
        m.memberId.toLowerCase().includes(q) ||
        m.fullName.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        m.position.toLowerCase().includes(q)
    );
  }, [referrals, searchQuery]);

  return (
    <MemberLayout>
      <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                My Community
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                1. My Direct Referral
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Direct Referral Associates
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Associates directly sponsored by you across Left and Right binary legs.
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

        {/* Table Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e2e2]">
            <span className="text-xs text-[#5f5e5e] font-bold">
              Showing <strong className="text-[#1a1c1c] font-mono">{filteredReferrals.length}</strong> of {totalCount} associates
            </span>

            {/* Search Bar */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Member ID, Name, Mobile..."
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
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Member ID</th>
                  <th className="py-3.5 px-4">Associate Name</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Mobile No</th>
                  <th className="py-3.5 px-4 text-right">Current PV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading direct referrals...</span>
                    </td>
                  </tr>
                ) : filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#5f5e5e]">
                      No direct referrals found. Share your Member ID to grow your binary network!
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map((m, idx) => {
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
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
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
                        <td className="py-3.5 px-4 font-mono font-black text-sm text-[#006d36] text-right whitespace-nowrap">
                          +{m.currentPv} PV
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
