"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  FolderPlus,
  Edit2,
  Trash2,
  Plus,
  X,
  Search,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Category {
  id: string;
  name: string;
  description?: string;
  itemCount?: number;
  createdAt?: string;
}

export default function AdminCategoryMasterPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Add / Edit Category Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const displayedCategories = categories.filter((cat) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      cat.name.toLowerCase().includes(q) ||
      (cat.description && cat.description.toLowerCase().includes(q))
    );
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description || "" });
    setModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCategory?.id,
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        await loadCategories();
      } else {
        alert(data.message || "Failed to save category");
      }
    } catch {
      alert("Error saving category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadCategories();
      } else {
        alert(data.message || "Failed to delete category");
      }
    } catch {
      alert("Error deleting category");
    }
  };

  return (
    <AdminLayout onRefresh={loadCategories} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="neo-card rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full neo-inset text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider border border-emerald-200/50">
                Product Taxonomy
              </span>
              <span className="text-xs text-[#64748b] font-medium">
                Product Manager • 1. Category Master
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
              Product Categories Master
            </h1>
            <p className="text-xs text-[#64748b] mt-1 font-medium">
              Manage all botanical classification tags, department groups, and active product counts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="neo-btn-primary px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-[4px_4px_12px_rgba(0,109,54,0.3),-2px_-2px_8px_#ffffff] cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e2e2]">
            <span className="text-xs text-[#5f5e5e] font-bold">
              Total Categories: <strong className="text-[#1a1c1c] font-mono">{categories.length}</strong>
            </span>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
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
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Product Count</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading categories...</span>
                    </td>
                  </tr>
                ) : displayedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#5f5e5e]">
                      No categories found. Click &quot;Add New Category&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  displayedCategories.map((cat, idx) => (
                    <tr key={cat.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#5f5e5e]">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-sm text-[#1a1c1c]">
                        <span className="bg-emerald-50 text-[#006d36] px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                          {cat.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#5f5e5e]">{cat.description || "—"}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-[#006d36] border border-emerald-200">
                          {cat.itemCount || 0} Products
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 rounded-lg border border-[#e2e2e2] text-[#006d36] hover:bg-emerald-50 cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <h3 className="font-black text-base text-[#1a1c1c]">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Health Supplements or Personal Care"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional brief description..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
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
                  {submitting ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
