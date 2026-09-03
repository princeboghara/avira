"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  Percent,
  Edit2,
  Trash2,
  Plus,
  X,
  Search,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface HsnCode {
  id: string;
  hsnCode: string;
  sgst: number;
  cgst: number;
  igst: number;
  description?: string;
  liveCount?: number;
  createdAt?: string;
}

export default function AdminHsnCodePage() {
  const [hsnCodes, setHsnCodes] = useState<HsnCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Add / Edit HSN Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHsn, setEditingHsn] = useState<HsnCode | null>(null);
  const [hsnForm, setHsnForm] = useState({
    hsnCode: "",
    sgst: 2.5,
    cgst: 2.5,
    igst: 5.0,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadHsn = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/hsn");
      const data = await res.json();
      if (data.success && data.hsnCodes) {
        setHsnCodes(data.hsnCodes);
      }
    } catch (err) {
      console.error("Error loading HSN codes:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHsn();
  }, []);

  const displayedHsn = hsnCodes.filter((hsn) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      hsn.hsnCode.toLowerCase().includes(q) ||
      (hsn.description && hsn.description.toLowerCase().includes(q))
    );
  });

  const handleOpenAddModal = () => {
    setEditingHsn(null);
    setHsnForm({
      hsnCode: "",
      sgst: 2.5,
      cgst: 2.5,
      igst: 5.0,
      description: "",
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (hsn: HsnCode) => {
    setEditingHsn(hsn);
    setHsnForm({
      hsnCode: hsn.hsnCode,
      sgst: hsn.sgst,
      cgst: hsn.cgst,
      igst: hsn.igst,
      description: hsn.description || "",
    });
    setModalOpen(true);
  };

  const handleSaveHsn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hsnForm.hsnCode.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/hsn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingHsn?.id,
          hsnCode: hsnForm.hsnCode.trim(),
          sgst: Number(hsnForm.sgst),
          cgst: Number(hsnForm.cgst),
          igst: Number(hsnForm.igst),
          description: hsnForm.description.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        await loadHsn();
      } else {
        alert(data.message || "Failed to save HSN Code");
      }
    } catch {
      alert("Error saving HSN Code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHsn = async (hsn: HsnCode) => {
    if (!confirm(`Are you sure you want to delete HSN Code "${hsn.hsnCode}"?`)) return;

    try {
      const res = await fetch(`/api/admin/hsn/${hsn.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadHsn();
      } else {
        alert(data.message || "Failed to delete HSN Code");
      }
    } catch {
      alert("Error deleting HSN Code");
    }
  };

  return (
    <AdminLayout onRefresh={loadHsn} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="neo-card rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full neo-inset text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider border border-emerald-200/50">
                Tax Registry
              </span>
              <span className="text-xs text-[#64748b] font-medium">
                Product Manager • 2. HSN Code Master
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
              HSN Code & GST Tax Master
            </h1>
            <p className="text-xs text-[#64748b] mt-1 font-medium">
              Manage GST tax rates (SGST, CGST, IGST) mapped to HSN codes and live product counts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="neo-btn-primary px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-[4px_4px_12px_rgba(0,109,54,0.3),-2px_-2px_8px_#ffffff] cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New HSN Code</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e2e2]">
            <span className="text-xs text-[#5f5e5e] font-bold">
              Total HSN Codes: <strong className="text-[#1a1c1c] font-mono">{hsnCodes.length}</strong>
            </span>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search HSN codes..."
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
                  <th className="py-3.5 px-4">HSN Code</th>
                  <th className="py-3.5 px-4">SGST (%)</th>
                  <th className="py-3.5 px-4">CGST (%)</th>
                  <th className="py-3.5 px-4">IGST (%)</th>
                  <th className="py-3.5 px-4">Total Tax</th>
                  <th className="py-3.5 px-4 text-center">Live Products</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading HSN codes...</span>
                    </td>
                  </tr>
                ) : displayedHsn.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#5f5e5e]">
                      No HSN codes found. Click &quot;Add New HSN Code&quot; to configure tax brackets.
                    </td>
                  </tr>
                ) : (
                  displayedHsn.map((hsn, idx) => (
                    <tr key={hsn.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#5f5e5e]">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-[#006d36]">
                        {hsn.hsnCode}
                      </td>
                      <td className="py-3.5 px-4 font-mono">{hsn.sgst}%</td>
                      <td className="py-3.5 px-4 font-mono">{hsn.cgst}%</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{hsn.igst}%</td>
                      <td className="py-3.5 px-4 font-mono font-black text-[#1a1c1c]">
                        <span className="bg-emerald-50 text-[#006d36] px-2 py-0.5 rounded border border-emerald-200">
                          {Number(hsn.sgst) + Number(hsn.cgst)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          {hsn.liveCount || 0} Live
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#5f5e5e]">{hsn.description || "—"}</td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(hsn)}
                            className="p-1.5 rounded-lg border border-[#e2e2e2] text-[#006d36] hover:bg-emerald-50 cursor-pointer"
                            title="Edit HSN Code"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHsn(hsn)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Delete HSN Code"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit HSN Code Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <h3 className="font-black text-base text-[#1a1c1c]">
                {editingHsn ? "Edit HSN Code" : "Add HSN Code"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHsn} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                  HSN Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3004 or 2106"
                  value={hsnForm.hsnCode}
                  onChange={(e) => setHsnForm({ ...hsnForm, hsnCode: e.target.value })}
                  required
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-mono font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                    SGST (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={hsnForm.sgst}
                    onChange={(e) => setHsnForm({ ...hsnForm, sgst: Number(e.target.value) })}
                    required
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-mono font-bold text-xs text-[#1a1c1c]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                    CGST (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={hsnForm.cgst}
                    onChange={(e) => setHsnForm({ ...hsnForm, cgst: Number(e.target.value) })}
                    required
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-mono font-bold text-xs text-[#1a1c1c]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                    IGST (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={hsnForm.igst}
                    onChange={(e) => setHsnForm({ ...hsnForm, igst: Number(e.target.value) })}
                    required
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-mono font-bold text-xs text-[#1a1c1c]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                  Tax Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ayurvedic Healthcare Preparations"
                  value={hsnForm.description}
                  onChange={(e) => setHsnForm({ ...hsnForm, description: e.target.value })}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full py-2.5 rounded-xl border border-[#e2e2e2] text-[#5f5e5e] font-bold text-xs hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save HSN Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
