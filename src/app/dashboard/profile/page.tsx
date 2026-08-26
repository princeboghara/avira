"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import MemberLayout from "@/components/dashboard/MemberLayout";
import { User } from "@/types";
import {
  Loader2,
  User as UserIcon,
  Phone,
  MapPin,
  ShieldCheck,
  Award,
  Zap,
  Calendar,
  Wallet,
  Users,
} from "lucide-react";
import MemberCard3D from "@/components/3d/MemberCard3D";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#006d36] mb-3" />
        <span className="text-sm font-bold text-[#006d36]">Loading Associate Profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-[#1a1c1c] mb-2">Session Expired</h2>
        <p className="text-xs text-[#5f5e5e] mb-4">Please log in again to view your profile.</p>
        <Link href="/login" className="px-6 py-2.5 bg-[#006d36] text-white rounded-xl text-xs font-bold shadow-md">
          Go to Login
        </Link>
      </div>
    );
  }

  const isUserActive = user.personalPv >= 100;

  return (
    <MemberLayout user={user}>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c]">Associate Profile</h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Your official Avira Life Care Global registration and network credentials.
            </p>
          </div>

          <span
            className={`self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-xs ${
              isUserActive
                ? "bg-emerald-100 text-[#006d36] border-emerald-300"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
          >
            {isUserActive ? "Active (Green)" : "Inactive (Red • <100 PV)"}
          </span>
        </div>

        {/* 3D Holographic ID Card & Core Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Card Showcase */}
          <div className="flex justify-center">
            <MemberCard3D
              memberId={user.memberId}
              fullName={user.fullName}
              sponsorId={user.sponsorId}
              joinedDate={user.joinedDate}
              status={isUserActive ? "ACTIVE" : "INACTIVE"}
            />
          </div>

          {/* Detailed Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <div className="bg-white rounded-3xl p-6 border border-[#e2e2e2] shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#e2e2e2]">
                <UserIcon className="w-5 h-5 text-[#006d36]" />
                <h3 className="font-extrabold text-base text-[#1a1c1c]">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-[#f9f9f9] rounded-xl border border-[#e2e2e2]">
                  <span className="text-[10px] text-[#5f5e5e] uppercase tracking-wider block font-bold">
                    Member ID (4-Digit)
                  </span>
                  <span className="font-mono text-base font-black text-[#006d36]">
                    {user.memberId}
                  </span>
                </div>

                <div className="p-3.5 bg-[#f9f9f9] rounded-xl border border-[#e2e2e2]">
                  <span className="text-[10px] text-[#5f5e5e] uppercase tracking-wider block font-bold">
                    Full Legal Name
                  </span>
                  <span className="text-base font-extrabold text-[#1a1c1c]">
                    {user.fullName}
                  </span>
                </div>

                <div className="p-3.5 bg-[#f9f9f9] rounded-xl border border-[#e2e2e2]">
                  <span className="text-[10px] text-[#5f5e5e] uppercase tracking-wider block font-bold">
                    Registered Mobile
                  </span>
                  <span className="text-sm font-extrabold text-[#1a1c1c] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#006d36]" />
                    <span>+91 {user.mobile}</span>
                  </span>
                </div>

                <div className="p-3.5 bg-[#f9f9f9] rounded-xl border border-[#e2e2e2]">
                  <span className="text-[10px] text-[#5f5e5e] uppercase tracking-wider block font-bold">
                    Joined Date
                  </span>
                  <span className="text-sm font-extrabold text-[#1a1c1c] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#006d36]" />
                    <span>{user.joinedDate}</span>
                  </span>
                </div>
              </div>

              {/* Address Auto-Discovery Info */}
              <div className="p-3.5 bg-[#f9f9f9] rounded-xl border border-[#e2e2e2] text-xs">
                <span className="text-[10px] text-[#5f5e5e] uppercase tracking-wider block font-bold mb-1">
                  Registered Address
                </span>
                <span className="text-xs text-[#1a1c1c] font-semibold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#006d36] flex-shrink-0" />
                  <span>
                    {user.city}, {user.state} - {user.pincode}
                  </span>
                </span>
              </div>
            </div>

            {/* Network & Compensation Status */}
            <div className="bg-white rounded-3xl p-6 border border-[#e2e2e2] shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#e2e2e2]">
                <Zap className="w-5 h-5 text-[#006d36]" />
                <h3 className="font-extrabold text-base text-[#1a1c1c]">Network & Binary Status</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-[#006d36] uppercase tracking-wider block font-bold">
                    Personal Volume (PV)
                  </span>
                  <span className="text-xl font-mono font-black text-[#006d36]">
                    {user.personalPv} PV
                  </span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">
                    {isUserActive ? "Active Member" : "Needs 100 PV to Activate"}
                  </span>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-800 uppercase tracking-wider block font-bold">
                    Daily Binary Capping
                  </span>
                  <span className="text-xl font-mono font-black text-amber-900">
                    ₹{user.dailyCapping.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-amber-700 block mt-0.5">
                    Per Day Limit
                  </span>
                </div>

                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-800 uppercase tracking-wider block font-bold">
                    Sponsor Referral
                  </span>
                  <span className="text-sm font-mono font-black text-blue-900 block">
                    {user.sponsorId}
                  </span>
                  <span className="text-[10px] text-blue-700 block truncate">
                    {user.sponsorName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </MemberLayout>
  );
}
