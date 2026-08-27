"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Users,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Award,
  PlusCircle,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import DataTable, { Column } from "@/components/ui/DataTable";
import { User } from "@/types";

export default function AdminMemberMasterPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMembers = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/members");
      const data = await res.json();
      if (data.success && data.members) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error("Error loading members:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const columns: Column<User>[] = [
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
      header: "Sponsor ID",
      accessorKey: "sponsorId",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-[#5f5e5e]">
          {row.sponsorId || "DIRECT"}
        </span>
      ),
    },
    {
      header: "City / State",
      accessorKey: "city",
      sortable: true,
      cell: (row) => (
        <div className="text-xs text-[#5f5e5e]">
          <span>{row.city || "—"}</span>
          {row.state && <span className="block text-[10px] text-gray-400">{row.state}</span>}
        </div>
      ),
    },
    {
      header: "Personal PV",
      accessorKey: "personalPv",
      sortable: true,
      align: "center",
      cell: (row) => {
        const pv = row.personalPv || 0;
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
      header: "Status",
      accessorKey: "status",
      sortable: true,
      align: "center",
      cell: (row) => (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            row.status === "ACTIVE"
              ? "bg-emerald-100 text-[#006d36]"
              : row.status === "BLOCKED"
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      sortable: false,
      cell: (row) => (
        <Link
          href={`/admin/members/${row.id || row.memberId}/edit`}
          className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-emerald-50 hover:text-[#006d36] text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </Link>
      ),
    },
  ];

  return (
    <AdminLayout onRefresh={loadMembers} refreshing={refreshing}>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#006d36] via-[#005a2c] to-[#4f378a] text-white shadow-xl shadow-[#006d36]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-bold font-mono">
              <Users className="w-4 h-4" />
              <span>Associate Directory & KYC Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Member Master Registry
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Search, filter, view and manage all associate profiles, referral sponsors, personal PV allocations, and security credentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/pv/self"
              className="px-4 py-2.5 rounded-2xl bg-white text-[#006d36] font-bold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
            >
              Credit Self PV
            </Link>
          </div>
        </div>

        {/* Universal DataTable with Sorting, Pagination, and Column Indexing */}
        {loading ? (
          <div className="py-16 text-center text-[#006d36] flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">Loading Member Master Records...</span>
          </div>
        ) : (
          <DataTable
            data={members}
            columns={columns}
            keyExtractor={(item) => item.id || item.memberId}
            searchPlaceholder="Search by ID, Name, Mobile, City, Sponsor..."
            searchableKeys={["memberId", "fullName", "mobile", "city", "state", "sponsorId", "panNumber"]}
            initialPageSize={10}
            title="Registered Associates"
            emptyMessage="No associate records found matching your query."
          />
        )}
      </div>
    </AdminLayout>
  );
}
