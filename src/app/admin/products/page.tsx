"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Loader2,
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Sparkles,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Product } from "@/types";

interface ProductItem {
  id: string;
  category: string;
  name: string;
  hsnCode?: string;
  hsnGst?: number;
  stock: number;
  pv: number;
  amount: number;
  discountPrice: number;
  imageUrl?: string;
  netQuantity?: string;
  createdAt?: string;
}

export default function AdminItemManagerPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const loadItems = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        const normalized = data.products.map((p: any) => ({
          ...p,
          amount: Number(p.amount || p.mrp || 0),
          discountPrice: Number(p.discountPrice || p.amount || p.mrp || 0),
          stock: Number(p.stock !== undefined ? p.stock : (p.stockQuantity !== undefined ? p.stockQuantity : 100)),
          hsnGst: Number(p.hsnGst || 5.0),
        }));
        setItems(normalized);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const categories = useMemo(() => {
    const list = Array.from(new Set(items.map((it) => it.category).filter(Boolean)));
    return ["ALL", ...list];
  }, [items]);

  const displayedItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === "ALL" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.hsnCode && item.hsnCode.includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const handleDeleteItem = async (item: ProductItem) => {
    if (!confirm(`Are you sure you want to delete product "${item.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Product deleted successfully");
        await loadItems();
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch {
      alert("Error deleting product");
    }
  };

  return (
    <AdminLayout onRefresh={loadItems} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Catalog Registry
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Product Manager • 3. Item Manager
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Live Product Catalog & Inventory
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Manage product items, stock inventory, HSN tax mappings, and pricing.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="px-5 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#006d36]/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Catalog Table Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-[#e2e2e2]">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-[#006d36] text-white shadow-xs"
                      : "bg-[#f9f9f9] text-[#5f5e5e] hover:text-[#1a1c1c] border border-[#e2e2e2]"
                  }`}
                >
                  {cat === "ALL" ? "All Categories" : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, HSN, category..."
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
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Product Name & Net Qty</th>
                  <th className="py-3.5 px-4">HSN & GST</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">PV</th>
                  <th className="py-3.5 px-4">MRP (₹)</th>
                  <th className="py-3.5 px-4">Discount Price (₹)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading product items...</span>
                    </td>
                  </tr>
                ) : displayedItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#5f5e5e]">
                      No products found. Click &quot;Add New Product&quot; to add items.
                    </td>
                  </tr>
                ) : (
                  displayedItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#5f5e5e]">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-emerald-50 text-[#006d36] px-2 py-0.5 rounded font-bold text-[11px] border border-emerald-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-contain border border-[#e2e2e2] bg-[#f9f9f9] p-0.5"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center font-bold text-[#006d36]">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-sm text-[#1a1c1c] block">{item.name}</span>
                            <span className="text-[10px] text-[#5f5e5e] font-medium">{item.netQuantity || "1 Pack"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="space-y-0.5">
                          <span className="font-bold text-[#1a1c1c] block">
                            HSN: {item.hsnCode || "3004"}
                          </span>
                          <span className="text-[10px] text-[#006d36] font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-block">
                            GST: {item.hsnGst || 5.0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            Number(item.stock || 100) > 10
                              ? "bg-emerald-100 text-[#006d36]"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {Number(item.stock || 100)} Units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-[#006d36]">
                        +{item.pv} PV
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#5f5e5e] line-through">
                        ₹{Number(item.amount || (item as any).mrp || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-[#1a1c1c]">
                        ₹{Number(item.discountPrice || item.amount || (item as any).mrp || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/new?id=${item.id}`}
                            className="p-1.5 rounded-lg border border-[#e2e2e2] text-[#006d36] hover:bg-emerald-50"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Delete Product"
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
    </AdminLayout>
  );
}
