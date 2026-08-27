"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Loader2,
  Package,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import DataTable, { Column } from "@/components/ui/DataTable";

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
    if (selectedCategory === "ALL") return items;
    return items.filter((it) => it.category === selectedCategory);
  }, [items, selectedCategory]);

  const handleDeleteItem = async (item: ProductItem) => {
    if (!confirm(`Are you sure you want to delete product "${item.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadItems();
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch {
      alert("Network error deleting product");
    }
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    if (!confirm(`Delete ${selectedIds.length} selected products?`)) return;
    for (const id of selectedIds) {
      try {
        await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      } catch {
        // ignore
      }
    }
    await loadItems();
  };

  const columns: Column<ProductItem>[] = [
    {
      header: "Product / Formulation",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            {row.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.imageUrl} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-bold text-[#1a1c1c] text-xs">{row.name}</div>
            <div className="text-[10px] text-[#5f5e5e] font-mono">
              HSN: {row.hsnCode || "3004"} • {row.category}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Price (MRP)",
      accessorKey: "amount",
      sortable: true,
      align: "right",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#1a1c1c]">
          ₹{row.amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Associate Price",
      accessorKey: "discountPrice",
      sortable: true,
      align: "right",
      cell: (row) => (
        <span className="font-mono font-black text-xs text-[#006d36]">
          ₹{row.discountPrice.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Point Volume",
      accessorKey: "pv",
      sortable: true,
      align: "center",
      cell: (row) => (
        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
          {row.pv} PV
        </span>
      ),
    },
    {
      header: "Stock",
      accessorKey: "stock",
      sortable: true,
      align: "center",
      cell: (row) => (
        <span
          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
            row.stock > 10 ? "bg-gray-100 text-[#1a1c1c]" : "bg-red-100 text-red-700"
          }`}
        >
          {row.stock} units
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      sortable: false,
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/products/${row.id}`}
            className="p-1.5 rounded-lg border border-gray-200 text-[#006d36] hover:bg-emerald-50 cursor-pointer"
            title="Edit Product"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => handleDeleteItem(row)}
            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout onRefresh={loadItems} refreshing={refreshing}>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#006d36] via-[#005a2c] to-[#4f378a] text-white shadow-xl shadow-[#006d36]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-bold font-mono">
              <Package className="w-4 h-4" />
              <span>Catalog & Botanical Inventory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Product Master Manager
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Configure botanical formulas, MRP, associate discounted prices, PV points allocation, and HSN GST rates.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="px-5 py-3 rounded-2xl bg-white text-[#006d36] font-bold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#006d36] text-white shadow-xs"
                  : "bg-white border border-gray-200 text-[#5f5e5e] hover:bg-emerald-50"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Universal DataTable */}
        {loading ? (
          <div className="py-16 text-center text-[#006d36] flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">Loading Products Catalog...</span>
          </div>
        ) : (
          <DataTable
            data={displayedItems}
            columns={columns}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search products by Name, Category, HSN Code..."
            searchableKeys={["name", "category", "hsnCode"]}
            initialPageSize={10}
            onBulkDelete={handleBulkDelete}
            title="Products Master Catalog"
            emptyMessage="No products found in this category."
          />
        )}
      </div>
    </AdminLayout>
  );
}
