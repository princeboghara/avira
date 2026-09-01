"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Users, Network, ChevronRight } from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import IndiaStateMap from "@/components/dashboard/IndiaStateMap";

export default function CommunityNetworkMapPage() {
  return (
    <MemberLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
        {/* Header Navigation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500 font-medium">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                My Community
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span>India Network Distribution Map</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Downline Geographic Network Map</span>
              <MapPin className="w-6 h-6 text-[#006d36]" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Interactive state-by-state geographic distribution of your binary downline network across India with active associate counts and volume analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/community/team"
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#006d36] font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Users className="w-4 h-4" />
              <span>Team List</span>
            </Link>
            <Link
              href="/dashboard/tree"
              className="px-4 py-2.5 rounded-xl bg-[#006d36] text-white hover:bg-[#005025] font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Network className="w-4 h-4" />
              <span>Binary Tree</span>
            </Link>
          </div>
        </div>

        {/* India State Map Component */}
        <IndiaStateMap scope="member" />
      </div>
    </MemberLayout>
  );
}
