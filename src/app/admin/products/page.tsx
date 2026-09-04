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
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/admin/login";
        return;
      }
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
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        await loadItems();
      } else {
        alert(data.message || "Failed to delete products");
      }
    } catch {
      alert("Network error deleting products");
    }
  };

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
    inStock?: boolean;
    createdAt?: string;
  }

  const columns: Column<ProductItem>[] = [
    {
      header: "Sr No",
      accessorKey: "id",
      sortable: false,
      align: "center",
      cell: (_row, index) => (
        <span className="font-mono text-xs font-bold text-slate-500">
          {index ?? 1}
        </span>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      sortable: true,
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-[#006d36] border border-emerald-200">
          {row.category || "General"}
        </span>
      ),
    },
    {
      header: "Product Name",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white neo-inset border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 p-1">
            {row.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.imageUrl} alt={row.name} className="w-full h-full object-contain" />
            ) : (
              <Package className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-bold text-[#0f172a] text-xs leading-snug">{row.name}</div>
            <div className="text-[10px] text-[#64748b] font-mono">
              {row.netQuantity || "1 Unit"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Price",
      accessorKey: "amount",
      sortable: true,
      align: "right",
      cell: (row) => (
        <div className="text-right">
          <div className="font-mono font-black text-xs text-[#006d36]">
            ₹{(row.discountPrice && row.discountPrice < row.amount ? row.discountPrice : row.amount).toLocaleString("en-IN")}
          </div>
          {row.discountPrice && row.discountPrice < row.amount && (
            <div className="font-mono text-[10px] text-slate-400 line-through">
              MRP: ₹{row.amount.toLocaleString("en-IN")}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "PV",
      accessorKey: "pv",
      sortable: true,
      align: "center",
      cell: (row) => (
        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
          {row.pv} PV
        </span>
      ),
    },
    {
      header: "HSN & GST",
      accessorKey: "hsnCode",
      sortable: true,
      cell: (row) => (
        <div className="font-mono text-xs">
          <span className="font-bold text-[#0f172a] block">HSN: {row.hsnCode || "3004"}</span>
          <span className="text-[10px] text-[#64748b]">GST: {row.hsnGst || 5}%</span>
        </div>
      ),
    },
    {
      header: "Current Status",
      accessorKey: "inStock",
      sortable: true,
      align: "center",
      cell: (row) => {
        const isLive = row.inStock !== false;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
              isLive
                ? "bg-emerald-100 text-[#006d36] border border-emerald-300"
                : "bg-slate-200 text-slate-700 border border-slate-300"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-[#006d36] animate-pulse" : "bg-slate-500"}`} />
            <span>{isLive ? "Live" : "Retired Product"}</span>
          </span>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      sortable: false,
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/products/${row.id}`}
            className="p-2 rounded-xl bg-white border border-slate-200 text-[#006d36] hover:bg-emerald-50 shadow-xs cursor-pointer transition-all"
            title="Edit Product"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => handleDeleteItem(row)}
            className="p-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 shadow-xs cursor-pointer transition-all"
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
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Neumorphic Top Card */}
        <div className="neo-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neo-inset text-[#006d36] text-xs font-bold font-mono border border-emerald-200/50">
              <Package className="w-4 h-4" />
              <span>Catalog & Botanical Inventory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
              Product Master Manager
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] max-w-xl font-medium">
              Configure botanical formulas, MRP, associate discounted prices, PV points allocation, HSN GST rates, and live/retired store visibility.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="neo-btn-primary px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-[4px_4px_14px_rgba(0,109,54,0.3),-2px_-2px_8px_#ffffff] cursor-pointer"
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
            showIndex={false}
            onBulkDelete={handleBulkDelete}
            title="Products Master Catalog"
            emptyMessage="No products found in this category."
          />
        )}
      </div>
    </AdminLayout>
  );
}
