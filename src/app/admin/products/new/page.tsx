"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Package,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [hsnCodes, setHsnCodes] = useState<Array<{ id: string; hsnCode: string; sgst: number; cgst: number; description?: string }>>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [netQuantity, setNetQuantity] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [hsnGst, setHsnGst] = useState(5.0);
  const [stock, setStock] = useState<number>(100);
  const [pv, setPv] = useState<number>(12);
  const [amount, setAmount] = useState<number>(1200);
  const [discountPrice, setDiscountPrice] = useState<number>(1000);
  const [imageUrl, setImageUrl] = useState("");

  // HSN Search inside dropdown
  const [hsnSearch, setHsnSearch] = useState("");

  useEffect(() => {
    async function loadMetadata() {
      try {
        const [catRes, hsnRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/hsn"),
        ]);
        const catData = await catRes.json();
        const hsnData = await hsnRes.json();

        if (catData.success && catData.categories) {
          setCategories(catData.categories);
          if (catData.categories.length > 0 && !category) {
            setCategory(catData.categories[0].name);
          }
        }

        if (hsnData.success && hsnData.hsnCodes) {
          setHsnCodes(hsnData.hsnCodes);
          if (hsnData.hsnCodes.length > 0 && !hsnCode) {
            setHsnCode(hsnData.hsnCodes[0].hsnCode);
            setHsnGst(Number(hsnData.hsnCodes[0].sgst) + Number(hsnData.hsnCodes[0].cgst));
          }
        }

        // If editing existing product
        if (editId) {
          const prodRes = await fetch("/api/admin/products");
          const prodData = await prodRes.json();
          if (prodData.success && prodData.products) {
            const found = prodData.products.find((p: any) => p.id === editId);
            if (found) {
              setName(found.name);
              setCategory(found.category);
              setNetQuantity(found.netQuantity || "");
              setHsnCode(found.hsnCode || "");
              setHsnGst(found.hsnGst || 5.0);
              setStock(found.stock || 100);
              setPv(found.pv || 0);
              setAmount(found.amount || found.mrp || 0);
              setDiscountPrice(found.discountPrice || found.amount || 0);
              setImageUrl(found.imageUrl || "");
            }
          }
        }
      } catch (err) {
        console.error("Error loading product metadata:", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadMetadata();
  }, [editId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      setImageUrl(base64Data); // Immediate preview

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64Data, folder: "products" }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setImageUrl(data.url);
        }
      } catch (err) {
        console.error("Product Cloudinary upload failed:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHsnSelect = (code: string) => {
    setHsnCode(code);
    const found = hsnCodes.find((h) => h.hsnCode === code);
    if (found) {
      setHsnGst(Number(found.sgst) + Number(found.cgst));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter product name");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId || undefined,
          name: name.trim(),
          category,
          netQuantity: netQuantity.trim() || "1 Pack",
          hsnCode,
          hsnGst,
          stock: Number(stock),
          pv: Number(pv),
          amount: Number(amount),
          discountPrice: Number(discountPrice),
          imageUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(editId ? "Product updated successfully!" : "New product created successfully!");
        router.push("/admin/products");
      } else {
        alert(data.message || "Failed to save product");
      }
    } catch {
      alert("Error saving product to catalog");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#006d36]">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span className="text-xs font-bold">Loading product form...</span>
      </div>
    );
  }

  const filteredHsn = hsnCodes.filter((h) => {
    const q = hsnSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      h.hsnCode.toLowerCase().includes(q) ||
      (h.description && h.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between pb-2">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Item Manager Catalog</span>
        </Link>
        <span className="text-xs text-[#5f5e5e] font-mono">
          {editId ? `Editing ID: #${editId}` : "New Product Entry"}
        </span>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#e2e2e2]">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#006d36] flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#1a1c1c]">
              {editId ? "Update Catalog Product" : "Add New Item to Live Catalog"}
            </h2>
            <p className="text-xs text-[#5f5e5e]">
              Configure category, tax rates, inventory quantity, PV credit, and selling price.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Row 1: Category & HSN Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                Product Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* HSN Code with live search */}
            <div>
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>HSN Code & GST Rate *</span>
                <span className="text-[10px] text-[#006d36] font-mono font-bold">
                  Current GST: {hsnGst}%
                </span>
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search HSN code..."
                    value={hsnSearch}
                    onChange={(e) => setHsnSearch(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-1.5 pl-8 pr-3 text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                  />
                </div>
                <select
                  value={hsnCode}
                  onChange={(e) => handleHsnSelect(e.target.value)}
                  required
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-mono font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                >
                  {filteredHsn.map((h) => (
                    <option key={h.id} value={h.hsnCode}>
                      HSN: {h.hsnCode} — GST: {Number(h.sgst) + Number(h.cgst)}% ({h.description || "General"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Product Name & Net Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Avira Spirulina Capsules (Natural Immune Booster)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                Net Quantity / Packaging *
              </label>
              <input
                type="text"
                placeholder="e.g. 60 Veg Capsules or 500ml"
                value={netQuantity}
                onChange={(e) => setNetQuantity(e.target.value)}
                required
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-medium text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
              />
            </div>
          </div>

          {/* Row 3: Image Upload with Preview Thumbnail */}
          <div className="p-4 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] space-y-3">
            <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider text-xs">
              Product Image & Live Preview
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-[#e2e2e2] text-[#006d36] font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-2xs">
                <Upload className="w-4 h-4" />
                <span>Upload Product Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-[#5f5e5e]">
                Recommended: 3:4 Aspect Ratio (Portrait) JPG, PNG, WebP (Max 5MB)
              </span>
            </div>

            {/* Thumbnail Preview */}
            {imageUrl && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-300 w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Product Preview"
                  className="w-16 h-20 rounded-lg object-contain border border-[#e2e2e2] bg-[#f9f9f9] p-1"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#006d36] block">✓ Image Attached Ready</span>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer mt-0.5"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Quantity (Stock), PV, MRP, Discount Price */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                required
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-mono font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                Point Value (PV) *
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={pv}
                onChange={(e) => setPv(Number(e.target.value))}
                required
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-mono font-black text-xs text-[#006d36] outline-none focus:border-[#006d36]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                MRP (₹) *
              </label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-mono font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                Discount Price (₹) *
              </label>
              <input
                type="number"
                min="1"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(Number(e.target.value))}
                required
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-mono font-black text-xs text-[#006d36] outline-none focus:border-[#006d36]"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-[#e2e2e2] flex items-center justify-end gap-3">
            <Link
              href="/admin/products"
              className="px-6 py-3 rounded-xl border border-[#e2e2e2] text-[#5f5e5e] hover:bg-gray-50 font-bold text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#006d36]/20 cursor-pointer disabled:opacity-60 transition-all"
            >
              {submitting ? "Saving to Catalog..." : editId ? "Update Product" : "Save Product Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminNewProductPage() {
  return (
    <AdminLayout>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20 text-[#006d36]">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-xs font-bold">Loading product form...</span>
          </div>
        }
      >
        <AddProductForm />
      </Suspense>
    </AdminLayout>
  );
}
