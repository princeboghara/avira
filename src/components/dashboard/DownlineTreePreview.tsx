"use client";

import React, { useState } from "react";
import { Network, Search, UserCheck, ShieldCheck, ChevronRight, Sparkles } from "lucide-react";
import { User } from "@/types";

interface DownlineMember {
  memberId: string;
  fullName: string;
  city: string;
  state: string;
  joinedDate: string;
  level: number;
  status: "ACTIVE" | "PENDING";
  package: string;
  volume: number;
}

export default function DownlineTreePreview({ user }: { user: User }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Demo downline members under this account
  const initialMembers: DownlineMember[] = [
    {
      memberId: "AV55124",
      fullName: "Virendra Shah",
      city: "Ahmedabad",
      state: "Gujarat",
      joinedDate: "2026-08-25",
      level: 1,
      status: "ACTIVE",
      package: "Diamond Pro (₹25,000)",
      volume: 25000,
    },
    {
      memberId: "AV67812",
      fullName: "Priya Sharma",
      city: "Surat",
      state: "Gujarat",
      joinedDate: "2026-08-24",
      level: 1,
      status: "ACTIVE",
      package: "Gold Elite (₹10,000)",
      volume: 10000,
    },
    {
      memberId: "AV71409",
      fullName: "Amit Verma",
      city: "Mumbai",
      state: "Maharashtra",
      joinedDate: "2026-08-22",
      level: 1,
      status: "ACTIVE",
      package: "Silver Starter (₹5,000)",
      volume: 5000,
    },
    {
      memberId: "AV89231",
      fullName: "Sunita Joshi",
      city: "Jaipur",
      state: "Rajasthan",
      joinedDate: "2026-08-21",
      level: 2,
      status: "ACTIVE",
      package: "Gold Elite (₹10,000)",
      volume: 10000,
    },
    {
      memberId: "AV94510",
      fullName: "Karan Desai",
      city: "Vadodara",
      state: "Gujarat",
      joinedDate: "2026-08-20",
      level: 2,
      status: "ACTIVE",
      package: "Diamond Pro (₹25,000)",
      volume: 25000,
    },
  ];

  const filteredMembers = initialMembers.filter(
    (m) =>
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-white rounded-3xl p-6 sm:p-8 border border-emerald-500/20 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-5 h-5 text-emerald-700" />
            <h3 className="text-xl font-black text-[#022c22] tracking-tight">
              Network Downline & Geneology
            </h3>
          </div>
          <p className="text-xs text-emerald-800">
            Real-time tree view of your direct associates and level team volume.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search Member ID / Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-emerald-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
          />
          <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Visual Tree Root Node */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-emerald-300/40 flex items-center justify-center font-mono font-bold text-amber-300">
            ROOT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base">{user.fullName}</span>
              <span className="font-mono text-xs bg-emerald-700/80 px-2 py-0.5 rounded text-amber-300 font-bold">
                {user.memberId}
              </span>
            </div>
            <span className="text-xs text-emerald-200 block">
              Direct Team: {user.directReferralsCount} • Total Downline: {user.totalTeamCount} Nodes
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-emerald-300 font-medium bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Network Leader</span>
          </span>
        </div>
      </div>

      {/* Downline Table */}
      <div className="overflow-x-auto rounded-2xl border border-emerald-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-emerald-50 text-emerald-950 font-bold uppercase tracking-wider text-[10px] border-b border-emerald-200">
            <tr>
              <th className="py-3 px-4">Member ID</th>
              <th className="py-3 px-4">Associate Name</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Level</th>
              <th className="py-3 px-4">Package</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100 bg-white">
            {filteredMembers.map((member) => (
              <tr key={member.memberId} className="hover:bg-emerald-50/50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-900 flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{member.memberId}</span>
                </td>
                <td className="py-3.5 px-4 font-bold text-[#022c22]">{member.fullName}</td>
                <td className="py-3.5 px-4 text-emerald-900/80">
                  {member.city}, {member.state}
                </td>
                <td className="py-3.5 px-4">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    Level {member.level}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-medium text-emerald-950">{member.package}</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{member.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-emerald-800">
        <span>Showing {filteredMembers.length} active network associates</span>
        <button
          onClick={() => alert("Full 7-level interactive canvas tree view is ready for phase 2 expansion.")}
          className="font-bold text-emerald-700 hover:text-emerald-950 flex items-center gap-1"
        >
          <span>View Complete 7-Level Tree</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
