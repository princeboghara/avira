"use client";

import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Store,
  Plus,
  Search,
  Edit2,
  Lock,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  Loader2,
  X,
  Truck,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Shoppy } from "@/types";

export default function AdminShoppyMasterPage() {
  const [shoppies, setShoppies] = useState<Shoppy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("Gujarat");
  const [newPincode, setNewPincode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal
  const [editShoppy, setEditShoppy] = useState<Shoppy | null>(null);
  const [editStoreName, setEditStoreName] = useState("");
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED">("ACTIVE");

  const loadShoppies = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/shoppies");
      const data = await res.json();
      if (data.success && data.shoppies) {
        setShoppies(data.shoppies);
      }
    } catch (err) {
      console.error("Error loading shoppies:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadShoppies();
  }, []);

  const filteredShoppies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return shoppies;
    return shoppies.filter((s) => {
      const matchId = (s.shoppyId || "").toLowerCase().includes(q);
      const matchStore = (s.storeName || "").toLowerCase().includes(q);
      const matchOwner = (s.ownerName || "").toLowerCase().includes(q);
      const matchMobile = (s.mobile || "").includes(q);
      const matchCity = (s.city || "").toLowerCase().includes(q);
      return matchId || matchStore || matchOwner || matchMobile || matchCity;
    });
  }, [shoppies, searchQuery]);

  const handleCreateShoppy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newOwnerName.trim() || !newMobile.trim() || !newPassword) {
      alert("Please enter Store Name, Owner Name, Mobile and Password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/shoppies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: newStoreName.trim(),
          ownerName: newOwnerName.trim(),
          mobile: newMobile.trim(),
          email: newEmail.trim(),
          password: newPassword,
          address: newAddress.trim(),
          city: newCity.trim(),
          state: newState.trim(),
          pincode: newPincode.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Shoppy registered successfully! ID: ${data.shoppy.shoppyId}`);
        setCreateModalOpen(false);
        // Reset form
        setNewStoreName("");
        setNewOwnerName("");
        setNewMobile("");
        setNewEmail("");
        setNewPassword("");
        setNewAddress("");
        setNewCity("");
        setNewPincode("");
        await loadShoppies();
      } else {
        alert(data.message || "Failed to create shoppy.");
      }
    } catch {
      alert("Error saving shoppy.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (s: Shoppy) => {
    setEditShoppy(s);
    setEditStoreName(s.storeName);
    setEditOwnerName(s.ownerName);
    setEditMobile(s.mobile);
    setEditEmail(s.email || "");
    setEditPassword("");
    setEditAddress(s.address || "");
    setEditCity(s.city || "");
    setEditState(s.state || "Gujarat");
    setEditPincode(s.pincode || "");
    setEditStatus(s.status || "ACTIVE");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editShoppy) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/shoppies/${editShoppy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: editStoreName.trim(),
          ownerName: editOwnerName.trim(),
          mobile: editMobile.trim(),
          email: editEmail.trim(),
          password: editPassword.trim() || undefined,
          address: editAddress.trim(),
          city: editCity.trim(),
          state: editState.trim(),
          pincode: editPincode.trim(),
          status: editStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Shoppy details updated successfully!");
        setEditShoppy(null);
        await loadShoppies();
      } else {
        alert(data.message || "Failed to update shoppy.");
      }
    } catch {
      alert("Error updating shoppy.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (s: Shoppy) => {
    const nextStatus = s.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (!confirm(`Are you sure you want to change status of ${s.shoppyId} to ${nextStatus}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/shoppies/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await loadShoppies();
      } else {
        alert(data.message || "Failed to toggle status.");
      }
    } catch {
      alert("Error updating status.");
    }
  };

  return (
    <AdminLayout onRefresh={loadShoppies} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Shoppy Manager
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Franchise & Delivery Centers
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Shoppy Center Master
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Register and manage franchise delivery centers. Assign approved orders to local shoppies for fast regional fulfillment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005228] text-white text-xs font-bold shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Shoppy</span>
            </button>
          </div>
        </div>

        {/* Shoppy Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e2e2]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5f5e5e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, Store Name, Mobile, City..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#f9f9f9] border border-[#e2e2e2] focus:outline-none focus:border-[#006d36] font-mono text-[#1a1c1c]"
              />
            </div>
            <span className="text-xs font-mono text-[#5f5e5e]">
              Total Shoppies: <strong className="text-[#1a1c1c]">{filteredShoppies.length}</strong>
            </span>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#006d36]" />
              <p className="text-xs font-mono">Loading shoppy centers...</p>
            </div>
          ) : filteredShoppies.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Store className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-[#1a1c1c]">No shoppies registered yet</p>
              <p className="text-xs text-[#5f5e5e]">
                Click "Register New Shoppy" above to add your first delivery franchise center.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e2e2] bg-[#f9f9f9] text-[#5f5e5e] font-mono text-[11px] uppercase">
                    <th className="py-3 px-4">Shoppy ID</th>
                    <th className="py-3 px-4">Store / Franchise Name</th>
                    <th className="py-3 px-4">In-Charge / Owner</th>
                    <th className="py-3 px-4">Contact Mobile</th>
                    <th className="py-3 px-4">City / State</th>
                    <th className="py-3 px-4 text-center">Orders Handled</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e2e2]">
                  {filteredShoppies.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-[#006d36] whitespace-nowrap">
                        {s.shoppyId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {s.storeName}
                        {s.address && (
                          <span className="text-[10px] text-slate-400 font-normal block truncate max-w-xs">
                            {s.address}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {s.ownerName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap text-slate-600">
                        {s.mobile}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-800 block">{s.city || "—"}</span>
                        {s.pincode && (
                          <span className="text-[10px] font-mono text-slate-400 block">
                            PIN: {s.pincode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono font-bold text-slate-900">
                        {s.totalOrdersCount || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(s)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase cursor-pointer transition-all ${
                            s.status === "ACTIVE"
                              ? "bg-emerald-100 text-[#006d36] hover:bg-emerald-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                          title="Click to toggle status"
                        >
                          {s.status === "ACTIVE" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{s.status}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openEditModal(s)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit / Reset Pass</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Register New Shoppy */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006d36] border border-emerald-200 flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Register New Shoppy Center</h3>
                    <p className="text-xs text-slate-500 font-mono">Create authorized franchise credentials</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateShoppy} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Store / Franchise Name *</label>
                    <input
                      type="text"
                      value={newStoreName}
                      onChange={(e) => setNewStoreName(e.target.value)}
                      placeholder="e.g. Avira Wellness Surat"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-[#006d36]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Owner / In-Charge Name *</label>
                    <input
                      type="text"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-[#006d36]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Mobile Number (Login ID) *</label>
                    <input
                      type="text"
                      value={newMobile}
                      onChange={(e) => setNewMobile(e.target.value)}
                      placeholder="10-digit mobile"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-[#006d36]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Password *</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Initial password (min 6 chars)"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-[#006d36]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Store Address</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Shop No, Complex, Street area..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-[#006d36]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">City</label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Surat"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-[#006d36]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">State</label>
                    <input
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="Gujarat"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-[#006d36]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Pincode</label>
                    <input
                      type="text"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      placeholder="395001"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-[#006d36]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-[#006d36] hover:bg-[#005228] text-white font-bold cursor-pointer shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Shoppy & Reset Password */}
        {editShoppy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold">
                    <Edit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Edit Shoppy: {editShoppy.shoppyId}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">Update store details or change password</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditShoppy(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Store Name</label>
                    <input
                      type="text"
                      value={editStoreName}
                      onChange={(e) => setEditStoreName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-[#006d36]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Owner / In-Charge Name</label>
                    <input
                      type="text"
                      value={editOwnerName}
                      onChange={(e) => setEditOwnerName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-[#006d36]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Mobile</label>
                    <input
                      type="text"
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-[#006d36]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Reset Password (Leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="New password (optional)"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-[#006d36]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">City</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-[#006d36]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as "ACTIVE" | "INACTIVE" | "SUSPENDED")}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#006d36]"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditShoppy(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-[#006d36] hover:bg-[#005228] text-white font-bold cursor-pointer shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
