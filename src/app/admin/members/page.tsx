"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  Users,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { User } from "@/types";

export default function AdminMemberMasterPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Edit Member Modal
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
    status: "ACTIVE",
  });
  const [submitting, setSubmitting] = useState(false);

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

  const displayedMembers = useMemo(() => {
    return members.filter((m) => {
      const matchStatus = statusFilter === "ALL" || m.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (m.memberId || "").toLowerCase().includes(q) ||
        (m.fullName || "").toLowerCase().includes(q) ||
        (m.mobile && m.mobile.includes(q)) ||
        (m.city && m.city.toLowerCase().includes(q)) ||
        (m.sponsorId && m.sponsorId.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [members, statusFilter, searchQuery]);

  const handleOpenEdit = (m: User) => {
    setEditingMember(m);
    setEditForm({
      fullName: m.fullName,
      mobile: m.mobile,
      city: m.city || "",
      state: m.state || "",
      pincode: m.pincode || "",
      address: (m as any).address || "",
      status: m.status,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: editingMember.memberId,
          ...editForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingMember(null);
        await loadMembers();
        alert("Member details updated successfully!");
      } else {
        alert(data.message || "Failed to update member");
      }
    } catch {
      alert("Error updating member");
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = members.filter((m) => m.status === "ACTIVE").length;

  return (
    <AdminLayout onRefresh={loadMembers} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Network Registry
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Member Manager • 1. Member Master
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Associate Directory & Master Records
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Complete registry of all registered associates, contact details, sponsor relationships, and PV balances.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[100px]">
              <span className="text-[10px] font-bold text-[#006d36] uppercase block">Total</span>
              <span className="text-xl font-black font-mono text-[#006d36]">{members.length}</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-center min-w-[100px]">
              <span className="text-[10px] font-bold text-blue-700 uppercase block">Active</span>
              <span className="text-xl font-black font-mono text-blue-800">{activeCount}</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-[#e2e2e2]">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              {["ALL", "ACTIVE", "INACTIVE", "BLOCKED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-[#006d36] text-white shadow-xs"
                      : "text-[#5f5e5e] hover:text-[#1a1c1c]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Member ID, Name, Mobile, Sponsor..."
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
                  <th className="py-3.5 px-4">Member ID</th>
                  <th className="py-3.5 px-4">Associate Name</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Sponsor ID</th>
                  <th className="py-3.5 px-4">City / State</th>
                  <th className="py-3.5 px-4">Personal PV</th>
                  <th className="py-3.5 px-4">Earnings (₹)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading associates...</span>
                    </td>
                  </tr>
                ) : displayedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-[#5f5e5e]">
                      No associates found matching the search filter.
                    </td>
                  </tr>
                ) : (
                  displayedMembers.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#5f5e5e]">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-black text-[#006d36]">
                        {m.memberId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-sm text-[#1a1c1c]">
                        {m.fullName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#5f5e5e]">{m.mobile || "—"}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1a1c1c]">
                        {m.sponsorId || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-[#5f5e5e]">
                        {[m.city, m.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-[#006d36]">
                        {m.personalPv} PV
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1a1c1c]">
                        ₹{Number(m.totalEarnings || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
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
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded-lg border border-[#e2e2e2] text-[#006d36] hover:bg-emerald-50 cursor-pointer"
                          title="Edit Associate Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div>
                <h3 className="font-black text-base text-[#1a1c1c]">Edit Member Profile</h3>
                <span className="text-[11px] font-mono text-[#006d36] font-bold">
                  Associate: {editingMember.memberId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  required
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-mono text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 text-xs text-[#1a1c1c]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 text-xs text-[#1a1c1c]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                  Account Status *
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="w-full py-2.5 rounded-xl border border-[#e2e2e2] text-[#5f5e5e] font-bold text-xs hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
